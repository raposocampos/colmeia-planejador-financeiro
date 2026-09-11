import type { Account, Budget, Category, Goal, Transaction } from "./types";

export interface MonthlyTrendPoint {
  month: string;
  income: number;
  expense: number;
  result: number;
  committed: number;
}

export interface DashboardInsight {
  id: string;
  tone: "positive" | "attention" | "neutral";
  title: string;
  detail: string;
}

export interface MonthProjection {
  status: "projected" | "actual" | "unavailable";
  income: number;
  expense: number;
  result: number;
  elapsedDays: number;
  totalDays: number;
}

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

export const shiftMonth = (month: string, amount: number): string => {
  const [year, monthNumber] = month.split("-").map(Number);
  return currentMonth(new Date(year, monthNumber - 1 + amount, 1));
};

const monthDistance = (start: string, end: string): number => {
  const [startYear, startMonth] = start.split("-").map(Number);
  const [endYear, endMonth] = end.split("-").map(Number);
  return (endYear - startYear) * 12 + endMonth - startMonth;
};

export const isBudgetActiveInMonth = (budget: Budget, month: string): boolean => {
  const distance = monthDistance(budget.month, month);
  if (distance < 0) return false;
  const duration = budget.durationMonths ?? 1;
  return duration === 0 || distance < duration;
};

