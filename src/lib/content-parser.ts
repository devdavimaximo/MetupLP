/**
 * Parser de `content/copy.md` — puro: recebe string, devolve `SiteCopy`.
 * Nenhum import do Vite aqui de propósito, para continuar utilizável fora do
 * bundler (ex.: um plugin de build que pré-parseie o markdown em F7).
 *
 * ─── CONTRATO DE RÓTULOS ────────────────────────────────────────────────────
 * O arquivo de copy é escrito pelo Davi em markdown natural. O parser depende de:
 *
 *   ## <Seção>                    título de seção; casa por PREFIXO normalizado,
 *                                 então "## Cases (chamada da seção)" continua
 *                                 casando se o sufixo entre parênteses mudar.
 *   **Rótulo:** valor…            campo rotulado; o valor pode seguir nas linhas
 *                                 seguintes até uma linha em branco.
 *   **Título**                    bloco com título + corpo nas linhas seguintes
 *   corpo…                        (é o formato dos Serviços).
 *   - item                        lista.
 *
 * Regra de junção: LINHA EM BRANCO separa campos; quebra simples é reflow de
 * markdown e vira um espaço. Sem isso, "**Subheadline:**", que quebra no meio da
 * frase, chegaria truncada.
 *
 * Se a copy oficial renomear um rótulo (`**Subheadline:**` → `**Sub:**`), o build
 * QUEBRA com a lista de chaves ausentes. É o comportamento desejado — é o que
 * impede a LP de ir ao ar com seção vazia (CLAUDE.md §4).
 *
 * ─── O QUE É OPCIONAL, E POR QUÊ ────────────────────────────────────────────────
 * Quase tudo é obrigatório. As exceções são explícitas e existem pelo mesmo motivo:
 * são coisas que o Davi ainda pode querer APAGAR sem derrubar o build.
 *
 *   `**Eyebrow:**` / `**Destaque:**`  (campos, dentro de `## Hero`)
 *   `## Processo`                     (a SEÇÃO INTEIRA — ver a nota em `SiteCopy`)
 *
 * A regra que separa os dois grupos: é obrigatório aquilo sem o que a seção não
 * consegue existir; é opcional aquilo cuja ausência tem um resultado correto e
 * previsível (o kicker some, a seção some). Nada aqui é opcional "por via das
 * dúvidas" — opcional demais é como uma LP vai ao ar sem metade da copy.
 */

/** Texto pronto para publicar. */
export interface CopyText {
  readonly kind: 'text';
  readonly value: string;
}

/**
 * Marcador `[ ... ]` esperando dado real do Davi (case, número, depoimento).
 * NUNCA é publicado — ver o componente `PendingContent`.
 */
export interface CopyPlaceholder {
  readonly kind: 'placeholder';
  readonly hint: string;
}

/**
 * O tipo é a trava: como `CopyField` não é `string`, um componente não consegue
 * renderizar `{copy.cases.intro}` — o TypeScript recusa e obriga a estreitar entre
 * texto e placeholder. A regra "nunca publique conteúdo inventado" passa a ser
 * garantida pelo compilador, não pela disciplina de quem escreve a seção.
 */
export type CopyField = CopyText | CopyPlaceholder;

export interface ServiceCopy {
  /** Rótulo estrutural: sempre texto, nunca placeholder. */
  readonly title: string;
  readonly description: CopyField;
}

/**
 * Um passo do processo. Mesma FORMA de `ServiceCopy` (título + frase), tipo próprio
 * de propósito: os dois blocos vão divergir — um passo pode ganhar duração, ícone ou
 * entregável, e um serviço não. Um alias hoje viraria uma refatoração amanhã.
 */
export interface ProcessStepCopy {
  /** Nome do passo. Rótulo estrutural: sempre texto, nunca placeholder. */
  readonly title: string;
  readonly description: CopyField;
}

export interface ProcessCopy {
  readonly sectionTitle: CopyField;
  readonly steps: readonly ProcessStepCopy[];
}

