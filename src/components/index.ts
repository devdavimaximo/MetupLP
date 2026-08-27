/**
 * Superfície pública dos componentes base do design system.
 *
 * F1 — primitivas (Button, Container, Heading, Text, Surface…).
 * F2 — chrome da página: `Header`, `Logo`, `ContactCta` e os ícones inline.
 */

export { Button, type ButtonProps, type ButtonSize, type ButtonVariant } from './Button';
export { ContactCta, type ContactCtaProps } from './ContactCta';
export { Container, type ContainerProps, type ContainerWidth } from './Container';
export { Eyebrow, type EyebrowProps } from './Eyebrow';
export { Header } from './Header';
export { Heading, type HeadingLevel, type HeadingProps, type HeadingSize } from './Heading';
export { ArrowDownIcon, ArrowUpRightIcon, type IconProps } from './icons';
export { Logo, type LogoProps } from './Logo';
export { PendingContent, type PendingContentProps } from './PendingContent';
export { Section, type SectionProps, type SectionRhythm, type SectionTone } from './Section';
export { SkipLink, type SkipLinkProps } from './SkipLink';
export { Surface, type SurfaceElevation, type SurfaceProps } from './Surface';
export { Text, type TextProps, type TextSize, type TextTone } from './Text';
export { VisuallyHidden, type VisuallyHiddenProps } from './VisuallyHidden';
export { SectionContext, useSectionId, type SectionContextValue } from './section-context';
