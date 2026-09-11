import { describe, expect, it } from "vitest";
import {
  accountBalance,
  budgetProgress,
  categoryTotals,
  comparisonPercent,
  formatBRL,
  goalProgress,
  isBudgetActiveInMonth,
  nextOccurrenceDate,
  parseMoney,
  previousMonth,
  shiftMonth,
  summarizeMonth,
  totalBalance,
  transactionsInMonth,
} from "../../app/lib/calculations";
import type { Account, Budget, Category, Goal, Transaction } from "../../app/lib/types";

const now = "2026-07-15T12:00:00.000Z";
const account: Account = {
  id: "a1",
  name: "Principal",
  type: "digital",
  initialBalanceCents: 100000,
  color: "#F8BF4D",
  archived: false,
  createdAt: now,
  updatedAt: now,
};
const transactions: Transaction[] = [
  {
    id: "t1",
    type: "income",
    description: "Salário",
    amountCents: 500000,
    date: "2026-07-05",
    accountId: "a1",
    categoryId: "salary",
    tags: [],
    recurrence: "monthly",
    status: "paid",
    demo: false,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "t2",
    type: "expense",
    description: "Mercado",
    amountCents: 80000,
    date: "2026-07-10",
    accountId: "a1",
    categoryId: "food",
    tags: [],
    recurrence: "none",
    status: "paid",
    demo: false,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "t3",
    type: "expense",
    description: "Conta futura",
    amountCents: 20000,
    date: "2026-07-20",
    accountId: "a1",
    categoryId: "food",
    tags: [],
    recurrence: "none",
    status: "pending",
    demo: false,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "t4",
    type: "expense",
    description: "Mês anterior",
    amountCents: 40000,
    date: "2026-06-20",
    accountId: "a1",
    categoryId: "food",
    tags: [],
    recurrence: "none",
    status: "paid",
    demo: false,
    createdAt: now,
    updatedAt: now,
  },
];

describe("cálculos financeiros", () => {
  it("formata centavos em reais", () => {
    expect(formatBRL(123456)).toContain("1.234,56");
  });

  it("interpreta valor monetário brasileiro sem ponto flutuante oficial", () => {
    expect(parseMoney("R$ 1.234,56")).toBe(123456);
    expect(parseMoney("42,10")).toBe(4210);
  });

  it("soma receitas e despesas pagas do mês", () => {
    expect(summarizeMonth(transactions, "2026-07")).toEqual({
      income: 500000,
      expense: 80000,
      result: 420000,
      committed: 16,
    });
  });

  it("calcula saldo da conta", () => {
    expect(accountBalance(account, transactions)).toBe(480000);
  });

  it("ignora contas arquivadas no saldo total", () => {
    expect(totalBalance([{ ...account, archived: true }], transactions)).toBe(0);
  });

  it("filtra transações por período", () => {
    expect(transactionsInMonth(transactions, "2026-07")).toHaveLength(3);
  });

  it("calcula percentual e restante de orçamento", () => {
    const budget: Budget = {
      id: "b1",
      categoryId: "food",
      month: "2026-07",
      limitCents: 100000,
      createdAt: now,
      updatedAt: now,
    };
    expect(budgetProgress(budget, transactions)).toMatchObject({
      used: 100000,
      remaining: 0,
      percent: 100,
      status: "warning",
    });
  });

  it("mantém o orçamento ativo durante o período escolhido", () => {
    const budget: Budget = {
      id: "b1",
      categoryId: "food",
      month: "2026-07",
      limitCents: 100000,
      durationMonths: 3,
      createdAt: now,
      updatedAt: now,
    };
    expect(isBudgetActiveInMonth(budget, "2026-07")).toBe(true);
    expect(isBudgetActiveInMonth(budget, "2026-09")).toBe(true);
    expect(isBudgetActiveInMonth(budget, "2026-10")).toBe(false);
    expect(isBudgetActiveInMonth({ ...budget, durationMonths: 0 }, "2028-01")).toBe(
      true,
    );
  });

  it("calcula o realizado do orçamento no mês selecionado", () => {
    const budget: Budget = {
      id: "b1",
      categoryId: "food",
      month: "2026-06",
      limitCents: 100000,
      durationMonths: 3,
      createdAt: now,
      updatedAt: now,
    };
    expect(budgetProgress(budget, transactions, "2026-07").used).toBe(100000);
  });

  it("calcula a próxima data real de desconto das recorrências", () => {
    const monthly = {
      ...transactions[1],
      date: "2026-08-06",
      recurrence: "monthly" as const,
    };
    expect(nextOccurrenceDate(monthly, new Date(2026, 8, 7))).toBe("2026-10-06");
    expect(
      nextOccurrenceDate({ ...monthly, date: "2026-01-31" }, new Date(2026, 1, 1)),
    ).toBe("2026-02-28");
    expect(
      nextOccurrenceDate(
        { ...monthly, date: "2026-09-09", recurrence: "none" },
        new Date(2026, 8, 7),
      ),
    ).toBe("2026-09-09");
  });

  it("calcula valor restante de uma meta", () => {
    const goal: Goal = {
      id: "g1",
      name: "Reserva",
      targetCents: 1000000,
      currentCents: 250000,
      color: "#FBC108",
      icon: "meta",
      createdAt: now,
      updatedAt: now,
    };
    expect(goalProgress(goal)).toEqual({ remaining: 750000, percent: 25 });
  });

  it("compara períodos e atravessa a virada do ano", () => {
    expect(comparisonPercent(120, 100)).toBe(20);
    expect(previousMonth("2026-01")).toBe("2025-12");
    expect(shiftMonth("2026-01", -1)).toBe("2025-12");
  });

  it("agrega gastos por categoria", () => {
    const categories: Category[] = [
      {
        id: "food",
        name: "Alimentação",
        kind: "expense",
        color: "#F8BF4D",
        icon: "talher",
        archived: false,
        createdAt: now,
        updatedAt: now,
      },
    ];
    expect(categoryTotals(transactions, categories, "2026-07")[0]).toMatchObject({
      name: "Alimentação",
      value: 100000,
    });
  });
});
