/// <reference types="vite/client" />

/**
 * Variáveis de ambiente do projeto, DECLARADAS.
 *
 * Sem este arquivo, `import.meta.env.VITE_ALGO` resolve pelo índice genérico que o
 * `vite/client` declara e chega como `any` — exatamente o que o §10 proíbe. Aqui elas
 * ganham tipo, e um nome errado passa a quebrar o build em vez de virar `undefined`
 * silencioso em produção.
 *
 * ⚠ TODO `VITE_*` VAI PARA O BUNDLE, em texto puro. Isto aqui é para chave PÚBLICA de
 * formulário (o tipo que os serviços entregam justamente para ser chamada do
 * navegador). Segredo de verdade — credencial de e-mail, token de API com escrita —
 * NUNCA entra com este prefixo: ele seria publicado junto com o site (§8).
 */
interface ImportMetaEnv {
  /**
   * ⚠ NORMALMENTE NÃO PRECISA SER PREENCHIDA. O serviço escolhido pelo Davi é o
   * Web3Forms, e a URL dele já é o padrão em `lib/lead-form.ts` — basta a
   * `VITE_LEAD_ACCESS_KEY` abaixo para o formulário entrar no ar.
   *
   * Ela existe para o dia de trocar de serviço: preenchida, vence o padrão. Sem ela e
   * sem a chave, não há destino — e aí a regra do §3 entra: em produção o formulário
   * não é publicado (fica só o WhatsApp) e em dev ele aparece em modo de ensaio.
   */
  readonly VITE_LEAD_ENDPOINT?: string;
  /**
   * A CHAVE DO WEB3FORMS — a única variável que o formulário precisa para funcionar.
   *
   * É uma chave PÚBLICA, emitida para ser chamada do navegador; publicá-la no bundle
   * é o uso previsto dela, não um vazamento. Quem a tem consegue enviar mensagens
   * para a caixa da Metup — o mesmo que qualquer visitante consegue pelo formulário.
   */
  readonly VITE_LEAD_ACCESS_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
