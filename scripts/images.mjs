/**
 * Pipeline de imagem da vitrine — `npm run images`.
 *
 * ─── POR QUE OS MASTERS SAÍRAM DE `public/` ─────────────────────────────────────
 * O Vite copia `public/` inteiro para o build, verbatim e sem otimizar. Os nove PNGs
 * como o Davi entregou somam **18,5 MB**; deixá-los ali significaria publicar 18,5 MB
 * de PNG num site cujo LCP mobile já está a 0,1s do limite (§6.2). Então:
 *
 *   assets/projetos/*.png      ← masters, versionados, NUNCA publicados
 *   public/images/projetos/    ← derivados AVIF/WebP, é o que vai ao ar
 *
 * ─── AS LARGURAS NÃO SÃO CHUTE ──────────────────────────────────────────────────
 * O cartão do deck tem 480px de largura CSS, fixos em qualquer viewport. Daí:
 *   · 640  → 480px em tela 1×, com folga
 *   · 960  → 480px em tela 2× (o caso comum: celular e notebook retina)
 *   · 1280 → as pontas, que são o mesmo arquivo ampliado (zoom ~1,7 ⇒ ~816px CSS) em 1×
 *   · 1600 → as pontas em 2×; é também o teto útil, porque sete dos nove masters
 *            têm 1586px de largura e ampliar não cria detalhe que não existe
 * Nada acima disso é gerado: seria peso sem ganho visível.
 *
 * O manifesto TypeScript é gerado junto (`src/lib/showcase-assets.ts`) para que o
 * `srcset` nasça do que EXISTE em disco, não de uma lista digitada à mão que diverge
 * silenciosamente no dia em que um master for trocado.
 */
import { mkdir, readdir, writeFile } from 'node:fs/promises';
import { basename, join } from 'node:path';
import sharp from 'sharp';

const SOURCE_DIR = 'assets/projetos';
const OUTPUT_DIR = 'public/images/projetos';
const MANIFEST = 'src/lib/showcase-assets.ts';

/** Ver a conta no cabeçalho. */
const WIDTHS = [640, 960, 1280, 1600];

/** Qualidades calibradas para screenshot de UI: texto pequeno é o que sofre primeiro. */
const QUALITY = { avif: 62, webp: 82 };

async function main() {
  await mkdir(OUTPUT_DIR, { recursive: true });

  const files = (await readdir(SOURCE_DIR)).filter((file) => /\.(png|jpe?g)$/i.test(file)).sort();
  if (files.length === 0) throw new Error(`Nenhum master em ${SOURCE_DIR}`);

  const entries = [];
  let totalBytes = 0;

  for (const file of files) {
    const slug = basename(file, file.slice(file.lastIndexOf('.')));
    const input = join(SOURCE_DIR, file);
    const image = sharp(input);
    const { width, height } = await image.metadata();

    // Ampliar não cria detalhe: o teto é a largura do próprio master.
    const widths = WIDTHS.filter((w) => w <= width);
    if (widths.length === 0) widths.push(width);
    if (!widths.includes(width) && width < Math.max(...WIDTHS)) widths.push(width);
    widths.sort((a, b) => a - b);

    for (const w of widths) {
      const resized = sharp(input).resize({ width: w, withoutEnlargement: true });
      for (const [format, quality] of Object.entries(QUALITY)) {
        const out = join(OUTPUT_DIR, `${slug}-${w}.${format}`);
        const info = await resized.clone().toFormat(format, { quality }).toFile(out);
        totalBytes += info.size;
      }
    }

    entries.push({ slug, width, height, widths });
    console.log(`  ${slug}  ${width}×${height}  →  ${widths.join(', ')}`);
  }

  const lines = [
    '/**',
    ' * GERADO por `npm run images` (scripts/images.mjs). NÃO editar à mão.',
    ' *',
    ' * Mapa do que existe em `public/images/projetos/`. Serve para o `srcset` do deck',
    ' * nascer do disco, e não de uma lista digitada que diverge em silêncio.',
    ' */',
    '',
    'export interface ShowcaseAsset {',
    '  /** Dimensões do master — vão para `width`/`height` do <img> (CLS zero). */',
    '  readonly width: number;',
    '  readonly height: number;',
    '  /** Larguras realmente geradas, em ordem crescente. */',
    '  readonly widths: readonly number[];',
    '}',
    '',
    'export const showcaseAssets = {',
    ...entries.map(
      (entry) =>
        `  '${entry.slug}': { width: ${entry.width}, height: ${entry.height}, widths: [${entry.widths.join(', ')}] },`,
    ),
    '} as const satisfies Readonly<Record<string, ShowcaseAsset>>;',
    '',
    'export type ShowcaseSlug = keyof typeof showcaseAssets;',
    '',
  ];

  await writeFile(MANIFEST, lines.join('\n'), 'utf8');

  console.log(
    `\n${String(files.length)} masters → ${String(Math.round(totalBytes / 1024))} kB de derivados em ${OUTPUT_DIR}`,
  );
  console.log(`Manifesto: ${MANIFEST}`);
}

await main();
