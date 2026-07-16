-- Keep API privileges explicit so production can disable automatic table exposure.
-- Row Level Security remains the final ownership boundary for authenticated users.

revoke all privileges on table
  public.profiles,
  public.accounts,
  public.credit_cards,
  public.categories,
  public.transactions,
  public.budgets,
  public.goals,
  public.user_settings,
  public.data_migrations
from public, anon;

grant usage on schema public to authenticated;

grant select, update on table public.profiles to authenticated;

grant select, insert, update, delete on table
  public.accounts,
  public.credit_cards,
  public.categories,
  public.transactions,
  public.budgets,
  public.goals,
  public.user_settings,
  public.data_migrations
to authenticated;

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
