import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import type { RefObject } from 'react';
import { registerMotion } from './motion';

export type MotionSetup = (matchMedia: gsap.MatchMedia, root: HTMLElement) => void;

export interface UseMotionResult {
  /**
   * Envolve handlers que criam tween DEPOIS do mount (hover, clique). Sem isto, o
   * tween nasce fora do contexto e sobrevive ao unmount — vazamento clássico.
   */
  readonly contextSafe: <T extends (...args: never[]) => unknown>(fn: T) => T;
}

/**
 * Ponto de entrada de toda animação do projeto.
 *
 * Faz as três coisas que o CLAUDE.md exige de uma só vez (§6.4, §6.6, §10):
 *  - escopa o GSAP ao elemento, então seletores não vazam para fora da seção;
 *  - entrega um `gsap.matchMedia` onde a variante calma de `prefers-reduced-motion`
 *    é obrigatória por construção;
 *  - `mm.revert()` no unmount mata tweens E os ScrollTriggers criados dentro dos
 *    `mm.add()`, além de restaurar os estilos inline.
 *
 * Por isso a convenção é: NENHUM ScrollTrigger é criado fora de um `mm.add()`. Se
 * essa regra for respeitada, `ScrollTrigger.kill()` manual nunca é necessário.
 *
 * Uso canônico:
 *
 * ```ts
 * useMotion(ref, (mm, root) => {
 *   mm.add({ ok: MEDIA.motion, calm: MEDIA.reduce }, (context) => {
 *     const { ok } = context.conditions as { ok: boolean; calm: boolean };
 *     const variant = ok ? preset.full : preset.calm;
 *     gsap.fromTo(gsap.utils.toArray('[data-reveal]', root), variant.from, {
 *       ...variant.to,
 *       ease: gsapEase('out'),
 *       scrollTrigger: { trigger: root, start: 'top 80%' },
 *     });
 *   });
 * });
 * ```
 *
 * `gsap.utils.toArray` em vez de `querySelectorAll`: devolve array de verdade e não
 * depende de `DOM.Iterable` na configuração do TypeScript.
 *
 * REGRA DE SSR: nunca embuta o estado inicial escondido no HTML pré-renderizado. Se
 * um elemento começa em `opacity: 0`, isso é aplicado por `gsap.set()` DEPOIS do
 * mount, dentro do `mm.add()`. Caso contrário, JS desligado ou hidratação falha
 * deixam o conteúdo invisível para sempre — e some do Google junto.
 */
export function useMotion(
  scope: RefObject<HTMLElement | null>,
  setup: MotionSetup,
  dependencies: readonly unknown[] = [],
): UseMotionResult {
  const { contextSafe } = useGSAP(
    () => {
      const root = scope.current;
      if (root === null) return;

      registerMotion();
      const matchMedia = gsap.matchMedia(root);
      setup(matchMedia, root);

      return () => {
        matchMedia.revert();
      };
    },
    // A API pública recebe `readonly` (nada aqui muta a lista), mas o `useGSAP`
    // tipa `dependencies` como array mutável — a cópia concilia os dois.
    { scope, dependencies: [...dependencies], revertOnUpdate: true },
  );

  return { contextSafe } as UseMotionResult;
}
