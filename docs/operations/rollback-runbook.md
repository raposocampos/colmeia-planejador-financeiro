# Runbook de rollback V2

## Aplicação

Reverter para o artefato/commit estável anterior sem reescrever histórico. Suspender
novas migrações e preservar logs técnicos. A V1 publicada não foi alterada nesta tarefa.

## Banco

Não remover tabelas ou colunas com dados durante resposta emergencial. Bloquear a
funcionalidade afetada, exportar metadados de contagem, restaurar em projeto isolado e
comparar integridade antes de qualquer troca. Migrations destrutivas exigem plano próprio.

## Dados locais

O IndexedDB legado é preservado e pode apoiar recuperação. O cache autenticado não é
fonte oficial. Nunca promova cache para nuvem automaticamente quando o remoto já tiver
dados; exporte e revise manualmente.

## Encerramento

Repetir testes de RLS, autenticação, migração e contagens; registrar a causa e obter nova
aprovação antes de publicar a correção.
