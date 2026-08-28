import { DURATION, STAGGER, TRAVEL } from './motion';

// `gsap.TweenVars` vem do namespace ambiente global declarado por gsap/types —
// não precisa (nem aceita) import de tipo.

export interface MotionVariant {
  readonly from: gsap.TweenVars;
  readonly to: gsap.TweenVars;
}

/**
 * Todo preset carrega o par completo/calmo. O tipo obriga: não existe preset sem
 * variante para `prefers-reduced-motion` (CLAUDE.md §6.6, §10).
 */
export interface MotionPreset {
  readonly full: MotionVariant;
  readonly calm: MotionVariant;
}

/**
 * CONTRATO DA VARIANTE CALMA:
 *  - só `opacity`; zero `y`/`x`/`scale`/`rotate`;
 *  - duração curta (<= DURATION.fast) e `stagger` 0;
 *  - NUNCA "sem animação nenhuma".
 *
 * O último ponto é o que mais importa: se a variante calma simplesmente não rodasse,
 * um elemento que o preset deixa em `opacity: 0` ficaria invisível para sempre para
 * quem pediu movimento reduzido. A calma ainda revela — só não desloca.
 */
function calmFade(duration: number = DURATION.fast): MotionVariant {
  return {
    from: { opacity: 0 },
    to: { opacity: 1, duration, stagger: 0 },
  };
}

/**
 * Converte um `MotionVariant` nas vars de um `gsap.from()`.
 *
 * ─── POR QUE `from` E NÃO `fromTo` ──────────────────────────────────────────────
 * É a REGRA DE SSR do §12 virada em ferramenta. Num `fromTo`, o estado final mora no
 * JS: se a hidratação falhar depois que o `gsap.set` inicial rodou, o elemento fica
 * em `opacity: 0` para sempre. Num `from`, o estado final é o que já está no HTML
 * pré-renderizado — o GSAP só empresta um estado inicial e devolve o elemento ao
 * natural. Sem JS, sem hidratação ou com o tween interrompido no meio, o conteúdo
 * está visível e indexável.
 *
 * Por isso só as chaves de TEMPO (`duration`, `stagger`) viajam do `to`: os valores
 * de destino são justamente o que não deve ser escrito por JS nenhum.
 */
export function fromVars(variant: MotionVariant, extra: gsap.TweenVars = {}): gsap.TweenVars {
  const { duration, stagger } = variant.to;
  return { ...variant.from, duration, stagger, ...extra };
}

export interface FadeUpOptions {
  readonly travel?: number;
  readonly duration?: number;
  readonly stagger?: number;
}

/** Entrada padrão de conteúdo: sobe e revela. Só transform/opacity. */
export function fadeUp(options: FadeUpOptions = {}): MotionPreset {
  const { travel = TRAVEL.md, duration = DURATION.base, stagger = STAGGER.base } = options;

  return {
    full: {
      from: { opacity: 0, y: travel },
      to: { opacity: 1, y: 0, duration, stagger },
    },
    calm: calmFade(),
  };
}

export interface FadeInOptions {
  readonly duration?: number;
  readonly stagger?: number;
}

export function fadeIn(options: FadeInOptions = {}): MotionPreset {
  const { duration = DURATION.base, stagger = STAGGER.base } = options;

  return {
    full: {
      from: { opacity: 0 },
      to: { opacity: 1, duration, stagger },
    },
    calm: calmFade(),
  };
}

/** Eixo em que o filete cresce. `x` → da esquerda; `y` → de cima. */
export type DrawAxis = 'x' | 'y';

export interface DrawLineOptions {
  readonly duration?: number;
  readonly stagger?: number;
  readonly axis?: DrawAxis;
}

/**
 * Filete que se desenha — da esquerda para a direita (`axis: 'x'`, padrão) ou de
 * cima para baixo (`axis: 'y'`, o trilho vertical do Processo).
 *
 * `scaleX`/`scaleY` e não `width`/`height`: dimensão é layout e custaria reflow a
 * cada quadro (§6.4); escala fica no compositor. O preço é que o elemento precisa
 * ser um NÓ próprio (um `<span>`), não um `border-top` — não se anima a borda de
 * outra coisa.
 *
 * O elemento tem que carregar a ORIGEM no CSS: `origin-left` no eixo `x`,
 * `origin-top` no eixo `y`. O GSAP não escreve `transform-origin` em elemento HTML
 * quando ninguém pede, então quem esquecer vê o filete crescer a partir do centro,
 * para os dois lados. Deixar a origem no CSS (e não nas vars) é de propósito: num
 * `gsap.from()` ela viraria um valor INICIAL a ser animado até o computado, que é o
 * oposto do que se quer.
 *
 * ⚠ Pelo mesmo motivo, o nó do filete não pode depender de `transform` para se
 * posicionar (um `translateX(-50%)` para centralizar, por exemplo): a escala do GSAP
 * reescreve a matriz inteira. Use `margin` para posicionar — é o que
 * `.process-rail` faz.
 */
export function drawLine(options: DrawLineOptions = {}): MotionPreset {
  const { duration = DURATION.slow, stagger = STAGGER.base, axis = 'x' } = options;
  const key = axis === 'x' ? 'scaleX' : 'scaleY';

  return {
    full: {
      from: { [key]: 0 },
      to: { [key]: 1, duration, stagger },
    },
    calm: calmFade(),
  };
}

export interface MaskRevealOptions {
  readonly duration?: number;
  readonly stagger?: number;
}

/**
 * Revelação por máscara — o gesto mais "premiado" do conjunto, usado em títulos.
 * `clip-path` é composited pelo navegador, então continua em 60fps; a alternativa
 * comum (animar `height` ou `width`) causaria reflow a cada quadro.
 */
export function maskReveal(options: MaskRevealOptions = {}): MotionPreset {
  const { duration = DURATION.slow, stagger = STAGGER.tight } = options;

  return {
    full: {
      from: { clipPath: 'inset(0 0 100% 0)', opacity: 1 },
      to: { clipPath: 'inset(0 0 0% 0)', duration, stagger },
    },
    calm: calmFade(),
  };
}
