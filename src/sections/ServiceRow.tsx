import { SERVICES_HOOK } from '../animations/services';
import { Heading, PendingContent, Text } from '../components';
import { cn } from '../lib/cn';
import type { ServiceCopy } from '../lib/content';
import { padIndex } from '../lib/format';

export interface IndexRuleProps {
  readonly className?: string;
}

/**
 * Filete de uma linha do índice, com o segmento âmbar na cabeça.
 *
 * É um NÓ próprio, e não um `border-t`, porque só assim pode ser desenhado por
 * `scaleX` — ver o preset `drawLine`. O segmento âmbar é o mesmo gesto do `<Eyebrow>`
 * e da faixa de serviços do herói, e escala junto com o filete na entrada.
 */
export function IndexRule({ className }: IndexRuleProps) {
  return (
    <span
      aria-hidden
      {...{ [SERVICES_HOOK.rule]: true }}
      className={cn('h-px origin-left bg-line', className)}
    >
      <span className="block h-full w-10 bg-accent" />
    </span>
  );
}

export interface ServiceRowProps {
  readonly service: ServiceCopy;
  /** Posição no índice, começando em 1. */
  readonly position: number;
}

/**
 * Uma linha do índice de serviços.
 *
 * ─── POR QUE LINHA, E NÃO CARD ──────────────────────────────────────────────────
 * Existe UMA frase por serviço. Num card, uma frase deixa um retângulo com metade do
 * espaço vazio, e quatro deles lado a lado são o "quatro caixas iguais" que o §7
 * exclui. Em linha, a frase é exatamente o conteúdo da coluna da direita — o formato
 * cabe no conteúdo real em vez de pedir texto que não existe (§4).
 *
 * ─── POR QUE NÃO É CLICÁVEL ─────────────────────────────────────────────────────
 * Não há para onde ir: página de serviço é escopo que não existe, e case é F4. Um
 * hover que sugere clique sem destino é affordance mentirosa — por isso nenhum
 * `Surface interactive`, nenhum estado de hover na linha. O CTA da seção, esse sim,
 * é real e fecha o bloco.
 *
 * O número é `aria-hidden`: quem usa leitor de tela já recebe a ordem do `<ol>`, e
 * ouvir "zero um" antes de cada título é ruído. Ele é grafismo (a decisão de F3 foi
 * NÃO ter pictograma — o índice é o desenho).
 */
export function ServiceRow({ service, position }: ServiceRowProps) {
  const { title, description } = service;

  return (
    <li
      {...{ [SERVICES_HOOK.block]: true }}
      className="relative grid items-baseline gap-x-gutter gap-y-4 py-block md:grid-cols-12"
    >
      <IndexRule className="absolute inset-x-0 top-0" />

      <div
        {...{ [SERVICES_HOOK.cluster]: true }}
        className="flex items-baseline gap-4 md:col-span-6 md:gap-6"
      >
        <span aria-hidden className="font-mono text-label text-muted">
          {padIndex(position)}
        </span>
        <Heading level={3} size="title">
          {title}
        </Heading>
      </div>

      <div {...{ [SERVICES_HOOK.body]: true }} className="md:col-span-5 md:col-start-8">
        {description.kind === 'text' ? (
          <Text size="body-lg">{description.value}</Text>
        ) : (
          <PendingContent hint={description.hint} />
        )}
      </div>
    </li>
  );
}
