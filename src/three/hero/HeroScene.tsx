import { Canvas, useFrame, type GLProps } from '@react-three/fiber';
import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { WebGPURenderer } from 'three/webgpu';
import { MEDIA } from '../../animations/motion';
import { SCENE, SCENE_COLOR } from './config';
import { DepthField } from './DepthField';
import { ScanPipeline } from './ScanPipeline';
import { createSceneState, type SceneState } from './scene-state';

/**
 * Cena WebGPU da primeira dobra.
 *
 * ─── ESTE MÓDULO NUNCA É IMPORTADO DE FORMA ESTÁTICA ────────────────────────────
 * `three/webgpu` são ~670 KB minificados. Ele entra por `import()` dinâmico a partir
 * de `HeroBackdrop`, DEPOIS da hidratação e só onde vale a pena — ver `useHeroScene`
 * para os critérios. Importar isto direto em qualquer lugar coloca o three no bundle
 * de entrada e joga fora todo o cuidado com o LCP. É a razão de o export ser
 * `default`: `lazy(() => import(…))` só aceita esse formato.
 *
 * ─── POR QUE NÃO HÁ `extend(THREE)` ─────────────────────────────────────────────
 * O exemplo de referência chama `extend(THREE as any)` para trocar o catálogo do r3f
 * pelo build WebGPU. Aqui isso é desnecessário e indesejado: o JSX usa só `<mesh>` e
 * `<planeGeometry>`, classes do núcleo que o three identifica por flag (`isMesh`,
 * `isBufferGeometry`) e não por `instanceof` — então o renderer WebGPU as aceita
 * vindas do build que o r3f importa. O único objeto que PRECISA ser do build WebGPU é
 * o material, e ele é construído na mão em `depth-scan-material.ts`. Sem `extend`,
 * some junto o `as any` que o §10 proíbe.
 */

/**
 * O r3f não reexporta `DefaultGLProps` no índice do pacote, então o tipo é extraído
 * da própria união `GLProps`: das quatro formas que ela aceita, só uma é uma função
 * assíncrona, e é a nossa.
 */
type RendererFactoryProps = Parameters<Extract<GLProps, (props: never) => Promise<unknown>>>[0];

/**
 * `WebGPURenderer` cai sozinho para WebGL2 quando não há WebGPU, então esta única
 * fábrica atende Chrome/Edge (WebGPU) e Safari/Firefox (WebGL2) sem ramificação.
 * O `await init()` é o que permite usar `pipeline.render()` síncrono depois.
 *
 * O cast existe porque o r3f descreve os parâmetros em termos do `WebGLRenderer` do
 * build que ELE importa; não apaga tipo nenhum, só atravessa a fronteira entre os
 * dois builds do three.
 */
async function createRenderer(props: RendererFactoryProps): Promise<WebGPURenderer> {
  const renderer = new WebGPURenderer(
    props as unknown as ConstructorParameters<typeof WebGPURenderer>[0],
  );
  await renderer.init();
  return renderer;
}

interface ScanClockProps {
  readonly state: SceneState;
}

/**
 * O relógio da cena — o ÚNICO lugar que escreve `scan` e `pointer`.
 *
 * Prioridade 0: o r3f ordena as inscrições de `useFrame` por prioridade crescente,
 * então isto roda antes do `ScanPipeline` (prioridade 1) desenhar o quadro. Inverter
 * a ordem atrasaria a cena em um quadro — invisível, mas erra por construção.
 */
