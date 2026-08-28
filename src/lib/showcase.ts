/**
 * O deck da vitrine — quais arquivos entram em quais das 15 posições.
 *
 * ─── O MAPA DE POSIÇÕES VEIO DE OBSERVAÇÃO, NÃO DE PALPITE ──────────────────────
 * O Davi rolou a página e anotou o que realmente se vê: no desktop, a fileira de cima
 * entrega 02/03/04, a do meio 07/08/09 e a de baixo 12/13/14; no celular só sobram
 * inteiras a 02, a 07 e a 12 (mais um pedaço grande da 13). As outras seis posições
 * aparecem só de canto, em qualquer largura.
 *
 * Isso é do layout, não é defeito: cada fileira é mais larga que a tela de propósito,
 * e as pontas cortadas fazem o deck sugerir mais trabalho do que mostra — exatamente
 * o que serve a uma agência que constrói dashboard, CRM e ERP e não pode abrir a tela
 * de cliente.
 *
 * A consequência é o desenho deste módulo:
 *
 *  · `READING_SLOTS` (9) recebem os screenshots reais, inteiros.
 *  · `FLANK_SLOTS` (6) NÃO recebem arquivo novo. Cada ponta reaproveita o master de
 *    uma posição de leitura vizinha com outro enquadramento (`objectPosition` + zoom).
 *    Mesma URL ⇒ **zero byte a mais** (o navegador já tem o arquivo em cache), tile
 *    visualmente diferente, e um pedaço ampliado de tela entrega menos ainda de
 *    informação do cliente. É por isso que as pontas não são painel abstrato: num
 *    monitor de 2560px+ elas aparecem mais, e precisam aguentar ser vistas.
 *  · As três posições que o celular lê — 02, 07 e 12 — são as primeiras de cada trinca
 *    do desktop. Uma ordenação só serve aos dois breakpoints: os projetos mais fortes
 *    vão para elas, e nenhuma reordenação por media query é necessária.
 *
 * ─── ENQUANTO NÃO CHEGAM OS ARQUIVOS ────────────────────────────────────────────
 * `projects` está vazio e as 15 posições caem no painel numerado do design system
 * (`showcase-placeholder.ts`), cada uma com o próprio número. É de propósito: mantém
 * o deck navegável para teste visual E preserva a numeração que o Davi usa para dar
 * feedback ("a 07 está escura demais"). O reenquadramento das pontas só entra em cena
 * quando existir master de verdade para reenquadrar.
 */
import type { ShowcaseItem } from '../components/ui/hero-parallax';
import { showcaseAssets, type ShowcaseSlug } from './showcase-assets';
import { showcasePanel } from './showcase-placeholder';

/** Três fileiras de cinco. Ver `HeroParallax`. */
export const DECK_SIZE = 15;

/** Posições lidas inteiras. Recebem screenshot real, uma imagem cada. */
export const READING_SLOTS = [2, 3, 4, 7, 8, 9, 12, 13, 14] as const;

/** As três que o celular lê. Reservadas aos projetos mais fortes. */
export const MOBILE_SLOTS = [2, 7, 12] as const;

/** Posições que só aparecem de canto. Não recebem arquivo próprio. */
export const FLANK_SLOTS = [1, 5, 6, 10, 11, 15] as const;

interface FlankFraming {
  /** De qual posição de leitura a ponta empresta o arquivo. */
  readonly from: number;
  /**
   * Canto para onde o zoom converge (`transform-origin`).
   *
   * ⚠ Não é `object-position`: o cartão e o master têm a MESMA proporção (16:10), então
   * o `object-fit: cover` não sobra nada para reposicionar e `object-position` seria
   * inerte. Quem cria o recorte é a ampliação; a origem decide qual pedaço fica.
   */
  readonly origin: string;
  /** Ampliação. Acima de ~1,8 o texto da UI no screenshot começa a mostrar pixel. */
  readonly zoom: number;
}

/**
 * Cada ponta empresta do vizinho MAIS PRÓXIMO na mesma fileira e puxa um canto
 * diferente do dele — assim o par nunca lê como a mesma imagem duas vezes, nem quando
 * os dois aparecem juntos num monitor largo.
 */
const FLANK_FRAMING: Readonly<Record<number, FlankFraming>> = {
  1: { from: 2, origin: '100% 0%', zoom: 1.7 },
  5: { from: 4, origin: '0% 100%', zoom: 1.7 },
  6: { from: 7, origin: '100% 100%', zoom: 1.6 },
  10: { from: 9, origin: '0% 0%', zoom: 1.6 },
  11: { from: 12, origin: '100% 0%', zoom: 1.7 },
  15: { from: 14, origin: '0% 100%', zoom: 1.6 },
};

export interface ShowcaseProject {
  /** Posição no deck. Tem que ser uma de `READING_SLOTS`. */
  readonly slot: number;
  /** Master em `assets/projetos/`, já processado por `npm run images`. */
  readonly slug: ShowcaseSlug;
  /**
   * Nome do projeto, do Davi. É conteúdo de case: nunca escrito aqui por dedução
   * (§4) — as marcas que aparecem DENTRO dos screenshots não foram copiadas para cá.
   * Vazio enquanto não houver nome liberado; o cartão só não mostra rótulo.
   */
  readonly label: string;
}

