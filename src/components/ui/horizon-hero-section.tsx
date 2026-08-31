/**
 * Horizon — cena cósmica em three.js dirigida pela rolagem.
 *
 * Terceiro componente adotado de fora, versionado em `components/ui/` pelo mesmo
 * critério do `hero-parallax.tsx` e do `zoom-parallax.tsx`.
 *
 * ⚠ VERSÃO INICIAL, PEDIDA "COMO ESTÁ" (2026-08-29): a cena (5000 estrelas × 3 campos,
 * nebulosa, quatro cordilheiras, atmosfera), o bloom, as posições de câmera por seção,
 * a matemática da rolagem, o markup e os textos em inglês são exatamente os do código
 * enviado.
 *
 * ⚠ O CSS NÃO VEIO JUNTO. Ver `src/styles/horizon-hero.css`.
 *
 * ─── O QUE MUDOU, E POR QUÊ ─────────────────────────────────────────────────────
 *  1. **Tipagem.** O original é JSX sem tipos e este projeto é TypeScript `strict`
 *     com `noUnusedLocals`/`noUnusedParameters`. Então: as refs ganharam tipo, o saco
 *     de refs do three virou `interface ThreeRefs`, e o que o compilador acusou como
 *     MORTO no original foi removido — `cameraVelocity` (declarado e nunca usado), o
 *     `const location` dentro do laço da rolagem e o `import React` (o projeto usa
 *     `jsx: react-jsx`, não precisa do import). Nada disso tinha efeito.
 *  2. **`three/examples/jsm/...` → `.../*.js`.** Sem a extensão, o mapa de exports do
 *     pacote `three` não resolve o caminho e o build quebra.
 *  3. **`splitTitle` passou a ser USADO no título.** Ele existe no original, a
 *     timeline anima `.title-char` — e nada renderizava esses `<span>`. Como estava,
 *     a entrada do título não tinha alvo nenhum (e o compilador ainda acusaria a
 *     função morta). Duas linhas para a animação que veio no código funcionar.
 *  4. **`titleRef`/`subtitleRef` não são mais presos dentro do laço das seções.** O
 *     original prende as MESMAS duas refs no título do herói e no título de cada
 *     seção de rolagem; em React, a última montagem vence, então as refs apontavam
 *     para a última seção e a timeline animava o elemento errado. Mesma correção
 *     mínima: sem ela, nada do que o autor escreveu roda.
 *  5. `<h1>` → `<h2>` (três vezes). A página só tem um `<h1>`, o do herói (§6.3).
 *  6. `prefers-reduced-motion` (§6.6, inegociável): na variante calma os elementos
 *     aparecem sem entrada (nada some — só não desliza). A cena 3D continua igual.
 *  7. As guardas de nulo que o `strict` exige (`refs.nebula`, `refs.locations`,
 *     `targetCamera*`) — antes da inicialização, o manipulador simplesmente não faz
 *     nada, que é o que já acontecia na prática.
 *
 *  8. **A rolagem passou a ser medida na SEÇÃO, não no documento** (2026-08-29),
 *     porque a cena chegava quebrada: o detalhe está no comentário do manipulador.
 *  9. **A paleta virou a da Metup** (2026-08-29, pedido do Davi): era azul/roxo/lilás,
 *     agora é âmbar → laranja → vermelho. Ver `PALETTE`, logo abaixo dos imports.
 *
 * ─── O QUARTO ATO (2026-08-31, pedido do Davi: "um CTA no final da cena") ────────
 * 10. **`finale`** — um ato a mais no fim do container, com a cena atrás dele. O
 *     componente não sabe o que ele contém: quem monta o conteúdo é
 *     `sections/HorizonFinale`, que lê a copy de `content/` como manda o §9. Aqui só
 *     entra a MECÂNICA de ter um ato a mais: mais uma posição de câmera, mais uma
 *     tela de pista e o indicador de rolagem cedendo lugar. Ver `ComponentProps`.
 * 11. **`progress > 0.7` virou `ato > 1.4`.** O 0.7 do original é a fração da pista
 *     em que as cordilheiras e a nebulosa somem de quadro — e ele só significa
 *     "durante a travessia" enquanto existirem DOIS atos. Com o finale a pista fica
 *     50% mais longa e o mesmo 0.7 cairia lá na frente, jogando o clarão da nebulosa
 *     em cima do texto do terceiro ato (o defeito de contraste que o PENDENCIAS.md
 *     já registrava, piorado). Medido em ATOS, o corte acontece no mesmo instante da
 *     narrativa, com dois ou com três: `0.7 × 2 = 1.4`.
 * 12. **A rolagem não re-renderiza mais o React**, e a barra de progresso deixou de
 *     ser animada por `width`. Eram dois `useState` escritos a cada evento de
 *     `scroll` — um render de React por quadro de rolagem, ao longo de quatro telas
 *     — e um `style={{ width: '…%' }}`, que é layout a cada quadro, exatamente o que
 *     o §6.4 proíbe. Agora o manipulador escreve `transform: scaleX()` e o texto do
 *     contador direto no DOM, por ref: zero render, zero reflow.
 * 13. **O `rAF` para quando a seção sai de quadro** (IntersectionObserver). Era um
 *     conflito declarado em PENDENCIAS.md: a cena desenhava 5000×3 estrelas + bloom
 *     em tela cheia a 60fps do topo ao rodapé do site, roubando quadro do herói (que
 *     tem o próprio contexto WebGL) e das animações de todas as outras seções.
 *
 * ─── O ZOOM ENTRA NA PRÓPRIA CENA (2026-08-31, pedido do Davi) ──────────────────
 * 14. **`introTrackRef`** — o quadro central da vitrine acima deixou de ser um painel
 *     preto (antes disso, uma foto) e passou a ser **esta cena**, de verdade: o que
 *     abre com o zoom é o `<canvas>` que já existe aqui, projetado dentro do
 *     quadrinho e crescendo com ele até tomar a tela. Ver `ComponentProps.introTrackRef`
 *     e `INTRO_MIN_SCALE`.
 * 15. **`frozen` MORREU.** Era a solução anterior para a mesma coisa: uma SEGUNDA
 *     instância da cena, congelada, montada dentro do quadrinho. Ela custava um
 *     terceiro contexto WebGL, outra cópia das 15 000 estrelas e outro alvo de bloom
 *     em tela cheia — tudo para desenhar um quadro parado. Agora não existe segunda
 *     cena: é a mesma, no mesmo contexto, e por isso o encaixe do fim do zoom com o
 *     começo da seção é exato por construção, e não por coincidência de aparência.
 * 16. **A entrada em GSAP acontece quando a cena CHEGA**, não na montagem. O título,
 *     o menu e o indicador eram animados assim que o componente ficava pronto — lá no
 *     carregamento da página, com a pessoa ainda no herói —, então quem descia já
 *     encontrava tudo parado. Com o zoom desembocando aqui, a entrada é o primeiro
 *     quadro da cena: um `ScrollTrigger` (`top top`, uma vez só) segura a timeline
 *     até o container encostar no topo, que é exatamente o instante em que o zoom
 *     termina.
 *
 * ⚠ CONFLITO DECLARADO que CONTINUA aqui, registrado em PENDENCIAS.md: são **dois
 * contextos WebGL** na mesma página — o herói da Metup já tem o seu.
 */
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useEffect, useRef, useState, type ReactNode, type RefObject } from 'react';
import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';

gsap.registerPlugin(ScrollTrigger);

/**
 * PALETA DA CENA — traduzida da paleta da Metup (2026-08-29, pedido do Davi).
 *
 * O original era azul/roxo/lilás (nebulosa `0x0033ff` → `0xff0066`, cordilheiras em
 * tons de navy `0x1a1a2e` → `0x0a4668`, atmosfera `vec3(0.3, 0.6, 1.0)`). Aqui vira
 * âmbar → laranja → vermelho, na mesma família do `--color-accent` (`#f5a623`) de
 * `tokens.css`.
 *
 * ⚠ NÃO HÁ SINCRONIA AUTOMÁTICA COM `tokens.css`. Um shader do three.js recebe
 * números (`0xRRGGBB`, `vec3` 0–1), não `var(--color-accent)` — não existe ponte
 * entre CSS custom property e uniform de GLSL sem ler `getComputedStyle` em tempo de
 * execução (frágil, e o projeto pré-renderiza). Os valores abaixo são a TRADUÇÃO
 * manual dos tokens; se a paleta de marca mudar, esta lista precisa mudar junto —
 * mesma classe de problema que `motion-sync.ts` resolve para GSAP↔CSS, sem
 * equivalente aqui. Registrado em PENDENCIAS.md.
 */
