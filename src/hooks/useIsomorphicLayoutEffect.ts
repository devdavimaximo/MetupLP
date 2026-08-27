import { useEffect, useLayoutEffect } from 'react';

/**
 * `useLayoutEffect` no cliente, `useEffect` no pré-render.
 *
 * O React emite warning ao rodar `useLayoutEffect` no servidor, e no SSG isso
 * apareceria em todo build. Medição de layout e `gsap.set()` inicial precisam
 * acontecer antes da pintura, então no cliente o layout effect é o correto.
 */
export const useIsomorphicLayoutEffect =
  typeof window === 'undefined' ? useEffect : useLayoutEffect;
