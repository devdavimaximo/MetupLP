import { useRef } from 'react';
import { headerMotion } from '../animations/header';
import { useMotion } from '../animations/useMotion';
import { cn } from '../lib/cn';
import { copy } from '../lib/content';
import { HERO_SECTION_ID } from '../lib/contact';
import { Container } from './Container';
import { ContactCta } from './ContactCta';
import { Logo } from './Logo';

const ANALYTICS_LOCATION = 'header';

/**
 * Header fixo da página.
 *
 * ─── O QUE ELE TEM, E O QUE NÃO TEM ─────────────────────────────────────────────
 * Wordmark e CTA. Só. Sem menu de âncoras e sem hambúrguer, porque em F2 as seções
 * que eles apontariam (serviços, cases, prova social) ainda não existem — e link
 * morto no header é pior do que header enxuto. A navegação entra em F3+ junto com
 * as seções que ela navega.
 *
 * ─── POR QUE FIXO ───────────────────────────────────────────────────────────────
 * É o §3 em forma de componente: "o CTA primário está sempre ao alcance". Numa
 * página única com rolagem longa, um header que sai de cena leva o CTA junto — e
 * quem decidiu falar com a Metup no meio dos cases teria que rolar de volta.
 *
 * O fundo aparece só depois de 8px de rolagem (ver `animations/header.ts`): sobre o
 * herói ele flutua sem moldura, e a partir do momento em que conteúdo passa por
 * baixo ele ganha corpo para continuar legível.
 */
export function Header() {
  const ref = useRef<HTMLElement>(null);
  useMotion(ref, headerMotion);

  const { primaryCta } = copy.hero;

  return (
    <header
      ref={ref}
      data-site-header
      className={cn(
        'fixed inset-x-0 top-0 z-header h-header',
        // O fundo mora num ::before e é animado por OPACIDADE. Alternar
        // `background-color` dispararia repaint da barra inteira a cada troca de
        // estado; opacidade fica no compositor. E nada de `backdrop-blur`: caro em
        // GPU durante a rolagem e é justamente o clichê de vidro que o §7 exclui.
        "before:absolute before:inset-0 before:-z-10 before:border-b before:border-line before:bg-bg/90 before:opacity-0 before:transition-opacity before:duration-fast before:ease-out before:content-['']",
        'data-[scrolled=true]:before:opacity-100',
      )}
    >
      <Container className="flex h-full items-center justify-between gap-4">
        {/* Volta ao topo. Não é <h1>: o único <h1> da página é o título do herói. */}
        <a
          href={`#${HERO_SECTION_ID}`}
          className="rounded-xs focus-visible:focus-ring"
        >
          <Logo />
        </a>

        {primaryCta.kind === 'text' && (
          <ContactCta
            label={primaryCta.value}
            size="sm"
            variant="secondary"
            analyticsLocation={ANALYTICS_LOCATION}
          />
        )}
      </Container>
    </header>
  );
}
