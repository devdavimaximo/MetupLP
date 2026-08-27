import { useRef } from 'react';
import { SERVICES_HOOK, servicesMotion } from '../animations/services';
import { useMotion } from '../animations/useMotion';
import { ContactCta, Eyebrow, Heading, PendingContent, Section } from '../components';
import { copy } from '../lib/content';
import { padIndex } from '../lib/format';
import { IndexRule, ServiceRow } from './ServiceRow';

/** `id` da âncora. É para cá que o menu do header vai apontar em F5. */
export const SERVICES_SECTION_ID = 'servicos';

const HEADING_ID = 'servicos-titulo';

/**
 * Serviços — o que a Metup faz, em linguagem de cliente.
 *
 * ─── O PROBLEMA QUE ESTA SEÇÃO RESOLVE ──────────────────────────────────────────
 * O herói JÁ lista os quatro títulos numa faixa mono. Repeti-los em cards maiores
 * seria redundância, não seção. O que F3 acrescenta é a `description` de cada item —
 * uma frase por serviço, que é o que existe de copy real (§4). O formato foi
 * escolhido a partir dessa restrição, não apesar dela.
 *
 * ─── ÍNDICE EDITORIAL ───────────────────────────────────────────────────────────
 * Quatro linhas full-bleed dentro da medida: número mono, título grande em Fraunces
 * e a frase numa coluna deslocada para a direita (col-start-8, não col-start-7 — a
 * assimetria é o que separa "grade intencional" de "duas colunas"). Uma frase é
 * exatamente o conteúdo daquela coluna; o layout cabe no conteúdo real em vez de
 * pedir texto inventado.
 *
 * SEM pictograma, por decisão: um ícone de "site" ou "app" não diz nada que o título
 * já não diga, e o §12 manda não colocar nesse caso. O número é o grafismo.
 *
 * ─── A SEÇÃO TERMINA PUXANDO PARA A AÇÃO (§3) ───────────────────────────────────
 * O CTA usa `ContactCta` — o destino único de `lib/contact.ts` —, alinhado com a
 * coluna das frases. Nenhum `href` novo nasce aqui: ver o bloqueio nº 1 do
 * `PENDENCIAS.md`.
 */
export function Services() {
  const ref = useRef<HTMLElement>(null);
  useMotion(ref, servicesMotion);

  const { sectionTitle, items } = copy.services;
  const { primaryCta } = copy.hero;

  return (
    <Section ref={ref} id={SERVICES_SECTION_ID} labelledBy={HEADING_ID} rhythm="lg">
      <div {...{ [SERVICES_HOOK.block]: true }}>
        {/* Legenda do índice, não copy: "01 — 04" é a extensão da lista, derivada do
            próprio conteúdo. `aria-hidden` porque o <ol> abaixo já anuncia a contagem
            — para quem ouve, isto seria só ruído. É o primeiro consumidor do
            <Eyebrow>, e o filete âmbar dele volta em cada linha da lista. */}
        <div aria-hidden {...{ [SERVICES_HOOK.fade]: true }}>
          <Eyebrow>{`${padIndex(1)} — ${padIndex(items.length)}`}</Eyebrow>
        </div>

        {sectionTitle.kind === 'text' ? (
          <Heading
            level={2}
            size="display"
            id={HEADING_ID}
            className="mt-6"
            {...{ [SERVICES_HOOK.fade]: true }}
          >
            {sectionTitle.value}
          </Heading>
        ) : (
          <PendingContent hint={sectionTitle.hint} />
        )}
      </div>

      {/* `<ol>`: a ordem é informação (é um índice), e o Tailwind zera o marcador —
          daí o `role="list"`, que devolve a semântica que o Safari descarta quando
          `list-style: none` está ligado. */}
      <ol role="list" className="mt-block">
        {items.map((service, index) => (
          <ServiceRow key={service.title} service={service} position={index + 1} />
        ))}
      </ol>

      {/* Fecho do índice: o filete que faltava (sem ele o bloco terminaria em aberto)
          e o CTA, alinhado com a coluna das frases. */}
      <div {...{ [SERVICES_HOOK.block]: true }}>
        <IndexRule className="block w-full" />

        <div className="mt-block md:grid md:grid-cols-12">
          <div {...{ [SERVICES_HOOK.fade]: true }} className="md:col-span-5 md:col-start-8">
            {primaryCta.kind === 'text' ? (
              <ContactCta label={primaryCta.value} />
            ) : (
              <PendingContent hint={primaryCta.hint} />
            )}
          </div>
        </div>
      </div>
    </Section>
  );
}
