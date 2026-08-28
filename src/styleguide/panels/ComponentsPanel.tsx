import {
  Button,
  Eyebrow,
  Heading,
  PendingContent,
  SkipLink,
  Surface,
  Text,
  type ButtonSize,
  type ButtonVariant,
} from '../../components';

const VARIANTS: readonly ButtonVariant[] = ['primary', 'secondary', 'ghost', 'link'];
const SIZES: readonly ButtonSize[] = ['sm', 'md', 'lg'];

/**
 * `analyticsLocation` fixo aqui porque o styleguide não vive dentro de uma <Section>.
 * Os cliques disparam de verdade — abra o console para ver os eventos de conversão.
 */
function ButtonRow({ variant }: { variant: ButtonVariant }) {
  const converting = variant === 'primary' || variant === 'secondary';

  return (
    <div style={{ borderBottom: '1px solid var(--color-line)', padding: '1.25rem 0' }}>
      <p className="sg-label" style={{ marginBottom: '0.75rem' }}>
        {variant}
        {converting && ' · analyticsId obrigatório pelo tipo'}
      </p>
      <div className="sg-row">
        {SIZES.map((size) =>
          converting ? (
            <Button
              key={size}
              variant={variant}
              size={size}
              analyticsId="cta_click"
              analyticsLocation="styleguide"
            >
              Falar no WhatsApp
            </Button>
          ) : (
            <Button key={size} variant={variant} size={size} analyticsLocation="styleguide">
              Falar no WhatsApp
            </Button>
          ),
        )}

        {converting ? (
          <Button variant={variant} disabled analyticsId="cta_click" analyticsLocation="styleguide">
            Desabilitado
          </Button>
        ) : (
          <Button variant={variant} disabled analyticsLocation="styleguide">
            Desabilitado
          </Button>
        )}

        <Button
          as="a"
          href="https://example.com"
          target="_blank"
          variant={converting ? variant : 'ghost'}
          analyticsId="cta_click"
          analyticsLocation="styleguide"
        >
          Link externo
        </Button>
      </div>
    </div>
  );
}

export function ComponentsPanel() {
  return (
    <section className="sg-section" id="componentes">
      <h2>Componentes</h2>

      <div className="sg-stack">
        <div>
          <p className="sg-label" style={{ marginBottom: '0.75rem' }}>
            Botão — tabule por eles e confirme que o anel de foco fica legível TAMBÉM sobre o
            preenchimento dourado (é o outline-offset que salva)
          </p>
          {VARIANTS.map((variant) => (
            <ButtonRow key={variant} variant={variant} />
          ))}
        </div>

        <div>
          <p className="sg-label" style={{ marginBottom: '0.75rem' }}>
            Tipografia — nível semântico separado do tamanho visual
          </p>
          <div className="sg-type-demo">
            <Eyebrow>Serviços</Eyebrow>
            <Heading level={2} size="display-sm">
            Título de seção
          </Heading>
            <Text size="lead">
            Parágrafo de abertura no tom `lead`, com text-wrap pretty para não deixar viúva.
          </Text>
            <Text>Corpo padrão em `fg-muted`, o secundário AAA do sistema.</Text>
          </div>
        </div>

        <div>
          <p className="sg-label" style={{ marginBottom: '0.75rem' }}>
            Surface — `interactive` força borda legível (3.28:1) e anel de foco
          </p>
          <div className="sg-grid">
            <Surface className="sg-pad">
              <Text size="body-sm">flat · hairline</Text>
            </Surface>
            <Surface elevation="raised" className="sg-pad">
              <Text size="body-sm">raised</Text>
            </Surface>
            <Surface elevation="panel" glow="accent" className="sg-pad">
              <Text size="body-sm">panel · glow dourado</Text>
            </Surface>
            <Surface interactive as="article" className="sg-pad">
              <Text size="body-sm">interactive (tabule até aqui)</Text>
            </Surface>
          </div>
        </div>

        <div>
          <p className="sg-label" style={{ marginBottom: '0.75rem' }}>
            PendingContent — em produção renderiza `null`; nada de colchete vai ao ar
          </p>
          <PendingContent hint="depoimentos/logos reais de clientes entram aqui quando o Davi enviar" />
        </div>

        <div>
          <p className="sg-label" style={{ marginBottom: '0.75rem' }}>
            SkipLink — invisível até receber foco. Clique aqui e aperte Tab.
          </p>
          <SkipLink targetId="componentes" />
        </div>
      </div>
    </section>
  );
}
