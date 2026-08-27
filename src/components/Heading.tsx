import type { ReactNode } from 'react';
import { cn } from '../lib/cn';

export type HeadingLevel = 1 | 2 | 3 | 4;
export type HeadingSize = 'hero' | 'display' | 'display-sm' | 'title' | 'title-sm';
export type HeadingTone = 'fg' | 'accent' | 'muted';

/**
 * Ganchos `data-*` de motion, e SÓ eles.
 *
 * O `<h1>` do herói precisa ser alcançável pelo SplitText, e o gancho tem que ficar
 * no próprio elemento de texto — num wrapper, o SplitText dividiria a caixa em volta
 * do título em vez das linhas dele. Abrir a API para `ComponentProps<'h1'>` inteiro
 * resolveria e traria junto `style`, `onClick` e todo o resto: em pouco tempo alguém
 * passa `className="text-[40px]"` por fora do sistema. A chave template-literal
 * deixa passar exatamente o que motion precisa e nada mais.
 */
type MotionHooks = Readonly<Record<`data-${string}`, string | boolean | undefined>>;

export interface HeadingProps extends MotionHooks {
  /** Nível SEMÂNTICO: vira <h1>…<h4>. Só um <h1> na página inteira (§6.3). */
  readonly level: HeadingLevel;
  /** Tamanho VISUAL, independente do nível. */
  readonly size?: HeadingSize;
  readonly tone?: HeadingTone;
  /** `text-wrap: balance` — evita viúva na última linha. Ligado por padrão. */
  readonly balance?: boolean;
  readonly id?: string;
  readonly className?: string;
  readonly children: ReactNode;
}

const SIZE: Record<HeadingSize, string> = {
  hero: 'text-hero',
  display: 'text-display',
  'display-sm': 'text-display-sm',
  title: 'text-title',
  'title-sm': 'text-title-sm',
};

const TONE: Record<HeadingTone, string> = {
  fg: 'text-fg',
  accent: 'text-accent',
  muted: 'text-fg-muted',
};

/**
 * Título da página.
 *
 * `level` e `size` são props SEPARADAS de propósito. Acoplá-las é o erro que
 * distorce a hierarquia de SEO em toda LP: alguém precisa de um título visualmente
 * menor, usa <h3> no lugar de <h2>, e a estrutura do documento passa a mentir sobre
 * o conteúdo. Aqui a semântica é escolhida pelo conteúdo e o tamanho pelo design.
 */
export function Heading({
  level,
  size = 'title',
  tone = 'fg',
  balance = true,
  id,
  className,
  children,
  ...motionHooks
}: HeadingProps) {
  const Tag = `h${String(level)}` as 'h1' | 'h2' | 'h3' | 'h4';

  return (
    <Tag
      {...motionHooks}
      id={id}
      className={cn('font-display', SIZE[size], TONE[tone], balance ? 'text-balance' : 'text-wrap', className)}
    >
      {children}
    </Tag>
  );
}
