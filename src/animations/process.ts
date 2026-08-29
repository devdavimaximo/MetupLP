/**
 * Motion da seção de Processo — a sequência que AVANÇA com a leitura.
 *
 * ─── O GESTO ────────────────────────────────────────────────────────────────────
 * A seção é uma linha do tempo, e ela se comporta como um painel de execução: um
 * trilho dourado desce pela lateral acompanhando a rolagem, cada quadro se desenha
 * quando chega, e o passo que está sendo LIDO acende — o filete vira dourado, o
 * numeral se preenche e um numeral monumental rola no painel fixo ao lado.
 *
 * ⚠ POR QUE A SEÇÃO DEIXOU DE SER "SILENCIOSA" (2026-08-28, pedido do Davi). A
 * versão anterior era deliberadamente muda — tipografia, um filete e ar — apostando
 * que o contraste "barulho → silêncio → CTA" faria o CTA final bater. O Davi assistiu
 * à página inteira e discordou: depois do herói 3D e do deck em parallax, a seção
 * "brochava". A aposta estava errada e foi revertida. O que NÃO mudou é a régua: nada
 * aqui é uma terceira camada de espetáculo. É o mesmo vocabulário das outras seções
 * (filete que se desenha, máscara, `fadeUp`), mais DOIS mecanismos novos — o trilho
 * com scrub e o estado ativo — que existem para dar a sensação de progresso que uma
 * lista de passos parada não tem.
 *
 * ─── OS TRÊS SISTEMAS, E POR QUE SÃO TRÊS ───────────────────────────────────────
 *  1. ENTRADA (sem scrub, `once`): o cabeçalho, cada passo e o fecho com o CTA. Mesma
 *     doutrina de `services.ts` — um gatilho por bloco, porque a seção é mais alta que
 *     a janela e um gatilho único faria os últimos passos animarem longe do olho.
 *  2. TRILHO (com scrub): a única coisa amarrada à posição da rolagem. É camada
 *     DECORATIVA e `aria-hidden` — nenhuma letra depende dela para ser lida —, que é
 *     exatamente a exceção que `entrance.ts` reserva para `scrub`.
 *  3. PASSO ATIVO (gatilho de estado, sem tween): uma faixa de leitura no meio da tela
 *     decide qual passo está "em curso". O atributo vai para o DOM e quem pinta é o
 *     CSS (cor e opacidade, propriedades de PAINT, sem reflow) — e é o mesmo gatilho
 *     que roda o odômetro do painel fixo.
 *
 * ─── O ODÔMETRO NÃO MEDE NADA EM PIXEL ──────────────────────────────────────────
 * A tira do odômetro tem exatamente um numeral por passo, cada um com `height: 1em`.
 * Então a fatia de cada passo é `100 / total` por cento da ALTURA DA TIRA — e o
 * deslocamento sai de `yPercent`, sem `getBoundingClientRect`, sem depender de a fonte
 * ter carregado e sem um único `refresh()` de ScrollTrigger. Medir aqui seria trocar
 * duas linhas de aritmética por uma classe inteira de bugs de layout.
 *
 * ─── O ORÇAMENTO ────────────────────────────────────────────────────────────────
 * `scaleX`, `scaleY`, `clip-path`, `opacity`/`y` e um `yPercent`. Nenhuma propriedade
 * de layout, nenhum filtro, nenhuma imagem (§6.4). Nenhum ScrollTrigger nasce fora do
 * `mm.add()`, então `mm.revert()` continua sendo todo o cleanup necessário (§12) —
 * inclusive para os `ScrollTrigger.create()` do estado ativo.
 */
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { entranceTrigger, revealCalm } from './entrance';
import { DURATION, MEDIA, STAGGER, TRAVEL, gsapEase } from './motion';
import { drawLine, fadeUp, fromVars, maskReveal } from './presets';
import type { MotionSetup } from './useMotion';

