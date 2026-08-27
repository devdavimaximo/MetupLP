import type { ComponentPropsWithRef, ElementType, MouseEvent, ReactNode } from 'react';
import { trackConversion, type ConversionEventName } from '../lib/analytics';
import { cn } from '../lib/cn';
import { uiStrings } from '../lib/ui-strings';
import { useSectionId } from './section-context';
import { VisuallyHidden } from './VisuallyHidden';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'link';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonBase {
  readonly size?: ButtonSize;
  readonly fullWidth?: boolean;
  readonly iconRight?: ReactNode;
  /** Estado visual; o comportamento real de envio chega em F6. */
  readonly isLoading?: boolean;
  /** Sobrescreve o `id` da <Section> herdado via contexto. */
  readonly analyticsLocation?: string;
  readonly className?: string;
  readonly children: ReactNode;
}

/**
 * CTA de conversão: `analyticsId` é OBRIGATÓRIO.
 *
 * É o CLAUDE.md §3 ("Instrumente a conversão… sem isso, a LP é cega") aplicado pelo
 * compilador: não existe caminho de código que embarque um CTA primário sem
 * telemetria. Um lead perdido por botão não instrumentado não aparece em code review.
 */
interface ConvertingOwn extends ButtonBase {
  readonly variant?: 'primary' | 'secondary';
  readonly analyticsId: ConversionEventName;
}

/** Ações neutras (voltar ao topo, link de rodapé) não precisam de evento. */
interface NeutralOwn extends ButtonBase {
  readonly variant: 'ghost' | 'link';
  readonly analyticsId?: ConversionEventName;
}

type OwnKeys = keyof ConvertingOwn | keyof NeutralOwn;

type Polymorphic<Own, Element extends ElementType, Extra> = Own &
  Extra &
  Omit<ComponentPropsWithRef<Element>, OwnKeys | keyof Extra>;

/**
 * União discriminada em vez de genérico `<C extends ElementType>`: `erasableSyntaxOnly`
 * está ligado, a união é 100% apagável, e o erro que o TypeScript emite é legível —
 * genéricos polimórficos produzem mensagens que ninguém consegue depurar.
 */
export type ButtonProps =
  | Polymorphic<ConvertingOwn, 'button', { as?: 'button' }>
  | Polymorphic<NeutralOwn, 'button', { as?: 'button' }>
  | Polymorphic<ConvertingOwn, 'a', { as: 'a'; href: string }>
  | Polymorphic<NeutralOwn, 'a', { as: 'a'; href: string }>;

/**
 * Base comum. `hover:` no Tailwind v4 já compila para `@media (hover: hover)`,
 * então nenhum estado de hover gruda em toque — requisito de QA em device real.
 *
 * `before:` carrega o brilho e é animado por OPACIDADE, nunca por `box-shadow`:
 * animar sombra força repaint a cada quadro e derruba os 60fps do §6.4.
 */
const BASE = cn(
  'relative isolate inline-flex items-center justify-center gap-2',
  'font-mono text-label uppercase',
  'rounded-xs cursor-pointer',
  'transition-colors duration-fast ease-out',
  'focus-visible:focus-ring',
  'disabled:cursor-not-allowed disabled:opacity-50',
  "before:pointer-events-none before:absolute before:inset-0 before:-z-10 before:rounded-[inherit] before:opacity-0 before:transition-opacity before:duration-fast before:ease-out before:content-['']",
);

const VARIANT: Record<ButtonVariant, string> = {
  // Tinta escura sobre âmbar não é escolha estética: texto claro sobre #ff8a1f dá
  // 2.07:1 e reprova. `text-on-accent` existe para tirar essa decisão do caminho.
  primary: cn(
    'bg-accent text-on-accent inset-shadow-hairline',
    'hover:bg-accent-hover active:bg-accent-active',
    'hover:before:opacity-100 before:shadow-glow-accent',
  ),
  secondary: cn(
    'bg-surface-raised text-fg border border-line-strong',
    'hover:border-accent hover:text-accent',
    'hover:before:opacity-100 before:shadow-glow-accent',
  ),
  ghost: 'bg-transparent text-fg-muted hover:text-accent',
  link: 'bg-transparent text-accent underline decoration-line-strong underline-offset-4 hover:decoration-accent',
};

/** `sm` mantém 44px de altura mínima: WCAG 2.5.8 (alvo de toque). */
const SIZE: Record<ButtonSize, string> = {
  sm: 'min-h-11 px-4 py-2',
  md: 'min-h-12 px-6 py-3',
  lg: 'min-h-14 px-8 py-4',
};

export function Button(props: ButtonProps) {
  const {
    variant = 'primary',
    size = 'md',
    fullWidth = false,
    iconRight,
    isLoading = false,
    analyticsId,
    analyticsLocation,
    className,
    children,
    ...rest
  } = props;

  const sectionId = useSectionId();
  const location = analyticsLocation ?? sectionId;

  const classes = cn(
    BASE,
    VARIANT[variant],
    variant === 'link' ? '' : SIZE[size],
    fullWidth && 'w-full',
    className,
  );

  const label = typeof children === 'string' ? children : undefined;

  const handleClick = (event: MouseEvent<HTMLElement>): void => {
    if (analyticsId !== undefined) {
      trackConversion(analyticsId, { location, label, variant });
    }
    (rest as { onClick?: (e: MouseEvent<HTMLElement>) => void }).onClick?.(event);
  };

  const content = (
    <>
      {/* Caret de terminal: o gesto da identidade, só onde não compete com o CTA. */}
      {variant === 'ghost' && (
        <span aria-hidden className="text-accent motion-safe:animate-caret">
          ▸
        </span>
      )}
      {children}
      {iconRight}
      {isLoading && <VisuallyHidden>{uiStrings.loading}</VisuallyHidden>}
    </>
  );

  if (rest.as === 'a') {
    const { as: _as, target, rel, ...anchorProps } = rest;
    const external = target === '_blank';

    return (
      <a
        {...anchorProps}
        target={target}
        // Aba nova sem `noopener` dá à página de destino acesso a `window.opener`.
        rel={external ? (rel ?? 'noopener noreferrer') : rel}
        className={classes}
        onClick={handleClick}
      >
        {content}
        {external && <VisuallyHidden>{uiStrings.opensInNewTab}</VisuallyHidden>}
      </a>
    );
  }

  const { as: _as, type, ...buttonProps } = rest;

  return (
    <button
      {...buttonProps}
      // Sem isto, um botão dentro do formulário de F6 envia o form sem querer.
      type={type ?? 'button'}
      className={classes}
      onClick={handleClick}
    >
      {content}
    </button>
  );
}
