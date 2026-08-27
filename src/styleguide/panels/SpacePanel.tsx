import { RADIUS_TOKENS, SHADOW_TOKENS, SPACING_TOKENS, readToken } from '../tokens-data';

function useComputed(name: string): string {
  const value = readToken(name);
  return value === '' ? '(ausente)' : value;
}

function SpacingRow({ name }: { name: string }) {
  const declared = useComputed(name);

  return (
    <tr>
      <td>{name}</td>
      <td style={{ color: 'var(--color-muted)' }}>{declared}</td>
      <td style={{ width: '50%' }}>
        <div className="sg-bar" style={{ width: `var(${name})` }} />
      </td>
    </tr>
  );
}

export function SpacePanel() {
  return (
    <section className="sg-section" id="espaco">
      <h2>Espaço · raio · luz</h2>

      <div className="sg-stack">
        <div>
          <p className="sg-label" style={{ marginBottom: '0.75rem' }}>
            Ritmo estrutural fluido — as barras medem o valor real na largura atual
          </p>
          <div className="sg-scroll">
            <table className="sg-table">
              <tbody>
                {SPACING_TOKENS.map((name) => (
                  <SpacingRow key={name} name={name} />
                ))}
              </tbody>
            </table>
          </div>
          <p className="sg-note">
            O escalar <code>--spacing</code> é 0.25rem: espaçamento tático continua em{' '}
            <code>p-4</code>, <code>gap-6</code>, <code>mt-10</code>. A rampa nomeada acima
            existe só para o ritmo que as seções precisam repetir sem divergir.
          </p>
        </div>

        <div>
          <p className="sg-label" style={{ marginBottom: '0.75rem' }}>
            Raio — canto usinado, nunca pílula
          </p>
          <div className="sg-row">
            {RADIUS_TOKENS.map((name) => (
              <div key={name} className="sg-box" style={{ borderRadius: `var(${name})` }}>
                {name.replace('--radius-', '')}
              </div>
            ))}
          </div>
        </div>

        <div>
          <p className="sg-label" style={{ marginBottom: '0.75rem' }}>
            Luz — em tema escuro, glow lê melhor que drop shadow
          </p>
          <div className="sg-row" style={{ gap: '2rem' }}>
            {SHADOW_TOKENS.map((name) => (
              <div
                key={name}
                className="sg-box"
                style={{ boxShadow: `var(${name})`, width: '7rem', height: '4.5rem' }}
              >
                {name.replace('--shadow-', '').replace('--inset-shadow-', 'inset ')}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
