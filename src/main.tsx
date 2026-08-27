import { ViteReactSSG } from 'vite-react-ssg';
import { App } from './app/App';
// Entrada CSS única — ver o comentário em styles/index.css antes de dividir isto.
import './styles/index.css';
/**
 * Import de EFEITO COLATERAL: avalia content/copy.md durante o build e derruba o
 * `vite-react-ssg build` se faltar chave, em vez de publicar uma seção vazia.
 * Enquanto nenhuma seção importa `copy` (F1), esta linha é o que impede o Rollup de
 * remover o módulo. Sai naturalmente em F2, quando as seções passarem a usá-lo.
 */
import './lib/content';

if (import.meta.env.DEV) {
  void import('./animations/motion-sync').then((module) => {
    module.reportMotionDrift();
  });
}

export const createRoot = ViteReactSSG({
  routes: [{ path: '/', Component: App }],
});
