import { useMemo, type ReactNode, type Ref } from 'react';
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
  /**
   * Escopo do `useMotion` da seção. Sem isto, quem anima precisaria de um <div>
   * extra por dentro e os seletores do GSAP não alcançariam o backdrop.
   */
  readonly ref?: Ref<HTMLElement>;
  /**
   * Camada decorativa FULL-BLEED, atrás do conteúdo e fora do `Container`.
   *
   * Existe porque atmosfera não respeita medida de leitura: a malha e a luz do
   * herói vão de borda a borda enquanto o texto continua dentro dos 72rem. Sem
   * este ponto de extensão, a seção precisaria inventar o próprio padding lateral
   * para acomodar o backdrop — exatamente o que o §12 proíbe.
   */
  readonly backdrop?: ReactNode;
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
 *  - `scroll-mt-anchor` impede que a âncora pare debaixo do header fixo — é o que
 *    faz o CTA do herói entregar a seção de contato inteira, e não cortada;
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
  ref,
  backdrop,
  className,
  children,
}: SectionProps) {
  const value = useMemo<SectionContextValue>(() => ({ id }), [id]);

  return (
    <SectionContext value={value}>
      <section
        ref={ref}
        id={id}
        data-section={id}
        aria-labelledby={labelledBy}
        aria-label={labelledBy === undefined ? ariaLabel : undefined}
        className={cn(
          'scroll-mt-anchor',
          // `isolate` prende o backdrop (-z-10) ao contexto de empilhamento da
          // seção: sem isso ele afundaria atrás do fundo da PÁGINA e sumiria.
          backdrop !== undefined && 'relative isolate',
          RHYTHM[rhythm],
          TONE[tone],
          className,
        )}
      >
        {backdrop}
        <Container width={width}>{children}</Container>
      </section>
    </SectionContext>
  );
}
