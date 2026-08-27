/**
 * Motion da seção de Serviços — a primeira entrada por scroll da página.
 *
 * ─── O GESTO ────────────────────────────────────────────────────────────────────
 * A seção é um índice, então ela se comporta como um índice sendo impresso: o filete
 * de cada linha se desenha da esquerda, o par número+título sobe de dentro da própria
 * máscara e a frase fecha atrás.
 *
 * ─── UM GATILHO POR BLOCO, NÃO UM PELA SEÇÃO ────────────────────────────────────
 * Cada bloco (o título da seção, cada linha do índice, o fecho com o CTA) tem o
 * próprio ScrollTrigger. Um gatilho único no `<section>` seria menos código e um
 * erro: a seção é mais alta que a janela, então as duas últimas linhas terminariam
 * de animar a ~800px de onde a pessoa está olhando — animação gasta em quem não vê,
 * e linha nenhuma "entra" na hora em que chega. Com um gatilho por bloco, a cascata
 * acompanha a rolagem em qualquer altura de tela, e o mesmo vocabulário serve para a
 * grade de cases de F4 sem reescrever nada.
 *
 * ─── O ORÇAMENTO ────────────────────────────────────────────────────────────────
 * `scaleX`, `clip-path` e `opacity`/`y`. Nenhuma propriedade de layout, nenhum
 * filtro, nenhuma imagem: tudo no compositor (§6.4). E nenhum ScrollTrigger fora do
 * `mm.add()`, então `mm.revert()` é todo o cleanup necessário (§12).
 *
 * ─── E O CTA ────────────────────────────────────────────────────────────────────
 * O CTA fecha o índice e entra em t=0 da timeline do PRÓPRIO bloco: no instante em
 * que ele aparece na tela, já está subindo — nunca esperando as quatro linhas
 * terminarem. É o §3 outra vez: o espetáculo não enterra o CTA.
 */
import gsap from 'gsap';
import { entranceTrigger, revealCalm } from './entrance';
import { MEDIA, STAGGER, TRAVEL, gsapEase } from './motion';
import { drawLine, fadeUp, fromVars, maskReveal } from './presets';
import type { MotionSetup } from './useMotion';

/** Contrato entre o markup e a timeline. `data-*`, nunca classe — ver `hero.ts`. */
export const SERVICES_HOOK = {
  /** Unidade de entrada: ganha o próprio ScrollTrigger e uma timeline própria. */
  block: 'data-services-block',
  /** Eyebrow, título da seção e CTA: sobem discretamente, no começo do bloco. */
  fade: 'data-services-fade',
  /** Filete horizontal de cada linha do índice. */
  rule: 'data-services-rule',
  /** Par número + título do serviço, revelado por máscara. */
  cluster: 'data-services-cluster',
  /** A frase do serviço. */
  body: 'data-services-body',
} as const;

const SELECTOR = {
  block: `[${SERVICES_HOOK.block}]`,
  fade: `[${SERVICES_HOOK.fade}]`,
  rule: `[${SERVICES_HOOK.rule}]`,
  cluster: `[${SERVICES_HOOK.cluster}]`,
  body: `[${SERVICES_HOOK.body}]`,
} as const;

/**
 * Posição de cada grupo dentro da timeline do bloco, em segundos. As defasagens são
 * curtas de propósito: os grupos se sobrepõem e a linha lê como um gesto só, em vez
 * de três ondas separadas. O filete puxa, o título sobe atrás, a frase fecha.
 */
const AT = {
  fade: 0,
  rule: 0,
  cluster: 0.06,
  body: 0.14,
} as const;

/** Todos os alvos de motion de um escopo, na ordem em que a timeline os usa. */
function targetsIn(scope: HTMLElement) {
  return {
    fades: gsap.utils.toArray<HTMLElement>(SELECTOR.fade, scope),
    rules: gsap.utils.toArray<HTMLElement>(SELECTOR.rule, scope),
    clusters: gsap.utils.toArray<HTMLElement>(SELECTOR.cluster, scope),
    bodies: gsap.utils.toArray<HTMLElement>(SELECTOR.body, scope),
  };
}

export const servicesMotion: MotionSetup = (matchMedia, root) => {
  matchMedia.add({ ok: MEDIA.motion, calm: MEDIA.reduce }, (context) => {
    const { ok } = context.conditions as { ok: boolean; calm: boolean };

    if (!ok) {
      const { fades, rules, clusters, bodies } = targetsIn(root);
      revealCalm([...fades, ...rules, ...clusters, ...bodies]);
      return;
    }

    for (const block of gsap.utils.toArray<HTMLElement>(SELECTOR.block, root)) {
      const { fades, rules, clusters, bodies } = targetsIn(block);

      const timeline = gsap.timeline({
        defaults: { ease: gsapEase('out') },
        scrollTrigger: entranceTrigger(block),
      });

      if (fades.length > 0) {
        timeline.from(fades, fromVars(fadeUp({ travel: TRAVEL.sm }).full), AT.fade);
      }

      if (rules.length > 0) {
        timeline.from(rules, fromVars(drawLine().full), AT.rule);
      }

      if (clusters.length > 0) {
        timeline.from(clusters, fromVars(maskReveal({ stagger: STAGGER.base }).full), AT.cluster);
      }

      if (bodies.length > 0) {
        timeline.from(bodies, fromVars(fadeUp({ travel: TRAVEL.sm }).full), AT.body);
      }
    }
  });
};
