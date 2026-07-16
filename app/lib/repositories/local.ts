import {
  clearPlannerData,
  putRecord,
  readPlannerState,
  removeRecord,
  replacePlannerState,
  saveSettings,
} from "../db";
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
import type { PlannerRepository, PlannerTable } from "./types";

export class LocalPlannerRepository implements PlannerRepository {
  readState = readPlannerState;
  saveAccount = (record: Account) => putRecord("accounts", record);
  saveCard = (record: CreditCard) => putRecord("cards", record);
  saveTransaction = (record: Transaction) => putRecord("transactions", record);
  saveBudget = (record: Budget) => putRecord("budgets", record);
  saveGoal = (record: Goal) => putRecord("goals", record);
  saveCategory = (record: Category) => putRecord("categories", record);
  saveSettings = (settings: AppSettings) => saveSettings(settings);
  removeRecord = (table: PlannerTable, id: string) => removeRecord(table, id);
  replaceState = (state: PlannerState) => replacePlannerState(state);
  clear = clearPlannerData;
}
