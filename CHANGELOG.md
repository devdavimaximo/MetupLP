# Changelog — Metup

Registro das mudanças relevantes da landing page. As fases estão descritas em
`docs/planning/plano-fases.md`.

## Cena bem mais visível — o brilho do objeto estava errado desde o início (2026-08-27, terceira rodada)

A pedido do Davi ("a animação parece com opacidade, quero ela bem visível").
**A animação (timeline GSAP) continua intacta** — o que mudou foi o brilho da
CENA 3D (`three/hero/`).

### O erro que isso revelou

`SCENE.bodyGain = 0.9` (o multiplicador que apaga o corpo do objeto para o texto
ficar legível por cima) vinha com um comentário afirmando "~5:1 de contraste no
pico". **Recalculando com a própria `src/lib/contrast.ts`** (conversão sRGB↔linear
real, não estimativa), o valor verdadeiro era **~2,6:1** — abaixo até do piso de
texto grande. Quem protegia o texto na prática, sozinho, era só o `.hero-scrim`.
O comentário antigo nunca foi medido — foi um palpite que ficou documentado como
fato. Fica registrado como lição: números em comentário exigem a mesma prova que
qualquer outra alegação deste projeto.

### Corrigido

- **`SCENE.bodyGain`: `0,9` → `2,4`** (`three/hero/config.ts`) — o objeto agora é
  visivelmente mais brilhante e a textura ondulada fica nítida mesmo fora da área
  de texto (que é a maior parte da forma). Confirmado por screenshot real
  (Puppeteer, com a cena de fato carregada — ver nota abaixo).
- **Descoberta ao medir a largura real do texto (Puppeteer):** o SUBTÍTULO, não o
  título, é quem chega mais perto da borda da tela — até ~92–95% da largura da
  viewport em telas de 768px para baixo, mais largo que o próprio `<h1>` nesses
  tamanhos. E ele usava `--color-fg-muted` (mais escuro que o título). Nessa borda,
  com a forma mais brilhante, isso caía a ~2,5:1 — reprovaria até o piso de texto
  grande. Duas correções:
  - **Subtítulo do herói passou a usar `tone="fg"`** (`Hero.tsx`), igual ao título —
    exceção pontual e documentada, não mudança na convenção do resto do site.
  - **`.hero-scrim` redesenhado** (`styles/hero.css`): raio maior (100%, antes 64%)
    e stops ajustados para manter ~58% de mistura até a borda VERDADEIRA do
    container, não perto dela. Contraste medido na borda: **5,33:1**; no centro:
    **8,9:1+**. Ambos acima da AA normal (4,5:1).
- **Lição de processo:** a primeira tentativa de validar visualmente esta mudança
  deu dois screenshots "idênticos" — porque o script de captura não disparava
  nenhuma interação, e a cena só baixa depois de um gesto real (`useHeroScene`,
  ver o trabalho de F4). Os dois screenshots mostravam só o CSS estático, nunca a
  cena. Corrigido simulando um `mousemove` e esperando `data-ready="true"` antes de
  capturar — só assim a comparação virou real.

### Medição

Desktop segue **100/100/100**, LCP 0,6s, CLS 0,003 — mudança de cor/shader não
mexe em peso de bundle nem em layout. Contraste verificado por cálculo (não pelo
Lighthouse, que não lê o canvas dinamicamente) usando a fórmula WCAG da própria
`src/lib/contrast.ts`.

## Centro real do título e preto absoluto (2026-08-27, segunda rodada)

