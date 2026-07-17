create extension if not exists pgcrypto;

create table public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  name text not null default '',
  onboarding_completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.accounts (
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  id text not null,
  name text not null,
  type text not null check (type in ('checking','digital','savings','wallet','cash','investment','other')),
  institution text,
  initial_balance_cents bigint not null default 0,
  color text not null,
  archived boolean not null default false,
  created_at timestamptz not null,
  updated_at timestamptz not null,
  primary key (user_id, id)
);

create table public.credit_cards (
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  id text not null,
  name text not null,
  limit_cents bigint not null default 0,
  closing_day smallint not null check (closing_day between 1 and 31),
  due_day smallint not null check (due_day between 1 and 31),
  payment_account_id text,
  color text not null,
  archived boolean not null default false,
  created_at timestamptz not null,
  updated_at timestamptz not null,
  primary key (user_id, id),
  foreign key (user_id, payment_account_id) references public.accounts(user_id, id)
);

create table public.categories (
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  id text not null,
  name text not null,
  kind text not null check (kind in ('income','expense','both')),
  color text not null,
  icon text not null,
  archived boolean not null default false,
  created_at timestamptz not null,
  updated_at timestamptz not null,
  primary key (user_id, id)
);

create table public.transactions (
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  id text not null,
  type text not null check (type in ('income','expense','transfer')),
  description text not null,
  amount_cents bigint not null check (amount_cents >= 0),
  date date not null,
  category_id text,
  account_id text,
  destination_account_id text,
  credit_card_id text,
  payment_method text,
  notes text,
  tags text[] not null default '{}',
  recurrence text not null check (recurrence in ('none','weekly','monthly','yearly')),
  status text not null check (status in ('paid','pending')),
  created_at timestamptz not null,
  updated_at timestamptz not null,
  primary key (user_id, id),
  foreign key (user_id, category_id) references public.categories(user_id, id),
  foreign key (user_id, account_id) references public.accounts(user_id, id),
  foreign key (user_id, destination_account_id) references public.accounts(user_id, id),
  foreign key (user_id, credit_card_id) references public.credit_cards(user_id, id)
);

create table public.budgets (
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  id text not null,
  category_id text not null,
  month text not null check (month ~ '^\\d{4}-(0[1-9]|1[0-2])$'),
  limit_cents bigint not null check (limit_cents >= 0),
  created_at timestamptz not null,
  updated_at timestamptz not null,
  primary key (user_id, id),
  foreign key (user_id, category_id) references public.categories(user_id, id)
);

create table public.goals (
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  id text not null,
  name text not null,
  target_cents bigint not null check (target_cents >= 0),
  current_cents bigint not null check (current_cents >= 0),
  target_date date,
  account_id text,
  color text not null,
  icon text not null,
  created_at timestamptz not null,
  updated_at timestamptz not null,
  primary key (user_id, id),
  foreign key (user_id, account_id) references public.accounts(user_id, id)
);

