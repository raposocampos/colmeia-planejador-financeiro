# Runbook de publicação V2

## Gate obrigatório

**Preparação de staging autorizada por Lucas Campos em: 16/07/2026**

**Produção autorizada por Lucas Campos em: 16/07/2026**

Sem data, identificação da aprovação e checklist revisado para o ambiente pretendido,
pare. A autorização de staging não autoriza merge nem produção.

## Preparação de staging autorizada

1. Usar somente o GitHub Environment `staging` e um projeto Supabase exclusivo.
2. Configurar credenciais fora do repositório e aplicar a label `staging-dry-run` no
   PR para validar configuração e dry-run sem merge.
3. Revisar a execução e remover essa label.
4. Aplicar `staging-apply` somente após o dry-run aprovado; essa label aplica a
   migration e executa os testes remotos. Removê-la ao final.
5. Exigir isolamento A/B/anônimo, cascata e migração idempotente aprovados.
6. Gerar artefato por sete dias sem chamar Sites, Pages ou qualquer deploy.
7. A alternativa `workflow_dispatch` exige a confirmação literal `STAGING`, mas só
   fica disponível se o workflow existir na branch padrão.
8. Manter `main`, o Sites público e o ambiente `github-pages` intocados.

## Pré-publicação e produção

1. Revisar `docs/approvals/auth-onboarding-v2-review.md` e obter `APROVADO` explícito.
2. Validar Termos e Privacidade juridicamente.
3. Criar projeto Supabase do ambiente, aplicar migrations e testar RLS A/B/anônimo.
4. Configurar SMTP, URLs de callback e política de senhas. Manter Google OAuth
   oculto enquanto o provedor não estiver validado.
5. Configurar somente secrets/variáveis do ambiente de hospedagem.
6. No Sites, carregar `NEXT_PUBLIC_SUPABASE_URL`,
   `NEXT_PUBLIC_SUPABASE_ANON_KEY` e `NEXT_PUBLIC_SITE_URL` do ambiente hospedado
   durante `pnpm build`; essas variáveis públicas são compiladas no bundle cliente
   e nunca devem ser copiadas para `.env` versionado.
7. Executar instalação limpa, typecheck, lint, formato, testes, E2E, builds,
   migrations, segredos e auditoria.
8. Publicar primeiro em staging autorizado; executar QA desktop/mobile e migração.
9. Aprovar janela, backup e rollback antes de produção.
10. Após publicar, validar login, rotas, console, responsividade e conexão com o
    projeto Supabase correto em Sites e GitHub Pages.
11. No domínio próprio, manter todos os IPs raiz dentro do mesmo registro `A` quando
    o provedor agrupar conteúdos por nome. Preservar registros de e-mail e adicionar
    o domínio e seus callbacks à configuração de URL do Supabase.