Correção do passe anterior, a pedido do Davi ("ainda não está centralizado", "quero
o preto mais escuro"). **A animação continua intacta.**

### O que a medição anterior tinha errado

O passe de centramento anterior (abaixo, "Centramento vertical e preto final")
centralizava o BLOCO de texto inteiro (kicker+título+subtítulo+CTA+serviços), não o
TÍTULO. Como o conteúdo depois do título pesa muito mais que o kicker antes dele, o
título ficava sistematicamente ~108–139px ACIMA do centro real da tela — medido com
Puppeteer (`getBoundingClientRect`), não estimado.

Uma primeira tentativa de correção (duas caixas `flex-1` — uma acima, uma abaixo do
`<h1>` — esperando que o flexbox as igualasse) foi testada e **piorou o resultado**
(desvio subiu para ~150–183px): o conteúdo abaixo do título é maior que a metade do
espaço livre de QUALQUER viewport real testada, então o flexbox trava essa caixa no
próprio tamanho mínimo e empurra toda a folga para cima, na direção errada. Descartada
depois de medida — não pela teoria, pela leitura do navegador.

### Corrigido

- **`--hero-lift`** (`styles/hero.css`): mantém o mecanismo de bloco balanceado (que
  já centralizava o BLOCO corretamente), e desloca esse bloco para baixo por uma
  quantidade que compensa a diferença medida entre "quanto o título fica acima do
  centro do bloco" e "zero". É `clamp(0px, 26svh - 105px, 210px)` — escala com a
  altura da viewport de propósito: numa viewport curta (celular pequeno) o deslocamento
  precisa ser pequeno para o CTA não cair fora da dobra; numa alta (desktop) pode ser
  maior. Testado em 11 tamanhos de tela (320×568 a 1920×1080).

  ⚠ Não é fórmula que se reajusta sozinha ao conteúdo — é uma constante MEDIDA para a
  copy atual. A tabela completa antes/depois e o método estão em `PENDENCIAS.md`.

### Medido (Puppeteer, 11 viewports, `getBoundingClientRect` do `<h1>`)

| | antes (bloco centralizado) | tentativa flex-1 (descartada) | depois (`--hero-lift`) |
|---|---|---|---|
| Desvio do título | −108 a −139px | −151 a −183px (pior) | **−5 a −73px** |
| CTA acima da dobra | sim, em todas | sim, em todas | **sim, em todas as 11** |

Nenhuma largura ficou com o CTA abaixo da dobra, inclusive num iPhone SE de 1ª
geração (320×568, a tela mais curta testada) — essa é a restrição que impediu zerar
o desvio por completo (zerar pediria ~250px fixos, que estourariam o CTA em telas
curtas). Verificado visualmente com screenshot real (Puppeteer) em 1600×900: a
composição lê como equilibrada, sem o "colado no topo" da captura que o Davi enviou.

- **`--color-bg`: `#020302` → `#000000`.** Não sobra margem — é preto absoluto.
  `--color-surface-sunken` (que nunca teve consumidor visual real, confirmado por
  grep) se fundiu no mesmo valor. Contrastes recalculados de novo (`--color-fg`
  agora 18,41:1).
- **`.hero-halo` fechado e enfraquecido pela TERCEIRA vez** (era 38%×34% a 20%/6%,
  agora 32%×28% a 14%/4%). Esse é o ajuste que realmente muda a PERCEPÇÃO de preto —
  o token já estava no piso; quem lavava a dobra de marrom era o halo somando âmbar
  em `screen`. Documentado por que cada rodada de ajuste mira o halo, não o token, em
  `styles/hero.css`.

### Medição de performance

Desktop **100/100/100**, LCP 0,6s, **CLS caiu para 0,001** (era 0,003). Mobile
manteve a mesma variância desta máquina já documentada (94–96, TBT 30–140ms entre
execuções do mesmo build) — sem regressão atribuível a este trabalho.

## Centramento vertical e preto final do herói (2026-08-27)

Terceiro passe, a pedido do Davi. **A animação segue intacta** — `src/animations/hero.ts`
não foi tocado em nenhum dos três passes.

### Corrigido

- **O texto do herói não estava centralizado verticalmente — subia 66px.** Não era
  impressão: o layout era `flex-col` com `my-auto`, e margem automática centraliza no
  espaço que SOBRA. O que sobrava era assimétrico — 4,5rem de `pt-header` em cima
  contra 12,75rem embaixo (`mt-block` + indicador de rolagem + `pb-block`). A conta
  dava exatamente 66px de desvio para cima.

  A correção não mexe no `my-auto`: mexe no que ele mede. A classe `.hero-frame`
  iguala as duas regiões fixas (`padding-top = folga + indicador + block`), e o
  centro passa a ser exato **em toda viewport**, verificado de 375px a 2560px, sem
  media query e sem número mágico no JSX.

  Não virou `position: absolute` de propósito: numa janela de ~760px o texto e o
  indicador ocupam a altura toda e passariam um por cima do outro. Em fluxo, as
  sobras vão a zero e nada se sobrepõe.

### Alterado

- **`--color-bg`: `#050605` → `#020302`**, o piso possível (o `--color-surface-sunken`
  já está em `#000`). Contrastes recalculados de novo com `src/lib/contrast.ts` —
  todos subiram (`--color-fg` agora 18,11:1). Espelhado na cena e no `theme-color`.
- **O `.hero-halo` fechou e enfraqueceu** (50%×46% a 30% → 38%×34% a 20%). Este é o
  ajuste que realmente faz o preto ler como preto: o token já estava quase no #000, e
  quem lavava a metade superior de marrom era o halo somando âmbar em `screen`. Agora
  ele é uma auréola em volta do objeto, não um banho na dobra inteira.
- **O indicador de rolagem encolheu** (filete de 3rem → 2rem, folga de um bloco →
  2,5rem). Equilibrar as regiões dobra o peso dele (passa a contar dos dois lados), e
  no tamanho antigo a dobra somava ~813px e não cabia numa janela de 760px — o
  indicador caía abaixo da linha d'água. Enxuto, a dobra fecha em 639–765px conforme
  a largura, e o CTA termina entre 399px e 506px do topo, sempre bem acima da dobra.

### Medição

Desktop **100/100/100** (LCP 0,6 s, CLS 0,003, TBT 0 ms). Mobile oscilou entre **87 e
95** em quatro execuções do MESMO build — diagnosticado: a cena não carrega em
nenhuma delas (0 requisições no audit de rede), e a tarefa longa da hidratação do
React variou de 109 ms a 287 ms só por estado da máquina. É a variância já registrada
em F3, não regressão. Ver a ressalva completa em `PENDENCIAS.md`.

## Tipografia e fundo da primeira dobra (2026-08-27)

Segundo passe no herói, a pedido do Davi. **A animação não foi tocada** —
`src/animations/hero.ts` está intacto.

### Adicionado

- **`--font-hero`: Archivo ExtraBold (800)**, a voz da primeira dobra, em caixa alta.
  Não substituiu `--font-display`: a Fraunces continua nos `<h2>` das seções, e
  unificar as duas é decisão maior que "refinar o herói" (uma linha, se for o caso).
- **`font` como prop do `Heading`** (`'display' | 'hero'`). É prop e não classe
  porque duas utilitárias de família colidem na mesma camada do Tailwind — quem
  vence é a ordem no CSS gerado, não a ordem escrita no JSX.
- **`**Destaque:**` em `## Hero`** (opcional) — o trecho da headline que recebe o
  âmbar. Fica no `copy.md` porque "qual palavra brilha" é decisão editorial, e assim
  `headline.value` continua sendo string limpa para o `aria-label` e para o índice.
- `accentSegments()` em `src/lib/format.ts` — recorta a headline em volta do
  destaque. Degrada para o texto inteiro se o trecho não existir; nunca quebra.

### Alterado

- **Headline e subtítulo em UMA LINHA no desktop, por medição.** O avanço da
  headline em Archivo 800 foi medido com `fontkit` (18,63em; 17,90em com o
  `letter-spacing`) e virou a inclinação em `vw` de `--text-hero`. Verificado largura
  a largura: uma linha de **757px a 3440px**, ocupando 74–92% da largura útil. E a
  maior palavra ("AUTOMATIZE.") nunca passa de **89,7%** da largura útil em nenhuma
  viewport de 320 a 3440px — não existe caminho para rolagem horizontal.
- **A `<Section>` do herói virou `width="full"`.** Uma largura máxima em `rem`
  quebraria a linha exatamente onde o `vw` prometeu que ela caberia. `--container-hero`
  agora só limita a faixa de serviços (o filete precisa de fim).
- **`--color-bg`: `#0c0e0d` → `#050605`**, com `--color-surface-sunken` e
  `--color-on-accent` acompanhando. Global de propósito: um herói mais escuro que o
  resto deixaria um degrau na emenda com Serviços. **Todas as razões de contraste
  SUBIRAM** (ex.: `--color-fg` de 16,98:1 para 17,79:1), recalculadas com a própria
  `src/lib/contrast.ts` e reescritas nos comentários de `tokens.css`. Espelhado em
  `three/hero/config.ts` e no `theme-color` do `index.html`.
- **Fontes:** entrou `archivo/latin-800` (14,4 kB) e saiu `fraunces/latin-600-italic`
  (18 kB) — que estava no build desde F0 sem consumidor e o `PENDENCIAS.md` já
  listava para corte. O payload de fontes DIMINUIU, e a fonte crítica do LCP agora é
  a Archivo.
- `.hero-halo` ficou só com o bloom âmbar, mais forte e centrado.

### Removido

- **A malha de grafite do herói (`.hero-field`).** Sobre o preto novo, ela competia
  com a malha de PONTOS da própria cena — duas retículas na mesma dobra. Quem carrega
  o registro de instrumento agora é a cena.
- **A contraluz turquesa do `.hero-halo`.** Era de quando o fundo era claro; com o
  preto novo passou a brigar com a varredura turquesa animada da cena. O `accent-2`
  continua na dobra — carregado pelo movimento, não pelo cenário.
- `fontkit`, usado só para medir os avanços. A fórmula para refazer a conta está no
  comentário de `--text-hero`.

### Medição

Mobile **94** / desktop **100** (a11y, BP: 100 nos dois). **CLS caiu para 0,010–0,012**
(era 0,024–0,031). LCP 2,5 s mobile, 0,6 s desktop, e o elemento de LCP continua sendo
o `<h1>`. Confirmado que a cena **não** carrega durante a medição. Ressalva em
`PENDENCIAS.md`: o `94` fica abaixo do ≥95 do §6.2, e a tarefa longa dominante é a
hidratação do React — que este trabalho não tocou.

## Refino da primeira dobra — cena WebGPU no herói (2026-08-27)

Reescrita completa do herói a pedido do Davi, a partir de um componente de
referência: composição centralizada sobre uma cena 3D em tempo real.

### Adicionado

- **Cena WebGPU do herói** em `src/three/hero/`: um mapa de profundidade governa o
  parallax do ponteiro e uma varredura que acende, fatia por fatia, os pontos que
  estão naquela profundidade — o objeto aparece por dentro, como num instrumento.
  Grafo escrito em **TSL** (`depth-scan-material.ts`), então o mesmo shader compila
  para WGSL e para GLSL: o `WebGPURenderer` cai para WebGL2 sozinho onde não há
  WebGPU. Bloom e a varredura em espaço de tela ficam em `ScanPipeline.tsx`.
- **`src/hooks/useHeroScene.ts`** — o portão da cena. Não baixa nada em aparelho
  fraco, rede ruim, economia de dados, movimento reduzido ou sem GPU; e mesmo quando
  pode, só baixa **depois do primeiro gesto** da pessoa (ver *Alterado*).
- **`src/three/SceneBoundary.tsx`** — fronteira de erro para cena 3D. Um erro na
  primeira dobra desmontaria a árvore inteira e levaria o CTA junto; com ela, o pior
  caso é o herói estático.
- **Assets** `public/images/hero/scene-{color,depth}.webp` (233 kB PNG → 48,7 kB
  WebP). ⚠ Procedência a confirmar — ver `PENDENCIAS.md`.
- `**Eyebrow:**` opcional em `## Hero` (`content/copy.md`) e a variante
  `align="center"` do componente `Eyebrow`, com filete dos dois lados.
- Token `--container-hero` (54rem) — a medida do bloco de texto centralizado.
- `sharp` como devDependency (conversão das texturas).

### Alterado

- **Herói centralizado** (`src/sections/Hero.tsx`): kicker, título, subtítulo, CTA
  âmbar, faixa de serviços e um "Role para explorar" que é link real para
  `#servicos`. O CTA continua entrando em ~0,4 s, antes de o título terminar (§3).
- **Copy do herói reescrita** (proposta do Claude, autorizada pelo Davi), mais curta
  para a composição centralizada e mantendo os termos de busca. Segue em regime MOCK.
- **Motion do título**: `SplitText` passou de `lines` para `words,lines` com máscara
  de linha — a cadência palavra a palavra da referência, mas em `gsap.from()`, então
  o `<h1>` continua visível no HTML pré-renderizado. A versão da referência nascia
  em `opacity: 0` via `setState`, o que apagaria o título do Google.
- **`useHeroScene` espera interação, não `requestIdleCallback`.** Medido: com idle
  callback o TBT mobile foi de ~30 ms para ~350 ms e o Lighthouse de 96 para 86.
  Esperando o primeiro `pointermove`/`scroll`/`touchstart` (fallback de 6 s), o TBT
  voltou para 40–80 ms. Números completos em `PENDENCIAS.md`.
- `src/styles/hero-backdrop.css` → `src/styles/hero.css`, com a pilha refeita: a
  malha de grafite agora fica **por cima** da cena (lê como instrumento de medida) e
  entrou o `.hero-scrim`, que é camada de contraste, não de estética.
- `.gitignore`: `.vite-react-ssg-temp`.

### Corrigido

- **O parser de conteúdo quebrava com quebras de linha CRLF** (bug pré-existente,
  encontrado por acidente durante este trabalho). `core.autocrlf=true` é o default do
  Git no Windows, que é onde o projeto roda: bastava um checkout renormalizar
  `content/copy.md` para o parser não achar **nenhum** campo e o build morrer
  acusando que a copy inteira estava faltando, com o arquivo intacto na tela. Causa:
  `parseSectionBlocks` dividia por `'\n'` e sobrava `\r` no fim de cada linha —
  `LABELED_RE` não casa, porque `.` não casa `\r` e `$` sem flag `m` exige o fim
  absoluto da string. Agora divide por `/\r?\n/`.

### Removido

- O bloom em CSS que perseguia o ponteiro. A cena faz isso melhor, por profundidade,
  e duas camadas reagindo ao mesmo cursor com leis diferentes lia como bug.

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
