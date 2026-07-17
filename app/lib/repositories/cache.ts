import Dexie, { type EntityTable } from "dexie";
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
import type { PlannerRepository, PlannerTable } from "./types";

class UserCacheDatabase extends Dexie {
  accounts!: EntityTable<Account, "id">;
  cards!: EntityTable<CreditCard, "id">;
  categories!: EntityTable<Category, "id">;
  transactions!: EntityTable<Transaction, "id">;
  budgets!: EntityTable<Budget, "id">;
  goals!: EntityTable<Goal, "id">;
  settings!: EntityTable<AppSettings, "id">;

  constructor(userId: string) {
    super(`colmeia-financial-planner-cache-${userId}`);
    this.version(1).stores({
      accounts: "id, archived, updatedAt",
      cards: "id, archived, updatedAt",
      categories: "id, kind, archived, updatedAt",
      transactions:
        "id, type, date, categoryId, accountId, creditCardId, status, updatedAt",
      budgets: "id, month, categoryId, updatedAt",
      goals: "id, targetDate, updatedAt",
      settings: "id",
    });
  }
}

export class AuthenticatedCacheRepository implements PlannerRepository {
  private readonly database: UserCacheDatabase;

  constructor(userId: string) {
    this.database = new UserCacheDatabase(userId);
  }

  async readState(): Promise<PlannerState> {
    const [accounts, cards, categories, transactions, budgets, goals, settings] =
      await Promise.all([
        this.database.accounts.toArray(),
        this.database.cards.toArray(),
        this.database.categories.toArray(),
        this.database.transactions.toArray(),
        this.database.budgets.toArray(),
        this.database.goals.toArray(),
        this.database.settings.get("settings"),
      ]);
    return {
      accounts,
      cards,
      categories,
      transactions,
      budgets,
      goals,
      settings: settings ?? initialSettings(),
    };
  }

  saveAccount = (record: Account) =>
    this.database.accounts.put(record).then(() => undefined);
  saveCard = (record: CreditCard) =>
    this.database.cards.put(record).then(() => undefined);
  saveTransaction = (record: Transaction) =>
    this.database.transactions.put(record).then(() => undefined);
  saveBudget = (record: Budget) =>
    this.database.budgets.put(record).then(() => undefined);
  saveGoal = (record: Goal) => this.database.goals.put(record).then(() => undefined);
  saveCategory = (record: Category) =>
    this.database.categories.put(record).then(() => undefined);
  saveSettings = (settings: AppSettings) =>
    this.database.settings.put(settings).then(() => undefined);
  removeRecord = (table: PlannerTable, id: string) =>
    this.database
      .table(table)
      .delete(id)
      .then(() => undefined);

  async replaceState(state: PlannerState): Promise<void> {
    await this.database.transaction("rw", this.database.tables, async () => {
      await Promise.all(this.database.tables.map((table) => table.clear()));
      await Promise.all([
        this.database.accounts.bulkPut(state.accounts),
        this.database.cards.bulkPut(state.cards),
        this.database.categories.bulkPut(state.categories),
        this.database.transactions.bulkPut(state.transactions),
        this.database.budgets.bulkPut(state.budgets),
        this.database.goals.bulkPut(state.goals),
        this.database.settings.put(state.settings),
      ]);
    });
  }

  async clear(): Promise<void> {
    await this.database.delete();
  }
}
