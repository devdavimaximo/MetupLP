import type { RefObject } from 'react';
import { Component } from '../components/ui/horizon-hero-section';
import { SceneBoundary } from '../three/SceneBoundary';
import { HorizonFinale } from './HorizonFinale';

export interface HorizonHeroProps {
  /**
   * A pista da vitrine em zoom, logo acima (ver `App`). É ela que faz o zoom acontecer
   * NA CENA: enquanto a colagem abre, o canvas desta seção é projetado dentro do
   * quadro central. Sem a `ref`, a seção continua sendo a seção — nada quebra.
   */
  readonly zoomTrackRef?: RefObject<HTMLElement | null>;
}

/**
 * Cena Horizon — a seção nova, logo abaixo da vitrine em zoom.
 *
 * ⚠ ESTADO PROVISÓRIO, POR PEDIDO EXPLÍCITO DO DAVI (2026-08-29): é o `demo.tsx` que
 * acompanha o componente (que só monta `<Component />`), portado sem alterar a cena
 * nem os textos. "SPACE" e o ícone de menu são do demo, não são copy da Metup;
 * registrados em PENDENCIAS.md junto com os conflitos de performance.
 *
 * ─── O QUARTO ATO (2026-08-31, pedido do Davi) ──────────────────────────────────
 * A cena deixou de terminar no vazio: `finale` acrescenta uma tela ao container, com
 * o canvas preso atrás, e é ali que mora o CTA que fecha a página — a seção
 * `#contato`. O porquê de ele ser um ato da cena, e não uma seção colada embaixo,
 * está em `sections/HorizonFinale`.
 *
 * ─── E O ATO ZERO (2026-08-31, pedido do Davi) ──────────────────────────────────
 * A cena também deixou de COMEÇAR no vazio. `zoomTrackRef` é a pista da vitrine
 * logo acima: com ela, o que abre no quadro central da vitrine é o canvas desta cena,
 * e não mais um painel preto. A cena espera lá dentro, viva e no primeiro ato, até o
 * zoom acabar — e aí assume a tela sem troca de imagem no meio. A mecânica está em
 * `ComponentProps.introTrackRef`.
 */
export function HorizonHero({ zoomTrackRef }: HorizonHeroProps) {
  // A fronteira é a mesma do herói e existe pela mesma razão (ver `SceneBoundary`):
  // uma falha de WebGL — driver velho, contexto recusado, aparelho sem GPU — não pode
  // desmontar a árvore do React e apagar a página. O pior caso é a cena não aparecer.
  //
  // ⚠ E é por isso que o finale aparece DUAS vezes aqui. Ele é conteúdo de conversão
  // (o último CTA e a âncora `#contato`), então não pode cair junto com a cena: no
  // caminho normal ele é o quarto ato, dentro do container; no `fallback` ele volta
  // sozinho, como seção comum. Sem essa segunda linha, uma falha de WebGL deixaria o
  // CTA do herói e o item "Contato" do header apontando para um `id` inexistente.
  return (
    <SceneBoundary fallback={<HorizonFinale standalone />}>
      <Component introTrackRef={zoomTrackRef} finale={<HorizonFinale />} />
    </SceneBoundary>
  );
}
