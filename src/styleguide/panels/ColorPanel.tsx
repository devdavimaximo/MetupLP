import { evaluateContrast, formatRatio, type ContrastLevel } from '../../lib/contrast';
import { COLOR_TOKENS, readToken, type ColorToken } from '../tokens-data';

function badgeClass(level: ContrastLevel): string {
  if (level === 'AAA' || level === 'AA') return 'sg-badge sg-badge--pass';
  if (level === 'AA-large') return 'sg-badge sg-badge--warn';
  return 'sg-badge sg-badge--fail';
}

interface SwatchProps {
  readonly token: ColorToken;
  readonly bg: string;
  readonly surface: string;
}

function Swatch({ token, bg, surface }: SwatchProps) {
  const value = readToken(token.name);

  if (value === '') {
    return (
      <div className="sg-swatch">
        <div className="sg-swatch__meta">
          <span className="sg-swatch__name">{token.name}</span>
          <span className="sg-badge sg-badge--fail">ausente no CSS</span>
        </div>
      </div>
    );
  }

  const isSurface = token.role === 'surface';

  // Alguns tokens só existem para um par específico; medi-los contra o fundo da
  // página produziria uma reprovação falsa (ver `measureAgainst`).
  const pairedName = token.measureAgainst;
  const paired = pairedName === undefined ? '' : readToken(pairedName);

  const vsBg = evaluateContrast(value, paired === '' ? bg : paired);
  const vsSurface = evaluateContrast(value, surface);

  return (
    <div className="sg-swatch">
      <div className="sg-swatch__chip" style={{ backgroundColor: value }} />
      <div className="sg-swatch__meta">
        <span className="sg-swatch__name">{token.name}</span>
        <span className="sg-swatch__value">{value}</span>
        {token.note !== undefined && <span className="sg-swatch__value">{token.note}</span>}

        <div className="sg-badges">
          {token.nonText === true || isSurface ? (
            <span className="sg-badge sg-badge--info">
              {isSurface ? 'superfície' : 'não é texto'}
              {token.nonText === true && ` · ${formatRatio(vsBg.ratio)}:1`}
            </span>
          ) : (
            <>
              <span className={badgeClass(vsBg.level)}>
                {pairedName === undefined ? 'bg' : pairedName.replace('--color-', '')}{' '}
                {formatRatio(vsBg.ratio)} · {vsBg.level}
              </span>
              {pairedName === undefined && (
                <span className={badgeClass(vsSurface.level)}>
                  surface {formatRatio(vsSurface.ratio)} · {vsSurface.level}
                </span>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Mede o contraste de cada token em vez de confiar na tabela do plano — se alguém
 * ajustar uma cor em `tokens.css`, a reprovação aparece aqui na hora.
 */
export function ColorPanel() {
  const bg = readToken('--color-bg');
  const surface = readToken('--color-surface');

  const onAccent = readToken('--color-on-accent');
  const accent = readToken('--color-accent');
  const fg = readToken('--color-fg');

  const inkOnAccent = evaluateContrast(onAccent, accent);
  const fgOnAccent = evaluateContrast(fg, accent);

  return (
    <section className="sg-section" id="cor">
      <h2>Cor · contraste medido</h2>

      <div className="sg-stack">
        <div className="sg-scroll">
          <table className="sg-table">
            <caption className="sg-label" style={{ textAlign: 'left', paddingBottom: '0.5rem' }}>
              Par crítico: o que pode e o que não pode ir sobre o preenchimento âmbar
            </caption>
            <thead>
              <tr>
                <th>par</th>
                <th>razão</th>
                <th>veredito</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>--color-on-accent sobre --color-accent</td>
                <td>{formatRatio(inkOnAccent.ratio)}:1</td>
                <td>
                  <span className={badgeClass(inkOnAccent.level)}>{inkOnAccent.level}</span>
                </td>
              </tr>
              <tr>
                <td>--color-fg sobre --color-accent</td>
                <td>{formatRatio(fgOnAccent.ratio)}:1</td>
                <td>
                  <span className={badgeClass(fgOnAccent.level)}>
                    {fgOnAccent.level} — proibido
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="sg-grid">
          {COLOR_TOKENS.map((token) => (
            <Swatch key={token.name} token={token} bg={bg} surface={surface} />
          ))}
        </div>
      </div>
    </section>
  );
}
