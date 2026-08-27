/**
 * Detector de divergência entre os tokens de motion em TS (`motion.ts`, a fonte da
 * verdade) e o espelho em CSS (`tokens.css`).
 *
 * Sem test runner no projeto, este é o teste possível — e ele cobre exatamente o
 * ponto onde um erro passaria despercebido: alguém ajusta uma curva no CSS, a
 * animação em GSAP continua com a curva antiga, e nada quebra visivelmente.
 *
 * Roda SÓ no cliente e SÓ em dev. Nada disto entra no build de produção.
 */
import {
  BREAKPOINT_REM,
  DURATION,
  EASE,
  cssDuration,
  cssEase,
  type BreakpointName,
  type DurationName,
  type EaseName,
} from './motion';

export interface TokenDrift {
  readonly token: string;
  readonly css: string;
  readonly ts: string;
}

/** O navegador reserializa valores (`.3` vira `0.3`); compara por número. */
function normalize(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .replace(/-?\d*\.?\d+/g, (match) => String(Number.parseFloat(match)));
}

function equivalent(a: string, b: string): boolean {
  return normalize(a) === normalize(b);
}

export function findMotionDrift(root: HTMLElement = document.documentElement): readonly TokenDrift[] {
  const styles = getComputedStyle(root);
  const drift: TokenDrift[] = [];

  const compare = (token: string, expected: string): void => {
    const actual = styles.getPropertyValue(token);
    if (actual.trim() === '') {
      drift.push({ token, css: '(ausente)', ts: expected });
      return;
    }
    if (!equivalent(actual, expected)) {
      drift.push({ token, css: actual.trim(), ts: expected });
    }
  };

  for (const name of Object.keys(EASE) as readonly EaseName[]) {
    compare(`--ease-${name === 'inOut' ? 'in-out' : name}`, cssEase(name));
  }

  for (const name of Object.keys(DURATION) as readonly DurationName[]) {
    compare(`--transition-duration-${name}`, cssDuration(name));
  }

  for (const name of Object.keys(BREAKPOINT_REM) as readonly BreakpointName[]) {
    compare(`--breakpoint-${name}`, `${String(BREAKPOINT_REM[name])}rem`);
  }

  return drift;
}

/** Chamado por `main.tsx` em dev — falha barulhenta no console. */
export function reportMotionDrift(): void {
  const drift = findMotionDrift();
  if (drift.length === 0) return;

  console.error(
    `[motion] tokens de motion divergem entre src/animations/motion.ts e src/styles/tokens.css (${String(drift.length)}):`,
    drift,
  );
}
