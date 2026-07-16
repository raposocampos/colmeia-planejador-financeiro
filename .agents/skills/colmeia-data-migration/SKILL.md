---
name: colmeia-data-migration
description: Validar detecção, backup e migração idempotente dos dados legados da Colmeia entre IndexedDB e Supabase, preservando centavos, datas, IDs, relacionamentos e dados locais. Usar ao alterar repositórios, schema, importadores, cache ou o fluxo de migração; não usar para CRUD remoto sem transformação ou transporte de dados legados.
---

# Colmeia Data Migration

## Procedimento

1. Ler `references/migration-review.md`, o modelo de dados e o ADR vigente.
2. Gerar ou recomendar backup JSON antes de qualquer escrita remota.
3. Contar contas, cartões, transações, orçamentos, metas e categorias personalizadas; ignorar categorias padrão vazias.
4. Verificar o estado remoto antes de migrar e impedir merge automático quando ele não estiver vazio.
5. Validar IDs, centavos, datas e todas as referências antes do primeiro upsert.
6. Executar a migração como operação transacional ou compensável, com chave idempotente e `schema_version`.
7. Reler o remoto, comparar contagens e integridade, e só então registrar `migrated_at`.
8. Confirmar que falhas mantêm o IndexedDB intacto, não duplicam registros e permitem nova tentativa.

## Critérios de sucesso

- Backup é oferecido antes da importação.
- Uma segunda execução não cria duplicatas.
- Contagens e relacionamentos coincidem antes e depois.
- Nenhum dado local é apagado automaticamente.
- Logs contêm somente metadados técnicos e contagens.

## Recuperação

Em divergência de contagem ou referência, abortar a conclusão, preservar o cache local, registrar o código técnico da etapa e oferecer nova tentativa. Nunca marcar a migração como concluída parcialmente.
