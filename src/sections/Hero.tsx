import { useRef } from 'react';
import { HERO_HOOK, heroMotion } from '../animations/hero';
import { useMotion } from '../animations/useMotion';
import { ContactCta } from '../components/ContactCta';
import { Eyebrow, Heading, PendingContent, Section, Text } from '../components';
import { copy } from '../lib/content';
import { accentSegments } from '../lib/format';
import { SECTION_ID } from '../lib/sections';
import { uiStrings } from '../lib/ui-strings';
import { HeroBackdrop } from './HeroBackdrop';

const HEADING_ID = 'hero-titulo';

/**
 * Primeira dobra.
 *
 * ─── COMPOSIÇÃO ─────────────────────────────────────────────────────────────────
 * Centralizada e simétrica, sobre a cena — o eixo do título é o mesmo eixo da forma
 * que a varredura revela atrás dele, e é essa coincidência que faz o texto parecer
 * parte da cena em vez de uma legenda colada por cima.
 *
 * ─── O CENTRO VERTICAL É O TÍTULO, NÃO O BLOCO — E POR QUE É DIFÍCIL ────────────
 * Pedido explícito do Davi. A primeira tentativa (duas caixas `flex-1`, uma acima e
 * uma abaixo do `<h1>`) parecia a solução de livro-texto, mas MEDIDA no navegador
 * (Puppeteer, `getBoundingClientRect`, não estimativa) ela FALHA para este conteúdo
 * específico: o bloco "abaixo" (subtítulo + CTA) é sempre maior que a metade do
 * espaço livre disponível em qualquer viewport real, então o algoritmo de flexbox
 * o mantém preso no próprio tamanho mínimo e joga toda folga sobrando para cima —
 * o oposto de dividir igual. Medido: piorou o desvio (de ~120px para ~170px).
 *
 * A solução que sobrevive à medição é a mesma da versão anterior (centralizar o
 * BLOCO inteiro com `my-auto` e as duas regiões fixas de `.hero-frame` equilibradas
 * — ver `styles/hero.css`), com UM ajuste: a região de CIMA (`--hero-lift`) é
 * deliberadamente maior que a de baixo. Como o `<h1>` fica ACIMA do centro
 * geométrico do próprio bloco (o que vem depois dele pesa mais que o kicker que vem
 * antes), empurrar o bloco inteiro para baixo por essa mesma distância traz o
 * título de volta ao centro real da viewport.
 *
 * ⚠ HONESTIDADE SOBRE O LIMITE DESTA CORREÇÃO: `--hero-lift` é uma constante
 * medida (Puppeteer, 11 viewports de 320×568 a 1920×1080; tabela em
 * `PENDENCIAS.md`), não uma fórmula que se ajusta sozinha ao conteúdo. Ela reduz o
 * desvio do título de ~108–139px para ~5–73px, mas não zera — na tela mais curta
 * testada (iPhone SE 1ª geração, 320×568) o CTA já sobra só 23px de folga até a
 * borda antes de cair fora da dobra, e o §3 (CTA sempre alcançável) não paga o
 * preço de zerar o resto sem essa troca ser uma decisão consciente do Davi. Se a
 * copy mudar de forma relevante (subtítulo bem mais longo/curto, CTA maior), remeça
 * este valor com o mesmo método — não no olho.
 *
 * ─── E NO CELULAR, ONDE ESSA CONTA NÃO VALE ─────────────────────────────────────
 * Tudo acima descreve a dobra de 768px para cima. Lá o bloco inteiro é centralizado e
 * a cena aparece nas laterais largas que sobram. Num retrato de 390px não sobra
 * lateral nenhuma: centralizar o bloco põe o texto exatamente em cima da forma 3D, o
 * que esconde a cena e ainda obriga o scrim a apagá-la para proteger o contraste.
 *
 * Por isso o celular tem OUTRA composição — enunciado ancorado no alto, cena ocupando
 * toda a folga do meio, ação (CTA + faixa + indicador) ancorada embaixo, na zona do
 * polegar. Ela é feita com `display: contents` neste bloco e um `margin-top: auto` no
 * CTA, e o desenho inteiro, com as medidas, está em `styles/hero.css`.
 *
 * ⚠ É POR ISSO que o ritmo vertical daqui (respiro do título, do subtítulo, do CTA, da
 * faixa e do indicador) mora lá como CLASSE e não como utilitária do Tailwind:
 * utilitária vence `@layer components`, e enquanto qualquer um desses valores
 * estivesse escrito neste arquivo, nenhuma regra de mobile conseguiria reescrevê-lo.
 * Quem for mexer no espaçamento do herói mexe no CSS, não no JSX.
 *
 * ─── A LINHA ÚNICA É ESTRUTURA, NÃO SORTE ───────────────────────────────────────
 * Headline e subtítulo cabem numa linha só no desktop porque foram DIMENSIONADOS
 * para isso: o avanço da headline na Bebas Neue foi medido com `fontkit` e virou a
 * inclinação em `vw` de `--text-hero` (a conta inteira está em `tokens.css`).
 * Por isso os dois blocos são FULL-BLEED — `width="full"` na <Section> — em vez de
 * viverem dentro de uma medida: uma largura máxima em `rem` quebraria a linha
 * exatamente onde o `vw` prometeu que ela caberia. O que ainda tem medida é a faixa
 * de serviços, e por outro motivo (o filete precisa de fim).
 *
 * Centralizar é o default de template que o §7 exclui, então o que tira este herói
 * do default é a tensão entre as três vozes: a condensada em caixa alta enunciando,
 * o mono do kicker e da faixa marcando o registro de terminal, e o dourado caindo
 * numa palavra só. Nada de moldura de vidro, nada de card.
 *
 * ─── A COPY É DO DAVI, TODA ─────────────────────────────────────────────────────
 * Cada string editorial visível aqui vem de `content/copy.md` — kicker, título, qual
 * palavra dele brilha (`**Destaque:**`), subtítulo, rótulo do CTA e os quatro
 * serviços. O único texto escrito em código é o rótulo do indicador de rolagem, que
 * é instrução de navegação e vive em `lib/ui-strings.ts` (o critério está lá).
 *
 * A caixa alta é CSS, não conteúdo: o `copy.md` guarda "construa. automatize.
 * cresça." em caixa baixa, então o `aria-label` que o SplitText gera e o que o
 * buscador indexa continuam em texto normal, e trocar a direção de arte não obriga
 * a reescrever a copy.
 *
 * ─── CTA ────────────────────────────────────────────────────────────────────────
 * Um só, dourado, no maior contraste da tela, acima da dobra em qualquer viewport, e
 * entrando cedo na timeline. O destino vem de `lib/contact.ts` e, desde 2026-08-31,
 * é o WhatsApp da Metup — o rótulo "Falar no WhatsApp" e o clique finalmente dizem a
 * mesma coisa (a divergência que ficava registrada no PENDENCIAS.md acabou).
 *
 * ─── POR QUE O TEXTO CONTINUA LEGÍVEL SOBRE A CENA ──────────────────────────────
 * Não é sorte nem opacidade chutada: a forma é renderizada apagada por exigência de
 * contraste (`SCENE.bodyGain`) e o `.hero-scrim` devolve o fundo da página por baixo
 * do bloco de texto. As duas contas estão escritas em `three/hero/config.ts` e em
 * `styles/hero.css`. Quem for aumentar o brilho da cena tem que refazê-las.
 */
