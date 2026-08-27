import { createContext, use } from 'react';

export interface SectionContextValue {
  /** `id` da seção — vira o `location` dos eventos de conversão. */
  readonly id: string;
}

/**
 * Arquivo separado do componente de propósito: a regra `react/only-export-components`
 * do oxlint reclama quando um módulo exporta componente e não-componente juntos.
 */
export const SectionContext = createContext<SectionContextValue | null>(null);

/**
 * Origem do CTA para analytics. Fora de uma <Section> devolve 'unknown' em vez de
 * lançar — um botão no header ou no footer é legítimo, e derrubar a página por
 * causa de telemetria seria pior do que um rótulo genérico.
 */
export function useSectionId(): string {
  return use(SectionContext)?.id ?? 'unknown';
}
