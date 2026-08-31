import { useRef } from 'react';
import { useSmoothScroll } from '../animations/useSmoothScroll';
import { Header, SkipLink } from '../components';
import { Hero } from '../sections/Hero';
import { HorizonHero } from '../sections/HorizonHero';
import { Process } from '../sections/Process';
import { Services } from '../sections/Services';
import { ZoomShowcase } from '../sections/ZoomShowcase';

const MAIN_ID = 'conteudo';

/**
 * Casca da página.
 *
 * ─── ORDEM DO DOCUMENTO ─────────────────────────────────────────────────────────
 * `SkipLink` é o primeiro focável, antes do header — quem navega por teclado chega
 * ao conteúdo sem atravessar o CTA e o wordmark a cada carregamento.
 *
 * O scroll suave é chamado AQUI, e uma vez só: o Lenis é global (ele governa a
 * rolagem do documento) e duas instâncias competiriam pela mesma posição. Ele mesmo
 * decide se deve existir — ver `useSmoothScroll`.
 *
 * A ordem é o argumento da página — impressiona, mostra o que faz, explica como
 * começa, pede o contato —, e o Processo entra exatamente antes do fecho porque é ali
 * que a objeção "como isso funciona?" aparece.
 *
 * ⚠ `<ZoomShowcase />` entrou depois do Processo, a pedido do Davi (2026-08-29), e é
 * PROVISÓRIA: é o demo do componente de zoom portado como está. Não é vitrine de case
 * nem entra na navegação enquanto o conteúdo real não for definido — ver a nota em
 * `sections/ZoomShowcase.tsx`.
 *
 * ⚠ `<HorizonHero />` vem LOGO DEPOIS dela, e a ordem não é só narrativa: as duas são
 * UM gesto só desde 2026-08-31. O quadro central da vitrine não tem imagem nenhuma —
 * o que abre lá dentro é o `<canvas>` da cena, projetado dentro do quadrinho e
 * crescendo com ele até tomar a tela; quando o zoom acaba, a cena já está ali e a
 * viagem começa. `zoomTrackRef` é o fio entre as duas: a vitrine empresta a própria
 * pista, a cena mede o zoom nela. **Separar as duas — ou pôr qualquer coisa entre
 * elas — quebra a conta e o gesto.**
 *
 * ⚠ NÃO EXISTE MAIS UMA `<ContactAnchor />` AQUI (2026-08-31, pedido do Davi: "esse
 * CTA finaliza a página"). A seção `#contato` passou a ser o QUARTO ATO da cena
 * Horizon — ela é renderizada de dentro de `<HorizonHero />`, com o canvas atrás. É
 * por isso que a lista abaixo parece terminar sem contato: ele está lá, um nível mais
 * fundo. O porquê de o CTA morar dentro da cena está em `sections/HorizonFinale`.
 *
 * ⚠ `<Process />` pode não renderizar NADA: a seção é opcional em `content/copy.md`
 * (ver a nota em `sections/Process.tsx`). A página tem que continuar coerente sem ela
 * — e continua, porque o CTA final não depende dela.
 *
 * Prova social (F5) entra antes da cena; o formulário de lead (F6) entra DENTRO do
 * quarto ato, que é onde o CTA já está.
 */
export function App() {
  useSmoothScroll();

  // A pista da vitrine em zoom, emprestada para a cena logo abaixo. Ela mora aqui
  // porque é o menor lugar comum às duas seções — nenhuma das duas precisa conhecer a
  // outra, e o dia em que a vitrine sair, some a `ref` e a cena continua inteira.
  const zoomTrackRef = useRef<HTMLDivElement>(null);

  return (
    <>
      <SkipLink targetId={MAIN_ID} />
      <Header />
      <main id={MAIN_ID}>
        <Hero />
        <Services />
        <Process />
        <ZoomShowcase trackRef={zoomTrackRef} />
        {/* Carrega a seção `#contato` dentro dela — ver o aviso no cabeçalho. */}
        <HorizonHero zoomTrackRef={zoomTrackRef} />
      </main>

      {import.meta.env.DEV && (
        <a
          href="/styleguide.html"
          className="fixed right-4 bottom-4 z-toast rounded-xs border border-line-strong bg-surface-raised px-3 py-2 font-mono text-label text-accent-2 uppercase focus-visible:focus-ring"
        >
          Styleguide
        </a>
      )}
    </>
  );
}