export function Hero() {
  const ref = useRef<HTMLElement>(null);
  useMotion(ref, heroMotion);

  const { eyebrow, headline, headlineAccent, subheadline, primaryCta } = copy.hero;

  return (
    <Section
      ref={ref}
      id={SECTION_ID.hero}
      labelledBy={HEADING_ID}
      rhythm="flush"
      width="full"
      backdrop={<HeroBackdrop />}
    >
      {/* `min-h-svh` e não `min-h-screen`: `100vh` no mobile mede a viewport SEM a
          barra de endereço, então o herói nasce mais alto que a tela e o CTA cai fora
          da dobra justamente onde a dobra é mais curta.

          O centramento é do `.hero-frame` (ver `styles/hero.css`): ele equilibra as
          duas regiões fixas — a de cima (com o desvio `--hero-lift` embutido) e a do
          indicador de rolagem — para que o `my-auto` devolva o TÍTULO, não o bloco,
          ao centro da tela. O padding vertical vem de lá; não o duplique aqui. */}
      <div className="hero-frame flex min-h-svh flex-col items-center text-center">
        <div className="hero-block">
          {eyebrow?.kind === 'text' && (
            <div {...{ [HERO_HOOK.reveal]: true }}>
              <Eyebrow align="center">{eyebrow.value}</Eyebrow>
            </div>
          )}

          {headline.kind === 'text' ? (
            <Heading
              level={1}
              size="hero"
              font="hero"
              id={HEADING_ID}
              className="hero-headline uppercase"
              // O SplitText mede linhas; `text-balance` reescreveria a quebra depois
              // da divisão e a máscara pararia de bater com o texto.
              balance={false}
              {...{ [HERO_HOOK.headline]: true }}
            >
              {/* Um `<span>` só, em volta da palavra que o Davi marcou. O SplitText
                  divide por dentro dele e preserva a cor — por isso o destaque não
                  precisou de nenhuma mudança na timeline. */}
              {accentSegments(headline.value, headlineAccent?.kind === 'text' ? headlineAccent.value : undefined).map(
                (segment, index) =>
                  segment.accent ? (
                    <span key={index} className="text-accent">
                      {segment.text}
                    </span>
                  ) : (
                    segment.text
                  ),
              )}
            </Heading>
          ) : (
            <PendingContent hint={headline.hint} />
          )}

          <div {...{ [HERO_HOOK.reveal]: true }} className="hero-lede">
            {subheadline.kind === 'text' ? (
              // `tone="fg"` em vez do padrão `fg-muted` do <Text> — exceção medida,
              // não estética. Puppeteer mostrou o subtítulo esticando até ~95% da
              // largura da viewport em telas médias/pequenas (mais largo que o
              // próprio título em alguns tamanhos), e nessa borda o `fg-muted`
              // sobre a forma iluminada (`SCENE.bodyGain`) cai a ~2,5:1 — reprova
              // até o mínimo de texto grande. Em `fg`, no mesmo ponto, sobe para
              // ~4,4–5:1. A conta completa está em `styles/hero.css`, junto do
              // scrim redesenhado para cobrir essa largura real.
              <Text size="lead" tone="fg">
                {subheadline.value}
              </Text>
            ) : (
              <PendingContent hint={subheadline.hint} />
            )}
          </div>

          <div {...{ [HERO_HOOK.reveal]: true }} className="hero-cta-slot">
            {primaryCta.kind === 'text' ? (
              <ContactCta label={primaryCta.value} size="lg" variant="secondary" />
            ) : (
              <PendingContent hint={primaryCta.hint} />
            )}
          </div>

          {/* O que a Metup faz, em quatro palavras do próprio Davi. Sem separador de
              texto: o ponto dourado de cada item é o mesmo gesto do <Eyebrow>. */}
          <ul
            {...{ [HERO_HOOK.reveal]: true }}
            className="hero-services flex w-full max-w-hero flex-wrap items-center justify-center border-t border-line"
          >
            {copy.services.items.map((service) => (
              <li
                key={service.title}
                className="flex items-center gap-2.5 font-mono text-label text-fg-muted uppercase"
              >
                <span aria-hidden className="h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                {service.title}
              </li>
            ))}
          </ul>
        </div>

        {/* Indicador de rolagem. É um LINK de verdade para a próxima seção, e não um
            enfeite: quem navega por teclado ganha um atalho real, e quem clica no
            gesto que a página inteira sugere é atendido. `text-muted` mantém a
            hierarquia — ele nunca disputa a atenção com o CTA dourado (§3). */}
        <a
          href={`#${SECTION_ID.services}`}
          {...{ [HERO_HOOK.reveal]: true }}
          className="hero-cue flex shrink-0 flex-col items-center gap-3 rounded-xs font-mono text-label text-muted uppercase transition-colors duration-fast ease-out hover:text-accent focus-visible:focus-ring"
        >
          {uiStrings.scrollCue}
          <span aria-hidden className="h-8 w-px overflow-hidden bg-line">
            <span className="block h-full w-full origin-top bg-accent motion-safe:animate-scroll-cue" />
          </span>
        </a>
      </div>
    </Section>
  );
}
