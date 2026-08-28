import { Suspense, lazy } from 'react';
import { useHeroScene } from '../hooks/useHeroScene';
import { SceneBoundary } from '../three/SceneBoundary';

/**
 * `lazy` + `import()` é o que mantém `three/webgpu` (~670 KB min) FORA do bundle de
 * entrada. O caminho tem que ser um literal estático para o Vite conseguir fatiar o
 * chunk — nunca transforme isto numa variável.
 */
const HeroScene = lazy(() => import('../three/hero/HeroScene'));

/**
 * Atmosfera da primeira dobra — seis camadas, uma delas viva.
 *
 * ─── A PILHA, DE BAIXO PARA CIMA ────────────────────────────────────────────────
 *  1. `hero-scene`    a cena WebGPU (só quando `useHeroScene` libera)
 *  2. `hero-halo`     o bloom dourado, em `screen`
 *  3. `hero-scrim`    o que garante o contraste do texto (ver hero.css)
 *  4. `hero-grain`    grão
 *  5. `hero-dissolve` a passagem para a seção seguinte
 *
 * A malha de grafite (`hero-field`) saiu a pedido do Davi: sobre o preto novo e a
 * headline em caixa alta, a grade competia com a malha de PONTOS da própria cena —
 * duas retículas sobrepostas na mesma dobra. Quem carrega o registro de instrumento
 * agora é a cena. O resto da página não usava a classe.
 *
 * ─── DEGRADAÇÃO ─────────────────────────────────────────────────────────────────
 * Tirando a camada 1, tudo aqui é CSS estático, pintado uma vez, sem requisição. Se a
 * cena não carrega (aparelho fraco, sem GPU, movimento reduzido) ou quebra
 * (`SceneBoundary`), o que sobra continua sendo uma primeira dobra desenhada — não um
 * retângulo vazio. É a mesma regra do resto do projeto: degrada o efeito, nunca o
 * conteúdo.
 *
 * `aria-hidden` + `pointer-events-none`: é cenário. Nada aqui é conteúdo e nada
 * intercepta um clique destinado ao CTA (§3).
 */
export function HeroBackdrop() {
  const scene = useHeroScene();

  return (
    <div
      aria-hidden
      // Lido pelo CSS: o scrim só existe para proteger o texto DA CENA, então ele
      // aparece junto com ela e some junto. Ligá-lo sempre escureceria à toa a
      // versão estática.
      data-hero-scene={scene}
      className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
    >
      {scene && (
        <SceneBoundary>
          <Suspense fallback={null}>
            <HeroScene />
          </Suspense>
        </SceneBoundary>
      )}

      <div className="hero-halo absolute inset-0" />
      <div className="hero-scrim absolute inset-0" />
      <div className="hero-grain absolute inset-0" />
      <div className="hero-dissolve absolute inset-x-0 bottom-0 h-40" />
    </div>
  );
}
