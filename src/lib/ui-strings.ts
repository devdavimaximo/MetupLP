/**
 * Strings de chrome da interface (pt-BR).
 *
 * Por que NÃO estão em `content/copy.md`: a regra do CLAUDE.md §9 é que as SEÇÕES
 * leem de `content/` — ela existe para que copy de marketing (headline, oferta,
 * prova social) seja sempre do Davi. Rótulo de a11y e aviso de navegação são chrome
 * de produto, não argumento de venda, e ficam versionados junto do componente.
 *
 * Nenhuma destas strings faz afirmação sobre a Metup, cliente, número ou resultado.
 *
 * TODO(PENDENCIAS.md): confirmar com o Davi se ele prefere um `## UI` em copy.md.
 */
export const uiStrings = {
  skipToContent: 'Pular para o conteúdo',
  opensInNewTab: '(abre em nova aba)',
  loading: 'Carregando…',
  pendingContent: 'Conteúdo pendente',
  /**
   * Rótulo do indicador de rolagem do herói. Fica aqui, e não em `copy.md`, pelo
   * mesmo critério do resto do arquivo: é uma instrução de navegação — diz o que
   * FAZER com a página —, não uma afirmação sobre a Metup.
   */
  scrollCue: 'Role para explorar',
} as const;

export type UiStringKey = keyof typeof uiStrings;
