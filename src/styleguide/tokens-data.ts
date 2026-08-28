/**
 * Nomes dos tokens exibidos no styleguide.
 *
 * Só os NOMES ficam aqui; os VALORES são lidos de `getComputedStyle(:root)` em
 * runtime. Assim o painel nunca mostra uma cor diferente da que o site usa — se
 * alguém alterar `tokens.css`, o styleguide acompanha sozinho. Um nome que suma do
 * CSS aparece como "(ausente)", que é uma falha visível; um valor divergente seria
 * invisível, e é justamente o que este arranjo elimina.
 */

export interface ColorToken {
  readonly name: string;
  /** Papel do token — orienta contra o quê medir o contraste. */
  readonly role: 'surface' | 'text' | 'line' | 'brand' | 'state';
  /** Nunca deve ser usado como texto (é linha, fundo ou estado desabilitado). */
  readonly nonText?: boolean;
  /**
   * Token cujo par real NÃO é o fundo da página. `--color-on-accent` é o caso: medido
   * contra `--color-bg` daria 1.00:1 e acusaria uma reprovação que não existe — ele
   * só é usado sobre o preenchimento dourado, onde dá 10.36:1.
   */
  readonly measureAgainst?: string;
  readonly note?: string;
}

export const COLOR_TOKENS: readonly ColorToken[] = [
  { name: '--color-surface-sunken', role: 'surface' },
  { name: '--color-bg', role: 'surface' },
  { name: '--color-surface', role: 'surface' },
  { name: '--color-surface-raised', role: 'surface' },

  { name: '--color-fg', role: 'text' },
  { name: '--color-fg-muted', role: 'text', note: 'secundário padrão' },
  { name: '--color-muted', role: 'text', note: 'meta/rótulo — AA, não AAA' },
  { name: '--color-fg-faint', role: 'text', nonText: true, note: 'só disabled/decorativo' },
  {
    name: '--color-on-accent',
    role: 'text',
    measureAgainst: '--color-accent',
    note: 'tinta obrigatória sobre dourado',
  },

  { name: '--color-line', role: 'line', nonText: true, note: 'filete decorativo' },
  { name: '--color-line-strong', role: 'line', nonText: true, note: 'borda interativa' },

  { name: '--color-accent', role: 'brand' },
  { name: '--color-accent-hover', role: 'brand' },
  { name: '--color-accent-active', role: 'brand' },
  { name: '--color-accent-2', role: 'brand' },
  { name: '--color-accent-2-hover', role: 'brand' },
  { name: '--color-accent-2-active', role: 'brand' },

  { name: '--color-success', role: 'state' },
  { name: '--color-danger', role: 'state' },
  { name: '--color-focus', role: 'state' },
];

export interface TypeToken {
  readonly name: string;
  readonly utility: string;
  readonly usage: string;
  /**
   * Os tokens `--text-*` carregam SÓ tamanho/altura/tracking/peso — a família vem do
   * componente (`Heading` usa `font-display`, `Eyebrow` usa `font-mono`). O painel
   * precisa reproduzir esse pareamento, senão mostra o display em Work Sans e a
   * revisão de tipografia acontece na fonte errada.
   */
  readonly family: 'display' | 'body' | 'mono';
}

export const TYPE_TOKENS: readonly TypeToken[] = [
  { name: '--text-hero', utility: 'text-hero', usage: 'primeira dobra (F2)', family: 'display' },
  { name: '--text-display', utility: 'text-display', usage: 'título de abertura', family: 'display' },
  { name: '--text-display-sm', utility: 'text-display-sm', usage: 'título de seção grande', family: 'display' },
  { name: '--text-title', utility: 'text-title', usage: 'título de seção', family: 'display' },
  { name: '--text-title-sm', utility: 'text-title-sm', usage: 'subtítulo, card', family: 'display' },
  { name: '--text-lead', utility: 'text-lead', usage: 'parágrafo de abertura', family: 'body' },
  { name: '--text-body-lg', utility: 'text-body-lg', usage: 'corpo em destaque', family: 'body' },
  { name: '--text-body', utility: 'text-body', usage: 'corpo padrão', family: 'body' },
  { name: '--text-body-sm', utility: 'text-body-sm', usage: 'corpo secundário', family: 'body' },
  { name: '--text-caption', utility: 'text-caption', usage: 'legenda', family: 'body' },
  { name: '--text-label', utility: 'text-label', usage: 'rótulo mono de terminal', family: 'mono' },
];

export const SPACING_TOKENS: readonly string[] = [
  '--spacing-gutter',
  '--spacing-stack',
  '--spacing-block',
  '--spacing-section',
  '--spacing-section-lg',
];

export const RADIUS_TOKENS: readonly string[] = [
  '--radius-none',
  '--radius-xs',
  '--radius-sm',
  '--radius-md',
  '--radius-lg',
];

export const SHADOW_TOKENS: readonly string[] = [
  '--inset-shadow-hairline',
  '--shadow-raised',
  '--shadow-panel',
  '--shadow-glow-accent',
  '--shadow-glow-accent-2',
];

/** Lê um custom property do :root. Vazio quando o token não existe. */
export function readToken(name: string): string {
  if (typeof window === 'undefined') return '';
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}
