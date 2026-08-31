import type { RefObject } from 'react';
import { Heading } from '../components';
import { ZoomParallax } from '../components/ui/zoom-parallax';
import { cn } from '../lib/cn';

const HEADING_ID = 'zoom-parallax-titulo';

export interface ZoomShowcaseProps {
  /**
   * Onde a pista de 300vh se anuncia para a cena Horizon (ver `App`).
   *
   * A vitrine não sabe nada sobre a cena — ela só empresta a própria geometria. Quem
   * usa é a seção seguinte, para projetar o canvas dela dentro do quadro central
   * enquanto o zoom abre.
   */
  readonly trackRef?: RefObject<HTMLDivElement | null>;
}

/**
 * Os ladrilhos que giram em volta do quadro central — arte do Davi (2026-08-29),
 * no lugar das fotos do Unsplash que vieram no demo.
 *
 * São DECORATIVAS (cosmos, buraco negro, astronauta), não representam trabalho de
 * cliente — a distinção que o §5 do CLAUDE.md faz. Combinam com a cena Horizon do
 * quadro central e com o dourado da marca.
 *
 * Os arquivos saem de `assets/zoom/` (masters, nunca publicados) por `npm run images`:
 * um WebP por imagem, 1280px de teto, qualidade baixa a pedido do Davi — 122 kB os
 * quatro somados, contra 580 kB dos JPG originais. O componente da vitrine desenha um
 * `<img src>` simples, então é um arquivo por ladrilho, sem `srcset`.
 *
 * ⚠ SÃO QUATRO PARA SEIS SLOTS. O Davi disse que ainda traz as que faltam; até lá, a
 * 1 e a 2 aparecem duas vezes (slots 5 e 6). Quando as novas chegarem, é só apontar
 * `TILE[5]`/`TILE[6]` ali — nada mais muda.
 */
const TILE: Record<number, string> = {
  1: '/images/zoom/zoom-parallax-1.webp',
  2: '/images/zoom/zoom-parallax-2.webp',
  3: '/images/zoom/zoom-parallax-3.webp',
  4: '/images/zoom/zoom-parallax-4.webp',
};

const ALT: Record<number, string> = {
  1: 'Ilustração de um sistema planetário visto de cima, com um sol dourado ao centro',
  2: 'Ilustração de um astronauta diante de um planeta gigante iluminado por trás',
  3: 'Ilustração de um buraco negro com disco de luz dourada',
  4: 'Ilustração de um buraco negro em diagonal, com o disco de luz cortando o quadro',
};

/**
 * Vitrine em zoom — a seção nova, logo abaixo do Processo.
 *
 * ⚠ ESTADO PROVISÓRIO, POR PEDIDO EXPLÍCITO DO DAVI (2026-08-29): é o `demo.tsx` que
 * acompanha o componente, portado sem alterar offsets nem estrutura. O título em
 * inglês ainda é do demo, não é copy da Metup — registrado em PENDENCIAS.md.
 *
 * ⚠ AS FOTOS DO UNSPLASH SAÍRAM EM 2026-08-29: os seis ladrilhos agora são arte do
 * Davi (ver `TILE` abaixo).
 *
 * ⚠ ATUALIZADO EM 2026-08-31: o slot que DÁ ZOOM é A CENA HORIZON, ao vivo. Não é
 * foto (2026-08-29 tirou), não é mais um painel preto (era, até aqui) e não é uma
 * segunda cópia da cena: é o `<canvas>` da seção seguinte, projetado dentro do
 * quadrinho e crescendo com ele. Ver a nota no próprio slot e `ComponentProps.introTrackRef`.
 *
 * ─── O QUE MUDOU EM RELAÇÃO AO DEMO, E POR QUÊ ──────────────────────────────────
 *  1. O `<main>` do demo virou `<section>`: a página já tem um `<main>` (em `App`), e
 *     dois quebrariam a semântica que o §6.3 exige.
 *  2. `<h1>` → `<h2>`: o único `<h1>` da página é o do herói (§6.3).
 *  3. O demo instancia o Lenis dentro de um `useEffect`. Aqui NÃO — o scroll suave é
 *     global e nasce uma vez só em `App` (`useSmoothScroll`); uma segunda instância
 *     disputaria a mesma posição de rolagem com a primeira.
 *  4. `--theme(--color-foreground/.1)` do spotlight virou `color-mix` sobre
 *     `--color-fg`: os namespaces default do Tailwind estão apagados em `tokens.css`,
 *     `--color-foreground` não existe neste projeto. Mesmo efeito, token da Metup.
 *  5. `text-4xl` → `text-display-sm`, pelo mesmo motivo: a escala default do Tailwind
 *     foi zerada, aquela classe não compilaria.
 */
