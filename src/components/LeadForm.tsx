import { useEffect, useId, useRef, useState, type FormEvent } from 'react';
import { trackConversion } from '../lib/analytics';
import { contactTarget } from '../lib/contact';
import {
  emptyLead,
  leadFormMode,
  submitLead,
  validateLead,
  type LeadFieldName,
  type LeadFormErrors,
  type LeadFormStatus,
  type LeadFormValues,
} from '../lib/lead-form';
import { uiStrings } from '../lib/ui-strings';
import { Button } from './Button';
import { Field } from './Field';
import { useSectionId } from './section-context';

/** Ordem do DOM — é ela que decide qual campo inválido recebe o foco. */
const FIELD_ORDER: readonly LeadFieldName[] = ['name', 'contact', 'message'];

/**
 * O SEGUNDO CAMINHO DE CONVERSÃO — o formulário (F6).
 *
 * O WhatsApp está logo acima e é o caminho primário; este é para quem não quer abrir
 * conversa. A rede fica em `lib/lead-form.ts`; aqui mora só o que a pessoa vê.
 *
 * ─── UM FORMULÁRIO NÃO PODE PERDER O LEAD (§3) ──────────────────────────────────
 * Essa frase determinou quase todas as decisões abaixo:
 *
 *  · **Três campos, e só.** Nome, um canal de retorno e o que a pessoa precisa. Cada
 *    campo a mais é gente que desiste no meio; nada aqui é coletado "porque pode ser
 *    útil depois".
 *  · **A validação não acontece enquanto se digita.** Ela só entra na PRIMEIRA
 *    tentativa de envio, e a partir daí o campo que já errou se corrige ao vivo.
 *    Marcar um campo de vermelho enquanto a pessoa ainda está escrevendo nele é
 *    hostil, e é como um formulário parece quebrado sem estar.
 *  · **Falhar não é beco sem saída.** Se o envio cair, o texto do erro entrega o
 *    WhatsApp — e o que foi digitado CONTINUA no formulário. Limpar os campos numa
 *    falha de rede é a forma mais rápida de perder alguém que já tinha decidido
 *    falar com a gente.
 *  · **Nada de captcha.** O filtro é uma armadilha invisível (ver `LeadFormValues`),
 *    que não cobra nada de quem é gente.
 *
 * ─── ACESSIBILIDADE ─────────────────────────────────────────────────────────────
 * `noValidate` desliga o balão do navegador para não competir com as nossas
 * mensagens (o porquê está em `Field`). O foco nunca fica órfão: erro de validação
 * leva ao primeiro campo inválido, falha de envio leva ao alerta (que carrega o link
 * do WhatsApp), sucesso leva à confirmação. Os dois desfechos são anunciados —
 * `role="alert"` na falha, `role="status"` no sucesso.
 *
 * ─── INSTRUMENTAÇÃO (§3: "sem isso, a LP é cega") ───────────────────────────────
 * `lead_form_start` no primeiro toque em qualquer campo (uma vez só — é o
 * denominador da taxa de conclusão), `lead_form_submit` no envio bem-sucedido,
 * `lead_form_error` quando o envio falha. Erro de VALIDAÇÃO não dispara evento de
 * erro: ele não é uma conversão perdida, é a pessoa ainda preenchendo.
 */
