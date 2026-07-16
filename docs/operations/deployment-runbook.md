# Runbook de publicação V2

## Gate obrigatório

**Preparação de staging autorizada por Lucas Campos em: 16/07/2026**

**Produção autorizada por Lucas Campos em: ____**

Sem data, identificação da aprovação e checklist revisado para o ambiente pretendido,
pare. A autorização de staging não autoriza merge nem produção.

## Preparação de staging autorizada

1. Usar somente o GitHub Environment `staging` e um projeto Supabase exclusivo.
2. Configurar credenciais fora do repositório e executar o workflow manual com a
   confirmação literal `STAGING`.
3. Rodar primeiro com `apply_migrations=false` para validar configuração e dry-run.
4. Revisar o dry-run; somente então repetir com `apply_migrations=true`.
5. Exigir isolamento A/B/anônimo, cascata e migração idempotente aprovados.
6. Gerar artefato por sete dias sem chamar Sites, Pages ou qualquer deploy.
7. Manter `main`, o Sites público e o ambiente `github-pages` intocados.

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

Nenhum passo desta preparação publica em produção.
