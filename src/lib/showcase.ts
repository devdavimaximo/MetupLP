/**
 * O deck da vitrine — quais arquivos entram em quais das 21 posições.
 *
 * ─── O MAPA DE POSIÇÕES É MEDIDO, NUNCA PALPITADO ───────────────────────────────
 * Nem toda posição do deck é vista por inteiro: cada fileira é mais larga que a tela
 * de propósito, e as pontas cortadas fazem a vitrine sugerir mais trabalho do que
 * mostra — o que serve a uma agência que constrói dashboard, CRM e ERP e não pode
 * abrir a tela de cliente. Saber QUAIS posições são lidas é o que permite gastar um
 * screenshot só onde ele é visto.
 *
 * A primeira versão do mapa veio da observação do Davi rolando a página (fileiras de
 * 5). Com fileiras de 7, ele foi REMEDIDO no Chrome — 9 viewports, varredura de
 * 40–60px — e as posições mudaram. Os números estão em `VISIBLE_SLOTS`,
 * `MOBILE_SLOTS` e `HIDDEN_SLOTS`.
 *
 * A consequência é o desenho deste módulo:
 *
 *  · `VISIBLE_SLOTS` (13) têm prioridade para receber arquivo próprio. Hoje existem 12
 *    arquivos, então 12 delas têm o seu e uma repete.
 *  · `HIDDEN_SLOTS` (8) recebem cópias. Enquanto houver menos arquivos que posições, é
 *    onde a repetição custa menos — nenhum desktop mostra essas por inteiro.
 *  · A posição 2 de cada fileira é a ÚNICA que o celular lê inteira. Como ela também é
 *    lida no desktop, uma ordenação só serve aos dois — os projetos mais fortes vão
 *    para ela, e nenhuma reordenação por media query é necessária.
 *
 * **Para acabar com a repetição são precisos 21 arquivos** (ou 24, se o alvo passar a
 * incluir monitor ultrawide de 3440px, que hoje mostra buraco na lateral — ver
 * `PENDENCIAS.md`).
 *
 * ─── OS OITO NOVOS (2026-09-01) ─────────────────────────────────────────────────
 * Com `sistemas-13` a `sistemas-20`, 19 dos 20 arquivos existentes já cabem em posição
 * própria: as 13 `VISIBLE_SLOTS` (a 19, que repetia `sistemas-11`, agora tem o seu) e 6
 * das 8 `HIDDEN_SLOTS`. Sobra UMA repetição, no slot 21 (fileira 3) — não há arquivo
 * suficiente para as 21 posições ainda. `sistemas-20` foi o escolhido para o slot 19 por
 * ser, como os demais `sistemas-13..19`, ainda sem julgamento visual do Davi na tela
 * real — a ordem dos oito é apenas numérica, ao contrário dos slots 2–18 (ver acima).
 *
 * ─── SEM ARQUIVO PARA UMA POSIÇÃO ───────────────────────────────────────────────
 * Se `projects` e `REPEAT_SOURCE` não cobrirem um slot, ele cai no painel numerado do
 * design system (`showcase-placeholder.ts`), com o próprio número — o que mantém o
 * deck navegável e preserva a numeração usada para dar feedback.
 */
import type { ShowcaseItem } from '../components/ui/hero-parallax';
import { showcaseAssets, type ShowcaseSlug } from './showcase-assets';
import { showcasePanel } from './showcase-placeholder';

/** Três fileiras de sete. O porquê do sete está em `HeroParallax`. */
export const DECK_SIZE = 21;

/**
 * Posições que aparecem INTEIRAS em algum desktop. Medido no Chrome, varredura de
 * scroll de 40–60px, 9 viewports de 1280×720 a 1920×1080:
 *   1920×1080 e 1440×900 → 2,3,4 · 9,10,11 · 16,17,18
 *   1920×950, 1366×768 e 1280×720 → acrescentam 5, 8, 12 e 19
 * São 13 posições. Elas têm prioridade na hora de gastar um arquivo próprio.
 */
export const VISIBLE_SLOTS = [2, 3, 4, 5, 8, 9, 10, 11, 12, 16, 17, 18, 19] as const;

/** As três que o CELULAR lê. Reservadas aos projetos mais fortes. */
export const MOBILE_SLOTS = [2, 9, 16] as const;

/**
 * Posições que NENHUM desktop mostra por completo. É para cá que vai a repetição:
 * enquanto houver menos arquivos que slots, é aqui que ela custa menos.
 */
export const HIDDEN_SLOTS = [1, 6, 7, 13, 14, 15, 20, 21] as const;

