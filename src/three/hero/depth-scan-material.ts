/**
 * O grafo TSL da cena — o coração do efeito.
 *
 * ─── A IDEIA EM UMA FRASE ───────────────────────────────────────────────────────
 * Um mapa de profundidade transforma uma imagem plana em volume, e a cena usa esse
 * volume duas vezes: para deslocar a arte conforme o ponteiro (parallax) e para
 * acender, quadro a quadro, só a fatia de pontos que está NAQUELA profundidade. O
 * resultado lê como um instrumento varrendo um objeto — a forma aparece por dentro,
 * fatia por fatia, em vez de estar simplesmente desenhada na tela.
 *
 * ─── POR QUE TSL, E NÃO GLSL ────────────────────────────────────────────────────
 * O mesmo grafo compila para WGSL (WebGPU) e para GLSL (WebGL2). Como o
 * `WebGPURenderer` cai sozinho para WebGL2 onde não há WebGPU (Safari/Firefox mais
 * antigos), escrever em TSL é o que faz a cena existir nos dois caminhos sem um
 * segundo shader para manter.
 *
 * ─── ORÇAMENTO ──────────────────────────────────────────────────────────────────
 * Um `<mesh>`, um `planeGeometry`, duas texturas, zero luz e zero sombra. O custo é
 * de fragment shader num quad — previsível e escalável pelo `dpr`, ao contrário de
 * uma cena com geometria de verdade.
 */
import {
  abs,
  blendScreen,
  float,
  mod,
  mx_cell_noise_float,
  oneMinus,
  smoothstep,
  texture,
  uv,
  vec2,
} from 'three/tsl';
import {
  AdditiveBlending,
  MeshBasicNodeMaterial,
  NoColorSpace,
  SRGBColorSpace,
  type Texture,
} from 'three/webgpu';
import { SCENE, SCENE_COLOR, SOURCE } from './config';
import type { SceneState } from './scene-state';
import { linearColor } from './tsl-color';

export function createDepthScanMaterial(
  colorMap: Texture,
  depthMap: Texture,
  state: SceneState,
): MeshBasicNodeMaterial {
  /**
   * ESPAÇO DE COR — a distinção que decide se o efeito funciona.
   *
   * `scene-color` é ARTE: precisa de `SRGBColorSpace` para ser decodificada e
   * chegar ao shader em linear, senão os meios-tons saem lavados.
   *
   * `scene-depth` é DADO: o valor do pixel É a profundidade. Decodificá-la como
   * sRGB aplicaria uma curva de gama a um número que não é cor — a varredura
   * passaria a acelerar e frear pela faixa em vez de subir constante. `NoColorSpace`
   * é obrigatório aqui, não preferência.
   */
  colorMap.colorSpace = SRGBColorSpace;
  depthMap.colorSpace = NoColorSpace;

  const depthSample = texture(depthMap);
  const depth = depthSample.r;

  // ─── 1. Parallax ──────────────────────────────────────────────────────────────
  // O que está "mais perto" (profundidade alta) desliza mais do que o fundo. É o que
  // dá volume à cena sem nenhuma geometria 3D de verdade.
  const parallax = depth.mul(state.pointer).mul(SCENE.parallax);
  const art = texture(colorMap, uv().add(parallax));

  // ─── 2. Malha de pontos ───────────────────────────────────────────────────────
  // A UV é corrigida pelo aspecto ANTES de ser ladrilhada; sem isso os pontos saem
  // elípticos em qualquer textura que não seja quadrada.
  const aspect = float(SOURCE.width).div(SOURCE.height);
  const grid = vec2(uv().x.mul(aspect), uv().y).mul(vec2(SCENE.tiling));

  // `mod(…, 2) - 1` leva cada célula para o intervalo [-1, 1], com o centro no zero:
  // a distância até esse centro é o que desenha o ponto redondo.
  const cell = mod(grid, 2).sub(1);
  const dot = float(smoothstep(0.5, 0.49, cell.length()));

  // Ruído celular por ponto — cada um acende com um brilho próprio. É o detalhe que
  // separa "malha de pontos" de "constelação": sem ele a grade lê como tela de TV.
  const twinkle = mx_cell_noise_float(grid.div(2));

  // ─── 3. Varredura por profundidade ────────────────────────────────────────────
  // Só a fatia cuja profundidade bate com `scan` acende. `scan` vai e volta entre 0 e
  // 1, então a fatia sobe e desce pelo volume da forma.
  const slice = oneMinus(smoothstep(0, SCENE.scanBand, abs(depth.sub(state.scan))));
  const spark = dot.mul(twinkle).mul(slice).mul(linearColor(SCENE_COLOR.spark)).mul(SCENE.sparkGain);

  // ─── 4. Composição ────────────────────────────────────────────────────────────
  // O ganho do corpo é calibrado por CONTRASTE, não só por estética — a conta real
  // (não estimada) está em `SCENE.bodyGain`. `blendScreen` faz os pontos somarem luz
  // sem estourar a forma, que é como fósforo se comporta.
  const body = art.rgb.mul(linearColor(SCENE_COLOR.body)).mul(SCENE.bodyGain);

  const material = new MeshBasicNodeMaterial();
  material.colorNode = blendScreen(body, spark);

  // Aditivo: o preto da arte (e a área transparente em volta dela) simplesmente não
  // soma nada e some no fundo da página. Sem isto o plano seria um retângulo visível.
  material.blending = AdditiveBlending;
  material.transparent = true;
  // Plano único: não há nada para ordenar, e escrever profundidade só custaria banda.
  material.depthWrite = false;
  material.toneMapped = false;

  return material;
}
