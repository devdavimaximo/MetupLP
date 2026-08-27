/**
 * Tokens de motion — FONTE ÚNICA DA VERDADE.
 *
 * `src/styles/tokens.css` espelha estes valores para o CSS. Não existe caminho
 * automático entre os dois: `@theme` exige literais CSS, o GSAP exige números em
 * JS, e o SSG proíbe ler `getComputedStyle` em build. Então o TS manda, o CSS
 * espelha, e `motion-sync.ts` acusa a divergência em dev antes que ela vire bug.
 *
 * Ao mexer aqui, mexa também em `tokens.css` — o painel TokenSync do styleguide
 * fica vermelho até os dois baterem.
 */
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';

export type CubicBezier = readonly [number, number, number, number];

export const EASE = {
  out: [0.16, 1, 0.3, 1],
  in: [0.55, 0, 1, 0.45],
  inOut: [0.65, 0, 0.35, 1],
  spring: [0.34, 1.56, 0.64, 1],
} as const satisfies Record<string, CubicBezier>;

export type EaseName = keyof typeof EASE;

/** Segundos — unidade do GSAP. O espelho em CSS usa ms. */
export const DURATION = {
  fast: 0.2,
  base: 0.5,
  slow: 0.9,
} as const;

export type DurationName = keyof typeof DURATION;

export const STAGGER = {
  tight: 0.04,
  base: 0.08,
  loose: 0.14,
} as const;

/** Deslocamento de entrada, em px. Só `transform` — nunca top/left (§6.4). */
export const TRAVEL = {
  sm: 12,
  md: 24,
  lg: 48,
} as const;

/** Mesmos valores dos `--breakpoint-*` do @theme. Ver H do plano de F1. */
export const BREAKPOINT_REM = {
  md: 48,
  lg: 64,
  xl: 80,
} as const;

export type BreakpointName = keyof typeof BREAKPOINT_REM;

export const MEDIA = {
  mdUp: `(min-width: ${String(BREAKPOINT_REM.md)}rem)`,
  lgUp: `(min-width: ${String(BREAKPOINT_REM.lg)}rem)`,
  xlUp: `(min-width: ${String(BREAKPOINT_REM.xl)}rem)`,
  motion: '(prefers-reduced-motion: no-preference)',
  reduce: '(prefers-reduced-motion: reduce)',
  /** Todo efeito de hover fica atrás disto — senão o toque cola no estado hover. */
  hover: '(hover: hover) and (pointer: fine)',
} as const;

export function cssEase(name: EaseName): string {
  return `cubic-bezier(${EASE[name].join(', ')})`;
}

export function cssDuration(name: DurationName): string {
  return `${String(DURATION[name] * 1000)}ms`;
}

/**
 * Resolve a curva cubic-bezier com a MESMA semântica do CSS (Newton-Raphson, com
 * bisseção como rede de segurança).
 *
 * Escolhido em vez do plugin CustomEase de propósito: o CustomEase converte a
 * curva num path SVG e amostra, ou seja, APROXIMA — introduziria divergência entre
 * a animação em CSS e a em GSAP exatamente onde este módulo existe para garantir
 * que não haja nenhuma. São ~25 linhas contra ~3 KB de plugin.
 */
function cubicBezierEase(control: CubicBezier): (progress: number) => number {
  const [x1, y1, x2, y2] = control;

  const cx = 3 * x1;
  const bx = 3 * (x2 - x1) - cx;
  const ax = 1 - cx - bx;
  const cy = 3 * y1;
  const by = 3 * (y2 - y1) - cy;
  const ay = 1 - cy - by;

  const sampleX = (t: number): number => ((ax * t + bx) * t + cx) * t;
  const sampleY = (t: number): number => ((ay * t + by) * t + cy) * t;
  const derivativeX = (t: number): number => (3 * ax * t + 2 * bx) * t + cx;

  const EPSILON = 1e-6;

  const solveT = (x: number): number => {
    let t = x;

    for (let i = 0; i < 8; i += 1) {
      const error = sampleX(t) - x;
      if (Math.abs(error) < EPSILON) return t;
      const slope = derivativeX(t);
      if (Math.abs(slope) < EPSILON) break;
      t -= error / slope;
    }

    let low = 0;
    let high = 1;
    t = x;
    for (let i = 0; i < 24; i += 1) {
      const error = sampleX(t) - x;
      if (Math.abs(error) < EPSILON) break;
      if (error > 0) high = t;
      else low = t;
      t = (high + low) / 2;
    }

    return t;
  };

  return (progress: number): number => {
    if (progress <= 0) return 0;
    if (progress >= 1) return 1;
    return sampleY(solveT(progress));
  };
}

let registered = false;

/**
 * Prepara o GSAP para o projeto: as quatro curvas `metup.*` e os plugins.
 * Idempotente e client-only — nunca toca no GSAP durante o pré-render.
 *
 * Os plugins entram AQUI, e não em cada seção, por dois motivos:
 *  - `registerPlugin` é o passo que o Rollup usa para não descartar o plugin em
 *    tree-shaking; espalhá-lo é como se esquece um em produção;
 *  - `ScrollTrigger` toca em `window`/`document` no registro, então precisa da
 *    mesma guarda de SSR que as curvas.
 *
 * `SplitText` é gratuito desde o GSAP 3.13 (aqui roda 3.15) — sem plugin pago no
 * projeto e sem CDN de membro.
 */
export function registerMotion(): void {
  if (registered || typeof window === 'undefined') return;
  registered = true;

  gsap.registerPlugin(ScrollTrigger, SplitText);

  for (const name of Object.keys(EASE) as readonly EaseName[]) {
    gsap.registerEase(`metup.${name}`, cubicBezierEase(EASE[name]));
  }
}

export function gsapEase(name: EaseName): string {
  return `metup.${name}`;
}
