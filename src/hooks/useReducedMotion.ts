import { useSyncExternalStore } from 'react';

const QUERY = '(prefers-reduced-motion: reduce)';

function subscribe(onChange: () => void): () => void {
  const query = window.matchMedia(QUERY);
  query.addEventListener('change', onChange);
  return () => {
    query.removeEventListener('change', onChange);
  };
}

function getSnapshot(): boolean {
  return window.matchMedia(QUERY).matches;
}

/**
 * Falso no pré-render: nenhuma animação roda antes do mount, então o HTML gerado é
 * idêntico nos dois casos. Retornar `true` faria quem NÃO pediu redução ver um
 * flash da variante calma logo após a hidratação.
 */
function getServerSnapshot(): boolean {
  return false;
}

/**
 * Preferência de movimento reduzido, reativa em runtime.
 *
 * `useSyncExternalStore` é o mecanismo certo aqui: nunca toca em `window` durante o
 * pré-render (o React chama `getServerSnapshot` no servidor), não gera mismatch de
 * hidratação, e acompanha a mudança da preferência sem boilerplate.
 *
 * REGRA: este hook NUNCA decide markup inicial — só comportamento pós-mount. Para
 * animação de verdade, use `useMotion`/`gsap.matchMedia()`, que já reage sozinho e
 * mantém a variante calma junto da completa.
 */
export function useReducedMotion(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
