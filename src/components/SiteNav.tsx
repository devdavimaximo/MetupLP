import { HEADER_HOOK } from '../animations/header';
import { cn } from '../lib/cn';
import { padIndex } from '../lib/format';
import { navItems } from '../lib/nav';
import { uiStrings } from '../lib/ui-strings';

export interface SiteNavProps {
  readonly className?: string;
}

/**
 * Navegação de seções do header.
 *
 * ─── É UM ÍNDICE, E ELE SE PARECE COM OS OUTROS ÍNDICES DA PÁGINA ───────────────
 * Serviços numera os itens ("01 — 04"), o Processo numera os passos, e a numeração
 * mono é a assinatura de "sumário" da direção de arte. A barra usa a MESMA régua
 * (`padIndex`, o mesmo `--text-label` mono em caixa alta) porque ela é literalmente o
 * sumário da página. Uma nav com rótulos soltos em Work Sans seria a barra de
 * qualquer site; esta é a barra deste site.
 *
 * Os números só aparecem de `lg` (1024px) para cima — ver a conta de largura em
 * `styles/header.css`. Entre 768px e 1024px o espaço é do rótulo, que é o que
 * importa; o número é o ornamento e é ele que cede.
 *
 * ─── O INDICADOR É UM NÓ SÓ, E DESLIZA ──────────────────────────────────────────
 * Um filete dourado que corre pela costura de baixo do header e para embaixo da seção
 * em que o leitor está. É um `<span>` único, movido por `x` + `scaleX` (o mesmo truque
 * do `drawLine`: escala em vez de largura, para ficar no compositor e não custar
 * reflow) — nunca uma borda ligada e desligada em cada item, que repintaria o texto
 * junto. Quem o move é `animations/header.ts`.
 *
 * ─── ESTADO SEM RE-RENDER ───────────────────────────────────────────────────────
 * Nenhum `useState` de seção ativa: o ScrollTrigger escreve `aria-current="location"`
 * direto no `<a>` e o CSS reage. É a mesma decisão do `data-scrolled` — a página rola
 * o tempo todo, e um estado de React aqui viraria uma árvore reconciliada por quadro
 * (§6.2). Como o atributo escrito é `aria-current`, o leitor de tela ganha a mesma
 * informação que a cor dá para quem enxerga: a cor NÃO é o único indicador.
 */
export function SiteNav({ className }: SiteNavProps) {
  return (
    <nav aria-label={uiStrings.nav.label} className={cn('site-nav', className)}>
      <ul role="list" className="site-nav-list">
        {navItems.map((item, index) => (
          <li key={item.id}>
            <a
              href={item.href}
              className="site-nav-link"
              // Gancho estável do ScrollTrigger; o valor casa com o `data-section`
              // que a <Section> de destino já carrega.
              {...{ [HEADER_HOOK.navItem]: item.id }}
            >
              <span aria-hidden className="site-nav-index">
                {padIndex(index + 1)}
              </span>
              {item.label}
            </a>
          </li>
        ))}
      </ul>

      <span aria-hidden {...{ [HEADER_HOOK.indicator]: true }} className="site-nav-indicator" />
    </nav>
  );
}
