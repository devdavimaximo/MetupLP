/**
 * O SEGUNDO CAMINHO DE CONVERSÃO — o formulário de lead (F6).
 *
 * O primeiro caminho é o WhatsApp (`lib/contact.ts`), e ele já está no ar. Este é
 * para quem NÃO quer abrir conversa: pesquisa e o próprio §3 dizem que uma parte
 * relevante de quem converteria some quando o único caminho é um chat.
 *
 * ─── ESTE MÓDULO É O DESTINO ÚNICO DO FORMULÁRIO ────────────────────────────────
 * Mesma doutrina de `lib/contact.ts`, e pelo mesmo motivo: quando o serviço de
 * formulário for escolhido, a mudança é AQUI e em nenhum componente. O `LeadForm`
 * conhece estados de interface; quem conhece rede é este arquivo.
 *
 * ─── A RESTRIÇÃO QUE DESENHOU ISTO (pedido do Davi, 2026-08-31) ─────────────────
 * "Não queremos pagar backend. Tudo tem que subir na Vercel, só com nosso domínio."
 *
 * Então o site continua 100% estático: o `POST` sai do NAVEGADOR direto para um
 * serviço de formulário de terceiros, que entrega no e-mail. Sem função serverless,
 * sem servidor, sem processo para manter — e o §6.1 (saída estática em CDN) fica
 * intacto. O preço dessa escolha é que a chave do serviço vai no bundle, em texto
 * puro; por isso ela tem que ser uma chave PÚBLICA, das que os serviços emitem
 * justamente para serem chamadas do cliente. Ver `src/vite-env.d.ts`.
 *
 * ─── OS TRÊS MODOS ──────────────────────────────────────────────────────────────
 *
 *   'live'     — tem destino: envia de verdade.
 *   'preview'  — não tem, mas é DEV: envio SIMULADO com sucesso, para desenhar e
 *                testar os estados. Um aviso em dev diz que nada saiu dali.
 *   'showcase' — não tem e é PRODUÇÃO: o formulário APARECE, e o envio FALHA de
 *                propósito, entregando o WhatsApp. Ver abaixo.
 *
 * ⚠ 'showcase' SUBSTITUIU UM 'off' (2026-08-31, pedido do Davi: "deixe visível no
 * projeto no ar, depois te entrego as chaves"). O modo anterior simplesmente não
 * publicava o formulário — a seção ficava só com o WhatsApp, que funciona.
 *
 * O que NÃO mudou é a razão daquele modo existir: um formulário que responde
 * "enviado" sem ter enviado é a pior coisa que esta página poderia fazer. A pessoa
 * escreve, clica, sai satisfeita, e o lead evapora — é o §3 ao contrário, e sem
 * deixar rastro. Então o formulário fica visível, mas o envio **falha honestamente**:
 * `submitLead` lança, a interface mostra o aviso com o link do WhatsApp ao lado e o
 * que foi digitado continua na tela. Ninguém é enganado e ninguém fica sem caminho.
 *
 * ⚠ ISSO TEM CUSTO ENQUANTO DURAR, e é consciente: quem preencher os três campos vai
 * ser recusado depois do esforço, o que é pior do que nunca ter visto o formulário.
 * É uma janela de demonstração, não um estado de regime — quanto antes a chave
 * chegar, melhor. Registrado em PENDENCIAS.md.
 *
 * ⚠ O modo é decidido em tempo de BUILD (`import.meta.env` é substituído pelo Vite),
 * o que é exatamente o que um site pré-renderizado precisa: o HTML já sai decidido,
 * sem depender de JS para descobrir.
 */
import { uiStrings } from './ui-strings';

export type LeadFieldName = 'name' | 'contact' | 'message';

export interface LeadFormValues {
  readonly name: string;
  readonly contact: string;
  readonly message: string;
  /**
   * Campo-armadilha (honeypot). Robô de spam preenche tudo que encontra; gente não
   * vê este campo. Custa zero, não depende de serviço nenhum e não põe um captcha na
   * frente do lead — que é o filtro que mais custa conversão.
   */
  readonly trap: string;
}

export type LeadFormErrors = Partial<Record<LeadFieldName, string>>;

export type LeadFormStatus = 'idle' | 'sending' | 'sent' | 'error';

export type LeadFormMode = 'live' | 'preview' | 'showcase';

