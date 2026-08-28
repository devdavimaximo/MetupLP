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
      ⚠ **Novo no refino do herói:** `## Hero` aceita `**Eyebrow:**` e
      `**Destaque:**`, os dois **opcionais** — apagar a linha tira o kicker (ou o
      brilho âmbar) do site sem quebrar o build. `**Destaque:**` guarda o trecho da
      headline que recebe a cor, escrito exatamente como aparece nela; se não bater,
      o título sai inteiro na cor normal. A headline em vigor é do Davi
      ("construa. automatize. cresça."), e o tamanho dela está amarrado ao layout:
      ver o aviso sobre "uma linha" mais abaixo antes de trocá-la.
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

- [x] ~~Medir o herói com a cena WebGPU~~ — **medido em 2026-08-27**, mesma receita
      (`dist/` no `npm run preview`, Chrome headless):

      | | Perf | A11y | BP | SEO | LCP | CLS | TBT |
      |---|---|---|---|---|---|---|---|
      | Desktop | **100** | **100** | **100** | 91 | 0,6 s | 0,03 | 0 ms |
      | Mobile  | **94–95** | **100** | **100** | 91 | 2,5–2,7 s | 0,02–0,03 | 40–80 ms |

      **O elemento de LCP é o `<h1>`** (confirmado pelo audit
      `largest-contentful-paint-element`) — a cena nunca disputa a primeira pintura.
      Chunks: `app-*.js` **93,07 kB gzip** (era 92,1 kB em F3: +~950 B), CSS **7,27 kB
      gzip** (era 7,4 kB — encolheu), e o chunk `HeroScene-*.js` de **418,8 kB gzip**,
      que é 100% lazy e não entra no caminho crítico.

      ⚠ **Duas ressalvas honestas, as duas dependem de re-medição limpa:**
      1. **O mobile caiu de 96–97 para 94–95 e o LCP de 2,3–2,4 s para 2,5–2,7 s.** Não
         consegui isolar se é regressão real ou ruído: a tentativa de medir o HEAD (F3)
         na MESMA máquina, para comparar lado a lado, falhou — o Chrome headless passou
         a devolver `NO_FCP` para qualquer build, inclusive para um que tinha acabado de
         medir 95. É exatamente a variância que a nota de F3 já registrava nesta
         máquina. **Refazer os dois lados com a máquina limpa antes de tratar como
         regressão.** Se for real, os dois itens de F7 acima (preload da Fraunces, CSS
         crítico) são a folga que existe.
      2. `perf 94` fica ABAIXO do ≥95 do §6.2. Está na margem de ruído do número, mas
         não é para ignorar.

- [x] ~~TBT com a cena carregando em `requestIdleCallback`~~ — **regressão medida e
      corrigida no mesmo dia.** A primeira versão de `useHeroScene` baixava a cena em
      `requestIdleCallback`: TBT mobile **~350 ms** (era ~30 ms) e perf **86–88**.
      Analisar/compilar ~1,5 MB de JS custa ~300 ms de thread num celular, e o idle
      callback entregava essa conta durante a leitura da primeira dobra. **Corrigido
      esperando o primeiro gesto** (`pointermove`/`scroll`/`touchstart`/…) depois do
      `load`, com fallback de 6 s: TBT voltou para **40–80 ms**. O raciocínio inteiro
      está no cabeçalho de `src/hooks/useHeroScene.ts` — **não troque aquilo por um
      idle callback sem re-medir.**

- [x] ~~Medir o herói depois da troca de tipografia e do preto novo~~ — **medido em
      2026-08-27**, 9 execuções mobile + desktop, mesma receita:

      | | Perf | A11y | BP | SEO | LCP | CLS | TBT |
      |---|---|---|---|---|---|---|---|
      | Desktop | **100** | **100** | **100** | 91 | 0,6 s | **0,003** | 0 ms |
      | Mobile  | **94** (91–96) | **100** | **100** | 91 | 2,5 s | **0,010–0,012** | 140 ms |

      **CLS melhorou muito** — 0,010 contra 0,024–0,031 do passe anterior e 0,053 lá
      em F2. O elemento de LCP continua sendo o `<h1>`, agora com
      `aria-label="construa. automatize. cresça."` (o SplitText lidou com o `<span>`
      do destaque sem picotar o nome acessível). Payload de fontes DIMINUIU: entrou
      Archivo 800 (14,4 kB), saiu o itálico da Fraunces (18 kB). CSS 7,17 kB gzip
      (era 7,27 — a grade saiu).

      ⚠ **O `94` fica abaixo do ≥95 do §6.2.** Investigado: a cena **não** carrega
      durante a medição (0 requisições de `HeroScene-*.js` no audit de rede — o
      portão de interação funciona). A tarefa longa dominante é a **hidratação do
      React** (`scheduler-*.js`, ~2,4 s), e ela variou de 121 ms a 260 ms entre
      execuções do MESMO build — a variância desta máquina, já registrada em F3.
      Nada neste trabalho tocou hidratação: o `app-*.js` cresceu 170 bytes gzip.
      **Os três itens de F7 acima (router, CSS crítico, preload da fonte) são o que
      existe de folga real** — e agora a fonte crítica é a Archivo 800.

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

## Tempo até a cena aparecer no celular (2026-08-28)

> Relato do Davi: *"no mobile a animação não está pesada, ela acontece tranquilo, porém
> demora bastante para ela aparecer pela primeira vez"*. Ele estava certo, e a causa não
> era a cena — era o portão que decide quando baixá-la (`src/hooks/useHeroScene.ts`).
>
> **Método:** build de produção servido por `vite preview`, Chrome via CDP em 393×852
> com **CPU 4× mais lenta e rede 4G** (e uma passada em 3G), instrumentado com
> `PerformanceObserver` + `MutationObserver` marcando cada etapa (`load`, portão,
> canvas montado, primeiro quadro) e `resource timing` de cada arquivo. O gesto
> sintético é uma SEQUÊNCIA de eventos a cada 300 ms — um dedo real não produz um
> evento só, e medir com um só dava um resultado falso.

- [x] ~~Um gesto anterior ao `load` era jogado fora~~ — **a causa principal.** Os
      listeners de gesto só eram registrados dentro do `afterLoad`, e a hidratação num
      celular termina por volta de **1,9 s**. Quem tocasse a tela antes disso não
      acordava nada e esperava os **6 s** inteiros do `SETTLE_MS` — e tocar/rolar antes
      do `load` é o comportamento comum no celular, não a exceção. Agora "presença" e
      "página carregada" são condições independentes: o gesto é ouvido desde o mount e a
      cena começa no MAIOR dos dois, preservando a garantia de não disputar banda nem
      thread com o carregamento crítico.
- [x] ~~Gesto anterior à própria hidratação~~ — sobra uma janela (~0,7 s a 1,9 s) em que
      nem os listeners existem. Coberta pelo rastro mais barato que existe: se
      `window.scrollY > 0` no mount, alguém já rolou a página. Cobre o gesto mais comum
      do celular; um toque isolado sem rolagem nessa janela ainda se perde (aceito — o
      dedo seguinte resolve).
