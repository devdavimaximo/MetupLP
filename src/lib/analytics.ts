/**
 * Eventos de conversão — ponto ÚNICO de instrumentação (CLAUDE.md §3, §9).
 *
 * "Sem isso, a LP é cega": todo CTA passa por aqui. Em F1 entregamos só o contrato
 * e um sink no-op — o provider real (GA4/Plausible/…) entra em F6/F7 chamando
 * `setAnalyticsSink()`, e nenhum componente precisa mudar.
 *
 * Em dev o sink default loga no console, para que a instrumentação seja visível
 * desde já em vez de ficar muda até F6.
 *
 * TODO(F6): plugar o provider real junto com o formulário de lead.
 * TODO(F7): consentimento/LGPD antes de qualquer provider que use cookie.
 */

export type ConversionEventName =
  | 'cta_click'
  | 'whatsapp_click'
  | 'lead_form_start'
  | 'lead_form_submit'
  | 'lead_form_error'
  | 'section_view';

export interface ConversionPayload {
  /** `id` da <Section> de origem — vem do SectionContext, não é digitado à mão. */
  readonly location: string;
  /** Texto visível do CTA, para distinguir dois botões na mesma seção. */
  readonly label?: string;
  readonly variant?: string;
}

export interface AnalyticsSink {
  track(name: ConversionEventName, payload: ConversionPayload): void;
}

const devSink: AnalyticsSink = {
  track(name, payload) {
    console.debug('[analytics]', name, payload);
  },
};

const noopSink: AnalyticsSink = {
  track() {
    // Sem provider configurado: descarta em silêncio.
  },
};

let sink: AnalyticsSink = import.meta.env.DEV ? devSink : noopSink;

export function setAnalyticsSink(next: AnalyticsSink): void {
  sink = next;
}

/**
 * Só é chamada de handler de evento, portanto nunca roda no pré-render.
 * Falha do provider jamais pode derrubar o clique no CTA — daí o try/catch.
 */
export function trackConversion(name: ConversionEventName, payload: ConversionPayload): void {
  try {
    sink.track(name, payload);
  } catch (error) {
    if (import.meta.env.DEV) console.error('[analytics] sink falhou', error);
  }
}
