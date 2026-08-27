import { Container, SkipLink } from '../components';

const MAIN_ID = 'conteudo';

/**
 * Casca da página.
 *
 * Em F1 ela é deliberadamente vazia de conteúdo: as seções (hero, serviços, cases,
 * prova social, contato) entram a partir de F2 lendo de `content/`. Nenhuma copy de
 * marketing é escrita aqui — o que aparece abaixo é só a marca e, em dev, o atalho
 * para o styleguide.
 */
export function App() {
  return (
    <>
      <SkipLink targetId={MAIN_ID} />
      <main id={MAIN_ID} className="flex min-h-screen items-center">
        <Container>
          <p className="font-mono text-label text-accent uppercase">Metup</p>
          <p className="mt-4 max-w-narrow font-display text-display-sm text-fg">
            Design system em construção.
          </p>
          {import.meta.env.DEV && (
            <a
              href="/styleguide.html"
              className="mt-8 inline-block font-mono text-label text-accent-2 uppercase underline underline-offset-4 focus-visible:focus-ring"
            >
              Abrir styleguide →
            </a>
          )}
        </Container>
      </main>
    </>
  );
}
