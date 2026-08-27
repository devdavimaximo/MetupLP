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

export interface SiteCopy {
  readonly hero: {
    readonly headline: CopyField;
    readonly subheadline: CopyField;
    readonly primaryCta: CopyField;
  };
  readonly services: {
    readonly items: readonly ServiceCopy[];
  };
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

  for (const line of body.split('\n')) {
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
const SECTION_PREFIXES = ['hero', 'servicos', 'cases', 'prova-social', 'contato'] as const;
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

export function parseCopy(markdown: string): ParseResult {
  const sections = splitSections(markdown);
  const collector = new Collector();

  const heroBlocks = sections.get('hero');
  const servicesBlocks = sections.get('servicos');
  const casesBlocks = sections.get('cases');
  const proofBlocks = sections.get('prova-social');
  const contactBlocks = sections.get('contato');

  const serviceItems: ServiceCopy[] = (servicesBlocks ?? [])
    .filter((block): block is TitledBlock => block.kind === 'titled')
    .map((block) => ({ title: block.title, description: toField(block.body) }));

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
      headline: requireLabeled(heroBlocks, 'headline', 'hero.headline', '**Headline:**', '## Hero', collector),
      subheadline: requireLabeled(heroBlocks, 'subheadline', 'hero.subheadline', '**Subheadline:**', '## Hero', collector),
      primaryCta: requireLabeled(heroBlocks, 'cta-primario', 'hero.primaryCta', '**CTA primário:**', '## Hero', collector),
    },
    services: { items: serviceItems },
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
