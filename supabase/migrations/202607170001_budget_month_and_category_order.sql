alter table public.budgets
  drop constraint if exists budgets_month_check;

alter table public.budgets
  add constraint budgets_month_check
  check (month ~ '^[0-9]{4}-(0[1-9]|1[0-2])$') not valid;

alter table public.budgets
  validate constraint budgets_month_check;

alter table public.categories
  add column if not exists sort_order integer;

alter table public.categories
  drop constraint if exists categories_sort_order_check;

alter table public.categories
  add constraint categories_sort_order_check
  check (sort_order is null or sort_order >= 0) not valid;

alter table public.categories
  validate constraint categories_sort_order_check;

create index if not exists categories_user_sort_order_idx
  on public.categories (user_id, sort_order);

create or replace function public.reorder_categories(ordered_ids text[])
returns void
language plpgsql
security invoker
set search_path = ''
as $$
declare
  owner_id uuid := (select auth.uid());
  category_count integer;
begin
  if owner_id is null then
    raise exception using errcode = '42501', message = 'Authentication required';
  end if;

  if ordered_ids is null then
    raise exception using errcode = '22023', message = 'Category order is required';
  end if;

  select count(*)
  into category_count
  from public.categories
  where user_id = owner_id;

  if cardinality(ordered_ids) <> category_count then
    raise exception using errcode = '22023', message = 'Category order is incomplete';
  end if;

  if (select count(distinct ordered.id) from unnest(ordered_ids) as ordered(id))
    <> category_count then
    raise exception using errcode = '22023', message = 'Category order contains duplicates';
  end if;

  if exists (
    select 1
    from unnest(ordered_ids) as ordered(id)
    left join public.categories as category
      on category.user_id = owner_id and category.id = ordered.id
    where category.id is null
  ) then
    raise exception using errcode = '42501', message = 'Category order contains an invalid id';
  end if;

  update public.categories as category
  set sort_order = (ordered.ordinality - 1)::integer,
      updated_at = now()
  from unnest(ordered_ids) with ordinality as ordered(id, ordinality)
  where category.user_id = owner_id
    and category.id = ordered.id;
end
$$;

revoke all on function public.reorder_categories(text[]) from public, anon;
grant execute on function public.reorder_categories(text[]) to authenticated;

-- Mantém importações e backups anteriores compatíveis, preservando a nova ordem
-- somente quando o campo opcional estiver presente no JSON.
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
    insert into public.budgets values (
      owner_id, item->>'id', item->>'categoryId', item->>'month', (item->>'limitCents')::bigint,
      (item->>'createdAt')::timestamptz, (item->>'updatedAt')::timestamptz
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
