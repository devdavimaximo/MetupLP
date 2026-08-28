/**
 * HeroParallax — deck de painéis em perspectiva, dirigido pelo progresso de rolagem.
 *
 * Componente de terceiro (Aceternity UI), trazido a pedido do Davi e VERSIONADO aqui
 * em `components/ui/` — a pasta onde mora código adotado de fora, para ficar óbvio o
 * que é do design system da Metup (`components/`) e o que veio pronto e pode ser
 * substituído inteiro sem tocar no resto.
 *
 * ─── O QUE MUDOU EM RELAÇÃO AO ORIGINAL, E POR QUÊ ──────────────────────────────
 *  1. `next/image` → `<img>` e `next/link` → nada. Este projeto é Vite + vite-react-ssg;
 *     não existe runtime do Next para importar. A `"use client"` também saiu: não há
 *     React Server Components aqui, a diretiva seria decorativa.
 *  2. Os cartões NÃO são links. No original cada card leva ao site de um produto; aqui
 *     não existe destino (página de serviço não é escopo, case é F4), e hover que
 *     sugere clique sem destino é affordance mentirosa. O CTA real fecha o cabeçalho.
 *  3. O deck inteiro é `aria-hidden`: ele é ilustração do que o cabeçalho já diz em
 *     texto. Sem isso, quem usa leitor de tela ouviria os mesmos quatro títulos quinze
 *     vezes. É também o que autoriza os cartões a não serem focáveis.
 *  4. O cabeçalho virou PROP. O original traz título e parágrafo escritos em inglês
 *     dentro do componente; copy hardcoded viola o §4/§9 (toda copy vem de `content/`).
 *  5. Classes do Tailwind default (`text-7xl`, `dark:text-white`, `text-neutral-200`)
 *     foram trocadas pelos tokens da Metup — os namespaces default do Tailwind estão
 *     apagados em `tokens.css`, então aquelas classes sequer compilariam.
 *  6. `prefers-reduced-motion`: sem movimento, o deck é uma grade estática e a altura
 *     de rolagem some (`motion-reduce:h-auto`, em CSS, para não haver diferença entre
 *     o HTML pré-renderizado e o hidratado). As `MotionValue` continuam existindo —
 *     só deixam de ser aplicadas —, então a ordem dos hooks não muda.
 *
 * ⚠ CONFLITO DECLARADO com o §6.4 do CLAUDE.md, que manda animar com GSAP: este
 * componente é framer-motion. Foi um pedido explícito do Davi ("implemente, depois
 * ajustamos"). O gesto é portável para ScrollTrigger sem perder nada visualmente —
 * ver PENDENCIAS.md.
 */
