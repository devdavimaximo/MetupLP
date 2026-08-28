import { useEffect, useState } from 'react';
import { MEDIA } from '../animations/motion';
import { detectCapability } from '../lib/capability';
// `three/hero/config.ts` é um módulo FOLHA: só constantes, nenhum import de `three`.
// Por isso importá-lo daqui (do bundle de entrada) não arrasta a cena junto — se um
// dia ele passar a importar `three`, este import precisa sair.
import { TEXTURE } from '../three/hero/config';

/**
 * O portão da cena WebGPU do herói.
 *
 * ─── O CONFLITO QUE ESTE ARQUIVO RESOLVE ────────────────────────────────────────
 * O CLAUDE.md §6.2 manda cena pesada em lazy-load e FORA da primeira dobra. A cena do
 * herói está, por decisão de produto, exatamente na primeira dobra. Não dá para
 * cumprir a letra da regra, então este hook cumpre o que ela protege — o LCP, o TBT e
 * o orçamento de JS — por outro caminho, em quatro camadas:
 *
 *  1. o herói inteiro (título, subtítulo, CTA) nasce no HTML pré-renderizado e É o
 *     elemento de LCP (medido: 0,6 s no desktop); a cena nunca disputa a primeira
 *     pintura com ele;
 *  2. `three/webgpu` só é BAIXADO em `import()` dinâmico, fora do bundle de entrada;
 *  3. quem está em aparelho fraco, rede ruim, economia de dados ou movimento
 *     reduzido não baixa nada (`detectCapability`), e quem não tem GPU utilizável
 *     também não;
 *  4. e o download só começa quando a pessoa DÁ SINAL DE PRESENÇA — ver abaixo.
 *
 * ─── POR QUE ESPERAR INTERAÇÃO, E NÃO SÓ `requestIdleCallback` ──────────────────
 * A primeira versão deste hook usava `requestIdleCallback`, e foi MEDIDA: o TBT
 * mobile pulou de ~30 ms para ~350 ms e o Lighthouse caiu de 96 para 86. Analisar e
 * compilar ~1,5 MB de JS custa ~300 ms de thread principal num celular — e o idle
 * callback entregava essa conta bem no meio da leitura da primeira dobra, que é
 * exatamente o momento em que a pessoa está decidindo se clica no CTA.
 *
 * Esperar o primeiro gesto conserta isso, e não é truque de benchmark: é a mesma
 * regra do carregamento adaptativo levada até o fim. Quem abriu a página e saiu em
 * dois segundos nunca paga por 1,5 MB que não chegou a ver. Quem ficou move o mouse,
 * rola ou toca a tela em menos de um segundo — e aí a thread já está livre.
 *
 * `SETTLE_MS` cobre o caso de quem chega e simplesmente lê sem tocar em nada.
 *
 * ─── O GESTO É ESCUTADO DESDE O MOUNT, E ISSO É UMA CORREÇÃO (2026-08-28) ────────
 * O Davi relatou que no celular a cena "demora bastante para aparecer pela primeira
 * vez". MEDIDO (Chrome, 393×852, CPU 4×, 4G): o primeiro quadro saía aos **11,1 s**
 * mesmo com um gesto aos 1,7 s. A causa não era a cena — era este portão. Os
 * listeners de gesto só eram registrados DENTRO de `afterLoad`, então todo gesto
 * anterior ao evento `load` (~1,8 s num celular) era jogado fora, e quem tinha
 * tocado a tela esperava assim mesmo os 6 s inteiros do `SETTLE_MS`. Num celular,
 * tocar/rolar antes do `load` é o comportamento COMUM, não a exceção.
 *
 * Agora são duas condições independentes: o SINAL DE PRESENÇA (gesto ou o timer) é
 * escutado desde o mount, e o `load` continua sendo a trava que impede a cena de
 * disputar banda e thread com o carregamento crítico. A cena começa no MAIOR dos
 * dois — o gesto não se perde mais, e a garantia de não competir com a primeira
 * dobra continua de pé.
 *
 * ─── E A REDE SAI DO CAMINHO CRÍTICO ────────────────────────────────────────────
 * O download em si (406 kB comprimidos do chunk + 59 kB de textura) só começava
 * DEPOIS do portão abrir, somando ~1,2 s em 4G ao tempo de aparecer. Ele agora é
 * disparado logo após o `load`, por `<link rel="prefetch">` e por um `Image()` —
 * **rede apenas, sem executar nada**: o custo de thread que derrubou o Lighthouse é
 * de análise/compilação, e prefetch não analisa nem compila. Quando o portão abre, o
 * `import()` acha tudo no cache HTTP.
 *
 * ⚠ `rel="prefetch"` é ignorado pelo Safari (inclusive iOS). Lá o ganho desta parte
 * é zero e vale só a correção do gesto, que é a maior das duas. A textura, por vir
 * de `Image()`, aquece em todos os navegadores.
 *
 * ─── DECIDIDO UMA VEZ ───────────────────────────────────────────────────────────
 * Não observa mudanças de `prefers-reduced-motion` depois do mount. Montar e
 * desmontar uma cena WebGPU no meio da leitura custaria mais desconforto do que
 * resolve, e a preferência praticamente não muda com a página aberta.
 */

