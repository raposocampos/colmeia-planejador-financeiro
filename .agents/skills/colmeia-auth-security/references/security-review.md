# Checklist de segurança V2

## Cliente e sessão

- Aceitar somente `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY` no cliente.
- Usar PKCE, callback em origem autorizada e `redirectTo` derivado de URL conhecida.
- Persistir sessão no `localStorage` apenas com consentimento; usar `sessionStorage` no modo padrão.
- Remover as duas cópias da sessão no logout.
- Nunca registrar payload de autenticação ou erro bruto do provedor.

## Banco e RLS

- Ativar RLS em `profiles`, `accounts`, `credit_cards`, `categories`, `transactions`, `budgets`, `goals`, `user_settings` e `data_migrations`.
- Criar quatro políticas por tabela com `TO authenticated`.
- Usar `(select auth.uid()) = user_id` em `USING` e `WITH CHECK`.
- Criar chaves estrangeiras compostas por `user_id` e ID para impedir referências cruzadas.
- Validar A→A, A→B negado, anônimo negado e exclusão em cascata.

## Logs e erros

- Permitir somente códigos técnicos, contagens e IDs de correlação.
- Proibir valores, descrições, nomes de contas, e-mail completo, tokens e conteúdo de backup.
- Traduzir falhas de login sem confirmar se a conta existe.
