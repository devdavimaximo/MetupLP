# Pendências — Metup

> Conteúdo/assets que faltam para avançar as fases. Nada de lorem ipsum ou copy
> genérica de agência publicada no lugar do que está aqui (CLAUDE.md seção 4).

## ⚠ Bloqueio nº 1 — a página ainda não tem para onde converter

Desde F2 existe herói, CTA e seção de contato, mas **não existe um único canal de
contato real**: sem número de WhatsApp, sem e-mail, sem telefone, sem destino de
formulário. Enquanto isso durar, a LP impressiona e não converte — o oposto do
CLAUDE.md §3.

O que F2 fez para não perder o lead nem inventar dado (§4):

- Todo CTA aponta para `src/lib/contact.ts`, o **destino único**. Hoje ele vale
  `{ kind: 'pending', href: '#contato' }`; quando o número chegar, **uma troca ali**
  muda herói, header e (em F6) o CTA final de uma vez — destino, evento de
  analytics, `target` e ícone.
- **Divergência conhecida e temporária:** o rótulo do CTA é `copy.hero.primaryCta`
  ("Falar no WhatsApp") mas o destino é `#contato`. O rótulo é copy do Davi e não
  pode ser reescrito aqui; o ícone compensa enquanto isso (seta para baixo = rola a
  página; seta para fora = sai do site). **Some no minuto em que o número existir.**
- A seção `#contato` é o alvo mínimo: só a headline e o convite que o Davi já
  escreveu. O formulário, o botão de WhatsApp e os eventos `lead_form_*` são F6.

## Conteúdo do Davi (bloqueia F2+)

- [ ] **Copy oficial** de todas as seções (hero, serviços, cases, prova social,
      contato, meta/SEO) — `content/copy.md` está com MOCK autorizado pelo Davi
      (2026-08-26) para não travar F1/F2; substituir pela copy oficial quando pronta.
      ⚠ Ao substituir, **mantenha os rótulos** (`**Headline:**`, `**Subheadline:**`,
      `**CTA primário:**`, `**Título da seção:**`, `**Intro:**`, `**Corpo:**`,
      `**CTA:**`). O contrato está documentado no topo de `src/lib/content-parser.ts`.
      Se um rótulo mudar, o build quebra com a lista do que faltou — de propósito.
      ⚠ **Novo em F3:** `## Serviços` agora também exige `**Título da seção:**` — sem
      ele a seção ficaria sem `<h2>` e sem nome acessível.
- [ ] **Título da seção de Serviços** — "O que a Metup faz" é **proposta do Claude
      aprovada pelo Davi em 2026-08-27** (F3), no mesmo regime do MOCK: sem
      afirmação, número ou promessa. Trocar pela copy oficial junto com o resto.
- [ ] **(Opcional) Intro da seção de Serviços.** Hoje a seção se sustenta em uma
      frase por serviço, que é o que existe. Se o Davi quiser um parágrafo de
      abertura, o rótulo é `**Intro:**` dentro de `## Serviços` — e aí o parser
      precisa passar a lê-lo (hoje ele não lê, justamente para não pedir texto que
      não existe).
- [ ] **Cases reais dos clientes**: nome, serviço entregue, resultado/métrica real
      (se houver), depoimento real (se houver) — `content/cases.md` está vazio.
- [ ] **Assets visuais reais** dos cases (screenshots de projeto) em
      `public/images/` — pasta ainda não existe além do favicon/ícones padrão.
- [ ] **Logos de clientes reais** (se forem usados em prova social/logo bar).
- [ ] **Logo/identidade da própria Metup** (hoje só há um favicon placeholder do
      template Vite em `public/favicon.svg`). Desde F2 o header usa
      `src/components/Logo.tsx` — um **wordmark tipográfico** feito com a própria
      dupla de fontes do design system, com o caret âmbar da direção. Não é marca
      inventada passando por oficial: é desenho autoral da casa, que o §5 permite
      (o que ele proíbe é forjar trabalho de CLIENTE). Substituir pelo logo real.
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
      validado. **Confirmado por medição em F2:** o Lighthouse aponta **29 kB gzip de
      JS não usado dentro do próprio `client-*.js`** — é o router, e é a maior fatia
      descartável do orçamento.
- [ ] **F7 — payload do markdown.** `content/copy.md` (~2,6 kB) é inlinado no bundle
      do cliente, e é necessário: a hidratação re-renderiza a árvore. Se o orçamento
      apertar, um plugin Vite pode pré-parsear para JSON e tirar o parser do bundle.
