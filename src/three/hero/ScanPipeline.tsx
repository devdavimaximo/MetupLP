import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import { bloom } from 'three/examples/jsm/tsl/display/BloomNode.js';
import { abs, oneMinus, pass, smoothstep, uv, vec4 } from 'three/tsl';
import { RenderPipeline, type WebGPURenderer } from 'three/webgpu';
import { BLOOM, SCENE_COLOR, SWEEP } from './config';
import type { SceneState } from './scene-state';
import { linearColor } from './tsl-color';

export interface ScanPipelineProps {
  readonly state: SceneState;
  /** Chamado UMA vez, no primeiro quadro que realmente foi para a tela. */
  readonly onReady: () => void;
  /** Chamado se o render falhar (perda de contexto/dispositivo). Ver o try/catch. */
  readonly onFailure: () => void;
}

/**
 * Pós-processamento — a segunda metade do efeito.
 *
 * ─── DUAS VARREDURAS, UM RELÓGIO ────────────────────────────────────────────────
 * O material acende os pontos por PROFUNDIDADE (dentro do objeto); aqui uma faixa
 * turquesa desce a TELA inteira. As duas leem o mesmo `state.scan`, então a linha
 * cruza a tela no exato momento em que aquela fatia do objeto acende. Essa
 * coincidência é o efeito inteiro: sem ela são dois enfeites em paralelo.
 *
 * A divisão de cor também é intencional e vem dos tokens: turquesa é o instrumento
 * que varre, âmbar é o que ele encontra.
 *
 * ─── ESTE COMPONENTE ASSUME O LOOP DE RENDER ────────────────────────────────────
 * `useFrame(…, 1)` com prioridade > 0 desliga o render automático do r3f: a partir
 * daí quem desenha é o `RenderPipeline`, e nada mais. O `ScanClock` roda em
 * prioridade 0, ou seja, o relógio é escrito ANTES deste quadro ser desenhado —
 * ordem que o r3f garante por ordenação crescente de prioridade.
 */
export function ScanPipeline({ state, onReady, onFailure }: ScanPipelineProps) {
  /**
   * O r3f tipa `RootState.gl` como `WebGLRenderer` porque é o build de `three` que
   * ELE importa. O objeto em tempo de execução é o `WebGPURenderer` devolvido pela
   * fábrica `gl` do `<Canvas>` (ver `HeroScene`). Esta linha é a única ponte entre os
   * dois builds no projeto — o cast fica preso aqui, e não espalhado pela cena.
   */
  const renderer = useThree((root) => root.gl) as unknown as WebGPURenderer;
  const scene = useThree((root) => root.scene);
  const camera = useThree((root) => root.camera);

  const pipeline = useMemo(() => {
    const scenePass = pass(scene, camera);
    const color = scenePass.getTextureNode('output');
    const glow = bloom(color, BLOOM.strength, BLOOM.radius, BLOOM.threshold);

    // Faixa em Y de tela, centrada em `scan`. `oneMinus(smoothstep(…))` dá 1 no
    // centro e 0 na borda — a mesma forma da fatia de profundidade do material.
    const band = oneMinus(smoothstep(0, SWEEP.width, abs(uv().y.sub(state.scan))));
    const sweep = linearColor(SCENE_COLOR.sweep).mul(band).mul(SWEEP.gain);

    const next = new RenderPipeline(renderer);
    // Alfa preservado da cena (opaca, ver `HeroScene`): o bloom soma LUZ, não
    // transparência, e reescrever o alfa aqui abriria buraco no canvas.
    next.outputNode = vec4(color.rgb.add(sweep).add(glow.rgb), color.a);
    return next;
  }, [renderer, scene, camera, state]);

  useEffect(() => {
    return () => {
      pipeline.dispose();
    };
  }, [pipeline]);

  const ready = useRef(false);
  const broken = useRef(false);

  useFrame(() => {
    /**
     * Um `throw` aqui não chega em ErrorBoundary nenhum: `useFrame` roda no rAF do
     * r3f, fora do ciclo de render do React. Sem este try/catch, uma perda de
     * dispositivo (troca de GPU, driver que reinicia, aba suspensa por muito tempo)
     * viraria uma exceção por QUADRO — console inundado e bateria queimando à toa.
     * Uma falha basta: a cena se aposenta e o herói volta ao fundo estático.
     */
    if (broken.current) return;

    try {
      pipeline.render();
    } catch (error) {
      broken.current = true;
      if (import.meta.env.DEV) console.error('[hero] render da cena falhou', error);
      onFailure();
      return;
    }

    if (!ready.current) {
      ready.current = true;
      onReady();
    }
  }, 1);

  return null;
}