/**
 * Os 9 projetos, um por posição de leitura.
 *
 * ─── A ORDEM EM VIGOR É DO DAVI, VENDO A TELA ───────────────────────────────────
 * A proposta inicial vinha de duas restrições cruzadas:
 *
 *  1. as três posições que o celular lê (02, 07, 12) receberiam os três SISTEMAS —
 *     CRM, ERP e o dashboard de ordens de serviço —, porque é o argumento do "não
 *     construímos só site" e é o que o visitante de celular vê inteiro;
 *  2. um screenshot claro por fileira, nunca dois juntos: três dos nove têm fundo
 *     branco e, numa página quase preta, são de longe o ponto mais luminoso da tela.
 *
 * O Davi rolou a página e trocou quatro pares (`sistemas-1` ↔ `-6`, `-9` ↔ `-7`,
 * `-7` ↔ `-3` e `-5` ↔ `-9`). **Julgamento visual na tela real ganha da regra escrita antes
 * de ver** — a ordem abaixo é a dele. Mas as duas restrições deixaram de valer, e isso
 * fica registrado para ninguém "corrigir" de volta sem saber o que está trocando:
 *
 *  · o celular passa a ler 1 sistema e 2 sites (era 3 sistemas);
 *  · as posições 03 e 04 ficaram claras e VIZINHAS, e a fileira 2 ficou toda escura.
 *
 * Trocar a ordem é trocar o `slug` de duas linhas aqui. Nada mais no código depende
 * dela — as pontas se reenquadram sozinhas.
 */
export const projects: readonly ShowcaseProject[] = [
  // Fileira 1 — claras na 03 e na 04.
  { slot: 2, slug: 'sistemas-9', label: '' },
  { slot: 3, slug: 'sistemas-6', label: '' },
  { slot: 4, slug: 'sistemas-2', label: '' },
  // Fileira 2 — toda escura.
  { slot: 7, slug: 'sistemas-1', label: '' },
  { slot: 8, slug: 'sistemas-3', label: '' },
  { slot: 9, slug: 'sistemas-8', label: '' },
  // Fileira 3 — clara na 13.
  { slot: 12, slug: 'sistemas-5', label: '' },
  { slot: 13, slug: 'sistemas-7', label: '' },
  { slot: 14, slug: 'sistemas-4', label: '' },
];

/** Largura CSS do cartão (`w-120` = 30rem). É o que o `sizes` precisa declarar. */
const CARD_WIDTH = 480;

function srcSetFor(slug: ShowcaseSlug, format: 'avif' | 'webp'): string {
  return showcaseAssets[slug].widths
    .map((width) => `/images/projetos/${slug}-${String(width)}.${format} ${String(width)}w`)
    .join(', ');
}

/**
 * Imagem de um slot real. AVIF primeiro, WebP como rede de segurança, e o `src` do
 * `<img>` apontando para um WebP de 960px — o tamanho que uma tela 2× pediria — para
 * o caso de o navegador ignorar os dois `<source>`.
 */
function imageFor(slug: ShowcaseSlug, framing?: FlankFraming): ShowcaseItem {
  const asset = showcaseAssets[slug];
  const rendered = Math.round(CARD_WIDTH * (framing?.zoom ?? 1));
  const fallback = asset.widths.find((width) => width >= 960) ?? asset.widths[asset.widths.length - 1];

  return {
    title: '',
    thumbnail: `/images/projetos/${slug}-${String(fallback)}.webp`,
    sources: [
      { type: 'image/avif', srcSet: srcSetFor(slug, 'avif') },
      { type: 'image/webp', srcSet: srcSetFor(slug, 'webp') },
    ],
    // A ampliação das pontas não muda o tamanho de LAYOUT do <img>, então o navegador
    // escolheria uma largura pequena demais e a ponta sairia borrada. O `sizes` declara
    // o tamanho RENDERIZADO, que é o que ele precisa saber.
    sizes: `${String(rendered)}px`,
    width: asset.width,
    height: asset.height,
    framing: framing === undefined ? undefined : { origin: framing.origin, zoom: framing.zoom },
  };
}

/**
 * Monta as 15 posições do deck.
 *
 * `fallbackLabels` são os rótulos usados enquanto não há projeto real — hoje os quatro
 * serviços, que são copy do Davi. Nenhum texto nasce aqui dentro.
 */
export function buildDeck(fallbackLabels: readonly string[]): readonly ShowcaseItem[] {
  const bySlot = new Map(projects.map((project) => [project.slot, project]));

  return Array.from({ length: DECK_SIZE }, (_, index) => {
    const slot = index + 1;
    const project = bySlot.get(slot);

    if (project !== undefined) {
      return { ...imageFor(project.slug), title: project.label };
    }

    const flank = FLANK_FRAMING[slot];
    const source = flank === undefined ? undefined : bySlot.get(flank.from);

    if (flank !== undefined && source !== undefined) {
      // Sem rótulo: a ponta é um recorte de um projeto que já tem cartão próprio, e
      // nomeá-la de novo faria o mesmo trabalho parecer dois.
      return imageFor(source.slug, flank);
    }

    // Sem arquivo real para esta posição: painel numerado do design system.
    return {
      title: fallbackLabels[index % fallbackLabels.length] ?? '',
      thumbnail: showcasePanel(slot),
    };
  });
}
