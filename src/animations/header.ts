/**
 * Motion do header fixo: fundo, seção ativa e entrada.
 *
 * ─── POR QUE ATRIBUTOS, E NÃO ESTADO DO REACT ───────────────────────────────────
 * O header muda de aparência conforme a página rola — ganha fundo, e o item da seção
 * em que o leitor está acende. A forma "natural" em React seria um `useState` por
 * listener de scroll, e é exatamente o que derruba os 60fps do §6.2: cada quadro de
 * rolagem viraria um re-render da árvore. Aqui o ScrollTrigger escreve `data-scrolled`
 * e `aria-current` DIRETO nos nós e o CSS reage. Zero render, zero reconciliação, uma
 * escrita de atributo só quando o estado realmente vira.
 *
 * ─── O QUE É, E O QUE NÃO É, GATED POR `prefers-reduced-motion` ─────────────────
 * O fundo e a seção ativa NÃO são: os dois existem para o header continuar legível e
 * para o leitor saber onde está — são contraste e orientação, não enfeite. Quem pediu
 * movimento reduzido continua vendo os dois, só sem viagem: o indicador SALTA para a
 * posição em vez de deslizar (duração 0), e as transições encurtam pelos tokens de
 * `base.css`. O que a preferência realmente desliga é a entrada do header no load.
 */
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { DURATION, MEDIA, STAGGER, gsapEase } from './motion';
import type { MotionSetup } from './useMotion';

/** Ganchos estáveis do header. Classe de Tailwind muda com o design; isto não. */
export const HEADER_HOOK = {
  /** Valor = `id` da seção de destino. */
  navItem: 'data-nav-item',
  indicator: 'data-nav-indicator',
  /** Elementos que entram na timeline de load, na ordem em que são consultados. */
  brand: 'data-header-brand',
  cta: 'data-header-cta',
} as const;

/** Rolagem, em px, a partir da qual o header ganha fundo. */
const SOLID_AFTER_PX = 8;

/**
 * Onde a seção "vira" a ativa: 45% da altura da viewport, contando do topo.
 *
 * Não é o topo da tela (a seção seguinte acenderia enquanto a anterior ainda ocupa
 * quase tudo) nem o meio exato (que, com o header fixo comendo 4,5rem do alto,
 * fica visualmente abaixo do centro do que o leitor realmente vê). 45% é o centro
 * ÓPTICO da área livre — e como as seções são altas e não se sobrepõem, no máximo
 * uma delas cruza essa linha por vez.
 */
const ACTIVE_LINE = '45%';