- [x] ~~O download só começava DEPOIS do portão abrir~~ — 406 kB do chunk da cena mais
      59 kB de textura, ~1,2 s de 4G somados ao tempo de aparecer. Agora saem da frente
      logo após o `load`, por `<link rel="prefetch">` (chunk) e `Image()` (texturas):
      **rede apenas, sem executar nada**. O custo de thread que derrubou o Lighthouse na
      tentativa antiga com `requestIdleCallback` é de análise/compilação — prefetch não
      analisa nem compila. A URL com hash do chunk vem de uma `<meta>` escrita no build
      pelo plugin `metup:hero-scene-prefetch` (`vite.config.ts`); sem ela o hook segue
      sem prefetch, mais lento e nunca quebrado.
- [x] ~~⚠ O teardown abortava o próprio prefetch~~ — achado só na medição, e é o tipo de
      "asseio" que custa caro: quando o gesto chegava DURANTE o prefetch, o portão abria,
      o `useEffect` removia o `<link>` e o Chrome **cancelava o download pela metade** —
      166 ms jogados fora e os 406 kB baixados de novo do zero. O `<link>` agora fica
      onde está, e o `import()` reaproveita a requisição em andamento (**medido:
      `transferSize` 0 no segundo pedido**). Ver a nota no arquivo antes de "limpar"
      isso de novo.

      | cenário (CPU 4×) | portão abria | 1º quadro | agora |
      |---|---|---|---|
      | 4G, com gesto | 8,5 s | **11,1 s** | **4,4 s** (4 execuções: 4,19/4,39/4,48/4,64) |
      | 3G, com gesto | — | — | 7,3 s |
      | 4G, sem gesto nenhum | 8,0 s | 10,2 s | 10,0 s (o `SETTLE_MS` domina) |

      ⚠ Uma quinta execução deu 7,2 s com a máquina ocupada (Lighthouse rodando em
      paralelo) — **medir isto com a máquina limpa**, como o resto. Os números acima
      são de execuções isoladas.

- [ ] **`SETTLE_MS` (6 s) continua sendo o teto de quem NÃO interage — e mexer nele é
      decisão do Davi, não técnica.** Com o prefetch, o que falta depois do timer são
      ~2 s de análise/compilação/primeiro quadro. Baixar o timer para ~3 s tiraria uns
      3 s de quem só olha a dobra sem tocar — mas o valor 6 s foi escolhido justamente
      para o trabalho cair FORA da janela que o Lighthouse observa (a tentativa com
      `requestIdleCallback` mediu TBT 30→350 ms e nota 96→86). **Não baixar sem rodar
      Lighthouse com a máquina limpa, 3×, antes e depois.**
- [ ] ⚠ **A nota de Lighthouse deste dia NÃO vale como aferição** — a variância já
      registrada na dívida de F3 apareceu de novo: 85–87 com FCP 2,4 s / LCP 3,7 s,
      contra os 96–97 / LCP 2,3 s do baseline em máquina limpa. Com o servidor de
      preview, a sessão de trabalho e Chromes do CDP vivos, o número é do AMBIENTE.
      O que dá para afirmar é o **A/B feito nas mesmas condições, alternando
      com/sem a `<meta>` do prefetch**: 86/86 contra 87/86, LCP 3675/3687 ms contra
      3623/3670 ms, TBT dentro do ruído — ou seja, **o prefetch não custa nota**.
      **Falta refazer a medição absoluta com a máquina limpa** antes de dar F7 por
      fechada.
- [ ] **O chunk da cena tem 1,5 MB (406 kB comprimidos)** e é ele quem manda no tempo em
      rede lenta (2,6 s só de download em 3G). Nada disso é gordura nossa: é
      `three/webgpu` + o nó TSL do bloom. Se algum dia isso precisar cair, a única
      alavanca real é abrir mão do pós-processamento — decisão de direção de arte, não
      de performance.
- [ ] **A cortina de entrada da cena são mais 900 ms** (`--transition-duration-slow` em
      `.hero-scene`). Não é espera "morta" — ela começa no primeiro quadro e a forma já
      aparece durante —, mas se o Davi quiser a cena "chegando" mais rápido, esse é o
      último número da fila.

## Redistribuição do herói no mobile (2026-08-28)

> Pedido do Davi: "no mobile está ruim a hero" (desktop e as demais larguras, segundo
> ele, estavam certas). Foram DUAS rodadas no mesmo dia — a primeira consertou os
> defeitos, a segunda (mais abaixo) recompôs a dobra. Tudo MEDIDO no Chrome via
> `puppeteer-core`, em 8 viewports de 320×568 a 768×1024, antes e depois: posições por
> `getBoundingClientRect()`, vãos óticos por `canvas.measureText()` e contraste pelo
> pixel real com a cena renderizando. Nada foi ajustado no olho.
>
> **Escopo:** um único bloco `@media (max-width: 47.9375rem)` no fim de
> `src/styles/hero.css`. De 768px para cima **nada mudou** — reconferido duas vezes:
> em 768×1024 o `<h1>`, o CTA, a faixa e o indicador ficaram no mesmo pixel de antes, e
> a captura de 1440×900 bateu **pixel a pixel** com a de antes das mudanças (0 canais
> diferentes em 15.552.000).

- [x] ~~O subtítulo encostava na headline~~ — o defeito do print do Davi. Com a
      headline em três linhas, a cedilha de "CRESÇA." cai no MEIO da última linha,
      exatamente sobre o subtítulo (que no celular ocupa ~89% da largura da tela). O
      `-mt-4` que vinha do JSX foi calibrado para a headline de UMA linha do desktop,
      onde a cedilha fica na ponta direita e o subtítulo, mais estreito, passa longe.
      Vão ÓTICO (tinta a tinta, não caixa a caixa) medido: **−10px** — sobreposição
      real. Agora **+10,6 a +11,6px** (≈0,53em do subtítulo) de 320 a 700px.
- [x] ~~O CTA caía fora da dobra em 320×568~~ — terminava **29px abaixo** da borda da
      viewport, violação direta do §3 do CLAUDE.md. Hoje sobra 119px.
- [x] ~~O herói transbordava a tela em todo celular~~ — o `padding-top` fixo
      (`--hero-lift` + reserva do indicador) foi medido para um bloco de desktop; no
      celular o bloco é ~2× mais alto (headline em 3 linhas, subtítulo em 2–3, faixa em
      2–3 fileiras) e estourava o `min-h-svh`, deixando ~270px de vazio no topo com
      tudo espremido embaixo. `--hero-lift: 0` no mobile e `padding-top` reduzido ao
      que a região de cima realmente precisa garantir (o header fixo, para o texto não
      entrar por baixo dele); o resto passou a ser distribuído pelo próprio flex — e
      isso se adapta a qualquer altura de tela, ao contrário de uma constante medida.
- [x] ~~Respiros de página larga dentro de uma tela de 5"~~ — `--spacing-section`
      entre subtítulo e CTA media 76–79px no celular (13% da dobra num vão vazio,
      enquanto o subtítulo colidia com o título logo acima). Agora 2rem. A faixa de
      serviços e o indicador também encolheram (`1,75rem`/`1,25rem` e `1,5rem`).
      O `column-gap` de 1,75rem da faixa FICOU: apertá-lo trocava o 2+2 equilibrado dos
      telefones de 390px+ por um 3+1 torto, sem poupar fileira nas telas menores.

