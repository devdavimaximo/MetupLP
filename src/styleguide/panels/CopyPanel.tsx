import { copy } from '../../lib/content';
import type { CopyField } from '../../lib/content-parser';

function Field({ label, field }: { label: string; field: CopyField }) {
  const placeholder = field.kind === 'placeholder';

  return (
    <div className={`sg-copy-field${placeholder ? ' sg-copy-field--placeholder' : ''}`}>
      <span className="sg-label">
        {label}
        {placeholder && ' · pendente'}
      </span>
      <p className={`sg-copy-value${placeholder ? ' sg-copy-value--placeholder' : ''}`}>
        {placeholder ? field.hint : field.value}
      </p>
    </div>
  );
}

/**
 * A copy parseada, exibida como o sistema realmente a enxerga.
 *
 * Serve para duas coisas: revisar o texto do Davi dentro da escala tipográfica real
 * e ver, de relance, tudo que ainda está esperando dado real — os campos em âmbar
 * são os `[ ... ]`, que em produção não renderizam nada.
 */
export function CopyPanel() {
  const pending = [
    copy.cases.intro,
    ...copy.socialProof.bullets,
    copy.hero.headline,
    copy.contact.cta,
  ].filter((field) => field.kind === 'placeholder').length;

  return (
    <section className="sg-section" id="copy">
      <h2>Copy · content/copy.md</h2>

      <p className="sg-note" style={{ marginBottom: '1.5rem' }}>
        Lido de <code>content/copy.md</code> em build. Se um rótulo sumir do markdown, o build
        quebra com a lista de chaves ausentes — nunca com a seção vazia.{' '}
        <strong style={{ color: 'var(--color-accent)' }}>{pending} campo(s) pendente(s)</strong>{' '}
        esperando dado real.
      </p>

      <div className="sg-stack">
        <div>
          <p className="sg-label">Hero</p>
          <Field label="headline" field={copy.hero.headline} />
          <Field label="subheadline" field={copy.hero.subheadline} />
          <Field label="primaryCta" field={copy.hero.primaryCta} />
        </div>

        <div>
          <p className="sg-label">Serviços ({copy.services.items.length})</p>
          {copy.services.items.map((service) => (
            <Field key={service.title} label={service.title} field={service.description} />
          ))}
        </div>

        <div>
          <p className="sg-label">Cases</p>
          <Field label="sectionTitle" field={copy.cases.sectionTitle} />
          <Field label="intro" field={copy.cases.intro} />
        </div>

        <div>
          <p className="sg-label">Prova social</p>
          <Field label="sectionTitle" field={copy.socialProof.sectionTitle} />
          {copy.socialProof.bullets.map((bullet, index) => (
            <Field key={index} label={`bullet ${String(index + 1)}`} field={bullet} />
          ))}
        </div>

        <div>
          <p className="sg-label">Contato</p>
          <Field label="headline" field={copy.contact.headline} />
          <Field label="body" field={copy.contact.body} />
          <Field label="cta" field={copy.contact.cta} />
        </div>
      </div>
    </section>
  );
}