export interface SiteCopy {
  readonly hero: {
    /**
     * Kicker acima do título. OPCIONAL por decisão: é um reforço de composição, não
     * um argumento — se o Davi apagar a linha de `copy.md`, o herói perde o kicker e
     * o build continua passando. Campo obrigatório é para o que a seção não consegue
     * existir sem.
     */
    readonly eyebrow?: CopyField;
    readonly headline: CopyField;
    /**
     * Trecho da headline que recebe a cor de destaque, escrito EXATAMENTE como
     * aparece nela (`**Destaque:** automatize.`).
     *
     * É um campo, e não uma marcação inline tipo `*automatize.*`, por dois motivos.
     * O primeiro é que `headline.value` continua sendo uma string limpa — é ela que
     * vai para o `aria-label` que o SplitText gera e para o que o buscador indexa;
     * marcação inline obrigaria todo consumidor a saber desmontá-la. O segundo é que
     * a decisão "qual palavra brilha" é editorial, do Davi, e fica visível no
     * `copy.md` em vez de escondida num componente (§4).
     *
     * Opcional: sem ele, ou com um trecho que não existe na headline, o título
     * simplesmente sai inteiro na cor normal. Nunca quebra.
     */
    readonly headlineAccent?: CopyField;
    readonly subheadline: CopyField;
    readonly primaryCta: CopyField;
  };
  readonly services: {
    readonly sectionTitle: CopyField;
    readonly items: readonly ServiceCopy[];
  };
  /**
   * Processo — "como funciona trabalhar com a gente". A SEÇÃO INTEIRA É OPCIONAL, e
   * isso é uma decisão de contrato, não um esquecimento.
   *
   * ─── POR QUE OPCIONAL ───────────────────────────────────────────────────────────
   * O texto que está hoje em `copy.md` é MOCK do Claude aguardando aprovação: o Davi
   * é quem sabe como trabalha, e o §4 proíbe publicar processo inventado como se
   * fosse dele. Enquanto isso não se resolve, ele precisa poder APAGAR o bloco
   * `## Processo` do markdown e ver a seção sumir do site — sem derrubar o build por
   * uma seção que ainda está em aprovação. É a mesma decisão do `hero.eyebrow`,
   * levada de um campo para uma seção inteira.
   *
   * ─── OPCIONAL COMO UM TODO, OBRIGATÓRIA POR DENTRO ──────────────────────────────
   * Ausente → `undefined`, e `Process` não renderiza nada. PRESENTE → o
   * `**Título da seção:**` e pelo menos um passo passam a ser exigidos, e a falta é
   * coletada no `Collector` como qualquer outra. Meio-termo (uma seção declarada,
   * mas sem `<h2>` e sem nome acessível) seria pior que os dois extremos.
   */
  readonly process?: ProcessCopy;
  readonly cases: {
    readonly sectionTitle: CopyField;
    readonly intro: CopyField;
  };
  readonly socialProof: {
    readonly sectionTitle: CopyField;
    readonly bullets: readonly CopyField[];
  };
  readonly contact: {
    readonly headline: CopyField;
    readonly body: CopyField;
    /** Em F1 fica inteiro ("Falar no WhatsApp · Enviar mensagem"); separar em dois
     *  CTAs é trabalho de F6, quando existir número de WhatsApp real. */
    readonly cta: CopyField;
  };
}

/** Uma chave obrigatória que o markdown não entregou. */
export interface MissingKey {
  readonly path: string;
  readonly expected: string;
  readonly section: string;
}

export interface ParseResult {
  readonly copy: SiteCopy;
  readonly missing: readonly MissingKey[];
}

// ─── helpers ──────────────────────────────────────────────────────────────────