function ScanClock({ state }: ScanClockProps) {
  useFrame(({ clock }, delta) => {
    /**
     * Escrever DENTRO do uniform é o ponto: `SceneState` existe justamente para tirar
     * o quadro a quadro do modelo do React (o porquê está em `scene-state.ts`). O
     * lint enxerga "mutação de prop" e está certo sobre estado do React — só que
     * estes valores não são estado do React, são buffers que a GPU lê. Levá-los para
     * `useState` re-renderizaria a árvore 60 vezes por segundo, que é exatamente o
     * que o §6.2 proíbe.
     */
    // oxlint-disable-next-line react/immutability
    state.scan.value = Math.sin(clock.elapsedTime * SCENE.scanSpeed) * 0.5 + 0.5;

    // Amortecimento exponencial, e não `lerp` com fator fixo: com fator fixo a
    // perseguição fica mais rápida em 120Hz do que em 60Hz e o parallax muda de
    // caráter conforme o monitor. Assim o tempo de resposta é o mesmo em qualquer taxa.
    state.pointer.value.lerp(state.pointerTarget, 1 - Math.exp(-SCENE.pointerDamping * delta));
  }, 0);

  return null;
}

export default function HeroScene() {
  const state = useMemo(() => createSceneState(), []);
  const containerRef = useRef<HTMLDivElement>(null);

  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  // Começa ativa: o herói ESTÁ na dobra no carregamento, e esperar o observer
  // custaria um quadro em branco justo no momento mais visível da página.
  const [visible, setVisible] = useState(true);

  const handleReady = useCallback(() => {
    setReady(true);
  }, []);
  const handleFailure = useCallback(() => {
    setFailed(true);
  }, []);

  /**
   * Ponteiro. Fica em `window` e não no canvas porque o backdrop é
   * `pointer-events: none` — sem isso ele interceptaria cliques destinados ao CTA
   * (§3), e o `pointer` que o r3f oferece nunca se moveria.
   *
   * Atrás de `(hover: hover) and (pointer: fine)`: em toque, `pointermove` só dispara
   * DEPOIS do toque, e a cena daria um salto na primeira vez que alguém encostasse
   * na tela.
   */
  useEffect(() => {
    if (!window.matchMedia(MEDIA.hover).matches) return;

    const onPointerMove = (event: PointerEvent): void => {
      state.pointerTarget.set(
        (event.clientX / window.innerWidth) * 2 - 1,
        -((event.clientY / window.innerHeight) * 2 - 1),
      );
    };

    window.addEventListener('pointermove', onPointerMove, { passive: true });

    return () => {
      window.removeEventListener('pointermove', onPointerMove);
    };
  }, [state]);

  /**
   * Fora da dobra, `frameloop="never"` para o rAF inteiro. Uma cena que continua
   * renderizando enquanto a pessoa lê os cases é quadro roubado do resto da página —
   * exatamente o custo que o §6.2 manda vigiar.
   */
  useEffect(() => {
    const node = containerRef.current;
    if (node === null || typeof IntersectionObserver === 'undefined') return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry !== undefined) setVisible(entry.isIntersecting);
      },
      { threshold: 0 },
    );

    observer.observe(node);

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      // `data-ready` governa o fade em CSS (ver hero.css). O canvas só aparece depois
      // do primeiro quadro DESENHADO — nunca como um retângulo preto piscando.
      data-ready={ready && !failed}
      className="hero-scene absolute inset-0"
    >
      {!failed && (
        <Canvas flat dpr={[1, 1.5]} frameloop={visible ? 'always' : 'never'} gl={createRenderer}>
          {/**
           * Fundo OPACO, na cor da página.
           *
           * A alternativa (canvas transparente) obrigaria o bloom e a varredura a
           * carregarem alfa junto, e qualquer erro nessa conta abre um buraco na
           * primeira dobra. Pintando o mesmo `--color-bg` do `<body>`, o canvas
           * emenda na página sem costura e o material aditivo só ACRESCENTA luz.
           *
           * Via `attach`, e não `scene.background = …` num efeito: o r3f monta e
           * DESMONTA a cor junto do componente, sem ninguém precisar guardar o valor
           * anterior para restaurar.
           */}
          <color attach="background" args={[SCENE_COLOR.background]} />
          <Suspense fallback={null}>
            <ScanClock state={state} />
            <DepthField state={state} />
            <ScanPipeline onReady={handleReady} onFailure={handleFailure} />
          </Suspense>
        </Canvas>
      )}
    </div>
  );
}
