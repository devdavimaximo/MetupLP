import { useRef } from 'react';
import { FINALE_HOOK, horizonFinaleMotion } from '../animations/horizon-finale';
import { useMotion } from '../animations/useMotion';
import { ContactCta, Heading, LeadForm, PendingContent, Section, Text } from '../components';
import { cn } from '../lib/cn';
import { copy } from '../lib/content';
import { leadFormMode } from '../lib/lead-form';
import { SECTION_ID } from '../lib/sections';
import { uiStrings } from '../lib/ui-strings';

const HEADING_ID = 'contato-titulo';

export interface HorizonFinaleProps {
  /**
   * Sem a cena atrás — o `fallback` do `SceneBoundary`.
   *
   * Se o WebGL falhar (driver velho, contexto recusado, aparelho sem GPU), a cena
   * inteira é substituída por este mesmo ato, só que como uma seção comum: fundo da
   * página, ritmo normal, sem véu e sem tela cheia. O CTA e a âncora `#contato`
   * sobrevivem — que é o ponto (ver a nota em `three/SceneBoundary`).
   */
  readonly standalone?: boolean;
}

/**
 * O QUARTO ATO da cena Horizon: o CTA que fecha a página (pedido do Davi, 2026-08-31).
 *
 * ─── POR QUE ELE MORA DENTRO DA CENA ────────────────────────────────────────────
 * Ele é passado como `finale` para o componente da cena e renderizado como o último
 * filho do container dela — com o `<canvas>` preso atrás e dentro da mesma pista de
 * rolagem. A diferença não é técnica, é de argumento: colado embaixo, seria "a cena
 * acabou, agora tem um botão"; dentro, a cena CHEGA a algum lugar, e o lugar é o
 * contato. Os três atos anteriores são a copy do Davi montando exatamente essa
 * escada — "Você enxerga mais longe." → "Mas enxergar não basta." → "É preciso
 * construir para chegar lá." —, e este ato é a resposta: quem constrói.
 *
 * ─── ELE É A SEÇÃO `#contato` (e absorveu a `ContactAnchor`) ────────────────────
 * A âncora de contato é UMA na página. Ela era a `sections/ContactAnchor` de F2 — a
 * "versão simples" que existia para o CTA do herói ter um destino real — e passou a
 * ser este ato. Duas seções de contato em sequência seriam a mesma pergunta feita
 * duas vezes, e a segunda, mais fraca, ficaria com a última palavra.
 *
 * O que veio junto e continua valendo: o `id` de `lib/sections.ts` (é para cá que
 * apontam o CTA do herói, o do header e o item "Contato" da navegação), a headline e
 * o convite que o Davi escreveu, e o aviso de o que F6 ainda precisa entregar —
 * visível só em dev, nunca publicado (§4).
 *
 * ─── A COPY É DO DAVI, TODA ─────────────────────────────────────────────────────
 * Headline e corpo vêm de `## Contato / CTA final` em `content/copy.md`.
 *
 * ⚠ O RÓTULO DO BOTÃO É EMPRESTADO, e isso está registrado em PENDENCIAS.md. O campo
 * natural seria `copy.contact.cta`, mas ele guarda DOIS CTAs num campo só ("Falar no
 * WhatsApp · Enviar mensagem") — e o segundo, "Enviar mensagem", é o formulário de
 * F6, que ainda não existe. Até lá, o botão usa `copy.hero.primaryCta` ("Falar no
 * WhatsApp"), que é texto do Davi e aponta para o destino único de `lib/contact.ts`
 * — desde 2026-08-31, o WhatsApp real. Nada foi inventado nem recortado por
 * separador.
 *
 * ─── POR QUE O TEXTO É LEGÍVEL SOBRE A CENA ─────────────────────────────────────
 * Não é opacidade chutada. São duas contas somadas: a câmera do ato recua e sobe
 * (`CAMERA_ACTS[3]`, no componente da cena), o que encolhe o clarão da atmosfera; e o
 * véu — o `backdrop` full-bleed abaixo — devolve o fundo da página por trás do bloco.
 * As duas estão escritas por extenso em `styles/horizon-finale.css`. Quem aumentar o
 * brilho da cena tem que refazê-las.
 *
 * ─── HIERARQUIA: O OURO É DO BOTÃO ──────────────────────────────────────────────
 * Os três atos anteriores enunciam em Bebas Neue dourada. Este volta para a Fraunces
 * em creme, e o dourado sobra para a linha do horizonte (um filete) e para o
 * preenchimento do botão. É o único fill sólido da tela: a página abre alta e fecha
 * quente, e no quadro em que ela pede o clique não há um segundo objeto dourado
 * disputando o olho (§3).
 */
