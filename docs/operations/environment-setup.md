# Ambientes e configuração

## Local

Copie `.env.example` para `.env.local` sem versionar. Configure URL, chave anônima e
URL do site de um projeto Supabase local ou descartável. Rode `supabase start` e
`supabase db reset` quando a CLI estiver instalada. Google pode permanecer mockado.

## Test

CI não usa credenciais reais. Valida TypeScript, lint, formato, testes, builds, SQL,
segredos e dependências. Integração Supabase usa banco local isolado quando disponível.

## Staging

Preparação autorizada em 16/07/2026, sem merge e sem produção. O GitHub Environment
`staging` e o workflow `staging-v2.yml` isolam credenciais, dry-run, migrations,
testes A/B/anônimo e o artefato. Antes do merge, as labels `staging-dry-run` e
`staging-apply` controlam as duas fases no PR. O ambiente aceita somente a branch
`feat/auth-cloud-sync-onboarding-v2`; o workflow não contém etapa de deploy.

Variáveis do GitHub Environment:

- `SUPABASE_PROJECT_ID`: referência do projeto exclusivo de staging;
- `NEXT_PUBLIC_SUPABASE_URL`: URL HTTPS do mesmo projeto;
- `NEXT_PUBLIC_SITE_URL`: URL HTTPS que contenha `staging` e nunca a URL pública atual.

Secrets do GitHub Environment:

- `SUPABASE_ACCESS_TOKEN` e `SUPABASE_DB_PASSWORD`: usados somente pela CLI;
- `SUPABASE_SERVICE_ROLE_KEY`: usada somente pelo teste administrativo descartável;
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: única chave enviada ao bundle do navegador.

O projeto Supabase, SMTP e OAuth devem ser próprios de staging. Os testes criam
usuários e dados fictícios temporários, verificam isolamento, cascata e idempotência
e removem as contas ao final. Nenhuma credencial deve ser enviada pelo chat.

## Production

Projeto e segredos separados, domínio final, revisão jurídica, monitoramento, backup,
orçamento de cotas e gate manual. O Sites público e o GitHub Pages não são alvos do
workflow de staging e não foram alterados.

Variáveis públicas permitidas: `NEXT_PUBLIC_SUPABASE_URL`,
`NEXT_PUBLIC_SUPABASE_ANON_KEY` e `NEXT_PUBLIC_SITE_URL`. Credenciais administrativas
nunca pertencem ao bundle, documentação, logs ou screenshots.
