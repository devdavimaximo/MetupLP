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