export const headerMotion: MotionSetup = (matchMedia, root) => {
  matchMedia.add({ ok: MEDIA.motion, calm: MEDIA.reduce }, (context) => {
    const { ok } = context.conditions as { ok: boolean; calm: boolean };

    /* ── 1. Fundo do header ─────────────────────────────────────────────────── */

    const applyScrolled = (isActive: boolean): void => {
      root.dataset.scrolled = isActive ? 'true' : 'false';
    };

    ScrollTrigger.create({
      start: SOLID_AFTER_PX,
      /**
       * `maxScroll + 1`, e não `'max'`.
       *
       * Um ScrollTrigger fica ativo em `[start, end)` — o fim é EXCLUSIVO. Com
       * `end: 'max'`, o último pixel de rolagem da página cai exatamente em `end` e o
       * gatilho desliga: o header perdia o fundo e a borda no fundo da página, que é
       * justo onde mora o CTA final. Medido em 1280×800: `data-scrolled` virava
       * `false` em `scrollY === 3905` de 3905. Em função (e não número) porque a
       * altura do documento muda com a viewport, e o ScrollTrigger reavalia isto a
       * cada `refresh`.
       */
      end: () => ScrollTrigger.maxScroll(window) + 1,
      onToggle: (self) => {
        applyScrolled(self.isActive);
      },
      // O navegador restaura a posição de rolagem num refresh; sem isto o header
      // apareceria transparente no meio da página até a primeira rolagem.
      onRefresh: (self) => {
        applyScrolled(self.isActive);
      },
    });

    /* ── 2. Seção ativa + o filete que desliza ──────────────────────────────── */

    const links = gsap.utils.toArray<HTMLAnchorElement>(`[${HEADER_HOOK.navItem}]`, root);
    const indicator = root.querySelector<HTMLElement>(`[${HEADER_HOOK.indicator}]`);

    // O indicador vive dentro do <nav>; medir contra ele (e não contra a viewport)
    // mantém a conta certa mesmo com a barra centralizada por grid.
    const track = indicator?.parentElement ?? null;

    let current: HTMLAnchorElement | null = null;

    /**
     * Posiciona o filete sob `link`.
     *
     * Uma leitura de layout por ativação — e ativação é raro (só quando a seção
     * muda), então isto não entra no caminho do scroll. `scaleX` recebe a largura em
     * px porque o nó tem 1px de largura no CSS: escalar é transform, redimensionar
     * seria layout (§6.4).
     */
    const place = (link: HTMLAnchorElement, animate: boolean): void => {
      if (indicator === null || track === null) return;

      const from = track.getBoundingClientRect();
      const to = link.getBoundingClientRect();
      if (to.width === 0) return; // nav escondida no mobile: nada a posicionar

      gsap.to(indicator, {
        x: to.left - from.left,
        scaleX: to.width,
        opacity: 1,
        duration: animate && ok ? DURATION.base : 0,
        ease: gsapEase('out'),
        overwrite: 'auto',
      });
    };

    const hide = (): void => {
      if (indicator === null) return;
      gsap.to(indicator, { opacity: 0, duration: ok ? DURATION.fast : 0, overwrite: 'auto' });
    };

    const setCurrent = (link: HTMLAnchorElement | null, animate: boolean): void => {
      if (link === current) return;

      current?.removeAttribute('aria-current');
      current = link;

      if (link === null) {
        hide();
        return;
      }

      // "location" é o token certo para posição dentro de um ambiente — é o que um
      // leitor de tela anuncia como "página atual" numa navegação de seções.
      link.setAttribute('aria-current', 'location');
      place(link, animate);
    };

    for (const link of links) {
      const id = link.getAttribute(HEADER_HOOK.navItem);
      const section = id === null ? null : document.querySelector(`[data-section="${id}"]`);
      if (section === null) continue;

      ScrollTrigger.create({
        trigger: section,
        start: `top ${ACTIVE_LINE}`,
        end: `bottom ${ACTIVE_LINE}`,
        onToggle: (self) => {
          if (self.isActive) setCurrent(link, true);
          else if (current === link) setCurrent(null, true);
        },
        onRefresh: (self) => {
          if (self.isActive) setCurrent(link, false);
        },
      });
    }

    /**
     * O filete é posicionado em px, então precisa ser remedido quando a régua muda:
     * ao redimensionar (o `refresh` do ScrollTrigger já cobre isso) e quando as
     * fontes terminam de carregar — antes disso os rótulos são medidos na fonte de
     * fallback e o filete nasceria com a largura errada.
     */
    const reposition = (): void => {
      if (current !== null) place(current, false);
    };

    ScrollTrigger.addEventListener('refresh', reposition);
    void document.fonts.ready.then(reposition);

    /* ── 3. Entrada no load ─────────────────────────────────────────────────── */

    if (ok) {
      const brand = root.querySelector(`[${HEADER_HOOK.brand}]`);
      const cta = root.querySelector(`[${HEADER_HOOK.cta}]`);
      const anchors = [brand, cta].filter((node): node is Element => node !== null);

      // Os dois extremos primeiro, os rótulos do meio depois. A ordem é do §3: a
      // marca e o CTA são o que precisa estar lá; a navegação é o que enfeita a
      // chegada. `from` (e não `fromTo`) mantém o HTML pré-renderizado como estado
      // final — ver a REGRA DE SSR em `useMotion`.
      const timeline = gsap.timeline({ delay: 0.15 });

      if (anchors.length > 0) {
        timeline.from(anchors, {
          opacity: 0,
          y: -10,
          duration: DURATION.base,
          ease: gsapEase('out'),
        });
      }

      if (links.length > 0) {
        timeline.from(
          links,
          {
            opacity: 0,
            y: -8,
            duration: DURATION.base,
            ease: gsapEase('out'),
            stagger: STAGGER.tight,
          },
          '<0.08',
        );
      }
    }

    return () => {
      ScrollTrigger.removeEventListener('refresh', reposition);
      current?.removeAttribute('aria-current');
      current = null;
    };
  });
};