### Segunda rodada, no mesmo dia: as três zonas

> O Davi olhou o resultado acima e apontou o que ainda faltava: *"a animação está muito
> boa, deve ganhar mais espaço e presença, talvez levando a headline um pouco mais pra
> cima; o botão do WhatsApp e a parte que diz Sites/Aplicativos/… está muito no meio da
> tela mobile, pode ir mais pra baixo"*. Os três apontam para a mesma estrutura.

- [x] ~~O bloco continuava CENTRALIZADO como no desktop~~ — e essa era a raiz das três
      queixas ao mesmo tempo. Centralizar funciona em tela larga, onde a cena aparece
      nas laterais que sobram; num retrato de 390px não sobra lateral, então o texto
      caía exatamente em cima da forma 3D — escondendo a cena e obrigando o scrim a
      apagá-la. Agora o celular tem composição própria, em três zonas: **enunciado
      ancorado no alto, cena ocupando toda a folga do meio, ação (CTA + faixa +
      indicador) ancorada embaixo, na zona do polegar**. O mecanismo é `display:
      contents` no `.hero-block` + `margin-top: auto` no CTA — uma linha de CSS divide a
      tela em três, sem markup duplicado e colapsando sozinha quando a tela é curta.
- [x] ~~Headline mais para cima~~ — de 226–324px do topo (antes de tudo) para **96px
      fixos** em qualquer telefone. Saíram dois desperdícios: o `--hero-lift` e os 2rem
      de `mt-8` do `<h1>`, que existiam para separá-lo do kicker — kicker que foi
      removido do herói em 2026-08-27 e nunca teve o respiro revisto. O valor **não foi
      apagado**, só zerado no mobile (`.hero-headline`): quando `content/copy.md`
      declarar um `**Eyebrow:**`, ele volta com o respiro certo.
- [x] ~~Faixa livre para a cena~~ — de **~0** (o texto cobria a forma inteira) para
      **263–351px** nos telefones correntes.
- [x] ~~O scrim apagava justamente a cena~~ — a outra metade do "mais presença", e a
      menos óbvia. A elipse do desktop é mais forte no CENTRO (75% de mistura), que era
      onde o texto estava; na composição nova o centro é onde a FORMA está e onde não há
      texto nenhum. No mobile ela virou **duas faixas** ancoradas nas bordas (uma desce
      do topo, outra sobe do rodapé), e no meio as duas já são transparentes. No centro
      da forma a mistura caiu de **75% para ~10%**. Camadas separadas em vez de um
      gradiente só porque, numa tela curta, as paradas ficariam fora de ordem e o CSS
      criaria uma emenda dura no meio da tela — em camadas elas se sobrepõem e compõem
      alfa, que é a degradação certa (mais proteção onde a tela é apertada), sem
      depender de media query de altura (no iOS a MQ mede a viewport GRANDE, não o
      `svh`, então seria não confiável).

      | viewport | folga do CTA até a dobra | herói além do `svh` | faixa livre p/ a cena |
      |---|---|---|---|
      | 320×568 | −30px → **+119px** | +304px → +95px | 0 → 32px |
      | 360×740 | +93px → +215px | +184px → 0 | 0 → 108px |
      | 375×667 | +67px → +215px | +211px → 0 | 0 → 64px |
      | 390×844 | +196px → +192px | +56px → 0 | 0 → **263px** |
      | 393×852 | +202px → +192px | +51px → 0 | 0 → **271px** |
      | 412×915 | +247px → +192px | +7px → 0 | 0 → **334px** |
      | 430×932 | +256px → +192px | 0 → 0 | 0 → **351px** |
      | 768×1024 | +344px (intacto) | 0 → 0 | — (composição do desktop) |

- [x] ~~Contraste conferido COM A CENA RODANDO, não no papel~~ — método novo, e melhor
      que o das rodadas anteriores: o Chrome renderiza a cena de verdade (SwiftShader), o
      script **esconde a tinta mantendo o layout**, fotografa 8 quadros da varredura e
      mede o **pior pixel de fundo dentro do retângulo real da tinta** (via `Range`, não
      a caixa do elemento — a caixa do botão é bem maior que o rótulo). Contraste pela
      mesma fórmula de `src/lib/contrast.ts`. Pior caso em 5 telefones:

      | zona | pior contraste | piso |
      |---|---|---|
      | headline | 5,86–11,23:1 | 3,0 (texto grande) ✓ |
      | subtítulo | 5,70–6,54:1 | 4,5 ✓ |
      | CTA | 8,02–9,89:1 | 4,5 ✓ |
      | faixa de serviços | 6,09–6,12:1 | 4,5 ✓ |
      | indicador | 6,15–6,42:1 | 4,5 ✓ |

- [x] ~~O rótulo do CTA reprovava nas telas curtas~~ — achado por essa medição, não a
      olho: **3,59:1 em 360×740** e **4,03:1 em 320×568**, porque ali a faixa livre
      colapsa e o botão sobe para cima do núcleo aceso da forma (nas telas altas o mesmo
      botão media 9,4–9,9:1). Reforçar a faixa de baixo do scrim resolveria e custaria
      caro no lugar errado — para cobrir o botão nas telas curtas ela teria que subir
      ~150px, apagando a metade de baixo da forma nas telas altas. A correção é local:
      um colchão radial (`.hero-cta-slot::before`) de ~90px em volta do botão, borda
      dissolvida, atrás dele e à frente da cena. Levou os dois casos para **8,35** e
      **8,02:1** sem tocar no resto da dobra. Sobre o fundo estático é invisível
      (`--color-bg` sobre `--color-bg`).
- [ ] ⚠ **VER NUM APARELHO SEM A CENA (tier `lite`).** Quem está em movimento reduzido,
      economia de dados, rede lenta ou aparelho de ≤4 GB não baixa a cena — e nesses
      casos a faixa do meio fica VAZIA (só o halo dourado). Nas capturas isso lê como
      espaço negativo intencional, não como buraco, mas é julgamento de tela e o Davi
      precisa ver. **Não tentar "consertar" trocando a composição quando a cena não
      carrega:** o atributo `data-hero-scene` vira `true` só depois do primeiro gesto,
      então a troca aconteceria com a pessoa lendo — layout shift na primeira dobra,
      exatamente o que o §6.2 proíbe (CLS ≤ 0,1). Se incomodar, a alavanca certa é o
      `.hero-halo` (paint, não layout).
- [ ] ⚠ **Em 320×568 o herói ainda é ~95px mais alto que a dobra** — a faixa de
      serviços e o indicador ficam logo abaixo dela. É prioridade, não descuido:
      headline, subtítulo e CTA cabem com folga e essa é a hierarquia da dobra (§3).
      Fechar os 103px restantes exigiria encolher a headline, que é justamente o que
      impressiona ali. **Se o Davi quiser a dobra inteira mesmo no iPhone SE**, as
      alavancas são, nesta ordem: esconder a faixa de serviços abaixo de ~640px de
      altura (o conteúdo dela se repete na seção Serviços logo abaixo) ou baixar o piso
      de `--text-hero` de 4rem — as duas custam presença.
