/**
 * ZoomBackground — pano de fundo dourado atrás do quadro que dá zoom.
 *
 * ⚠ REAJUSTADO EM 2026-08-31 (terceiro pedido do dia sobre este fundo). O passe
 * anterior (centro em `50% 45%`, núcleo preto em `55%` — ver o histórico no fim
 * deste comentário) foi longe demais corrigindo a queixa de antes ("não conecte
 * encima"): o Davi voltou dizendo que o dourado sumiu quase por completo — "só está
 * na pontinha inferior esquerda da página" — e que o preto do NÚCLEO (`#000`
 * literal) não batia com o preto do RESTO da página, criando um contraste visível
 * entre esta seção e as vizinhas. Dois defeitos, duas correções:
 *
 *  1. **O centro migrou para `50% 100%`** — embaixo, não no meio. Antes, com o
 *     centro perto do meio da tela e um raio de 125%, o dourado só alcançava os
 *     CANTOS mais distantes (embaixo-esquerda/direita), que é exatamente a
 *     "pontinha" relatada. Ancorado embaixo, o dourado nasce FORTE ali (a `stop` de
 *     0% é a própria cor da marca, sem mistura) e cresce em largura conforme sobe,
 *     preenchendo a parte de baixo da tela de verdade — "bem grande na parte
 *     inferior, o gradiente bem forte", como pedido.
 *  2. **`#000` → `var(--color-bg)`.** O núcleo preto do passe anterior era preto
 *     ABSOLUTO (`#000000`), e o token de fundo da Metup é `#060606` — perto, mas não
 *     igual; contra um preto absoluto ao lado, a diferença de 6 em 255 é pequena
 *     pixel a pixel mas reconhecível em área grande, e foi o que o Davi viu como
 *     "contraste ao trocar de seção". Usando o TOKEN em vez de um literal, o topo
 *     desta camada (onde o dourado ainda não chegou) é peça por peça o MESMO preto
 *     do resto da página — zero costura por construção, não por coincidência de
 *     acerto de olho.
 *
 * O topo continua reservado (a régua de "não conecte encima" do pedido anterior
 * segue valendo — ver o comentário do JSX): com o centro embaixo e o raio vertical
 * medido no próprio tamanho da caixa, o quarto de tela mais próximo do cabeçalho
 * ainda fica em `--color-bg` sólido; só que agora o resto — a maior parte da tela —
 * é dourado de verdade, não uma lasca de canto.
 *
 * ─── O QUE ERA ANTES (histórico completo) ───────────────────────────────────────
 * Este arquivo já foi, na ordem: seis fotos → seis `OrbitPanel` (abstratos) → nada
 * ao redor + feixes diagonais (`"elegant-dark-pattern"`, snippet do Davi) → o
 * `radial-gradient` centralizado do passe anterior → este. Linha do tempo completa,
 * com a razão de cada troca, em PENDENCIAS.md.
 *
 * Fonte original do formato radial: snippet de terceiro trazido pelo Davi
 * ("tailwind-css-background-snippet" / `Hero`) — era um wrapper de página inteira
 * (`h-screen`) com o gradiente `-z-10` dentro; aqui é só a camada de fundo, atrás do
 * quadro que a vitrine desenha por cima (`background` de `ZoomParallax`, em
 * `sections/ZoomShowcase.tsx`). `@/lib/utils` → `../../lib/cn`: este projeto não usa
 * shadcn (sem `components.json`, sem alias `@/`).
 *
 * `aria-hidden` e `pointer-events-none`: é cenário, não conteúdo nem alvo de clique.
 * O quadro que dá zoom e o `<h2>` da seção continuam por cima (pintados depois dele
 * no DOM, sem `z-index` extra — a ordem já resolve).
 */
import { cn } from '../../lib/cn';

interface ZoomBackgroundProps {
  className?: string;
}

export function ZoomBackground({ className }: ZoomBackgroundProps) {
  return (
    <div
      aria-hidden
      className={cn('pointer-events-none absolute inset-0 overflow-hidden', className)}
      style={{
        /**
         * Centro em `50% 100%` (embaixo, ao centro), raio `140% 110%` (um pouco
         * maior que a caixa nos dois eixos, para o dourado não "fechar" em arco
         * visível nos cantos de baixo). Três paradas, não duas:
         *  · `0%` — a cor da marca PURA, no próprio pé da tela — é o "bem forte"
         *    pedido, sem mistura nenhuma bebendo a intensidade;
         *  · `38%` — ainda dourado, já misturado a `--color-bg` (`color-mix`), a
         *    transição em vez de um degrau duro;
         *  · `82%` — `--color-bg` sólido. Sobra ~18% do topo da caixa (perto do
         *    cabeçalho) só no tom de fundo da página, o que impede o dourado de
         *    "encostar" ali — a régua do pedido anterior.
         */
        background:
          'radial-gradient(140% 110% at 50% 100%, var(--color-accent) 0%, color-mix(in oklab, var(--color-accent) 45%, var(--color-bg)) 38%, var(--color-bg) 82%)',
      }}
    />
  );
}
