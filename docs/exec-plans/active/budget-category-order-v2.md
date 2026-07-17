# Plano de execução — orçamento e ordem de categorias V2

Atualizado em 17/07/2026.

## Objetivo

Corrigir a criação de orçamentos no banco remoto, remover a escolha artificial
“Sem categoria” dos formulários e permitir que cada pessoa organize suas categorias.

## Estado

- [x] Reproduzir o erro em produção sem criar ou apagar registros.
- [x] Identificar a restrição SQL incorreta de `month`.
- [x] Criar migração aditiva sem reescrever dados financeiros existentes.
- [x] Implementar ordem opcional e retrocompatível em banco, cache e backup.
- [x] Implementar arrastar, soltar e alternativa completa por teclado.
- [x] Adicionar mensagens seguras para falhas de gravação remota.
- [x] Cobrir regressões com testes unitários, componentes e E2E.
- [x] Aplicar a migração em produção e verificar coluna, restrição e RPC.
- [ ] Publicar e validar os hosts sem alterar dados reais de usuários.

## Decisões

`sortOrder` é opcional para que registros e backups antigos continuem válidos. A
RPC de reordenação recebe todos os IDs, deriva o proprietário de `auth.uid()` e
atualiza apenas as categorias da sessão. A correção do orçamento troca somente a
restrição de formato por `YYYY-MM`; nenhuma linha financeira é alterada.

## Recuperação

Se a publicação falhar, o artefato atual permanece ativo. Se a migração falhar,
a transação do PostgreSQL é revertida. A aplicação não deve ser publicada antes
de a nova coluna, a restrição corrigida e a RPC estarem disponíveis.
