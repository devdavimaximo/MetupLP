/**
 * Motion da primeira dobra.
 *
 * ─── DE ONDE VEM O ESPETÁCULO ───────────────────────────────────────────────────
 * De duas coisas que se sustentam: a CENA (WebGPU, ver `src/three/hero/`) e a
 * entrada do texto por cima dela. Aqui mora só a segunda.
 *
 * ⚠ E as duas são INDEPENDENTES de propósito. Nada nesta timeline segura a cena: quem
 * decide quando ela aparece é `hooks/useHeroScene.ts` (gesto + `load`) e o
 * `data-ready` que o `ScanPipeline` liga no primeiro quadro desenhado. A cena já é a
 * peça mais lenta da dobra — pendurá-la no fim de uma sequência de texto somaria os
 * dois atrasos. Pedido explícito do Davi (2026-08-28): "a única coisa que NÃO pode
 * surgir depois é a animação".
 *
 * ─── O GESTO: GLITCH, UMA PALAVRA POR VEZ ───────────────────────────────────────
 * Pedido do Davi (2026-08-28): a headline não sobe mais de dentro de uma máscara —
 * cada palavra MATERIALIZA com um glitch cibernético, o efeito PARA, e só então a
 * próxima começa. "CONSTRUA." → "AUTOMATIZE." → "CRESÇA.".
 *
 * A divisão continua sendo `SplitText` (`type: 'words,lines'`), mas sem `mask:
 * 'lines'`: a máscara existia para esconder o `yPercent` da versão anterior e agora
 * só faria mal — ela põe `overflow: hidden` em cada linha e cortaria justamente os
 * fantasmas cromáticos, que vivem alguns pixels FORA da caixa da palavra.
 *
 * ─── A DIVISÃO DE TRABALHO ENTRE TS E CSS ───────────────────────────────────────
 * O GSAP é o RELÓGIO; o CSS é a APARÊNCIA.
 *
 *  - o GSAP decide QUANDO cada palavra existe (`from({ opacity: 0 })`, que mantém as
 *    palavras seguintes escondidas até a vez delas) e liga/desliga `data-glitch="on"`
 *    nos dois instantes da janela;
 *  - o CSS (`styles/hero.css`) desenha o efeito — deslocamento, fatias e os dois
 *    fantasmas cromáticos — em `@keyframes`.
 *
 * Não é preferência de estilo: os fantasmas são `::before`/`::after` com
 * `content: attr(...)`, e pseudo-elemento não é alvo de GSAP. Ou o efeito nasce em
 * CSS, ou nasceria como dois nós de texto duplicados no `<h1>` — lixo no DOM que o
 * buscador e o leitor de tela teriam que ignorar. A janela em milissegundos viaja de
 * cá para lá por uma custom property escrita no elemento, então o TS continua sendo a
 * fonte única do tempo (§10) e não existe número duplicado para dessincronizar.
 *
 * ⚠ Animação de CSS VENCE estilo inline na cascata. É isso que faz os `@keyframes`
 * mandarem na opacidade da palavra durante a janela mesmo com o `from()` do GSAP
 * tendo escrito `opacity` no atributo `style` — e é isso que faz os dois conviverem
 * sem `!important` nenhum.
 *
 * ─── A REGRA DE SSR, APLICADA ───────────────────────────────────────────────────
 * TODO tween aqui é `gsap.from()`. Nunca `set` + `fromTo`. O HTML pré-renderizado sai
 * com o herói inteiro visível e opaco; o GSAP empresta um estado inicial depois do
 * mount e devolve o elemento ao natural. Com JS desligado, com a hidratação falhando
 * ou com o tween morto no meio, o título continua legível — e indexável. Pelo mesmo
 * motivo o glitch é um estado TRANSITÓRIO num atributo: quem nunca receber o
 * `data-glitch` vê a palavra limpa, que é o estado certo.
 *
 * ─── E O CTA ────────────────────────────────────────────────────────────────────
 * ⚠ AQUI MORA UMA TROCA CONSCIENTE CONTRA O §3, e ela foi pedida.
 *
 * Antes o CTA entrava em ~0,4s, antes de o título terminar. O Davi pediu que TODO o
 * resto (CTA, faixa de serviços, indicador) só apareça depois das três palavras — e
 * isso empurra o botão para ~3,2s com a janela atual de 0,88s por palavra (era ~1,7s
 * quando a janela era 0,38s). O §3 ("o espetáculo nunca enterra o CTA") continua de pé
 * em substância: o botão nunca sai da primeira dobra, nunca é coberto e não depende de
 * rolagem — ele só chega mais tarde. Mas ~3,2s é MUITO tempo para uma LP cuja meta é
 * contato, e essa é a primeira coisa a reabrir se a conversão decepcionar.
 *
 * O orçamento inteiro dessa espera está nas DUAS constantes de `GLITCH` abaixo, e em
 * nenhum outro lugar: encurtá-las adianta o CTA na mesma proporção, sem tocar no
 * efeito. Se a espera se mostrar cara na conversão, é ali que se mexe.
 *
 * ─── O QUE SAIU DAQUI ───────────────────────────────────────────────────────────
 * O bloom que perseguia o ponteiro. A cena faz isso agora, e melhor: o parallax é por
 * PROFUNDIDADE, não por translação de um gradiente. Duas camadas reagindo ao mesmo
 * cursor com leis diferentes lia como bug. O listener vive em `HeroScene`.
 */
