import { useState } from 'react';
import { findMotionDrift } from '../../animations/motion-sync';

/**
 * O "teste automatizado" possível sem test runner no projeto.
 *
 * Cobre o ponto exato onde um erro passaria despercebido: alguém ajusta uma curva
 * ou duração em `tokens.css`, o GSAP continua usando o valor antigo de `motion.ts`,
 * e nada quebra visivelmente — a animação em CSS e a em JS só ficam sutilmente
 * fora de sincronia para sempre.
 *
 * Teste negativo: mude `--ease-out` em tokens.css e este painel tem que ficar
 * vermelho (e o console reclamar no boot).
 */
export function TokenSyncPanel() {
  // Inicializador preguiçoso em vez de efeito: o styleguide é client-only (montado
  // por createRoot), o CSS já está aplicado quando o módulo executa, e ler aqui evita
  // o render em cascata que um setState dentro de efeito causaria.
  const [drift] = useState(() => findMotionDrift());

  return (
    <section className="sg-section" id="tokensync">
      <h2>TokenSync · CSS ↔ TypeScript</h2>

      {drift.length === 0 ? (
        <p className="sg-ok">
          ✓ tokens de motion em src/styles/tokens.css batem com src/animations/motion.ts
        </p>
      ) : (
        <div className="sg-alert">
          <p className="sg-label" style={{ color: 'var(--color-danger)', marginTop: 0 }}>
            {drift.length} token(s) divergindo — a fonte da verdade é motion.ts
          </p>
          <div className="sg-scroll">
            <table className="sg-table">
              <thead>
                <tr>
                  <th>token</th>
                  <th>em tokens.css</th>
                  <th>em motion.ts</th>
                </tr>
              </thead>
              <tbody>
                {drift.map((item) => (
                  <tr key={item.token}>
                    <td>{item.token}</td>
                    <td style={{ color: 'var(--color-danger)' }}>{item.css}</td>
                    <td style={{ color: 'var(--color-success)' }}>{item.ts}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  );
}
