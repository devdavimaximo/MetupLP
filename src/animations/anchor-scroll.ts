/**
 * Cliques em âncora (`href="#..."`) quando o Lenis está no comando.
 *
 * ─── POR QUE NÃO A OPÇÃO `anchors` DO LENIS ─────────────────────────────────────
 * O Lenis sabe interceptar âncoras sozinho, mas ignora `scroll-margin` e só aceita
 * um `offset` numérico fixo. Com um header fixo, isso significa duplicar a altura do
 * header num número em JS — que passa a divergir do `--spacing-header` em silêncio
 * no dia em que alguém mexer no CSS. Aqui a altura é LIDA do header real no momento
 * do clique: não há segundo valor para divergir, e um header que mude de altura por
 * qualquer motivo continua certo.
 *
 * ─── POR QUE ISTO NÃO É SÓ COSMÉTICO ────────────────────────────────────────────
 * Ao dar `preventDefault()`, perde-se um comportamento nativo que quase ninguém
 * lembra: o navegador move o FOCO para o destino da âncora. Sem repor isso, quem
 * navega por teclado clica no CTA do herói, a página rola, e o próximo Tab continua
 * lá em cima no header — o CTA principal passa a ser uma armadilha (§6.6). Por isso
 * o foco é reposto no fim da rolagem.
 *
 * Só é montado com o Lenis ativo. Sem JS, com movimento reduzido ou no tier `lite`,
 * a âncora é nativa e o `scroll-mt-anchor` das seções resolve o header.
 */
import type Lenis from 'lenis';

const HEADER_SELECTOR = '[data-site-header]';

/** Respiro entre a borda de baixo do header e o topo da seção. */
const BREATHING_PX = 20;

function anchorOffset(): number {
  const header = document.querySelector(HEADER_SELECTOR);
  const height = header === null ? 0 : header.getBoundingClientRect().height;
  // Negativo: o Lenis soma o offset ao alvo, então rolar MENOS é o que deixa a
  // seção aparecer abaixo do header em vez de atrás dele.
  return -(height + BREATHING_PX);
}

/**
 * `tabindex="-1"` torna o destino focável por script sem entrar na ordem de Tab.
 * `preventScroll` impede o navegador de dar um pulo por cima da rolagem do Lenis.
 */
function focusDestination(destination: HTMLElement): void {
  if (!destination.hasAttribute('tabindex')) destination.setAttribute('tabindex', '-1');
  destination.focus({ preventScroll: true });
}

export function bindAnchorScroll(lenis: Lenis): () => void {
  const onClick = (event: MouseEvent): void => {
    // Respeita o que o navegador (ou outro handler) já decidiu: clique do meio,
    // abrir em nova aba, salvar. Sequestrar isso é hostil.
    if (event.defaultPrevented || event.button !== 0) return;
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

    const { target } = event;
    if (!(target instanceof Element)) return;

    const anchor = target.closest('a');
    if (anchor === null || anchor.target === '_blank') return;

    // `getAttribute` e não `.href`: a propriedade resolve para URL absoluta e
    // "#contato" chegaria como "https://…/#contato", que não casa com o teste.
    const hash = anchor.getAttribute('href');
    if (hash === null || !hash.startsWith('#') || hash.length < 2) return;

    const destination = document.getElementById(hash.slice(1));
    if (destination === null) return;

    event.preventDefault();
    lenis.scrollTo(destination, {
      offset: anchorOffset(),
      onComplete: () => {
        focusDestination(destination);
      },
    });
    // Mantém o comportamento nativo de âncora: a URL passa a apontar para a seção,
    // então o botão voltar e compartilhar o link continuam funcionando.
    window.history.pushState(null, '', hash);
  };

  document.addEventListener('click', onClick);

  return () => {
    document.removeEventListener('click', onClick);
  };
}