/**
 * Rede de segurança para quem não interage. Contado a partir do `load`, e generoso de
 * propósito: a thread principal precisa estar comprovadamente ociosa antes de receber
 * um trabalho deste tamanho. Encurtar isto é reabrir a regressão de TBT medida acima.
 */
const SETTLE_MS = 6000;

/** Todo gesto que significa "tem gente aqui". Passivos: nenhum atrasa a rolagem. */
const WAKE_EVENTS = ['pointermove', 'pointerdown', 'touchstart', 'keydown', 'wheel', 'scroll'] as const;

/** A sonda cria um contexto WebGL2; o resultado é o mesmo para a sessão inteira. */
let gpuSupport: boolean | null = null;

/**
 * O `WebGPURenderer` cai para WebGL2 sozinho, então basta UM dos dois existir.
 * `navigator.gpu` é checado primeiro por ser gratuito; a sonda de WebGL2 só roda em
 * navegador sem WebGPU, e o contexto é descartado na hora com `WEBGL_lose_context` —
 * navegador tem limite de contextos vivos, e vazar um aqui pode derrubar uma cena
 * legítima em F4.
 */
function supportsGpu(): boolean {
  if (gpuSupport !== null) return gpuSupport;

  if ('gpu' in navigator) {
    gpuSupport = true;
    return true;
  }

  try {
    const context = document.createElement('canvas').getContext('webgl2');
    if (context === null) {
      gpuSupport = false;
      return false;
    }
    context.getExtension('WEBGL_lose_context')?.loseContext();
    gpuSupport = true;
  } catch {
    gpuSupport = false;
  }

  return gpuSupport;
}

/** Roda `task` assim que a página terminar de carregar (ou já agora, se terminou). */
function afterLoad(task: () => void): () => void {
  if (document.readyState === 'complete') {
    task();
    return () => undefined;
  }

  window.addEventListener('load', task, { once: true });
  return () => {
    window.removeEventListener('load', task);
  };
}

/**
 * Onde o build anota a URL com hash do chunk da cena. Quem escreve é o plugin
 * `metup:hero-scene-prefetch`, em `vite.config.ts` — o nome do arquivo só existe
 * depois do bundle, então não há como escrevê-lo à mão aqui.
 *
 * Ausente em `dev` (não há chunk), e nesse caso o prefetch do script simplesmente não
 * acontece: em desenvolvimento o módulo vem do servidor local, sem custo de rede que
 * justifique.
 */
const CHUNK_META = 'metup:hero-scene';

