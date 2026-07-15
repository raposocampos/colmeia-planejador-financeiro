import type { Account, Budget, Category, Goal, Transaction } from "./types";

export const formatBRL = (cents: number): string =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(cents / 100);

export const formatDate = (date: string): string => {
  const [year, month, day] = date.slice(0, 10).split("-");
  return day && month && year ? [day, month, year].join("/") : date;
};

export const parseMoney = (value: string | number): number => {
  if (typeof value === "number") return Math.round(value * 100);
  const clean = value.replace(/[R$\s]/g, "");
  const normalized = clean.includes(",")
    ? clean.replace(/\./g, "").replace(",", ".")
    : clean;
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? Math.round(parsed * 100) : 0;
};

export const currentMonth = (date = new Date()): string =>
  [date.getFullYear(), String(date.getMonth() + 1).padStart(2, "0")].join("-");

export const previousMonth = (month: string): string => {
  const [year, monthNumber] = month.split("-").map(Number);
  return currentMonth(new Date(year, monthNumber - 2, 1));
};

export const transactionsInMonth = (
  transactions: Transaction[],
  month: string,
): Transaction[] => transactions.filter((item) => item.date.startsWith(month));

export const summarizeMonth = (
  transactions: Transaction[],
  month: string,
): { income: number; expense: number; result: number; committed: number } => {
  const monthItems = transactionsInMonth(transactions, month).filter(
    (item) => item.status === "paid",
  );
  const income = monthItems
    .filter((item) => item.type === "income")
    .reduce((total, item) => total + item.amountCents, 0);
  const expense = monthItems
    .filter((item) => item.type === "expense")
    .reduce((total, item) => total + item.amountCents, 0);
  return {
    income,
    expense,
    result: income - expense,
    committed: income > 0 ? Math.round((expense / income) * 100) : 0,
  };
};

export const accountBalance = (account: Account, transactions: Transaction[]): number =>
  transactions.reduce((balance, item) => {
    if (item.status !== "paid") return balance;
    if (item.type === "income" && item.accountId === account.id)
      return balance + item.amountCents;
    if (item.type === "expense" && item.accountId === account.id && !item.creditCardId)
      return balance - item.amountCents;
    if (item.type === "transfer" && item.accountId === account.id)
      return balance - item.amountCents;
    if (item.type === "transfer" && item.destinationAccountId === account.id)
      return balance + item.amountCents;
    return balance;
  }, account.initialBalanceCents);

export const totalBalance = (
  accounts: Account[],
  transactions: Transaction[],
): number =>
  accounts
    .filter((account) => !account.archived)
    .reduce((total, account) => total + accountBalance(account, transactions), 0);

export const categoryTotals = (
  transactions: Transaction[],
  categories: Category[],
  month: string,
): Array<{ id: string; name: string; color: string; value: number }> => {
  const totals = new Map<string, number>();
  transactionsInMonth(transactions, month)
    .filter((item) => item.type === "expense")
    .forEach((item) => {
      if (!item.categoryId) return;
      totals.set(
        item.categoryId,
        (totals.get(item.categoryId) ?? 0) + item.amountCents,
      );
    });
  return categories
    .map((category) => ({
      id: category.id,
      name: category.name,
      color: category.color,
      value: totals.get(category.id) ?? 0,
    }))
    .filter((item) => item.value > 0)
    .sort((a, b) => b.value - a.value);
};

export const budgetProgress = (
  budget: Budget,
  transactions: Transaction[],
): { used: number; remaining: number; percent: number; status: string } => {
  const used = transactions
    .filter(
      (item) =>
        item.type === "expense" &&
        item.categoryId === budget.categoryId &&
        item.date.startsWith(budget.month),
    )
    .reduce((total, item) => total + item.amountCents, 0);
  const percent =
    budget.limitCents > 0 ? Math.round((used / budget.limitCents) * 100) : 0;
  return {
    used,
    remaining: Math.max(budget.limitCents - used, 0),
    percent,
    status: percent > 100 ? "exceeded" : percent >= 80 ? "warning" : "normal",
  };
};

export const goalProgress = (
  goal: Goal,
): { remaining: number; percent: number; monthlySuggestion?: number } => {
  const remaining = Math.max(goal.targetCents - goal.currentCents, 0);
  const percent =
    goal.targetCents > 0
      ? Math.min(100, Math.round((goal.currentCents / goal.targetCents) * 100))
      : 0;
  if (!goal.targetDate) return { remaining, percent };
  const target = new Date(goal.targetDate + "T12:00:00");
  const now = new Date();
  const months = Math.max(
    1,
    (target.getFullYear() - now.getFullYear()) * 12 +
      target.getMonth() -
      now.getMonth(),
  );
  return { remaining, percent, monthlySuggestion: Math.ceil(remaining / months) };
};

export const comparisonPercent = (current: number, previous: number): number => {
  if (previous === 0) return current === 0 ? 0 : 100;
  return Math.round(((current - previous) / Math.abs(previous)) * 100);
};
