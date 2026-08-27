/**
 * Destino ÚNICO de todo CTA de conversão da página.
 *
 * ─── POR QUE ESTE ARQUIVO EXISTE ────────────────────────────────────────────────
 * O `PENDENCIAS.md` registra que ainda não há número de WhatsApp real, e o CLAUDE.md
 * §4 proíbe inventar um. Ao mesmo tempo, o §3 diz que o lead não pode se perder — um
 * CTA que não leva a lugar nenhum é exatamente perder o lead.
 *
 * A saída é não espalhar a pendência. Enquanto o número não chega, todo CTA aponta
 * para a seção de contato da própria página; quando o Davi mandar o número, UMA
 * troca aqui muda o herói, o header e (em F6) o CTA final de uma vez:
 *
 * ```ts
 * export const contactTarget: ContactTarget = {
 *   kind: 'whatsapp',
 *   href: 'https://wa.me/55XXXXXXXXXXX',   // ← número real do Davi
 *   analyticsId: 'whatsapp_click',
 *   isExternal: true,
 * };
 * ```
 *
 * ─── HONESTIDADE DO RÓTULO ──────────────────────────────────────────────────────
 * Hoje o rótulo do CTA vem de `copy.hero.primaryCta` ("Falar no WhatsApp") mas o
 * destino é `#contato`. A divergência é temporária e conhecida — está registrada em
 * `PENDENCIAS.md`. O ícone compensa: em `pending` a seta aponta para baixo (rolar),
 * em `whatsapp` ela aponta para fora (sair do site). Enquanto o texto não pode dizer
 * a verdade, a forma diz.
 */
import type { ConversionEventName } from './analytics';

export type ContactKind = 'pending' | 'whatsapp';

export interface ContactTarget {
  readonly kind: ContactKind;
  readonly href: string;
  /** Evento correspondente; o `Button` exige um, e ele muda com o destino. */
  readonly analyticsId: ConversionEventName;
  /** Só `true` quando o destino sai do site — dispara `target="_blank"` + rel. */
  readonly isExternal: boolean;
}

/** `id` da <Section> de contato. Fonte única da âncora, aqui e no componente. */
export const CONTACT_SECTION_ID = 'contato';

/** `id` da <Section> do herói — alvo do wordmark no header. */
export const HERO_SECTION_ID = 'inicio';

// A anotação explícita mantém `kind` como a união: as duas ramificações do ícone e
// do evento continuam compilando enquanto o valor é `pending`.
export const contactTarget: ContactTarget = {
  kind: 'pending',
  href: `#${CONTACT_SECTION_ID}`,
  analyticsId: 'cta_click',
  isExternal: false,
};
