/**
 * Motion da seção de Processo — a revelação passo a passo.
 *
 * ─── O GESTO ────────────────────────────────────────────────────────────────────
 * A seção é uma linha do tempo, então ela se comporta como uma linha sendo traçada:
 * o trilho vertical desce pelo passo, o número e o nome do passo saem de dentro da
 * própria máscara e a frase fecha atrás. Nenhum efeito, nenhuma camada — é o
 * contraponto silencioso ao herói 3D e ao deck de 200vh que vêm antes.
 *
 * ─── O TRILHO É SEGMENTADO, E ISSO É O TRUQUE INTEIRO ───────────────────────────
 * A leitura desejada é uma linha ÚNICA sendo desenhada de cima a baixo conforme a
 * pessoa rola. A implementação óbvia — um `<span>` de altura total com `scrub` —
 * custaria um ScrollTrigger vivo durante a seção inteira e amarraria o desenho à
 * posição da rolagem (o que `entrance.ts` reserva para camada decorativa).
 *
 * Em vez disso, cada passo carrega o PRÓPRIO segmento, que ocupa exatamente a altura
 * daquele passo (por isso o espaço entre passos é `padding-bottom` do `<li>`, e não
 * `gap` da lista: com `gap`, o trilho teria buracos). Os segmentos se encostam e
 * lêem como uma linha só, mas cada um é desenhado pelo gatilho do próprio passo —
 * a linha AVANÇA com a leitura, sem scrub, sem trigger persistente, e a
 * localidade do §12 continua valendo: um bloco, uma timeline, um cleanup.
 *
 * ─── UM GATILHO POR BLOCO ───────────────────────────────────────────────────────
 * Mesma doutrina de `services.ts`, pelo mesmo motivo: a seção é mais alta que a
 * janela, e um gatilho único faria os últimos passos animarem longe de onde a pessoa
 * está olhando. Aqui os blocos são o cabeçalho, CADA passo e o fecho com o CTA.
 *
 * ─── O ORÇAMENTO ────────────────────────────────────────────────────────────────
 * `scaleX`, `scaleY`, `clip-path` e `opacity`/`y`. Nenhuma propriedade de layout,
 * nenhum filtro, nenhuma imagem: tudo no compositor (§6.4). E nenhum ScrollTrigger
 * fora do `mm.add()`, então `mm.revert()` é todo o cleanup necessário (§12).
 *
 * ─── E O CTA ────────────────────────────────────────────────────────────────────
 * O CTA é o último bloco e tem gatilho PRÓPRIO: ele sobe no instante em que aparece
 * na tela, sem esperar os quatro passos terminarem. É o §3 outra vez — e aqui ele
 * tem peso extra, porque o passo 01 desta seção é literalmente a ação do botão.
 */
import gsap from 'gsap';
import { entranceTrigger, revealCalm } from './entrance';
import { MEDIA, STAGGER, TRAVEL, gsapEase } from './motion';
import { drawLine, fadeUp, fromVars, maskReveal } from './presets';
import type { MotionSetup } from './useMotion';

/** Contrato entre o markup e a timeline. `data-*`, nunca classe — ver `hero.ts`. */
export const PROCESS_HOOK = {
  /** Unidade de entrada: ganha o próprio ScrollTrigger e uma timeline própria. */
  block: 'data-process-block',
  /** Título da seção e CTA: sobem discretamente, no começo do bloco. */
  fade: 'data-process-fade',
  /** Filete HORIZONTAL que fecha o cabeçalho (o `IndexRule`). */
  line: 'data-process-line',
  /** Segmento VERTICAL do trilho, um por passo. Desenha de cima para baixo. */
  rail: 'data-process-rail',
  /** Número e nome do passo, revelados por máscara. */
  cluster: 'data-process-cluster',
  /** A frase do passo. */
  body: 'data-process-body',
} as const;

const SELECTOR = {
  block: `[${PROCESS_HOOK.block}]`,
  fade: `[${PROCESS_HOOK.fade}]`,
  line: `[${PROCESS_HOOK.line}]`,
  rail: `[${PROCESS_HOOK.rail}]`,
  cluster: `[${PROCESS_HOOK.cluster}]`,
  body: `[${PROCESS_HOOK.body}]`,
} as const;

/**
 * Posição de cada grupo dentro da timeline do bloco, em segundos. Mesmas defasagens
 * curtas de `services.ts` — a página inteira entra na mesma cadência, e um passo lê
 * como um gesto só em vez de três ondas separadas. O trilho puxa, o nome sobe atrás,
 * a frase fecha.
 */
const AT = {
  fade: 0,
  line: 0,
  rail: 0,
  cluster: 0.06,
  body: 0.14,
} as const;

/** Todos os alvos de motion de um escopo, na ordem em que a timeline os usa. */
function targetsIn(scope: HTMLElement) {
  return {
    fades: gsap.utils.toArray<HTMLElement>(SELECTOR.fade, scope),
    lines: gsap.utils.toArray<HTMLElement>(SELECTOR.line, scope),
    rails: gsap.utils.toArray<HTMLElement>(SELECTOR.rail, scope),
    clusters: gsap.utils.toArray<HTMLElement>(SELECTOR.cluster, scope),
    bodies: gsap.utils.toArray<HTMLElement>(SELECTOR.body, scope),
  };
}

export const processMotion: MotionSetup = (matchMedia, root) => {
  matchMedia.add({ ok: MEDIA.motion, calm: MEDIA.reduce }, (context) => {
    const { ok } = context.conditions as { ok: boolean; calm: boolean };

    if (!ok) {
      const { fades, lines, rails, clusters, bodies } = targetsIn(root);
      revealCalm([...fades, ...lines, ...rails, ...clusters, ...bodies]);
      return;
    }

    for (const block of gsap.utils.toArray<HTMLElement>(SELECTOR.block, root)) {
      const { fades, lines, rails, clusters, bodies } = targetsIn(block);

      const timeline = gsap.timeline({
        defaults: { ease: gsapEase('out') },
        scrollTrigger: entranceTrigger(block),
      });

      if (fades.length > 0) {
        timeline.from(fades, fromVars(fadeUp({ travel: TRAVEL.sm }).full), AT.fade);
      }

      if (lines.length > 0) {
        timeline.from(lines, fromVars(drawLine().full), AT.line);
      }

      if (rails.length > 0) {
        timeline.from(rails, fromVars(drawLine({ axis: 'y' }).full), AT.rail);
      }

      if (clusters.length > 0) {
        timeline.from(clusters, fromVars(maskReveal({ stagger: STAGGER.tight }).full), AT.cluster);
      }

      if (bodies.length > 0) {
        timeline.from(bodies, fromVars(fadeUp({ travel: TRAVEL.sm }).full), AT.body);
      }
    }
  });
};
