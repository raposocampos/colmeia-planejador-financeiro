import type { SupabaseClient } from "@supabase/supabase-js";
import {
  initialSettings,
  type Account,
  type AppSettings,
  type Budget,
  type Category,
  type CreditCard,
  type Goal,
  type PlannerState,
  type Transaction,
} from "../types";
import { AuthenticatedCacheRepository } from "./cache";
import type { PlannerRepository, PlannerTable } from "./types";

type RemoteRow = Record<string, unknown>;

const errorMessage = (error: { message: string } | null): string | null =>
  error?.message ?? null;
const requireNoError = (error: { message: string } | null): void => {
  const message = errorMessage(error);
  if (message) throw new Error(`Não foi possível sincronizar os dados. ${message}`);
};

const baseToRemote = (record: {
  id: string;
  createdAt: string;
  updatedAt: string;
}) => ({
  id: record.id,
  created_at: record.createdAt,
  updated_at: record.updatedAt,
});

const accountToRemote = (record: Account) => ({
  ...baseToRemote(record),
  name: record.name,
  type: record.type,
  institution: record.institution ?? null,
  initial_balance_cents: record.initialBalanceCents,
  color: record.color,
  archived: record.archived,
});
const cardToRemote = (record: CreditCard) => ({
  ...baseToRemote(record),
  name: record.name,
  limit_cents: record.limitCents,
  closing_day: record.closingDay,
  due_day: record.dueDay,
  payment_account_id: record.paymentAccountId ?? null,
  color: record.color,
  archived: record.archived,
});
const categoryToRemote = (record: Category) => ({
  ...baseToRemote(record),
  name: record.name,
  kind: record.kind,
  color: record.color,
  icon: record.icon,
  archived: record.archived,
});
const transactionToRemote = (record: Transaction) => ({
  ...baseToRemote(record),
  type: record.type,
  description: record.description,
  amount_cents: record.amountCents,
  date: record.date,
  category_id: record.categoryId ?? null,
  account_id: record.accountId ?? null,
  destination_account_id: record.destinationAccountId ?? null,
  credit_card_id: record.creditCardId ?? null,
  payment_method: record.paymentMethod ?? null,
  notes: record.notes ?? null,
  tags: record.tags,
  recurrence: record.recurrence,
  status: record.status,
});
const budgetToRemote = (record: Budget) => ({
  ...baseToRemote(record),
  category_id: record.categoryId,
  month: record.month,
  limit_cents: record.limitCents,
});
const goalToRemote = (record: Goal) => ({
  ...baseToRemote(record),
  name: record.name,
  target_cents: record.targetCents,
  current_cents: record.currentCents,
  target_date: record.targetDate ?? null,
  account_id: record.accountId ?? null,
  color: record.color,
  icon: record.icon,
});

const text = (row: RemoteRow, key: string): string => String(row[key] ?? "");
const optionalText = (row: RemoteRow, key: string): string | undefined =>
  row[key] === null || row[key] === undefined ? undefined : String(row[key]);
const number = (row: RemoteRow, key: string): number => Number(row[key] ?? 0);
const boolean = (row: RemoteRow, key: string): boolean => Boolean(row[key]);
const baseFromRemote = (row: RemoteRow) => ({
  id: text(row, "id"),
  createdAt: text(row, "created_at"),
  updatedAt: text(row, "updated_at"),
});

export class SupabasePlannerRepository implements PlannerRepository {
  readonly cache: AuthenticatedCacheRepository;

  constructor(
    private readonly client: SupabaseClient,
    private readonly userId: string,
  ) {
    this.cache = new AuthenticatedCacheRepository(userId);
  }

  private async assertSession(): Promise<void> {
    const { data, error } = await this.client.auth.getUser();
    requireNoError(error);
    if (data.user?.id !== this.userId)
      throw new Error("A sessão mudou. Entre novamente.");
  }

