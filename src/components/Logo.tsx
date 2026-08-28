import { cn } from '../lib/cn';

export interface LogoProps {
  readonly className?: string;
}

/**
 * Wordmark da Metup — PLACEHOLDER DE IDENTIDADE.
 *
 * Não existe logo da Metup (`PENDENCIAS.md`); hoje o repositório tem só o favicon do
 * template Vite. Isto não é uma marca inventada passando por oficial: é um wordmark
 * tipográfico feito com a própria dupla de fontes do design system, para o header
 * não ficar sem âncora de marca enquanto a identidade real não chega. O §5 proíbe
 * forjar TRABALHO DE CLIENTE — desenho autoral da própria casa é o que ele permite.
 *
 * O caret dourado é o mesmo gesto do `Button variant="ghost"` e do token
 * `--animate-caret`: é a assinatura "Terminal Precision" aparecendo onde custa zero
 * em performance. Piscar fica atrás de `motion-safe:`, então some para quem pediu
 * movimento reduzido.
 *
 * TODO(PENDENCIAS.md): trocar pelo logo real quando o Davi enviar.
 */
export function Logo({ className }: LogoProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-[0.28em] font-display text-body-lg leading-none tracking-tight text-fg',
        className,
      )}
    >
      Metup
      <span
        aria-hidden
        className="block h-[0.72em] w-[0.13em] bg-accent motion-safe:animate-caret"
      />
    </span>
  );
}
