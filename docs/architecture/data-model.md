# Modelo de dados

Todos os registros usam id único, createdAt e updatedAt em ISO 8601.

## Account

Nome, tipo, instituição opcional, saldo inicial em centavos, cor e archived.
Saldo atual é derivado de transações pagas.

## CreditCard

Nome, limite em centavos, fechamento, vencimento, conta de pagamento opcional,
cor e archived. A fatura atual é derivada das despesas do mês.

## Category

Nome, kind income/expense/both, cor, ícone semântico, archived e `sortOrder`
opcional. A ausência de posição mantém backups e registros antigos compatíveis;
ao reordenar, todas as categorias da pessoa recebem posições inteiras sequenciais.

## Transaction

Tipo income/expense/transfer, descrição, centavos, data, categoria, conta,
destino, cartão, forma de pagamento, observação, tags, recorrência declarada,
status paid/pending e marcador demo.

Recorrências não materializam cópias automaticamente no MVP. A regra funciona
como lembrete e evita duplicações silenciosas; o usuário duplica quando deseja.

## Budget

Categoria, mês YYYY-MM e limite em centavos. Utilizado é a soma das despesas da
categoria no mês, incluindo pendentes para uma visão prudente. O banco valida
`month` com o formato estrito `YYYY-MM`.

## Goal

Nome, alvo e atual em centavos, data desejada e conta opcionais, cor e ícone.

## AppSettings e backup

Registro único settings guarda onboarding, demonstração, moeda, locale, fuso e
versão. BackupMetadata identifica app, versão e data. BackupData contém snapshot
completo validado por Zod antes de importar.

## Persistência remota V2

`profiles` associa nome e `onboarding_completed_at` ao usuário do Auth.
`user_settings` guarda moeda, locale, fuso e versão do schema. `data_migrations`
guarda somente ID idempotente, versão, origem, contagens e data — nunca conteúdo
financeiro.

Accounts, credit_cards, categories, transactions, budgets e goals usam chave
primária composta `(user_id, id)`. Relacionamentos também incluem `user_id`, o que
impede referência entre proprietários. O cliente não envia livremente `user_id`;
o default e as policies usam `auth.uid()`. Valores continuam em `bigint` de centavos.

O cache usa banco `colmeia-financial-planner-cache-{userId}`. O legado permanece em
`colmeia-financial-planner`, isolado do cache e da fonte oficial.