create table public.user_settings (
  user_id uuid primary key default auth.uid() references auth.users(id) on delete cascade,
  currency text not null default 'BRL' check (currency = 'BRL'),
  locale text not null default 'pt-BR',
  timezone text not null default 'America/Sao_Paulo',
  schema_version integer not null default 2,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.data_migrations (
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  id uuid not null,
  schema_version integer not null,
  source text not null check (source in ('legacy-indexeddb','json-import')),
  record_counts jsonb not null,
  migrated_at timestamptz not null default now(),
  primary key (user_id, id)
);

create index profiles_user_id_idx on public.profiles(user_id);
create index accounts_user_id_idx on public.accounts(user_id);
create index credit_cards_user_id_idx on public.credit_cards(user_id);
create index categories_user_id_idx on public.categories(user_id);
create index transactions_user_id_idx on public.transactions(user_id);
create index transactions_user_date_idx on public.transactions(user_id, date desc);
create index transactions_user_category_idx on public.transactions(user_id, category_id);
create index budgets_user_id_idx on public.budgets(user_id);
create index budgets_user_month_idx on public.budgets(user_id, month);
create index goals_user_id_idx on public.goals(user_id);
create index user_settings_user_id_idx on public.user_settings(user_id);
create index data_migrations_user_id_idx on public.data_migrations(user_id);

alter table public.profiles enable row level security;
alter table public.accounts enable row level security;
alter table public.credit_cards enable row level security;
alter table public.categories enable row level security;
alter table public.transactions enable row level security;
alter table public.budgets enable row level security;
alter table public.goals enable row level security;
alter table public.user_settings enable row level security;
alter table public.data_migrations enable row level security;

do $policies$
declare
  table_name text;
begin
  foreach table_name in array array[
    'profiles','accounts','credit_cards','categories','transactions',
    'budgets','goals','user_settings','data_migrations'
  ] loop
    execute format(
      'create policy %I on public.%I for select to authenticated using ((select auth.uid()) = user_id)',
      table_name || '_select_own', table_name
    );
    execute format(
      'create policy %I on public.%I for insert to authenticated with check ((select auth.uid()) = user_id)',
      table_name || '_insert_own', table_name
    );
    execute format(
      'create policy %I on public.%I for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id)',
      table_name || '_update_own', table_name
    );
    execute format(
      'create policy %I on public.%I for delete to authenticated using ((select auth.uid()) = user_id)',
      table_name || '_delete_own', table_name
    );
  end loop;
end
$policies$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  now_iso timestamptz := now();
begin
  insert into public.profiles (user_id, name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'name', ''));

  insert into public.user_settings (user_id)
  values (new.id);

  insert into public.categories
    (user_id, id, name, kind, color, icon, archived, created_at, updated_at)
  values
    (new.id, 'moradia', 'Moradia', 'expense', '#F8BF4D', 'casa', false, now_iso, now_iso),
    (new.id, 'alimentacao', 'Alimentação', 'expense', '#FBB321', 'talher', false, now_iso, now_iso),
    (new.id, 'transporte', 'Transporte', 'expense', '#FFC639', 'carro', false, now_iso, now_iso),
    (new.id, 'saude', 'Saúde', 'expense', '#ED8A4B', 'coração', false, now_iso, now_iso),
    (new.id, 'educacao', 'Educação', 'expense', '#8D6E45', 'livro', false, now_iso, now_iso),
    (new.id, 'lazer', 'Lazer', 'expense', '#D79D18', 'estrela', false, now_iso, now_iso),
    (new.id, 'assinaturas', 'Assinaturas', 'expense', '#A66B16', 'play', false, now_iso, now_iso),
    (new.id, 'compras', 'Compras', 'expense', '#D4843C', 'sacola', false, now_iso, now_iso),
    (new.id, 'pets', 'Pets', 'expense', '#B78B60', 'pata', false, now_iso, now_iso),
    (new.id, 'dividas', 'Dívidas', 'expense', '#A6502C', 'alerta', false, now_iso, now_iso),
    (new.id, 'investimentos', 'Investimentos', 'both', '#5A7348', 'crescimento', false, now_iso, now_iso),
    (new.id, 'salario', 'Salário', 'income', '#47704E', 'carteira', false, now_iso, now_iso),
    (new.id, 'renda-extra', 'Renda extra', 'income', '#6D8C54', 'mais', false, now_iso, now_iso),
    (new.id, 'outros', 'Outros', 'both', '#7C746A', 'círculo', false, now_iso, now_iso);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

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
    insert into public.categories values (
      owner_id, item->>'id', item->>'name', item->>'kind', item->>'color', item->>'icon',
      coalesce((item->>'archived')::boolean,false), (item->>'createdAt')::timestamptz,
      (item->>'updatedAt')::timestamptz
    ) on conflict (user_id,id) do update set
      name=excluded.name, kind=excluded.kind, color=excluded.color, icon=excluded.icon,
      archived=excluded.archived, updated_at=excluded.updated_at;
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

