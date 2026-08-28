import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import { bloom } from 'three/examples/jsm/tsl/display/BloomNode.js';
import { pass, vec4 } from 'three/tsl';
import { RenderPipeline, type WebGPURenderer } from 'three/webgpu';
import { BLOOM } from './config';

export interface ScanPipelineProps {
  /** Chamado UMA vez, no primeiro quadro que realmente foi para a tela. */
  readonly onReady: () => void;
  /** Chamado se o render falhar (perda de contexto/dispositivo). Ver o try/catch. */
  readonly onFailure: () => void;
}

/**
 * Pós-processamento — a segunda metade do efeito.
 *
 * O material (`DepthField`) já acende os pontos por PROFUNDIDADE, lendo
 * `state.scan` diretamente; este componente só aplica o bloom por cima do que a
 * cena renderizou. Havia também uma faixa turquesa em ESPAÇO DE TELA aqui, somada
 * ao resultado final — removida a pedido do Davi. O gancho com `state.scan` que a
 * sincronizava com o material foi embora junto; não reintroduzir sem o mesmo
 * relógio compartilhado (`ScanClock`), ou as duas leituras saem de fase.
 *
 * ─── ESTE COMPONENTE ASSUME O LOOP DE RENDER ────────────────────────────────────
 * `useFrame(…, 1)` com prioridade > 0 desliga o render automático do r3f: a partir
 * daí quem desenha é o `RenderPipeline`, e nada mais. O `ScanClock` roda em
 * prioridade 0, ou seja, o relógio é escrito ANTES deste quadro ser desenhado —
 * ordem que o r3f garante por ordenação crescente de prioridade.
 */
export function ScanPipeline({ onReady, onFailure }: ScanPipelineProps) {
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

    const next = new RenderPipeline(renderer);
    // Alfa preservado da cena (opaca, ver `HeroScene`): o bloom soma LUZ, não
    // transparência, e reescrever o alfa aqui abriria buraco no canvas.
    next.outputNode = vec4(color.rgb.add(glow.rgb), color.a);
    return next;
  }, [renderer, scene, camera]);

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