import {
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from 'framer-motion';
import { useRef, type ReactNode } from 'react';
import { cn } from '../../lib/cn';

export interface ShowcaseSource {
  readonly type: string;
  readonly srcSet: string;
}

export interface ShowcaseItem {
  /** Rótulo do hover. Vazio = cartão sem rótulo (é o caso das pontas). */
  readonly title: string;
  /** `src` de fallback. Nos slots sem projeto é o painel do design system. */
  readonly thumbnail: string;
  /** Formatos modernos, em ordem de preferência. Ausente = só o `thumbnail`. */
  readonly sources?: readonly ShowcaseSource[];
  readonly sizes?: string;
  /** Dimensões do master, para o cartão nunca causar reflow ao carregar. */
  readonly width?: number;
  readonly height?: number;
}

export interface HeroParallaxProps {
  /**
   * Painéis do deck, na ordem em que aparecem. São distribuídos em três fileiras de
   * `ROW_SIZE`; o que sobra do múltiplo simplesmente não é desenhado.
   */
  readonly items: readonly ShowcaseItem[];
  /** Cabeçalho editorial da seção — título, texto e CTA vêm de fora (§4). */
  readonly header: ReactNode;
  readonly className?: string;
}

/** Mola do original, preservada: é ela que dá o atraso "pesado" ao deck. */
const SPRING = { stiffness: 300, damping: 30, bounce: 100 } as const;

/**
 * Painéis por fileira.
 *
 * Eram 5, como na referência. Passaram a 7 pela aritmética abaixo, não por gosto.
 *
 * ─── AS DUAS GARANTIAS QUE BRIGAM ───────────────────────────────────────────────
 * (a) a fileira tem que ser mais larga que a tela MAIS o curso lateral, senão a ponta
 *     dela entra em quadro e abre um buraco durante o arrasto;
 * (b) as três fileiras têm que caber inteiras na altura da tela (pedido do Davi).
 *
 * (b) obriga o cartão a encolher em tela baixa — e o cartão encolhendo encolhe a
 * fileira, que é justamente do que (a) precisa. Medido no Chrome e simulado nas 9
 * viewports: com 5 por fileira o buraco aparecia em 1280×720, 1366×768 e 1920×950
 * (déficit de 106 a 385px); com 6 ainda faltavam ~120–170px nessas três; com **7** a
 * pior sobra fica em +181px. Sete é o primeiro número que fecha em todas.
 *
 * O custo é zero em rede: as posições novas são pontas, e ponta reaproveita o master
 * de um vizinho que o navegador já baixou (ver `lib/showcase.ts`).
 */
const ROW_SIZE = 7;

/**
 * Altura de rolagem da seção, e as posições da timeline dentro dela.
 *
 * Era `300vh` fixos com a queda em `[0, 0.2]`. Medido: sobravam de 1000 a 2040px de
 * rolagem depois que o deck parava — uma a duas telas inteiras de nada acontecendo
 * antes da próxima seção.
 *
 * ⚠ ALTURA FIXA EM `vh` NÃO SERVE, e isso foi descoberto medindo, não pensando. Com
 * `h-[200vh]` o celular quebrou: lá o cabeçalho (título + quatro serviços empilhados
 * + CTA) é MUITO mais alto que no desktop, e header + queda + deck passaram a não
 * caber dentro da caixa — o `overflow-hidden` cortava a terceira fileira justamente
 * onde o pedido era mostrá-la. Em 390×844 e 360×640 sobravam 2 e 1 fileiras.
 *
 * Por isso a altura agora é do CONTEÚDO, com piso: `min-h` garante pista de rolagem
 * onde o conteúdo é curto (desktop), e o `padding-bottom` reserva o deslocamento em
 * que o deck repousa (`translateY` +500px), que é transformação e não entra no
 * cálculo de layout sozinho.
 *
 * As duas constantes de timeline preservam a TAXA do movimento que o Davi aprovou —
 * px de movimento por px de rolagem:
 *   · a queda ocupava 0,2 × 300vh = 60vh; em 0,3 de uma seção de ~200vh, o mesmo;
 *   · o arrasto lateral corria 1000px em 300vh; 660px em 200vh mantêm a velocidade.
 */
const SECTION_SCROLL = 'min-h-[150vh] pb-[520px]';
const FALL_END = 0.3;
const TRAVEL = 660;

export function HeroParallax({ items, header, className }: HeroParallaxProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion() ?? false;

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start'],
  });

  const translateX = useSpring(useTransform(scrollYProgress, [0, 1], [0, TRAVEL]), SPRING);
  const translateXReverse = useSpring(useTransform(scrollYProgress, [0, 1], [0, -TRAVEL]), SPRING);
  const rotateX = useSpring(useTransform(scrollYProgress, [0, FALL_END], [15, 0]), SPRING);
  const opacity = useSpring(useTransform(scrollYProgress, [0, FALL_END], [0.2, 1]), SPRING);
  const rotateZ = useSpring(useTransform(scrollYProgress, [0, FALL_END], [20, 0]), SPRING);
  const translateY = useSpring(useTransform(scrollYProgress, [0, FALL_END], [-700, 500]), SPRING);

  const firstRow = items.slice(0, ROW_SIZE);
  const secondRow = items.slice(ROW_SIZE, ROW_SIZE * 2);
  const thirdRow = items.slice(ROW_SIZE * 2, ROW_SIZE * 3);

  return (
    <div
      ref={ref}
      className={cn(
        'showcase-deck relative flex flex-col self-auto overflow-hidden py-block antialiased [perspective:1000px] [transform-style:preserve-3d]',
        SECTION_SCROLL,
        'motion-reduce:min-h-0 motion-reduce:pb-0',
        className,
      )}
    >
      {header}

      <div aria-hidden className="mt-block">
        <motion.div
          style={reduce ? undefined : { rotateX, rotateZ, translateY, opacity }}
          className="motion-reduce:opacity-100"
        >
          <ParallaxRow items={firstRow} translate={reduce ? undefined : translateX} reverse />
          <ParallaxRow items={secondRow} translate={reduce ? undefined : translateXReverse} />
          <ParallaxRow items={thirdRow} translate={reduce ? undefined : translateX} reverse last />
        </motion.div>
      </div>
    </div>
  );
}