/** "Cases (chamada da seção)" → "cases-chamada-da-secao" */
function slugify(value: string): string {
  return value
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Placeholder = começa com `[` e termina com `]`. O `](` no meio descarta link
 * markdown, que é sintaxe legítima e não um marcador de pendência.
 */
function isPlaceholder(value: string): boolean {
  const trimmed = value.trim();
  return trimmed.startsWith('[') && trimmed.endsWith(']') && !trimmed.includes('](');
}

function toField(value: string): CopyField {
  if (isPlaceholder(value)) {
    return { kind: 'placeholder', hint: value.trim().slice(1, -1).trim() };
  }
  return { kind: 'text', value: value.trim() };
}

/** Junta linhas de um mesmo bloco: quebra simples vira espaço. */
function joinLines(lines: readonly string[]): string {
  return lines
    .map((line) => line.trim())
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// ─── blocos ───────────────────────────────────────────────────────────────────

interface LabeledBlock {
  readonly kind: 'labeled';
  readonly label: string;
  readonly value: string;
}
interface TitledBlock {
  readonly kind: 'titled';
  readonly title: string;
  readonly body: string;
}
interface ListBlock {
  readonly kind: 'list';
  readonly items: readonly string[];
}
type Block = LabeledBlock | TitledBlock | ListBlock;

const LABELED_RE = /^\*\*(.+?):\*\*\s*(.*)$/;
const TITLED_RE = /^\*\*(.+?)\*\*\s*$/;

function parseBlock(lines: readonly string[]): Block | null {
  if (lines.length === 0) return null;

  if (lines.every((line) => line.trimStart().startsWith('- '))) {
    return {
      kind: 'list',
      items: lines.map((line) => line.trimStart().slice(2).trim()),
    };
  }

  const [first, ...rest] = lines;
  if (first === undefined) return null;

  const labeled = LABELED_RE.exec(first);
  if (labeled?.[1] !== undefined) {
    const head = labeled[2] ?? '';
    return {
      kind: 'labeled',
      label: slugify(labeled[1]),
      value: joinLines([head, ...rest]),
    };
  }

  const titled = TITLED_RE.exec(first);
  if (titled?.[1] !== undefined && rest.length > 0) {
    return { kind: 'titled', title: titled[1].trim(), body: joinLines(rest) };
  }

  return null;
}

/** Descarta ruído: h1, blockquote (o aviso de MOCK) e comentários HTML. */
function isNoise(line: string): boolean {
  const trimmed = line.trim();
  return trimmed.startsWith('#') || trimmed.startsWith('>') || trimmed.startsWith('<!--');
}

function parseSectionBlocks(body: string): readonly Block[] {
  const blocks: Block[] = [];
  let current: string[] = [];

  const flush = (): void => {
    const block = parseBlock(current);
    if (block !== null) blocks.push(block);
    current = [];
  };

  /**
   * `/\r?\n/` e NÃO `'\n'`.
   *
   * Com `core.autocrlf=true` (o default do Git no Windows, e é onde este projeto
   * roda) um checkout entrega o markdown em CRLF. Dividindo só por `\n`, cada linha
   * termina em `\r` — e aí `LABELED_RE` deixa de casar, porque `.` não casa `\r` e o
   * `$` sem flag `m` só aceita o fim absoluto da string. O sintoma é cruel: o parser
   * não acha NENHUM campo e o build morre acusando que a copy inteira está faltando,
   * quando o arquivo está intacto. Aconteceu de verdade, num `git stash pop` que
   * renormalizou o arquivo.
   */
  for (const line of body.split(/\r?\n/)) {
    if (isNoise(line)) continue;
    if (line.trim() === '') {
      flush();
      continue;
    }
    current.push(line);
  }
  flush();

  return blocks;
}

/** Mapa de seções: chave = prefixo normalizado do `## título`. */
const SECTION_PREFIXES = [
  'hero',
  'servicos',
  'processo',
  'cases',
  'prova-social',
  'contato',
] as const;
type SectionKey = (typeof SECTION_PREFIXES)[number];

function splitSections(markdown: string): ReadonlyMap<SectionKey, readonly Block[]> {
  const sections = new Map<SectionKey, readonly Block[]>();

  // O primeiro pedaço é o preâmbulo (h1 + aviso de MOCK) e é descartado.
  const chunks = markdown.split(/^##\s+/m).slice(1);

  for (const chunk of chunks) {
    const newline = chunk.indexOf('\n');
    const title = (newline === -1 ? chunk : chunk.slice(0, newline)).trim();
    const body = newline === -1 ? '' : chunk.slice(newline + 1);
    const slug = slugify(title);

    const key = SECTION_PREFIXES.find((prefix) => slug.startsWith(prefix));
    if (key !== undefined && !sections.has(key)) {
      sections.set(key, parseSectionBlocks(body));
    }
  }

  return sections;
}

// ─── extração ─────────────────────────────────────────────────────────────────

const MISSING_FIELD: CopyField = { kind: 'text', value: '' };

/** Coleta as faltas em vez de lançar na primeira — o build reporta tudo de uma vez. */
class Collector {
  private readonly items: MissingKey[] = [];

  record(path: string, expected: string, section: string): void {
    this.items.push({ path, expected, section });
  }

  get missing(): readonly MissingKey[] {
    return this.items;
  }
}

function labeled(
  blocks: readonly Block[] | undefined,
  label: string,
): LabeledBlock | undefined {
  return blocks?.find(
    (block): block is LabeledBlock => block.kind === 'labeled' && block.label === label,
  );
}

/** Campo que pode não existir. Ausente e vazio dão o mesmo resultado: `undefined`. */
function optionalLabeled(
  blocks: readonly Block[] | undefined,
  label: string,
): CopyField | undefined {
  const block = labeled(blocks, label);
  if (block === undefined || block.value === '') return undefined;
  return toField(block.value);
}

function requireLabeled(
  blocks: readonly Block[] | undefined,
  label: string,
  path: string,
  expected: string,
  section: string,
  collector: Collector,
): CopyField {
  const block = labeled(blocks, label);
  if (block === undefined || block.value === '') {
    collector.record(path, expected, section);
    return MISSING_FIELD;
  }
  return toField(block.value);
}

/**
 * Blocos `**Título**` + corpo de uma seção, na ordem do markdown.
 *
 * Serve a Serviços e a Processo, que compartilham o formato mas não o significado —
 * por isso devolve a forma bruta e cada seção a tipa como o que ela é.
 */
function titledEntries(
  blocks: readonly Block[] | undefined,
): readonly { readonly title: string; readonly description: CopyField }[] {
  return (blocks ?? [])
    .filter((block): block is TitledBlock => block.kind === 'titled')
    .map((block) => ({ title: block.title, description: toField(block.body) }));
}

/**
 * Monta `## Processo` — chamada SÓ quando o bloco existe no markdown.
 *
 * Ou seja: a ausência da seção nunca chega aqui e nunca vira falta. Uma vez que ela
 * existe, título e passos são exigidos como em qualquer outra seção (ver a nota do
 * campo `process` em `SiteCopy`).
 */
function buildProcess(blocks: readonly Block[], collector: Collector): ProcessCopy {
  const steps: readonly ProcessStepCopy[] = titledEntries(blocks);

  if (steps.length === 0) {
    collector.record(
      'process.steps',
      '**Nome do passo** seguido da frase do passo',
      '## Processo',
    );
  }

  return {
    sectionTitle: requireLabeled(
      blocks,
      'titulo-da-secao',
      'process.sectionTitle',
      '**Título da seção:**',
      '## Processo',
      collector,
    ),
    steps,
  };
}

export function parseCopy(markdown: string): ParseResult {
  const sections = splitSections(markdown);
  const collector = new Collector();

  const heroBlocks = sections.get('hero');
  const servicesBlocks = sections.get('servicos');
  const processBlocks = sections.get('processo');
  const casesBlocks = sections.get('cases');
  const proofBlocks = sections.get('prova-social');
  const contactBlocks = sections.get('contato');

  const serviceItems: readonly ServiceCopy[] = titledEntries(servicesBlocks);

  if (serviceItems.length === 0) {
    collector.record('services.items', '**Título** seguido do texto do serviço', '## Serviços');
  }

  const proofList = proofBlocks?.find((block): block is ListBlock => block.kind === 'list');
  if (proofList === undefined || proofList.items.length === 0) {
    collector.record(
      'socialProof.bullets',
      'lista com "- " por diferencial',
      '## Prova social / diferenciais',
    );
  }

  const copy: SiteCopy = {
    hero: {
      eyebrow: optionalLabeled(heroBlocks, 'eyebrow'),
      headlineAccent: optionalLabeled(heroBlocks, 'destaque'),
      headline: requireLabeled(heroBlocks, 'headline', 'hero.headline', '**Headline:**', '## Hero', collector),
      subheadline: requireLabeled(heroBlocks, 'subheadline', 'hero.subheadline', '**Subheadline:**', '## Hero', collector),
      primaryCta: requireLabeled(heroBlocks, 'cta-primario', 'hero.primaryCta', '**CTA primário:**', '## Hero', collector),
    },
    services: {
      sectionTitle: requireLabeled(servicesBlocks, 'titulo-da-secao', 'services.sectionTitle', '**Título da seção:**', '## Serviços', collector),
      items: serviceItems,
    },
    process: processBlocks === undefined ? undefined : buildProcess(processBlocks, collector),
    cases: {
      sectionTitle: requireLabeled(casesBlocks, 'titulo-da-secao', 'cases.sectionTitle', '**Título da seção:**', '## Cases', collector),
      intro: requireLabeled(casesBlocks, 'intro', 'cases.intro', '**Intro:**', '## Cases', collector),
    },
    socialProof: {
      sectionTitle: requireLabeled(proofBlocks, 'titulo-da-secao', 'socialProof.sectionTitle', '**Título da seção:**', '## Prova social / diferenciais', collector),
      bullets: (proofList?.items ?? []).map(toField),
    },
    contact: {
      headline: requireLabeled(contactBlocks, 'headline', 'contact.headline', '**Headline:**', '## Contato / CTA final', collector),
      body: requireLabeled(contactBlocks, 'corpo', 'contact.body', '**Corpo:**', '## Contato / CTA final', collector),
      cta: requireLabeled(contactBlocks, 'cta', 'contact.cta', '**CTA:**', '## Contato / CTA final', collector),
    },
  };

  return { copy, missing: collector.missing };
}

/** Mensagem de build em pt-BR — quem lê é o Davi. */
export function formatMissing(missing: readonly MissingKey[]): string {
  const lines = missing.map((item) => `  - ${item.path}  (esperado "${item.expected}" em "${item.section}")`);
  return [
    '[content] content/copy.md está incompleto para o build.',
    `Chaves ausentes ou vazias (${String(missing.length)}):`,
    ...lines,
    '',
    'Corrija content/copy.md — ver PENDENCIAS.md.',
  ].join('\n');
}
