# Checklist de migração

## Antes

- Diferenciar dados reais de categorias padrão vazias.
- Contar cada tabela e verificar se o remoto está vazio.
- Gerar backup pelo mesmo schema validado usado no produto.
- Validar chaves estrangeiras e IDs duplicados.

## Durante

- Usar uma chave como `indexeddb-v1:<user-id>` em `data_migrations`.
- Upsert por `(user_id, id)` dentro de uma RPC transacional.
- Não enviar `user_id` livre da interface; derivar de `auth.uid()` no banco.
- Registrar somente etapa, contagem, schema e horário.

## Depois

- Reler todas as tabelas e comparar contagens.
- Verificar transação→conta/cartão/categoria, meta→conta e orçamento→categoria.
- Manter IndexedDB como cache e cópia recuperável.
- Repetir a operação e confirmar ausência de duplicatas.
