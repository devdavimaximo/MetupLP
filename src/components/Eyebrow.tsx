import type { ReactNode } from 'react';
import { cn } from '../lib/cn';

export interface EyebrowProps {
  /** Marca o filete como enfeite puro para leitores de tela. */
  readonly decorative?: boolean;
  readonly className?: string;
  readonly children: ReactNode;
}

/**
 * Kicker acima do título — a assinatura visual da direção "Terminal Precision".
 *
 * Mono em caixa alta com tracking largo, precedido de um filete âmbar curto: lê
 * como prompt de terminal em vez de "label de seção" genérico. É um dos poucos
 * lugares onde a identidade aparece sem custar nada em performance ou a11y.
 */
export function Eyebrow({ decorative = true, className, children }: EyebrowProps) {
  return (
    <p className={cn('flex items-center gap-3 font-mono text-label text-accent uppercase', className)}>
      <span
        aria-hidden={decorative || undefined}
        className="h-px w-6 shrink-0 bg-accent"
      />
      {children}
    </p>
  );
}
