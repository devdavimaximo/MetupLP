/**
 * Pipeline de imagem — `npm run images`. Duas passadas: a VITRINE e a MARCA.
 *
 * ─── POR QUE OS MASTERS SAÍRAM DE `public/` ─────────────────────────────────────
 * O Vite copia `public/` inteiro para o build, verbatim e sem otimizar. Os nove PNGs
 * da vitrine como o Davi entregou somam **18,5 MB**; deixá-los ali significaria
 * publicar 18,5 MB de PNG num site cujo LCP mobile já está a 0,1s do limite (§6.2).
 * Então, para as duas passadas, a mesma disciplina:
 *
 *   assets/{projetos,marca}/*.png   ← masters, versionados, NUNCA publicados
 *   public/images/{projetos,marca}/ ← derivados AVIF/WebP, é o que vai ao ar
 *
 * O manifesto TypeScript de cada passada é gerado junto para que o `srcset` nasça do
 * que EXISTE em disco, não de uma lista digitada à mão que diverge silenciosamente no
 * dia em que um master for trocado.
 */
import { mkdir, readdir, writeFile } from 'node:fs/promises';
import { basename, join } from 'node:path';
import sharp from 'sharp';

/** Qualidades calibradas para screenshot de UI: texto pequeno é o que sofre primeiro. */
const QUALITY = { avif: 62, webp: 82 };

/**
 * Gera os derivados de UM master nas larguras pedidas, nos dois formatos.
 * Devolve as larguras realmente escritas e os bytes somados.
 */
async function derive(input, outputDir, slug, requestedWidths, masterWidth) {
  // Ampliar não cria detalhe: o teto é a largura do próprio master.
  const widths = requestedWidths.filter((w) => w <= masterWidth);
  if (widths.length === 0) widths.push(masterWidth);
  if (!widths.includes(masterWidth) && masterWidth < Math.max(...requestedWidths)) {
    widths.push(masterWidth);
  }
  widths.sort((a, b) => a - b);

  let bytes = 0;

  for (const w of widths) {
    const resized = sharp(input).resize({ width: w, withoutEnlargement: true });
    for (const [format, quality] of Object.entries(QUALITY)) {
      const out = join(outputDir, `${slug}-${w}.${format}`);
      const info = await resized.clone().toFormat(format, { quality }).toFile(out);
      bytes += info.size;
    }
  }

  return { widths, bytes };
}

/* ══════════════════════════════════════════════════════════════════════════════
   PASSADA 1 — VITRINE (`public/images/projetos/`)

   AS LARGURAS NÃO SÃO CHUTE. O cartão do deck tem 480px de largura CSS, fixos em
   qualquer viewport. Daí:
     · 640  → 480px em tela 1×, com folga
     · 960  → 480px em tela 2× (o caso comum: celular e notebook retina)
     · 1280 → as pontas, que são o mesmo arquivo ampliado (zoom ~1,7 ⇒ ~816px CSS) em 1×
     · 1600 → as pontas em 2×; é também o teto útil, porque sete dos nove masters
              têm 1586px de largura e ampliar não cria detalhe que não existe
   Nada acima disso é gerado: seria peso sem ganho visível.
   ═════════════════════════════════════════════════════════════════════════════ */

const SHOWCASE = {
  sourceDir: 'assets/projetos',
  outputDir: 'public/images/projetos',
  manifest: 'src/lib/showcase-assets.ts',
  widths: [640, 960, 1280, 1600],
};

