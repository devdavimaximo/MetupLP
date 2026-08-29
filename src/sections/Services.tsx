import { useMemo, useRef } from 'react';
import { SERVICES_HOOK, servicesMotion } from '../animations/services';
import { useMotion } from '../animations/useMotion';
import { ContactCta, Heading, PendingContent, Section, Text } from '../components';
import { HeroParallax } from '../components/ui/hero-parallax';
import { cn } from '../lib/cn';
import { copy } from '../lib/content';
import { padIndex } from '../lib/format';
import { SECTION_ID } from '../lib/sections';
import { buildDeck } from '../lib/showcase';

const HEADING_ID = 'servicos-titulo';

export interface IndexRuleProps {
  readonly className?: string;
  /**
   * Atributo `data-*` que a timeline da seção usa para achar este filete.
   *
   * Existe porque o filete é do design system e o gancho de motion é da SEÇÃO: o
   * Processo reusa o mesmo desenho, mas quem o anima é `animations/process.ts`, com
   * o próprio ScrollTrigger. Sem esta prop, o filete de lá carregaria
   * `data-services-rule` e nenhuma das duas timelines o encontraria — ele ficaria
   * parado, e o defeito seria invisível no código.
   *
   * O padrão preserva o comportamento de Serviços, que não passa nada.
   */
  readonly motionHook?: string;
}

/**
 * Filete com o segmento dourado na cabeça.
 *
 * É um NÓ próprio, e não um `border-t`, porque só assim pode ser desenhado por
 * `scaleX` — ver o preset `drawLine`. O segmento dourado é o mesmo gesto do
 * `<Eyebrow>` e da faixa de serviços do herói.
 */
export function IndexRule({ className, motionHook = SERVICES_HOOK.rule }: IndexRuleProps) {
  return (
    <span
      aria-hidden
      {...{ [motionHook]: true }}
      className={cn('h-px origin-left bg-line', className)}
    >
      <span className="block h-full w-10 bg-accent" />
    </span>
  );
}

/**
 * Serviços — o que a Metup faz.
 *
 * ─── A TROCA (pedido do Davi) ───────────────────────────────────────────────────
 * O índice editorial de F3 (quatro linhas full-bleed) saiu inteiro; no lugar entra o
 * deck em parallax do Aceternity UI, com o cabeçalho editorial por cima e os painéis
 * correndo em perspectiva conforme a página rola. O componente adotado está isolado
 * em `components/ui/hero-parallax.tsx`, com a lista do que mudou nele.
 *
 * ─── O QUE **NÃO** MUDOU ────────────────────────────────────────────────────────
 *  · Toda a copy continua vindo de `content/copy.md` — título da seção, os quatro
 *    serviços com a frase de cada um, rótulo do CTA. Nada foi escrito em código (§4).
 *  · A seção continua terminando em ação: o `ContactCta` fecha o cabeçalho, ANTES do
 *    deck, então ele está visível no instante em que a seção entra na tela. O
 *    espetáculo fica embaixo; o CTA nunca depende de atravessar 300vh (§3).
 *  · A entrada do cabeçalho continua em GSAP (`servicesMotion`), com os mesmos ganchos
 *    `data-services-*` e o mesmo cleanup. O parallax é a única coisa em framer-motion.
 *
 * ─── OS PAINÉIS SÃO PLACEHOLDER, E ISSO É DELIBERADO ────────────────────────────
 * O deck pede 15 miniaturas e não existe screenshot real de projeto no repositório.
 * Em vez de stock/IA fingindo case — proibido pelo §5 —, cada painel é um bloco
 * geométrico do design system (`lib/showcase-placeholder.ts`), e os quatro serviços
 * se repetem em ciclo pelas posições sem arquivo. Está em `PENDENCIAS.md`.
 */
export function Services() {
  const ref = useRef<HTMLElement>(null);
  useMotion(ref, servicesMotion);

  const { sectionTitle, items } = copy.services;
  const { primaryCta } = copy.hero;

  /**
   * As posições do deck. Quem decide o que entra em cada uma é `lib/showcase.ts`
   * — inclusive o reenquadramento das pontas quando os screenshots reais chegarem.
   * Aqui só passam os rótulos de reserva: os quatro serviços, em ciclo, que são copy
   * do Davi. O deck é `aria-hidden` no componente, então a repetição é ilustração e
   * não conteúdo duplicado.
   */
  const deck = useMemo(() => buildDeck(items.map((service) => service.title)), [items]);

  return (
    <Section
      ref={ref}
      id={SECTION_ID.services}
      labelledBy={HEADING_ID}
      rhythm="flush"
      width="full"
    >
      <HeroParallax
        items={deck}
        header={
          <header
            {...{ [SERVICES_HOOK.block]: true }}
            className="relative mx-auto w-full max-w-content pt-section"
          >
            {sectionTitle.kind === 'text' ? (
              <Heading
                level={2}
                size="display"
                id={HEADING_ID}
                className="mt-6 max-w-narrow"
                {...{ [SERVICES_HOOK.fade]: true }}
              >
                {sectionTitle.value}
              </Heading>
            ) : (
              <PendingContent hint={sectionTitle.hint} />
            )}

            <IndexRule className="mt-block block w-full" />

            {/* Aqui vive o conteúdo ACESSÍVEL da seção: o deck ilustra, esta lista
                informa. `<ol>` porque a ordem é informação (é um índice), e
                `role="list"` devolve a semântica que o Safari descarta quando o
                marcador é removido. */}
            <ol role="list" className="mt-block grid gap-x-gutter gap-y-block md:grid-cols-2">
              {items.map((service, index) => (
                <li key={service.title} className="flex flex-col gap-3">
                  <div
                    {...{ [SERVICES_HOOK.cluster]: true }}
                    className="flex items-baseline gap-4"
                  >
                    <span aria-hidden className="font-mono text-label text-muted">
                      {padIndex(index + 1)}
                    </span>
                    <Heading level={3} size="title-sm">
                      {service.title}
                    </Heading>
                  </div>

                  <div {...{ [SERVICES_HOOK.body]: true }}>
                    {service.description.kind === 'text' ? (
                      <Text>{service.description.value}</Text>
                    ) : (
                      <PendingContent hint={service.description.hint} />
                    )}
                  </div>
                </li>
              ))}
            </ol>

            <div {...{ [SERVICES_HOOK.fade]: true }} className="mt-block">
              {primaryCta.kind === 'text' ? (
                <ContactCta label={primaryCta.value} />
              ) : (
                <PendingContent hint={primaryCta.hint} />
              )}
            </div>
          </header>
        }
      />
    </Section>
  );
}
