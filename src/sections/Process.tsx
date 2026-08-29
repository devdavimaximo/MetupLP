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
 * ─── REDESENHADA EM 2026-08-28, A PEDIDO DO DAVI ────────────────────────────────
 * A versão anterior era MUDA por decisão de direção de arte: tipografia, um filete e
 * ar, apostando que o contraste "herói barulhento → seção silenciosa → CTA" faria o
 * fecho bater mais forte. O Davi assistiu à página inteira e reprovou a aposta — depois
 * do herói e do deck em parallax, a seção "brochava". A aposta era do Claude, o
 * veredito é do dono da marca, e ela foi refeita.
 *
 * O que ela virou é um PAINEL DE EXECUÇÃO, e a régua do §3 continua valendo em cada
 * escolha:
 *
 *  · UM TRILHO DOURADO desce pela lateral acompanhando a rolagem. É a única coisa da
 *    página amarrada à posição do scroll fora do deck, é `aria-hidden` e não segura
 *    texto nenhum — a exceção que `entrance.ts` reserva para camada decorativa.
 *  · CADA PASSO É UM QUADRO que deriva do trilho: um filete em "T" no topo, o numeral
 *    vazado e o nome do passo saindo de dentro da máscara.
 *  · O PASSO QUE ESTÁ SENDO LIDO ACENDE — filete dourado, numeral preenchido, um véu
 *    de superfície. O passo em repouso não perde contraste nenhum: quem acende ganha
 *    sinal, quem espera não é apagado (a conta está em `process.css`).
 *  · UM NUMERAL MONUMENTAL fica fixo à esquerda no desktop e rola de 01 a 04 conforme
 *    os quadros passam. É o mesmo desenho do numeral do quadro, em outra escala — no
 *    celular ele some, porque lá quem carrega a numeração é o quadro.
 *
 * E o que NÃO virou: uma terceira camada de espetáculo. Nada aqui é pinado, nada
 * sequestra a rolagem, nada carrega imagem, e o CTA continua fechando a seção sem
 * depender de atravessar efeito nenhum — além de o header fixo carregar o CTA o tempo
 * todo (§3).
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
 * marcador é removido, e TODA numeração visível é `aria-hidden` — o `<ol>` já anuncia
 * "item 1 de 4", então ler "01" (duas vezes, contando o odômetro) seria a mesma
 * informação repetida em voz alta.
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

        {/* O mesmo filete de Serviços, com o gancho de motion DESTA seção. Ele fecha o
            cabeçalho, e os filetes dos quadros logo abaixo são o mesmo componente
            deitado no topo de cada passo — é o que faz a coluna inteira ler como uma
            derivação dele. */}
        <IndexRule className="mt-block block w-full" motionHook={PROCESS_HOOK.line} />
      </header>

      <div className="process-layout mt-block">
        {/* Painel fixo — decoração pura, e some abaixo de 64rem. Ver `process.css`. */}
        <div aria-hidden className="process-panel" {...{ [PROCESS_HOOK.block]: true }}>
          <div className="process-panel-inner">
            <div className="process-odometer" {...{ [PROCESS_HOOK.fade]: true }}>
              <span className="process-odometer-window">
                <span
                  className="process-odometer-strip"
                  {...{ [PROCESS_HOOK.counter]: true }}
                >
                  {steps.map((step, index) => (
                    <span key={step.title} className="process-numeral">
                      {padIndex(index + 1)}
                    </span>
                  ))}
                </span>
              </span>

              {/* O total, para o numeral que rola ler como fração e não como um número
                  solto. É estrutura derivada do conteúdo (quantos passos existem), nunca
                  copy — mesma régua do `padIndex` em Serviços (§4). */}
              <span className="process-odometer-total font-mono text-label text-muted">
                {`/ ${padIndex(steps.length)}`}
              </span>
            </div>
          </div>
        </div>

        <div className="process-track" {...{ [PROCESS_HOOK.track]: true }}>
          {/* O trilho é IRMÃO da lista, não filho: `<ol>` só aceita `<li>`. E são dois
              nós — o filete apagado que é MEDIDO e o dourado que é ANIMADO —, nunca um
              só; o porquê está em `PROCESS_HOOK.rail`. */}
          <span aria-hidden className="process-spine" {...{ [PROCESS_HOOK.rail]: true }}>
            <span className="process-spine-fill" {...{ [PROCESS_HOOK.spine]: true }} />
          </span>

          <ol role="list" className="process-steps">
            {steps.map((step, index) => (
              <li
                key={step.title}
                className="process-step"
                {...{
                  [PROCESS_HOOK.block]: true,
                  // O VALOR é a posição do passo: é dele que o odômetro tira para onde
                  // deslizar. Ver `animations/process.ts`.
                  [PROCESS_HOOK.step]: String(index),
                }}
              >
                <IndexRule className="process-frame-rule" motionHook={PROCESS_HOOK.line} />

                <span
                  aria-hidden
                  className="process-numeral process-step-index"
                  {...{ [PROCESS_HOOK.cluster]: true }}
                >
                  {padIndex(index + 1)}
                </span>

                <Heading
                  level={3}
                  size="title-sm"
                  className="process-step-title"
                  {...{ [PROCESS_HOOK.cluster]: true }}
                >
                  {step.title}
                </Heading>

                <div className="process-step-body" {...{ [PROCESS_HOOK.body]: true }}>
                  {step.description.kind === 'text' ? (
                    <Text size="body-lg">{step.description.value}</Text>
                  ) : (
                    <PendingContent hint={step.description.hint} />
                  )}
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>

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
