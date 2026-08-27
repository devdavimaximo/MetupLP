/**
 * Concatenação condicional de classes.
 *
 * Sem `clsx`/`tailwind-merge` de propósito: são dependências para um problema que
 * este projeto não tem. Como não há merge de conflito, os mapas de variante dos
 * componentes são desenhados para NÃO disputar a mesma propriedade (variante cuida
 * de cor/borda/luz; size cuida de padding/tipo). Disciplina de design de API em vez
 * de runtime extra no bundle.
 */
export type ClassValue = string | false | null | undefined;

export function cn(...values: readonly ClassValue[]): string {
  return values.filter((value): value is string => Boolean(value)).join(' ');
}