export function ZoomShowcase({ trackRef }: ZoomShowcaseProps) {
  const images = [
    {
      /**
       * O SLOT QUE DÁ ZOOM — É A CENA (pedido do Davi, 2026-08-31: "que o que desse
       * zoom não fosse uma imagem, e sim a própria cena 3D").
       *
       * O que este `content` desenha é só o FUNDO: um retângulo preto do tamanho do
       * quadrinho. A cena é projetada em cima dele pela seção seguinte — o `<canvas>`
       * dela é transformado até coincidir com esta caixa e cresce junto com ela (ver
       * `ComponentProps.introTrackRef` em `components/ui/horizon-hero-section.tsx`).
       *
       * O preto continua aqui por dois motivos, e nenhum é decorativo:
       *  · o renderer roda com `alpha: true`, então o céu é desenhado SOBRE o que
       *    estiver atrás — este painel é esse "atrás", e ele tem que ser o mesmo preto
       *    da cena;
       *  · se o WebGL falhar (`SceneBoundary`), o quadrinho volta a ser o painel preto
       *    que era, e o gesto do zoom continua fazendo sentido.
       *
       * ⚠ NÃO ponha uma segunda instância da cena aqui. Foi o que existiu até
       * 2026-08-31 (o modo `frozen`, hoje removido): custava um terceiro contexto
       * WebGL e outra cópia de 15 000 estrelas para desenhar um quadro parado.
       *
       * `src`/`alt` vazios de propósito: com `content` presente, o componente não
       * desenha `<img>` nenhum. `aria-hidden` porque um retângulo preto não é
       * conteúdo — o `<h2>` da seção já a nomeia.
       */
      src: '',
      alt: '',
      content: <div aria-hidden className="h-full w-full bg-black" />,
    },
    // Slot 1 — a caixa mais larga (35vw × 30vh), a primeira a cruzar o quadro.
    { src: TILE[1], alt: ALT[1] },
    // Slot 2 — a ÚNICA caixa em pé (20vw × 45vh). É onde a vertical tem que estar:
    // qualquer horizontal aqui entraria recortada nas laterais.
    { src: TILE[4], alt: ALT[4] },
    // Slot 3 — 25vw × 25vh, à direita.
    { src: TILE[2], alt: ALT[2] },
    // Slot 4 — 20vw × 25vh, embaixo à esquerda.
    { src: TILE[3], alt: ALT[3] },
    // Slot 5 — 30vw × 25vh. REPETE a 1 até chegarem as que faltam (ver a nota acima).
    { src: TILE[1], alt: ALT[1] },
    // Slot 6 — o menor de todos (15vw × 15vh). REPETE a 2 pelo mesmo motivo; é o
    // ladrilho onde a repetição menos aparece.
    { src: TILE[2], alt: ALT[2] },
  ];

  return (
    <section aria-labelledby={HEADING_ID} className="w-full">
      {/*
        ⚠ ERA `h-[50vh]` (corrigido em 2026-08-29, relatado pelo Davi: "espaçamento
        absurdo" na frase, Processo e a vitrine "distantes uma da outra"). Meia tela
        só para centralizar uma linha de texto sobra ~25vh de vazio acima E abaixo
        dela — em qualquer viewport comum isso são centenas de pixels de nada, dos
        dois lados. Primeira correção foi `py-block` (o respiro ENTRE blocos de
        conteúdo, até 4rem); o Davi pediu mais apertado ainda, e `py-stack` é o
        respiro de dentro de um MESMO bloco — o que título e subtítulo usam entre si
        — 1,5rem fixos, sem crescer com a viewport. A caixa continua do tamanho do
        próprio conteúdo, só que com menos ar ao redor.
      */}
      <div className="relative flex flex-col items-center justify-center py-stack">
        {/* Radial spotlight.
            ⚠ A LARGURA TEM TETO EM `100%`, e isso não é estética: `w-[120vmin]` é a
            largura no CELULAR (em retrato, `vmin` é a LARGURA da tela), então o halo
            media 1,2× a viewport e, centrado, sangrava 10vw para cada lado. O lado
            direito virava rolagem HORIZONTAL na página inteira — o bug relatado. No
            desktop `vmin` é a altura e nada muda; no celular o halo passa a caber na
            tela. Como é um gradiente radial já desfocado em 30px e cortado pelo topo,
            o limite não se vê.
            `-top-1/2` continua PROPORCIONAL à altura do container (não um valor
            fixo): com a caixa bem mais baixa agora, o halo se reancora sozinho perto
            do texto — não precisou de outro ajuste. */}
        <div
          aria-hidden="true"
          className={cn(
            'pointer-events-none absolute -top-1/2 left-1/2 h-[120vmin] w-[120vmin] max-w-full -translate-x-1/2 rounded-full',
            'bg-[radial-gradient(ellipse_at_center,color-mix(in_oklab,var(--color-fg)_10%,transparent),transparent_50%)]',
            'blur-[30px]',
          )}
        />
        {/* ⚠ PROPOSTA DO CLAUDE aguardando o Davi (2026-08-29), no lugar do "Scroll
            Down for Zoom Parallax" do demo. As alternativas e o critério estão em
            `content/sugestoes.md`. Ela é o degrau de entrada da sequência: o quadrinho
            começa minúsculo e cresce até tomar a tela, e a cena continua em "Você
            enxerga mais longe.". Não afirma número, prazo nem resultado (§4).
            ⚠ Virou `<Heading>` (era `<h2 className="text-display-sm font-bold">`
            solto): o `font-bold` (700) pisava no peso calibrado do token
            (`--text-display-sm--font-weight: 600`) e pulava a família tipográfica
            que TODO outro título da página usa via este componente — a Fraunces
            ainda herdava por `base.css`, mas com o peso errado e fora do sistema de
            design. `<Heading>` é o mesmo componente de Serviços e Processo. */}
        <Heading id={HEADING_ID} level={2} size="display-sm" className="relative text-center">
          Toda ideia começa pequena.
        </Heading>
      </div>
      {/* ⚠ A PISTA É COMPARTILHADA com a cena da seção seguinte, e a adjacência é
          parte da conta: o ato zero mede o quanto do zoom já passou pela distância
          que falta até o topo da cena, e ela vale a altura da pista porque uma
          começa exatamente onde a outra termina. Não meta nada entre as duas — nem
          um respiro. (O de 50vh que fechava o demo saiu em 2026-08-29 justamente por
          aparecer como uma faixa preta no meio do gesto.) */}
      <ZoomParallax images={images} trackRef={trackRef} />
    </section>
  );
}
