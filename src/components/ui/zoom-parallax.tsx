/**
 * ZoomParallax — colagem de imagens que se abre em zoom conforme a rolagem.
 *
 * Componente de terceiro, trazido a pedido do Davi e VERSIONADO em `components/ui/`
 * pelo mesmo critério do `hero-parallax.tsx`: o que veio pronto de fora fica separado
 * do design system da Metup (`components/`) e pode ser substituído inteiro sem tocar
 * no resto.
 *
 * ⚠ ESTA É A VERSÃO INICIAL, PEDIDA "COMO ESTÁ" (2026-08-29). As imagens, as escalas,
 * os offsets de cada índice e a altura de 300vh são exatamente os do código enviado —
 * nada foi redesenhado ainda. O ajuste para a Metup (conteúdo real, tokens, direção de
 * arte) vem nos próximos pedidos do Davi.
 *
 * ─── O QUE MUDOU EM RELAÇÃO AO ORIGINAL, E POR QUÊ ──────────────────────────────
 *  1. `'use client'` saiu: não há React Server Components aqui (Vite + vite-react-ssg),
 *     a diretiva seria decorativa.
 *  2. `prefers-reduced-motion` (§6.6, inegociável): sem movimento, a escala não é
 *     aplicada e a pista de rolagem encolhe para uma tela — o que sobra é a colagem
 *     estática, que é o mesmo desenho no seu estado inicial. As `MotionValue`
 *     continuam sendo criadas, só deixam de ser usadas: a ordem dos hooks não muda.
 *  3. `loading="lazy"`/`decoding="async"` na única imagem que sobrar num `src`: a
 *     seção fica bem abaixo da primeira dobra (§6.2). Hoje nenhum slot usa `<img>` —
 *     ver o ponto 5 — mas o caminho continua existindo para quem voltar a usar foto.
 *  4. `trackRef` (2026-08-31) — a pista de 300vh passou a ser legível de fora, para a
 *     cena Horizon poder se projetar dentro do quadro central enquanto ele abre. Ver
 *     `ZoomParallaxProps.trackRef`. Nada no desenho mudou.
 *  5. `src` virou OPCIONAL (2026-08-31) — os seis ladrilhos ao redor do quadro
 *     central saíram de foto para `content` (pedido do Davi: "retire as imagens,
 *     torne a sessão mais especial"). O componente não sabe o que é `OrbitPanel`;
 *     só continua desenhando o que cada slot mandar, na mesma caixa e na mesma
 *     escala. Ver `Image.content` e `sections/ZoomShowcase`.
 *  6. `background` (2026-08-31) — os SEIS ladrilhos saíram de vez (pedido do Davi:
 *     "retire todos os elementos que você criou (...) deixe somente centralizado a
 *     cena que ganha o zoom, adicione esse background"). `images` hoje tem UM item
 *     só (o quadro central); o novo slot `background` é onde entra o pano de fundo,
 *     pintado atrás dele dentro do MESMO painel preso — ver `ZoomParallaxProps.background`.
 *
 * ─── A GEOMETRIA DO QUADRO CENTRAL É UM CONTRATO ────────────────────────────────
 * O slot 0 é o ÚNICO sem classe de deslocamento: ele fica centrado, mede 25vw × 25vh
 * e escala de 1 a 4. Ou seja — e é isto que a cena Horizon usa — **ele é a janela
 * inteira reduzida a 25% em torno do próprio centro**, e chega a 100% dela no fim da
 * pista. Mexer no `scale4` do índice 0, nas medidas do quadrinho ou na centralização
 * quebra o encaixe da cena; o outro lado da conta está em `INTRO_MIN_SCALE`, em
 * `components/ui/horizon-hero-section.tsx`.
 *
 * ⚠ CONFLITO DECLARADO com o §6.4 do CLAUDE.md, que manda animar com GSAP: este
 * componente é framer-motion, como o `hero-parallax`. Foi pedido explícito do Davi
 * ("implemente, depois ajustamos"). Ver PENDENCIAS.md.
 */
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { useRef, type ReactNode, type RefObject } from 'react';

interface Image {
  /**
   * ⚠ OPCIONAL desde 2026-08-31: os seis ladrilhos ao redor do quadro central
   * deixaram de ser foto (pedido do Davi — "retire as imagens, torne a sessão mais
   * especial") e passaram a usar `content`, como o quadro central já usava desde
   * 2026-08-29. `src` continua existindo para quem quiser voltar a usar foto num
   * slot específico.
   */
  src?: string;
  alt?: string;
  /**
   * Conteúdo no lugar da foto.
   *
   * Quando existe, o slot deixa de desenhar o `<img>` e passa a montar este nó, na
   * mesma caixa e com a mesma escala. Hoje é o que TODOS os sete slots usam: o
   * central é o fundo sobre o qual a cena Horizon é projetada enquanto o zoom abre, e
   * os seis ao redor são os painéis abstratos (`OrbitPanel`) — ver a nota de cada um
   * em `sections/ZoomShowcase`.
   */
  content?: ReactNode;
}

