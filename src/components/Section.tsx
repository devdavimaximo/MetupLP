import { useMemo, type ReactNode } from 'react';
import { cn } from '../lib/cn';
import { Container, type ContainerWidth } from './Container';
import { SectionContext, type SectionContextValue } from './section-context';

export type SectionRhythm = 'default' | 'lg' | 'flush';
export type SectionTone = 'base' | 'surface';

export interface SectionProps {
  /** Âncora de navegação, `location` de analytics e alvo de ScrollTrigger. */
  readonly id: string;
  /** `id` do heading que nomeia a seção — preferível a `ariaLabel`. */
  readonly labelledBy?: string;
  /** Só quando não existe heading visível para referenciar. */
  readonly ariaLabel?: string;
  readonly rhythm?: SectionRhythm;
  readonly tone?: SectionTone;
  readonly width?: ContainerWidth;
  readonly className?: string;
  readonly children: ReactNode;
}

const RHYTHM: Record<SectionRhythm, string> = {
  default: 'py-section',
  lg: 'py-section-lg',
  flush: 'py-0',
};

const TONE: Record<SectionTone, string> = {
  base: 'bg-bg',
  surface: 'bg-surface',
};

/**
 * Bloco estrutural da página.
 *
 * Além do ritmo vertical, faz três coisas que evitam retrabalho em F2+:
 *  - `data-section` é o gancho estável de ScrollTrigger (classes de Tailwind mudam
 *    com o design; este atributo não);
 *  - `scroll-mt` impede que a âncora pare debaixo de um header fixo;
 *  - provê o `SectionContext`, para que todo CTA dentro dela reporte o `location`
 *    correto sem ninguém digitar isso de novo em cada botão.
 */
export function Section({
  id,
  labelledBy,
  ariaLabel,
  rhythm = 'default',
  tone = 'base',
  width = 'content',
  className,
  children,
}: SectionProps) {
  const value = useMemo<SectionContextValue>(() => ({ id }), [id]);

  return (
    <SectionContext value={value}>
      <section
        id={id}
        data-section={id}
        aria-labelledby={labelledBy}
        aria-label={labelledBy === undefined ? ariaLabel : undefined}
        className={cn('scroll-mt-block', RHYTHM[rhythm], TONE[tone], className)}
      >
        <Container width={width}>{children}</Container>
      </section>
    </SectionContext>
  );
}
