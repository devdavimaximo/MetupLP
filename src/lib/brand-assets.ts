/**
 * GERADO por `npm run images` (scripts/images.mjs). NÃO editar à mão.
 *
 * Mapa do que existe em `public/images/marca/`. O brasão do header monta o
 * `srcset` a partir daqui, para que ele nasça do disco e não de uma lista
 * digitada que diverge em silêncio.
 */

export interface BrandAsset {
  /** Dimensões do master — dão a razão de aspecto do <img> (CLS zero). */
  readonly width: number;
  readonly height: number;
  /** Larguras realmente geradas, em ordem crescente. */
  readonly widths: readonly number[];
}

export const brandAssets = {
  'logometup': { width: 1080, height: 1080, widths: [32, 64, 96, 128] },
} as const satisfies Readonly<Record<string, BrandAsset>>;

export type BrandSlug = keyof typeof brandAssets;
