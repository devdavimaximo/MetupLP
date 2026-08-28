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
  /**
   * Navegação do header. Mesmo critério do `scrollCue`: são NOMES DE DESTINO dentro
   * da própria página, não argumento de venda — nenhum deles afirma nada sobre a
   * Metup, cliente, número ou resultado (§4).
   *
   * Eles são deliberadamente diferentes dos títulos das seções em `copy.md` ("O que
   * a Metup faz", "Começa com uma conversa", "Bora tirar sua ideia do papel?"): o
   * título é uma frase que convence, o rótulo de navegação é uma palavra que
   * localiza. Usar o título aqui daria uma barra ilegível.
   *
   * `brand` é o nome acessível do brasão. Ele existe porque abaixo de 360px o
   * wordmark sai da tela (ver `styles/header.css`) e, sem ele, o link de volta ao
   * topo ficaria sem nome nenhum para quem navega por leitor de tela. Contém a
   * palavra visível "metup", como a WCAG 2.5.3 (Label in Name) exige.
   *
   * TODO(PENDENCIAS.md): confirmar os quatro rótulos com o Davi.
   */
  nav: {
    label: 'Seções da página',
    brand: 'Metup — voltar ao topo',
    services: 'Serviços',
    process: 'Processo',
    contact: 'Contato',
  },
} as const;

export type UiStringKey = keyof typeof uiStrings;
