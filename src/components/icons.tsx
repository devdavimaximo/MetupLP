/**
 * Ícones do projeto — SVG inline, escrito à mão.
 *
 * ─── POR QUE NENHUMA BIBLIOTECA ─────────────────────────────────────────────────
 * F2 precisa de dois ícones. Instalar um pacote para isso traria um contrato de
 * traço que não é o nosso: a maioria desenha em grade de 24px com `stroke-width: 2`
 * e pontas arredondadas — o oposto do "canto usinado, nunca pílula" dos tokens de
 * raio. Estes usam `stroke-linecap: square` e nascem alinhados à direção de arte.
 * Zero dependência, zero árvore inteira de ícones no bundle, controle total.
 *
 * Regras: `aria-hidden` sempre (o rótulo é do botão que os contém, nunca do ícone),
 * `currentColor` para herdar a tinta da variante, e `1em` para escalar com o texto.
 */

export interface IconProps {
  readonly className?: string;
}

const BASE = {
  viewBox: '0 0 16 16',
  width: '1em',
  height: '1em',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.5,
  strokeLinecap: 'square',
  'aria-hidden': true,
  focusable: 'false',
} as const;

/** Rolar até a seção — o destino está mais abaixo na MESMA página. */
export function ArrowDownIcon({ className }: IconProps) {
  return (
    <svg {...BASE} className={className}>
      <path d="M8 2.5v11M3.5 9 8 13.5 12.5 9" />
    </svg>
  );
}

/** Sair do site — o destino é externo (WhatsApp, quando o número existir). */
export function ArrowUpRightIcon({ className }: IconProps) {
  return (
    <svg {...BASE} className={className}>
      <path d="M4.5 11.5 11.5 4.5M5.5 4.5h6v6" />
    </svg>
  );
}
