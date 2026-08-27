/**
 * Carregamento adaptativo (CLAUDE.md §6.5) — contrato registrado em `PENDENCIAS.md`
 * durante F1 e implementado agora, em F2, quando surgiram os primeiros consumidores
 * reais: o scroll suave (Lenis) e o bloom que segue o ponteiro no herói.
 *
 * A regra é uma só: quem está em aparelho fraco, em rede ruim, economizando dados ou
 * pedindo movimento reduzido recebe a versão `lite` — o mesmo layout, a mesma copy,
 * os mesmos CTAs, só sem o que custa quadro. Degradar conteúdo seria trocar
 * acessibilidade por espetáculo; degradar efeito é o oposto disso.
 *
 * PURA de propósito: recebe o `Navigator` em vez de ler o global. Isso a torna
 * testável e impossível de chamar por acidente durante o pré-render.
 */

export type CapabilityTier = 'full' | 'lite';

/**
 * `navigator.connection` e `navigator.deviceMemory` não existem em `lib.dom` — são
 * extensões só do Chromium. Declaradas localmente e lidas com checagem por `in`,
 * nunca com `any` (§10): a ausência da API é o caso comum, não o excepcional.
 */
interface NetworkInformationLike {
  readonly saveData?: boolean;
  readonly effectiveType?: string;
}

interface NavigatorExtensions {
  readonly connection?: NetworkInformationLike;
  readonly deviceMemory?: number;
}

const SLOW_CONNECTIONS: ReadonlySet<string> = new Set(['slow-2g', '2g', '3g']);

/** GB. Um aparelho com 4 GB ou menos não sobra memória para cena/efeito extra. */
const LOW_MEMORY_GB = 4;

/** Núcleos lógicos. Abaixo disto, o rAF disputa CPU com a própria hidratação. */
const LOW_CORE_COUNT = 4;

export function detectCapability(nav: Navigator, reduce: boolean): CapabilityTier {
  // Movimento reduzido vem primeiro: é preferência explícita da pessoa, não palpite
  // sobre o aparelho dela.
  if (reduce) return 'lite';

  const extensions = nav as Navigator & NavigatorExtensions;

  const connection = 'connection' in nav ? extensions.connection : undefined;
  if (connection?.saveData === true) return 'lite';
  if (connection?.effectiveType !== undefined && SLOW_CONNECTIONS.has(connection.effectiveType)) {
    return 'lite';
  }

  if ('deviceMemory' in nav) {
    const memory = extensions.deviceMemory;
    if (memory !== undefined && memory <= LOW_MEMORY_GB) return 'lite';
  }

  if (nav.hardwareConcurrency > 0 && nav.hardwareConcurrency <= LOW_CORE_COUNT) return 'lite';

  return 'full';
}