const isoDate = (date: Date): string =>
  [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");

const dateAtNoon = (value: string): Date => new Date(`${value.slice(0, 10)}T12:00:00`);

const clampedDate = (year: number, month: number, day: number): Date => {
  const lastDay = new Date(year, month + 1, 0).getDate();
  return new Date(year, month, Math.min(day, lastDay), 12);
};

export const nextOccurrenceDate = (
  transaction: Transaction,
  reference = new Date(),
): string => {
  const start = dateAtNoon(transaction.date);
  const today = new Date(
    reference.getFullYear(),
    reference.getMonth(),
    reference.getDate(),
    12,
  );
  if (transaction.recurrence === "none" || start >= today) return isoDate(start);

  if (transaction.recurrence === "weekly") {
    const elapsedDays = Math.floor((today.getTime() - start.getTime()) / 86_400_000);
    const weeks = Math.ceil(elapsedDays / 7);
    const candidate = new Date(start);
    candidate.setDate(start.getDate() + weeks * 7);
    return isoDate(candidate);
  }

  if (transaction.recurrence === "monthly") {
    const elapsedMonths =
      (today.getFullYear() - start.getFullYear()) * 12 +
      today.getMonth() -
      start.getMonth();
    let candidate = clampedDate(
      start.getFullYear(),
      start.getMonth() + Math.max(0, elapsedMonths),
      start.getDate(),
    );
    if (candidate < today)
      candidate = clampedDate(
        start.getFullYear(),
        start.getMonth() + elapsedMonths + 1,
        start.getDate(),
      );
    return isoDate(candidate);
  }

  let candidate = clampedDate(
    Math.max(start.getFullYear(), today.getFullYear()),
    start.getMonth(),
    start.getDate(),
  );
  if (candidate < today)
    candidate = clampedDate(
      candidate.getFullYear() + 1,
      start.getMonth(),
      start.getDate(),
    );
  return isoDate(candidate);
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

export const monthlyTrend = (
  transactions: Transaction[],
  month: string,
  length: 6 | 12 = 6,
): MonthlyTrendPoint[] =>
  Array.from({ length }, (_, index) => shiftMonth(month, index - length + 1)).map(
    (trendMonth) => ({
      month: trendMonth,
      ...summarizeMonth(transactions, trendMonth),
    }),
  );

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
    .filter((item) => item.type === "expense" && item.status === "paid")
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
  month = budget.month,
): { used: number; remaining: number; percent: number; status: string } => {
  const used = transactions
    .filter(
      (item) =>
        item.type === "expense" &&
        item.categoryId === budget.categoryId &&
        item.date.startsWith(month),
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

export const projectMonth = (
  transactions: Transaction[],
  month: string,
  reference = new Date(),
): MonthProjection => {
  const referenceMonth = currentMonth(reference);
  const summary = summarizeMonth(transactions, month);
  const [year, monthNumber] = month.split("-").map(Number);
  const totalDays = new Date(year, monthNumber, 0).getDate();

  if (month < referenceMonth)
    return {
      status: "actual",
      income: summary.income,
      expense: summary.expense,
      result: summary.result,
      elapsedDays: totalDays,
      totalDays,
    };

  if (
    month > referenceMonth ||
    reference.getDate() < 3 ||
    (!summary.income && !summary.expense)
  )
    return {
      status: "unavailable",
      income: summary.income,
      expense: summary.expense,
      result: summary.result,
      elapsedDays: month === referenceMonth ? reference.getDate() : 0,
      totalDays,
    };

  const elapsedDays = Math.min(reference.getDate(), totalDays);
  const income = Math.round((summary.income / elapsedDays) * totalDays);
  const expense = Math.round((summary.expense / elapsedDays) * totalDays);
  return {
    status: "projected",
    income,
    expense,
    result: income - expense,
    elapsedDays,
    totalDays,
  };
};

export const buildDashboardInsights = (
  transactions: Transaction[],
  categories: Category[],
  budgets: Budget[],
  goals: Goal[],
  month: string,
): DashboardInsight[] => {
  const insights: DashboardInsight[] = [];
  const current = summarizeMonth(transactions, month);
  const previous = summarizeMonth(transactions, previousMonth(month));
  const categoryById = new Map(categories.map((category) => [category.id, category]));

  const budgetAlerts = budgets
    .filter((budget) => isBudgetActiveInMonth(budget, month))
    .map((budget) => ({
      budget,
      progress: budgetProgress(budget, transactions, month),
    }))
    .filter(({ progress }) => progress.percent >= 80)
    .sort((left, right) => right.progress.percent - left.progress.percent);

  if (budgetAlerts.length) {
    const { budget, progress } = budgetAlerts[0];
    const categoryName = categoryById.get(budget.categoryId)?.name ?? "uma categoria";
    insights.push({
      id: `budget-${budget.id}`,
      tone: "attention",
      title:
        progress.percent > 100
          ? `O orçamento de ${categoryName} ultrapassou o limite.`
          : `O orçamento de ${categoryName} já chegou a ${progress.percent}%.`,
      detail:
        progress.percent > 100
          ? `O valor acima do planejado é ${formatBRL(progress.used - budget.limitCents)}.`
          : `Ainda restam ${formatBRL(progress.remaining)} neste mês.`,
    });
  }

  if (current.result < 0) {
    insights.push({
      id: "negative-result",
      tone: "attention",
      title: "As despesas estão acima das receitas neste mês.",
      detail: `A diferença atual é ${formatBRL(Math.abs(current.result))}. Rever as maiores categorias pode ajudar.`,
    });
  } else if (current.income > 0) {
    insights.push({
      id: "positive-result",
      tone: "positive",
      title: "O mês está com saldo positivo.",
      detail: `${formatBRL(current.result)} permanecem disponíveis após as despesas pagas.`,
    });
  }

  const currentCategories = categoryTotals(transactions, categories, month);
  const previousCategories = new Map(
    categoryTotals(transactions, categories, previousMonth(month)).map((item) => [
      item.id,
      item.value,
    ]),
  );
  const comparableCategories = currentCategories
    .map((item) => {
      const previousValue = previousCategories.get(item.id) ?? 0;
      return {
        ...item,
        previousValue,
        change:
          previousValue > 0
            ? Math.round(((item.value - previousValue) / previousValue) * 100)
            : 0,
      };
    })
    .filter((item) => item.previousValue > 0 && Math.abs(item.change) >= 10)
    .sort((left, right) => Math.abs(right.change) - Math.abs(left.change));

  if (comparableCategories.length) {
    const category = comparableCategories[0];
    const decreased = category.change < 0;
    insights.push({
      id: `category-${category.id}`,
      tone: decreased ? "positive" : "attention",
      title: `${category.name} ${decreased ? "diminuiu" : "aumentou"} ${Math.abs(category.change)}%.`,
      detail: `Comparação com ${previousMonth(month)}: ${formatBRL(category.previousValue)} para ${formatBRL(category.value)}.`,
    });
  } else if (
    previous.income === 0 &&
    previous.expense === 0 &&
    currentCategories.length
  ) {
    insights.push({
      id: "first-comparison",
      tone: "neutral",
      title: "Este mês inicia seu histórico de comparação.",
      detail:
        "Continue registrando as movimentações para acompanhar tendências nos próximos meses.",
    });
  }

  if (insights.length < 3 && goals.length) {
    const goal = [...goals]
      .map((item) => ({ item, progress: goalProgress(item) }))
      .sort((left, right) => right.progress.percent - left.progress.percent)[0];
    insights.push({
      id: `goal-${goal.item.id}`,
      tone: goal.progress.percent >= 75 ? "positive" : "neutral",
      title: `${goal.item.name} está ${goal.progress.percent}% concluída.`,
      detail:
        goal.progress.remaining > 0
          ? `Faltam ${formatBRL(goal.progress.remaining)} para alcançar a meta.`
          : "Meta concluída. Vale registrar o próximo objetivo.",
    });
  }

  if (!insights.length)
    insights.push({
      id: "empty-month",
      tone: "neutral",
      title: "Seu painel ganhará contexto com as primeiras movimentações.",
      detail: "Registre receitas e despesas para acompanhar o mês com mais clareza.",
    });

  return insights.slice(0, 3);
};
