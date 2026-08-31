/**
 * Motion do QUARTO ATO da cena Horizon — o CTA que fecha a página.
 *
 * ─── O GESTO, E POR QUE ELE É CURTO ─────────────────────────────────────────────
 * A linha do horizonte se desenha do centro para os dois lados, a pergunta aparece
 * por trás dela, a frase e o botão sobem. Quatro tempos, ~0,9s do começo ao botão
 * clicável.
 *
 * Ser CURTO é a decisão, não um detalhe de afinação. Este é o último ato de uma cena
 * de quatro telas: quem chega aqui já viu 5000 estrelas × 3, quatro cordilheiras e
 * uma vitrine em zoom. Somar uma quinta camada de espetáculo em cima do único botão
 * que importa é literalmente o que o §3 chama de "espetáculo enterrando o CTA". O
 * movimento aqui existe para dizer "chegamos", e sai da frente.
 *
 * ─── POR QUE NÃO TEM SplitText ──────────────────────────────────────────────────
 * A headline do herói é dividida palavra a palavra porque o efeito dela É a divisão.
 * Aqui a revelação é de bloco (`maskReveal`, o mesmo preset do Processo), e isso
 * evita a classe de bug que o `autoSplit` traz junto: o SplitText re-divide quando a
 * fonte chega e destrói os nós que o tween estava animando. No herói isso é tratado
 * porque o tween roda no `load`, junto da divisão; aqui o tween roda no SCROLL, muito
 * depois — um re-split no meio do caminho deixaria o título parado. Bloco é mais
 * simples e, num título de duas linhas centralizado, lê igual.
 *
 * ─── ORÇAMENTO ──────────────────────────────────────────────────────────────────
 * `scaleX`, `clip-path` e `opacity`/`y`. Nenhuma propriedade de layout (§6.4).
 * Nenhum ScrollTrigger nasce fora do `mm.add()`, então `mm.revert()` é toda a
 * limpeza necessária (§12).
 */
import gsap from 'gsap';
import { entranceTrigger, revealCalm } from './entrance';
import { MEDIA, STAGGER, TRAVEL, gsapEase } from './motion';
import { drawLine, fadeUp, fromVars, maskReveal } from './presets';
import type { MotionSetup } from './useMotion';

/** Contrato entre o markup e a timeline. `data-*`, nunca classe — ver `hero.ts`. */
export const FINALE_HOOK = {
  /**
   * A linha do horizonte. ⚠ Cresce a partir do CENTRO, e a origem está no CSS
   * (`horizon-finale.css`), não aqui — a regra do `drawLine` é essa: o GSAP não
   * escreve `transform-origin` em elemento HTML quando ninguém pede, e num
   * `gsap.from()` passá-la nas vars a transformaria num valor a ser ANIMADO.
   */
  rule: 'data-finale-rule',
  /** A pergunta. Revelada por máscara. */
  headline: 'data-finale-headline',
  /** Frase e botão: sobem, na ordem do DOM. */
  fade: 'data-finale-fade',
} as const;

const SELECTOR = {
  rule: `[${FINALE_HOOK.rule}]`,
  headline: `[${FINALE_HOOK.headline}]`,
  fade: `[${FINALE_HOOK.fade}]`,
} as const;

/**
 * Posição de cada tempo na timeline, em segundos. Mesmas defasagens curtas de
 * `services.ts` e `process.ts` — a página inteira entra na mesma cadência.
 *
 * O botão é o ÚLTIMO da fila `fade`, e com `STAGGER.tight` ele chega ~40ms depois da
 * frase. O total até o CTA existir (0,26s + 0,04s + 0,5s de duração) fica em ~0,8s
 * contados do `start: 'top 78%'` — ou seja, com o ato ainda entrando pela borda de
 * baixo da tela. Quando a pessoa chega a ler, o botão já está lá.
 */
const AT = {
  rule: 0,
  headline: 0.1,
  fade: 0.26,
} as const;

export const horizonFinaleMotion: MotionSetup = (matchMedia, root) => {
  matchMedia.add({ ok: MEDIA.motion, calm: MEDIA.reduce }, (context) => {
    const { ok } = context.conditions as { ok: boolean; calm: boolean };

    const rule = root.querySelector<HTMLElement>(SELECTOR.rule);
    const headline = root.querySelector<HTMLElement>(SELECTOR.headline);
    const fades = gsap.utils.toArray<HTMLElement>(SELECTOR.fade, root);

    // Variante calma: revela, não desloca — e sem ScrollTrigger, para que o CTA final
    // não dependa de a rolagem chegar num ponto exato para existir (§3 + §6.6).
    if (!ok) {
      revealCalm([rule, headline, ...fades]);
      return;
    }

    const timeline = gsap.timeline({
      defaults: { ease: gsapEase('out') },
      scrollTrigger: entranceTrigger(root),
    });

    if (rule !== null) {
      timeline.from(rule, fromVars(drawLine().full), AT.rule);
    }

    if (headline !== null) {
      timeline.from(headline, fromVars(maskReveal().full), AT.headline);
    }

    if (fades.length > 0) {
      timeline.from(
        fades,
        fromVars(fadeUp({ travel: TRAVEL.sm, stagger: STAGGER.tight }).full),
        AT.fade,
      );
    }
  });
};