export const emptyLead: LeadFormValues = { name: '', contact: '', message: '', trap: '' };

/**
 * O SERVIÇO ESCOLHIDO PELO DAVI (2026-08-31): Web3Forms.
 *
 * Ele existe exatamente para o caso desta página — site estático, `POST` do
 * navegador, entrega no e-mail, sem servidor. A URL é pública e fixa; o que
 * identifica a conta é a `access_key`, que é uma chave PÚBLICA (feita para viajar no
 * cliente) e por isso pode ir no bundle sem virar vazamento de segredo (§8).
 *
 * ⚠ Está aqui como PADRÃO, não como amarra. `VITE_LEAD_ENDPOINT` continua vencendo:
 * trocar de serviço um dia é preencher aquela variável, e nada mais no projeto muda.
 */
const WEB3FORMS_URL = 'https://api.web3forms.com/submit';

const configuredEndpoint = (import.meta.env.VITE_LEAD_ENDPOINT ?? '').trim();
const accessKey = (import.meta.env.VITE_LEAD_ACCESS_KEY ?? '').trim();

/**
 * O destino efetivo, com o padrão embutido: basta a `access_key` para o formulário
 * entrar no ar. Foi a razão de existir do padrão acima — a decisão do Davi virou UMA
 * variável em vez de duas, e uma variável a menos é uma chance a menos de o
 * formulário ir para produção pela metade.
 */
const endpoint =
  configuredEndpoint !== '' ? configuredEndpoint : accessKey !== '' ? WEB3FORMS_URL : '';

export function leadFormMode(): LeadFormMode {
  if (endpoint !== '') return 'live';
  return import.meta.env.DEV ? 'preview' : 'showcase';
}

/* ── Validação ──────────────────────────────────────────────────────────────── */

/**
 * Deliberadamente FROUXO. Um formulário de lead não é um cadastro: cada regra a mais
 * é uma chance a mais de recusar alguém que queria falar com a gente. O que se
 * valida aqui é só o que impede a RESPOSTA — sem nome, sem canal de retorno ou sem
 * uma frase de contexto, o lead chega inútil.
 *
 * Nada de regex de e-mail "completa" (as que tentam implementar a RFC 5322 recusam
 * endereços válidos e passam inválidos): basta ter um `@`, algo dos dois lados e um
 * ponto no domínio. Quem errar de verdade descobre pelo silêncio, não por um campo
 * vermelho.
 */
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/u;

/** DDD (2) + 8 ou 9 dígitos = 10 ou 11. O teto de 13 cobre quem digita +55. */
const PHONE_DIGITS = { min: 10, max: 13 } as const;

function looksLikeContact(value: string): boolean {
  if (EMAIL.test(value)) return true;

  const digits = value.replace(/\D/gu, '');
  return digits.length >= PHONE_DIGITS.min && digits.length <= PHONE_DIGITS.max;
}

/**
 * As mensagens saem de `ui-strings.ts` (chrome de produto, não copy do Davi — o
 * critério está documentado lá) e não de um código de erro mapeado no componente:
 * um mapa a mais só existiria para ser esquecido quando entrasse o quarto campo.
 */
export function validateLead(values: LeadFormValues): LeadFormErrors {
  const { errors: messages } = uiStrings.form;
  const errors: Record<string, string> = {};

  const name = values.name.trim();
  if (name === '') errors.name = messages.required;
  else if (name.length < 2) errors.name = messages.name;

  const contact = values.contact.trim();
  if (contact === '') errors.contact = messages.required;
  else if (!looksLikeContact(contact)) errors.contact = messages.contact;

  const message = values.message.trim();
  if (message === '') errors.message = messages.required;
  else if (message.length < 10) errors.message = messages.message;

  return errors;
}

/* ── Envio ──────────────────────────────────────────────────────────────────── */

/** Acima disto o envio é dado como perdido e a pessoa recebe o caminho do WhatsApp. */
const TIMEOUT_MS = 12_000;

