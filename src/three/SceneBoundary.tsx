import { Component, type ErrorInfo, type ReactNode } from 'react';

export interface SceneBoundaryProps {
  readonly children: ReactNode;
  /**
   * O que sobra quando a cena cai — por padrão, nada.
   *
   * ─── POR QUE ISTO PRECISOU EXISTIR (2026-08-31) ───────────────────────────────
   * Enquanto a fronteira só embrulhava cenário, `null` era a resposta certa: some o
   * efeito, fica a página. Deixou de ser quando o CTA FINAL passou a morar dentro da
   * cena Horizon (o quarto ato — ver `sections/HorizonFinale`). A partir dali,
   * devolver `null` numa falha de WebGL apagaria junto o último CTA da página E a
   * âncora `#contato`, que é o destino do CTA do herói e do item "Contato" do header
   * — os dois viram link para lugar nenhum. Um driver velho passaria a custar o lead
   * (§3), que é precisamente o que esta classe existe para impedir.
   *
   * Então quem embrulha conteúdo de conversão passa o mesmo conteúdo aqui, na versão
   * que não depende da cena. Continua valendo a regra: degrada o EFEITO, nunca o
   * conteúdo.
   */
  readonly fallback?: ReactNode;
}

interface SceneBoundaryState {
  readonly failed: boolean;
}

/**
 * Rede de segurança de toda cena 3D do projeto.
 *
 * ─── POR QUE ISTO NÃO É OPCIONAL ────────────────────────────────────────────────
 * A cena mora na PRIMEIRA DOBRA. Um erro não capturado ali — driver antigo, WebGPU
 * meio implementado, `init()` que rejeita, contexto perdido durante a montagem —
 * desmonta a árvore inteira do React: a pessoa fica com a página em branco, e o §3
 * vira letra morta porque não sobrou CTA para clicar. Um espetáculo que pode apagar
 * o site não é espetáculo, é risco de conversão.
 *
 * Com a fronteira, o pior caso é a cena não aparecer: o herói continua com o fundo
 * estático em CSS, com o título, com a copy e com o botão. Degrada o EFEITO, nunca o
 * conteúdo — a mesma regra do carregamento adaptativo em `lib/capability.ts`.
 *
 * É `class` porque não existe equivalente em hook: `getDerivedStateFromError` só
 * existe em componente de classe. É a única do projeto, e é por isso.
 */
export class SceneBoundary extends Component<SceneBoundaryProps, SceneBoundaryState> {
  override state: SceneBoundaryState = { failed: false };

  static getDerivedStateFromError(): SceneBoundaryState {
    return { failed: true };
  }

  override componentDidCatch(error: Error, info: ErrorInfo): void {
    // Silencioso em produção: quem visita não pode nada com este erro, e a página já
    // se recuperou sozinha. Em dev é barulhento, porque aí alguém pode consertar.
    if (import.meta.env.DEV) console.error('[three] cena falhou ao montar', error, info);
  }

  override render(): ReactNode {
    return this.state.failed ? (this.props.fallback ?? null) : this.props.children;
  }
}