- [ ] **A headline não cresce entre 375 e 430px de largura** (o piso de `--text-hero`
      é fixo em 4rem até ~746px). Em 320px ela ocupa 89% da largura útil; em 430px,
      só 71%. Cabe um piso um pouco maior nos telefones grandes, mas isso mexe na conta
      de encaixe documentada em `tokens.css` — só com remedição pelo mesmo método
      (`fontkit`), não no olho.
- [ ] **O CTA do header continua quebrando em duas linhas até 375px** — já registrado
      na dívida de F3 acima; é copy do Davi e não pode encolher aqui.

## Três fileiras em qualquer aparelho + corte do scroll morto (2026-08-28)

> Pedido do Davi depois de testar em duas telas e um celular: as três fileiras do deck
> deviam aparecer em qualquer dispositivo, e a seção devia terminar quando o deck
> termina. Tudo abaixo foi MEDIDO no Chrome (puppeteer-core instalado com `--no-save`,
> 9 viewports, varredura de scroll de 40–60px), não estimado.
>
> **Como reproduzir:** `npm run build && npm run preview`, e um script ad-hoc que
> percorre o scroll lendo `getBoundingClientRect()` de cada cartão. O script não ficou
> no repositório de propósito (depende de uma dependência que não é do projeto).

- [x] ~~Três fileiras inteiras em qualquer tela~~ — **feito e conferido nas 9
      viewports.** A causa era o cartão fixo em 480×300: o deck tinha sempre ~1028px de
      altura enquanto a viewport varia de 640 a 1080px. Agora a altura do cartão sai de
      `26svh` (`src/styles/showcase.css`) e o deck fecha em 85% da tela, seja ela qual
      for. Antes: 3 fileiras só em 1920×1080, 2 na maioria, 1 num celular de 640px.
- [x] ~~Cinco cartões por fileira~~ — **passaram a sete, por aritmética.** Encolher o
      cartão para caber 3 fileiras encolhe a FILEIRA junto, e ela precisa continuar mais
      larga que a tela + o curso lateral, senão a ponta entra em quadro. Simulado: com 5
      faltavam 106–385px em 1280×720, 1366×768 e 1920×950; com 6 ainda faltavam ~120px;
      com 7 a pior sobra é +181px. **Conferido depois no navegador: vão lateral de 0px
      com o deck em repouso, em todas as 9 viewports** (o vão de 46–117px que aparecia
      na primeira medição era a entrada inclinada, `rotateZ` 20°, não buraco).
- [x] ~~Scroll morto no fim da seção~~ — **zerado.** Era de 1000 a 2040px (1 a 2 telas
      de nada acontecendo). Agora o deck ainda está saindo de quadro quando a seção
      acaba: 0px em todas as viewports.
- [x] ~~⚠ `h-[200vh]` quebrou o celular, e só a medição pegou~~ — com altura fixa em
      `vh`, o cabeçalho (que no celular é muito mais alto: título + quatro serviços
      empilhados + CTA) mais a queda mais o deck não cabiam na caixa, e o
      `overflow-hidden` cortava a terceira fileira — exatamente o que o pedido queria
      mostrar. Corrigido com altura de CONTEÚDO + piso (`min-h-[150vh]`) e
      `padding-bottom` reservando o repouso do `translateY`. **Não voltar para altura
      fixa em `vh` sem remedir o celular.**
- [x] ~~O ritmo da animação~~ — **preservado, e isso foi conta, não sorte.** Encurtar a
      seção sozinho aceleraria tudo. As posições da timeline foram refeitas para manter
      px de movimento por px de rolagem: a queda ocupava 0,2 × 300vh = 60vh e continua
      em 60vh (0,3 de ~200vh); o arrasto lateral caiu de 1000px para 660px na mesma
      proporção. As molas, os ângulos e a ordem das fileiras não mudaram.
- [x] ~~Cada master estava sendo baixado em DUAS larguras~~ — achado na medição de
      rede: 18 requisições onde deviam existir 9, porque o cartão de leitura e a ponta
      que reaproveita o mesmo arquivo declaravam `sizes` diferentes. Unificado. Bytes
      do deck hoje, medidos com o Chrome:

      | | @1× | @2× | @3× |
      |---|---|---|---|
      | Desktop / notebook | 336 kB | 660 kB | — |
      | Celular | 185 kB | 185 kB | 336 kB |

      No celular o `sizes` declara a largura seca do cartão (sem o zoom das pontas),
      porque lá **nenhuma ponta aparece inteira** — medido. É a única troca de nitidez
      por bytes do arquivo, e ela vale 660 → 336 kB em 3×.
- [x] ~~Pontas como RECORTE AMPLIADO do vizinho~~ — **abandonado depois do teste do
      Davi no desktop.** A ideia era "mesmo arquivo, tile diferente, zero byte a mais"
      (`transform-origin` + zoom 1,5–1,7). Na tela real o recorte lê como **imagem
      cortada**, e como ele repetia um cartão visível ali perto, o olho ligava os dois:
      "as que ficam cortadas são as que repetem". Num deck cujo argumento é capricho de
      execução, tile que parece erro de enquadramento é pior que repetição honesta.
      **Agora todo cartão mostra o screenshot inteiro.** A repetição continua (21
      posições, 9 arquivos) mas passou a ser governada por duas regras, as duas
      conferidas no HTML gerado:
        · **nenhum arquivo aparece duas vezes na mesma fileira** — cada fileira mostra 7
          dos 9, e a duplicata sempre cai noutra fileira, deslocada na horizontal;
        · os três arquivos que aparecem 3× (`sistemas-4`, `-8`, `-9`, todos escuros) só
          repetem em posição que NENHUM desktop mostra inteira (1, 6, 7, 13, 14, 15, 20,
          21 — medido).
      **Bônus medido:** sem o zoom, o `sizes` pede exatamente a largura que o cartão
      ocupa, e o desktop em 2× caiu de **660 kB para 336 kB** (185 kB em 1×). Continuam
      9 requisições, uma por arquivo.
- [ ] ⚠ **FALTAM 9 IMAGENS para acabar com a repetição** (ou 12, se ultrawide entrar no
      alvo — ver item abaixo). São 21 posições; hoje existem 12 arquivos. Com os três
      novos (`sistemas-10/11/12`, entregues em 2026-08-28) a repetição VISÍVEL caiu de
      4 para **1** — só o `sistemas-11`, nos slots 5 e 19, em fileiras diferentes. As
      outras 8 cópias estão todas em `HIDDEN_SLOTS`, que nenhum desktop mostra inteiras.
- [ ] ⚠ **`sistemas-10` não é um projeto novo:** é o MESMO dashboard do `sistemas-7`
      (ClimaTech, "Bom dia, Gabriel", os mesmos 28/16/42/7) noutra variação de tema.
      Está no slot 12 e o `-7` no 17 — fileiras diferentes, mas os dois aparecem juntos
      em notebook largo. **Decisão do Davi:** se ler como enchimento, ele vira cópia e
      entra outro projeto no lugar.
