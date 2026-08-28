import { useRef } from 'react';
import { PROCESS_HOOK, processMotion } from '../animations/process';
import { useMotion } from '../animations/useMotion';
import { ContactCta, Heading, PendingContent, Section, Text } from '../components';
import { copy } from '../lib/content';
import { padIndex } from '../lib/format';
import { SECTION_ID } from '../lib/sections';
import { IndexRule } from './Services';

const HEADING_ID = 'processo-titulo';

/**
 * Processo — "como funciona trabalhar com a gente".
 *
 * ─── POR QUE ELA EXISTE ─────────────────────────────────────────────────────────
 * A página já impressiona (herói 3D) e já diz o que a Metup faz (Serviços + deck).
 * Falta o degrau que converte: o público do §2 muitas vezes não tem vocabulário
 * técnico e não desiste por falta de screenshot bonito — desiste por não saber como
 * começa, com quem fala e o que acontece depois de mandar mensagem. Esta seção
 * responde a objeção no lugar exato: imediatamente antes do CTA final.
 *
 * ─── É A SEÇÃO SILENCIOSA, E ISSO É DIREÇÃO DE ARTE ─────────────────────────────
 * Depois de um herói 3D e de um deck de 200vh, uma terceira seção de espetáculo
 * satura — o olho para de distinguir o que é importante. Aqui não há imagem, cena,
 * superfície elevada nem cartão: tipografia, um filete dourado e ar. O contraste
 * "barulho → silêncio → CTA" é o que faz o CTA final bater. O capricho está no
 * ritmo, no alinhamento por baseline e na revelação passo a passo (`process.css` e
 * `animations/process.ts`), não em efeito.
 *
 * ─── A SEÇÃO PODE NÃO EXISTIR, E ISSO É DE PROPÓSITO ────────────────────────────
 * `copy.process` é OPCIONAL no parser. Se o Davi apagar o bloco `## Processo` de
 * `content/copy.md`, este componente devolve `null`, o build passa e a página fica
 * com três seções — como era antes. É a válvula que o §4 exige enquanto o texto no
 * markdown for MOCK do Claude aguardando aprovação: nada aqui foi escrito em código,
 * e nenhuma seção em aprovação derruba um build. Ver `lib/content-parser.ts`.
 *
 * ─── SEMÂNTICA ──────────────────────────────────────────────────────────────────
 * `<ol>` e não `<ul>`: a ordem dos passos É informação (o passo 02 vem depois do 01,
 * não ao lado dele). `role="list"` devolve a semântica que o Safari descarta quando o
 * marcador é removido, e a numeração VISÍVEL é `aria-hidden` — o `<ol>` já anuncia
 * "item 1 de 4", então ler "01" em voz alta seria a mesma informação duas vezes.
 */
export function Process() {
  const ref = useRef<HTMLElement>(null);
  useMotion(ref, processMotion);

  const { process } = copy;
  const { primaryCta } = copy.hero;

  // Sem `## Processo` no markdown não há seção — ver a nota acima.
  if (process === undefined) return null;

  const { sectionTitle, steps } = process;

  return (
    <Section ref={ref} id={SECTION_ID.process} labelledBy={HEADING_ID}>
      <header {...{ [PROCESS_HOOK.block]: true }}>
        {sectionTitle.kind === 'text' ? (
          <Heading
            level={2}
            size="display"
            id={HEADING_ID}
            className="max-w-narrow"
            {...{ [PROCESS_HOOK.fade]: true }}
          >
            {sectionTitle.value}
          </Heading>
        ) : (
          <PendingContent hint={sectionTitle.hint} />
        )}

        {/* O mesmo filete de Serviços, com o gancho de motion DESTA seção — ele fecha
            o cabeçalho e o trilho vertical continua a partir dele, logo abaixo. */}
        <IndexRule className="mt-block block w-full" motionHook={PROCESS_HOOK.line} />
      </header>

      <ol role="list" className="process-steps mt-block">
        {steps.map((step, index) => (
          <li key={step.title} className="process-step" {...{ [PROCESS_HOOK.block]: true }}>
            {/* Um segmento de trilho por passo: juntos lêem como uma linha só, mas
                cada um é desenhado pelo gatilho do próprio passo. A cabeça dourada
                fica no primeiro — é onde a linha começa. */}
            <span aria-hidden {...{ [PROCESS_HOOK.rail]: true }} className="process-rail">
              {index === 0 && <span className="process-rail-head" />}
            </span>

            <span
              aria-hidden
              {...{ [PROCESS_HOOK.cluster]: true }}
              className="process-marker font-mono text-label text-accent"
            >
              {padIndex(index + 1)}
            </span>

            <Heading level={3} size="title-sm" {...{ [PROCESS_HOOK.cluster]: true }}>
              {step.title}
            </Heading>

            <div className="process-step-body" {...{ [PROCESS_HOOK.body]: true }}>
              {step.description.kind === 'text' ? (
                <Text>{step.description.value}</Text>
              ) : (
                <PendingContent hint={step.description.hint} />
              )}
            </div>
          </li>
        ))}
      </ol>

      {/* A seção termina em ação (§3). O CTA tem gatilho próprio para subir assim que
          aparece, e aqui ele fecha um círculo: o passo 01 é a ação deste botão. */}
      <div {...{ [PROCESS_HOOK.block]: true }} className="mt-block">
        <div {...{ [PROCESS_HOOK.fade]: true }}>
          {primaryCta.kind === 'text' ? (
            <ContactCta label={primaryCta.value} />
          ) : (
            <PendingContent hint={primaryCta.hint} />
          )}
        </div>
      </div>
    </Section>
  );
}
