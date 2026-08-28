/**
 * `id` das âncoras da página — FONTE ÚNICA.
 *
 * ─── POR QUE SAÍRAM DE DENTRO DAS SEÇÕES ────────────────────────────────────────
 * Até F3 cada seção declarava o próprio `id` e quem precisasse dele importava a
 * seção (`Hero` importava `SERVICES_SECTION_ID` de `sections/Services`). Isso parou
 * de funcionar quando o header ganhou navegação: a barra precisa dos `id` das quatro
 * seções, e `components/Header → lib/nav → sections/Services → components/index →
 * components/Header` é um ciclo de import. Ciclo em ESM não quebra o build, mas
 * decide a ordem de avaliação dos módulos em silêncio — o tipo de bug que aparece
 * uma vez, em produção, e ninguém reproduz.
 *
 * Com os `id` num módulo folha (não importa nada), o ciclo deixa de existir e o
 * benefício antigo continua: um `id` só, num lugar só. Renomear uma âncora aqui
 * atualiza a seção, o link do herói, o CTA, a navegação e o offset do Lenis de uma
 * vez — e o TypeScript acusa qualquer sobra.
 *
 * ⚠ Estes valores são URL PÚBLICA (`metup.com.br/#servicos`) e o `location` dos
 * eventos de analytics. Trocá-los quebra link compartilhado e corta a série
 * histórica do funil — não renomeie por gosto.
 */

export const SECTION_ID = {
  hero: 'inicio',
  services: 'servicos',
  process: 'processo',
  contact: 'contato',
} as const;

export type SectionId = (typeof SECTION_ID)[keyof typeof SECTION_ID];