create or replace function public.replace_planner_state(planner_state jsonb)
returns jsonb
language plpgsql
security invoker
set search_path = ''
as $$
declare owner_id uuid := (select auth.uid());
declare result jsonb;
begin
  if owner_id is null then raise exception 'authentication_required'; end if;
  delete from public.transactions where user_id=owner_id;
  delete from public.budgets where user_id=owner_id;
  delete from public.goals where user_id=owner_id;
  delete from public.credit_cards where user_id=owner_id;
  delete from public.accounts where user_id=owner_id;
  delete from public.categories where user_id=owner_id;
  delete from public.data_migrations where user_id=owner_id;
  select public.migrate_legacy_planner(planner_state, gen_random_uuid()) into result;
  return result;
end;
$$;

create or replace function public.clear_my_planner()
returns void
language plpgsql
security invoker
set search_path = ''
as $$
declare owner_id uuid := (select auth.uid());
begin
  if owner_id is null then raise exception 'authentication_required'; end if;
  delete from public.transactions where user_id=owner_id;
  delete from public.budgets where user_id=owner_id;
  delete from public.goals where user_id=owner_id;
  delete from public.credit_cards where user_id=owner_id;
  delete from public.accounts where user_id=owner_id;
  delete from public.categories where user_id=owner_id;
  delete from public.data_migrations where user_id=owner_id;
  insert into public.categories
    (user_id, id, name, kind, color, icon, archived, created_at, updated_at)
  values
    (owner_id, 'moradia', 'Moradia', 'expense', '#F8BF4D', 'casa', false, now(), now()),
    (owner_id, 'alimentacao', 'Alimentação', 'expense', '#FBB321', 'talher', false, now(), now()),
    (owner_id, 'transporte', 'Transporte', 'expense', '#FFC639', 'carro', false, now(), now()),
    (owner_id, 'saude', 'Saúde', 'expense', '#ED8A4B', 'coração', false, now(), now()),
    (owner_id, 'educacao', 'Educação', 'expense', '#8D6E45', 'livro', false, now(), now()),
    (owner_id, 'lazer', 'Lazer', 'expense', '#D79D18', 'estrela', false, now(), now()),
    (owner_id, 'assinaturas', 'Assinaturas', 'expense', '#A66B16', 'play', false, now(), now()),
    (owner_id, 'compras', 'Compras', 'expense', '#D4843C', 'sacola', false, now(), now()),
    (owner_id, 'pets', 'Pets', 'expense', '#B78B60', 'pata', false, now(), now()),
    (owner_id, 'dividas', 'Dívidas', 'expense', '#A6502C', 'alerta', false, now(), now()),
    (owner_id, 'investimentos', 'Investimentos', 'both', '#5A7348', 'crescimento', false, now(), now()),
    (owner_id, 'salario', 'Salário', 'income', '#47704E', 'carteira', false, now(), now()),
    (owner_id, 'renda-extra', 'Renda extra', 'income', '#6D8C54', 'mais', false, now(), now()),
    (owner_id, 'outros', 'Outros', 'both', '#7C746A', 'círculo', false, now(), now());
end;
$$;

create or replace function public.delete_my_account()
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare owner_id uuid := (select auth.uid());
begin
  if owner_id is null then raise exception 'authentication_required'; end if;
  delete from auth.users where id = owner_id;
end;
$$;

revoke all on function public.migrate_legacy_planner(jsonb,uuid) from public, anon;
revoke all on function public.replace_planner_state(jsonb) from public, anon;
revoke all on function public.clear_my_planner() from public, anon;
revoke all on function public.delete_my_account() from public, anon;
grant execute on function public.migrate_legacy_planner(jsonb,uuid) to authenticated;
grant execute on function public.replace_planner_state(jsonb) to authenticated;
grant execute on function public.clear_my_planner() to authenticated;
grant execute on function public.delete_my_account() to authenticated;
