# Runbook de publicação V2

## Gate obrigatório

**Produção autorizada por Lucas Campos em: ____**

Sem data, identificação da aprovação e checklist revisado, pare. A branch atual não
autoriza merge, staging ou produção.

## Pré-publicação futura

1. Revisar `docs/approvals/auth-onboarding-v2-review.md` e obter `APROVADO` explícito.
2. Validar Termos e Privacidade juridicamente.
3. Criar projeto Supabase do ambiente, aplicar migrations e testar RLS A/B/anônimo.
4. Configurar SMTP, Google OAuth, URLs de callback e política de senhas.
5. Configurar somente secrets/variáveis do ambiente de hospedagem.
6. Executar instalação limpa, typecheck, lint, formato, testes, E2E, builds, migrations,
   segredos e auditoria.
7. Publicar primeiro em staging autorizado; executar QA desktop/mobile e migração.
8. Aprovar janela, backup e rollback antes de produção.

Esta tarefa não executa nenhum passo de publicação.