- [x] ~~**F2 — carregamento adaptativo** (CLAUDE.md §6.5)~~ — **feito em F2**, no
      contrato exato que estava registrado aqui (`src/lib/capability.ts`, interface
      local + checagem por `in`, sem `any`). Consumidores hoje: o scroll suave
      (Lenis) e o bloom que segue o ponteiro no herói — os dois desligam no tier
      `lite`. **Falta calibrar medindo em device real**: os cortes (4 GB, 4 núcleos)
      vieram do contrato, não de medição.
- [ ] **F7 — avaliar `@fontsource-variable/fraunces`** (eixos SOFT/WONK) para o
      display. Mais expressivo, mas é dependência nova; medir o payload antes.
- [x] ~~**Baseline de Lighthouse** ainda não medido~~ — **medido no fim de F2**
      (`dist/` servido por `npm run preview`, Chrome headless):

      | | Perf | A11y | BP | SEO | LCP | CLS | TBT |
      |---|---|---|---|---|---|---|---|
      | Desktop | **100** | **100** | **100** | 91 | 0,6 s | 0,053 | 0 ms |
      | Mobile  | **96**  | **100** | **100** | 91 | 2,4 s | 0,004 | 30 ms |

      **SEO 91 nos dois é só `robots.txt` ausente** (o preview devolve o
      `index.html` no lugar e o parser acusa 35 erros) — item de F7, não regressão.
      CWV no verde. O risco que a decisão do SplitText criava — esconder o elemento
      de LCP depois da hidratação — **não se materializou**: 0,6 s no desktop.
      **Mas o LCP mobile (2,4 s) está a 0,1 s do limite** — qualquer peso novo acima
      da dobra sai do verde. Os dois itens de F7 abaixo são o que sobra de folga.

- [x] ~~Comparar F3 com a baseline de F2~~ — **medido no fim de F3**, mesma receita
      (`dist/` no `npm run preview`, Chrome headless), 5 execuções no mobile com a
      máquina limpa:

      | | Perf | A11y | BP | SEO | LCP | CLS | TBT |
      |---|---|---|---|---|---|---|---|
      | Desktop | **100** | **100** | **100** | 91 | 0,4–0,6 s | 0,053 | 0 ms |
      | Mobile  | **96–97** | **100** | **100** | 91 | 2,3–2,4 s | 0–0,004 | 10–50 ms |

      **Sem regressão.** A seção fica abaixo da dobra e não tocou o LCP; o SEO 91
      continua sendo só o `robots.txt` ausente (F7). Transferido, medido na mesma
      execução: **CSS 7.579 B** (era 7,4 kB em F2 — mesmo número), `client-*.js`
      **56.223 B** (inalterado: é o router de F7), `app-*.js` **92.107 B**.
      ⚠ **Ressalva honesta:** não dá para isolar quantos bytes de `app-*.js` são de
      F3 — F2 nunca foi commitado e não ficou registro do tamanho daquele chunk. O
      que se pode afirmar: **nenhuma dependência nova** entrou em F3 (zero `npm
      install`), e as métricas batem com a tabela de F2. **A partir de F4, anotar o
      tamanho dos chunks aqui no fim de cada fase.**

- [ ] **F7 — preload da Fraunces 600 (é a fonte do elemento de LCP).** O `@fontsource`
      entra por `@import` no CSS, então o navegador só descobre o woff2 depois de
      baixar e parsear a folha. O hash do Vite impede um `<link rel="preload">`
      escrito à mão no `index.html` — precisa de plugin ou de mover a fonte crítica
      para `public/`. Medido: é a maior alavanca isolada sobre o LCP mobile.

- [ ] **F7 — CSS crítico.** A folha única é render-blocking: **7,4 kB gzip, 154 ms**
      medidos no mobile. Avaliar `beasties` (já é o default do `vite-react-ssg`, hoje
      não configurado) para inlinar o crítico da primeira dobra.

## Dívida técnica registrada em F2

- [ ] **Navegação por âncoras no header — reavaliada em F3, adiada para F5.** Com
      Serviços no ar existem três âncoras (`#inicio`, `#servicos`, `#contato`), mas
      duas delas já têm caminho no header: `#inicio` é o wordmark e `#contato` é o
      CTA persistente. O menu teria **um** link novo, e o tratamento mobile dele
      (hambúrguer, foco preso, `aria-expanded`, Esc) é JS acima da dobra com o LCP
      mobile a 0,1 s do limite. Com cases (F4) e prova social (F5) o menu passa a ter
      quatro destinos reais e se paga. Estado ativo do link será por ScrollTrigger,
      **sem estado do React** — o padrão já está em `animations/header.ts`.
- [ ] **Calibrar `detectCapability` em device real.** Os cortes (`deviceMemory <= 4`,
      `hardwareConcurrency <= 4`) são o contrato escrito em F1, não medição. Testar
      com throttle de CPU e num aparelho fraco de verdade antes de F8.
