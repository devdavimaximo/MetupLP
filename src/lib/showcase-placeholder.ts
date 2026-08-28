/**
 * Painéis decorativos da vitrine em parallax — SVG gerado, servido como data URI.
 *
 * ─── POR QUE ISTO EXISTE, EM VEZ DE UMA IMAGEM ──────────────────────────────────
 * A vitrine pede 15 miniaturas e `public/images/` ainda não tem NENHUM screenshot de
 * projeto do Davi (só a cena do herói). O §5 do CLAUDE.md fecha as duas saídas fáceis:
 * stock/IA fingindo case está proibido, e inventar cliente também. A saída que o
 * próprio §5 prescreve é "bloco de cor do design system" — é o que este módulo
 * desenha, com a gramática da direção de arte (preto usinado, filete dourado, grade
 * de terminal). São elementos DECORATIVOS/abstratos, permitidos explicitamente: eles
 * não afirmam trabalho nenhum, não carregam logo e não passam por print de projeto.
 *
 * Está registrado em `PENDENCIAS.md`: quando os screenshots reais chegarem, trocar a
 * `thumbnail` de cada item por `/images/...` (AVIF/WebP) e apagar este arquivo.
 *
 * ─── POR QUE DATA URI, E NÃO ARQUIVO EM `public/` ───────────────────────────────
 * `public/images/` é o lugar dos assets REAIS (§5); um placeholder ali é exatamente
 * o tipo de arquivo que alguém confunde com material do cliente seis semanas depois.
 * Cada painel fecha em ~0,5 KB, então os 15 somam menos que uma requisição extra —
 * e nascem no HTML pré-renderizado sem custo de rede nem de layout shift.
 *
 * ⚠ Os hexadecimais abaixo são CÓPIA de `styles/tokens.css`. É a única duplicação
 * aceita aqui: um `<img>` com data URI é um documento isolado, e `var(--color-*)` do
 * documento hospedeiro não atravessa essa fronteira. Se a paleta mudar, mude aqui —
 * é mais uma razão para este arquivo morrer quando as imagens reais chegarem.
 */
import { padIndex } from './format';

const PANEL = { width: 600, height: 480 } as const;

/** Espelho de `--color-surface`, `--color-line`, `--color-accent`, `--color-muted`. */
const INK = {
  surface: '#0d0f10',
  sunken: '#050505',
  line: '#1a1a1a',
  accent: '#f5a623',
  muted: '#71706d',
} as const;

/** Grade de fundo: o mesmo passo de 60px em todos os painéis, para a pilha ler como um sistema. */
function grid(): string {
  const step = 60;
  const lines: string[] = [];

  for (let x = step; x < PANEL.width; x += step) {
    lines.push(`M${String(x)} 0V${String(PANEL.height)}`);
  }
  for (let y = step; y < PANEL.height; y += step) {
    lines.push(`M0 ${String(y)}H${String(PANEL.width)}`);
  }

  return `<path d="${lines.join('')}" stroke="${INK.line}" stroke-width="1"/>`;
}

/**
 * Quatro composições, alternadas pelo índice. Só geometria: nada aqui simula
 * interface de cliente — o desenho é o mesmo vocabulário do filete do `<Eyebrow>`.
 */
function artwork(variant: number): string {
  switch (variant) {
    case 0:
      return [
        `<rect x="60" y="300" width="420" height="6" fill="${INK.accent}"/>`,
        `<rect x="60" y="330" width="300" height="6" fill="${INK.line}"/>`,
        `<rect x="60" y="360" width="180" height="6" fill="${INK.line}"/>`,
      ].join('');
    case 1:
      return [
        `<rect x="150" y="90" width="300" height="300" fill="none" stroke="${INK.line}" stroke-width="2"/>`,
        `<rect x="210" y="150" width="180" height="180" fill="none" stroke="${INK.muted}" stroke-width="2"/>`,
        `<rect x="270" y="210" width="60" height="60" fill="${INK.accent}"/>`,
      ].join('');
    case 2:
      return [
        `<path d="M60 420L300 60M180 420L420 60M300 420L540 60" stroke="${INK.line}" stroke-width="10"/>`,
        `<path d="M120 420L360 60" stroke="${INK.accent}" stroke-width="10"/>`,
      ].join('');
    default: {
      const dots: string[] = [];
      for (let row = 0; row < 5; row += 1) {
        for (let column = 0; column < 7; column += 1) {
          const isAccent = row === 2 && column === 3;
          dots.push(
            `<circle cx="${String(120 + column * 60)}" cy="${String(120 + row * 60)}" r="${isAccent ? '14' : '6'}" fill="${isAccent ? INK.accent : INK.line}"/>`,
          );
        }
      }
      return dots.join('');
    }
  }
}

/**
 * Painel de índice `position` (base 1), pronto para `<img src>`.
 *
 * O numeral repete a régua de dois dígitos do resto da página (`padIndex`) e é
 * desenhado em `monospace` genérica de propósito: webfont não atravessa a fronteira
 * de um data URI, e forçar 'IBM Plex Mono' aqui daria uma substituição silenciosa
 * diferente em cada sistema.
 */
export function showcasePanel(position: number): string {
  const svg = [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${String(PANEL.width)} ${String(PANEL.height)}" width="${String(PANEL.width)}" height="${String(PANEL.height)}">`,
    `<rect width="${String(PANEL.width)}" height="${String(PANEL.height)}" fill="${INK.surface}"/>`,
    grid(),
    artwork((position - 1) % 4),
    `<rect x="40" y="40" width="56" height="3" fill="${INK.accent}"/>`,
    `<text x="${String(PANEL.width - 40)}" y="${String(PANEL.height - 36)}" text-anchor="end" font-family="monospace" font-size="64" fill="${INK.muted}" fill-opacity="0.32">${padIndex(position)}</text>`,
    `<rect width="${String(PANEL.width)}" height="${String(PANEL.height)}" fill="none" stroke="${INK.sunken}" stroke-width="2"/>`,
    '</svg>',
  ].join('');

  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}