/**
 * O corpo do envio.
 *
 * ⚠ AS CHAVES SÃO EM PORTUGUÊS, e é a única exceção consciente ao §10 no projeto.
 * Elas não são identificador de código: são o CONTEÚDO do e-mail que o Davi vai ler.
 * A maioria dos serviços de formulário monta a mensagem a partir dos nomes dos
 * campos, então `nome`/`contato`/`mensagem` chegam como um e-mail legível e
 * `name`/`contact`/`message` chegariam como um formulário em inglês. O tipo do lado
 * de cá continua em inglês (`LeadFormValues`).
 *
 * `origem` e `enviado_em` existem para o dia em que houver mais de uma origem (uma
 * campanha, uma segunda página): sem eles, todo lead chega igual e não dá para saber
 * o que converteu — o mesmo raciocínio do §3 sobre instrumentar a conversão.
 *
 * `access_key` só entra se `VITE_LEAD_ACCESS_KEY` existir. É o campo que o Web3Forms
 * exige no corpo; um destino que não o conheça ignora o que não entende.
 *
 * ─── `subject` E `replyto`: CONVENIÊNCIA DE CAIXA DE ENTRADA ────────────────────
 * `subject` transforma uma caixa de "Novo envio do formulário" repetido em uma lista
 * onde dá para ver de quem é cada lead sem abrir. `replyto` só entra quando o contato
 * é um E-MAIL: aí responder o lead vira um Responder, sem copiar e colar endereço.
 * Quando a pessoa deixa telefone, o campo não existe — apontar o reply-to para um
 * número seria criar um endereço inválido.
 *
 * ⚠ Os dois são convenções do PROVEDOR, não do nosso lado. Um destino que não os
 * reconheça simplesmente mostra os dois como mais duas linhas do e-mail — nada
 * quebra. **Conferir no primeiro envio real** se o assunto e o responder chegaram
 * como o esperado; se não, é aqui que se ajusta o nome do campo.
 */
function buildLeadPayload(values: LeadFormValues): Record<string, string> {
  const name = values.name.trim();
  const contact = values.contact.trim();

  const payload: Record<string, string> = {
    nome: name,
    contato: contact,
    mensagem: values.message.trim(),
    origem: typeof window === 'undefined' ? 'metup' : window.location.host,
    enviado_em: new Date().toISOString(),
    // Assunto do e-mail que o Davi recebe — chrome de caixa de entrada, não copy
    // publicada: não afirma nada sobre a Metup e ninguém além dele lê (§4).
    subject: `Novo lead pelo site — ${name}`,
  };

  if (accessKey !== '') payload.access_key = accessKey;
  if (EMAIL.test(contact)) payload.replyto = contact;

  return payload;
}

/** Quanto o modo de ensaio finge demorar, para os estados de envio serem visíveis. */
const PREVIEW_DELAY_MS = 900;

/**
 * Envia, ou LANÇA. Quem chama decide o que a interface faz com a falha — e no
 * `LeadForm` ela nunca é um beco sem saída: o texto do erro entrega o WhatsApp.
 *
 * A armadilha é conferida AQUI, e não no componente, para que nenhum caminho de
 * chamada futuro consiga pular a checagem. Preenchida, a função devolve sucesso sem
 * mandar nada: o robô vê "enviado", o e-mail do Davi não vê nada.
 */
export async function submitLead(values: LeadFormValues): Promise<void> {
  if (values.trap.trim() !== '') return;

  const mode = leadFormMode();

  if (mode === 'preview') {
    await new Promise((resolve) => setTimeout(resolve, PREVIEW_DELAY_MS));
    if (import.meta.env.DEV) console.debug('[lead-form] ensaio, nada enviado', buildLeadPayload(values));
    return;
  }

  /**
   * ⚠ ESTE `throw` É A FUNCIONALIDADE, não uma guarda defensiva.
   *
   * Em 'showcase' o formulário está no ar para ser mostrado, sem destino configurado.
   * Falhar é o único desfecho honesto: a interface transforma esta exceção no aviso
   * que entrega o WhatsApp e preserva o que foi digitado. A alternativa — devolver
   * sucesso — seria dizer "enviado" para uma mensagem que não existe em lugar nenhum.
   */
  if (mode === 'showcase') throw new Error('lead-form: sem destino configurado');

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(buildLeadPayload(values)),
    // Sem isto, uma rede pendurada deixa o botão em "Enviando…" para sempre e a
    // pessoa vai embora achando que enviou.
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });

  if (!response.ok) {
    throw new Error(`lead-form: destino respondeu ${String(response.status)}`);
  }
}
