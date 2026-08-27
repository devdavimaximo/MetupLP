import { uiStrings } from '../lib/ui-strings';

export interface SkipLinkProps {
  /** `id` do <main>. Precisa existir, senão o link não leva a lugar nenhum. */
  readonly targetId: string;
}

/**
 * Primeiro elemento focável do documento.
 *
 * Invisível até receber foco; ao tabular, aparece. Sem ele, quem navega por teclado
 * atravessa o header inteiro a cada carregamento — e numa página única com muita
 * animação isso é especialmente ruim.
 */
export function SkipLink({ targetId }: SkipLinkProps) {
  return (
    <a
      href={`#${targetId}`}
      className="sr-only z-skiplink rounded-xs bg-accent px-4 py-3 font-mono text-label text-on-accent uppercase focus-visible:not-sr-only focus-visible:fixed focus-visible:top-4 focus-visible:left-4 focus-visible:focus-ring"
    >
      {uiStrings.skipToContent}
    </a>
  );
}