import gsap from 'gsap';
import { SplitText } from 'gsap/SplitText';
import { revealCalm } from './entrance';
import { DURATION, MEDIA, STAGGER, TRAVEL, gsapEase } from './motion';
import { fadeUp, fromVars } from './presets';
import type { MotionSetup } from './useMotion';

/**
 * Ganchos de motion como atributos `data-*`, não como classes: classe de Tailwind é
 * decisão de design e muda; este contrato entre markup e timeline não.
 */
export const HERO_HOOK = {
  headline: 'data-hero-headline',
  reveal: 'data-hero-reveal',
} as const;

const SELECTOR = {
  headline: `[${HERO_HOOK.headline}]`,
  reveal: `[${HERO_HOOK.reveal}]`,
} as const;

/**
 * O CONTRATO COM O CSS — os três nomes que `styles/hero.css` conhece.
 *
 * `glitch` é o interruptor da janela (ligado no início, desligado no fim);
 * `glitchText` é o texto que os dois fantasmas duplicam via `content: attr()`;
 * `duration` entrega a janela do TS ao CSS, para o tempo não existir em dois lugares.
 *
 * A classe `hero-word` é o gancho de ESTILO (posicionamento dos fantasmas) e é
 * aplicada aqui porque quem cria estes nós é o SplitText, em tempo de execução — não
 * existe JSX onde escrevê-la.
 */
const GLITCH_DOM = {
  className: 'hero-word',
  glitch: 'data-glitch',
  glitchText: 'data-glitch-text',
  duration: '--hero-glitch-duration',
} as const;

/**
 * A CADÊNCIA — as duas únicas constantes que governam a espera do CTA.
 *
 * `window` é quanto tempo UMA palavra fica glitchando; `step` é o intervalo entre o
 * início de uma palavra e o da seguinte. Serem IGUAIS é o pedido literal do Davi: a
 * palavra seguinte só começa quando a anterior terminou de se assentar — "surge com
 * efeito, para o efeito, depois surge a próxima". Encavalá-las (`step < window`)
 * transforma a sequência num borrão de três palavras piscando ao mesmo tempo.
 *
 * 0,88s a pedido do Davi (2026-08-28: "+0,5s em cada palavra", partindo dos 0,38s
 * originais). Com três palavras a headline fecha em ~2,64s.
 *
 * ⚠ MEXER AQUI SOZINHO NÃO BASTA. A duração viaja para o CSS, mas a TEXTURA do efeito
 * mora nos degraus dos `@keyframes` (`hero.css`): eles são cortes secos (`steps`), e o
 * que faz o glitch ler como glitch é cada corte durar ~70ms. Esticar a janela sem
 * acrescentar degraus transforma o efeito num slideshow de quatro quadros parados.
 * Os degraus de lá foram reescritos junto com este número, e é assim que os dois
 * precisam continuar andando.
 *
 * Não saíram de `DURATION` de propósito: aquele conjunto é o vocabulário de ENTRADA
 * da página (0,2 / 0,5 / 0,9s) e o glitch não é uma entrada — é um efeito com ritmo
 * próprio, que não deve mudar junto quando alguém reafinar as transições do site.
 */
