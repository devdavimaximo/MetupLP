import { useRef } from 'react';
import { HEADER_HOOK, headerMotion } from '../animations/header';
import { useMotion } from '../animations/useMotion';
import { cn } from '../lib/cn';
import { copy } from '../lib/content';
import { SECTION_ID } from '../lib/sections';
import { uiStrings } from '../lib/ui-strings';
import { Container } from './Container';
import { ContactCta } from './ContactCta';
import { Logo } from './Logo';
import { SiteNav } from './SiteNav';

const ANALYTICS_LOCATION = 'header';

/**
 * Header fixo da página.
 *
 * ─── AS TRÊS ZONAS ──────────────────────────────────────────────────────────────
 * Brasão · navegação · CTA, num grid de `1fr auto 1fr`. As colunas laterais iguais
 * são o que centraliza a navegação na VIEWPORT, e não no espaço que sobra entre dois
 * blocos de largura diferente — com `justify-between` a barra ficaria sempre um pouco
 * torta, do jeito que ninguém sabe apontar mas todo mundo sente.
 *
 * O mesmo grid serve o mobile sem uma segunda regra: com a navegação escondida, a
 * coluna do meio colapsa para zero e as duas laterais dividem a largura — brasão à
 * esquerda, CTA à direita, exatamente como era antes.
 *
 * ─── POR QUE NÃO EXISTE MENU HAMBÚRGUER ─────────────────────────────────────────
 * Decisão, não pendência. Abaixo de 768px o header carrega brasão e CTA, e mais nada.
 * Enfiar um hambúrguer ali significaria uma de duas coisas: espremer três controles
 * numa faixa onde eles não cabem (a conta de largura está em `styles/header.css`), ou
 * mandar o CTA para dentro do menu. A segunda quebra o §3 na frase mais literal dele
 * — "o CTA primário está sempre ao alcance" —, e a primeira quebra o §3 na prática,
 * porque um CTA espremido é um CTA que não se acerta com o polegar.
 *
 * E o que se perde é pouco: são três âncoras numa página única de rolagem contínua,
 * com um indicador de rolagem no herói e um CTA fechando cada seção. O menu resolveria
 * um problema de navegação que esta página não tem.
 *
 * ─── POR QUE FIXO, E POR QUE NÃO SOME AO ROLAR ──────────────────────────────────
 * É o §3 em forma de componente. Numa página única de rolagem longa, um header que
 * sai de cena leva o CTA junto — e quem decidiu falar com a Metup no meio dos cases
 * teria que rolar de volta para achá-lo. O padrão de "esconder ao descer, mostrar ao
 * subir" é elegante e é exatamente isso: esconder o CTA na metade do tempo.
 *
 * O fundo aparece só depois de 8px de rolagem (ver `animations/header.ts`): sobre o
 * herói ele flutua sem moldura, e a partir do momento em que conteúdo passa por baixo
 * ele ganha corpo para continuar legível.
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
      {/* ⚠ As colunas são declaradas EXPLICITAMENTE (`col-start-*`), e isso não é
          verbosidade. Abaixo de 768px o `<nav>` é `display: none` e sai do grid; sem
          posição explícita, o auto-placement joga o CTA na coluna do MEIO (`auto`), a
          coluna do brasão vira `1fr` de uma sobra pequena e o símbolo é espremido a
          zero. Medido em 390px antes da correção: o símbolo tinha 12px e o CTA
          flutuava a 70px da borda direita.

          `gap-x-0` no mobile também é medida: com o brasão completo e o CTA lado a
          lado sobram ~28px em 360px, e duas goteiras de grid comeriam 32px. A
          separação ali vem do `justify-self`, que é folga de verdade — a conta está
          em `styles/header.css`. */}
      <Container className="grid h-full grid-cols-[1fr_auto_1fr] items-center gap-x-0 md:gap-x-6">
        {/* Volta ao topo. Não é <h1>: o único <h1> da página é o título do herói.
            O nome acessível vem do `aria-label` e não do conteúdo porque abaixo de
            360px o wordmark sai da tela — ver a nota em `Logo.tsx`. */}
        <a
          href={`#${SECTION_ID.hero}`}
          aria-label={uiStrings.nav.brand}
          className="col-start-1 justify-self-start rounded-xs focus-visible:focus-ring"
          {...{ [HEADER_HOOK.brand]: true }}
        >
          <Logo />
        </a>

        {/* `self-stretch` não é cosmético: é o que dá ao <nav> a altura inteira do
            header, e é por isso que o filete dourado do indicador pousa exatamente
            sobre a costura de baixo em vez de flutuar no meio da barra. */}
        <SiteNav className="col-start-2 justify-self-center self-stretch" />

        {primaryCta.kind === 'text' && (
          <div className="col-start-3 justify-self-end" {...{ [HEADER_HOOK.cta]: true }}>
            <ContactCta
              label={primaryCta.value}
              size="sm"
              variant="secondary"
              analyticsLocation={ANALYTICS_LOCATION}
              className="whitespace-nowrap"
            />
          </div>
        )}
      </Container>
    </header>
  );
}