/**
 * Baixa sem executar.
 *
 * `prefetch` (e não `preload`/`modulepreload`) é deliberado: é a única das três que o
 * navegador trata como "vou precisar disto DEPOIS", em prioridade mínima e sem tocar
 * na thread principal. `modulepreload` compilaria o módulo — justo o custo que este
 * arquivo inteiro existe para adiar.
 *
 * ⚠ NADA AQUI É DESFEITO NA DESMONTAGEM, E É DE PROPÓSITO — custou uma medição para
 * descobrir. A primeira versão removia o `<link>` no teardown, por asseio; o que
 * acontecia na prática é que o gesto chegava DURANTE o prefetch, o portão abria, o
 * teardown removia o `<link>` e o navegador **abortava o download pela metade** — aí o
 * `import()` baixava os 406 kB inteiros de novo (medido: 166 ms jogados fora + 933 ms
 * de redownload). Deixando o `<link>` onde está, o `import()` reaproveita a requisição
 * em andamento (conferido: `transferSize` 0 no segundo pedido).
 *
 * O que fica para trás é um `<link>` inerte no `<head>` e duas imagens já baixadas —
 * nenhum listener, nenhum timer, nenhum recurso de GPU. A regra de limpeza do §12 é
 * sobre o que continua CUSTANDO depois de morto; isto não custa nada.
 */
function prefetchAssets(): void {
  const chunk = document
    .querySelector<HTMLMetaElement>(`meta[name="${CHUNK_META}"]`)
    ?.content.trim();

  if (chunk !== undefined && chunk !== '') {
    const link = document.createElement('link');
    link.rel = 'prefetch';
    // `as` casa o prefetch com o pedido que o `import()` fará depois; sem ele, alguns
    // navegadores guardam a resposta com outro modo de requisição e baixam DE NOVO.
    link.as = 'script';
    link.href = chunk;
    document.head.append(link);
  }

  // As texturas não passam pelo `<link>`: `Image()` aquece o mesmo cache HTTP e
  // funciona também no Safari, que ignora `rel="prefetch"`. São 59 kB.
  for (const src of [TEXTURE.color, TEXTURE.depth]) {
    const image = new Image();
    image.decoding = 'async';
    image.src = src;
  }
}

/**
 * `false` durante o pré-render e na primeira pintura do cliente — sempre. É isso que
 * garante que o HTML entregue ao Google e ao primeiro quadro seja o herói estático.
 */
export function useHeroScene(): boolean {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const reduce = window.matchMedia(MEDIA.reduce).matches;
    if (detectCapability(navigator, reduce) !== 'full') return;
    if (!supportsGpu()) return;

    // Uma lista só de desmontagem: o efeito pode ser desfeito em qualquer um dos
    // três estágios (antes do `load`, esperando gesto, ou já disparado), e cada
    // estágio deixa listeners diferentes para trás.
    const teardown: (() => void)[] = [];

    // As duas condições são independentes e podem chegar em qualquer ordem — é isso
    // que impede um gesto anterior ao `load` de ser descartado (ver o cabeçalho).
    let awake = false;
    let loaded = false;

    const start = (): void => {
      if (!awake || !loaded) return;
      for (const undo of teardown.splice(0)) undo();
      setEnabled(true);
    };

    const wake = (): void => {
      awake = true;
      start();
    };

    // Gesto ANTERIOR à hidratação. Este efeito roda ~1,9 s depois da navegação num
    // celular (medido), e quem rolou a página antes disso não deixa evento nenhum
    // para trás — mas deixa RASTRO: a página não está mais no topo. É o sinal de
    // presença mais barato que existe, e cobre o gesto mais comum no celular.
    if (window.scrollY > 0) awake = true;

    for (const type of WAKE_EVENTS) {
      window.addEventListener(type, wake, { once: true, passive: true });
      teardown.push(() => {
        window.removeEventListener(type, wake);
      });
    }

    teardown.push(
      afterLoad(() => {
        loaded = true;

        // Gesto já veio: o `import()` começa AGORA, e prefetch só atrapalharia —
        // seriam dois pedidos do mesmo arquivo disputando a mesma banda.
        if (awake) {
          start();
          return;
        }

        prefetchAssets();

        // A rede de segurança de quem não interage com nada. Contada do `load`, como
        // sempre foi — só o gesto passou a ser ouvido antes dele.
        const timer = window.setTimeout(wake, SETTLE_MS);
        teardown.push(() => {
          window.clearTimeout(timer);
        });
      }),
    );

    return () => {
      for (const undo of teardown.splice(0)) undo();
    };
  }, []);

  return enabled;
}