/**
 * Qual posição cada slot sem arquivo próprio REPETE, inteira.
 *
 * ─── A TENTATIVA ANTERIOR, E POR QUE ELA CAIU ───────────────────────────────────
 * Estes slots já foram RECORTES AMPLIADOS do vizinho (`transform-origin` + zoom). A
 * ideia era "mesmo arquivo, tile diferente, zero byte a mais". Não sobreviveu ao teste
 * do Davi no desktop: o recorte lê como **imagem cortada**, e como repetia um cartão
 * ali perto, o olho ligava os dois. Um deck que existe para provar capricho não pode
 * ter tile que pareça erro de enquadramento. Hoje todo cartão mostra o screenshot
 * inteiro.
 *
 * ─── AS DUAS REGRAS QUE GOVERNAM ESTE MAPA ──────────────────────────────────────
 * 1. **Nenhum arquivo aparece duas vezes na MESMA fileira.** Cada fileira mostra 7
 *    arquivos distintos — a cópia sempre cai noutra fileira, deslocada na horizontal,
 *    que é onde ela some.
 * 2. **A repetição mora em `HIDDEN_SLOTS`.** Com os oito arquivos novos (ver acima),
 *    só falta UM arquivo para as 21 posições — o slot 21 repete `sistemas-3` (fileira
 *    2). O slot 17 se soma a esta lista por outro motivo: não falta arquivo, o Davi
 *    reprovou `sistemas-7` na tela (2026-09-01) e pediu para tirá-lo do deck até
 *    decidir o que entra no lugar; repete `sistemas-19` (slot 8, fileira 2) enquanto
 *    isso.
 *
 * O valor é a POSIÇÃO de origem, não o arquivo: assim `projects` continua sendo o
 * único lugar onde a ordem mora, e trocar dois slugs lá reposiciona a cópia sozinha.
 */
const REPEAT_SOURCE: Readonly<Record<number, number>> = {
  // Fileira 3 — slots 15–21.
  17: 8,
  21: 3,
};

