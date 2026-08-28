/**
 * Ajuste fino da cena do herói — todos os números mágicos num lugar só.
 *
 * Estão aqui, e não espalhados pelo grafo TSL, porque calibrar uma cena é um ciclo
 * de tentativa e erro: quem for mexer no brilho dos pontos precisa achar o valor sem
 * ler shader. As cores ESPELHAM `src/styles/tokens.css` — a cena é parte da direção
 * de arte, não um efeito com paleta própria.
 */

/**
 * Texturas em `public/images/hero/`.
 *
 * `scene-color` é a forma (escala de cinza com alfa) e `scene-depth` é o mapa de
 * profundidade que governa TUDO: o parallax do ponteiro e a altura onde a varredura
 * acende os pontos. Arte abstrata e decorativa — não representa trabalho de cliente
 * nenhum (CLAUDE.md §5). Procedência registrada em `PENDENCIAS.md`.
 *
 * Caminho absoluto: `public/` é servido da raiz e o SSG não reescreve estas strings.
 */
export const TEXTURE = {
  color: '/images/hero/scene-color.webp',
  depth: '/images/hero/scene-depth.webp',
} as const;

/** Dimensões da fonte. Entram na correção de aspecto da malha de pontos. */
export const SOURCE = { width: 626, height: 626 } as const;

/**
 * Cores da cena, em sRGB — os MESMOS hex de `tokens.css`.
 *
 * A conversão para o espaço linear (que é onde o shader trabalha) fica a cargo do
 * `THREE.Color`, que converte no construtor desde a r152. Escrever o valor linear à
 * mão aqui seria um número que ninguém consegue conferir contra o design system.
 */
export const SCENE_COLOR = {
  /** `--color-accent` — os pontos que a varredura acende. */
  spark: '#f5a623',
  /** `--color-bg` — fundo da cena. Igual ao da página, para o canvas emendar nela.
   *  Se `--color-bg` mudar em `tokens.css`, ESTE valor muda junto — senão aparece um
   *  retângulo de outro preto no meio da primeira dobra. */
  background: '#060606',
  /** Tinta fria do corpo da forma. Ver `bodyGain` para o porquê de ela ser apagada. */
  body: '#8fa39b',
} as const;

