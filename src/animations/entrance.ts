/**
 * Vocabulário de ENTRADA POR SCROLL — definido uma vez em F3, herdado por F4, F5 e F6.
 *
 * O herói é timeline de load; Serviços é a primeira seção realmente dirigida por
 * ScrollTrigger. As três decisões abaixo valem para TODA seção daqui em diante, e o
 * motivo de morarem num módulo é o de sempre: cada seção que escolhesse o próprio
 * `start` faria a página inteira entrar em cadências diferentes — que é como uma LP
 * passa de "dirigida" a "cheia de animação".
 *
 * ─── `start: 'top 78%'` ─────────────────────────────────────────────────────────
 * A seção começa a entrar quando o topo dela cruza 78% da altura da janela, ou seja,
 * já dentro do campo de visão, com ~22% de viewport de margem. Mais alto (90%) e a
 * animação termina antes de a pessoa olhar; mais baixo (50%) e ela lê o começo do
 * bloco enquanto o resto ainda está invisível.
 *
 * ─── `once: true` ───────────────────────────────────────────────────────────────
 * A entrada acontece UMA vez. Re-animar a cada passagem é fadiga de movimento para
 * quem rola de volta para reler — e, no §3, "reler para achar o CTA" é o caso comum,
 * não o excepcional. Como todo tween é `gsap.from()`, o estado que sobra depois da
 * primeira vez é exatamente o do HTML pré-renderizado.
 *
 * ─── SEM `scrub` em conteúdo ────────────────────────────────────────────────────
 * `scrub` amarra o progresso da animação à posição da rolagem: quem para no meio
 * fica com o texto meio revelado, e num trackpad lento isso significa parágrafo a
 * 40% de opacidade. Scrub é para camada decorativa (parallax, atmosfera), nunca para
 * o que precisa ser lido. Se F4 quiser scrub numa cena 3D, é `entranceTrigger(root,
 * { scrub: true })` — explícito, e só na camada que não carrega conteúdo.
 */
import gsap from 'gsap';
import { fadeIn, fromVars } from './presets';

export const ENTRANCE = {
  start: 'top 78%',
  once: true,
} as const;

/**
 * Config de ScrollTrigger de uma entrada de seção. `extra` existe para o caso
 * legítimo (um `end`, um `scrub` numa camada decorativa), nunca para redefinir o
 * `start` — divergir dele é divergir da cadência da página.
 */
export function entranceTrigger(
  trigger: Element,
  extra: ScrollTrigger.Vars = {},
): ScrollTrigger.Vars {
  return { trigger, start: ENTRANCE.start, once: ENTRANCE.once, ...extra };
}

/**
 * Variante calma de uma seção inteira: revela sem deslocar e sem ScrollTrigger.
 *
 * Sem trigger de propósito. Quem pediu movimento reduzido não deveria depender de a
 * rolagem chegar num ponto exato para o conteúdo aparecer — se um refresh do
 * ScrollTrigger falhasse, a seção ficaria invisível, que é o pior desfecho possível
 * (§4/§6.6). Aqui o fade roda no mount, dura 0,2s e termina muito antes de a pessoa
 * chegar na seção.
 *
 * Aceita `null` na lista porque toda seção monta seus alvos com `querySelector`.
 */
export function revealCalm(targets: readonly (Element | null)[]): void {
  const nodes = targets.filter((node): node is Element => node !== null);
  if (nodes.length === 0) return;

  gsap.from(nodes, fromVars(fadeIn().calm, { ease: 'none' }));
}
