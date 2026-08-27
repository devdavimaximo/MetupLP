import { contactTarget } from '../lib/contact';
import { Button, type ButtonSize } from './Button';
import { ArrowDownIcon, ArrowUpRightIcon } from './icons';

export interface ContactCtaProps {
  /**
   * Rótulo do CTA, já ESTREITADO pela seção a partir de `content/copy.md`.
   *
   * `string` e não `CopyField` de propósito: quem decide o que fazer quando a copy é
   * placeholder é a seção, que conhece o contexto. Se este componente aceitasse o
   * campo bruto, ele teria que escolher entre renderizar um botão sem rótulo ou
   * inventar um — e as duas saídas quebram o §4.
   */
  readonly label: string;
  readonly size?: ButtonSize;
  readonly variant?: 'primary' | 'secondary';
  /** Só onde não há <Section> em volta (ex.: o header). */
  readonly analyticsLocation?: string;
  readonly className?: string;
}

/**
 * O CTA de conversão da página — o único lugar que sabe para onde ele vai.
 *
 * Herói e header renderizam ESTE componente, não um `Button` cada um. A diferença
 * importa no dia em que o número de WhatsApp chegar: uma troca em `lib/contact.ts` e
 * todos os CTAs mudam de destino, de evento de analytics, de `target` e de ícone ao
 * mesmo tempo. Espalhar `href` por seção é como um CTA fica para trás numa migração
 * — e um CTA para trás é um lead perdido (§3).
 *
 * O ícone é derivado do destino, não escolhido à mão: seta para baixo quando o
 * clique rola a própria página, seta para fora quando ele sai do site.
 */
export function ContactCta({
  label,
  size = 'md',
  variant = 'primary',
  analyticsLocation,
  className,
}: ContactCtaProps) {
  const Icon = contactTarget.kind === 'whatsapp' ? ArrowUpRightIcon : ArrowDownIcon;

  return (
    <Button
      as="a"
      href={contactTarget.href}
      variant={variant}
      size={size}
      analyticsId={contactTarget.analyticsId}
      analyticsLocation={analyticsLocation}
      target={contactTarget.isExternal ? '_blank' : undefined}
      className={className}
      iconRight={<Icon className="shrink-0" />}
    >
      {label}
    </Button>
  );
}
