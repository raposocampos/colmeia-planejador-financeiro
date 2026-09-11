alter table public.budgets
  add column if not exists duration_months smallint not null default 1;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'budgets_duration_months_check'
      and conrelid = 'public.budgets'::regclass
  ) then
    alter table public.budgets
      add constraint budgets_duration_months_check
      check (duration_months between 0 and 120) not valid;
  end if;
end
$$;

alter table public.budgets
  validate constraint budgets_duration_months_check;

-- Mantém restaurações e migrações do IndexedDB compatíveis com backups antigos.
-- Duração ausente equivale a um único mês; zero mantém o plano sem prazo.
create or replace function public.migrate_legacy_planner(
  planner_state jsonb,
  migration_id uuid
)
returns jsonb
language plpgsql
security invoker
set search_path = ''
as $$
declare
  owner_id uuid := (select auth.uid());
  expected jsonb;
  actual jsonb;
  item jsonb;
begin
  if owner_id is null then raise exception 'authentication_required'; end if;

  if exists (
    select 1 from public.data_migrations
    where user_id = owner_id and id = migration_id
  ) then
    select record_counts into actual from public.data_migrations
    where user_id = owner_id and id = migration_id;
    return jsonb_build_object('status', 'already_completed', 'counts', actual);
  end if;

  if exists (select 1 from public.accounts where user_id = owner_id)
     or exists (select 1 from public.credit_cards where user_id = owner_id)
     or exists (select 1 from public.transactions where user_id = owner_id)
     or exists (select 1 from public.budgets where user_id = owner_id)
     or exists (select 1 from public.goals where user_id = owner_id) then
    raise exception 'remote_not_empty';
  end if;

  expected := jsonb_build_object(
    'accounts', jsonb_array_length(coalesce(planner_state -> 'accounts', '[]'::jsonb)),
    'cards', jsonb_array_length(coalesce(planner_state -> 'cards', '[]'::jsonb)),
    'categories', jsonb_array_length(coalesce(planner_state -> 'categories', '[]'::jsonb)),
    'transactions', jsonb_array_length(coalesce(planner_state -> 'transactions', '[]'::jsonb)),
    'budgets', jsonb_array_length(coalesce(planner_state -> 'budgets', '[]'::jsonb)),
    'goals', jsonb_array_length(coalesce(planner_state -> 'goals', '[]'::jsonb))
  );

  for item in select * from jsonb_array_elements(coalesce(planner_state -> 'accounts', '[]'::jsonb)) loop
    insert into public.accounts values (
      owner_id, item->>'id', item->>'name', item->>'type', nullif(item->>'institution',''),
      (item->>'initialBalanceCents')::bigint, item->>'color', coalesce((item->>'archived')::boolean,false),
      (item->>'createdAt')::timestamptz, (item->>'updatedAt')::timestamptz
    ) on conflict (user_id,id) do nothing;
  end loop;

  for item in select * from jsonb_array_elements(coalesce(planner_state -> 'categories', '[]'::jsonb)) loop
    insert into public.categories
      (user_id, id, name, kind, color, icon, archived, created_at, updated_at, sort_order)
    values (
      owner_id, item->>'id', item->>'name', item->>'kind', item->>'color', item->>'icon',
      coalesce((item->>'archived')::boolean,false), (item->>'createdAt')::timestamptz,
      (item->>'updatedAt')::timestamptz, nullif(item->>'sortOrder','')::integer
    ) on conflict (user_id,id) do update set
      name=excluded.name, kind=excluded.kind, color=excluded.color, icon=excluded.icon,
      archived=excluded.archived, sort_order=excluded.sort_order,
      updated_at=excluded.updated_at;
  end loop;

  for item in select * from jsonb_array_elements(coalesce(planner_state -> 'cards', '[]'::jsonb)) loop
    insert into public.credit_cards values (
      owner_id, item->>'id', item->>'name', (item->>'limitCents')::bigint,
      (item->>'closingDay')::smallint, (item->>'dueDay')::smallint,
      nullif(item->>'paymentAccountId',''), item->>'color', coalesce((item->>'archived')::boolean,false),
      (item->>'createdAt')::timestamptz, (item->>'updatedAt')::timestamptz
    ) on conflict (user_id,id) do nothing;
  end loop;

  for item in select * from jsonb_array_elements(coalesce(planner_state -> 'transactions', '[]'::jsonb)) loop
    insert into public.transactions values (
      owner_id, item->>'id', item->>'type', item->>'description', (item->>'amountCents')::bigint,
      (item->>'date')::date, nullif(item->>'categoryId',''), nullif(item->>'accountId',''),
      nullif(item->>'destinationAccountId',''), nullif(item->>'creditCardId',''),
      nullif(item->>'paymentMethod',''), nullif(item->>'notes',''),
      coalesce(array(select jsonb_array_elements_text(item->'tags')), '{}'::text[]),
      item->>'recurrence', item->>'status', (item->>'createdAt')::timestamptz,
      (item->>'updatedAt')::timestamptz
    ) on conflict (user_id,id) do nothing;
  end loop;

  for item in select * from jsonb_array_elements(coalesce(planner_state -> 'budgets', '[]'::jsonb)) loop
    insert into public.budgets
      (user_id, id, category_id, month, limit_cents, created_at, updated_at, duration_months)
    values (
      owner_id, item->>'id', item->>'categoryId', item->>'month',
      (item->>'limitCents')::bigint, (item->>'createdAt')::timestamptz,
      (item->>'updatedAt')::timestamptz,
      coalesce(nullif(item->>'durationMonths','')::smallint, 1)
    ) on conflict (user_id,id) do nothing;
  end loop;

  for item in select * from jsonb_array_elements(coalesce(planner_state -> 'goals', '[]'::jsonb)) loop
    insert into public.goals values (
      owner_id, item->>'id', item->>'name', (item->>'targetCents')::bigint,
      (item->>'currentCents')::bigint, nullif(item->>'targetDate','')::date,
      nullif(item->>'accountId',''), item->>'color', item->>'icon',
      (item->>'createdAt')::timestamptz, (item->>'updatedAt')::timestamptz
    ) on conflict (user_id,id) do nothing;
  end loop;

  update public.user_settings set
    currency = coalesce(planner_state->'settings'->>'currency','BRL'),
    locale = coalesce(planner_state->'settings'->>'locale','pt-BR'),
    timezone = coalesce(planner_state->'settings'->>'timezone','America/Sao_Paulo'),
    schema_version = 2,
    updated_at = now()
  where user_id = owner_id;

  actual := jsonb_build_object(
    'accounts', (select count(*) from public.accounts where user_id=owner_id),
    'cards', (select count(*) from public.credit_cards where user_id=owner_id),
    'categories', (select count(*) from public.categories where user_id=owner_id),
    'transactions', (select count(*) from public.transactions where user_id=owner_id),
    'budgets', (select count(*) from public.budgets where user_id=owner_id),
    'goals', (select count(*) from public.goals where user_id=owner_id)
  );

  if actual <> expected then raise exception 'migration_count_mismatch'; end if;

  insert into public.data_migrations
    (user_id,id,schema_version,source,record_counts)
  values (owner_id,migration_id,2,'legacy-indexeddb',actual);

  return jsonb_build_object('status','completed','counts',actual);
end;
$$;

revoke all on function public.migrate_legacy_planner(jsonb, uuid) from public, anon;
grant execute on function public.migrate_legacy_planner(jsonb, uuid) to authenticated;
