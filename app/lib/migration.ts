import { defaultCategories } from "./demo";
import type { PlannerState } from "./types";

const defaultCategoryIds = new Set(defaultCategories.map((category) => category.id));

export interface LegacyCounts {
  accounts: number;
  cards: number;
  transactions: number;
  budgets: number;
  goals: number;
  customCategories: number;
}

export const sanitizeLegacyState = (state: PlannerState): PlannerState => ({
  ...state,
  accounts: state.accounts.filter((record) => !record.id.startsWith("demo-")),
  cards: state.cards.filter((record) => !record.id.startsWith("demo-")),
  transactions: state.transactions.filter(
    (record) => !record.demo && !record.id.startsWith("demo-"),
  ),
  budgets: state.budgets.filter((record) => !record.id.startsWith("demo-")),
  goals: state.goals.filter((record) => !record.id.startsWith("demo-")),
  settings: { ...state.settings, demoLoaded: false },
});

export const countLegacyData = (state: PlannerState): LegacyCounts => {
  const clean = sanitizeLegacyState(state);
  return {
    accounts: clean.accounts.length,
    cards: clean.cards.length,
    transactions: clean.transactions.length,
    budgets: clean.budgets.length,
    goals: clean.goals.length,
    customCategories: clean.categories.filter(
      (category) => !defaultCategoryIds.has(category.id),
    ).length,
  };
};

export const hasLegacyData = (state: PlannerState): boolean =>
  Object.values(countLegacyData(state)).some((count) => count > 0);

export const hasRemoteFinancialData = (state: PlannerState): boolean =>
  state.accounts.length +
    state.cards.length +
    state.transactions.length +
    state.budgets.length +
    state.goals.length +
    state.categories.filter((category) => !defaultCategoryIds.has(category.id)).length >
  0;

export const validatePlannerReferences = (state: PlannerState): string[] => {
  const accountIds = new Set(state.accounts.map((record) => record.id));
  const cardIds = new Set(state.cards.map((record) => record.id));
  const categoryIds = new Set(state.categories.map((record) => record.id));
  const failures: string[] = [];

  for (const card of state.cards)
    if (card.paymentAccountId && !accountIds.has(card.paymentAccountId))
      failures.push(`Cartão ${card.id} referencia uma conta inexistente.`);
  for (const transaction of state.transactions) {
    if (transaction.accountId && !accountIds.has(transaction.accountId))
      failures.push(`Transação ${transaction.id} referencia uma conta inexistente.`);
    if (
      transaction.destinationAccountId &&
      !accountIds.has(transaction.destinationAccountId)
    )
      failures.push(`Transação ${transaction.id} referencia um destino inexistente.`);
    if (transaction.creditCardId && !cardIds.has(transaction.creditCardId))
      failures.push(`Transação ${transaction.id} referencia um cartão inexistente.`);
    if (transaction.categoryId && !categoryIds.has(transaction.categoryId))
      failures.push(
        `Transação ${transaction.id} referencia uma categoria inexistente.`,
      );
  }
  for (const budget of state.budgets)
    if (!categoryIds.has(budget.categoryId))
      failures.push(`Orçamento ${budget.id} referencia uma categoria inexistente.`);
  for (const goal of state.goals)
    if (goal.accountId && !accountIds.has(goal.accountId))
      failures.push(`Meta ${goal.id} referencia uma conta inexistente.`);
  return failures;
};

export const compareMigrationCounts = (
  local: PlannerState,
  remote: PlannerState,
): string[] => {
  const expected = sanitizeLegacyState(local);
  const keys = [
    "accounts",
    "cards",
    "categories",
    "transactions",
    "budgets",
    "goals",
  ] as const;
  return keys.flatMap((key) =>
    expected[key].length === remote[key].length
      ? []
      : [`${key}: esperado ${expected[key].length}, recebido ${remote[key].length}`],
  );
};

const stableValue = (value: unknown): unknown => {
  if (Array.isArray(value)) return value.map(stableValue);
  if (value && typeof value === "object")
    return Object.fromEntries(
      Object.entries(value)
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([key, entry]) => [key, stableValue(entry)]),
    );
  return value;
};

const stableState = (state: PlannerState): string =>
  JSON.stringify(stableValue(sanitizeLegacyState(state)));

export const migrationIdForState = (state: PlannerState): string => {
  const input = stableState(state);
  const hashes = [2166136261, 33554467, 374761393, 668265263];
  for (let index = 0; index < input.length; index += 1) {
    for (let lane = 0; lane < hashes.length; lane += 1) {
      hashes[lane] ^= input.charCodeAt(index) + lane;
      hashes[lane] = Math.imul(hashes[lane], 16777619) >>> 0;
    }
  }
  const hex = hashes.map((hash) => hash.toString(16).padStart(8, "0")).join("");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-4${hex.slice(13, 16)}-a${hex.slice(17, 20)}-${hex.slice(20, 32)}`;
};
