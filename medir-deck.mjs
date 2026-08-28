/**
 * Geometria do deck, por viewport:
 *  1. tamanho de LAYOUT do cartão (offsetWidth/Height — sem a rotação 3D)
 *  2. máximo de fileiras INTEIRAS na tela ao mesmo tempo, varrendo o scroll
 *  3. quanto de scroll sobra depois que o deck para de se mover (scroll morto)
 *  4. simulação: que cartão caberia em 3 fileiras nesta tela, e a fileira
 *     resultante ainda seria mais larga que a tela + o curso horizontal?
 */
import puppeteer from 'puppeteer-core';

const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const URL = 'http://localhost:4173/';
const TRAVEL = 1000; // curso horizontal das fileiras, em px (useTransform [0,1] → [0,±1000])

const VIEWPORTS = [
  { name: 'desktop 1920×1080', width: 1920, height: 1080 },
  { name: 'desktop 1920×950', width: 1920, height: 950 },
  { name: 'laptop 1440×900', width: 1440, height: 900 },
  { name: 'laptop 1366×768', width: 1366, height: 768 },
  { name: 'laptop 1280×720', width: 1280, height: 720 },
  { name: 'tablet 768×1024', width: 768, height: 1024, mobile: true },
  { name: 'phone 430×932', width: 430, height: 932, mobile: true },
  { name: 'phone 390×844', width: 390, height: 844, mobile: true },
  { name: 'phone 360×640', width: 360, height: 640, mobile: true },
];

const geometry = () => {
  const section = document.querySelector('#servicos');
  const root = section.querySelector('[data-services-block]').parentElement;
  const deck = section.querySelector('[aria-hidden="true"] > div');
  const rows = [...deck.children];
  const card = rows[0].children[0];
  return {
    cardW: card.offsetWidth,
    cardH: card.offsetHeight,
    gap: parseFloat(getComputedStyle(rows[0]).columnGap),
    rowGap: parseFloat(getComputedStyle(rows[0]).marginBottom),
    perRow: rows[0].children.length,
    containerW: root.parentElement.clientWidth,
    sectionTop: section.getBoundingClientRect().top + window.scrollY,
    sectionH: section.getBoundingClientRect().height,
    headerH: section.querySelector('[data-services-block]').offsetHeight,
    docH: document.documentElement.scrollHeight,
  };
};

const sample = () => {
  const section = document.querySelector('#servicos');
  const deck = section.querySelector('[aria-hidden="true"] > div');
  const rows = [...deck.children];
  const vh = window.innerHeight;
  let full = 0;
  for (const row of rows) {
    const rects = [...row.children].map((c) => c.getBoundingClientRect());
    const top = Math.min(...rects.map((r) => r.top));
    const bottom = Math.max(...rects.map((r) => r.bottom));
    if (top >= 0 && bottom <= vh) full += 1;
  }
  return { full, transform: getComputedStyle(deck).transform };
};

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: 'new',
  args: ['--force-device-scale-factor=1', '--hide-scrollbars'],
});

const rows = [];

for (const vp of VIEWPORTS) {
  const page = await browser.newPage();
  await page.setViewport({
    width: vp.width,
    height: vp.height,
    isMobile: vp.mobile ?? false,
    hasTouch: vp.mobile ?? false,
    deviceScaleFactor: 1,
  });
  await page.goto(URL, { waitUntil: 'networkidle0' });
  await page.evaluate(() => window.scrollTo(0, 0));
  await new Promise((r) => setTimeout(r, 700));

  const g = await page.evaluate(geometry);
  const deckH = 3 * g.cardH + 2 * g.rowGap;

  // 1) varredura fina: máximo de fileiras inteiras simultâneas
  let maxFull = 0;
  const start = Math.max(0, g.sectionTop - vp.height);
  const end = g.sectionTop + g.sectionH;
  const STEP = 60;
  const transforms = [];
  for (let y = start; y <= end; y += STEP) {
    await page.evaluate((to) => window.scrollTo(0, to), y);
    await new Promise((r) => setTimeout(r, 90));
    const s = await page.evaluate(sample);
    maxFull = Math.max(maxFull, s.full);
    transforms.push({ y, t: s.transform });
  }

  // 2) scroll morto: a partir de onde o transform do deck para de mudar até o fim
  let settled = end;
  for (let i = transforms.length - 1; i > 0; i -= 1) {
    if (transforms[i].t !== transforms[i - 1].t) {
      settled = transforms[i].y;
      break;
    }
  }
  const dead = end - settled;

  // 3) simulação das 3 fileiras sempre inteiras
  const needCardH = (vp.height - 2 * g.rowGap) / 3;
  const scale = needCardH / g.cardH;
  const needCardW = needCardH * (g.cardW / g.cardH);
  const newRowW = g.perRow * needCardW + (g.perRow - 1) * g.gap;
  const scaledTravel = TRAVEL * scale;
  const required = g.containerW + scaledTravel;

  rows.push({
    vp: vp.name,
    cartao: `${g.cardW}×${g.cardH}`,
    deckH: Math.round(deckH),
    maxFull,
    dead: Math.round(dead),
    simCartao: `${Math.round(needCardW)}×${Math.round(needCardH)}`,
    escala: scale.toFixed(2),
    fileira: Math.round(newRowW),
    precisa: Math.round(required),
    folga: Math.round(newRowW - required),
  });

  await page.close();
}

await browser.close();

console.log('\n=== HOJE ===');
console.log('viewport           cartão     altura deck  fileiras inteiras  scroll morto');
for (const r of rows) {
  console.log(
    r.vp.padEnd(18),
    r.cartao.padEnd(10),
    String(r.deckH).padEnd(12),
    String(r.maxFull).padEnd(18),
    `${String(r.dead)}px`,
  );
}

console.log('\n=== SIMULAÇÃO: 3 FILEIRAS SEMPRE INTEIRAS ===');
console.log('viewport           cartão novo  escala  fileira  precisa  folga');
for (const r of rows) {
  console.log(
    r.vp.padEnd(18),
    r.simCartao.padEnd(12),
    r.escala.padEnd(7),
    String(r.fileira).padEnd(8),
    String(r.precisa).padEnd(8),
    `${r.folga > 0 ? '+' : ''}${String(r.folga)}px ${r.folga > 0 ? 'ok' : '← BURACO'}`,
  );
}
