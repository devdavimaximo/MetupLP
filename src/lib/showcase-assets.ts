/**
 * GERADO por `npm run images` (scripts/images.mjs). NÃO editar à mão.
 *
 * Mapa do que existe em `public/images/projetos/`. Serve para o `srcset` do deck
 * nascer do disco, e não de uma lista digitada que diverge em silêncio.
 */

export interface ShowcaseAsset {
  /** Dimensões do master — vão para `width`/`height` do <img> (CLS zero). */
  readonly width: number;
  readonly height: number;
  /** Larguras realmente geradas, em ordem crescente. */
  readonly widths: readonly number[];
}

export const showcaseAssets = {
  'sistemas-1': { width: 1586, height: 992, widths: [640, 960, 1280, 1586] },
  'sistemas-10': { width: 1586, height: 992, widths: [640, 960, 1280, 1586] },
  'sistemas-11': { width: 1586, height: 992, widths: [640, 960, 1280, 1586] },
  'sistemas-12': { width: 2560, height: 1600, widths: [640, 960, 1280, 1600] },
  'sistemas-13': { width: 1586, height: 992, widths: [640, 960, 1280, 1586] },
  'sistemas-14': { width: 1586, height: 992, widths: [640, 960, 1280, 1586] },
  'sistemas-15': { width: 1586, height: 992, widths: [640, 960, 1280, 1586] },
  'sistemas-16': { width: 1586, height: 992, widths: [640, 960, 1280, 1586] },
  'sistemas-17': { width: 1586, height: 992, widths: [640, 960, 1280, 1586] },
  'sistemas-18': { width: 2752, height: 1536, widths: [640, 960, 1280, 1600] },
  'sistemas-19': { width: 2752, height: 1536, widths: [640, 960, 1280, 1600] },
  'sistemas-2': { width: 1586, height: 992, widths: [640, 960, 1280, 1586] },
  'sistemas-20': { width: 2752, height: 1536, widths: [640, 960, 1280, 1600] },
  'sistemas-3': { width: 2560, height: 1600, widths: [640, 960, 1280, 1600] },
  'sistemas-4': { width: 2560, height: 1600, widths: [640, 960, 1280, 1600] },
  'sistemas-5': { width: 1586, height: 992, widths: [640, 960, 1280, 1586] },
  'sistemas-6': { width: 1586, height: 992, widths: [640, 960, 1280, 1586] },
  'sistemas-7': { width: 1586, height: 992, widths: [640, 960, 1280, 1586] },
  'sistemas-8': { width: 1586, height: 992, widths: [640, 960, 1280, 1586] },
  'sistemas-9': { width: 1586, height: 992, widths: [640, 960, 1280, 1586] },
} as const satisfies Readonly<Record<string, ShowcaseAsset>>;

export type ShowcaseSlug = keyof typeof showcaseAssets;
