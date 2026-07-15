# Modelo de dados

Todos os registros usam id único, createdAt e updatedAt em ISO 8601.

## Account

Nome, tipo, instituição opcional, saldo inicial em centavos, cor e archived.
Saldo atual é derivado de transações pagas.

## CreditCard

Nome, limite em centavos, fechamento, vencimento, conta de pagamento opcional,
cor e archived. A fatura atual é derivada das despesas do mês.

## Category

Nome, kind income/expense/both, cor, ícone semântico e archived.

## Transaction

Tipo income/expense/transfer, descrição, centavos, data, categoria, conta,
destino, cartão, forma de pagamento, observação, tags, recorrência declarada,
status paid/pending e marcador demo.

Recorrências não materializam cópias automaticamente no MVP. A regra funciona
como lembrete e evita duplicações silenciosas; o usuário duplica quando deseja.

## Budget

Categoria, mês YYYY-MM e limite em centavos. Utilizado é a soma das despesas da
categoria no mês, incluindo pendentes para uma visão prudente.

## Goal

Nome, alvo e atual em centavos, data desejada e conta opcionais, cor e ícone.

## AppSettings e backup

Registro único settings guarda onboarding, demonstração, moeda, locale, fuso e
versão. BackupMetadata identifica app, versão e data. BackupData contém snapshot
completo validado por Zod antes de importar.
