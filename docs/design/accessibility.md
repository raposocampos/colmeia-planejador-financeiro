# Acessibilidade

- Documento em pt-BR, landmarks semânticos e link “Pular para o conteúdo”.
- Labels associados a campos; mensagens de sucesso em região aria-live.
- Foco visível de três pixels e contraste alvo WCAG AA.
- Modais com role dialog/alertdialog, título, descrição, Escape e fundo clicável.
- Progressos expõem role progressbar, valor mínimo, máximo, atual e nome.
- Navegação informa aria-current e botões possuem nomes acessíveis.
- Gráficos apresentam valores visíveis e tabela alternativa expansível.
- Layout não depende de hover; controles continuam úteis com teclado.
- prefers-reduced-motion reduz animações e transições.
- Mobile preserva alvo de toque e não exige gesto complexo.

Limitação conhecida: o trap completo de foco dentro dos modais será reforçado em
uma versão futura; o foco visível e o fechamento por teclado já estão presentes.