export interface ShowcaseProject {
  /** Posição no deck. Deve ser uma de `VISIBLE_SLOTS` enquanto sobrarem posições lá. */
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
 * Os 20 arquivos, um por posição — das 21, sobra só o slot 21, que repete (ver
 * `REPEAT_SOURCE`).
 *
 * ─── A ORDEM DAS 9 PRIMEIRAS É DO DAVI, VENDO A TELA ────────────────────────────
 * A proposta inicial vinha de duas restrições cruzadas: os três SISTEMAS nas posições
 * que o celular lê (02, 09, 16), e nunca dois screenshots claros juntos. O Davi rolou
 * a página e trocou quatro pares. **Julgamento visual na tela real ganha da regra
 * escrita antes de ver** — os slots 2, 3, 4, 9, 10, 16 e 18 são a ordem dele e não
 * foram tocados desde então. O slot 11 foi reaberto em 2026-09-01, a pedido dele mesmo
 * (ver OS OITO NOVOS abaixo) — recebeu `sistemas-18` no lugar de `sistemas-8`.
 *
 * ⚠ CORREÇÃO DE UM DADO QUE ESTAVA ERRADO AQUI: eu havia registrado TRÊS screenshots
 * claros (`-2`, `-6`, `-7`). Medindo a luminância média de cada master, eram **dois**:
 * `sistemas-2` (198) e `sistemas-6` (219) — o `sistemas-7` (29, escuro) saiu do deck
 * em 2026-09-01 (ver abaixo), então a distinção não importa mais aqui, só o fato de os
 * dois claros ficarem nas posições 03 e 04, vizinhas e as duas visíveis em qualquer
 * desktop — o ponto que o Davi já tinha estranhado, e que continua sendo decisão dele.
 *
 * ─── OS TRÊS NOVOS (2026-08-28) ─────────────────────────────────────────────────
 * Entraram nos slots 5, 8 e 12 — as posições que só notebook largo e baixo mostra
 * inteiras. É onde um arquivo novo rende mais sem mexer na ordem já aprovada.
 *
 * `sistemas-10` era o MESMO dashboard do extinto `sistemas-7` (ClimaTech, "Bom dia,
 * Gabriel", os mesmos 28/16/42/7), noutra variação de tema — o motivo original de tê-lo
 * posto longe, no slot 12. Com o `-7` fora do deck, essa preocupação não existe mais.
 *
 * ─── OS OITO NOVOS (2026-09-01) ─────────────────────────────────────────────────
 * `sistemas-13` a `sistemas-20` entraram nos slots 1, 6, 7, 13, 14, 15, 19 e 20 — os
 * sete `HIDDEN_SLOTS` que ainda repetiam, mais o slot 19 (visível), que repetia
 * `sistemas-11`. A ordem entre eles era apenas numérica: ao contrário dos slots 2–18,
 * estes oito não tinham passado pelo julgamento visual do Davi na tela real.
 *
 * No mesmo dia ele reprovou `sistemas-7` (ver `REPEAT_SOURCE`) e pediu três trocas de
 * posição, já vendo a tela: `sistemas-18` ↔ `sistemas-8`, `sistemas-16` ↔ `sistemas-11`
 * e `sistemas-19` ↔ `sistemas-12`. É julgamento visual real, então essas seis peças
 * (mais o 11, reaberto por causa da primeira troca) saem do grupo "ordem só numérica".
 *
 * Só o slot 21 continua repetindo (ver `REPEAT_SOURCE`) — falta um 21º arquivo.
 *
 * Trocar a ordem é trocar o `slug` de duas linhas aqui. Nada mais depende dela.
 */
export const projects: readonly ShowcaseProject[] = [
  // Fileira 1 — as duas claras estão em 03 e 04.
  { slot: 1, slug: 'sistemas-14', label: '' },
  { slot: 2, slug: 'sistemas-9', label: '' },
  { slot: 3, slug: 'sistemas-6', label: '' },
  { slot: 4, slug: 'sistemas-2', label: '' },
  { slot: 5, slug: 'sistemas-16', label: '' },
  { slot: 6, slug: 'sistemas-15', label: '' },
  { slot: 7, slug: 'sistemas-11', label: '' },
  // Fileira 2.
  { slot: 8, slug: 'sistemas-19', label: '' },
  { slot: 9, slug: 'sistemas-1', label: '' },
  { slot: 10, slug: 'sistemas-3', label: '' },
  { slot: 11, slug: 'sistemas-18', label: '' },
  { slot: 12, slug: 'sistemas-10', label: '' },
  { slot: 13, slug: 'sistemas-17', label: '' },
  { slot: 14, slug: 'sistemas-8', label: '' },
  // Fileira 3.
  { slot: 15, slug: 'sistemas-12', label: '' },
  { slot: 16, slug: 'sistemas-5', label: '' },
  // slot 17: `sistemas-7` reprovado (ver `REPEAT_SOURCE`); repete `sistemas-19` (slot 8)
  // até o Davi decidir o que entra no lugar.
  { slot: 18, slug: 'sistemas-4', label: '' },
  { slot: 19, slug: 'sistemas-20', label: '' },
  { slot: 20, slug: 'sistemas-13', label: '' },
];

/**
 * `sizes` — o MESMO para todo cartão, e cada número foi medido.
 *
 * A largura do cartão sai de `clamp(9rem, 26svh, 18,75rem) × 1,6` (ver
 * `styles/showcase.css`), então quem manda é a ALTURA da tela — daí `max-height`.
 * Cada faixa declara o TOPO dela, nunca menos que o real: declarar a menos faria o
 * navegador escolher um arquivo pequeno demais e o cartão sairia borrado.
 *
 * ⚠ Um `sizes` por cartão seria pior, e isso foi medido: quando cada um declarava um
 * tamanho diferente, o mesmo master vinha em DUAS larguras na mesma página — 18
 * requisições onde deviam existir 9. Com um valor único, o navegador escolhe um
 * arquivo por master.
 *
 * Os números encolheram quando as pontas deixaram de ser recortes ampliados: antes
 * era preciso declarar `largura × 1,7` para o zoom não borrar, e o desktop em 2×
 * baixava 660 kB. Sem zoom, o cartão pede exatamente a largura que ocupa e o mesmo
 * desktop baixa 336 kB.
 */
const SIZES = [
  '(max-width: 640px) 320px',
  '(max-height: 700px) 320px',
  '(max-height: 900px) 400px',
  '480px',
].join(', ');

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
function imageFor(slug: ShowcaseSlug): ShowcaseItem {
  const asset = showcaseAssets[slug];
  const fallback = asset.widths.find((width) => width >= 960) ?? asset.widths[asset.widths.length - 1];

  return {
    title: '',
    thumbnail: `/images/projetos/${slug}-${String(fallback)}.webp`,
    sources: [
      { type: 'image/avif', srcSet: srcSetFor(slug, 'avif') },
      { type: 'image/webp', srcSet: srcSetFor(slug, 'webp') },
    ],
    sizes: SIZES,
    width: asset.width,
    height: asset.height,
  };
}

/**
 * Monta as 21 posições do deck.
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

    const from = REPEAT_SOURCE[slot];
    const source = from === undefined ? undefined : bySlot.get(from);

    if (source !== undefined) {
      // Sem rótulo: este slot repete um projeto que já tem cartão próprio, e nomeá-lo
      // de novo faria o mesmo trabalho parecer dois.
      return imageFor(source.slug);
    }

    // Sem arquivo real para esta posição: painel numerado do design system.
    return {
      title: fallbackLabels[index % fallbackLabels.length] ?? '',
      thumbnail: showcasePanel(slot),
    };
  });
}
