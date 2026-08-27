/**
 * Formatação de números de índice.
 *
 * Dois dígitos com zero à esquerda ("01", "02"…) é decisão de direção de arte, não
 * capricho: a coluna do índice é mono e alinhada, e "1"/"10" com larguras diferentes
 * quebrariam o alinhamento vertical que faz a seção ler como um sumário. F4 numera os
 * cases com a mesma régua.
 *
 * Não é copy: é ordem, e a ordem vem da estrutura do conteúdo, não de texto escrito
 * por ninguém (§4).
 */
export function padIndex(position: number): string {
  return String(position).padStart(2, '0');
}