- [ ] ⚠ **Buraco em monitor ultrawide de 3440px** — medido: vão lateral de 238px (200px
      além da goteira). 1920×1080, 2560×1440 e 2560×1080 estão limpos. A correção é 8
      cartões por fileira (24 posições, 24 arquivos). **Pendente:** confirmar com o Davi
      se alguma das telas dele é ultrawide; se não for, isto pode esperar F8.
- [x] ~~Eu havia registrado TRÊS screenshots claros~~ — **errado, são dois.** Luminância
      média medida por arquivo: `sistemas-2` (198) e `sistemas-6` (219) são claros;
      `sistemas-7`, que eu tinha classificado como claro, dá 29 — é escuro, como todos
      os outros. Consequência real: a regra "um claro por fileira" nunca foi cumprida —
      **os dois únicos claros estão em 03 e 04, vizinhos**, e são visíveis em qualquer
      desktop. O Davi já tinha estranhado esse par; a decisão continua sendo dele.
- [ ] **Custo aceito, para ficar registrado:** em 1280×720 o cartão cai para 300×187px
      e em 360×640 para 266×166px. Um dashboard nesse tamanho vira textura — a UI
      dentro dele deixa de ser legível. Foi o preço combinado das três fileiras sempre
      visíveis. Se incomodar quando o Davi vir, o caminho de volta é limitar o
      encolhimento (`26svh` → um piso maior) e aceitar 2,5 fileiras em tela baixa.
- [ ] **Falta ver no navegador:** 60fps com o deck rolando em 21 cartões (CPU throttle
      4×) — o número de cartões subiu 40% e isso não foi medido; e o Lighthouse depois
      da mudança (a seção continua abaixo da dobra, mas o `index.html` foi de 24 para
      35 KiB e o `app-*.js` está em 138,1 kB gzip).

## Troca da seção de Serviços pelo deck em parallax (2026-08-28)

> Pedido do Davi: substituir o índice editorial de F3 pelo componente `HeroParallax`
> (Aceternity UI), "implementar primeiro, ajustar fonte/cor/copy depois". O que ficou
> aberto por causa dessa troca está aqui.

- [x] ~~FALTAM OS 9 SCREENSHOTS DE PROJETO~~ — **entregues em 2026-08-28.** Todos os
      nove chegaram em 16:10 (dois em 2560×1600, sete em 1586×992 — abaixo do pedido,
      mas 1586 cobre o cartão de 480px até em tela 2× com a ampliação das pontas, então
      não foi pedido reexport). Masters em `assets/projetos/`, derivados AVIF/WebP em
      `public/images/projetos/` via `npm run images`.
- [ ] ⚠ **CONFIRMAR COM O DAVI: os nove são trabalho ENTREGUE a cliente, ou peças de
      conceito/demonstração?** Várias das marcas que aparecem nas telas (Luxor, Vitális,
      Altus, GestorPro, ClimaTech, Nobre, Aurum, Arkanum) têm cara de peça autoral, e a
      `sistemas-9` é o site de uma agência com uma barra de "empresas que confiam no
      nosso trabalho" listando cinco marcas.
      **Hoje isso NÃO viola nada** e a seção pode ir ao ar como está: o deck é
      ilustração (`aria-hidden`), os cartões não têm rótulo, não são clicáveis e a seção
      se chama "O que a Metup faz" — nenhuma afirmação de autoria ou de resultado é
      feita em lugar nenhum. **O §4 passa a valer no minuto em que** (a) um `label` com
      nome de cliente entrar, ou (b) a seção for apresentada como "cases" (F4). Só
      preencher `label` em `src/lib/showcase.ts` depois dessa confirmação.
- [ ] **A entrega veio com 6 sites e 3 sistemas** (CRM `sistemas-5`, ERP `sistemas-6`,
      dashboard de OS `sistemas-7`), quando a conversa apontava para dashboards. Não é
      problema — mas foi o que decidiu a ordem: **os três sistemas ficaram em 02, 07 e
      12**, as únicas posições que o celular lê inteiras, porque são o argumento do
      "não construímos só site". Confirmar ou trocar (é uma linha por posição).
- [ ] **Três screenshots têm fundo branco** (`sistemas-2`, `-6`, `-7`) numa página
      quase preta. Foram distribuídos **um por fileira**, nunca dois juntos, mas ainda
      são o ponto mais luminoso da tela. Se incomodar, o ajuste é um véu sutil no
      cartão — decidir vendo, não antes.
- [ ] **Os masters (18,5 MB de PNG) estão versionados em `assets/projetos/`.** É
      conteúdo de produto, mas é peso no repositório; se preferir tirá-los do git,
      basta ignorá-los — o build só depende dos derivados em `public/`.
- [x] ~~Especificação de entrega das imagens~~ — registrada, para o dia em que
      entrarem projetos novos. Especificação
      acertada com ele: **2560×1600 (16:10)**, horizontal, PNG/JPG na qualidade máxima
      (a compressão para AVIF/WebP é do pipeline, não da origem), **anonimizados na
      origem** — nome de cliente, CNPJ e valores borrados ANTES do export. Captura em
      janela de 1280×800 a 2× para as nove saírem consistentes. **Não haverá versão
      vertical/mobile**: dashboard, CRM e ERP são artefatos horizontais, e recortar em
      9:16 mutila a tela em vez de adaptá-la — o celular mostra o mesmo master.
      Preencher `projects` em `src/lib/showcase.ts` (uma entrada por posição) e o nome
      real de cada projeto; nada mais no código muda.
- [ ] **Nome de cada projeto** para o rótulo de hover. É conteúdo de case (§4): sem o
      nome liberado pelo Davi o cartão simplesmente fica sem rótulo — `label: ''`.
- [ ] **Clique nos cartões (mockup em modal) — ADIADO a pedido do Davi.** Primeiro ele
      quer validar só o visual. Quando entrar: os cartões viram `<button>`, o deck
      **deixa de ser `aria-hidden`** (conteúdo focável dentro de subárvore escondida é
      erro de a11y), e aí valem foco preso, Esc e retorno do foco ao cartão. O frame do
      mockup é desenho nosso (canto usinado, filete dourado, rótulo mono) — PNG de
      MacBook de banco de imagem é a "cara de template" que o §7 exclui. ⚠ Só as 9
      posições de leitura viram botão; as 6 pontas continuam decorativas (não se clica
      no que não se vê, e seriam link duplicado do mesmo projeto).
- [x] ~~Quantos projetos, e o que fazer com as posições que ninguém vê inteiras~~ —
      **resolvido por observação do Davi na tela, não por estimativa.** O que se lê de
      fato: desktop 02/03/04, 07/08/09, 12/13/14; celular só 02, 07 e 12 (mais um
      pedaço da 13). Logo: **9 posições de leitura** recebem screenshot próprio e as
      **6 pontas** (01, 05, 06, 10, 11, 15) reaproveitam o master de um vizinho com
      outro `object-position` + zoom — **mesma URL, zero byte a mais**, e um pedaço
      ampliado entrega menos informação de cliente ainda. As três que o celular lê são
      as primeiras de cada trinca do desktop, então **uma ordenação só serve aos dois
      breakpoints**: os três projetos mais fortes vão para 02, 07 e 12. O mapa inteiro,
      com o porquê, está no cabeçalho de `src/lib/showcase.ts`.
