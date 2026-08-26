# Pendências — Metup

> Conteúdo/assets que faltam para avançar as fases. Nada de lorem ipsum ou copy
> genérica de agência publicada no lugar do que está aqui (CLAUDE.md seção 4).

## F0 — Discovery & Direção de Arte

- [ ] **Direção de arte:** escolher entre as direções propostas em
      `docs/planning/direcao-arte.md` (ou dar direção própria) — define os tokens
      reais de cor/tipografia/motion em F1.
- [ ] **Copy oficial** de todas as seções (hero, serviços, cases, prova social,
      contato, meta/SEO) — hoje `content/copy.md` está todo marcado como pendente.
- [ ] **Cases reais dos clientes**: nome, serviço entregue, resultado/métrica real
      (se houver), depoimento real (se houver) — `content/cases.md` está vazio.
- [ ] **Assets visuais reais** dos cases (screenshots de projeto) em
      `public/images/` — pasta ainda não existe além do favicon/ícones padrão.
- [ ] **Logos de clientes reais** (se forem usados em prova social/logo bar).
- [ ] **Logo/identidade da própria Metup** (hoje só há um favicon placeholder do
      template Vite em `public/favicon.svg`).
- [ ] **Dados de contato reais** para o JSON-LD (`index.html`) e para o CTA de
      WhatsApp/formulário: telefone, e-mail, número de WhatsApp, endereço/área de
      atuação, redes sociais.
- [ ] **Destino do formulário de lead** (serviço de form / endpoint / e-mail) e
      credenciais correspondentes — vão em `.env`, nunca no repositório.
- [ ] **Imagem de Open Graph** (1200×630) real — hoje ausente em `index.html`.

## Notas

- `index.html` já tem title/description/OG/Twitter/JSON-LD, mas com texto
  placeholder (factual, sem estatística inventada) até a copy oficial chegar —
  marcados com `TODO(PENDENCIAS.md ...)` no próprio arquivo.
- Estrutura técnica (SSG, Tailwind, tokens, pastas) já montada nesta fase — ver
  `docs/planning/plano-fases.md`.
