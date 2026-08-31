import { cn } from '../lib/cn';

export interface FieldProps {
  /** `id` do controle. Vem de fora (de um `useId`) para quem valida saber focar. */
  readonly id: string;
  /** `name` do controle — é o que um serviço de formulário lê. */
  readonly name: string;
  readonly label: string;
  /** Instrução curta abaixo do rótulo. Ligada ao controle por `aria-describedby`. */
  readonly hint?: string;
  /** Mensagem de erro. Presente = campo inválido, e a cor muda junto. */
  readonly error?: string;
  readonly value: string;
  readonly onChange: (value: string) => void;
  readonly onFocus?: () => void;
  /** `true` vira `<textarea>`. */
  readonly multiline?: boolean;
  readonly rows?: number;
  readonly autoComplete?: string;
  readonly inputMode?: 'text' | 'email' | 'tel';
  readonly disabled?: boolean;
}

/**
 * Campo de formulário do design system — rótulo, controle, dica e erro num nó só.
 *
 * ─── POR QUE ELE EXISTE COMO COMPONENTE ─────────────────────────────────────────
 * Não é para "reaproveitar markup": é para que a fiação de acessibilidade não dependa
 * de ninguém lembrar dela. Um campo montado à mão erra sempre nos mesmos três pontos
 * — o `<label>` desconectado do controle, a dica invisível para leitor de tela, e o
 * erro anunciado como texto solto no meio da página. Aqui os três são estruturais:
 * `htmlFor`/`id` sempre casam, e `aria-describedby` é MONTADO a partir do que existe
 * (dica, erro ou os dois), nunca digitado.
 *
 * ─── `aria-invalid` E NÃO `required` ────────────────────────────────────────────
 * O controle não leva `required`. Validação nativa abre o balãozinho do navegador —
 * que não é estilizável, não respeita o idioma da página em alguns casos e aparece
 * ANTES do nosso próprio erro, dando duas mensagens diferentes para o mesmo campo. O
 * formulário roda com `noValidate` e a validação é nossa (ver `lib/lead-form.ts`);
 * o que sobra para o leitor de tela é `aria-invalid` + a mensagem no `describedby`.
 *
 * ─── COR NUNCA É O ÚNICO SINAL ──────────────────────────────────────────────────
 * O estado de erro muda o filete E acrescenta a frase (WCAG 1.4.1). Quem não
 * distingue vermelho continua tendo o texto.
 *
 * O desenho — filete embaixo, sem caixa, dourado no foco — está em
 * `styles/lead-form.css`, junto do porquê.
 */
export function Field({
  id,
  name,
  label,
  hint,
  error,
  value,
  onChange,
  onFocus,
  multiline = false,
  rows = 4,
  autoComplete,
  inputMode,
  disabled = false,
}: FieldProps) {
  const hintId = `${id}-dica`;
  const errorId = `${id}-erro`;

  // Montado, não digitado: some sozinho quando não há nada para descrever, e o
  // `undefined` evita um `aria-describedby=""` apontando para o nada.
  const describedBy = [hint === undefined ? null : hintId, error === undefined ? null : errorId]
    .filter((token): token is string => token !== null)
    .join(' ');

  const controlProps = {
    id,
    name,
    value,
    disabled,
    autoComplete,
    'aria-invalid': error === undefined ? undefined : true,
    'aria-describedby': describedBy === '' ? undefined : describedBy,
    className: cn('lead-field__control', multiline && 'lead-field__control--multiline'),
    onFocus,
    onChange: (event: { target: { value: string } }) => {
      onChange(event.target.value);
    },
  } as const;

  return (
    <div className="lead-field">
      <label className="lead-field__label" htmlFor={id}>
        {label}
      </label>

      {multiline ? (
        <textarea {...controlProps} rows={rows} />
      ) : (
        <input {...controlProps} type="text" inputMode={inputMode} />
      )}

      {/* ⚠ A DICA VEM DEPOIS DO CONTROLE, e é uma decisão de LAYOUT, não de leitura.
          Entre o rótulo e o controle, um campo com dica empurra o próprio controle
          para baixo — e dois campos lado a lado (nome e contato, ver `LeadForm`)
          deixam de compartilhar a linha de base, o que lê como desalinho. Depois do
          controle, todo campo da fileira tem rótulo e controle na mesma altura,
          tenha dica ou não. Para leitor de tela a ordem do DOM não muda nada: a dica
          chega pelo `aria-describedby`, junto do controle, onde quer que ela esteja. */}
      {hint !== undefined && (
        <p className="lead-field__hint" id={hintId}>
          {hint}
        </p>
      )}

      {/* Ocupa espaço só quando existe: sem `min-height` reservado, para o formulário
          não nascer com quatro faixas de ar esperando erro que talvez não venha. */}
      {error !== undefined && (
        <p className="lead-field__error" id={errorId}>
          {error}
        </p>
      )}
    </div>
  );
}
