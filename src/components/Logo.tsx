import { brandAssets } from '../lib/brand-assets';
import { cn } from '../lib/cn';

export interface LogoProps {
  readonly className?: string;
}

/** Único lugar que conhece o caminho e o slug do símbolo. */
const SLUG = 'logometup';
const DIR = '/images/marca';

const mark = brandAssets[SLUG];

/** Maior derivado gerado — o `src` de reserva, e a dimensão intrínseca declarada. */
const FALLBACK_WIDTH = mark.widths[mark.widths.length - 1];
/** Derivada da razão do master; o símbolo é quadrado hoje, mas isto não depende disso. */
const FALLBACK_HEIGHT = Math.round((FALLBACK_WIDTH * mark.height) / mark.width);

function markSrcSet(format: 'avif' | 'webp'): string {
  return mark.widths.map((width) => `${DIR}/${SLUG}-${width}.${format} ${String(width)}w`).join(', ');
}

/**
 * Brasão da Metup — símbolo + wordmark.
 *
 * ─── O QUE MUDOU, E POR QUE ISTO NÃO É MAIS UM PLACEHOLDER ──────────────────────
 * Até aqui o header carregava um wordmark tipográfico de emergência, porque a marca
 * não existia no repositório. **Ela existe agora**: o Davi entregou o símbolo
 * (`assets/marca/logometup.png`) e a versão horizontal, que é onde está a assinatura
 * oficial — "met" em creme, "up" em dourado. A composição daqui é a leitura direta
 * dessa assinatura: o símbolo à esquerda, o wordmark ao lado, nas mesmas duas cores.
 *
 * ─── POR QUE O WORDMARK É TEXTO, E NÃO A IMAGEM HORIZONTAL ──────────────────────
 * A versão horizontal (`assets/marca/logometuphorizontal.png`) traz símbolo e palavra
 * num arquivo só, e usá-la resolveria o desenho numa linha. Mas ela é raster: não
 * responde a zoom de texto (WCAG 1.4.4), não herda a tinta do tema, obriga o nome da
 * marca a viver num `alt` — e, no tamanho de um header, o texto embutido nela
 * amoleceria em qualquer tela não-retina. Em texto, o nome escala, é selecionável,
 * é indexável e é o próprio conteúdo do link. O símbolo, que é desenho e não texto,
 * continua sendo imagem — cada coisa na mídia certa.
 *
 * ⚠ O QUE ISSO CUSTA EM FIDELIDADE: o wordmark oficial usa uma geométrica pesada que
 * NÃO está entre as quatro famílias do projeto. A reprodução aqui é Work Sans 600
 * com o tracking fechado — próxima em cor tipográfica, não idêntica em desenho. Foi
 * escolhida assim de propósito: já está carregada (o corpo da página inteira usa
 * Work Sans), então o brasão custa ZERO byte de fonte. A alternativa fiel é o Davi
 * mandar o arquivo da fonte da marca; está registrado em `PENDENCIAS.md`.
 *
 * ─── ACESSIBILIDADE DA DUPLA IMAGEM + TEXTO ─────────────────────────────────────
 * O símbolo é `alt=""` — decorativo por decisão, não por esquecimento: o nome da
 * marca já está escrito ao lado, em texto de verdade, e um `alt="Metup"` faria o
 * leitor de tela anunciar "Metup metup". Quem dá nome ao LINK é o `aria-label` que o
 * header põe no `<a>`, e não este componente — porque abaixo de 360px o wordmark sai
 * da tela e o nome não pode sair com ele.
 *
 * `met` e `up` são dois `<span>` sem espaço entre eles: a cor muda, a palavra não.
 * Para quem ouve, continua sendo "metup"; para quem copia, também.
 *
 * As larguras do `srcset` vêm de `lib/brand-assets.ts`, gerado por `npm run images` a
 * partir do que EXISTE em disco — nunca de uma lista digitada aqui.
 */
export function Logo({ className }: LogoProps) {
  return (
    <span className={cn('site-brand', className)}>
      {/* AVIF primeiro, WebP como rede. Sem `<img src>` de PNG: o master de 1080px
          pesa 397 kB e nenhum navegador que este projeto suporta fica sem WebP. */}
      {/* A CAIXA é o `<picture>`, não a `<img>`: ele é quem está no fluxo flex do
          brasão, e dimensionar a filha deixava o pai encolher (ver a nota longa em
          `styles/header.css`). */}
      <picture className="site-brand-mark">
        <source type="image/avif" srcSet={markSrcSet('avif')} sizes="34px" />
        <source type="image/webp" srcSet={markSrcSet('webp')} sizes="34px" />
        {/* `width`/`height` dão a razão de aspecto e reservam a caixa antes do byte
            chegar (CLS 0). O tamanho REAL vem do CSS, em `em` do wordmark. */}
        <img
          src={`${DIR}/${SLUG}-${String(FALLBACK_WIDTH)}.webp`}
          width={FALLBACK_WIDTH}
          height={FALLBACK_HEIGHT}
          alt=""
          // O brasão está na primeira dobra: adiar seria adiar a identidade.
          loading="eager"
          decoding="sync"
          // Prioriza o símbolo na fila de rede — são ~1,5 kB, não disputa com o LCP.
          fetchPriority="high"
        />
      </picture>

      <span className="site-brand-wordmark">
        met<span className="site-brand-up">up</span>
      </span>
    </span>
  );
}
