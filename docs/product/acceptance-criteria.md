# Critérios de aceitação

## Onboarding e navegação

- Avançar, voltar, pular e finalizar funcionam.
- Dados demonstrativos são opcionais, identificados e removíveis.
- Sidebar no desktop e barra compacta no celular alcançam todas as seções.

## Dados financeiros

- Valores oficiais são inteiros em centavos.
- Contas e cartões podem ser criados, editados e arquivados.
- Transações podem ser criadas, editadas, duplicadas, pesquisadas, filtradas e
  excluídas com confirmação.
- Recarregar mantém registros em IndexedDB.

## Planejamento

- Dashboard reage a transações pagas do mês.
- Orçamentos exibem utilizado, restante, percentual e estado.
- Metas exibem percentual, restante e estimativa quando há data.
- Relatórios respeitam os filtros combinados.

## Portabilidade e resiliência

- JSON inválido ou incompatível não é persistido.
- Importação JSON pede confirmação antes de substituir.
- CSV mostra quantidade antes de adicionar e não apaga registros existentes.
- Service worker mantém a interface disponível após o primeiro acesso.

## Qualidade

- Typecheck, lint, testes e os dois builds aprovam.
- Fluxos críticos passam em desktop e mobile.
- Não há erro relevante no console.
- Contraste, foco, labels e alternativa textual dos gráficos são verificados.
