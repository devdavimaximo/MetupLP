import { HERO_HOOK } from '../animations/hero';

/**
 * Atmosfera da primeira dobra.
 *
 * Cinco camadas, todas decorativas e todas em CSS estático (`styles/hero-backdrop.css`):
 * malha de grafite, bloom âmbar, contraluz turquesa, grão e a dissolução para a
 * seção seguinte. Nenhuma imagem baixada, nenhum canvas, nenhum shader.
 *
 * ─── POR QUE NÃO É UMA CENA 3D ──────────────────────────────────────────────────
 * O §6.2 manda cena pesada para FORA da primeira dobra e em lazy-load. O herói é a
 * primeira dobra: um `three.js` aqui contradiria a regra e cobraria o preço no LCP,
 * que é justamente o número que sustenta o argumento de venda desta página. A
 * `src/three/` fica reservada para a vitrine de cases (F4), abaixo da dobra e
 * montada por `useInView`.
 *
 * `aria-hidden` + `pointer-events-none`: é cenário. Nada aqui é conteúdo, nada aqui
 * intercepta um clique destinado ao CTA.
 */
export function HeroBackdrop() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <div className="hero-field absolute inset-0" />

      {/* Único elemento animado do backdrop: passeia com o ponteiro via transform. */}
      <div
        {...{ [HERO_HOOK.bloom]: true }}
        className="hero-bloom absolute top-[-32%] left-[-16%] h-[100vmin] w-[100vmin] will-change-transform"
      />

      <div className="hero-bloom-2 absolute right-[-20%] bottom-[-24%] h-[72vmin] w-[72vmin]" />
      <div className="hero-grain absolute inset-0" />
      <div className="hero-dissolve absolute inset-x-0 bottom-0 h-40" />
    </div>
  );
}