/** Contrato entre o markup e a timeline. `data-*`, nunca classe — ver `hero.ts`. */
export const PROCESS_HOOK = {
  /** Unidade de entrada: ganha o próprio ScrollTrigger e uma timeline própria. */
  block: 'data-process-block',
  /** Título da seção e CTA: sobem discretamente, no começo do bloco. */
  fade: 'data-process-fade',
  /** Filete horizontal que se desenha da esquerda: o do cabeçalho e o de cada quadro. */
  line: 'data-process-line',
  /** Numeral e nome do passo, revelados por máscara. */
  cluster: 'data-process-cluster',
  /** A frase do passo. */
  body: 'data-process-body',
  /** Coluna dos passos — é ela que mede o progresso do trilho. */
  track: 'data-process-track',
  /**
   * O TRILHO (o filete apagado de fundo). Nunca é animado: existe para ser MEDIDO.
   *
   * ⚠ Ele e o preenchimento são dois nós separados por um motivo mecânico, não
   * estético. `getBoundingClientRect` devolve a caixa JÁ TRANSFORMADA, então usar o
   * preenchimento como `endTrigger` do próprio tween é um laço: no `refresh`, o
   * `scaleY: 0` inicial faz a caixa medir zero, `start` e `end` colapsam no mesmo
   * ponto e o trilho nasce 100% desenhado em qualquer rolagem. Aconteceu — o
   * medidor ficava cheio a seção inteira e o defeito era invisível no código.
   */
  rail: 'data-process-rail',
  /** Preenchimento dourado do trilho. Único alvo com scrub da seção. */
  spine: 'data-process-spine',
  /** Um passo. O VALOR é a posição dele (0, 1, 2…), usada pelo odômetro. */
  step: 'data-process-step',
  /** A tira de numerais do painel fixo. */
  counter: 'data-process-counter',
  /**
   * ESCRITO PELO JS, lido pelo CSS: `true` no passo que está na faixa de leitura.
   *
   * Mora no mapa mesmo não sendo um seletor de busca porque é contrato igual aos
   * outros — `process.css` depende do nome exato, e um rename silencioso aqui
   * apagaria o estado ativo inteiro sem quebrar nada em tempo de compilação.
   */
  active: 'data-process-active',
} as const;

const SELECTOR = {
  block: `[${PROCESS_HOOK.block}]`,
  fade: `[${PROCESS_HOOK.fade}]`,
  line: `[${PROCESS_HOOK.line}]`,
  cluster: `[${PROCESS_HOOK.cluster}]`,
  body: `[${PROCESS_HOOK.body}]`,
  track: `[${PROCESS_HOOK.track}]`,
  rail: `[${PROCESS_HOOK.rail}]`,
  spine: `[${PROCESS_HOOK.spine}]`,
  step: `[${PROCESS_HOOK.step}]`,
  counter: `[${PROCESS_HOOK.counter}]`,
} as const;

/**
 * Posição de cada grupo dentro da timeline do bloco, em segundos. Mesmas defasagens
 * curtas de `services.ts` — a página inteira entra na mesma cadência, e um passo lê
 * como um gesto só em vez de três ondas separadas. O filete puxa, o numeral e o nome
 * sobem atrás, a frase fecha.
 */
const AT = {
  fade: 0,
  line: 0,
  cluster: 0.06,
  body: 0.14,
} as const;

/**
 * A FAIXA DE LEITURA — onde um passo passa a contar como "em curso".
 *
 * 62% da altura da janela, e a mesma marca abre e fecha a faixa. Como os passos são
 * contíguos no layout (o respiro entre eles é `padding-bottom` do próprio `<li>`, ver
 * `process.css`), o fim da faixa de um passo é exatamente o começo da faixa do
 * seguinte: em qualquer instante há UM passo ativo, nunca dois nem nenhum. Um valor
 * diferente para `start` e `end` abriria vãos (nenhum aceso) ou sobreposições (dois
 * acesos) — e as duas leituras fazem o odômetro tremer.
 *
 * A marca fica ABAIXO do meio da tela de propósito: o passo acende quando o título
 * dele sobe até a zona onde a pessoa realmente lê, não quando ele espia pela borda.
 */
const ACTIVE_MARK = '62%';

/** Todos os alvos de motion de um escopo, na ordem em que a timeline os usa. */
function targetsIn(scope: HTMLElement) {
  return {
    fades: gsap.utils.toArray<HTMLElement>(SELECTOR.fade, scope),
    lines: gsap.utils.toArray<HTMLElement>(SELECTOR.line, scope),
    clusters: gsap.utils.toArray<HTMLElement>(SELECTOR.cluster, scope),
    bodies: gsap.utils.toArray<HTMLElement>(SELECTOR.body, scope),
  };
}

