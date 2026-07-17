import {
  emptyState,
  type Account,
  type AppSettings,
  type Budget,
  type Category,
  type CreditCard,
  type Goal,
  type PlannerState,
  type Transaction,
} from "../types";
import { applyCategoryOrder } from "../categories";
import type { PlannerRepository, PlannerTable } from "./types";

export class MemoryPlannerRepository implements PlannerRepository {
  constructor(private state: PlannerState = emptyState()) {}
  async readState() {
    return structuredClone(this.state);
  }
  private put<T extends { id: string }>(
    key: "accounts" | "cards" | "categories" | "transactions" | "budgets" | "goals",
    record: T,
  ) {
    const list = this.state[key] as unknown as T[];
    const index = list.findIndex((item) => item.id === record.id);
    if (index >= 0) list[index] = record;
    else list.push(record);
  }
  async saveAccount(record: Account) {
    this.put("accounts", record);
  }
  async saveCard(record: CreditCard) {
    this.put("cards", record);
  }
  async saveTransaction(record: Transaction) {
    this.put("transactions", { ...record, demo: false });
  }
  async saveBudget(record: Budget) {
    this.put("budgets", record);
  }
  async saveGoal(record: Goal) {
    this.put("goals", record);
  }
  async saveCategory(record: Category) {
    this.put("categories", record);
  }
  async reorderCategories(categoryIds: string[]) {
    this.state.categories = applyCategoryOrder(this.state.categories, categoryIds);
  }
  async saveSettings(settings: AppSettings) {
    this.state.settings = settings;
  }
  async removeRecord(table: PlannerTable, id: string) {
    const list = this.state[table] as { id: string }[];
    this.state = { ...this.state, [table]: list.filter((item) => item.id !== id) };
  }
  async replaceState(state: PlannerState) {
    this.state = structuredClone(state);
  }
  async clear() {
    this.state = emptyState();
  }
}