export function HorizonFinale({ standalone = false }: HorizonFinaleProps) {
  const ref = useRef<HTMLElement>(null);
  useMotion(ref, horizonFinaleMotion);

  const { headline, body } = copy.contact;
  const { primaryCta } = copy.hero;

  return (
    <Section
      ref={ref}
      id={SECTION_ID.contact}
      labelledBy={HEADING_ID}
      rhythm="flush"
      // Sobre a cena a seção NÃO pode ter fundo — ver o tom `transparent` em
      // `components/Section`. No fallback ela é uma seção comum e recupera o fundo.
      tone={standalone ? 'base' : 'transparent'}
      width="narrow"
      className={cn('horizon-finale', standalone && 'horizon-finale--standalone')}
      backdrop={<div aria-hidden className="horizon-finale__veil" />}
    >
      <div className="horizon-finale__block">
        {/* A LINHA DO HORIZONTE — o único enfeite do ato, e ele tem função dupla:
            fecha o arco que a cena abriu em "HORIZONTE" e ocupa, na composição, o
            lugar onde os outros atos põem um título. Sem texto, então sem copy
            inventada (§4). O gradiente e a origem central estão no CSS. */}
        <span aria-hidden className="horizon-finale__rule" {...{ [FINALE_HOOK.rule]: true }} />

        {headline.kind === 'text' ? (
          <Heading
            level={2}
            size="display"
            id={HEADING_ID}
            className="horizon-finale__headline"
            {...{ [FINALE_HOOK.headline]: true }}
          >
            {headline.value}
          </Heading>
        ) : (
          <PendingContent hint={headline.hint} />
        )}

        <div className="horizon-finale__lede" {...{ [FINALE_HOOK.fade]: true }}>
          {body.kind === 'text' ? (
            // `tone="fg"` e não o `fg-muted` padrão do <Text>: mesma exceção medida do
            // herói (ver `sections/Hero`). Sobre o resto do clarão que o véu deixa
            // passar, o cinza secundário não sustenta o AA — e este é o parágrafo que
            // explica o que fazer em seguida, não uma legenda.
            <Text size="body-lg" tone="fg">
              {body.value}
            </Text>
          ) : (
            <PendingContent hint={body.hint} />
          )}
        </div>

        <div className="horizon-finale__cta" {...{ [FINALE_HOOK.fade]: true }}>
          {primaryCta.kind === 'text' ? (
            // `primary` (dourado sólido) e não o `secondary` do herói: é o mesmo
            // destino, no fim da página, e aqui ele é o objeto mais brilhante da tela.
            <ContactCta label={primaryCta.value} size="lg" variant="primary" />
          ) : (
            <PendingContent hint={primaryCta.hint} />
          )}
        </div>

        {/* ─── O SEGUNDO CAMINHO ────────────────────────────────────────────────
            Só aparece quando existe destino para ele (`leadFormMode()`): em produção
            sem `VITE_LEAD_ENDPOINT` o ato volta a ser só o WhatsApp, que funciona.
            Publicar campos que não levam a lugar nenhum é a pior coisa que esta
            página poderia fazer — a pessoa escreve, clica e o lead evapora (§3).
            Os três modos estão documentados em `lib/lead-form.ts`. */}
        {leadFormMode() !== 'off' && (
          <div className="horizon-finale__second" {...{ [FINALE_HOOK.fade]: true }}>
            {/* O divisor nomeia os dois caminhos sem gastar um título: acima o
                atalho, abaixo o formulário. `aria-hidden` porque um "ou" solto não
                diz nada a quem não vê a linha — quem nomeia o formulário para leitor
                de tela é o `<legend>` dele. */}
            <p aria-hidden className="horizon-finale__divider">
              <span className="horizon-finale__divider-rule" />
              {uiStrings.form.divider}
              <span className="horizon-finale__divider-rule" />
            </p>

            <LeadForm />
          </div>
        )}

        {/* Só em dev — `PendingContent` não renderiza nada em produção. */}
        <PendingContent
          hint={
            'F6 — falta UMA variável: `VITE_LEAD_ACCESS_KEY` no `.env` (a chave do Web3Forms, serviço escolhido pelo Davi). ' +
            'Sem ela, este formulário está em modo de ensaio aqui e NÃO é publicado em produção. ' +
            'Depende também da caixa contato@metup.com.br existir — ver PENDENCIAS.md. ' +
            'Com o destino no ar, o `copy.contact.cta` vira dois botões e o rótulo emprestado do herói sai daqui.'
          }
        />
      </div>
    </Section>
  );
}
