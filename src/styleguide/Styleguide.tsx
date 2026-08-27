import { ColorPanel } from './panels/ColorPanel';
import { ComponentsPanel } from './panels/ComponentsPanel';
import { CopyPanel } from './panels/CopyPanel';
import { MotionPanel } from './panels/MotionPanel';
import { SpacePanel } from './panels/SpacePanel';
import { TokenSyncPanel } from './panels/TokenSyncPanel';
import { TypePanel } from './panels/TypePanel';

const NAV: readonly { href: string; label: string }[] = [
  { href: '#tokensync', label: 'tokensync' },
  { href: '#cor', label: 'cor' },
  { href: '#tipografia', label: 'tipografia' },
  { href: '#espaco', label: 'espaço' },
  { href: '#componentes', label: 'componentes' },
  { href: '#motion', label: 'motion' },
  { href: '#copy', label: 'copy' },
];

export function Styleguide() {
  return (
    <div className="sg-body">
      <div className="sg-shell">
        <header className="sg-header">
          <p className="sg-kicker">Metup · F1 — Design System &amp; Identidade</p>
          <h1 className="sg-title">Styleguide</h1>
          <p className="sg-note">
            Ferramenta de desenvolvimento — entrada HTML separada, nunca entra no build de
            produção. Serve para validar o sistema antes de existir qualquer seção da página:
            contraste medido, escala fluida ao vivo, componentes em todos os estados e as duas
            variantes de motion.
          </p>
          <nav>
            <ul className="sg-nav">
              {NAV.map((item) => (
                <li key={item.href}>
                  <a href={item.href}>{item.label}</a>
                </li>
              ))}
            </ul>
          </nav>
        </header>

        <TokenSyncPanel />
        <ColorPanel />
        <TypePanel />
        <SpacePanel />
        <ComponentsPanel />
        <MotionPanel />
        <CopyPanel />
      </div>
    </div>
  );
}
