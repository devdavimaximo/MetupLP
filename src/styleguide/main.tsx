import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Styleguide } from './Styleguide';
// Mesmo CSS do site: o styleguide precisa ver EXATAMENTE os tokens de produção.
import '../styles/index.css';
// Chrome próprio, em CSS puro (ver o comentário no topo do arquivo).
import './styleguide.css';

if (!import.meta.env.DEV) {
  throw new Error(
    '[styleguide] é ferramenta de desenvolvimento e não deve ser servida em produção.',
  );
}

const container = document.getElementById('root');

if (container === null) {
  throw new Error('[styleguide] elemento #root não encontrado em styleguide.html');
}

createRoot(container).render(
  <StrictMode>
    <Styleguide />
  </StrictMode>,
);
