# Pendências — Metup

> Conteúdo/assets que faltam para avançar as fases. Nada de lorem ipsum ou copy
> genérica de agência publicada no lugar do que está aqui (CLAUDE.md seção 4).

## Conteúdo do Davi (bloqueia F2+)

- [ ] **Copy oficial** de todas as seções (hero, serviços, cases, prova social,
      contato, meta/SEO) — `content/copy.md` está com MOCK autorizado pelo Davi
      (2026-08-26) para não travar F1/F2; substituir pela copy oficial quando pronta.
      ⚠ Ao substituir, **mantenha os rótulos** (`**Headline:**`, `**Subheadline:**`,
      `**CTA primário:**`, `**Título da seção:**`, `**Intro:**`, `**Corpo:**`,
      `**CTA:**`). O contrato está documentado no topo de `src/lib/content-parser.ts`.
      Se um rótulo mudar, o build quebra com a lista do que faltou — de propósito.
- [ ] **Cases reais dos clientes**: nome, serviço entregue, resultado/métrica real
      (se houver), depoimento real (se houver) — `content/cases.md` está vazio.
- [ ] **Assets visuais reais** dos cases (screenshots de projeto) em
      `public/images/` — pasta ainda não existe além do favicon/ícones padrão.
- [ ] **Logos de clientes reais** (se forem usados em prova social/logo bar).
- [ ] **Logo/identidade da própria Metup** (hoje só há um favicon placeholder do
      template Vite em `public/favicon.svg`).
- [ ] **Dados de contato reais** para o JSON-LD (`index.html`) e para o CTA de
      WhatsApp/formulário: telefone, e-mail, número de WhatsApp, endereço/área de
      atuação, redes sociais.
- [ ] **Destino do formulário de lead** (serviço de form / endpoint / e-mail) e
      credenciais correspondentes — vão em `.env`, nunca no repositório.
- [ ] **Imagem de Open Graph** (1200×630) real — hoje ausente em `index.html`.

## Decisões pendentes do Davi

- [ ] **Strings de chrome de a11y** ("Pular para o conteúdo", "(abre em nova aba)",
      "Carregando…") estão em `src/lib/ui-strings.ts`, não em `content/copy.md`.
      Interpretação: a regra do CLAUDE.md §9 é sobre copy de **seção** (marketing);
      rótulo de a11y é chrome de produto. Confirmar — se preferir, viram um `## UI`
      no `copy.md`.

## Dívida técnica registrada em F1

- [ ] **Skills obrigatórias ausentes.** O CLAUDE.md §8 exige `ui-ux-pro-max` e
      `web-design-guidelines` em qualquer tela/seção/layout, mas **nenhuma das duas
      existe neste ambiente** (não há `.claude/skills/`). F1 foi feito com
      `frontend-design` e `motion` como análogas. Instalar as originais ou ajustar o
      §8.
- [ ] **Vulnerabilidades moderadas em `react-router-dom`** (3, sem correção
      disponível), puxado por `vite-react-ssg`. Os avisos são sobre `<Link>`,
      `useNavigate` e hidratação SSR — superfície que esta LP de página única não
      usa. A migração para `vite-react-ssg/single-page` (abaixo) **remove a
      dependência inteira** e resolve o alerta.
- [ ] **F7 — migrar para `vite-react-ssg/single-page`.** Verificado que o módulo não
      importa `react-router-dom` em runtime e que `routesToPaths(undefined)` devolve
      `{ paths: ['/'] }`. Ganho: o chunk `client` hoje tem **178.825 bytes** (56 kB
      gzip) e o router é peso morto numa página única. Não feito em F1 porque é
      trabalho de orçamento de JS (F7) e o comportamento com `beasties` não foi
      validado.
- [ ] **F7 — payload do markdown.** `content/copy.md` (~2,6 kB) é inlinado no bundle
      do cliente, e é necessário: a hidratação re-renderiza a árvore. Se o orçamento
      apertar, um plugin Vite pode pré-parsear para JSON e tirar o parser do bundle.
- [ ] **F2 — carregamento adaptativo** (CLAUDE.md §6.5). Não implementado em F1 por
      falta de consumidor até a cena 3D, e porque as heurísticas só se calibram
      medindo. Contrato pretendido:
      ```ts
      // src/lib/capability.ts
      export type CapabilityTier = 'full' | 'lite';
      export function detectCapability(nav: Navigator, reduce: boolean): CapabilityTier;
      // saveData | effectiveType ∈ {slow-2g,2g,3g} | deviceMemory <= 4
      //   | hardwareConcurrency <= 4 | reduce  ⇒ 'lite'
      ```
      `navigator.connection` não existe em `lib.dom`: usar interface local +
      checagem por `in`, nunca `any` (§10).
- [ ] **F7 — avaliar `@fontsource-variable/fraunces`** (eixos SOFT/WONK) para o
      display. Mais expressivo, mas é dependência nova; medir o payload antes.
- [ ] **Baseline de Lighthouse** ainda não medido. Rodar `npm run build && npm run
      preview` + `npx lighthouse http://localhost:4173 --view` (mobile e desktop) e
      anotar aqui, para F7 ter contra o que comparar.

## Notas

- `index.html` já tem title/description/OG/Twitter/JSON-LD/theme-color, mas com texto
  placeholder (factual, sem estatística inventada) até a copy oficial chegar —
  marcados com `TODO(PENDENCIAS.md ...)` no próprio arquivo.
- O styleguide (`styleguide.html`, só em dev) mostra quais campos da copy ainda são
  placeholder — é o jeito rápido de ver o que falta do Davi.
- Estrutura técnica e design system prontos — ver `docs/planning/plano-fases.md`.