export const SCENE = {
  /** rad/s do relógio. 0,42 dá um ciclo de varredura de ~15s, ida e volta. */
  scanSpeed: 0.42,
  /** Meia-largura, em profundidade, da fatia que acende. Fino = linha; largo = névoa. */
  scanBand: 0.028,
  /** Densidade da malha de pontos. */
  tiling: 120,
  /** Deslocamento de UV por (profundidade × ponteiro). Sutil de propósito. */
  parallax: 0.012,
  /** Amortecimento do ponteiro, em 1/s. Maior = persegue o cursor mais rápido. */
  pointerDamping: 3.4,
  /** Fração da viewport ocupada pelo plano. */
  scale: 0.46,
  /**
   * Ganho dos pontos acesos. Precisa ultrapassar o `threshold` do bloom (ver
   * `BLOOM`) para virar brilho, mas SEM saturar as três bandas de cor — senão vira
   * literalmente branco/amarelo, não dourado.
   *
   * ─── RECALCULADO EM 2026-08-27, DUAS VEZES, JUNTO DO `--color-accent` ───────────
   * 1ª rodada (9 → 2,5): calibrada para o dourado ANTIGO (#c4a455) — ficou obsoleta
   * assim que o token virou #e8ab30, porque o mesmo gain estourava duas bandas.
   * 2ª rodada (2,5 → 1,6): calibrada para #e8ab30.
   *
   * Esta é a 3ª: o Davi pediu um dourado "ainda mais forte", e o token virou #f5a623
   * (mais saturado ainda — ver nota em `tokens.css`). `--color-accent` decodificado
   * de sRGB agora é ≈ (0,913, 0,381, 0,017) — o CANAL VERMELHO já nasce quase no teto
   * (0,913), bem diferente do dourado anterior (0,807). Isso muda a física do
   * clamping: não precisa de tanto gain para o R estourar, e um gain alto demais
   * agora estouraria o G também (o limite é 1/0,381 ≈ 2,62).
   *
   * Em 1,4: R estoura (0,913×1,4=1,28→1), G fica em 0,53 (não estoura), B em 0,02.
   * Resultado exibido ≈ (255, 193, 42) — um dourado ainda mais denso que o do ajuste
   * anterior, não mais lavado. A luminância HDR pré-clamp fica ~0,65; `BLOOM.threshold`
   * desceu de 0,65 para 0,55 para manter a margem de disparo do bloom com esse novo
   * teto.
   */
  sparkGain: 1.4,
  /**
   * Ganho do corpo da forma — o número mais importante desta lista, e ele é de
   * ACESSIBILIDADE, não só de estética. O título e o subtítulo (`--color-fg` /
   * `--color-fg-muted`) ficam por cima da forma.
   *
   * ─── AJUSTADO EM 2026-08-27, A PEDIDO DO DAVI ("deixa a animação bem visível,
   * sem opacidade") ────────────────────────────────────────────────────────────
   * O valor antigo (0,9) vinha de uma ESTIMATIVA que se provou errada ao recalcular
   * com a própria `src/lib/contrast.ts` + conversão sRGB↔linear real: o comentário
   * dizia "~5:1 no pico", a conta de verdade dava **~2,6:1** — abaixo até da AA
   * grande. Quem protegia o texto na prática, o tempo todo, era só o `.hero-scrim`.
   *
   * Como o pico da forma (quase branco) e o texto (quase branco) SEMPRE terão
   * contraste baixo entre si não importa o ganho — branco sobre branco não tem como
   * passar —, subir o ganho não piora nem melhora essa conta pré-scrim de forma
   * relevante. O que subir o ganho FAZ é tornar a forma muito mais visível fora da
   * área de texto, que é a maior parte dela — e é exatamente o que foi pedido.
   *
   * `2,4` foi escolhido medindo o PIOR CASO real — e o pior caso não é o título, é
   * o SUBTÍTULO: Puppeteer mostrou que ele estica até ~92–95% da largura da
   * viewport em telas de 768px para baixo, mais largo que o próprio `<h1>` nesses
   * tamanhos, e ele usava `--color-fg-muted` (mais escuro que o título). Isso
   * derrubou a decisão em duas frentes: o subtítulo do herói passou a usar `fg`
   * (ver `Hero.tsx`), e o `.hero-scrim` foi redesenhado para manter ~58% de mistura
   * até a borda VERDADEIRA do container (ver `styles/hero.css`).
   *
   * Com as duas mudanças, na borda o contraste fica em **5,33:1** — folgado acima
   * da AA normal (4,5:1), que é o piso que o subtítulo pede (ele não é grande o
   * bastante para usar o piso de 3:1 do texto grande). No centro, onde o scrim é
   * mais forte (75%), o contraste passa de **8,9:1**. Contas completas, para quem
   * for reajustar isto depois, em `PENDENCIAS.md`.
   */
  bodyGain: 2.4,
} as const;

/**
 * `bloom(node, strength, radius, threshold)`.
 *
 * `threshold` baixou duas vezes em 2026-08-27, sempre acompanhando `SCENE.sparkGain`
 * (ver a nota lá): primeiro 0,92 → 0,65 (dourado #e8ab30), depois 0,65 → 0,55
 * (dourado #f5a623, gain 1,4, luminância de pico ~0,65). O padrão é sempre o mesmo —
 * o gain é escolhido para preservar o matiz dourado do ponto, não para maximizar
 * luminância, então o threshold é quem se adapta para o bloom continuar disparando.
 */
export const BLOOM = { strength: 0.85, radius: 0.5, threshold: 0.55 } as const;
