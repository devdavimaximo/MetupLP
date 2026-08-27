import type { ReactNode } from 'react';
import { cn } from '../lib/cn';

export type TextSize = 'lead' | 'body-lg' | 'body' | 'body-sm' | 'caption';
export type TextTone = 'fg' | 'fg-muted' | 'muted' | 'accent';

export interface TextProps {
  readonly size?: TextSize;
  readonly tone?: TextTone;
  readonly as?: 'p' | 'span' | 'div';
  /** `text-wrap: pretty` — evita viúva no fim do parágrafo. Ligado por padrão. */
  readonly pretty?: boolean;
  readonly className?: string;
  readonly children: ReactNode;
}

const SIZE: Record<TextSize, string> = {
  lead: 'text-lead',
  'body-lg': 'text-body-lg',
  body: 'text-body',
  'body-sm': 'text-body-sm',
  caption: 'text-caption',
};

/**
 * `fg-muted` (9.67:1) é o secundário PADRÃO, não `muted` (5.93:1).
 * `muted` passa AA mas não AAA — reserve para meta e rótulo, nunca para corpo
 * longo sobre superfície elevada.
 */
const TONE: Record<TextTone, string> = {
  fg: 'text-fg',
  'fg-muted': 'text-fg-muted',
  muted: 'text-muted',
  accent: 'text-accent',
};

export function Text({
  size = 'body',
  tone = 'fg-muted',
  as: Tag = 'p',
  pretty = true,
  className,
  children,
}: TextProps) {
  return (
    <Tag className={cn(SIZE[size], TONE[tone], pretty && 'text-pretty', className)}>
      {children}
    </Tag>
  );
}
