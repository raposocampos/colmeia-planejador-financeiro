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

## Autenticação e nuvem V2

- E-mail é normalizado e precisa ser confirmado antes do painel.
- Senha tem ao menos 12 caracteres; cadastro exige confirmação, Termos e Privacidade.
- Google usa OAuth e callback autorizado; CI não automatiza login Google real.
- Sessão padrão usa o contexto atual; persistência exige escolha explícita.
- Supabase é fonte oficial, escrita remota precede cache e edição offline é bloqueada.
- RLS separa SELECT, INSERT, UPDATE e DELETE por `auth.uid()` e papel autenticado.
- Legado é detectado sem contar categorias padrão, pode ser exportado e não é apagado.
- Migração é idempotente, transacional, preserva IDs/centavos/datas e verifica referências.
- Onboarding remoto ocorre uma vez; exemplos não chegam ao Supabase ou IndexedDB.
- Novo usuário termina com painel vazio; conta migrada mostra somente dados migrados.
- Nenhuma publicação ocorre antes do checklist e do `APROVADO` de Lucas Campos.
