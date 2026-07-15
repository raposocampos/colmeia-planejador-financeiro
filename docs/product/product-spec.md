# Especificação do produto

## Proposta

Colmeia Educação Financeira é um planejador financeiro pessoal local-first em
português brasileiro. Ele transforma registros de contas e transações em uma
visão simples de saldo, gastos, orçamento e metas, sem linguagem punitiva.

## Público inicial

Pessoas brasileiras que desejam começar ou consolidar a organização financeira
sem conectar dados bancários a um servidor. O MVP atende um único perfil por
navegador e não exige cadastro.

## Escopo do MVP

- Onboarding em quatro etapas, reiniciável e com demonstração opcional.
- Contas, cartões, categorias e saldo inicial.
- Receitas, despesas e transferências com busca, filtro, edição, duplicação,
  exclusão, situação e recorrência declarada.
- Dashboard mensal com saldo, comprometimento, categorias, orçamentos, metas,
  últimas transações e compromissos.
- Limites mensais por categoria e mensagens normal/atenção/excedido.
- Metas com progresso, valor restante e estimativa mensal opcional.
- Relatórios filtráveis por mês, conta, cartão e categoria.
- Exportação CSV e JSON; importação JSON substitutiva confirmada; CSV aditivo
  com pré-visualização.
- IndexedDB, funcionamento offline após o primeiro carregamento e instalação
  como PWA.

## Fora do MVP

Login, sincronização entre dispositivos, contas compartilhadas, Open Finance,
OFX, recomendação de investimentos, notificações remotas e backend.

## Métricas de produto

- Registrar primeira despesa em menos de dois minutos.
- Entender receitas, despesas e resultado sem abrir relatório.
- Recuperar dados por backup sem substituição silenciosa.
- Completar fluxos críticos com teclado e em viewport de 390 px.
