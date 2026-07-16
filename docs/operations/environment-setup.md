# Ambientes e configuração

## Local

Copie `.env.example` para `.env.local` sem versionar. Configure URL, chave anônima e
URL do site de um projeto Supabase local ou descartável. Rode `supabase start` e
`supabase db reset` quando a CLI estiver instalada. Google pode permanecer mockado.

## Test

CI não usa credenciais reais. Valida TypeScript, lint, formato, testes, builds, SQL,
segredos e dependências. Integração Supabase usa banco local isolado quando disponível.

## Staging

Projeto separado, dados fictícios, SMTP e OAuth próprios, URLs autorizadas e RLS
validada com dois usuários. Não foi criado nem publicado nesta tarefa.

## Production

Projeto e segredos separados, domínio final, revisão jurídica, monitoramento, backup,
orçamento de cotas e gate manual. Não foi alterado nesta tarefa.

Variáveis públicas permitidas: `NEXT_PUBLIC_SUPABASE_URL`,
`NEXT_PUBLIC_SUPABASE_ANON_KEY` e `NEXT_PUBLIC_SITE_URL`. Credenciais administrativas
nunca pertencem ao bundle, documentação, logs ou screenshots.
