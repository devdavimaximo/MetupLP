import { Component as HorizonScene } from '../components/ui/horizon-hero-section';
import { ZoomParallax } from '../components/ui/zoom-parallax';
import { cn } from '../lib/cn';
import { SceneBoundary } from '../three/SceneBoundary';

const HEADING_ID = 'zoom-parallax-titulo';

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
 * ⚠ ATUALIZADO EM 2026-08-29: o slot que DÁ ZOOM não é mais foto. Ele carrega a cena
 * Horizon travada (`<HorizonScene frozen />`), e a seção seguinte
 * (`sections/HorizonHero`) entra com a mesma cena viva — o zoom termina em tela cheia
 * exatamente no quadro em que a cena começa.
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
export function ZoomShowcase() {
  const images = [
    {
      // O SLOT QUE DÁ ZOOM. Deixou de ser foto e passou a carregar a cena Horizon
      // TRAVADA (pedido do Davi, 2026-08-29): ela fica parada dentro do quadrinho
      // enquanto o zoom abre e, quando ele termina em tela cheia, a seção logo abaixo
      // entra com a mesma cena, agora viva. `src`/`alt` ficam vazios de propósito —
      // com `content` presente, o componente não desenha `<img>` nenhum.
      src: '',
      alt: '',
      // Mesma fronteira do herói e da seção Horizon: se o contexto WebGL faltar, o
      // slot fica vazio em vez de a página inteira cair (ver `SceneBoundary`).
      content: (
        <SceneBoundary>
          <HorizonScene frozen />
        </SceneBoundary>
      ),
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
      <div className="relative flex h-[50vh] items-center justify-center">
        {/* Radial spotlight */}
        <div
          aria-hidden="true"
          className={cn(
            'pointer-events-none absolute -top-1/2 left-1/2 h-[120vmin] w-[120vmin] -translate-x-1/2 rounded-full',
            'bg-[radial-gradient(ellipse_at_center,color-mix(in_oklab,var(--color-fg)_10%,transparent),transparent_50%)]',
            'blur-[30px]',
          )}
        />
        {/* ⚠ PROPOSTA DO CLAUDE aguardando o Davi (2026-08-29), no lugar do "Scroll
            Down for Zoom Parallax" do demo. As alternativas e o critério estão em
            `content/sugestoes.md`. Ela é o degrau de entrada da sequência: o quadrinho
            começa minúsculo e cresce até tomar a tela, e a cena continua em "Você
            enxerga mais longe.". Não afirma número, prazo nem resultado (§4). */}
        <h2 id={HEADING_ID} className="text-center text-display-sm font-bold">
          Toda ideia começa pequena.
        </h2>
      </div>
      <ZoomParallax images={images} />
      {/* O respiro de 50vh que fechava o demo SAIU (2026-08-29): entre o quadro em que
          o zoom termina em tela cheia e a cena viva da seção seguinte, ele aparecia
          como uma faixa preta. Com o zoom terminando exatamente no fim da pista, a
          cena travada emenda direto na cena que começa. */}
    </section>
  );
}
