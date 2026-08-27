import type { ReactNode } from 'react';
import { cn } from '../lib/cn';

export type EyebrowAlign = 'start' | 'center';

export interface EyebrowProps {
  /** Marca o filete como enfeite puro para leitores de tela. */
  readonly decorative?: boolean;
  /**
   * `center` fecha o rótulo com um filete de CADA lado.
   *
   * Não é enfeite a mais: num bloco centralizado, o filete só à esquerda puxa a
   * linha para um lado e desalinha o eixo óptico do título logo abaixo. A simetria é
   * o que a composição centralizada do herói exige — e é por isso que a variante
   * mora aqui, e não numa classe avulsa na seção.
   */
  readonly align?: EyebrowAlign;
  readonly className?: string;
  readonly children: ReactNode;
}

const RULE = 'h-px w-6 shrink-0 bg-accent';

/**
 * Kicker acima do título — a assinatura visual da direção "Terminal Precision".
 *
 * Mono em caixa alta com tracking largo, ladeado por filete âmbar: lê como prompt de
 * terminal em vez de "label de seção" genérico. É um dos poucos lugares onde a
 * identidade aparece sem custar nada em performance ou a11y.
 */
export function Eyebrow({
  decorative = true,
  align = 'start',
  className,
  children,
}: EyebrowProps) {
  const hidden = decorative || undefined;

  return (
    <p
      className={cn(
        'flex items-center gap-3 font-mono text-label text-accent uppercase',
        align === 'center' && 'justify-center',
        className,
      )}
    >
      <span aria-hidden={hidden} className={RULE} />
      {children}
      {align === 'center' && <span aria-hidden={hidden} className={RULE} />}
    </p>
  );
}