const GLITCH = {
  window: 0.88,
  step: 0.88,
} as const;

/**
 * Fallback da posição dos demais elementos, usado só quando não existe headline
 * (o `copy.md` sem `**Headline:**` renderiza o `<PendingContent>`). Aí não há
 * sequência para esperar e o herói volta a entrar como um movimento só.
 */
const REVEAL_WITHOUT_HEADLINE = 0.22;

/**
 * Quando a fila de baixo (subtítulo, CTA, faixa, indicador) pode começar.
 *
 * ⚠ Conta feita a partir do TEXTO, e não dos elementos que o SplitText produz, de
 * propósito: o `onSplit` é um callback, e amarrar a posição da fila ao que ele
 * escreve seria apostar que ele roda de forma síncrona dentro do `create()`. Se um
 * dia não rodar (ou rodar depois de as fontes carregarem), a fila cairia
 * silenciosamente no fallback e apareceria ANTES da headline — exatamente o que o
 * Davi pediu para não acontecer. Com a contagem vindo do texto, o instante é o mesmo
 * em qualquer cenário.
 *
 * A divisão por espaços casa com o critério de "palavra" do SplitText para esta
 * headline ("construa. automatize. cresça." → 3), que é o que precisa bater.
 */
function revealPosition(headline: HTMLElement): number {
  const words = (headline.textContent ?? '').trim().split(/\s+/u).filter((word) => word !== '');
  if (words.length === 0) return REVEAL_WITHOUT_HEADLINE;

  return GLITCH.step * (words.length - 1) + GLITCH.window;
}

