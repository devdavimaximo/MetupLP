/**
 * Motion do header fixo.
 *
 * ─── POR QUE UM ATRIBUTO, E NÃO ESTADO DO REACT ─────────────────────────────────
 * O header muda de aparência conforme a página rola. A forma "natural" em React
 * seria um `useState(isScrolled)` alimentado por um listener de scroll — e é
 * exatamente o que derruba os 60fps do §6.2: cada quadro de rolagem viraria um
 * re-render da árvore. Aqui o ScrollTrigger escreve um `data-scrolled` DIRETO no nó
 * e o CSS reage. Zero render, zero reconciliação, uma escrita de atributo só quando
 * o estado realmente vira.
 *
 * O estado de fundo NÃO é gated por `prefers-reduced-motion`: ele existe para o
 * header continuar legível quando o conteúdo passa por baixo — é contraste, não
 * enfeite. O que a preferência controla é a TRANSIÇÃO (encurtada pelos tokens em
 * base.css) e a entrada do header no load.
 */
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { DURATION, MEDIA, gsapEase } from './motion';
import type { MotionSetup } from './useMotion';

/** Rolagem, em px, a partir da qual o header ganha fundo. */
const SOLID_AFTER_PX = 8;

export const headerMotion: MotionSetup = (matchMedia, root) => {
  matchMedia.add({ ok: MEDIA.motion, calm: MEDIA.reduce }, (context) => {
    const { ok } = context.conditions as { ok: boolean; calm: boolean };

    const apply = (isActive: boolean): void => {
      root.dataset.scrolled = isActive ? 'true' : 'false';
    };

    ScrollTrigger.create({
      start: SOLID_AFTER_PX,
      end: 'max',
      onToggle: (self) => {
        apply(self.isActive);
      },
      // O navegador restaura a posição de rolagem num refresh; sem isto o header
      // apareceria transparente no meio da página até a primeira rolagem.
      onRefresh: (self) => {
        apply(self.isActive);
      },
    });

    if (!ok) return;

    // Entrada discreta: o header desce um pouco depois do título começar a se
    // revelar, para não competir com ele nem atrasar o CTA.
    gsap.from(root, {
      opacity: 0,
      y: -12,
      duration: DURATION.base,
      ease: gsapEase('out'),
      delay: 0.2,
    });
  });
};
