# Diretrizes de interface

## Hierarquia

A primeira dobra combina uma mensagem humana, saldo total e dois atalhos. Cards
de métrica respondem “quanto entrou, quanto saiu, como ficou e quantos registros
existem”. Gráficos só aparecem depois dessa síntese.

## Layout

- Desktop: sidebar escura de 256 px fica fixa à viewport e ocupa `100svh`; o menu
  permanece disponível durante a rolagem e o bloco de privacidade com o rodapé
  fica ancorado ao final da coluna visível.
- Tablet: sidebar recolhida e grids de duas colunas.
- Mobile: uma coluna, ações essenciais grandes e barra inferior rolável.
- Área de toque mínima de 40 a 44 px nos controles principais.

## Componentes

Botões amarelos são ações primárias; preto é ação complementar de alto contraste.
Painéis usam borda discreta e quase nenhuma sombra. Empty states explicam o
próximo passo. Modais fecham por Escape, botão ou clique fora.

## Dados

Moeda em BRL, datas em dd/mm/aaaa e meses em português. Verde indica entrada,
vermelho saída, amarelo atenção. Nenhuma informação depende apenas de cor.
Gráficos possuem tabela alternativa.
