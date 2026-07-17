# Plano de execução — orçamento e ordem de categorias V2

Concluído em 17/07/2026.

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
- [x] Publicar e validar os hosts sem alterar dados reais de usuários.

## Decisões

`sortOrder` é opcional para que registros e backups antigos continuem válidos. A
RPC de reordenação recebe todos os IDs, deriva o proprietário de `auth.uid()` e
atualiza apenas as categorias da sessão. A correção do orçamento troca somente a
restrição de formato por `YYYY-MM`; nenhuma linha financeira é alterada.

## Resultado

A migração foi verificada por consulta somente de leitura. GitHub Actions, Pages
e Sites concluíram com sucesso. A validação pública foi feita sem criar, editar ou
apagar orçamentos, transações, contas ou categorias reais.

## Recuperação

O histórico do Sites e do GitHub Pages mantém os artefatos anteriores disponíveis
para rollback. A migração é transacional e não contém `update`, `delete` ou backfill
dos registros financeiros existentes.
