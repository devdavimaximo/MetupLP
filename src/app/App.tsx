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
 * ⚠ O ZOOM DA VITRINE ESTÁ DESLIGADO (2026-08-31, pedido do Davi: "quero retirar
 * totalmente o zoom parallax (...) passe direto pra cena 3d (...) pode desativar
 * com `none` ou algo assim, para que eu não perca todo código e talvez futuramente
 * possa ser usado").
 *
 * O interruptor é só esta constante: `<ZoomShowcase>` continua no lugar (o título
 * "Toda ideia começa pequena." continua na tela), mas sem a colagem, sem
 * `ZoomBackground` e sem a pista de 300vh — e a cena Horizon, sem pista para medir,
 * volta sozinha a começar do jeito de sempre (sem o "ato zero"). Nada foi apagado:
 * ver `ZoomShowcaseProps.zoomEnabled` para o que cada modo monta. Ligar de volta é
 * virar isto para `true`.
 */
const ZOOM_PARALLAX_ENABLED = false;

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
 * ⚠ O ZOOM EM SI ESTÁ DESLIGADO (`ZOOM_PARALLAX_ENABLED`, logo acima) — a seção
 * continua no lugar, só o efeito que sai. Com ele ligado, `<ZoomShowcase />` e
 * `<HorizonHero />` são UM gesto só: o quadro central da vitrine não tem imagem
 * nenhuma, o que abre lá dentro é o `<canvas>` da cena, projetado dentro do
 * quadrinho e crescendo com ele até tomar a tela — `zoomTrackRef` é o fio entre as
 * duas, a vitrine empresta a própria pista, a cena mede o zoom nela. Com ele
 * desligado (o estado de hoje), esse fio nunca prende em nada — `trackRef`/
 * `zoomTrackRef` continuam passados às duas seções, mas nenhuma pista existe para
 * anexar, e cada uma volta ao próprio comportamento normal sozinha. **Não separe as
 * duas seções no documento, nem ponha algo entre elas** — no dia em que o zoom
 * voltar, a adjacência é parte da conta (ver `ZoomParallaxProps.trackRef`).
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
        <ZoomShowcase trackRef={zoomTrackRef} zoomEnabled={ZOOM_PARALLAX_ENABLED} />
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
