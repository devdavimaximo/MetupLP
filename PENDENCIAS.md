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
