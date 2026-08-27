/**
 * Ponte entre `content/copy.md` e a aplicação.
 *
 * A copy NUNCA é escrita em componente (CLAUDE.md §9): as seções importam `copy`
 * daqui. Este módulo é a única coisa que conhece o Vite (`?raw`) — o parsing em si
 * mora em `content-parser.ts`, puro e reutilizável.
 *
 * Se o markdown estiver incompleto, o `throw` abaixo roda na avaliação do módulo.
 * O builder do vite-react-ssg faz `await import(entry)` sem try/catch, então o
 * build inteiro falha com a lista de chaves ausentes — em vez de publicar uma LP
 * com seção vazia.
 */
import rawCopy from '../../content/copy.md?raw';
import { formatMissing, parseCopy } from './content-parser';

const result = parseCopy(rawCopy);

if (result.missing.length > 0) {
  throw new Error(formatMissing(result.missing));
}

export const copy = result.copy;

export type {
  CopyField,
  CopyPlaceholder,
  CopyText,
  ServiceCopy,
  SiteCopy,
} from './content-parser';