export const processMotion: MotionSetup = (matchMedia, root) => {
  /**
   * `wide` entra nas condições sem ser LIDO, e é de propósito.
   *
   * O painel fixo é `display: none` abaixo de 64rem (ver `process.css`), e o retângulo
   * de um elemento escondido é 0×0 — um ScrollTrigger montado sobre ele nasce com
   * posição zero e dispara no topo da página. Declarando a largura como condição, o
   * `matchMedia` REVERTE e remonta tudo ao cruzar o breakpoint, então os gatilhos são
   * sempre criados contra um layout que existe. É a mesma rede para quem gira o
   * aparelho ou arrasta a janela por cima de 64rem.
   */
  matchMedia.add({ ok: MEDIA.motion, calm: MEDIA.reduce, wide: MEDIA.lgUp }, (context) => {
    const { ok } = context.conditions as { ok: boolean; calm: boolean; wide: boolean };

    // ── 1. Entrada ────────────────────────────────────────────────────────────
    if (ok) {
      for (const block of gsap.utils.toArray<HTMLElement>(SELECTOR.block, root)) {
        const { fades, lines, clusters, bodies } = targetsIn(block);

        const timeline = gsap.timeline({
          defaults: { ease: gsapEase('out') },
          scrollTrigger: entranceTrigger(block),
        });

        if (fades.length > 0) {
          timeline.from(fades, fromVars(fadeUp({ travel: TRAVEL.sm }).full), AT.fade);
        }

        if (lines.length > 0) {
          timeline.from(lines, fromVars(drawLine().full), AT.line);
        }

        if (clusters.length > 0) {
          timeline.from(
            clusters,
            fromVars(maskReveal({ stagger: STAGGER.tight }).full),
            AT.cluster,
          );
        }

        if (bodies.length > 0) {
          timeline.from(bodies, fromVars(fadeUp({ travel: TRAVEL.sm }).full), AT.body);
        }
      }
    } else {
      const { fades, lines, clusters, bodies } = targetsIn(root);
      revealCalm([...fades, ...lines, ...clusters, ...bodies]);
    }

    // ── 2. Trilho de progresso ────────────────────────────────────────────────
    /**
     * O único scrub da seção, e ele é legítimo: o trilho é `aria-hidden`, não carrega
     * texto e não esconde nada — parar no meio da rolagem deixa uma linha dourada pela
     * metade, que é justamente a informação que ela existe para dar.
     *
     * `gsap.from()` (e não `fromTo`) mantém a regra de SSR do §12 valendo até aqui: o
     * estado natural do HTML é o trilho INTEIRO desenhado, então sem JS, sem hidratação
     * ou em movimento reduzido a lateral é uma linha dourada sólida — nunca um vazio.
     * `start` é o padrão de `entrance.ts` de propósito: só `end`, `scrub` e `once`
     * mudam, porque um medidor de progresso precisa viver enquanto a coluna passa.
     *
     * `endTrigger` é o TRILHO (`rail`), e nem a coluna nem o preenchimento:
     *  · a COLUNA termina depois do último passo (o respiro que segura o painel fixo,
     *    ver `--process-gap` em `process.css`), então medir por ela faria o dourado
     *    completar num vazio, já longe do texto;
     *  · o PREENCHIMENTO é o próprio alvo do tween, e medi-lo é o laço descrito em
     *    `PROCESS_HOOK.rail` — o medidor nascia cheio.
     * O trilho termina onde o passo 04 termina, que é exatamente onde "o processo
     * acabou" precisa ser verdade.
     */
    const rail = root.querySelector<HTMLElement>(SELECTOR.rail);
    const spine = root.querySelector<HTMLElement>(SELECTOR.spine);
    const track = root.querySelector<HTMLElement>(SELECTOR.track);

    if (ok && rail !== null && spine !== null && track !== null) {
      gsap.from(spine, {
        scaleY: 0,
        ease: 'none',
        scrollTrigger: entranceTrigger(track, {
          endTrigger: rail,
          end: `bottom ${ACTIVE_MARK}`,
          once: false,
          scrub: 0.4,
        }),
      });
    }

    // ── 3. Passo ativo + odômetro ─────────────────────────────────────────────
    /**
     * Vale nos DOIS ramos, inclusive em movimento reduzido, porque não é movimento: é
     * a página dizendo onde a pessoa está. O que muda é como o numeral do painel troca
     * — com um deslize curto no ramo normal, com um corte seco (`gsap.set`) no calmo.
     * A alternativa (não trocar nada) deixaria um "01" parado ao lado do passo 04.
     */
    const steps = gsap.utils.toArray<HTMLElement>(SELECTOR.step, root);
    const counter = root.querySelector<HTMLElement>(SELECTOR.counter);
    const total = steps.length;

    const moveCounter = (index: number): void => {
      if (counter === null || total === 0) return;

      // Um numeral por passo, cada um com `height: 1em` → a fatia de um passo é
      // `100 / total` por cento da tira. Ver a nota do cabeçalho.
      const yPercent = (-100 * index) / total;

      if (ok) {
        gsap.to(counter, {
          yPercent,
          duration: DURATION.base,
          ease: gsapEase('out'),
          overwrite: true,
        });
      } else {
        gsap.set(counter, { yPercent });
      }
    };

    /** `index === -1` apaga todos: é o estado de antes do primeiro passo. */
    const setActive = (index: number): void => {
      for (const [position, node] of steps.entries()) {
        node.setAttribute(PROCESS_HOOK.active, String(position === index));
      }
      moveCounter(index === -1 ? 0 : index);
    };

    for (const [index, step] of steps.entries()) {
      ScrollTrigger.create({
        trigger: step,
        start: `top ${ACTIVE_MARK}`,
        end: `bottom ${ACTIVE_MARK}`,
        onEnter: () => {
          setActive(index);
        },
        onEnterBack: () => {
          setActive(index);
        },
        // Só o primeiro passo apaga a seção ao sair por cima. Nos demais, sair para
        // trás é entrar no anterior, e o `onEnterBack` dele já resolve o estado.
        onLeaveBack:
          index === 0
            ? () => {
                setActive(-1);
              }
            : undefined,
      });
    }
  });
};
