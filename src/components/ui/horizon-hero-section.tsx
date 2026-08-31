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

 * ⚠ CONFLITOS DECLARADOS, registrados em PENDENCIAS.md e NÃO resolvidos aqui porque
 * resolvê-los seria redesenhar o componente:
 *  · **é um segundo contexto WebGL** — o herói da Metup já tem o seu;
 *  · o `rAF` roda sempre, mesmo com a seção fora de quadro.
 */
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useEffect, useRef, useState } from 'react';
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
  /** `position.z` original de cada cordilheira, para o retorno depois de 70%. */
  locations?: number[];
}

export interface ComponentProps {
  /**
   * Modo "dentro do slot do zoom" (pedido do Davi, 2026-08-29).
   *
   * A cena nasce, desenha UM quadro e para: sem `requestAnimationFrame`, sem ouvir a
   * rolagem, sem a entrada em GSAP e sem o conteúdo (título, menu, indicador, seções).
   * É a cena TRAVADA que o quadrinho do zoom carrega enquanto abre — e é o que faz a
   * seção de baixo parecer a mesma cena "começando" quando o zoom termina.
   *
   * O quadrinho do zoom tem exatamente a proporção da janela (25vw × 25vh) e chega a
   * 100% dela na escala 4, então o quadro congelado cresce até tela cheia sem
   * distorcer e sem corte.
   */
  frozen?: boolean;
}

export const Component = ({ frozen = false }: ComponentProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLDivElement>(null);
  const scrollProgressRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const smoothCameraPos = useRef({ x: 0, y: 30, z: 100 });

  const [scrollProgress, setScrollProgress] = useState(0);
  const [currentSection, setCurrentSection] = useState(1);
  const [isReady, setIsReady] = useState(false);
  const totalSections = 2;

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

      // Start animation
      if (frozen) {
        // UM quadro e para. Ver `ComponentProps.frozen`.
        refs.composer?.render();
      } else {
        animate();
      }

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
        const smoothingFactor = 0.05; // Lower = smoother but slower

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

    initThree();

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
        // Redimensionar invalida o buffer. Sem `rAF` para redesenhar, o quadro
        // congelado sumiria — então ele é refeito aqui.
        if (frozen) {
          refs.composer.render();
        }
      }
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      const { current: refs } = threeRefs;

      if (refs.animationId) {
        cancelAnimationFrame(refs.animationId);
      }

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
    };
  }, [frozen]);

  // GSAP Animations - Run after component is ready
  useEffect(() => {
    // No modo congelado não existe nenhum destes elementos para animar.
    if (!isReady || frozen) return;

    // Set initial states to prevent flash
    gsap.set([menuRef.current, titleRef.current, subtitleRef.current, scrollProgressRef.current], {
      visibility: 'visible',
    });

    // `matchMedia` em vez de uma timeline solta: é o que dá a variante calma exigida
    // pelo §6.6 e é o que limpa tudo (tweens e estilos inline) no `revert`.
    const matchMedia = gsap.matchMedia();

    matchMedia.add('(prefers-reduced-motion: no-preference)', () => {
      const tl = gsap.timeline();

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
        tl.kill();
      };
    });

    return () => {
      matchMedia.revert();
    };
  }, [isReady, frozen]);

  // Scroll handling
  useEffect(() => {
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
      const scrollY = Math.min(Math.max(-container.getBoundingClientRect().top, 0), maxScroll);
      const progress = Math.min(scrollY / maxScroll, 1);

      setScrollProgress(progress);
      const newSection = Math.floor(progress * totalSections);
      setCurrentSection(newSection);

      const { current: refs } = threeRefs;
      const { nebula, locations } = refs;
      if (nebula === null || locations === undefined || refs.mountains.length < 4) return;

      // Calculate smooth progress through all sections
      const totalProgress = progress * totalSections;
      const sectionProgress = totalProgress % 1;

      // Define camera positions for each section
      const cameraPositions = [
        { x: 0, y: 30, z: 300 }, // Ato 0 - HORIZONTE (a montanha ao longe)
        { x: 0, y: 40, z: -50 }, // Ato 1 - TRAVESSIA (atravessando as cordilheiras)
        { x: 0, y: 50, z: -700 }, // Ato 2 - ALTITUDE (acima de tudo, a tela vira)
      ];

      // Get current and next positions
      const currentPos = cameraPositions[newSection] || cameraPositions[0];
      const nextPos = cameraPositions[newSection + 1] || currentPos;

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
        mountain.userData.targetZ = targetZ;
        if (progress > 0.7) {
          mountain.position.z = 600000;
        }
        if (progress < 0.7) {
          mountain.position.z = locations[i];
        }
      });
      nebula.position.z = refs.mountains[3].position.z;
    };

    // TRAVADA: no modo congelado a cena não ouve a rolagem — é o quadro parado que o
    // quadrinho do zoom carrega enquanto abre.
    if (frozen) return;

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Set initial position

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [totalSections, frozen]);

  const splitTitle = (text: string) => {
    return text.split('').map((char, i) => (
      <span key={i} className="title-char">
        {char}
      </span>
    ));
  };

  // Dentro do slot do zoom só a CENA existe: o título, o menu, o indicador e as duas
  // seções de rolagem são conteúdo de leitura, e num quadrinho de 25vw eles seriam
  // ilegíveis — além de repetirem, letra por letra, o que a seção de baixo diz.
  if (frozen) {
    return (
      <div ref={containerRef} className="hero-container cosmos-style hero-container--frozen">
        <canvas ref={canvasRef} className="hero-canvas" />
      </div>
    );
  }

  return (
    <div ref={containerRef} className="hero-container cosmos-style">
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

      {/* Scroll progress indicator */}
      <div ref={scrollProgressRef} className="scroll-progress" style={{ visibility: 'hidden' }}>
        <div className="scroll-text">SCROLL</div>
        <div className="progress-track">
          <div className="progress-fill" style={{ width: `${String(scrollProgress * 100)}%` }} />
        </div>
        <div className="section-counter">
          {String(currentSection).padStart(2, '0')} / {String(totalSections).padStart(2, '0')}
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
    </div>
  );
};
