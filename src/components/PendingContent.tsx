import { uiStrings } from '../lib/ui-strings';

export interface PendingContentProps {
  /** O miolo do marcador `[ ... ]` vindo de content/copy.md. */
  readonly hint: string;
}

/**
 * Renderiza um placeholder de `content/copy.md` — e em produção renderiza NADA.
 *
 * É a regra §4 do CLAUDE.md operacionalizada: onde falta case, número, depoimento
 * ou logo real, a LP não publica texto entre colchetes nem inventa conteúdo para
 * preencher o buraco. Some silenciosamente do HTML e fica visível só para quem está
 * desenvolvendo, junto da dica do que o Davi ainda precisa enviar.
 */
export function PendingContent({ hint }: PendingContentProps) {
  if (!import.meta.env.DEV) return null;

  return (
    <div
      role="note"
      className="rounded-sm border border-dashed border-accent/60 bg-surface p-4"
    >
      <p className="font-mono text-label text-accent uppercase">{uiStrings.pendingContent}</p>
      <p className="mt-2 text-body-sm text-fg-muted">{hint}</p>
    </div>
  );
}