const PALETTE = {
  /** As quatro cordilheiras, da mais perto (opaca) à mais longe (tênue). Antes:
   *  navy/roxo (`0x1a1a2e` → `0x0a4668`). Agora: marrom quase preto → âmbar. */
  mountains: [0x1a0f08, 0x3d1f0a, 0x8a3a12, 0xd4791f],
  /** Nebulosa: antes azul (`0x0033ff`) misturando com magenta (`0xff0066`). Agora
   *  brasa (vermelho profundo) misturando com o dourado da marca — `#f5a623`
   *  literal, o mesmo hex de `--color-accent`. */
  nebulaColor1: 0x8a1a0a,
  nebulaColor2: 0xf5a623,
  /** Halo da atmosfera: antes `vec3(0.3, 0.6, 1.0)` (azul-branco). Agora é
   *  `--color-accent-hover` (`#f7b344`) em 0–1: `(0.969, 0.702, 0.267)`. */
  atmosphere: { r: 0.969, g: 0.702, b: 0.267 },
} as const;

/**
 * As posições de câmera, uma por ato. Saíram de dentro do manipulador de rolagem
 * (onde o original as reconstruía a cada evento) para poderem ser LIDAS junto do
 * texto que cada ato carrega — a lista é a decupagem da cena.
 *
 *   0 · HORIZONTE — a cordilheira ao longe.        "Você enxerga mais longe."
 *   1 · COSMOS    — atravessando as cordilheiras.  "Mas enxergar não basta."
 *   2 · INFINITO  — acima de tudo.                 "É preciso construir para chegar lá."
 *   3 · CHEGADA   — o quarto ato, só com `finale`. O CTA.
 *
 * ⚠ O ATO 3 É DELIBERADAMENTE O MENOR DESLOCAMENTO DA CENA (2026-08-31). Os três
 * primeiros percorrem 350 e 650 unidades; este percorre 200, e ainda por cima com a
 * suavização exponencial de 0.05 do laço — ou seja, a câmera CHEGA e desacelera em
 * vez de continuar fugindo. É o §3 aplicado à direção: no ato em que a página pede o
 * clique, o movimento cede o palco para o CTA em vez de disputá-lo.
 *
 * Os números são coordenadas de mundo com `lookAt(0, 10, -600)` fixo (ver o laço).
 * Subir em Y e recuar em Z afasta a esfera de atmosfera (raio 600 na origem), que é
 * o que faz o clarão encolher e o céu escurecer justamente onde o texto entra —
 * metade da conta de contraste do ato; a outra metade é o véu, em `horizon-finale.css`.
 * `z = -900` mantém a câmera DENTRO da casca de estrelas (raio 200–1000): passar
 * disso trocaria o céu por uma bola de estrelas vista de fora.
 */
const CAMERA_ACTS = [
  { x: 0, y: 30, z: 300 },
  { x: 0, y: 40, z: -50 },
  { x: 0, y: 50, z: -700 },
  { x: 0, y: 70, z: -900 },
] as const;

/**
 * O instante em que cordilheiras e nebulosa saem de quadro, MEDIDO EM ATOS.
 *
 * O original escrevia `progress > 0.7` — a mesma coisa, enquanto a cena tem dois
 * atos (`0.7 × 2 = 1.4`). Ver o ponto 11 do cabeçalho para o porquê de a unidade
 * importar. 1.4 cai no fim da travessia: as cordilheiras já ficaram para trás da
 * câmera e o teleporte para `z = 600000` é invisível — é justamente por isso que o
 * corte seco do original nunca apareceu como um "pop".
 */
const CLEAR_AT_ACT = 1.4;

/**
 * A ESCALA EM QUE A CENA NASCE, DENTRO DO QUADRO DA VITRINE (2026-08-31).
 *
 * O quadro central da vitrine em zoom mede `25vw × 25vh` e é o único slot centrado —
 * ou seja, ele é a janela inteira reduzida a **25%** em torno do próprio centro (o
 * contrato está escrito no cabeçalho de `components/ui/zoom-parallax.tsx`). Como o
 * `<canvas>` desta cena também é do tamanho da janela, pô-lo dentro do quadrinho é
 * uma escala só: 0,25 no começo da pista, 1 quando ela acaba. Nenhum recorte, nenhuma
 * distorção — a proporção é a mesma dos dois lados.
 *
 * ⚠ Este número e o `scale4` do índice 0 da vitrine são a MESMA conta vista de dois
 * lugares (`1/4`). Se um mudar, o outro muda junto.
 */
const INTRO_MIN_SCALE = 0.25;

/** "03 / 04" — o contador do indicador de rolagem. */
function formatCounter(section: number, total: number): string {
  return `${String(section).padStart(2, '0')} / ${String(total).padStart(2, '0')}`;
}

type StarField = THREE.Points<THREE.BufferGeometry, THREE.ShaderMaterial>;
type Nebula = THREE.Mesh<THREE.PlaneGeometry, THREE.ShaderMaterial>;
type Mountain = THREE.Mesh<THREE.ShapeGeometry, THREE.MeshBasicMaterial>;

interface ThreeRefs {
  scene: THREE.Scene | null;
  camera: THREE.PerspectiveCamera | null;
  renderer: THREE.WebGLRenderer | null;
  composer: EffectComposer | null;
  stars: StarField[];
  nebula: Nebula | null;
  mountains: Mountain[];
  /** O original criava a esfera e perdia a referência — ela nunca era liberada. */
  atmosphere: THREE.Mesh<THREE.SphereGeometry, THREE.ShaderMaterial> | null;
  animationId: number | null;
  /** Escritos pelo manipulador de rolagem, lidos pelo laço de animação. */
  targetCameraX?: number;
  targetCameraY?: number;
  targetCameraZ?: number;
  /** `position.z` original de cada cordilheira, para o retorno depois do corte. */
  locations?: number[];
  /** Relógio do quadro anterior — a suavização da câmera é por TEMPO, ver `animate`. */
  lastFrameTime?: number;
}

export interface ComponentProps {
  /**
   * A PISTA DA VITRINE EM ZOOM, logo acima desta seção (pedido do Davi, 2026-08-31:
   * "que o que desse zoom não fosse uma imagem, e sim a própria cena 3D").
   *
   * Recebendo esta `ref`, a cena passa a ter um ATO ZERO: enquanto o zoom abre, este
   * mesmo `<canvas>` é projetado dentro do quadro central da vitrine — reduzido a
   * `INTRO_MIN_SCALE` e crescendo até 1 — e só então assume a tela. Não é uma segunda
   * cena nem uma imagem: é este canvas, neste contexto WebGL, com a câmera parada no
   * primeiro ato.
   *
   * **A cena não COMEÇA aí, ela ESPERA aí.** A viagem da câmera é medida na posição
   * desta seção, que durante todo o zoom ainda está abaixo da janela: `progress`
   * continua grampeado em 0, ou seja, o primeiro ato inteiro. O que se vê no quadrinho
   * é o céu vivo (estrelas girando, o clarão pulsando) — porque um quadro congelado
   * lá dentro seria indistinguível de uma foto, que é justamente o que saiu. A
   * narrativa (câmera, títulos, indicador) só arranca quando o zoom acaba.
   *
   * Como é feito, e por que assim:
   *  · **transformação, não remontagem.** O canvas continua exatamente onde está no
   *    fluxo (`sticky`, dentro desta seção); o que muda é um `transform` escrito no
   *    DOM pelo manipulador de rolagem. Reparentar um `<canvas>` — ou montar outro —
   *    custaria o contexto WebGL, que é o recurso escasso da página.
   *  · **o encaixe é exato por construção.** No fim da pista a transformação vira a
   *    identidade e o `sticky` do CSS assume, no MESMO pixel. Não há troca de imagem,
   *    logo não há emenda para aparecer.
   *  · **cai sozinho.** Sem a `ref` — ou em movimento reduzido — o `transform` nunca
   *    é escrito e a seção é a de sempre. Quem passa é `sections/HorizonHero`.
   */
  introTrackRef?: RefObject<HTMLElement | null>;
  /**
   * O QUARTO ATO — o fecho da cena (pedido do Davi, 2026-08-31).
   *
   * Renderizado como o último filho do container, ou seja: com o `<canvas>` preso
   * atrás dele e dentro da pista de rolagem da cena. É isso que faz o CTA acontecer
   * DENTRO do cosmos em vez de numa seção colada embaixo dele — a diferença entre
   * "a cena termina e aí tem um botão" e "a cena chega a algum lugar".
   *
   * Passar um `finale` muda três coisas na mecânica, e nada mais:
   *  · a pista ganha uma tela (`totalSections` vai de 2 para 3), então cada ato
   *    continua valendo exatamente uma tela de rolagem;
   *  · a câmera ganha a quarta posição de `CAMERA_ACTS` — a chegada;
   *  · o indicador "SCROLL" desaparece quando o último ato entra em quadro: no fim
   *    da página a instrução certa não é rolar, é clicar (§3).
   *
   * O componente NÃO sabe o que tem dentro. A copy, o contraste e o motion do ato
   * são de quem passa o nó — ver `sections/HorizonFinale`.
   */
  finale?: ReactNode;
}

