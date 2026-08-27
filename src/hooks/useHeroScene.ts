import { useEffect, useState } from 'react';
import { MEDIA } from '../animations/motion';
import { detectCapability } from '../lib/capability';

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

    const start = (): void => {
      for (const undo of teardown.splice(0)) undo();
      setEnabled(true);
    };

    teardown.push(
      afterLoad(() => {
        for (const type of WAKE_EVENTS) {
          window.addEventListener(type, start, { once: true, passive: true });
          teardown.push(() => {
            window.removeEventListener(type, start);
          });
        }

        const timer = window.setTimeout(start, SETTLE_MS);
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
