import { vec3 } from 'three/tsl';
import { Color } from 'three/webgpu';

/**
 * Hex de `tokens.css` → nó `vec3` no espaço LINEAR.
 *
 * O shader trabalha em linear e o design system fala em sRGB. `THREE.Color` faz a
 * conversão no construtor (r152+), então o valor de marca continua legível no código
 * — a alternativa seria hardcodar `vec3(1.0, 0.2543, 0.0137)` e ninguém mais
 * conseguir conferir que aquilo é o `--color-accent`.
 *
 * O retorno é INFERIDO de propósito. `vec3` é sobrecarregada e cada assinatura
 * devolve um tipo de nó diferente (`JoinNode`, `ConstNode`…); anotar à mão obriga a
 * escolher uma sobrecarga que pode não ser a que a chamada resolve, e o resultado é
 * um erro de tipo que não descreve bug nenhum. O grafo TSL é o dono desses tipos.
 */
export function linearColor(hex: string) {
  const { r, g, b } = new Color(hex);
  return vec3(r, g, b);
}