export const Component = ({ introTrackRef, finale }: ComponentProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLDivElement>(null);
  const scrollProgressRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  /**
   * Alvos que o manipulador de rolagem escreve DIRETO no DOM.
   *
   * Ver o ponto 12 do cabeçalho: estes três já foram estado do React, e por isso a
   * rolagem re-renderizava o componente a cada evento. Nenhum deles é conteúdo — são
   * um medidor, um contador e um atributo de visibilidade —, então o React monta o
   * valor inicial (que é o que vai para o HTML pré-renderizado) e nunca mais toca
   * neles: sem estado, não há render que sobrescreva o que o manipulador escreveu.
   */
  const progressFillRef = useRef<HTMLDivElement>(null);
  const sectionCounterRef = useRef<HTMLDivElement>(null);
  const scrollCueRef = useRef<HTMLDivElement>(null);

  const smoothCameraPos = useRef({ x: 0, y: 30, z: 100 });

  const [isReady, setIsReady] = useState(false);
  const hasFinale = finale !== undefined;
  /** Um ato por tela de pista. Ver `ComponentProps.finale`. */
  const totalSections = hasFinale ? 3 : 2;

  const threeRefs = useRef<ThreeRefs>({
    scene: null,
    camera: null,
    renderer: null,
    composer: null,
    stars: [],
    nebula: null,
    mountains: [],
    atmosphere: null,
    animationId: null,
  });

  // Declarado ANTES do efeito que o chama (no original vinha depois). Só a ordem
  // mudou: ler uma `const` do corpo do componente de dentro de um efeito funciona por
  // acidente de tempo, e o lint acusa — com razão.
  const getLocation = () => {
    const { current: refs } = threeRefs;
    const locations: number[] = [];
    refs.mountains.forEach((mountain, i) => {
      locations[i] = mountain.position.z;
    });
    refs.locations = locations;
  };

  // Initialize Three.js
  useEffect(() => {
    const initThree = () => {
      const { current: refs } = threeRefs;

      /**
       * As listas voltam a ZERO antes de qualquer criação.
       *
       * O saco de refs sobrevive ao efeito (é `useRef`), mas a cena não: a cada
       * remontagem — hot reload em dev, e qualquer troca de `frozen` — as funções de
       * criação empilhavam MAIS três campos de estrelas e MAIS quatro cordilheiras nas
       * mesmas listas. Além do desperdício, `mountains[3]` (que a nebulosa segue)
       * passava a apontar para uma montanha de outra encarnação da cena, e
       * `locations` deixava de casar com a lista. Sem isto, a cena só está correta na
       * primeira montagem.
       */
      refs.stars = [];
      refs.mountains = [];

      // Scene setup
      refs.scene = new THREE.Scene();
      refs.scene.fog = new THREE.FogExp2(0x000000, 0.00025);

      // Camera
      refs.camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        2000,
      );
      refs.camera.position.z = 100;
      refs.camera.position.y = 20;

      // Renderer
      refs.renderer = new THREE.WebGLRenderer({
        canvas: canvasRef.current ?? undefined,
        antialias: true,
        alpha: true,
      });
      // `updateStyle: false` — o `setSize` normalmente escreve `style.width/height` em
      // px na tag, e estilo inline vence a folha: dentro do quadrinho do zoom o canvas
      // nasceria do tamanho da JANELA e vazaria para fora dele; na seção, a largura da
      // janela inclui a barra de rolagem e sobraria alguns px de rolagem horizontal na
      // página. Quem dimensiona a tag é o CSS; o buffer continua igual ao original.
      refs.renderer.setSize(window.innerWidth, window.innerHeight, false);
      refs.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      refs.renderer.toneMapping = THREE.ACESFilmicToneMapping;
      refs.renderer.toneMappingExposure = 0.5;

      // Post-processing
      refs.composer = new EffectComposer(refs.renderer);
      const renderPass = new RenderPass(refs.scene, refs.camera);
      refs.composer.addPass(renderPass);

      const bloomPass = new UnrealBloomPass(
        new THREE.Vector2(window.innerWidth, window.innerHeight),
        0.8,
        0.4,
        0.85,
      );
      refs.composer.addPass(bloomPass);

      // Create scene elements
      createStarField();
      createNebula();
      createMountains();
      createAtmosphere();
      getLocation();

      /**
       * UM quadro, na montagem.
       *
       * É a garantia de que o canvas nunca aparece em branco antes de o laço começar:
       * quem liga o laço é o IntersectionObserver lá embaixo, e o primeiro `callback`
       * dele só chega no quadro seguinte.
       */
      refs.composer?.render();

      // Mark as ready after Three.js is initialized
      setIsReady(true);
    };

    const createStarField = () => {
      const { current: refs } = threeRefs;
      const starCount = 5000;

      for (let i = 0; i < 3; i++) {
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(starCount * 3);
        const colors = new Float32Array(starCount * 3);
        const sizes = new Float32Array(starCount);

        for (let j = 0; j < starCount; j++) {
          const radius = 200 + Math.random() * 800;
          const theta = Math.random() * Math.PI * 2;
          const phi = Math.acos(Math.random() * 2 - 1);

          positions[j * 3] = radius * Math.sin(phi) * Math.cos(theta);
          positions[j * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
          positions[j * 3 + 2] = radius * Math.cos(phi);

          // Color variation
          // ⚠ Terça fatia (10%) recolorida: era azul puro (H=0.6), a única estrela da
          // cena fora da paleta da Metup. Virou vermelho-ember (H≈0.02), a ponta fria
          // da família âmbar→laranja→vermelho de `PALETTE` — ver o comentário lá em
          // cima. As outras duas fatias (branco e âmbar) já cabiam na paleta nova.
          const color = new THREE.Color();
          const colorChoice = Math.random();
          if (colorChoice < 0.7) {
            color.setHSL(0, 0, 0.8 + Math.random() * 0.2);
          } else if (colorChoice < 0.9) {
            color.setHSL(0.08, 0.5, 0.8);
          } else {
            color.setHSL(0.02, 0.6, 0.75);
          }

          colors[j * 3] = color.r;
          colors[j * 3 + 1] = color.g;
          colors[j * 3 + 2] = color.b;

          sizes[j] = Math.random() * 2 + 0.5;
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

        const material = new THREE.ShaderMaterial({
          uniforms: {
            time: { value: 0 },
            depth: { value: i },
            /**
             * ⚠ SEM ISTO NÃO HÁ ESTRELA NO CELULAR (corrigido em 2026-08-29).
             *
             * `gl_PointSize` é medido em pixels do FRAMEBUFFER, não em pixels de CSS.
             * Como o renderer roda com `setPixelRatio(min(devicePixelRatio, 2))`, num
             * aparelho retina o framebuffer é o dobro do tamanho em CSS — e a conta
             * original (`size * 300 / -z`), que não sabe disso, desenhava cada estrela
             * com METADE do tamanho aparente. Elas já nascem entre 0,15 e 2,5 px:
             * metade disso cai abaixo de um pixel e o rasterizador descarta. O céu do
             * celular ficava liso.
             *
             * Multiplicar pela densidade devolve o mesmo tamanho APARENTE em qualquer
             * tela. É a prática padrão do three para `Points`.
             */
            pixelRatio: { value: refs.renderer?.getPixelRatio() ?? 1 },
          },
          vertexShader: `
            attribute float size;
            attribute vec3 color;
            varying vec3 vColor;
            uniform float time;
            uniform float depth;
            uniform float pixelRatio;

            void main() {
              vColor = color;
              vec3 pos = position;

              // Slow rotation based on depth
              float angle = time * 0.05 * (1.0 - depth * 0.3);
              mat2 rot = mat2(cos(angle), -sin(angle), sin(angle), cos(angle));
              pos.xy = rot * pos.xy;

              vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
              gl_PointSize = size * (300.0 / -mvPosition.z) * pixelRatio;
              gl_Position = projectionMatrix * mvPosition;
            }
          `,
          fragmentShader: `
            varying vec3 vColor;

            void main() {
              float dist = length(gl_PointCoord - vec2(0.5));
              if (dist > 0.5) discard;

              float opacity = 1.0 - smoothstep(0.0, 0.5, dist);
              gl_FragColor = vec4(vColor, opacity);
            }
          `,
          transparent: true,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
        });

        const stars: StarField = new THREE.Points(geometry, material);
        refs.scene?.add(stars);
        refs.stars.push(stars);
      }
    };

    const createNebula = () => {
      const { current: refs } = threeRefs;

      const geometry = new THREE.PlaneGeometry(8000, 4000, 100, 100);
      const material = new THREE.ShaderMaterial({
        uniforms: {
          time: { value: 0 },
          color1: { value: new THREE.Color(PALETTE.nebulaColor1) },
          color2: { value: new THREE.Color(PALETTE.nebulaColor2) },
          opacity: { value: 0.3 },
        },
        vertexShader: `
          varying vec2 vUv;
          varying float vElevation;
          uniform float time;

          void main() {
            vUv = uv;
            vec3 pos = position;

            float elevation = sin(pos.x * 0.01 + time) * cos(pos.y * 0.01 + time) * 20.0;
            pos.z += elevation;
            vElevation = elevation;

            gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
          }
        `,
        fragmentShader: `
          uniform vec3 color1;
          uniform vec3 color2;
          uniform float opacity;
          uniform float time;
          varying vec2 vUv;
          varying float vElevation;

          void main() {
            float mixFactor = sin(vUv.x * 10.0 + time) * cos(vUv.y * 10.0 + time);
            vec3 color = mix(color1, color2, mixFactor * 0.5 + 0.5);

            float alpha = opacity * (1.0 - length(vUv - 0.5) * 2.0);
            alpha *= 1.0 + vElevation * 0.01;

            gl_FragColor = vec4(color, alpha);
          }
        `,
        transparent: true,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide,
        depthWrite: false,
      });

      const nebula: Nebula = new THREE.Mesh(geometry, material);
      nebula.position.z = -1050;
      nebula.rotation.x = 0;
      refs.scene?.add(nebula);
      refs.nebula = nebula;
    };

    const createMountains = () => {
      const { current: refs } = threeRefs;

      const layers = [
        { distance: -50, height: 60, color: PALETTE.mountains[0], opacity: 1 },
        { distance: -100, height: 80, color: PALETTE.mountains[1], opacity: 0.8 },
        { distance: -150, height: 100, color: PALETTE.mountains[2], opacity: 0.6 },
        { distance: -200, height: 120, color: PALETTE.mountains[3], opacity: 0.4 },
      ];

      layers.forEach((layer, index) => {
        const points = [];
        const segments = 50;

        for (let i = 0; i <= segments; i++) {
          const x = (i / segments - 0.5) * 1000;
          const y =
            Math.sin(i * 0.1) * layer.height +
            Math.sin(i * 0.05) * layer.height * 0.5 +
            Math.random() * layer.height * 0.2 -
            100;
          points.push(new THREE.Vector2(x, y));
        }

        points.push(new THREE.Vector2(5000, -300));
        points.push(new THREE.Vector2(-5000, -300));

        const shape = new THREE.Shape(points);
        const geometry = new THREE.ShapeGeometry(shape);
        const material = new THREE.MeshBasicMaterial({
          color: layer.color,
          transparent: true,
          opacity: layer.opacity,
          side: THREE.DoubleSide,
        });

        const mountain: Mountain = new THREE.Mesh(geometry, material);
        mountain.position.z = layer.distance;
        mountain.position.y = layer.distance;
        mountain.userData = { baseZ: layer.distance, index };
        refs.scene?.add(mountain);
        refs.mountains.push(mountain);
      });
    };

    const createAtmosphere = () => {
      const { current: refs } = threeRefs;

      const geometry = new THREE.SphereGeometry(600, 32, 32);
      const material = new THREE.ShaderMaterial({
        uniforms: {
          time: { value: 0 },
          // Halo da atmosfera — ver `PALETTE.atmosphere` no topo do arquivo.
          glowColor: {
            value: new THREE.Vector3(PALETTE.atmosphere.r, PALETTE.atmosphere.g, PALETTE.atmosphere.b),
          },
        },
        vertexShader: `
          varying vec3 vNormal;
          varying vec3 vPosition;

          void main() {
            vNormal = normalize(normalMatrix * normal);
            vPosition = position;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: `
          varying vec3 vNormal;
          varying vec3 vPosition;
          uniform float time;
          uniform vec3 glowColor;

          void main() {
            float intensity = pow(0.7 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.0);
            vec3 atmosphere = glowColor * intensity;

            float pulse = sin(time * 2.0) * 0.1 + 0.9;
            atmosphere *= pulse;

            gl_FragColor = vec4(atmosphere, intensity * 0.25);
          }
        `,
        side: THREE.BackSide,
        blending: THREE.AdditiveBlending,
        transparent: true,
      });

      const atmosphere = new THREE.Mesh(geometry, material);
      refs.scene?.add(atmosphere);
      refs.atmosphere = atmosphere;
    };

    const animate = () => {
      const { current: refs } = threeRefs;
      refs.animationId = requestAnimationFrame(animate);

      const time = Date.now() * 0.001;
      // Quanto tempo passou desde o quadro anterior. `undefined` no primeiro quadro
      // (e depois de toda pausa do laço — `startLoop` zera): aí vale um quadro de
      // 60fps, que é o que o original assumia sempre.
      const delta = refs.lastFrameTime === undefined ? 1 / 60 : time - refs.lastFrameTime;
      refs.lastFrameTime = time;

      // Update stars
      refs.stars.forEach((starField) => {
        starField.material.uniforms.time.value = time;
      });

      // Update nebula
      if (refs.nebula) {
        refs.nebula.material.uniforms.time.value = time * 0.5;
      }

      // Smooth camera movement with easing
      const { targetCameraX, targetCameraY, targetCameraZ } = refs;
      if (
        refs.camera &&
        targetCameraX !== undefined &&
        targetCameraY !== undefined &&
        targetCameraZ !== undefined
      ) {
        /**
         * ⚠ A SUAVIZAÇÃO PASSOU A SER POR TEMPO, NÃO POR QUADRO (2026-08-31).
         *
         * O original interpolava 5% do que falta A CADA QUADRO. Isso amarra a
         * velocidade da câmera à taxa de quadros: num monitor de 120Hz ela chega ao
         * destino no DOBRO da velocidade de um de 60Hz, e num aparelho fraco (ou num
         * quadro caro, como o clarão da atmosfera em tela cheia) ela fica para trás.
         *
         * Deixou de ser detalhe quando o CTA final virou o quarto ato. O caminho mais
         * comum até ele não é rolar: é CLICAR — no CTA do herói ou em "Contato" no
         * header —, e aí a página salta ~10 000px de uma vez. Medido em software
         * rendering (Puppeteer/SwiftShader, o pior caso disponível): com a conta por
         * quadro, a câmera ainda estava em trânsito CINCO SEGUNDOS depois do clique, e
         * quem chegava no CTA encontrava a tela lavada de branco pelo clarão do ato
         * anterior. O texto continuava legível (o véu garante isso), mas a chegada
         * parecia um defeito.
         *
         * `1 - (1 - k)^(dt × 60)` é a mesma curva do original a 60fps, só que ancorada
         * no relógio: a câmera assenta em ~1s de tempo REAL em qualquer taxa de
         * quadros. `dt` é grampeado em 0,2s para que um quadro perdido (aba oculta,
         * engasgo de GC) não vire um salto de câmera.
         */
        const smoothingFactor = 1 - Math.pow(1 - 0.05, Math.min(delta, 0.2) * 60);

        // Calculate smooth position with easing
        smoothCameraPos.current.x += (targetCameraX - smoothCameraPos.current.x) * smoothingFactor;
        smoothCameraPos.current.y += (targetCameraY - smoothCameraPos.current.y) * smoothingFactor;
        smoothCameraPos.current.z += (targetCameraZ - smoothCameraPos.current.z) * smoothingFactor;

        // Add subtle floating motion
        const floatX = Math.sin(time * 0.1) * 2;
        const floatY = Math.cos(time * 0.15) * 1;

        // Apply final position
        refs.camera.position.x = smoothCameraPos.current.x + floatX;
        refs.camera.position.y = smoothCameraPos.current.y + floatY;
        refs.camera.position.z = smoothCameraPos.current.z;
        refs.camera.lookAt(0, 10, -600);
      }

      // Parallax mountains with subtle animation
      refs.mountains.forEach((mountain, i) => {
        const parallaxFactor = 1 + i * 0.5;
        mountain.position.x = Math.sin(time * 0.1) * 2 * parallaxFactor;
        mountain.position.y = 50 + Math.cos(time * 0.15) * 1 * parallaxFactor;
      });

      if (refs.composer) {
        refs.composer.render();
      }
    };

    /**
     * ─── O LAÇO SÓ RODA COM A SEÇÃO EM QUADRO (2026-08-31) ────────────────────────
     *
     * Conflito que estava declarado em PENDENCIAS.md: o `rAF` nascia na montagem e
     * nunca parava. A cena desenha 15 000 estrelas, um plano de 8000×4000 e um passe
     * de bloom em tela cheia — e fazia isso a 60fps enquanto a pessoa lia o herói, os
     * Serviços e o Processo, disputando GPU com o OUTRO contexto WebGL da página (o
     * do herói) e com todas as animações em GSAP. Ninguém via um pixel disso.
     *
     * A margem de 25% liga o laço um quarto de tela antes de a seção aparecer: quando
     * o zoom da vitrine acima termina em tela cheia e a cena entra, ela já está
     * desenhando há vários quadros. Não existe "primeiro quadro" visível.
     *
     * `startLoop` reencontra a câmera com o alvo antes de voltar a desenhar. Enquanto
     * o laço está parado, o manipulador de rolagem continua atualizando o ALVO (é
     * barato: três números), mas ninguém interpola em direção a ele — sem este passo,
     * voltar à seção mostraria um voo de ~1s até a posição correta, que é justamente
     * o que a suavização de 0.05 do laço existe para esconder.
     */
    const stopLoop = (): void => {
      const { current: refs } = threeRefs;
      if (refs.animationId === null) return;
      cancelAnimationFrame(refs.animationId);
      refs.animationId = null;
    };

    const startLoop = (): void => {
      const { current: refs } = threeRefs;
      if (refs.animationId !== null) return;

      // O relógio recomeça: sem isto, o primeiro quadro depois da pausa veria um
      // `delta` do tamanho da pausa inteira (ver `animate`).
      refs.lastFrameTime = undefined;

      const { targetCameraX, targetCameraY, targetCameraZ } = refs;
      if (
        targetCameraX !== undefined &&
        targetCameraY !== undefined &&
        targetCameraZ !== undefined
      ) {
        smoothCameraPos.current.x = targetCameraX;
        smoothCameraPos.current.y = targetCameraY;
        smoothCameraPos.current.z = targetCameraZ;
      }

      animate();
    };

    initThree();

    let observer: IntersectionObserver | null = null;

    // Navegador sem IntersectionObserver: o laço volta a ser o do original (sempre
    // ligado). Degradar o consumo é aceitável; degradar a cena, não.
    if (typeof IntersectionObserver === 'undefined') {
      startLoop();
    } else {
      /**
       * DOIS ALVOS desde 2026-08-31: esta seção **e a pista da vitrine em zoom**.
       *
       * Durante o zoom a seção ainda está duas telas abaixo — mas o canvas dela já
       * está em quadro, dentro do quadrinho que abre (ver `ComponentProps.introTrackRef`).
       * Observando só a seção, o laço acordaria no meio do zoom e a câmera daria um
       * salto para o alvo bem na frente de quem está olhando.
       *
       * Com dois alvos, "está em quadro" vira a UNIÃO dos dois, e por isso a conta é
       * um conjunto e não um `if` por entrada: as entradas chegam uma por elemento, e
       * um `else stopLoop()` na entrada do outro alvo desligaria o laço com a cena
       * ainda visível.
       */
      const onscreen = new Set<Element>();

      observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (entry.isIntersecting) onscreen.add(entry.target);
            else onscreen.delete(entry.target);
          }

          if (onscreen.size > 0) startLoop();
          else stopLoop();
        },
        { rootMargin: '25% 0px' },
      );

      if (containerRef.current !== null) observer.observe(containerRef.current);

      const introTrack = introTrackRef?.current;
      if (introTrack != null) observer.observe(introTrack);
    }

    // Handle resize
    /**
     * ⚠ SÓ LARGURA (2026-08-29, defeito relatado no celular).
     *
     * No celular, esconder/mostrar a barra de endereço dispara `resize` a cada gesto
     * de rolagem — e cada um refazia `setSize` do renderer E do composer (que
     * realoca os alvos de render do bloom). Era rolagem travando por conta de uma
     * mudança que nem chega ao canvas: a altura dele é `100svh` em CSS, fixa na
     * viewport pequena, então ela não muda quando a barra some. Só a largura muda o
     * enquadramento de verdade.
     */
    let lastWidth = window.innerWidth;

    const handleResize = () => {
      const { current: refs } = threeRefs;
      if (window.innerWidth === lastWidth) return;
      lastWidth = window.innerWidth;

      if (refs.camera && refs.renderer && refs.composer) {
        refs.camera.aspect = window.innerWidth / window.innerHeight;
        refs.camera.updateProjectionMatrix();
        refs.renderer.setSize(window.innerWidth, window.innerHeight, false);
        refs.composer.setSize(window.innerWidth, window.innerHeight);
      }
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      const { current: refs } = threeRefs;

      observer?.disconnect();
      stopLoop();

      window.removeEventListener('resize', handleResize);

      // Dispose Three.js resources
      refs.stars.forEach((starField) => {
        starField.geometry.dispose();
        starField.material.dispose();
      });

      refs.mountains.forEach((mountain) => {
        mountain.geometry.dispose();
        mountain.material.dispose();
      });

      if (refs.nebula) {
        refs.nebula.geometry.dispose();
        refs.nebula.material.dispose();
      }

      // A esfera de atmosfera: o original a criava e esquecia dela.
      if (refs.atmosphere) {
        refs.atmosphere.geometry.dispose();
        refs.atmosphere.material.dispose();
      }

      // Alvos de render do bloom e do render pass.
      refs.composer?.dispose();

      /**
       * ⚠ AQUI ESTAVA O VAZAMENTO (corrigido em 2026-08-29).
       *
       * `renderer.dispose()` libera os recursos do three, mas **não devolve o contexto
       * WebGL** — ele fica pendurado no canvas até o coletor decidir, e o navegador tem
       * um teto (algo entre 8 e 16 contextos). Em dev, cada hot reload deste arquivo
       * remonta o efeito e cria mais um; somando a cena travada do zoom e a cena viva,
       * o teto chega rápido e o `new WebGLRenderer` passa a falhar com "Error creating
       * WebGL context" — que, sem fronteira, derrubava a página inteira.
       *
       * `forceContextLoss()` é o que efetivamente devolve o contexto.
       */
      if (refs.renderer) {
        refs.renderer.dispose();
        refs.renderer.forceContextLoss();
      }

      refs.scene?.clear();
      refs.stars = [];
      refs.mountains = [];
      refs.nebula = null;
      refs.atmosphere = null;
      refs.composer = null;
      refs.renderer = null;
      refs.scene = null;
      refs.camera = null;
      refs.locations = undefined;
      refs.lastFrameTime = undefined;
    };
  }, [introTrackRef]);

  // GSAP Animations - Run after component is ready
  useEffect(() => {
    if (!isReady) return;

    // Set initial states to prevent flash
    gsap.set([menuRef.current, titleRef.current, subtitleRef.current, scrollProgressRef.current], {
      visibility: 'visible',
    });

    // `matchMedia` em vez de uma timeline solta: é o que dá a variante calma exigida
    // pelo §6.6 e é o que limpa tudo (tweens e estilos inline) no `revert`.
    const matchMedia = gsap.matchMedia();

    matchMedia.add('(prefers-reduced-motion: no-preference)', () => {
      /**
       * ⚠ A ENTRADA SÓ ESPERA A CENA CHEGAR QUANDO HÁ UM ZOOM DE VERDADE PARA
       * ESPERAR (2026-08-31, corrigido no mesmo dia em que o zoom foi desligado —
       * Davi relatou: "a palavra horizonte e a frase debaixo demoram para chegar
       * após chegar na section").
       *
       * O gatilho (`ScrollTrigger` em `top top`, ver o ponto 16 do cabeçalho) foi
       * criado para o "ato zero": sem ele, a timeline rodava na montagem — no
       * carregamento da página, com a pessoa ainda no herói —, e por isso o título já
       * chegava pousado quando o zoom terminava, sem entrada nenhuma para ver. Isso
       * SÓ importa quando existe pista (`introTrackRef` de verdade anexado a um
       * elemento): é o zoom que consome os primeiros segundos da visita, então a
       * entrada podia esperar por ele sem custo nenhum de percepção.
       *
       * Com o zoom DESLIGADO (`ZOOM_PARALLAX_ENABLED` em `App.tsx`), não existe mais
       * esse tempo de zoom para a entrada "esperar escondida" — mas o gatilho
       * continuava lá, e agora só disparava quando a pessoa rolava até o pixel exato
       * em que o container encosta no topo. Resultado: quem chegava à seção via o
       * título e o subtítulo aparecerem do zero, em tempo real (a timeline sozinha
       * já leva ~2,4s para o título terminar de entrar) — o "demora" relatado. Sem
       * pista, a entrada volta a tocar assim que a cena estiver pronta (na
       * montagem), do jeito que sempre foi antes do ato zero existir: quando a
       * pessoa rola até aqui, o título já está pousado.
       *
       * `once: true` no caminho com pista, porque é uma ENTRADA, não um estado: subir
       * e descer de novo não remonta a cena, então não há nada para reapresentar. Os
       * `from` continuam pintando o estado inicial na hora (`immediateRender`), então
       * nada pisca antes do gatilho (com ou sem ele) — o `visibility: visible` acima
       * só tira a proteção do SSR.
       *
       * O ScrollTrigger, quando existe, nasce dentro do `matchMedia`, que é um
       * `gsap.context`: é morto junto com os tweens no `revert` (e no `kill` abaixo,
       * explícito).
       */
      const hasIntroTrack = introTrackRef?.current != null;

      const tl = gsap.timeline(
        hasIntroTrack
          ? {
              scrollTrigger: {
                trigger: containerRef.current,
                start: 'top top',
                once: true,
              },
            }
          : undefined,
      );

      // Animate menu
      if (menuRef.current) {
        tl.from(menuRef.current, {
          x: -100,
          opacity: 0,
          duration: 1,
          ease: 'power3.out',
        });
      }

      // Animate title with split text
      if (titleRef.current) {
        const titleChars = titleRef.current.querySelectorAll('.title-char');
        tl.from(
          titleChars,
          {
            y: 200,
            opacity: 0,
            duration: 1.5,
            stagger: 0.05,
            ease: 'power4.out',
          },
          '-=0.5',
        );
      }

      // Animate subtitle lines
      if (subtitleRef.current) {
        const subtitleLines = subtitleRef.current.querySelectorAll('.subtitle-line');
        tl.from(
          subtitleLines,
          {
            y: 50,
            opacity: 0,
            duration: 1,
            stagger: 0.2,
            ease: 'power3.out',
          },
          '-=0.8',
        );
      }

      // Animate scroll indicator
      if (scrollProgressRef.current) {
        tl.from(
          scrollProgressRef.current,
          {
            opacity: 0,
            y: 50,
            duration: 1,
            ease: 'power2.out',
          },
          '-=0.5',
        );
      }

      return () => {
        tl.scrollTrigger?.kill();
        tl.kill();
      };
    });

    return () => {
      matchMedia.revert();
    };
    // `introTrackRef` entra na lista só para documentar a leitura — a IDENTIDADE do
    // objeto de `ref` nunca muda entre renders (nasce uma vez em `App`, via
    // `useRef`), então isto não altera QUANDO o efeito roda.
  }, [isReady, introTrackRef]);

  // Scroll handling
  useEffect(() => {
    /**
     * Meio ato antes do fim da pista — ou seja, com o último ato já ocupando metade
     * da tela. Sem `finale` não existe ato para o qual ceder lugar, e o valor sai do
     * alcance de `progress` (que é grampeado em 1): o indicador nunca some.
     */
    const cueFadeAt = hasFinale ? 1 - 0.5 / totalSections : Number.POSITIVE_INFINITY;

    /**
     * Movimento reduzido não tem ato zero (§6.6): a vitrine acima nem escala as caixas
     * nesse modo — a pista dela encolhe para uma tela e a colagem fica parada —, então
     * um canvas "abrindo" dentro de um quadrinho que não abre seria movimento inventado
     * exatamente para quem pediu que não houvesse. A cena continua sendo a seção de
     * sempre, e o quadro central continua sendo o painel preto.
     */
    const calm = window.matchMedia('(prefers-reduced-motion: reduce)');

    /**
     * As duas alturas do ato zero, MEDIDAS FORA DO EVENTO DE ROLAGEM.
     *
     * As duas são declaradas em unidades de viewport (`300vh` a pista, `100svh` o
     * canvas), ou seja: não mudam com a rolagem, e no celular nem com a barra de
     * endereço. Lê-las a cada quadro só serviria para forçar layout logo depois de
     * escrever `transform` no canvas — o pior par possível dentro de um manipulador de
     * rolagem (§6.4). São remedidas no `resize`, junto com o resto.
     */
    let trackHeight = 0;
    let canvasHeight = 0;

    // O nó, capturado uma vez. Ele é sempre renderizado por este componente, então a
    // identidade não muda enquanto o efeito vive — e o cleanup precisa dele: ler
    // `canvasRef.current` lá é ler uma ref que o React já pode ter zerado.
    const canvas = canvasRef.current;

    const measure = (): void => {
      trackHeight = introTrackRef?.current?.offsetHeight ?? 0;
      canvasHeight = canvas?.offsetHeight ?? 0;
    };

    /**
     * ─── ATO ZERO: A CENA DENTRO DO QUADRO QUE DÁ ZOOM ───────────────────────────
     *
     * `top` é o topo desta seção em coordenadas da janela. Como a pista da vitrine
     * termina exatamente onde a seção começa, ele é o cronômetro do zoom inteiro:
     * vale `trackHeight` quando a pista encosta no topo da janela — E é também o
     * instante em que o painel preso da vitrine gruda no topo (`paneTop` vira 0) — e
     * vale `canvasHeight` quando o zoom termina (a caixa já preenche a tela inteira);
     * daí até 0 é só o painel deslizando para fora enquanto esta seção chega por
     * baixo dele, com a cena já parada em tela cheia.
     *
     * A transformação tem duas partes:
     *  · **escala** — de `INTRO_MIN_SCALE` a 1 conforme `top` anda de `trackHeight` a
     *    `canvasHeight` (ver o comentário de `opened`, no cálculo do denominador), em
     *    torno do centro do canvas, que é o centro da janela: o mesmo gesto do
     *    quadrinho, que é a janela a 25%.
     *  · **deslocamento** — o canvas ainda está lá embaixo, no fluxo desta seção;
     *    `-top` o traz para o topo da janela (é o que o `position: fixed` faria, sem
     *    tirar nada do fluxo). Antes de a vitrine grudar no topo, o quadro central
     *    ainda está subindo com ela, e aí o canvas segue o painel (`paneTop`) em vez
     *    da janela — senão a cena apareceria deslocada do próprio quadro.
     *
     * No fim da pista `top` é 0 e a escala é 1: a matriz vira a identidade e o
     * `sticky` do CSS assume no mesmo pixel. Não existe troca de elemento, então não
     * existe emenda para aparecer.
     */
    const updateIntro = (top: number): void => {
      if (canvas === null) return;

      const outsideIntro =
        trackHeight <= 0 ||
        canvasHeight <= 0 ||
        calm.matches ||
        // A cena já chegou: daqui em diante quem posiciona o canvas é o CSS.
        top <= 0 ||
        // A vitrine ainda está abaixo da janela — não há quadrinho em quadro.
        top - trackHeight >= canvasHeight;

      if (outsideIntro) {
        if (canvas.style.transform !== '') canvas.style.transform = '';
        return;
      }

      // O topo do painel preso da vitrine: ele mesmo, enquanto sobe; o topo da janela
      // depois que gruda.
      const paneTop = Math.max(top - trackHeight, 0);
      /**
       * ⚠ O DENOMINADOR É `trackHeight - canvasHeight`, NÃO `trackHeight` (defeito
       * relatado pelo Davi: o quadro sobrava — a cena ficava visivelmente menor que a
       * moldura no meio do zoom).
       *
       * A vitrine mede o PRÓPRIO zoom com `useScroll({ offset: ['start start', 'end
       * end'] })` — o framer-motion considera a pista "percorrida" quando o TOPO dela
       * alcança o topo da janela E, simetricamente, quando o FUNDO dela alcança o
       * fundo da janela. Como o painel preso mede uma tela inteira, essa segunda
       * marca chega depois de só `trackHeight − canvasHeight` de rolagem (200vh, não
       * 300vh) — a própria altura do painel não conta como percurso, porque ele já
       * está preso ali. Dividir por `trackHeight` fazia esta escala andar mais devagar
       * que a caixa de verdade: no meio do gesto a cena projetada estava atrasada,
       * sobrava moldura preta em volta dela — exatamente o relatado.
       *
       * Fora do intervalo em que o painel está preso (`canvasHeight >= trackHeight`,
       * geometria que não deveria ocorrer aqui — a pista tem 300vh, o painel 100svh —
       * mas guardada porque dividir por zero ou por negativo inverteria a escala), o
       * ato zero não é possível: cai fora por `outsideIntro` antes de chegar aqui.
       */
      const denom = trackHeight - canvasHeight;
      const opened = denom > 0 ? Math.min(Math.max((trackHeight - top) / denom, 0), 1) : 1;
      const scale = INTRO_MIN_SCALE + (1 - INTRO_MIN_SCALE) * opened;

      canvas.style.transform = `translateY(${String(paneTop - top)}px) scale(${String(scale)})`;
    };

    /**
     * ⚠ O ATO ZERO TREME SEM ISTO (relatado pelo Davi, 2026-08-31: "o zoom (...) fica
     * tremendo, não acontece de forma fluida").
     *
     * `updateIntro` escreve o `transform` do canvas DENTRO do próprio evento `scroll`
     * — síncrono, na hora. O framer-motion, que anima a ESCALA do quadrinho da
     * vitrine (o outro lado deste encaixe), não escreve assim: ele enfileira a
     * escrita no próprio agendador (`frame.render`), que só aplica no próximo quadro
     * de animação. Como os dois precisam ficar pixel a pixel um em cima do outro a
     * cada quadro, um escrevendo NA HORA e o outro um quadro DEPOIS produz um
     * descompasso constante — visível como tremor enquanto a rolagem é contínua
     * (Lenis interpolando a cada quadro).
     *
     * A correção é enfileirar a nossa escrita no MESMO tipo de fila — `rAF` — para
     * as duas convergirem no mesmo quadro de tela em vez de ficarem uma atrás da
     * outra. `pendingTop` guarda só o valor mais recente: se o evento `scroll`
     * disparar várias vezes antes do quadro seguinte (Lenis normalmente dispara uma
     * vez por quadro, mas nada garante isso em todo navegador), a versão antiga é
     * descartada — só a mais nova importa.
     */
    let introFrame: number | null = null;
    let pendingTop = 0;

    const flushIntro = (): void => {
      introFrame = null;
      updateIntro(pendingTop);
    };

    const scheduleIntro = (top: number): void => {
      pendingTop = top;
      if (introFrame !== null) return;
      introFrame = requestAnimationFrame(flushIntro);
    };

    const handleScroll = () => {
      /**
       * ⚠ AQUI ESTAVA O DEFEITO (corrigido em 2026-08-29).
       *
       * O original media a rolagem no DOCUMENTO INTEIRO
       * (`scrollY / (scrollHeight - innerHeight)`), o que só é a mesma coisa quando o
       * componente É a página — que era o caso do demo. No meio da LP da Metup, a
       * seção começa lá pelos 70% do site: ela entrava em quadro com `progress` já
       * perto de 1, e o próprio código joga as montanhas para `z = 600000` acima de
       * 0.7. Resultado: a cena abria SEM montanha nenhuma, só o clarão do bloom, e a
       * câmera já no fim do percurso.
       *
       * A conta agora é a mesma, só que da SEÇÃO: quanto já se rolou dentro dela,
       * dividido pela pista que ela tem (altura total menos uma tela). Fora dela o
       * valor é grampeado em 0 e 1, então a cena espera parada no primeiro quadro —
       * que é justamente o quadro que o zoom entrega em tela cheia.
       */
      const container = containerRef.current;
      if (container === null) return;

      const windowHeight = window.innerHeight;
      const maxScroll = Math.max(container.offsetHeight - windowHeight, 1);
      const containerTop = container.getBoundingClientRect().top;
      /**
       * ⚠ A ORIGEM É `canvasHeight`, NÃO 0, QUANDO HÁ UM ATO ZERO (defeito relatado
       * pelo Davi, 2026-08-31: "ao terminar de dar zoom, dá uma travada e a cena 3D
       * pula o início, (...) às vezes começa no cosmos e pula o horizonte").
       *
       * O zoom da vitrine TERMINA VISUALMENTE (a colagem inteira já está na escala
       * máxima) quando `top` chega em `canvasHeight` — uma tela ANTES do que este
       * manipulador considerava "zoom pronto" (`top <= 0`). A tela que sobra entre os
       * dois é mecânica pura do `position: sticky` da vitrine: o painel preso só
       * solta depois de rolar a PRÓPRIA altura, não porque haja mais alguma coisa
       * para animar (`updateIntro` já mantém a cena travada em tela cheia esse tempo
       * todo — ver o comentário lá). Com a origem em 0, essa tela inteira ficava como
       * rolagem "morta": a colagem já parada, o progresso ainda em 0, a câmera ainda
       * presa no Horizonte — quem continuava rolando (o gesto mais natural depois de
       * ver o zoom "terminar") sentia a página TRAVAR ali. E como o Lenis segue
       * acumulando a rolagem enquanto a pessoa insiste — a `lerp` não pausa só
       * porque o `progress` não está mudando —, no instante em que a tela morta
       * finalmente acaba o `scrollY` já avançou bastante de uma vez: o primeiro
       * quadro com progresso real podia cair bem depois do Horizonte, às vezes já no
       * Cosmos. Não era travamento de quadro nem race condition — era rolagem de
       * verdade sendo gasta num trecho que não movia nada.
       *
       * Deslocar a origem para `canvasHeight` faz a câmera começar a se mover no
       * EXATO instante em que a colagem para de crescer — sem tela morta no meio —,
       * e sem tocar em `updateIntro` (que continua prendendo o canvas em tela cheia
       * até `top` cruzar 0 de verdade, por um motivo diferente: aí é quando a
       * posição NATIVA do `sticky` assume, não quando a narrativa deveria começar).
       * `canvasHeight` só entra quando existe pista (`trackHeight > 0`); sem
       * `introTrackRef`, a seção continua contando a partir de 0, como sempre.
       */
      const introShift = trackHeight > 0 ? canvasHeight : 0;
      const scrollY = Math.min(Math.max(introShift - containerTop, 0), maxScroll);
      const progress = Math.min(scrollY / maxScroll, 1);

      // O ato zero (o canvas dentro do quadrinho da vitrine) reaproveita o MESMO
      // `containerTop` já lido acima: as leituras de layout do manipulador ficam todas
      // no topo, e daqui para baixo ele só escreve — nunca uma leitura depois de uma
      // escrita, que é reflow forçado a cada quadro de rolagem (§6.4). A escrita em si
      // é agendada para o próximo `rAF` — ver `scheduleIntro`, logo abaixo.
      scheduleIntro(containerTop);

      const newSection = Math.floor(progress * totalSections);

      /**
       * O CROMO DO INDICADOR, ESCRITO NO DOM (ver o ponto 12 do cabeçalho).
       *
       * `scaleX` e não `width`: largura é layout e custaria reflow a cada quadro de
       * rolagem (§6.4). A origem à esquerda está no CSS, não aqui — o GSAP nunca toca
       * neste nó, então a transformação é só esta linha.
       */
      const fill = progressFillRef.current;
      if (fill !== null) fill.style.transform = `scaleX(${String(progress)})`;

      const counter = sectionCounterRef.current;
      if (counter !== null) counter.textContent = formatCounter(newSection, totalSections);

      /**
       * O indicador cede lugar quando o último ato entra em quadro.
       *
       * `cueFadeAt` é meio ato antes do fim: nesse ponto o finale já ocupa metade da
       * tela e "SCROLL" passa a ser uma instrução errada — abaixo dele não há mais
       * pista, há o CTA. Deixar os dois competindo pelo mesmo canto é exatamente o
       * "espetáculo enterrando o CTA" que o §3 proíbe.
       */
      const cue = scrollCueRef.current;
      if (cue !== null) cue.dataset.done = progress > cueFadeAt ? 'true' : 'false';

      const { current: refs } = threeRefs;
      const { nebula, locations } = refs;
      if (nebula === null || locations === undefined || refs.mountains.length < 4) return;

      // Calculate smooth progress through all sections
      const totalProgress = progress * totalSections;
      const sectionProgress = totalProgress % 1;

      // Get current and next positions — a decupagem está em `CAMERA_ACTS`, no topo.
      const currentPos = CAMERA_ACTS[newSection] || CAMERA_ACTS[0];
      const nextPos = CAMERA_ACTS[newSection + 1] || currentPos;

      // Set target positions (actual smoothing happens in animate loop)
      refs.targetCameraX = currentPos.x + (nextPos.x - currentPos.x) * sectionProgress;
      refs.targetCameraY = currentPos.y + (nextPos.y - currentPos.y) * sectionProgress;
      refs.targetCameraZ = currentPos.z + (nextPos.z - currentPos.z) * sectionProgress;
      // Smooth parallax for mountains
      refs.mountains.forEach((mountain, i) => {
        const speed = 1 + i * 0.9;
        const baseZ = mountain.userData.baseZ as number;
        const targetZ = baseZ + scrollY * speed * 0.5;
        nebula.position.z = targetZ + progress * speed * 0.01 - 100;

        // Use the same smoothing approach
        // O corte é medido em ATOS, não na fração da pista — ver `CLEAR_AT_ACT`.
        mountain.userData.targetZ = targetZ;
        if (totalProgress > CLEAR_AT_ACT) {
          mountain.position.z = 600000;
        } else {
          mountain.position.z = locations[i];
        }
      });
      nebula.position.z = refs.mountains[3].position.z;
    };

    /**
     * `resize` mede de novo e reposiciona na mesma passada. As duas alturas do ato
     * zero são as únicas coisas que uma mudança de janela invalida aqui — e sem
     * remedir, o canvas ficaria projetado com a geometria da janela anterior (visível
     * ao girar o telefone no meio do zoom).
     */
    const handleViewportChange = (): void => {
      measure();
      handleScroll();
    };

    measure();

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleViewportChange);
    handleScroll(); // Set initial position

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleViewportChange);
      if (introFrame !== null) cancelAnimationFrame(introFrame);
      // A cena sai daqui posicionada pelo CSS, e não pela transformação do ato zero:
      // sem isto, uma remontagem (hot reload, troca de props) herdaria o canvas
      // congelado a 25% no meio da tela.
      if (canvas !== null) canvas.style.transform = '';
    };
  }, [totalSections, hasFinale, introTrackRef]);

  const splitTitle = (text: string) => {
    return text.split('').map((char, i) => (
      <span key={i} className="title-char">
        {char}
      </span>
    ));
  };

  return (
    <div ref={containerRef} className="hero-container cosmos-style">
      {/* ⚠ O `transform` deste canvas é ESCRITO PELO MANIPULADOR DE ROLAGEM enquanto o
          zoom da vitrine abre (ver `ComponentProps.introTrackRef`). Não ponha
          `transform` de CSS em `.hero-canvas`: a matriz inteira é reescrita a cada
          quadro e ele seria apagado — o mesmo tombo que o cabeçalho de
          `styles/horizon-hero.css` registra para o GSAP. */}
      <canvas ref={canvasRef} className="hero-canvas" />

      {/* Side menu */}
      <div ref={menuRef} className="side-menu" style={{ visibility: 'hidden' }}>
        <div className="menu-icon">
          <span></span>
          <span></span>
          <span></span>
        </div>
        <div className="vertical-text">SPACE</div>
      </div>

      {/* Main content */}
      <div className="hero-content cosmos-content">
        <h2 ref={titleRef} className="hero-title">
          {splitTitle('HORIZONTE')}
        </h2>

        <div ref={subtitleRef} className="hero-subtitle cosmos-subtitle">
          <p className="subtitle-line">Você enxerga mais longe.</p>
        </div>
      </div>

      {/* Scroll progress indicator.
          ⚠ DOIS NÓS, e não um (2026-08-31). O de FORA é o que gruda no rodapé da
          janela e o que some no último ato (`data-done`, escrito pelo manipulador de
          rolagem). O de DENTRO é o que o GSAP anima na entrada — e um `gsap.from`
          deixa `opacity` inline no elemento, que venceria qualquer classe tentando
          apagá-lo. Separando os dois, cada um mexe no seu, e o fade do fim não briga
          com a entrada. */}
      <div ref={scrollCueRef} className="scroll-progress">
        <div
          ref={scrollProgressRef}
          className="scroll-progress__row"
          style={{ visibility: 'hidden' }}
        >
          <div className="scroll-text">SCROLL</div>
          <div className="progress-track">
            <div ref={progressFillRef} className="progress-fill" />
          </div>
          <div ref={sectionCounterRef} className="section-counter">
            {formatCounter(0, totalSections)}
          </div>
        </div>
      </div>

      {/* Additional sections for scrolling */}
      <div className="scroll-sections">
        {[...Array(2)].map((_, i) => {
          /**
           * COPY DO DAVI (2026-08-29) — escrita por ele, substituiu tanto o texto do
           * demo quanto a proposta do Claude que estava aqui (a proposta continua em
           * `content/sugestoes.md`, marcada como superada).
           *
           * São TRÊS TEMPOS, um por posição de câmera, e é a ordem que faz o argumento:
           *  · HORIZONTE (câmera longe)      → "Você enxerga mais longe."
           *  · COSMOS    (atravessando)      → "Mas enxergar não basta."
           *  · INFINITO  (acima de tudo)     → "É preciso construir para chegar lá."
           * A Metup nunca se anuncia; quem constrói é a resposta implícita da terceira.
           *
           * Uma linha por ato — por isso o mapa é `Record<number, string>` e não mais
           * um par `line1`/`line2` como vinha do demo.
           *
           * ⚠ Isto ainda mora DENTRO do componente. O §9 manda a seção ler de
           * `content/`: quando esta cena deixar de ser provisória, o texto vai para
           * `content/copy.md`. Registrado em PENDENCIAS.md.
           */
          const titles: Record<number, string> = {
            0: 'HORIZONTE',
            1: 'COSMOS',
            2: 'INFINITO',
          };

          const lines: Record<number, string> = {
            0: 'Você enxerga mais longe.',
            1: 'Mas enxergar não basta.',
            2: 'É preciso construir para chegar lá.',
          };

          return (
            <section key={i} className="content-section">
              <h2 className="hero-title">{titles[i + 1] || 'DEFAULT'}</h2>

              <div className="hero-subtitle cosmos-subtitle">
                <p className="subtitle-line">{lines[i + 1]}</p>
              </div>
            </section>
          );
        })}
      </div>

      {/* O QUARTO ATO. Último filho do container de propósito: é o que mantém o
          `<canvas>` preso atrás dele até o fim da cena. Ver `ComponentProps.finale`. */}
      {finale}
    </div>
  );
};
