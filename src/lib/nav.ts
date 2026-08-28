/**
 * Os itens da navegação do header.
 *
 * ─── A LISTA É DERIVADA, NUNCA DIGITADA ─────────────────────────────────────────
 * O `## Processo` é OPCIONAL em `content/copy.md` (ver a nota em `sections/Process`):
 * se o Davi apagar o bloco, a seção não renderiza. Uma lista de navegação escrita à
 * mão continuaria apontando para `#processo` e entregaria um link para lugar nenhum —
 * e link morto no header é o oposto do §3, que exige que nada na página seja beco sem
 * saída. Por isso a presença do item nasce da MESMA condição que decide se a seção
 * existe.
 *
 * ─── POR QUE O HERÓI NÃO É UM ITEM ──────────────────────────────────────────────
 * Já tem um caminho de volta ao topo, e é o brasão — que é para onde a mão vai por
 * convenção. Repetir isso como "Início" só engorda a barra e rouba espaço de quem
 * tem trabalho a fazer ali: as seções de baixo e o CTA.
 *
 * Os RÓTULOS vêm de `ui-strings.ts`, não de `content/copy.md`. O critério é o mesmo
 * do resto daquele arquivo e está documentado lá: rótulo de navegação diz o que FAZER
 * com a página; não afirma nada sobre a Metup, cliente, número ou resultado (§4).
 */
import { copy } from './content';
import { SECTION_ID } from './sections';
import { uiStrings } from './ui-strings';

export interface NavItem {
  /** `id` da <Section> de destino — casa com o `data-section` que o ScrollTrigger lê. */
  readonly id: string;
  readonly href: string;
  readonly label: string;
}

function navItem(id: string, label: string): NavItem {
  return { id, href: `#${id}`, label };
}

export const navItems: readonly NavItem[] = [
  navItem(SECTION_ID.services, uiStrings.nav.services),
  // Ver a nota do cabeçalho: o item só existe se a seção existir.
  ...(copy.process === undefined ? [] : [navItem(SECTION_ID.process, uiStrings.nav.process)]),
  navItem(SECTION_ID.contact, uiStrings.nav.contact),
];
