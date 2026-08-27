import { useEffect, useRef, useState } from 'react';
import { copy } from '../../lib/content';
import { TYPE_TOKENS, readToken, type TypeToken } from '../tokens-data';

/** Texto real do copy.md — revisar tom e comprimento verdadeiros, nunca lorem. */
const SAMPLES: readonly string[] = [
  copy.hero.headline.kind === 'text' ? copy.hero.headline.value : 'Metup',
  copy.hero.subheadline.kind === 'text' ? copy.hero.subheadline.value : '',
  copy.contact.headline.kind === 'text' ? copy.contact.headline.value : '',
];

function sampleFor(index: number): string {
  return SAMPLES[index % SAMPLES.length] ?? 'Metup';
}

function Row({ token, index }: { token: TypeToken; index: number }) {
  const ref = useRef<HTMLParagraphElement>(null);
  const [computed, setComputed] = useState('');

  useEffect(() => {
    const update = (): void => {
      if (ref.current === null) return;
      setComputed(getComputedStyle(ref.current).fontSize);
    };
    update();
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('resize', update);
    };
  }, []);

  const declared = readToken(token.name);

  return (
    <div style={{ borderBottom: '1px solid var(--color-line)', padding: '1.25rem 0' }}>
      <div className="sg-row" style={{ gap: '0.75rem', marginBottom: '0.5rem' }}>
        <span className="sg-label">{token.utility}</span>
        <span className="sg-label" style={{ color: 'var(--color-accent-2)' }}>
          {computed} agora
        </span>
        <span className="sg-label">
          {token.family} · {token.usage}
        </span>
      </div>

      {/*
        Lê o token direto por `var()` em vez de aplicar a classe `text-*`.
        Duas razões: o styleguide está fora do scan do Tailwind (as classes usadas só
        aqui não existiriam), e ler a variável é uma amostra mais honesta — mostra o
        valor do token, não o de um utilitário que poderia ter sido sobrescrito.
        A família vem pareada como o componente real faria (Heading = display).
      */}
      <p
        ref={ref}
        style={{
          margin: 0,
          color: 'var(--color-fg)',
          fontFamily: `var(--font-${token.family})`,
          fontSize: `var(${token.name})`,
          lineHeight: `var(${token.name}--line-height, normal)`,
          letterSpacing: `var(${token.name}--letter-spacing, normal)`,
          fontWeight: `var(${token.name}--font-weight, 400)`,
          textTransform: token.family === 'mono' ? 'uppercase' : undefined,
        }}
      >
        {sampleFor(index)}
      </p>

      <p className="sg-label" style={{ margin: '0.5rem 0 0', color: 'var(--color-fg-faint)' }}>
        {declared}
      </p>
    </div>
  );
}

/**
 * O tamanho computado é mostrado ao vivo e acompanha o resize — é assim que se
 * confere que a escala é realmente fluida, e que com zoom de 200% o texto CRESCE
 * (o que só acontece porque todo clamp tem intercepto em rem, e não `Nvw` puro).
 */
export function TypePanel() {
  return (
    <section className="sg-section" id="tipografia">
      <h2>Tipografia · escala fluida</h2>
      <p className="sg-note" style={{ marginBottom: '1.5rem' }}>
        Redimensione a janela para ver o tamanho computado mudar. Depois dê zoom de 200% no
        navegador: o texto precisa crescer — se ficar travado, algum clamp perdeu o intercepto
        em <code>rem</code> e reprova a WCAG 1.4.4.
      </p>
      {TYPE_TOKENS.map((token, index) => (
        <Row key={token.name} token={token} index={index} />
      ))}
    </section>
  );
}
