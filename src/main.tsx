import { ViteReactSSG } from 'vite-react-ssg';
import { App } from './app/App';
import './styles/fonts.css';
import './styles/tokens.css';
import './styles/base.css';

export const createRoot = ViteReactSSG({
  routes: [{ path: '/', Component: App }],
});