export function LeadForm() {
  const uid = useId();
  const location = useSectionId();

  const [values, setValues] = useState<LeadFormValues>(emptyLead);
  const [errors, setErrors] = useState<LeadFormErrors>({});
  const [status, setStatus] = useState<LeadFormStatus>('idle');
  /** Só depois da primeira tentativa o formulário começa a apontar erro. */
  const [attempted, setAttempted] = useState(false);

  const startedRef = useRef(false);
  const sentRef = useRef<HTMLDivElement>(null);
  const alertRef = useRef<HTMLDivElement>(null);

  const { form } = uiStrings;
  const fieldId = (field: LeadFieldName): string => `${uid}-${field}`;

  /**
   * O FOCO SEGUE O DESFECHO — e num efeito, não logo depois do `await`.
   *
   * ⚠ Defeito medido, não precaução: a primeira versão chamava `focus()` dentro de um
   * `requestAnimationFrame` disparado no fim do envio, e o foco ficava no `<body>`. O
   * React 19 agenda o render do `setStatus`, e o quadro seguinte chega ANTES do
   * commit — a `ref` do bloco de confirmação ainda era `null` na hora do `focus()`.
   * Um efeito com `status` na dependência roda depois do commit, quando o nó existe,
   * e é o único ponto em que essa garantia é estrutural.
   *
   * Sem isto, quem navega por teclado envia o formulário e é devolvido ao começo do
   * documento — sem saber se deu certo, e a um Tab de distância de nada.
   */
  useEffect(() => {
    if (status === 'sent') sentRef.current?.focus();
    if (status === 'error') alertRef.current?.focus();
  }, [status]);

  const handleFirstTouch = (): void => {
    if (startedRef.current) return;
    startedRef.current = true;
    trackConversion('lead_form_start', { location });
  };

  const setField = (field: keyof LeadFormValues, value: string): void => {
    const next = { ...values, [field]: value };
    setValues(next);

    // Revalida AO VIVO só depois da primeira tentativa, e só o campo tocado: é o que
    // faz o erro sumir no instante em que deixa de ser verdade, sem nunca acusar um
    // campo que a pessoa ainda não terminou.
    if (attempted && field !== 'trap') {
      const fresh = validateLead(next);
      setErrors((previous) => ({ ...previous, [field]: fresh[field] }));
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    if (status === 'sending') return;

    setAttempted(true);
    const found = validateLead(values);
    setErrors(found);

    const firstInvalid = FIELD_ORDER.find((field) => found[field] !== undefined);
    if (firstInvalid !== undefined) {
      document.getElementById(fieldId(firstInvalid))?.focus();
      return;
    }

    setStatus('sending');

    try {
      await submitLead(values);
      setStatus('sent');
      trackConversion('lead_form_submit', { location });
    } catch (error) {
      setStatus('error');
      trackConversion('lead_form_error', { location });
      if (import.meta.env.DEV) console.error('[lead-form] envio falhou', error);
    }
    // O foco vai para o desfecho no efeito acima — depois do commit, ver a nota lá.
  };

  if (status === 'sent') {
    return (
      <div className="lead-form__sent" ref={sentRef} role="status" tabIndex={-1}>
        <p className="lead-form__sent-title">{form.sent.title}</p>
        <p className="lead-form__sent-body">
          {form.sent.body}{' '}
          <a
            className="lead-form__inline-link"
            href={contactTarget.href}
            target={contactTarget.isExternal ? '_blank' : undefined}
            onClick={() => {
              trackConversion(contactTarget.analyticsId, { location, label: 'pos-envio' });
            }}
          >
            WhatsApp
          </a>
        </p>
      </div>
    );
  }

  return (
    <form className="lead-form" noValidate onSubmit={(event) => void handleSubmit(event)}>
      {/* `<fieldset>`/`<legend>` e não um `<h3>`: o formulário é um grupo de
          controles, e é assim que um leitor de tela o anuncia como um. A legenda fica
          só para leitor de tela — na tela, quem já nomeia o bloco é o divisor "ou"
          logo acima, e repetir isso em texto grande roubaria peso do CTA (§3). */}
      <fieldset className="lead-form__fieldset">
        <legend className="sr-only">{form.legend}</legend>

        <div className="lead-form__row">
          <Field
            id={fieldId('name')}
            name="nome"
            label={form.name.label}
            value={values.name}
            error={errors.name}
            autoComplete="name"
            onFocus={handleFirstTouch}
            onChange={(value) => {
              setField('name', value);
            }}
          />

          <Field
            id={fieldId('contact')}
            name="contato"
            label={form.contact.label}
            hint={form.contact.hint}
            value={values.contact}
            error={errors.contact}
            // `tel` e não `email`: o campo aceita os dois, e o teclado numérico é o
            // que atende o caso mais comum aqui sem impedir digitar um e-mail.
            inputMode="tel"
            autoComplete="tel"
            onFocus={handleFirstTouch}
            onChange={(value) => {
              setField('contact', value);
            }}
          />
        </div>

        <Field
          id={fieldId('message')}
          name="mensagem"
          label={form.message.label}
          hint={form.message.hint}
          value={values.message}
          error={errors.message}
          multiline
          rows={4}
          onFocus={handleFirstTouch}
          onChange={(value) => {
            setField('message', value);
          }}
        />

        {/* A ARMADILHA. Fora da tela por posição (nunca `display: none`, que alguns
            robôs já sabem ignorar), fora da ordem de tabulação e fora da árvore de
            acessibilidade — para gente, ela não existe em nenhum sentido. */}
        <div className="lead-form__trap" aria-hidden="true">
          <label htmlFor={`${uid}-trap`}>{form.trap}</label>
          <input
            id={`${uid}-trap`}
            type="text"
            name="empresa"
            tabIndex={-1}
            autoComplete="off"
            value={values.trap}
            onChange={(event) => {
              setField('trap', event.target.value);
            }}
          />
        </div>
      </fieldset>

      {status === 'error' && (
        <div className="lead-form__alert" ref={alertRef} role="alert" tabIndex={-1}>
          {form.failed}{' '}
          <a
            className="lead-form__inline-link"
            href={contactTarget.href}
            target={contactTarget.isExternal ? '_blank' : undefined}
            onClick={() => {
              trackConversion(contactTarget.analyticsId, { location, label: 'falha-form' });
            }}
          >
            WhatsApp
          </a>
        </div>
      )}

      {/* `secondary` e não `primary`: o dourado sólido é do WhatsApp, que é o caminho
          primário. Dois preenchimentos dourados na mesma tela apagariam a hierarquia
          entre os dois caminhos — e o §3 diz qual é qual.

          A LARGURA é do CSS (`.lead-form__actions`), não da prop `fullWidth`: ela é
          responsiva — cheia no celular, onde o botão é o alvo do polegar; do tamanho
          do próprio texto e alinhada à direita no desktop, onde um botão de 700px de
          largura pareceria uma faixa. Uma prop booleana não sabe fazer isso. */}
      <div className="lead-form__actions">
      <Button
        type="submit"
        variant="secondary"
        size="lg"
        // ⚠ `attempt`, NÃO `submit`. O `Button` dispara o evento no clique, e o clique
        // não é a conversão: a validação ainda pode barrar e a rede ainda pode cair.
        // Quem dispara `lead_form_submit` é o `handleSubmit`, e só quando o lead
        // chega. Marcar o clique como conversão faria a taxa mentir para cima — ver a
        // nota do funil em `lib/analytics.ts`.
        analyticsId="lead_form_attempt"
        disabled={status === 'sending'}
        isLoading={status === 'sending'}
      >
        {status === 'sending' ? form.sending : form.submit}
      </Button>
      </div>

      {leadFormMode() === 'preview' && <p className="lead-form__preview">{form.preview}</p>}
    </form>
  );
}
