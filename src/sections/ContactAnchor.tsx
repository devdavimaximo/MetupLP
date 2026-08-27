import { Heading, PendingContent, Section, Text } from '../components';
import { CONTACT_SECTION_ID } from '../lib/contact';
import { copy } from '../lib/content';

const HEADING_ID = 'contato-titulo';

/**
 * Destino do CTA do herói — a VERSÃO SIMPLES de F2, não a seção de contato de F6.
 *
 * ─── POR QUE ELA EXISTE AGORA ───────────────────────────────────────────────────
 * O CTA do herói precisa de um destino que exista de verdade. Sem número de WhatsApp
 * (§4 proíbe inventar um), a alternativa seria uma âncora quebrada ou um botão
 * desabilitado — as duas perdem o lead, que é o que o §3 chama de inaceitável. Então
 * F2 entrega o alvo mínimo: o convite que o Davi já escreveu, e nada além dele.
 * É o "faça a versão simples e registre o TODO" do §11, literal.
 *
 * ─── O QUE F6 ACRESCENTA AQUI ───────────────────────────────────────────────────
 * Formulário de lead com destino confiável, confirmação de envio, botão de WhatsApp
 * e os eventos `lead_form_*`. O `copy.contact.cta` ("Falar no WhatsApp · Enviar
 * mensagem") fica intencionalmente NÃO renderizado até lá: são dois CTAs num campo
 * só, e separá-los depende de existir para onde mandar cada um.
 *
 * Enquanto isso, em produção esta seção mostra headline e convite; o aviso do que
 * falta aparece só em dev, via `PendingContent` (§4 — placeholder nunca é publicado).
 */
export function ContactAnchor() {
  const { headline, body } = copy.contact;

  return (
    <Section
      id={CONTACT_SECTION_ID}
      labelledBy={HEADING_ID}
      rhythm="lg"
      tone="surface"
      width="narrow"
    >
      {headline.kind === 'text' ? (
        <Heading level={2} size="display-sm" id={HEADING_ID}>
          {headline.value}
        </Heading>
      ) : (
        <PendingContent hint={headline.hint} />
      )}

      <div className="mt-8">
        {body.kind === 'text' ? (
          <Text size="body-lg">{body.value}</Text>
        ) : (
          <PendingContent hint={body.hint} />
        )}
      </div>

      <div className="mt-block">
        <PendingContent hint="F6 — formulário de lead + WhatsApp. Bloqueado por: número de WhatsApp real, e-mail/telefone e destino do formulário (ver PENDENCIAS.md)." />
      </div>
    </Section>
  );
}
