import { Component } from '../components/ui/horizon-hero-section';
import { SceneBoundary } from '../three/SceneBoundary';

/**
 * Cena Horizon — a seção nova, logo abaixo da vitrine em zoom.
 *
 * ⚠ ESTADO PROVISÓRIO, POR PEDIDO EXPLÍCITO DO DAVI (2026-08-29): é o `demo.tsx` que
 * acompanha o componente (que só monta `<Component />`), portado sem alterar a cena
 * nem os textos. "HORIZON", "COSMOS" e as frases em inglês são do demo, não são copy
 * da Metup; registrados em PENDENCIAS.md junto com os conflitos de performance.
 */
export function HorizonHero() {
  // A fronteira é a mesma do herói e existe pela mesma razão (ver `SceneBoundary`):
  // uma falha de WebGL — driver velho, contexto recusado, aparelho sem GPU — não pode
  // desmontar a árvore do React e apagar a página. O pior caso é a cena não aparecer.
  return (
    <SceneBoundary>
      <Component />
    </SceneBoundary>
  );
}
