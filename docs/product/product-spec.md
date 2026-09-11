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
  últimas transações e próximos descontos calculados pela recorrência.
- Limites por categoria com duração de 1, 3, 6 ou 12 meses, ou sem prazo, e
  mensagens normal/atenção/excedido em cada mês ativo.
- Metas com progresso, valor restante e estimativa mensal opcional.
- Dashboard de relatórios interativo com comparativo de seis meses, distribuição
  por categoria e filtros combináveis por mês, conta, cartão e categoria.
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

## Evolução V2 em revisão

- conta por e-mail/senha com confirmação obrigatória, Google OAuth e recuperação;
- “Manter-me conectado” opcional e desmarcado por padrão;
- Supabase/PostgreSQL como fonte oficial, cache local por usuário e leitura offline;
- migração segura do IndexedDB legado, sem merge automático com nuvem não vazia;
- onboarding de cinco etapas uma vez por conta, com capturas reais e sanitizadas;
- perfil, logout, exportação, exclusão, Termos e Privacidade.

Não fazem parte desta V2: aposentadoria, família, filhos, educação, Open Finance,
IA financeira, compartilhamento entre casais, pagamentos e assinaturas.