- [ ] **`@fontsource/fraunces` itálico (latin-600-italic) continua sem consumidor** —
      23 kB woff2 no build. F1 carregou o peso "para ênfase"; F2 não usou, porque
      escolher qual palavra da headline vira itálico é decisão editorial sobre copy
      do Davi (§4). **F3 também não usou**, e de propósito: usar itálico só para
      justificar o peso é o argumento ao contrário. Resta F4/F5 ou o corte em F7.
- [ ] **Sem lib de ícones, por decisão.** F2 precisava de dois ícones e eles foram
      escritos à mão em `src/components/icons.tsx` (grade de 16, `stroke-linecap:
      square`, alinhados ao "canto usinado" dos tokens de raio). Se F3+ precisar de
      muitos, reavaliar — mas o default de qualquer pacote de ícones tem ponta
      arredondada e traço 2, que briga com a direção de arte.

## Dívida técnica registrada em F3

- [ ] **Skills obrigatórias continuam ausentes** (§8). F3 repetiu a substituição de
      F1/F2: `frontend-design` + `motion` no lugar de `ui-ux-pro-max` e
      `web-design-guidelines`. Observação nova: a skill `motion` recomenda a regra
      **blanket** de `prefers-reduced-motion` que o `base.css` rejeitou com
      justificativa — a decisão do projeto prevaleceu. Instalar as originais ou
      ajustar o §8.
- [ ] **CTA do header quebra em duas linhas a 320 px** ("FALAR NO / WHATSAPP").
      Encontrado no QA de F3, mas é do header (F2): o rótulo é copy do Davi e não
      pode encolher aqui. Some sozinho se o CTA do header virar ícone + rótulo curto
      quando o menu entrar em F5 — decidir lá, não antes.
- [ ] **Medição de Lighthouse tem variância alta nesta máquina.** As três primeiras
      execuções de F3 saíram com o Chrome do CDP ainda vivo em segundo plano e deram
      LCP 2,9 s / perf 88. Com a máquina limpa, cinco execuções deram 96–97 e LCP
      2,3–2,4 s. **Regra para F4+: medir com nada mais rodando e repetir 3×** — uma
      execução isolada não distingue regressão de ruído.

## Falta validar no navegador (F1 + F2 + F3, precisa de olho humano)

De F1: contraste do painel Color, zoom de 200% no painel Type.

De F3 — o que o headless verificou e o que ele **não** verifica:

- [x] ~~Estado final dos 16 alvos de motion da seção~~ — conferido por CDP depois de
      rolar a página: `opacity: 1`, `clip-path: none`, `transform` identidade. A regra
      de SSR se sustenta (o GSAP devolveu tudo ao estado do HTML pré-renderizado).
- [ ] **60fps na rolagem com os 6 ScrollTriggers novos** (DevTools ▸ Performance, com
      CPU throttle 4×). É o teste que a medição automática não faz.
- [ ] **`prefers-reduced-motion` ligado no SO**, na seção de Serviços: `revealCalm`
      deve revelar as quatro linhas **sem nenhuma ficar invisível**, e sem viagem.
- [ ] **Tab pela seção:** a única parada dentro dela é o CTA final (as linhas do
      índice não são focáveis de propósito — não há para onde ir).

De F2 — o que a medição automática **não** cobre:

- [ ] **60fps na rolagem** (DevTools ▸ Performance, com e sem CPU throttle). O ponto
      de atenção é o par Lenis + ScrollTrigger dividindo o mesmo `rAF`.
- [ ] **`prefers-reduced-motion: reduce` ligado no SO** — a variante calma deve
      revelar tudo **sem nenhum conteúdo invisível**, o Lenis **não** deve subir
      (rolagem nativa), e o caret do wordmark deve parar de piscar.
- [ ] **Foco por teclado:** anel visível sobre o CTA âmbar (o `outline-offset`
      positivo existe justamente por isso) e — o teste que importa — clicar no CTA
      do herói deve mover o foco para `#contato`, não deixá-lo no header.
- [ ] **Herói com JS desligado:** título, subtítulo, CTA e faixa de serviços legíveis
      e clicáveis. Verificado no `dist/index.html`; falta ver no navegador.
- [ ] **Bloom seguindo o ponteiro** só no desktop, e ausente em toque.

## Notas

- `index.html` já tem title/description/OG/Twitter/JSON-LD/theme-color, mas com texto
  placeholder (factual, sem estatística inventada) até a copy oficial chegar —
  marcados com `TODO(PENDENCIAS.md ...)` no próprio arquivo.
- O styleguide (`styleguide.html`, só em dev) mostra quais campos da copy ainda são
  placeholder — é o jeito rápido de ver o que falta do Davi.
- Estrutura técnica e design system prontos — ver `docs/planning/plano-fases.md`.
