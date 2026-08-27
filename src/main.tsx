import { ViteReactSSG } from 'vite-react-ssg';
import { App } from './app/App';
// Entrada CSS única — ver o comentário em styles/index.css antes de dividir isto.
import './styles/index.css';
/**
 * O import de efeito colateral de `./lib/content` saiu aqui em F2, como previsto: o
 * herói, o header e a âncora de contato importam `copy` de verdade, então o módulo
 * é avaliado no build por uso real e continua derrubando o `vite-react-ssg build`
 * se `content/copy.md` perder uma chave.
 */

if (import.meta.env.DEV) {
  void import('./animations/motion-sync').then((module) => {
    module.reportMotionDrift();
  });
}

export const createRoot = ViteReactSSG({
  routes: [{ path: '/', Component: App }],
});
