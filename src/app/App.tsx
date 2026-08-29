import { useSmoothScroll } from '../animations/useSmoothScroll';
import { Header, SkipLink } from '../components';
import { ContactAnchor } from '../sections/ContactAnchor';
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
 * São quatro seções: o herói, Serviços (cabeçalho editorial + deck em parallax), o
 * Processo e o destino do CTA. A ordem é o argumento da página — impressiona, mostra
 * o que faz, explica como começa, pede o contato —, e o Processo entra exatamente
 * antes do CTA final porque é ali que a objeção "como isso funciona?" aparece.
 *
 * ⚠ `<ZoomShowcase />` entrou depois do Processo, a pedido do Davi (2026-08-29), e é
 * PROVISÓRIA: é o demo do componente de zoom portado como está, com as fotos do
 * Unsplash que vieram com ele. Não é vitrine de case nem entra na navegação enquanto
 * o conteúdo real não for definido — ver a nota em `sections/ZoomShowcase.tsx`.
 *
 * ⚠ `<HorizonHero />` vem LOGO DEPOIS dela, e a ordem é o efeito: o quadro central do
 * zoom é PRETO, então a vitrine termina em tela cheia escura e a cena nasce dessa
 * escuridão. Separar as duas quebra o gesto. Também provisória — ver PENDENCIAS.md.
 *
 * ⚠ `<Process />` pode não renderizar NADA: a seção é opcional em `content/copy.md`
 * (ver a nota em `sections/Process.tsx`). A página tem que continuar coerente com
 * três seções — e continua, porque o CTA final não depende dela.
 *
 * Prova social (F5) e o contato completo (F6) entram por baixo, nesta ordem.
 */
export function App() {
  useSmoothScroll();

  return (
    <>
      <SkipLink targetId={MAIN_ID} />
      <Header />
      <main id={MAIN_ID}>
        <Hero />
        <Services />
        <Process />
        <ZoomShowcase />
        <HorizonHero />
        <ContactAnchor />
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
