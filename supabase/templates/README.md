# Templates de autenticação

Fonte versionada dos templates aplicados pelo painel do Supabase Auth.

- `confirmation.html`: assunto `Confirme seu e-mail | Colmeia Educação Financeira`.
- `recovery.html`: assunto `Redefina sua senha | Colmeia Educação Financeira`.

Os arquivos usam apenas `{{ .ConfirmationURL }}` e não incluem dados pessoais. A
personalização do conteúdo funciona no projeto hospedado; nome e domínio do
remetente dependem de um SMTP próprio de produção.