export const heroMotion: MotionSetup = (matchMedia, root) => {
  matchMedia.add({ ok: MEDIA.motion, calm: MEDIA.reduce }, (context) => {
    const { ok } = context.conditions as { ok: boolean; calm: boolean };

    const headline = root.querySelector<HTMLElement>(SELECTOR.headline);
    const reveals = gsap.utils.toArray<HTMLElement>(SELECTOR.reveal, root);

    // Variante calma: revela, não desloca. NUNCA "sem animação nenhuma" — ver o
    // contrato em presets.ts. Nada aqui pode deixar conteúdo invisível. O gesto é o
    // mesmo de toda seção da página, então mora em `entrance.ts` (F3).
    //
    // O glitch fica INTEIRAMENTE de fora daqui: ele é deslocamento e corte repetidos,
    // exatamente o que `prefers-reduced-motion` pede para não acontecer (§6.6). Como
    // quem liga o `data-glitch` é o ramo de baixo, neste ramo o atributo nunca é
    // escrito e o CSS não tem o que rodar.
    if (!ok) {
      revealCalm([headline, ...reveals]);
      return;
    }

    /**
     * ⚠ NASCE PAUSADA, E ISSO É UMA CORREÇÃO MEDIDA — não asseio.
     *
     * Uma timeline começa a contar no instante em que é CRIADA, e aqui isso é dentro
     * da hidratação. O primeiro tick do GSAP depois disso chega carregando todo o
     * engasgo do trabalho de montagem (a suavização de lag do GSAP só entra acima de
     * 500ms, e o engasgo aqui fica abaixo disso), então a timeline pula direto para
     * ~0,2s no primeiro quadro em que aparece.
     *
     * MEDIDO no build de produção (Chrome, 3 execuções, quando a janela ainda era de
     * 380ms): a janela da PRIMEIRA palavra saía com **112ms, 145ms e 167ms** —
     * "CONSTRUA." mal piscava — enquanto a segunda e a terceira ficavam exatas (382ms,
     * 383ms), porque a essa altura o ticker já andava em quadros normais. O erro é um
     * OFFSET fixo de ~200ms, então ele não some sozinho ao alongar a janela: só muda de
     * proporção.
     *
     * `paused: true` + `play(0)` no PRÓXIMO tick resolve na raiz: o tick do engasgo é
     * consumido pelo `start` abaixo, e a timeline só começa a contar do quadro
     * seguinte, já em cadência normal. Custa no máximo um quadro de atraso.
     */
    const timeline = gsap.timeline({ paused: true, defaults: { ease: gsapEase('out') } });
    let revealAt = REVEAL_WITHOUT_HEADLINE;

    if (headline !== null) {
      revealAt = revealPosition(headline);

      SplitText.create(headline, {
        type: 'words,lines',
        // `aria: 'auto'` devolve o texto inteiro ao leitor de tela via aria-label.
        // Sem isso, o SplitText entrega o <h1> picotado em divs e alguns leitores
        // anunciam pedaço por pedaço — o título vira uma lista de fragmentos. É
        // também o que mantém os fantasmas cromáticos fora da leitura: eles são
        // conteúdo de pseudo-elemento dentro da subárvore que este modo esconde.
        aria: 'auto',
        // Re-divide quando a Bebas Neue carrega (font-display: swap) ou a largura
        // muda. É o que impede o título de ficar quebrado na medida da fonte de
        // fallback depois que a real chega.
        autoSplit: true,
        onSplit: (self) => {
          const words = self.words as HTMLElement[];

          // Preparar os nós acontece em TODA divisão, inclusive nas seguintes: o
          // SplitText descarta e recria estes elementos a cada re-split, e sem isto
          // uma palavra recriada perderia o posicionamento dos fantasmas. É barato e
          // não anima nada.
          for (const word of words) {
            word.classList.add(GLITCH_DOM.className);
            word.setAttribute(GLITCH_DOM.glitchText, word.textContent ?? '');
            word.style.setProperty(
              GLITCH_DOM.duration,
              `${String(Math.round(GLITCH.window * 1000))}ms`,
            );
          }

          /**
           * ⚠ A GUARDA É "A ENTRADA JÁ TERMINOU?", E NÃO "JÁ ANIMEI UMA VEZ?".
           *
           * Custou uma medição descobrir a diferença. O `autoSplit` divide DUAS vezes
           * num carregamento normal: uma na hidratação e outra quando a Bebas Neue
           * chega (`font-display: swap`) — medido em Chrome, com um MutationObserver
           * contando as gerações de nós: **1ª divisão em 1035ms, 2ª em 1410ms**, ou
           * seja, a segunda cai bem NO MEIO da entrada (que hoje dura ~2,64s).
           *
           * A cada divisão o SplitText DESTRÓI os elementos de palavra e cria outros.
           * A guarda antiga ("só a primeira divisão anima") fazia então a única coisa
           * que não podia: a segunda divisão devolvia `undefined`, os nós novos nasciam
           * sem tween e sem `data-glitch`, e a headline ficava PARADA na tela. Era o
           * defeito relatado pelo Davi — e ele já existia na versão anterior deste
           * arquivo (lá a subida rodava 375ms e morria pela metade).
           *
           * Agora a pergunta é outra: se a entrada ainda não chegou ao fim, a sequência
           * é RECONSTRUÍDA sobre os elementos novos e o playhead é devolvido ao ponto em
           * que estava — a animação continua de onde parou, com a fonte certa. Só depois
           * de `revealAt` (headline assentada) um re-split passa a ser ignorado, que é o
           * caso legítimo da guarda original: resize de janela na cara de quem está
           * lendo não pode re-executar o herói.
           */
          const elapsed = timeline.time();
          if (elapsed >= revealAt) return;

          // Timeline PRÓPRIA da headline, aninhada na principal. É o que o `onSplit`
          // devolve para o SplitText poder matá-la num re-split — devolver a timeline
          // principal levaria junto a entrada dos outros elementos, que não têm nada
          // a ver com a divisão do título.
          const headlineTimeline = gsap.timeline();

          words.forEach((word, index) => {
            const at = index * GLITCH.step;

            headlineTimeline
              // O único papel deste tween é o estado INICIAL: `immediateRender` põe a
              // palavra em `opacity: 0` já na criação da timeline, e ela fica assim
              // até a própria vez. A partir daí quem manda na opacidade é o
              // `@keyframes` (animação de CSS vence estilo inline), e no fim da
              // janela o valor natural que o `from()` deixou é o que reaparece — daí
              // a duração simbólica.
              .from(word, { opacity: 0, duration: 0.001, ease: 'none' }, at)
              .call(
                () => {
                  word.setAttribute(GLITCH_DOM.glitch, 'on');
                },
                undefined,
                at,
              )
              .call(
                () => {
                  word.removeAttribute(GLITCH_DOM.glitch);
                },
                undefined,
                at + GLITCH.window,
              );
          });

          timeline.add(headlineTimeline, 0);

          // O filho nasce na posição 0 e os `from()` já se renderizaram lá (opacity 0
          // nas três palavras). Devolver o playhead ao ponto em que a página estava é
          // o que transforma uma re-divisão em CONTINUAÇÃO em vez de recomeço: as
          // palavras que já se assentaram voltam assentadas no mesmo quadro, sem
          // piscar. Na primeira divisão `elapsed` é 0 e esta linha não faz nada.
          //
          // `time()` renderiza com os callbacks suprimidos, de propósito: sem isso a
          // varredura de 0 até `elapsed` re-dispararia os `data-glitch` de janelas que
          // já fecharam.
          timeline.time(elapsed);

          return headlineTimeline;
        },
      });
    }

    // Subtítulo, CTA, faixa de serviços e indicador de rolagem, na ordem do DOM —
    // agora DEPOIS da headline inteira, e não mais sobrepostos a ela (ver a nota
    // sobre o §3 no cabeçalho).
    //
    // `STAGGER.tight` e não `STAGGER.base`: uma vez que a fila já esperou a headline,
    // o que ela não pode é virar uma segunda fila lenta. Apertado, os quatro entram
    // como um bloco e o CTA — o segundo da lista — chega ~40ms depois do primeiro.
    if (reveals.length > 0) {
      timeline.from(
        reveals,
        fromVars(fadeUp({ travel: TRAVEL.sm, duration: DURATION.base, stagger: STAGGER.tight })
          .full),
        revealAt,
      );
    }

    // Dispara no próximo quadro do ticker — ver a nota em `paused: true`, acima.
    // `once` faz o próprio GSAP remover o ouvinte; a remoção na limpeza cobre o caso
    // de a seção desmontar ANTES de esse quadro chegar.
    const start = (): void => {
      timeline.play(0);
    };

    gsap.ticker.add(start, true);

    // O `matchMedia.revert()` desfaz tween e estilo inline, mas não sabe nada de
    // atributo. Sem isto, desmontar (ou trocar de media query) no meio de uma janela
    // deixaria um `data-glitch="on"` preso no DOM — e com ele um `@keyframes` rodando
    // para sempre num elemento que ninguém mais controla.
    return () => {
      gsap.ticker.remove(start);

      for (const word of gsap.utils.toArray<HTMLElement>(`[${GLITCH_DOM.glitch}]`, root)) {
        word.removeAttribute(GLITCH_DOM.glitch);
      }
    };
  });
};
