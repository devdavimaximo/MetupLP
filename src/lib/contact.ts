/**
 * Destino ÚNICO de todo CTA de conversão da página.
 *
 * ─── O NÚMERO CHEGOU (2026-08-31) ───────────────────────────────────────────────
 * O Davi enviou o WhatsApp da Metup — **(51) 99867-9260** — e o **Bloqueio nº 1** do
 * `PENDENCIAS.md` caiu com ele: desde F2 a página tinha herói, CTA e seção de
 * contato, e nenhum canal real para onde mandar o lead. A partir daqui a LP não só
 * impressiona: ela converte (§3).
 *
 * Foi exatamente a troca que este arquivo existia para tornar barata — UMA constante.
 * Mudaram de uma vez, sem tocar em nenhuma seção: o destino do CTA do herói, o do
 * header, o do quarto ato da cena Horizon, o evento de analytics (`cta_click` →
 * `whatsapp_click`), o `target="_blank"` com `rel` e o ícone (seta para baixo → seta
 * para fora). Era esse o ponto de não espalhar `href` por seção.
 *
 * ─── O FORMATO DO LINK ──────────────────────────────────────────────────────────
 * `wa.me` exige o número em E.164 **sem** `+`, espaço, parêntese ou traço:
 * `55` (Brasil) + `51` (DDD) + `998679260`. Qualquer separador aqui quebra o link em
 * parte dos aparelhos — daí o número aparecer "colado" abaixo e formatado só para
 * leitura humana neste comentário.
 *
 * ─── O QUE ISSO RESOLVEU, E O QUE NÃO ───────────────────────────────────────────
 * Some a divergência que o `PENDENCIAS.md` registrava: o rótulo dizia "Falar no
 * WhatsApp" e o clique rolava a página. Agora rótulo, ícone e destino dizem a mesma
 * coisa.
 *
 * NÃO resolve o formulário de lead (F6). O WhatsApp é o canal direto; o formulário é
 * para quem não quer abrir conversa — continua pendente, junto de e-mail e endereço.
 * E a âncora `#contato` continua existindo e sendo útil: é o item "Contato" da
 * navegação e o `id` da seção que carrega este CTA (o quarto ato da cena).
 *
 * ─── SE O NÚMERO MUDAR ──────────────────────────────────────────────────────────
 * Troque só o `href`. E lembre que os `analyticsId` são a série histórica do funil
 * (ver a nota em `lib/sections.ts`): renomear um evento corta o histórico.
 */
import type { ConversionEventName } from './analytics';

export type ContactKind = 'pending' | 'whatsapp';

export interface ContactTarget {
  readonly kind: ContactKind;
  readonly href: string;
  /** Evento correspondente; o `Button` exige um, e ele muda com o destino. */
  readonly analyticsId: ConversionEventName;
  /** Só `true` quando o destino sai do site — dispara `target="_blank"` + rel. */
  readonly isExternal: boolean;
}

/**
 * A anotação explícita mantém `kind` como a UNIÃO, e isso não é decoração: sem ela o
 * TypeScript estreitaria o tipo para `'whatsapp'` e a ramificação `pending` de
 * `ContactCta` (o ícone de rolagem) viraria código morto que o compilador recusa.
 * Com a união de pé, voltar ao estado pendente — ou acrescentar um terceiro destino —
 * continua sendo trocar este objeto e mais nada.
 */
export const contactTarget: ContactTarget = {
  kind: 'whatsapp',
  href: 'https://wa.me/5551998679260',
  analyticsId: 'whatsapp_click',
  isExternal: true,
};
