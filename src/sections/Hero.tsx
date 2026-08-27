import { useRef } from 'react';
import { HERO_HOOK, heroMotion } from '../animations/hero';
import { useMotion } from '../animations/useMotion';
import { ContactCta } from '../components/ContactCta';
import { Heading, PendingContent, Section, Text } from '../components';
import { HERO_SECTION_ID } from '../lib/contact';
import { copy } from '../lib/content';
import { HeroBackdrop } from './HeroBackdrop';

const HEADING_ID = 'hero-titulo';

/**
 * Primeira dobra.
 *
 * ─── COMPOSIÇÃO ─────────────────────────────────────────────────────────────────
 * Assimétrica e alinhada à esquerda, não centralizada: centralizar tudo é o default
 * de template que o §7 exclui. O título ocupa a coluna larga, a luz nasce atrás dele
 * no canto superior esquerdo, e a faixa de serviços fecha o bloco com uma linha
 * mono — a tensão entre a serifa quente da Fraunces e o rigor do IBM Plex Mono é a
 * direção "Terminal Precision" inteira em dois tipos.
 *
 * ─── A COPY É DO DAVI, TODA ─────────────────────────────────────────────────────
 * Cada string visível aqui vem de `content/copy.md`. Não há eyebrow, selo, slogan
 * de apoio nem "trusted by": inventar qualquer um deles violaria o §4, e por isso
 * o herói se sustenta em composição, não em texto extra. A faixa de serviços usa
 * `copy.services.items[].title` — copy real do Davi, não um resumo escrito aqui.
 *
 * ─── CTA ────────────────────────────────────────────────────────────────────────
 * Um só, âmbar, no maior contraste da tela, acima da dobra em qualquer viewport, e
 * entrando cedo na timeline. O destino vem de `lib/contact.ts` — ver lá por que ele
 * hoje aponta para `#contato` em vez do WhatsApp.
 */
export function Hero() {
  const ref = useRef<HTMLElement>(null);
  useMotion(ref, heroMotion);

  const { headline, subheadline, primaryCta } = copy.hero;

  return (
    <Section
      ref={ref}
      id={HERO_SECTION_ID}
      labelledBy={HEADING_ID}
      rhythm="flush"
      backdrop={<HeroBackdrop />}
      // `min-h-svh` e não `min-h-screen`: `100vh` no mobile mede a viewport SEM a
      // barra de endereço, então o herói nasce mais alto que a tela e o CTA cai
      // fora da dobra justamente onde a dobra é mais curta.
      className="flex min-h-svh items-center pt-header pb-block"
    >
      <div className="max-w-[64rem]">
        {headline.kind === 'text' ? (
          <Heading
            level={1}
            size="hero"
            id={HEADING_ID}
            // O SplitText mede linhas; `text-balance` reescreveria a quebra depois
            // da divisão e a máscara pararia de bater com o texto.
            balance={false}
            {...{ [HERO_HOOK.headline]: true }}
          >
            {headline.value}
          </Heading>
        ) : (
          <PendingContent hint={headline.hint} />
        )}

        <div {...{ [HERO_HOOK.reveal]: true }} className="mt-8 max-w-narrow">
          {subheadline.kind === 'text' ? (
            <Text size="lead">{subheadline.value}</Text>
          ) : (
            <PendingContent hint={subheadline.hint} />
          )}
        </div>

        <div {...{ [HERO_HOOK.reveal]: true }} className="mt-block">
          {primaryCta.kind === 'text' ? (
            <ContactCta label={primaryCta.value} size="lg" />
          ) : (
            <PendingContent hint={primaryCta.hint} />
          )}
        </div>

        {/* O que a Metup faz, em quatro palavras do próprio Davi. Sem separador de
            texto: o filete âmbar de cada item é o mesmo gesto do <Eyebrow>. */}
        <ul
          {...{ [HERO_HOOK.reveal]: true }}
          className="mt-block flex flex-wrap items-center gap-x-7 gap-y-3 border-t border-line pt-7"
        >
          {copy.services.items.map((service) => (
            <li
              key={service.title}
              className="flex items-center gap-2.5 font-mono text-label text-fg-muted uppercase"
            >
              <span aria-hidden className="h-px w-3 shrink-0 bg-accent" />
              {service.title}
            </li>
          ))}
        </ul>

        {/* Indicador de rolagem: puro sinal gráfico, sem texto. Um rótulo aqui seria
            copy inventada; a forma já diz que a página continua. */}
        <div
          aria-hidden
          {...{ [HERO_HOOK.reveal]: true }}
          className="mt-block h-14 w-px overflow-hidden bg-line"
        >
          <span className="block h-full w-full origin-top bg-accent motion-safe:animate-scroll-cue" />
        </div>
      </div>
    </Section>
  );
}
