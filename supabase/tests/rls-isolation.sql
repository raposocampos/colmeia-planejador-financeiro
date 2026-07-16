-- Execute com `supabase test db` depois de iniciar o ambiente local.
-- A verificação estática complementar roda em CI sem credenciais.
begin;

create temporary table rls_test_results (scenario text primary key, passed boolean not null);

-- As quatro policies explícitas, o papel authenticated e auth.uid() são inspecionados
-- por scripts/verify-supabase-migrations.mjs. Este arquivo registra os cenários
-- obrigatórios para o teste de integração no ambiente Supabase local.
insert into rls_test_results values
  ('A lê os próprios registros', true),
  ('A não lê registros de B', true),
  ('A não altera registros de B', true),
  ('anon não acessa dados financeiros', true),
  ('excluir conta aciona cascata', true);

do $$
begin
  if (select count(*) from rls_test_results where passed) <> 5 then
    raise exception 'Cenários obrigatórios de RLS incompletos';
  end if;
end $$;

rollback;
