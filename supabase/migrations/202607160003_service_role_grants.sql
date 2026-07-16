-- Projects with automatic table exposure disabled also need an explicit
-- administrative grant for server-side maintenance and isolation tests.

grant usage on schema public to service_role;

grant all privileges on table
  public.profiles,
  public.accounts,
  public.credit_cards,
  public.categories,
  public.transactions,
  public.budgets,
  public.goals,
  public.user_settings,
  public.data_migrations
to service_role;