interface ParallaxRowProps {
  readonly items: readonly ShowcaseItem[];
  readonly translate: MotionValue<number> | undefined;
  /** Fileira que corre no sentido inverso — é o que cria o entrelaçamento do deck. */
  readonly reverse?: boolean;
  readonly last?: boolean;
}

function ParallaxRow({ items, translate, reverse = false, last = false }: ParallaxRowProps) {
  return (
    <div
      className={cn(
        'flex gap-[var(--deck-gap)]',
        reverse && 'flex-row-reverse',
        !last && 'mb-[var(--deck-gap)]',
      )}
    >
      {items.map((item, index) => (
        <ShowcaseCard key={`${item.title}-${String(index)}`} item={item} translate={translate} />
      ))}
    </div>
  );
}

interface ShowcaseCardProps {
  readonly item: ShowcaseItem;
  readonly translate: MotionValue<number> | undefined;
}

/**
 * Um painel do deck.
 *
 * `alt=""` e nenhum `<h2>`: o cartão é ilustração dentro de um bloco `aria-hidden`, e
 * um heading aqui poluiria o sumário do documento (que o §6.3 exige limpo) com quinze
 * entradas repetidas. O rótulo que aparece no hover é `<span>`, decoração pura.
 */
function ShowcaseCard({ item, translate }: ShowcaseCardProps) {
  return (
    <motion.div
      style={translate === undefined ? undefined : { x: translate }}
      whileHover={translate === undefined ? undefined : { y: -20 }}
      // Largura e altura vêm das variáveis do `.showcase-deck`, não de `aspect-*`: a
      // largura É a altura × 1,6, então a proporção 16:10 já está embutida e o cartão
      // continua encaixando o master sem corte em qualquer tamanho de tela.
      className="group/card relative h-(--deck-card-h) w-(--deck-card-w) shrink-0 overflow-hidden rounded-sm border border-line bg-surface"
    >
      {/* O cartão e o master têm a mesma proporção (16:10), então o `object-cover`
          mostra o screenshot INTEIRO — nenhum cartão do deck é recorte. */}
      <picture>
        {item.sources?.map((source) => (
          <source key={source.type} type={source.type} srcSet={source.srcSet} sizes={item.sizes} />
        ))}
        <img
          src={item.thumbnail}
          alt=""
          width={item.width}
          height={item.height}
          sizes={item.sizes}
          loading="lazy"
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover object-center"
        />
      </picture>

      {/* O véu de hover só existe onde há rótulo para ler. Sem isso ele escureceria o
          screenshot sem entregar nada em troca — o contrário do que a vitrine quer. */}
      {item.title !== '' && (
        <>
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-2/5 bg-linear-to-t from-surface-sunken to-transparent opacity-0 transition-opacity duration-base ease-out group-hover/card:opacity-95" />
          <span className="pointer-events-none absolute bottom-5 left-5 font-mono text-label text-fg uppercase opacity-0 transition-opacity duration-base ease-out group-hover/card:opacity-100">
            {item.title}
          </span>
        </>
      )}
    </motion.div>
  );
}
