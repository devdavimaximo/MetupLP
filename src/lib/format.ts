/**
 * Formatação de apresentação — funções puras, sem React e sem DOM.
 *
 * O que mora aqui é derivação de FORMA a partir do conteúdo real: numeração de
 * índice, recorte de trecho para destaque. Nada aqui inventa texto (§4) — tudo
 * recebe o que veio de `content/` e devolve o mesmo conteúdo em outra forma.
 */

/**
 * Dois dígitos com zero à esquerda ("01", "02"…) é decisão de direção de arte, não
 * capricho: a coluna do índice é mono e alinhada, e "1"/"10" com larguras diferentes
 * quebrariam o alinhamento vertical que faz a seção ler como um sumário. F4 numera os
 * cases com a mesma régua.
 *
 * Não é copy: é ordem, e a ordem vem da estrutura do conteúdo, não de texto escrito
 * por ninguém (§4).
 */
export function padIndex(position: number): string {
  return String(position).padStart(2, '0');
}

export interface TextSegment {
  readonly text: string;
  /** `true` no trecho que deve receber a cor de destaque. */
  readonly accent: boolean;
}

/**
 * Recorta `text` em volta da PRIMEIRA ocorrência de `accent`.
 *
 * Serve à headline do herói, onde uma palavra brilha em dourado (a palavra vem de
 * `**Destaque:**` no `copy.md`, nunca de código). Devolve sempre pelo menos um
 * segmento, então o consumidor não precisa de caminho alternativo.
 *
 * ─── DEGRADA PARA O TEXTO INTEIRO ───────────────────────────────────────────────
 * Se `accent` for vazio, indefinido ou simplesmente não existir dentro de `text`, o
 * resultado é um segmento só, sem destaque. É o comportamento que se quer: o Davi
 * reescrever a headline e esquecer de atualizar o `**Destaque:**` deve tirar o
 * brilho, não quebrar o título nem o build.
 *
 * Segmentos vazios são descartados — com o destaque no começo ou no fim da frase,
 * um `<span>` vazio no meio do `<h1>` só daria trabalho ao SplitText.
 */
export function accentSegments(text: string, accent?: string): readonly TextSegment[] {
  const needle = accent?.trim() ?? '';
  const at = needle === '' ? -1 : text.indexOf(needle);

  if (at === -1) return [{ text, accent: false }];

  return [
    { text: text.slice(0, at), accent: false },
    { text: needle, accent: true },
    { text: text.slice(at + needle.length), accent: false },
  ].filter((segment) => segment.text !== '');
}