interface ZoomParallaxProps {
  /** Array of images to be displayed in the parallax effect max 7 images */
  images: Image[];
  /**
   * A PISTA, entregue para fora (2026-08-31, pedido do Davi: dar zoom na cena 3D em
   * vez de numa imagem).
   *
   * Quem recebe é a cena Horizon da seção seguinte: ela precisa saber quanto do zoom
   * já passou para pôr o próprio `<canvas>` exatamente dentro do quadro central
   * enquanto ele abre. O elemento é esta pista de 300vh — a mesma que o `useScroll`
   * abaixo mede —, então os dois leem a MESMA geometria e não existe conta duplicada
   * que possa divergir. Ver `ComponentProps.introTrackRef` em
   * `components/ui/horizon-hero-section.tsx`.
   *
   * Sem ele o componente continua inteiro: é a `ref` local que entra no lugar.
   */
  trackRef?: RefObject<HTMLDivElement | null>;
  /**
   * Pano de fundo do painel preso (2026-08-31, pedido do Davi — ver ponto 6 do
   * cabeçalho). Renderizado como o PRIMEIRO filho do painel `sticky`, atrás de
   * todos os `images`, preenchendo a mesma janela (`h-screen`). Opcional: sem ele, o
   * painel continua com o fundo padrão da página (preto).
   */
  background?: ReactNode;
}

export function ZoomParallax({ images, trackRef, background }: ZoomParallaxProps) {
  const localRef = useRef<HTMLDivElement>(null);
  // Uma `ref` OU a outra, nunca as duas presas no mesmo nó: `useScroll` exige um
  // `RefObject`, e escolher aqui evita ter que fundir duas refs num callback.
  const container = trackRef ?? localRef;
  const reduce = useReducedMotion() ?? false;
  const { scrollYProgress } = useScroll({
    target: container,
    offset: ['start start', 'end end'],
  });

  const scale4 = useTransform(scrollYProgress, [0, 1], [1, 4]);
  const scale5 = useTransform(scrollYProgress, [0, 1], [1, 5]);
  const scale6 = useTransform(scrollYProgress, [0, 1], [1, 6]);
  const scale8 = useTransform(scrollYProgress, [0, 1], [1, 8]);
  const scale9 = useTransform(scrollYProgress, [0, 1], [1, 9]);

  const scales = [scale4, scale5, scale6, scale5, scale6, scale8, scale9];

  return (
    <div ref={container} className="relative h-[300vh] motion-reduce:h-screen">
      <div className="sticky top-0 h-screen overflow-hidden">
        {background}
        {images.map(({ src, alt, content }, index) => {
          const scale = scales[index % scales.length];

          return (
            <motion.div
              key={index}
              style={reduce ? undefined : { scale }}
              className={`absolute top-0 flex h-full w-full items-center justify-center ${index === 1 ? '[&>div]:!-top-[30vh] [&>div]:!left-[5vw] [&>div]:!h-[30vh] [&>div]:!w-[35vw]' : ''} ${index === 2 ? '[&>div]:!-top-[10vh] [&>div]:!-left-[25vw] [&>div]:!h-[45vh] [&>div]:!w-[20vw]' : ''} ${index === 3 ? '[&>div]:!left-[27.5vw] [&>div]:!h-[25vh] [&>div]:!w-[25vw]' : ''} ${index === 4 ? '[&>div]:!top-[27.5vh] [&>div]:!left-[5vw] [&>div]:!h-[25vh] [&>div]:!w-[20vw]' : ''} ${index === 5 ? '[&>div]:!top-[27.5vh] [&>div]:!-left-[22.5vw] [&>div]:!h-[25vh] [&>div]:!w-[30vw]' : ''} ${index === 6 ? '[&>div]:!top-[22.5vh] [&>div]:!left-[25vw] [&>div]:!h-[15vh] [&>div]:!w-[15vw]' : ''} `}
            >
              <div className="relative h-[25vh] w-[25vw]">
                {content ?? (
                  <img
                    src={src || '/placeholder.svg'}
                    alt={alt || `Parallax image ${index + 1}`}
                    loading="lazy"
                    decoding="async"
                    className="h-full w-full object-cover"
                  />
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