- [x] ~~Proporção do cartão~~ — de 5:4 para **16:10**, igual ao master, para o
      screenshot entrar sem corte nenhum. As molas, o curso e a inclinação do parallax
      **não foram tocados** (pedido explícito do Davi: a animação está aprovada).
- [ ] ⚠ **As 15 miniaturas do deck são PLACEHOLDER do design system.** Não existe
      screenshot real de projeto no repositório, e o §5 proíbe stock/IA fingindo case.
      Cada painel é um bloco geométrico gerado em `src/lib/showcase-placeholder.ts`
      (SVG data URI, ~0,5 kB cada) e os quatro serviços se repetem em ciclo pelas
      quinze posições. **Quando os assets reais do Davi chegarem:** trocar a
      `thumbnail` de cada item por `/images/...` (AVIF/WebP, `srcset`, dimensões
      declaradas) e **apagar o módulo inteiro**. Os hexadecimais dele são cópia de
      `tokens.css` — um data URI não enxerga `var(--color-*)` do documento — então
      qualquer repaint da paleta precisa passar por lá enquanto ele existir.
- [ ] ⚠ **CONFLITO COM O §6.4 (animação é GSAP): o deck é framer-motion.** Entrou uma
      dependência nova (`framer-motion`) por pedido explícito do Davi. O gesto —
      `rotateX`/`rotateZ`/`translateY`/`opacity` do deck e o `x` das fileiras, todos
      amarrados ao progresso de rolagem com mola — é **portável para ScrollTrigger sem
      perda visual**; o que a mola do framer faz, um `scrub` numérico faz. Decidir:
      manter as duas libs ou portar e remover a dependência. **Medir o custo no
      orçamento de JS antes de F7** (o cabeçalho da seção continua em GSAP).
- [ ] **Ainda não medido:** o efeito do deck no Lighthouse/CWV. A seção fica abaixo da
      dobra (não deve tocar o LCP), mas ela agora tem **300vh de altura** e roda
      transformações em 15 cartões durante a rolagem inteira. Rodar a receita de
      sempre (máquina limpa, 3–5 execuções) e **anotar o tamanho dos chunks**, como a
      nota de F3 pediu a partir de F4.
- [ ] **Falta ver no navegador:** 60fps com o deck rolando (CPU throttle 4×); o corte
      lateral dos cartões em 320px e em 2560px; `prefers-reduced-motion` ligado no SO
      (esperado: sem transformação, altura colapsa para `h-auto` via CSS e as fileiras
      viram uma grade estática); e se o cabeçalho + CTA continuam confortáveis acima
      do deck em telas curtas (§3 — o CTA não pode depender de atravessar 300vh).
- [x] ~~O índice editorial de F3 (`src/sections/ServiceRow.tsx`)~~ — **removido** junto
      com a troca; o `IndexRule` (filete com cabeça dourada, alvo do preset `drawLine`)
      migrou para dentro de `src/sections/Services.tsx` e continua em uso. Os quatro
      serviços com a frase de cada um **não se perderam**: continuam em texto, agora no
      cabeçalho da seção — é o conteúdo acessível, já que o deck é `aria-hidden`.

## Kicker removido do herói (2026-08-27)

- [x] ~~"Somos a Metup" acima do título~~ — removido a pedido do Davi. Só a linha
      `**Eyebrow:**` saiu de `content/copy.md`; o campo já era opcional no parser
      (`content-parser.ts`) desde que foi criado, então nada de código mudou. O
      componente `Eyebrow` continua existindo — é usado em Serviços — só a
      instância do herói ficou sem conteúdo para mostrar.
- [x] ~~Recalibrar `--hero-lift` depois da remoção~~ — sem o kicker, o bloco de
      texto perdeu a pouca massa que tinha ACIMA do título, e o desvio (ver seção
      abaixo) piorou uniformemente ~10–15px em toda viewport testada. Reajustado
      (intercepto −105px→−92px) e reconferido: voltou para a faixa −7 a −74px,
      quase idêntica à de antes do kicker sair, sem reduzir a margem do CTA no
      iPhone SE (~24px, era ~23px).

## Brilho da cena — o que ficou aberto

- [ ] ⚠ **`SCENE.bodyGain=2,4` foi calibrado matematicamente, não visualmente
      comparado lado a lado com alternativas.** A conta (contraste real, não
      estimado desta vez) diz que o subtítulo (o pior caso, mais largo e mais
      perto da borda que o título) fica em 5,33:1 na borda e 8,9:1+ no centro —
      folgado acima da AA normal (4,5:1). Se o Davi achar que ainda está fraco ou
      que passou do ponto, o número está isolado em `three/hero/config.ts` com a
      conta inteira do lado — reajustar e reconferir com o mesmo método (script
      abaixo), não no olho.
- [ ] **Como reproduzir a verificação de contraste** (para quem for mexer em
      `bodyGain`, no tom do subtítulo, ou no `.hero-scrim`):
      1. Decodificar `SCENE_COLOR.body` de sRGB para linear (`new
         THREE.Color(hex)`), multiplicar pelo `bodyGain`, ré-codificar para sRGB
         (gamma 2.4) — isso dá o pixel que a tela realmente mostra no pico da forma.
      2. Multiplicar esse pixel por `(1 − alfaDoScrim)` no ponto de interesse
         (centro, borda) para simular a camada semi-transparente preta por cima.
      3. Passar o resultado pela `contrastRatio()` de `src/lib/contrast.ts` contra
         `--color-fg` (título/subtítulo, ambos nesta cor agora).
      Feito com `node --experimental-strip-types` + `three` já instalado; não
      precisa de navegador para ESTA parte.
- [ ] **A largura real do subtítulo foi medida com Puppeteer, não estimada** — ele
      chega a 92–95% da viewport em telas ≤768px, mais largo que o título nesses
      tamanhos. Se a copy do subtítulo mudar de tamanho (mais curta ou mais longa),
      remeça essa largura antes de confiar que o `.hero-scrim` ainda cobre.
- [ ] ⚠ **Um comentário de código estava factualmente errado** ("~5:1 no pico",
      quando a conta de verdade dava ~2,6:1) e ficou sem ser percebido desde F2 —
      foi corrigido agora que alguém finalmente recalculou. Não é motivo para
      desconfiar de TODOS os números documentados no projeto, mas é um lembrete:
      onde um comentário afirma um contraste, vale reconferir com
      `src/lib/contrast.ts` antes de tratar como verdade, em vez de só copiar para
      a próxima decisão.

## Centramento real do título — o que ficou aberto

- [ ] ⚠ **`--hero-lift` NÃO ZERA O DESVIO — é uma escolha deliberada, e vale
      reconfirmar com o Davi.** Depois de medir com Puppeteer (`getBoundingClientRect`
      do `<h1>`, 11 viewports de 320×568 a 1920×1080), o desvio do título caiu de
      **−108/−139px para −5/−73px**, mas não chegou a zero em nenhuma largura de
      desktop (fica entre −49 e −83px lá). Zerar por completo pediria ~250px fixos de
      deslocamento, e isso derruba o CTA para fora da dobra num iPhone SE de 1ª
      geração (320×568) — o único motivo de ter parado onde parou. **Se o Davi
      preferir centralização perfeita e aceitar um vão vazio maior acima do kicker
      (ou aceitar que o CTA precise de um scroll mínimo em telas muito curtas), o
      valor em `--hero-lift` (`styles/hero.css`) pode subir — a tabela de segurança
      (margem de CTA por viewport) que limitou a escolha está registrada abaixo.**
