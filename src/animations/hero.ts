/**
 * Motion da primeira dobra.
 *
 * ─── DE ONDE VEM O ESPETÁCULO ───────────────────────────────────────────────────
 * De duas coisas que se sustentam: a CENA (WebGPU, ver `src/three/hero/`) e a
 * entrada do texto por cima dela. Aqui mora só a segunda.
 *
 * O gesto é o título subindo de dentro da própria máscara, PALAVRA por palavra.
 * `SplitText` com `type: 'words,lines'` e `mask: 'lines'` embrulha cada linha num
 * contêiner com `overflow: hidden` e deixa as palavras animarem `yPercent` lá dentro —
 * transform puro, no compositor, sem tocar em layout. É a mesma cadência palavra a
 * palavra da referência que originou este herói, mas sem o preço dela: lá, cada
 * palavra era um `setState` com `setTimeout` e nascia em `opacity: 0`, o que significa
 * HTML pré-renderizado com o <h1> invisível — some do Google e some de quem está com
 * o JS falhando. Aqui o efeito é o mesmo e o texto continua no HTML.
 *
 * ─── A REGRA DE SSR, APLICADA ───────────────────────────────────────────────────
 * TODO tween aqui é `gsap.from()`. Nunca `set` + `fromTo`. O HTML pré-renderizado sai
 * com o herói inteiro visível e opaco; o GSAP empresta um estado inicial depois do
 * mount e devolve o elemento ao natural. Com JS desligado, com a hidratação falhando
 * ou com o tween morto no meio, o título continua legível — e indexável.
 *
 * ─── E O CTA ────────────────────────────────────────────────────────────────────
 * O §3 diz que o espetáculo nunca enterra o CTA. Aqui isso é uma posição na timeline:
 * o botão entra em ~0,4s, muito antes de o título terminar de se revelar e muito
 * antes de a cena sequer começar a baixar. Quem chegou para clicar não espera nada.
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

export const heroMotion: MotionSetup = (matchMedia, root) => {
  matchMedia.add({ ok: MEDIA.motion, calm: MEDIA.reduce }, (context) => {
    const { ok } = context.conditions as { ok: boolean; calm: boolean };

    const headline = root.querySelector<HTMLElement>(SELECTOR.headline);
    const reveals = gsap.utils.toArray<HTMLElement>(SELECTOR.reveal, root);

    // Variante calma: revela, não desloca. NUNCA "sem animação nenhuma" — ver o
    // contrato em presets.ts. Nada aqui pode deixar conteúdo invisível. O gesto é o
    // mesmo de toda seção da página, então mora em `entrance.ts` (F3).
    if (!ok) {
      revealCalm([headline, ...reveals]);
      return;
    }

    const timeline = gsap.timeline({ defaults: { ease: gsapEase('out') } });

    if (headline !== null) {
      let hasRevealed = false;

      SplitText.create(headline, {
        type: 'words,lines',
        mask: 'lines',
        // `aria: 'auto'` devolve o texto inteiro ao leitor de tela via aria-label.
        // Sem isso, o SplitText entrega o <h1> picotado em divs e alguns leitores
        // anunciam pedaço por pedaço — o título vira uma lista de fragmentos.
        aria: 'auto',
        // Re-divide quando a Fraunces carrega (font-display: swap) ou a largura
        // muda. É o que impede o título de ficar quebrado na medida da fonte de
        // fallback depois que a real chega.
        autoSplit: true,
        onSplit: (self) => {
          // Só a PRIMEIRA divisão anima. Sem esta guarda, cada resize de janela
          // re-executaria a entrada do herói na cara de quem já está lendo.
          if (hasRevealed) return;
          hasRevealed = true;

          return timeline.from(
            self.words,
            // `stagger` apertado de propósito: com seis palavras, a cadência larga
            // da referência (0,6s por palavra) deixaria o título quase quatro
            // segundos incompleto — tempo em que a headline não comunica nada.
            { yPercent: 108, duration: DURATION.slow, stagger: STAGGER.tight },
            0,
          );
        },
      });
    }

    // Kicker, subtítulo, CTA, faixa de serviços e indicador de rolagem, na ordem do
    // DOM. Começam com o título ainda subindo: o herói entra como UM movimento, não
    // como uma fila de elementos esperando a vez.
    if (reveals.length > 0) {
      timeline.from(
        reveals,
        fromVars(fadeUp({ travel: TRAVEL.sm, duration: DURATION.base, stagger: STAGGER.base }).full),
        0.22,
      );
    }
  });
};
