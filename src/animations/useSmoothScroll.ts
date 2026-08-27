/**
 * Scroll suave (Lenis) integrado ao ScrollTrigger.
 *
 * ─── O CONTRATO ENTRE OS DOIS ───────────────────────────────────────────────────
 * Lenis e GSAP são dois animadores olhando para a mesma página. Se cada um rodar o
 * próprio `requestAnimationFrame`, eles atualizam em momentos diferentes do quadro e
 * o resultado é o jank clássico de "smooth scroll": o texto desliza macio e o
 * elemento com ScrollTrigger chega um quadro atrasado. As três linhas que resolvem:
 *
 *   1. `autoRaf: false` + `gsap.ticker.add(...)` — UM loop só, o do GSAP, e o Lenis
 *      passa a ser mais um passo dentro do quadro do GSAP;
 *   2. `lenis.on('scroll', ScrollTrigger.update)` — o ScrollTrigger deixa de
 *      acreditar no `scrollY` nativo (que o Lenis está interpolando) e passa a ser
 *      avisado pela fonte certa;
 *   3. `lagSmoothing(0)` — o GSAP normalmente "conserta" travadas pulando tempo, o
 *      que faria a posição do Lenis dar um salto. Numa página de scroll, tempo
 *      pulado é posição pulada.
 *
 * ─── QUEM NÃO RECEBE ────────────────────────────────────────────────────────────
 * `prefers-reduced-motion` e o tier `lite` (§6.5). Sequestrar a rolagem de quem
 * pediu movimento reduzido é o oposto de acessibilidade — e num aparelho fraco o
 * scroll suave é o primeiro efeito a comer o orçamento de quadro. Nos dois casos a
 * rolagem nativa fica, inteira: a página não perde nada além do embalo.
 */
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { detectCapability } from '../lib/capability';
import { bindAnchorScroll } from './anchor-scroll';
import { MEDIA, registerMotion } from './motion';

/** Padrão do GSAP, restaurado no cleanup para não vazar estado global. */
const DEFAULT_LAG_SMOOTHING: readonly [number, number] = [500, 33];

export function useSmoothScroll(): void {
  useGSAP(() => {
    registerMotion();

    const matchMedia = gsap.matchMedia();

    matchMedia.add({ ok: MEDIA.motion, calm: MEDIA.reduce }, (context) => {
      const { ok } = context.conditions as { ok: boolean; calm: boolean };
      if (!ok) return;
      if (detectCapability(navigator, false) === 'lite') return;

      const lenis = new Lenis({
        // Ver ponto (1) do cabeçalho: o rAF é do GSAP.
        autoRaf: false,
        // Nossa própria delegação de âncoras cuida do header e do foco.
        anchors: false,
        // Curto o bastante para o scroll continuar obedecendo ao dedo/roda; longo o
        // bastante para o embalo existir. Acima disto o scroll começa a "flutuar" e
        // o CTA fica mais difícil de acertar (§3).
        lerp: 0.12,
      });

      const stopScrollRelay = lenis.on('scroll', ScrollTrigger.update);

      const tick = (time: number): void => {
        // O ticker do GSAP conta em segundos; o Lenis espera milissegundos.
        lenis.raf(time * 1000);
      };

      gsap.ticker.add(tick);
      gsap.ticker.lagSmoothing(0);

      const unbindAnchors = bindAnchorScroll(lenis);

      return () => {
        unbindAnchors();
        stopScrollRelay();
        gsap.ticker.remove(tick);
        gsap.ticker.lagSmoothing(...DEFAULT_LAG_SMOOTHING);
        lenis.destroy();
      };
    });

    return () => {
      matchMedia.revert();
    };
  }, []);
}
