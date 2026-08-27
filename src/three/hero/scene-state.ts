/**
 * Estado vivo da cena — o que muda a cada quadro.
 *
 * ─── POR QUE ISTO É UM OBJETO, E NÃO ESTADO DO REACT ─────────────────────────────
 * `useInView` já registra a fronteira (ver o comentário lá): animar por estado do
 * React re-renderiza a árvore a cada quadro e derruba os 60fps do §6.2. Aqui os
 * valores vivem em uniforms do TSL, que a GPU lê direto — o React monta a cena uma
 * vez e nunca mais re-renderiza por causa dela.
 *
 * ─── POR QUE COMPARTILHADO ──────────────────────────────────────────────────────
 * `scan` é lido em DOIS lugares: pelo material (que acende os pontos na profundidade
 * correspondente) e pelo pipeline de pós-processamento (que varre a tela). Se cada um
 * calculasse o próprio `sin(t)`, os dois sairiam de fase no primeiro quadro perdido e
 * o efeito deixaria de ler como "um instrumento varrendo a cena". Um uniform só,
 * escrito num lugar só (`ScanClock`).
 *
 * O tipo é INFERIDO da fábrica de propósito: os tipos de nó do TSL são genéricos
 * profundos e reescrevê-los à mão aqui só criaria uma segunda verdade para divergir.
 */
import { uniform } from 'three/tsl';
import { Vector2 } from 'three/webgpu';

export function createSceneState() {
  return {
    /** Progresso da varredura, 0→1→0. Escrito por `ScanClock`. */
    scan: uniform(0),
    /** Ponteiro normalizado (-1..1), já amortecido — é este que o shader lê. */
    pointer: uniform(new Vector2(0, 0)),
    /**
     * Para onde o ponteiro está indo. Vetor cru, fora do TSL: quem escreve é o
     * listener de `pointermove` (que roda fora do canvas), e quem persegue é o
     * `ScanClock`. Sem esse par, o parallax saltaria a cada evento em vez de deslizar.
     */
    pointerTarget: new Vector2(0, 0),
  };
}

export type SceneState = ReturnType<typeof createSceneState>;
