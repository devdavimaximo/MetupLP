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

export interface ShowcaseFraming {
  /** Canto para onde a ampliação converge (`transform-origin`). */
  readonly origin: string;
  /** Ampliação do recorte. */
  readonly zoom: number;
}

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
  /**
   * Reenquadramento do MESMO arquivo, para as posições que só aparecem de canto.
   * É o que deixa uma ponta parecer outro tile sem baixar um segundo arquivo — ver
   * o mapa em `lib/showcase.ts`.
   */
  readonly framing?: ShowcaseFraming;
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

/** Painéis por fileira. Três fileiras = 15 painéis, como na referência. */
const ROW_SIZE = 5;

export function HeroParallax({ items, header, className }: HeroParallaxProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion() ?? false;

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start'],
  });

  const translateX = useSpring(useTransform(scrollYProgress, [0, 1], [0, 1000]), SPRING);
  const translateXReverse = useSpring(useTransform(scrollYProgress, [0, 1], [0, -1000]), SPRING);
  const rotateX = useSpring(useTransform(scrollYProgress, [0, 0.2], [15, 0]), SPRING);
  const opacity = useSpring(useTransform(scrollYProgress, [0, 0.2], [0.2, 1]), SPRING);
  const rotateZ = useSpring(useTransform(scrollYProgress, [0, 0.2], [20, 0]), SPRING);
  const translateY = useSpring(useTransform(scrollYProgress, [0, 0.2], [-700, 500]), SPRING);

  const firstRow = items.slice(0, ROW_SIZE);
  const secondRow = items.slice(ROW_SIZE, ROW_SIZE * 2);
  const thirdRow = items.slice(ROW_SIZE * 2, ROW_SIZE * 3);

  return (
    <div
      ref={ref}
      className={cn(
        'relative flex h-[300vh] flex-col self-auto overflow-hidden py-block antialiased [perspective:1000px] [transform-style:preserve-3d]',
        'motion-reduce:h-auto',
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
        'flex gap-block',
        reverse && 'flex-row-reverse',
        !last && 'mb-block',
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
      className="group/card relative aspect-16/10 w-120 shrink-0 overflow-hidden rounded-sm border border-line bg-surface"
    >
      {/* 16:10 é a proporção do master, então o `object-cover` de um screenshot inteiro
          não corta nada. Quem usa `framing` é ponta de fileira: mesmo arquivo, outro
          pedaço, nenhum download a mais — ver `lib/showcase.ts`. */}
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
          style={
            item.framing === undefined
              ? undefined
              : {
                  transformOrigin: item.framing.origin,
                  transform: `scale(${String(item.framing.zoom)})`,
                }
          }
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
