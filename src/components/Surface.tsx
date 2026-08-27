import type { ReactNode } from 'react';
import { cn } from '../lib/cn';

export type SurfaceElevation = 'flat' | 'raised' | 'panel';
export type SurfaceBorder = 'none' | 'hairline' | 'strong';
export type SurfaceGlow = 'none' | 'accent' | 'accent-2';

export interface SurfaceProps {
  readonly elevation?: SurfaceElevation;
  readonly border?: SurfaceBorder;
  readonly glow?: SurfaceGlow;
  /** Card clicável/focável: força borda legível e anel de foco. */
  readonly interactive?: boolean;
  readonly as?: 'div' | 'article' | 'li' | 'aside';
  readonly className?: string;
  readonly children: ReactNode;
}

const ELEVATION: Record<SurfaceElevation, string> = {
  flat: 'bg-surface',
  raised: 'bg-surface-raised shadow-raised',
  panel: 'bg-surface-raised shadow-panel',
};

const BORDER: Record<SurfaceBorder, string> = {
  none: '',
  hairline: 'border border-line',
  strong: 'border border-line-strong',
};

const GLOW: Record<SurfaceGlow, string> = {
  none: '',
  accent: 'shadow-glow-accent',
  'accent-2': 'shadow-glow-accent-2',
};

/**
 * Painel/card do sistema.
 *
 * `interactive` FORÇA `border="strong"`: `--color-line` tem 1.26:1 contra o fundo e
 * reprovaria a WCAG 1.4.11 como único indicador de um elemento acionável. Deixar
 * isso a cargo de quem monta a seção seria confiar em disciplina onde dá para
 * confiar no componente.
 */
export function Surface({
  elevation = 'flat',
  border = 'hairline',
  glow = 'none',
  interactive = false,
  as: Tag = 'div',
  className,
  children,
}: SurfaceProps) {
  const effectiveBorder: SurfaceBorder = interactive ? 'strong' : border;

  return (
    <Tag
      className={cn(
        'rounded-sm',
        ELEVATION[elevation],
        BORDER[effectiveBorder],
        GLOW[glow],
        interactive &&
          'transition-colors duration-fast ease-out hover:border-accent focus-visible:focus-ring',
        className,
      )}
    >
      {children}
    </Tag>
  );
}
