import type { ReactNode } from 'react';
import { cn } from '../lib/cn';

export type ContainerWidth = 'narrow' | 'content' | 'wide' | 'full';

export interface ContainerProps {
  readonly width?: ContainerWidth;
  readonly as?: 'div' | 'header' | 'footer' | 'nav';
  readonly className?: string;
  readonly children: ReactNode;
}

const WIDTH: Record<ContainerWidth, string> = {
  narrow: 'max-w-narrow',
  content: 'max-w-content',
  wide: 'max-w-wide',
  full: 'max-w-none',
};

/**
 * Medida e goteira da página.
 *
 * `px-gutter` é o ÚNICO padding lateral permitido no projeto — se cada seção
 * inventasse o seu, o alinhamento vertical entre elas quebraria no meio do scroll,
 * que é o tipo de detalhe que separa "premiado" de "template".
 */
export function Container({
  width = 'content',
  as: Tag = 'div',
  className,
  children,
}: ContainerProps) {
  return (
    <Tag className={cn('mx-auto w-full px-gutter', WIDTH[width], className)}>{children}</Tag>
  );
}
