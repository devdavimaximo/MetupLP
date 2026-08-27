import type { ReactNode } from 'react';

export interface VisuallyHiddenProps {
  readonly as?: 'span' | 'div';
  readonly children: ReactNode;
}

/**
 * Some da tela, permanece para leitor de tela.
 *
 * `sr-only` do Tailwind e não `display: none`/`visibility: hidden` — estes dois
 * removem o conteúdo da árvore de acessibilidade também, que é o oposto do objetivo.
 */
export function VisuallyHidden({ as: Tag = 'span', children }: VisuallyHiddenProps) {
  return <Tag className="sr-only">{children}</Tag>;
}
