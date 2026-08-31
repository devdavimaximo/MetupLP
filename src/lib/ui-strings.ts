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
  /**
   * O FORMULÁRIO DE LEAD (F6). Mesmo critério do resto do arquivo, e ele foi aplicado
   * frase por frase aqui — porque um formulário é onde mais tenta escapar uma
   * promessa.
   *
   * Rótulo de campo, dica de preenchimento e mensagem de erro dizem o que FAZER com o
   * formulário: são instrução, não argumento de venda. Nenhuma delas afirma nada sobre
   * a Metup, cliente, número ou resultado (§4).
   *
   * ⚠ E É POR ISSO QUE `sent` NÃO PROMETE PRAZO. "Respondemos em 24h", "retorno
   * imediato" e parentes seriam exatamente a afirmação que o §4 proíbe o Claude de
   * escrever — só o Davi pode assumir um prazo. A confirmação diz o que ACONTECEU
   * ("Mensagem enviada.") e oferece o caminho mais rápido, que é o WhatsApp. A única
   * frase sobre velocidade na página continua sendo a do Davi, no `copy.md`
   * ("a gente te responde rápido").
   *
   * TODO(PENDENCIAS.md): confirmar os rótulos e as mensagens com o Davi — e perguntar
   * se ele quer um prazo real na confirmação.
   */
  form: {
    /** Separa os dois caminhos: WhatsApp acima, formulário abaixo. */
    divider: 'ou',
    legend: 'Enviar uma mensagem',
    name: { label: 'Nome' },
    contact: {
      label: 'WhatsApp ou e-mail',
      hint: 'Como a gente te responde.',
    },
    message: {
      label: 'O que você precisa',
      hint: 'Site, app, automação, sistema — em poucas linhas.',
    },
    /** Campo-armadilha anti-robô: some da tela e do leitor de tela, ver `LeadForm`. */
    trap: 'Não preencha este campo',
    submit: 'Enviar mensagem',
    sending: 'Enviando…',
    errors: {
      required: 'Preencha este campo.',
      name: 'Escreva seu nome.',
      contact: 'Escreva um e-mail válido ou um número com DDD.',
      message: 'Escreva pelo menos uma frase.',
    },
    /** Falha de envio. Nunca é beco sem saída: o WhatsApp fica do lado (§3). */
    failed: 'Não consegui enviar agora. Tenta de novo — ou fala no WhatsApp, que é direto.',
    /**
     * O MESMO AVISO, mas para o modo 'showcase' — o formulário no ar antes de a chave
     * do serviço existir (ver `lib/lead-form.ts`).
     *
     * ⚠ Separado do `failed` de propósito: lá "tenta de novo" é um conselho útil,
     * aqui seria mentira — enquanto não houver destino, tentar de novo nunca vai dar
     * certo. Esta frase diz o que É verdade e manda para o caminho que funciona.
     *
     * Ela afirma um fato sobre o SITE ("ainda está sendo ligado"), não sobre a Metup:
     * nenhum prazo, nenhum resultado, nenhuma promessa (§4). ⚠ Some no minuto em que
     * a chave entrar — é a única string aqui com data de validade.
     */
    pending:
      'O envio por formulário ainda está sendo ligado. Por enquanto, fala no WhatsApp — é direto.',
    sent: {
      title: 'Mensagem enviada.',
      body: 'Se preferir adiantar, é só chamar no WhatsApp.',
    },
    /** Só em dev — ver `leadFormMode()` em `lib/lead-form.ts`. */
    preview:
      'ENSAIO (só em dev): sem VITE_LEAD_ACCESS_KEY no .env, o envio é simulado e nada sai daqui. Em produção, sem destino, o formulário APARECE (pedido do Davi) mas o envio falha de propósito, entregando o WhatsApp — nunca um "enviado" falso.',
  },
} as const;

export type UiStringKey = keyof typeof uiStrings;