- [ ] **A tabela de medição completa (para quem for reajustar `--hero-lift`):**

      | viewport | desvio do título | margem do CTA até a dobra |
      |---|---|---|
      | 1920×1080 | −49px | 362px |
      | 1440×900  | −73px | 304px |
      | 1366×768  | −54px | 223px |
      | 1280×800  | −65px | 254px |
      | 1024×768  | −68px | 252px |
      | 900×700   | −56px | 213px |
      | 768×1024  | −33px | 357px |
      | 414×896   | −64px | 272px |
      | 375×812   | −63px | 229px |
      | 320×690   | −35px | 113px |
      | 320×568   | −5px  | **23px** ← o limite que travou o ajuste |

      ⚠ **A coluna da direita vale só de 768px para cima desde 2026-08-28.** Abaixo
      disso `--hero-lift` é 0 e a margem do CTA é outra (ver "Redistribuição do herói
      no mobile", acima): em 320×568 ela passou de 23px para 111px. Quem for reajustar
      o lift agora só decide o desktop — o celular não depende mais dele.

      Método: `node` + `puppeteer-core` (instalado com `--no-save`, não ficou no
      projeto), `page.setViewport` + `getBoundingClientRect()` no `#hero-titulo` e no
      link do CTA dentro de `#inicio`. Reproduzível por qualquer um com Chrome
      instalado; não depende de ferramenta específica desta sessão.
- [ ] **Tentativa registrada e descartada: duas caixas `flex-1` ladeando o `<h1>`.**
      Parecia a solução "de livro" para centralizar um elemento com conteúdo
      assimétrico ao redor, mas MEDIDA piorou o resultado (desvio subiu para
      −151/−183px). Causa: o conteúdo abaixo do título (subtítulo+CTA) é maior que a
      metade do espaço livre em QUALQUER viewport real testada, então o flexbox
      trava essa caixa no próprio conteúdo mínimo e empurra toda folga para a caixa
      de cima — o oposto de dividir igual. Não tentar de novo sem antes confirmar que
      o conteúdo abaixo do título encolheu o bastante para caber em metade do espaço
      livre típico (não encolheu nesta rodada).
- [ ] **`.hero-halo` já foi fechado três vezes** (50%×46% a 30%/10% → 38%×34% a
      20%/6% → 32%×28% a 14%/4%). Se ainda parecer "não preto o bastante", o próximo
      ajuste é a mesma alavanca — a porcentagem do `color-mix` — não o token de cor
      (`--color-bg` já é `#000000`, piso absoluto).

## Tipografia e fundo do herói — o que ficou aberto

- [ ] ⚠ **DUAS FAMÍLIAS DE DISPLAY CONVIVEM, e isso é uma decisão em aberto.** A
      headline do herói é Archivo ExtraBold em caixa alta (`--font-hero`); os `<h2>`
      das seções continuam em Fraunces (`--font-display`). É deliberado — o pedido
      era refinar o HERÓI, e trocar a serifa da página inteira muda a identidade que
      F0 aprovou. Mas as duas direções precisam ser conciliadas antes de F8: ou a
      Archivo assume tudo (`--font-display: var(--font-hero)`, uma linha, e aí a
      Fraunces sai do build inteira), ou fica documentado que a primeira dobra tem
      voz própria de propósito. **Decisão do Davi, e é visual: precisa ver as duas
      seções juntas na tela.**
- [ ] **A promessa de "uma linha" é da COPY ATUAL.** `--text-hero` foi dimensionada
      medindo "CONSTRUA. AUTOMATIZE. CRESÇA." (18,63em em Archivo 800). Uma headline
      mais longa quebra em duas linhas no desktop — não é bug, é geometria. A fórmula
      para redimensionar está no comentário do token; para remedir um texto novo,
      `npm i -D fontkit` e `font.layout(texto).advanceWidth / font.unitsPerEm`.
- [ ] **`sharp` continua como devDependency órfã** (era da conversão das texturas).
      Mesmo destino de antes: virar o pipeline de imagem do §9 em F4 ou sair em F7.
- [ ] **F7 — o preload da fonte crítica agora é da ARCHIVO 800**, não mais da
      Fraunces. O item continua sendo a maior alavanca isolada sobre o LCP mobile
      (2,5 s), e o arquivo é menor que o anterior (14,4 kB contra 18 kB).

- [ ] ⚠ **A MEDIÇÃO DE PERFORMANCE NESTA MÁQUINA NÃO É MAIS CONFIÁVEL — refazer
      limpa.** Quatro execuções do MESMO build deram perf **87, 91, 91 e 95** (TBT de
      70 ms a 320 ms). Diagnosticado nos artefatos: a cena WebGPU **não carrega em
      nenhuma** delas (0 requisições de `HeroScene-*.js`), e o que varia é a tarefa
      longa da **hidratação do React** (`scheduler-*.js`), de 109 ms a 287 ms — 2,6×
      de diferença sem nenhuma mudança de código. O `app-*.js` cresceu 170 bytes gzip
      nos três passes do herói somados.

      **Antes de tratar qualquer número mobile como regressão**, refaça com a máquina
      sem nada rodando (nem servidor de preview antigo, nem Chrome sobrando) e com 5
      execuções. Só o desktop está estável: **100/100/100**, LCP 0,6 s, TBT 0 ms.

### Falta ver no navegador (terceiro passe — centramento e preto)

- [x] ~~O texto está no centro vertical da tela?~~ — **medido com Puppeteer, não só
      calculado** (a conta do "0px de desvio" abaixo estava ERRADA: ela centralizava
      o bloco inteiro, não o título — ver a seção nova "Centramento real do título"
      acima, com a tabela de verdade e o porquê de não ter zerado).
- [x] ~~O indicador de rolagem cabe na dobra?~~ — confirmado por medição: o CTA (que
      é o que realmente importa pelo §3) fica acima da dobra nas 11 viewports
      testadas, incluindo um iPhone SE de 1ª geração.
- [x] ~~O preto ficou preto?~~ — verificado por screenshot real (Puppeteer, 1600×900):
      sem a lavagem marrom que a captura do Davi mostrava. `--color-bg` chegou ao piso
      absoluto (`#000000`) nesta mesma rodada; se ainda incomodar, o knob que resta é
      a porcentagem do `.hero-halo` (já fechado três vezes, ver acima).

### Falta ver no navegador (segundo passe do herói)

- [ ] **A headline cabe mesmo em uma linha?** A conta diz que sim de 757px a 3440px,
      com folga de 8% a 26% — mas é conta sobre métricas da fonte, não pixel medido.
      Conferir em 1366, 1440 e 1920. Se estourar, o knob é a inclinação `3.7vw`.
- [ ] **A palavra em destaque.** "AUTOMATIZE." em âmbar no meio do título. Já se
      sabe que o SplitText lidou bem com o `<span>` aninhado — o `aria-label` saiu
      `"construa. automatize. cresça."`, frase inteira, medido no Lighthouse —, mas
      **falta ver se a animação de entrada continua idêntica** palavra a palavra.
- [ ] **Contraste do âmbar sobre a cena.** `--color-accent` dá 8,61:1 sobre o fundo
      sólido, mas a palavra destacada cai justamente em cima do objeto 3D. É o mesmo
      teste do texto branco, com uma cor a menos de margem.
- [ ] **O preto novo no resto da página.** `--color-bg` mudou global: conferir
      Serviços e o header rolado (`bg-bg/90`) contra as superfícies, que NÃO mudaram
      — a diferença entre fundo e `--color-surface` aumentou de propósito.
- [ ] **Caixa alta com zoom de 200%** (WCAG 1.4.4): o `clamp` tem intercepto em
      `rem`, então deve crescer — conferir que a headline não vaza da tela.

## Dívida técnica registrada no refino do herói (cena WebGPU)

- [ ] ⚠ **PROCEDÊNCIA DOS ASSETS DA CENA — resolver antes de publicar.**
      `public/images/hero/scene-color.webp` e `scene-depth.webp` foram baixados de
      `i.postimg.cc` (`img-4.png` / `raw-4.webp`), que vieram no componente de
      referência que o Davi mandou. **A licença é desconhecida.** Não é violação do
      §5 — são formas abstratas decorativas, não representam trabalho de cliente
      nenhum e não passam por case —, mas é risco jurídico usar arte de terceiro sem
      saber a licença no site da própria agência. Duas saídas: o Davi confirma a
      origem/licença, ou a dupla é substituída por arte própria (qualquer par
      cor + mapa de profundidade serve — só trocar `TEXTURE` em
      `src/three/hero/config.ts`; nada mais no código conhece esses arquivos).
      O PNG original (233 kB) foi convertido para WebP (48,7 kB, `sharp`, q86) e
      descartado.
- [ ] **`sharp` entrou como devDependency** só para essa conversão. Se ninguém mais
      usar até F7, é candidato a corte — ou a virar o pipeline de imagem do §9 de
      verdade, com um script `npm run images` para os screenshots de case (F4).
- [ ] **O chunk da cena carrega DOIS builds do three** (`three` via
      `@react-three/fiber` + `three/webgpu` via a cena): 1.540 kB min / 418,8 kB gzip,
      com o núcleo duplicado dentro. **Tentei o alias `three` → `three/webgpu` e NÃO
      funciona:** o `@react-three/drei` importa `WebGLCubeRenderTarget`, `ShaderChunk`
      e `WebGLRenderer`, que o build WebGPU não exporta — 55 erros de link. (O
      `@react-three/fiber` sozinho não referencia nenhum deles; o problema é só o
      drei.) Para ligar o alias em F7 seria preciso largar o drei — hoje a cena usa
      dele apenas `useTexture` e `useAspect`, que são ~30 linhas. **Só vale se a
      vitrine de F4 também não precisar do drei.** Enquanto isso o custo é aceitável:
      o chunk é 100% lazy e só desce depois do primeiro gesto.
- [ ] **Sem WebGPU o `WebGPURenderer` cai para WebGL2 sozinho** — o mesmo grafo TSL
      compila para GLSL. **Não testado num navegador sem WebGPU** (Safari/Firefox
      antigo). Se falhar, o `SceneBoundary` já devolve o herói estático, mas o certo é
      confirmar que o caminho WebGL2 renderiza igual.

## Falta validar no navegador — o refino do herói (NADA foi visto)

> ⚠ **A sessão que construiu a cena não tinha ferramenta de navegador.** Build,
> typecheck, lint, Lighthouse e o HTML pré-renderizado foram verificados por
> ferramenta; **a aparência da cena não foi vista por ninguém.** Tudo abaixo é
> primeira validação, não revisão.

- [ ] **A cena aparece?** Abrir a home, mover o mouse (ela só baixa no primeiro
      gesto — é de propósito, ver `useHeroScene`) e esperar. Esperado: a forma 3D
      surge em fade sobre o fundo estático, com pontos âmbar acendendo em fatias que
      sobem e descem, e uma faixa turquesa varrendo a tela em sincronia com elas.
- [ ] **CONTRASTE DO TEXTO SOBRE A CENA — o item mais importante.** O cálculo diz
      ~5:1 no pico da forma antes do `.hero-scrim`, e ~12:1 depois dele. **É conta, não
      medição.** Conferir com o color picker do DevTools no pior quadro (varredura no
      meio da forma, atrás do `<h1>` e do subtítulo). Se reprovar: baixar
      `SCENE.bodyGain` em `src/three/hero/config.ts` ou fortalecer o `.hero-scrim` em
      `src/styles/hero.css` — as duas alavancas estão documentadas nos dois arquivos.
- [ ] **Calibrar a cena.** `tiling`, `scanBand`, `sparkGain`, `scale` e `parallax`
      foram escolhidos por raciocínio, não olhando. Todos estão em `config.ts`.
- [ ] **60fps com a cena rodando**, junto de Lenis + ScrollTrigger no mesmo `rAF`
      (DevTools ▸ Performance, com e sem throttle de CPU).
- [ ] **A cena para de renderizar ao sair da dobra** (`frameloop="never"` via
      IntersectionObserver). Conferir no Performance que o rAF silencia ao rolar.
- [ ] **`prefers-reduced-motion` ligado no SO:** a cena **não pode nem baixar** (olhar
      a aba Network — nenhum `HeroScene-*.js`), e o herói estático deve estar completo.
- [ ] **Toque:** sem parallax de ponteiro (o listener está atrás de `(hover: hover)`),
      e a cena baixando no primeiro `touchstart`/`scroll`.
- [ ] **Entrada do título palavra a palavra** (SplitText `words,lines` + máscara), e
      o CTA âmbar aparecendo cedo, sem esperar o título terminar.
- [ ] **Herói com JS desligado:** kicker, título, subtítulo, CTA, faixa de serviços e
      o link "Role para explorar" legíveis e clicáveis, sobre o fundo em CSS.
- [ ] **Composição centralizada em 320 px e em 2560 px** — o bloco tem `max-w-hero`
      (54rem) e a headline oficial foi escolhida para cair em duas linhas no desktop.

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
- [x] ~~**Bloom seguindo o ponteiro** só no desktop, e ausente em toque.~~ —
      **obsoleto:** o bloom que perseguia o ponteiro saiu no refino do herói. Quem
      reage ao ponteiro agora é a cena (parallax por profundidade), e o teste
      equivalente está na lista nova acima.

## Notas

- `index.html` já tem title/description/OG/Twitter/JSON-LD/theme-color, mas com texto
  placeholder (factual, sem estatística inventada) até a copy oficial chegar —
  marcados com `TODO(PENDENCIAS.md ...)` no próprio arquivo.
- O styleguide (`styleguide.html`, só em dev) mostra quais campos da copy ainda são
  placeholder — é o jeito rápido de ver o que falta do Davi.
- Estrutura técnica e design system prontos — ver `docs/planning/plano-fases.md`.
