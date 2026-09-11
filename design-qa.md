# Design QA — dashboard gerencial responsivo

## Evidências

- Fonte visual: `C:\Users\lucas\.codex-remote-attachments\01a08c0d-ef26-70c3-a062-173e8472155a\654793ac-ea30-4b0f-918c-f8434981954b\2-Photo-2.jpg`
- Implementação mobile: `C:\Users\lucas\OneDrive\Documentos\Software Controle Financeiro - Brand Refresh\docs\quality\screenshots\v2\dashboard-mobile.png`
- Implementação desktop: `C:\Users\lucas\OneDrive\Documentos\Software Controle Financeiro - Brand Refresh\docs\quality\screenshots\v2\dashboard-migrated.png`
- Relatórios mobile: `C:\Users\lucas\OneDrive\Documentos\Software Controle Financeiro - Brand Refresh\docs\quality\screenshots\v2\reports-mobile.png`
- URL renderizada: `http://127.0.0.1:3000/?review=migrated`
- Viewports verificados: 320 px, 390 × 844 CSS px e 1440 px; `deviceScaleFactor: 1` nas capturas automatizadas.
- Dimensões em pixels: fonte 659 × 1280; dashboard mobile 390 × 3040; dashboard desktop 1440 × 1847; relatórios mobile 390 × 2858.
- Densidade registrada: 96 dpi em todas as imagens. A fonte inclui barra e moldura de aparelho, enquanto a implementação é uma captura da página. A comparação foi normalizada pela largura útil e pela ordem dos blocos, sem atribuir diferenças ao cromo do aparelho ou à altura variável do conteúdo.
- Estado: usuário `Lucas`, setembro de 2026, dados migrados de demonstração, visão de seis meses, mês atual selecionado e tooltip do mês visível.

## Comparação de tela completa

A implementação preserva as decisões centrais da referência: saudação e período no topo, quatro indicadores, fluxo de caixa como visual principal, distribuição das despesas, maiores gastos, metas, insights, projeção e navegação persistente. No desktop, a grade distribui os blocos em pares e mantém o fluxo como painel dominante. No celular, os indicadores passam para 2 × 2 a partir de 360 px e para uma coluna em 320 px; o gráfico usa rolagem interna e abre já no mês selecionado. Essa adaptação é intencional e evita miniaturizar a composição desktop.

As cinco superfícies obrigatórias foram verificadas:

- Tipografia: família e pesos da identidade Colmeia preservados; hierarquia, altura de linha e quebras permanecem legíveis nos três breakpoints.
- Espaçamento e ritmo: margens, lacunas e áreas de toque consistentes; nenhum cartão, controle persistente ou rótulo da navegação invade a página.
- Cores e tokens: amarelo Colmeia, verde de receita, vermelho de despesa e tons neutros são usados semanticamente, inclusive na projeção negativa.
- Imagens e ativos: logotipo e ícones existentes foram reutilizados; não há substituição por emoji, desenho CSS ou ativo raster degradado.
- Texto: linguagem financeira direta, não punitiva e em português; insights deixam explícito que são leituras automáticas dos próprios registros.

## Comparações focadas

- Navegação inferior: `Visão`, `Extrato`, botão central de adição, `Orçar` e `Mais` cabem em 320–390 px. Os nomes completos permanecem nos rótulos acessíveis (`Transações` e `Orçamentos`). O menu `Mais` concentra Contas, Metas, Relatórios e Configurações sem reduzir a área de toque.
- Indicadores e tooltips: o ícone de informação fica ancorado no canto do cartão, sem colidir com valor ou variação. O tooltip de Receitas foi aberto na prévia; a árvore de acessibilidade confirmou `aria-expanded=true` e exibiu a explicação do cálculo.
- Gráficos: o mês ativo exibe receitas, despesas e saldo em tooltip; há alternativa tabular expansível. A rolagem é interna ao gráfico, não à página.
- Relatórios mobile: filtros, indicadores, fluxo, distribuição, despesas e plano aparecem em uma coluna, sem estouro horizontal.

## Histórico de iterações

1. **P1 — dashboard mobile cortado e conteúdo fora do viewport.** A primeira versão mantinha proporções desktop, mostrava um indicador isolado e escondia meses do gráfico. Foi corrigida com grade responsiva, cartões fluidos e trilha horizontal restrita ao gráfico. A captura final de 390 px mostra todos os blocos dentro da largura.
2. **P2 — rótulos da navegação inferior ultrapassavam o item ativo.** Os cinco destinos usavam nomes longos no celular. Foram adotados rótulos visuais curtos, nomes acessíveis completos, botão central e menu adaptável. A evidência final mostra os cinco itens separados e centralizados.
3. **P2 — ícone de informação colidia com conteúdo do KPI.** O ícone passou a usar posição ancorada e reserva de espaço no cartão. A captura final mostra valores e ícones sem sobreposição.
4. **P1 — projeção negativa recebia tom positivo.** O estado visual foi ligado explicitamente ao sinal da projeção. A evidência final mostra o valor negativo em vermelho.
5. **P2 — total por categoria divergia do indicador de despesas.** A distribuição incluía compromissos pendentes enquanto o KPI considerava apenas pagamentos. O cálculo passou a usar somente despesas pagas; donut e KPI agora mostram R$ 18.158,10 no mesmo estado.

Após cada correção, as capturas foram refeitas e a fonte e a implementação final foram abertas juntas para uma nova comparação. Não restaram diferenças P0, P1 ou P2 acionáveis. A diferença de densidade entre a referência compacta e o produto final é aceitável: a referência orienta a arquitetura, e a solicitação permite adaptação específica para celular.

## Interações e validações

- Alternância entre seis e doze meses.
- Seleção de mês no gráfico e atualização do relatório.
- Tooltip de KPI por toque/foco e fechamento por Escape/clique externo.
- Tooltip de mês e seleção de categoria da distribuição.
- Alternativa tabular dos gráficos.
- Abertura e fechamento do menu móvel `Mais`.
- Navegação inferior, cabeçalho e filtros em 320, 390 e 1440 px.
- Console da prévia verificado sem erros ou avisos.
- TypeScript, ESLint, 53 testes unitários e 24 cenários E2E aprovados; 4 cenários foram ignorados apenas nos viewports aos quais não se aplicam.

## Findings

Nenhum achado P0, P1 ou P2 permanece. Não há região crítica pequena demais para exigir outro recorte além das comparações focadas descritas acima.

## Open Questions

Nenhuma pendência de design bloqueia a publicação.

## Implementation Checklist

- [x] Dashboard gerencial responsivo.
- [x] Navegação móvel sem sobreposição.
- [x] Tooltips acessíveis e alternativas tabulares.
- [x] Insights determinísticos e adaptáveis aos dados.
- [x] Relatórios reorganizados para celular.
- [x] Evidências desktop e mobile atualizadas.

final result: passed