async function buildShowcase() {
  await mkdir(SHOWCASE.outputDir, { recursive: true });

  const files = (await readdir(SHOWCASE.sourceDir))
    .filter((file) => /\.(png|jpe?g)$/i.test(file))
    .sort();
  if (files.length === 0) throw new Error(`Nenhum master em ${SHOWCASE.sourceDir}`);

  const entries = [];
  let totalBytes = 0;

  for (const file of files) {
    const slug = basename(file, file.slice(file.lastIndexOf('.')));
    const input = join(SHOWCASE.sourceDir, file);
    const { width, height } = await sharp(input).metadata();

    const { widths, bytes } = await derive(input, SHOWCASE.outputDir, slug, SHOWCASE.widths, width);
    totalBytes += bytes;

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

  await writeFile(SHOWCASE.manifest, lines.join('\n'), 'utf8');

  console.log(
    `\n${String(files.length)} masters → ${String(Math.round(totalBytes / 1024))} kB em ${SHOWCASE.outputDir}`,
  );
  console.log(`Manifesto: ${SHOWCASE.manifest}\n`);
}

/* ══════════════════════════════════════════════════════════════════════════════
   PASSADA 2 — MARCA (`public/images/marca/`)

   O símbolo da Metup (`logometup.png`, 1080×1080, 397 kB) chegou como PNG de
   exportação. Ele aparece em DOIS lugares que o carregam em TODA visita — o brasão
   do header e o favicon — então é o pior lugar possível para um PNG de 397 kB. As
   larguras vêm do tamanho REAL em que ele é desenhado, não de uma escada genérica:

     · o brasão do header mede 1,55em do wordmark, que vai de 17px a 22px
       (`--brand-wordmark` em `styles/header.css`) ⇒ 26px a 34px de CSS;
     · 32  → 1× no tamanho de tela pequena
     · 64  → 2× (o caso comum de celular/retina)
     · 96  → 3× nos aparelhos de densidade alta
     · 128 → teto: 34px CSS × 3,76 de folga; acima disso não há nada para mostrar

   O FAVICON é gerado aqui pelo mesmo motivo, e continua PNG (o `<link rel="icon">`
   quer um formato que todo navegador leia; AVIF ainda não é isso): 32px para a aba e
   180px para o atalho de iOS (`apple-touch-icon`, tamanho fixo pela plataforma).

   ⚠ `logometuphorizontal.png` fica em `assets/marca/` como MASTER e não gera nada:
   nenhuma tela usa a versão horizontal hoje. Quando o rodapé (F6) ou a imagem de OG
   (F7) precisarem dela, some uma entrada em BRAND — o master já está versionado.
   ═════════════════════════════════════════════════════════════════════════════ */

const BRAND = {
  sourceDir: 'assets/marca',
  outputDir: 'public/images/marca',
  manifest: 'src/lib/brand-assets.ts',
  /** Só o que alguma tela desenha hoje. Ver o ⚠ acima. */
  marks: [{ slug: 'logometup', widths: [32, 64, 96, 128] }],
  /** Do símbolo quadrado; PNG por exigência de `<link rel="icon">`. */
  favicons: { slug: 'logometup', sizes: [32, 180] },
};

async function buildBrand() {
  await mkdir(BRAND.outputDir, { recursive: true });

  const entries = [];
  let totalBytes = 0;

  for (const mark of BRAND.marks) {
    const input = join(BRAND.sourceDir, `${mark.slug}.png`);
    const { width, height } = await sharp(input).metadata();

    const { widths, bytes } = await derive(input, BRAND.outputDir, mark.slug, mark.widths, width);
    totalBytes += bytes;

    entries.push({ slug: mark.slug, width, height, widths });
    console.log(`  ${mark.slug}  ${width}×${height}  →  ${widths.join(', ')}`);
  }

  const faviconInput = join(BRAND.sourceDir, `${BRAND.favicons.slug}.png`);
  for (const size of BRAND.favicons.sizes) {
    const out = join(BRAND.outputDir, `favicon-${size}.png`);
    const info = await sharp(faviconInput)
      .resize({ width: size, height: size, fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png({ compressionLevel: 9, palette: true })
      .toFile(out);
    totalBytes += info.size;
    console.log(`  favicon-${size}.png  →  ${String(Math.round(info.size / 1024))} kB`);
  }

  const lines = [
    '/**',
    ' * GERADO por `npm run images` (scripts/images.mjs). NÃO editar à mão.',
    ' *',
    ' * Mapa do que existe em `public/images/marca/`. O brasão do header monta o',
    ' * `srcset` a partir daqui, para que ele nasça do disco e não de uma lista',
    ' * digitada que diverge em silêncio.',
    ' */',
    '',
    'export interface BrandAsset {',
    '  /** Dimensões do master — dão a razão de aspecto do <img> (CLS zero). */',
    '  readonly width: number;',
    '  readonly height: number;',
    '  /** Larguras realmente geradas, em ordem crescente. */',
    '  readonly widths: readonly number[];',
    '}',
    '',
    'export const brandAssets = {',
    ...entries.map(
      (entry) =>
        `  '${entry.slug}': { width: ${entry.width}, height: ${entry.height}, widths: [${entry.widths.join(', ')}] },`,
    ),
    '} as const satisfies Readonly<Record<string, BrandAsset>>;',
    '',
    'export type BrandSlug = keyof typeof brandAssets;',
    '',
  ];

  await writeFile(BRAND.manifest, lines.join('\n'), 'utf8');

  console.log(`\nMarca → ${String(Math.round(totalBytes / 1024))} kB em ${BRAND.outputDir}`);
  console.log(`Manifesto: ${BRAND.manifest}`);
}

/* ══════════════════════════════════════════════════════════════════════════════
   PASSADA 3 — LADRILHOS DA VITRINE EM ZOOM (`public/images/zoom/`)

   São as imagens que giram em volta do quadro central da seção de zoom. Regime
   DIFERENTE das outras duas passadas, e de propósito:

   · **Um arquivo por master, WebP só.** O componente da vitrine é código adotado de
     fora e desenha um `<img src>` simples, sem `srcset` nem `<picture>` — gerar uma
     escada de larguras ou um AVIF ao lado seria peso em disco que ninguém baixa.
     WebP porque é o único formato moderno que todo navegador em uso lê; com um `src`
     único, AVIF deixaria Safari 15 sem imagem.
   · **Qualidade baixa, de propósito.** Pedido explícito do Davi: "não precisa ficar
     com grande qualidade, é só ficar bem leve, ela nem vai ser aberta, nem é
     portfólio". Estes ladrilhos passam voando, em escala crescente, atrás do quadro
     central — ninguém para para olhar detalhe.
   · **1280px de teto.** Os ladrilhos crescem até 5–9× durante o zoom, mas sempre em
     movimento; acima disso o arquivo dobra de tamanho para uma nitidez que a rolagem
     come.

   ⚠ São arte DECORATIVA (cosmos, buraco negro, astronauta), não representação de
   trabalho de cliente — a distinção do §5 do CLAUDE.md. Nenhuma delas pode virar
   case sem o Davi dizer que é.
   ═════════════════════════════════════════════════════════════════════════════ */

const ZOOM = {
  sourceDir: 'assets/zoom',
  outputDir: 'public/images/zoom',
  maxWidth: 1280,
  quality: 55,
};

async function buildZoomTiles() {
  await mkdir(ZOOM.outputDir, { recursive: true });

  const files = (await readdir(ZOOM.sourceDir)).filter((file) => /\.(png|jpe?g)$/i.test(file)).sort();
  if (files.length === 0) throw new Error(`Nenhum master em ${ZOOM.sourceDir}`);

  let totalBytes = 0;

  for (const file of files) {
    const slug = basename(file, file.slice(file.lastIndexOf('.')));
    const input = join(ZOOM.sourceDir, file);
    const { width, height } = await sharp(input).metadata();

    const info = await sharp(input)
      .resize({ width: Math.min(ZOOM.maxWidth, width), withoutEnlargement: true })
      .webp({ quality: ZOOM.quality, effort: 6 })
      .toFile(join(ZOOM.outputDir, `${slug}.webp`));

    totalBytes += info.size;
    console.log(
      `  ${slug}  ${width}×${height}  →  ${info.width}×${info.height}  ${String(Math.round(info.size / 1024))} kB`,
    );
  }

  console.log(
    `\n${String(files.length)} ladrilhos → ${String(Math.round(totalBytes / 1024))} kB em ${ZOOM.outputDir}\n`,
  );
}

console.log('── vitrine ──');
await buildShowcase();
console.log('── marca ──');
await buildBrand();
console.log('\n── ladrilhos do zoom ──');
await buildZoomTiles();
