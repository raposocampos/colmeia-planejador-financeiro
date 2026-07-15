import Dexie, { type EntityTable } from "dexie";
import {
  defaultCategories,
  demoAccounts,
  demoBudgets,
  demoCards,
  demoGoals,
  demoTransactions,
} from "./demo";
import {
  emptyState,
  initialSettings,
  type Account,
  type AppSettings,
  type Budget,
  type Category,
  type CreditCard,
  type Goal,
  type PlannerState,
  type Transaction,
} from "./types";

type TableName =
  "accounts" | "cards" | "categories" | "transactions" | "budgets" | "goals";
type RecordType = Account | CreditCard | Category | Transaction | Budget | Goal;

class PlannerDatabase extends Dexie {
  accounts!: EntityTable<Account, "id">;
  cards!: EntityTable<CreditCard, "id">;
  categories!: EntityTable<Category, "id">;
  transactions!: EntityTable<Transaction, "id">;
  budgets!: EntityTable<Budget, "id">;
  goals!: EntityTable<Goal, "id">;
  settings!: EntityTable<AppSettings, "id">;

  constructor() {
    super("colmeia-financial-planner");
    this.version(1).stores({
      accounts: "id, name, archived, createdAt",
      cards: "id, name, archived, createdAt",
      categories: "id, name, kind, archived",
      transactions: "id, type, date, categoryId, accountId, creditCardId, status, demo",
      budgets: "id, month, categoryId",
      goals: "id, targetDate",
      settings: "id",
    });
  }
}

let database: PlannerDatabase | null = null;
const getDatabase = (): PlannerDatabase => {
  if (typeof indexedDB === "undefined")
    throw new Error("IndexedDB não está disponível neste navegador.");
  if (!database) database = new PlannerDatabase();
  return database;
};

export const ensureInitialData = async (): Promise<void> => {
  const db = getDatabase();
  if ((await db.categories.count()) === 0)
    await db.categories.bulkPut(defaultCategories);
  if (!(await db.settings.get("settings"))) await db.settings.put(initialSettings());
};

export const readPlannerState = async (): Promise<PlannerState> => {
  await ensureInitialData();
  const db = getDatabase();
  const [accounts, cards, categories, transactions, budgets, goals, settings] =
    await Promise.all([
      db.accounts.toArray(),
      db.cards.toArray(),
      db.categories.toArray(),
      db.transactions.toArray(),
      db.budgets.toArray(),
      db.goals.toArray(),
      db.settings.get("settings"),
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
};

export const putRecord = async (
  table: TableName,
  record: RecordType,
): Promise<void> => {
  await getDatabase().table(table).put(record);
};

export const removeRecord = async (table: TableName, id: string): Promise<void> => {
  await getDatabase().table(table).delete(id);
};

export const saveSettings = async (settings: AppSettings): Promise<void> => {
  await getDatabase().settings.put(settings);
};

export const loadDemoData = async (): Promise<void> => {
  const db = getDatabase();
  await db.transaction(
    "rw",
    [db.accounts, db.cards, db.transactions, db.budgets, db.goals, db.settings],
    async () => {
      await db.accounts.bulkPut(demoAccounts);
      await db.cards.bulkPut(demoCards);
      await db.transactions.bulkPut(demoTransactions);
      await db.budgets.bulkPut(demoBudgets);
      await db.goals.bulkPut(demoGoals);
      const settings = (await db.settings.get("settings")) ?? initialSettings();
      await db.settings.put({
        ...settings,
        demoLoaded: true,
        onboardingComplete: true,
        updatedAt: new Date().toISOString(),
      });
    },
  );
};

export const removeDemoData = async (): Promise<void> => {
  const db = getDatabase();
  await db.transaction(
    "rw",
    [db.accounts, db.cards, db.transactions, db.budgets, db.goals, db.settings],
    async () => {
      await db.accounts.bulkDelete(demoAccounts.map((item) => item.id));
      await db.cards.bulkDelete(demoCards.map((item) => item.id));
      await db.transactions.where("demo").equals(1).delete();
      await db.budgets.bulkDelete(demoBudgets.map((item) => item.id));
      await db.goals.bulkDelete(demoGoals.map((item) => item.id));
      const settings = (await db.settings.get("settings")) ?? initialSettings();
      await db.settings.put({
        ...settings,
        demoLoaded: false,
        updatedAt: new Date().toISOString(),
      });
    },
  );
};

export const replacePlannerState = async (nextState: PlannerState): Promise<void> => {
  const db = getDatabase();
  await db.transaction(
    "rw",
    [
      db.accounts,
      db.cards,
      db.categories,
      db.transactions,
      db.budgets,
      db.goals,
      db.settings,
    ],
    async () => {
      await Promise.all([
        db.accounts.clear(),
        db.cards.clear(),
        db.categories.clear(),
        db.transactions.clear(),
        db.budgets.clear(),
        db.goals.clear(),
        db.settings.clear(),
      ]);
      await Promise.all([
        db.accounts.bulkPut(nextState.accounts),
        db.cards.bulkPut(nextState.cards),
        db.categories.bulkPut(nextState.categories),
        db.transactions.bulkPut(nextState.transactions),
        db.budgets.bulkPut(nextState.budgets),
        db.goals.bulkPut(nextState.goals),
        db.settings.put(nextState.settings),
      ]);
    },
  );
};

export const clearPlannerData = async (): Promise<void> => {
  const db = getDatabase();
  await db.delete();
  database = null;
  const initial = emptyState();
  await ensureInitialData();
  await saveSettings(initial.settings);
};
