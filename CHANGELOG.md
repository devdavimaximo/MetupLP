# Changelog — Metup

Registro das mudanças relevantes da landing page. As fases estão descritas em
`docs/planning/plano-fases.md`.

## F1 — Design System & Identidade

### Adicionado

- **Design tokens completos** em `src/styles/tokens.css`, agora dentro de `@theme` do
  Tailwind v4: cor (superfícies, texto, linhas, marca, estado), escala tipográfica
  fluida com nomes semânticos, ritmo de espaço, raio, luz, breakpoints, z-index e
  motion.
- **Entrada CSS única** (`src/styles/index.css`) — sem ela o `@theme` não se fundiria
  ao `@import 'tailwindcss'` e os utilitários de marca não existiriam.
- **Camada de motion** com fonte única compartilhada entre CSS e GSAP:
  `src/animations/motion.ts` (tokens + curvas registradas no GSAP),
  `motion-sync.ts` (detector de divergência, dev), `useMotion.ts` (matchMedia +
  cleanup obrigatório) e `presets.ts` (cada preset com par completo/calmo).
- **Loader de conteúdo tipado**: `src/lib/content-parser.ts` + `content.ts`. A copy é
  lida de `content/copy.md`; o tipo `CopyField` impede o componente de publicar um
  placeholder `[ ... ]`, e o build falha se faltar chave.
- **Componentes base** em `src/components/`: `Button` (CTA com `analyticsId`
  obrigatório por tipo), `Container`, `Section`, `Heading`, `Text`, `Eyebrow`,
  `Surface`, `SkipLink`, `VisuallyHidden`, `PendingContent`.
- **Hooks**: `useReducedMotion` (SSR-safe), `useInView`, `useIsomorphicLayoutEffect`.
- **Lib**: `analytics.ts` (contrato de eventos de conversão), `contrast.ts`, `cn.ts`,
  `ui-strings.ts`.
- **Styleguide dev-only** (`styleguide.html` + `src/styleguide/`): contraste medido,
  escala fluida ao vivo, componentes em todos os estados, motion full × calm e a copy
  parseada. Entrada HTML separada — nunca entra no build.

### Alterado

- Fontes reduzidas ao subset `latin` e a 5 pesos: os arquivos de fonte no build
  caíram de ~30 para 5 woff2.
- `App.tsx` virou casca sem copy de marketing.
- `tsconfig.app.json`: `DOM.Iterable` adicionado ao `lib`.
- `index.html`: `theme-color`.

### Removido

- Regra global de `prefers-reduced-motion` em `base.css` que zerava toda transição
  com `!important`. Não afetava o GSAP (dava falsa conformidade), quebrava a variante
  calma e degradava a UI de quem pediu conforto. No lugar: override de tokens de
  duração + `motion-safe:`/`motion-reduce:`, com a a11y real vindo de
  `gsap.matchMedia()`.
- Rampa `--space-1..8`, absorvida pelo escalar `--spacing`.
- Defaults de cor/tipo/raio/sombra/breakpoint do Tailwind, apagados no `@theme` para
  que o único vocabulário que compile seja o da Metup.

## F0 — Discovery & Direção de Arte

- Setup do projeto (Vite + React + TypeScript + `vite-react-ssg` + Tailwind v4).
- Direção de arte aprovada: "Terminal Precision" (grafite + âmbar + turquesa) com a
  dupla tipográfica Fraunces + Work Sans, auto-hospedadas.
- Estrutura de pastas, `content/`, `PENDENCIAS.md` e SEO base em `index.html`.
