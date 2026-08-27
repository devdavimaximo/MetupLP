/**
 * Contraste WCAG 2.x — usado pelo painel Color do styleguide para MEDIR os pares
 * da paleta em vez de confiar em estimativa.
 *
 * Limite conhecido: o cálculo vale para cor sólida sobre cor sólida. Texto sobre
 * glow, gradiente ou cena 3D (F2+) precisa ser remedido contra a cor efetiva.
 */

export type ContrastLevel = 'AAA' | 'AA' | 'AA-large' | 'fail';

export interface ContrastResult {
  readonly ratio: number;
  /** Veredito para texto de corpo (< 18.66px / não-negrito). */
  readonly level: ContrastLevel;
  /** WCAG 1.4.11: bordas e ícones que carregam significado precisam de 3:1. */
  readonly passesNonText: boolean;
}

/**
 * `#0c0e0d`, `#abc` ou `rgb(12 14 13)` → [r, g, b] em 0–255.
 *
 * A forma `rgb()` importa porque o styleguide lê os tokens com `getComputedStyle`,
 * e alguns navegadores devolvem a cor já resolvida em vez do hexadecimal original.
 */
function parseColor(input: string): readonly [number, number, number] {
  const rgb = /^rgba?\(([^)]+)\)$/i.exec(input.trim());
  if (rgb?.[1] !== undefined) {
    const parts = rgb[1]
      .split(/[\s,/]+/)
      .filter((part) => part !== '')
      .slice(0, 3)
      .map((part) => Number.parseFloat(part));

    const [r = 0, g = 0, b = 0] = parts;
    return [r, g, b];
  }

  const value = input.trim().replace(/^#/, '');
  const full =
    value.length === 3
      ? value
          .split('')
          .map((char) => char + char)
          .join('')
      : value;

  if (!/^[0-9a-fA-F]{6}$/.test(full)) {
    throw new Error(`[contrast] cor inválida: "${input}"`);
  }

  return [
    Number.parseInt(full.slice(0, 2), 16),
    Number.parseInt(full.slice(2, 4), 16),
    Number.parseInt(full.slice(4, 6), 16),
  ];
}

/** Luminância relativa (WCAG 2.x, sRGB). */
export function relativeLuminance(hex: string): number {
  const channels = parseColor(hex).map((channel) => {
    const srgb = channel / 255;
    return srgb <= 0.04045 ? srgb / 12.92 : ((srgb + 0.055) / 1.055) ** 2.4;
  });

  const [r = 0, g = 0, b = 0] = channels;
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contrastRatio(foreground: string, background: string): number {
  const a = relativeLuminance(foreground);
  const b = relativeLuminance(background);
  const lighter = Math.max(a, b);
  const darker = Math.min(a, b);
  return (lighter + 0.05) / (darker + 0.05);
}

export function evaluateContrast(foreground: string, background: string): ContrastResult {
  const ratio = contrastRatio(foreground, background);

  const level: ContrastLevel =
    ratio >= 7 ? 'AAA' : ratio >= 4.5 ? 'AA' : ratio >= 3 ? 'AA-large' : 'fail';

  return { ratio, level, passesNonText: ratio >= 3 };
}

/** "5.93" — duas casas, como as tabelas de contraste costumam reportar. */
export function formatRatio(ratio: number): string {
  return ratio.toFixed(2);
}
