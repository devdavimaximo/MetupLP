import { useCallback, useRef, useState } from 'react';

export interface UseInViewOptions {
  readonly rootMargin?: string;
  readonly threshold?: number;
  /** Para de observar após a primeira entrada. Padrão: true. */
  readonly once?: boolean;
  readonly disabled?: boolean;
}

export interface UseInViewResult<T extends Element> {
  readonly ref: (node: T | null) => void;
  readonly inView: boolean;
}

/**
 * Observa a entrada de um elemento na viewport.
 *
 * FRONTEIRA IMPORTANTE: este hook serve para MONTAR COISA CARA sob demanda — uma
 * cena r3f, um iframe, uma imagem pesada. Ele NÃO serve para animar.
 *
 * Animação disparada por scroll é ScrollTrigger (ver `useMotion`). Animar por
 * estado do React significa re-renderizar a árvore a cada quadro, o que derruba os
 * 60fps exigidos pelo CLAUDE.md §6.2. Sem esta regra escrita, é o erro natural de
 * quem for montar as seções em F2.
 */
export function useInView<T extends Element>(options: UseInViewOptions = {}): UseInViewResult<T> {
  const { rootMargin = '0px', threshold = 0, once = true, disabled = false } = options;

  const [inView, setInView] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const ref = useCallback(
    (node: T | null): void => {
      observerRef.current?.disconnect();
      observerRef.current = null;

      if (node === null || disabled || typeof IntersectionObserver === 'undefined') return;

      const observer = new IntersectionObserver(
        (entries) => {
          const entry = entries[0];
          if (entry === undefined) return;

          setInView(entry.isIntersecting);
          if (entry.isIntersecting && once) {
            observer.disconnect();
            observerRef.current = null;
          }
        },
        { rootMargin, threshold },
      );

      observer.observe(node);
      observerRef.current = observer;
    },
    [rootMargin, threshold, once, disabled],
  );

  return { ref, inView };
}