  async readRemoteState(): Promise<PlannerState> {
    await this.assertSession();
    const results = await Promise.all([
      this.client.from("accounts").select("*"),
      this.client.from("credit_cards").select("*"),
      this.client.from("categories").select("*"),
      this.client.from("transactions").select("*"),
      this.client.from("budgets").select("*"),
      this.client.from("goals").select("*"),
      this.client.from("user_settings").select("*").maybeSingle(),
    ]);
    for (const result of results) requireNoError(result.error);
    const [accounts, cards, categories, transactions, budgets, goals, settings] =
      results;
    const settingsRow = (settings.data ?? {}) as RemoteRow;
    return {
      accounts: ((accounts.data ?? []) as RemoteRow[]).map((row) => ({
        ...baseFromRemote(row),
        name: text(row, "name"),
        type: text(row, "type") as Account["type"],
        institution: optionalText(row, "institution"),
        initialBalanceCents: number(row, "initial_balance_cents"),
        color: text(row, "color"),
        archived: boolean(row, "archived"),
      })),
      cards: ((cards.data ?? []) as RemoteRow[]).map((row) => ({
        ...baseFromRemote(row),
        name: text(row, "name"),
        limitCents: number(row, "limit_cents"),
        closingDay: number(row, "closing_day"),
        dueDay: number(row, "due_day"),
        paymentAccountId: optionalText(row, "payment_account_id"),
        color: text(row, "color"),
        archived: boolean(row, "archived"),
      })),
      categories: ((categories.data ?? []) as RemoteRow[]).map((row) => ({
        ...baseFromRemote(row),
        name: text(row, "name"),
        kind: text(row, "kind") as Category["kind"],
        color: text(row, "color"),
        icon: text(row, "icon"),
        archived: boolean(row, "archived"),
      })),
      transactions: ((transactions.data ?? []) as RemoteRow[]).map((row) => ({
        ...baseFromRemote(row),
        type: text(row, "type") as Transaction["type"],
        description: text(row, "description"),
        amountCents: number(row, "amount_cents"),
        date: text(row, "date"),
        categoryId: optionalText(row, "category_id"),
        accountId: optionalText(row, "account_id"),
        destinationAccountId: optionalText(row, "destination_account_id"),
        creditCardId: optionalText(row, "credit_card_id"),
        paymentMethod: optionalText(row, "payment_method"),
        notes: optionalText(row, "notes"),
        tags: Array.isArray(row.tags) ? row.tags.map(String) : [],
        recurrence: text(row, "recurrence") as Transaction["recurrence"],
        status: text(row, "status") as Transaction["status"],
        demo: false,
      })),
      budgets: ((budgets.data ?? []) as RemoteRow[]).map((row) => ({
        ...baseFromRemote(row),
        categoryId: text(row, "category_id"),
        month: text(row, "month"),
        limitCents: number(row, "limit_cents"),
      })),
      goals: ((goals.data ?? []) as RemoteRow[]).map((row) => ({
        ...baseFromRemote(row),
        name: text(row, "name"),
        targetCents: number(row, "target_cents"),
        currentCents: number(row, "current_cents"),
        targetDate: optionalText(row, "target_date"),
        accountId: optionalText(row, "account_id"),
        color: text(row, "color"),
        icon: text(row, "icon"),
      })),
      settings: {
        ...initialSettings(),
        onboardingComplete: true,
        demoLoaded: false,
        currency: "BRL",
        locale: "pt-BR",
        timezone: text(settingsRow, "timezone") || "America/Sao_Paulo",
        version: 1,
        updatedAt: text(settingsRow, "updated_at") || new Date().toISOString(),
      },
    };
  }

  async readState(): Promise<PlannerState> {
    if (typeof navigator !== "undefined" && !navigator.onLine)
      return this.cache.readState();
    try {
      const state = await this.readRemoteState();
      await this.cache.replaceState(state);
      return state;
    } catch (error) {
      const cached = await this.cache.readState();
      const hasCache =
        cached.accounts.length + cached.categories.length + cached.transactions.length >
        0;
      if (hasCache) return cached;
      throw error;
    }
  }

  private async upsert(
    table: string,
    remote: RemoteRow,
    cacheWrite: () => Promise<void>,
  ): Promise<void> {
    await this.assertSession();
    const { error } = await this.client.from(table).upsert(remote);
    requireNoError(error);
    await cacheWrite();
  }

  saveAccount = (record: Account) =>
    this.upsert("accounts", accountToRemote(record), () =>
      this.cache.saveAccount(record),
    );
  saveCard = (record: CreditCard) =>
    this.upsert("credit_cards", cardToRemote(record), () =>
      this.cache.saveCard(record),
    );
  saveTransaction = (record: Transaction) =>
    this.upsert("transactions", transactionToRemote(record), () =>
      this.cache.saveTransaction({ ...record, demo: false }),
    );
  saveBudget = (record: Budget) =>
    this.upsert("budgets", budgetToRemote(record), () => this.cache.saveBudget(record));
  saveGoal = (record: Goal) =>
    this.upsert("goals", goalToRemote(record), () => this.cache.saveGoal(record));
  saveCategory = (record: Category) =>
    this.upsert("categories", categoryToRemote(record), () =>
      this.cache.saveCategory(record),
    );

  async saveSettings(settings: AppSettings): Promise<void> {
    await this.upsert(
      "user_settings",
      {
        currency: settings.currency,
        locale: settings.locale,
        timezone: settings.timezone,
        schema_version: 2,
        updated_at: settings.updatedAt,
      },
      () =>
        this.cache.saveSettings({
          ...settings,
          onboardingComplete: true,
          demoLoaded: false,
        }),
    );
  }

  async removeRecord(table: PlannerTable, id: string): Promise<void> {
    await this.assertSession();
    const remoteTable = table === "cards" ? "credit_cards" : table;
    const { error } = await this.client.from(remoteTable).delete().eq("id", id);
    requireNoError(error);
    await this.cache.removeRecord(table, id);
  }

  async replaceState(state: PlannerState): Promise<void> {
    await this.assertSession();
    const { error } = await this.client.rpc("replace_planner_state", {
      planner_state: state,
    });
    requireNoError(error);
    const verified = await this.readRemoteState();
    await this.cache.replaceState(verified);
  }

  async clear(): Promise<void> {
    await this.assertSession();
    const { error } = await this.client.rpc("clear_my_planner");
    requireNoError(error);
    await this.cache.clear();
  }

  async migrateLegacy(state: PlannerState, migrationId: string): Promise<PlannerState> {
    await this.assertSession();
    const { error } = await this.client.rpc("migrate_legacy_planner", {
      planner_state: state,
      migration_id: migrationId,
    });
    requireNoError(error);
    const verified = await this.readRemoteState();
    await this.cache.replaceState(verified);
    return verified;
  }
}
