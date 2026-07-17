import type {
  Account,
  AppSettings,
  Budget,
  Category,
  CreditCard,
  Goal,
  PlannerState,
  Transaction,
} from "../types";

export type PlannerTable =
  "accounts" | "cards" | "categories" | "transactions" | "budgets" | "goals";

export type PlannerRecord =
  Account | CreditCard | Category | Transaction | Budget | Goal;

export interface PlannerRepository {
  readState(): Promise<PlannerState>;
  saveAccount(record: Account): Promise<void>;
  saveCard(record: CreditCard): Promise<void>;
  saveTransaction(record: Transaction): Promise<void>;
  saveBudget(record: Budget): Promise<void>;
  saveGoal(record: Goal): Promise<void>;
  saveCategory(record: Category): Promise<void>;
  reorderCategories(categoryIds: string[]): Promise<void>;
  saveSettings(settings: AppSettings): Promise<void>;
  removeRecord(table: PlannerTable, id: string): Promise<void>;
  replaceState(state: PlannerState): Promise<void>;
  clear(): Promise<void>;
}

export const saveRecord = (
  repository: PlannerRepository,
  table: PlannerTable,
  record: PlannerRecord,
): Promise<void> => {
  switch (table) {
    case "accounts":
      return repository.saveAccount(record as Account);
    case "cards":
      return repository.saveCard(record as CreditCard);
    case "categories":
      return repository.saveCategory(record as Category);
    case "transactions":
      return repository.saveTransaction(record as Transaction);
    case "budgets":
      return repository.saveBudget(record as Budget);
    case "goals":
      return repository.saveGoal(record as Goal);
  }
};
