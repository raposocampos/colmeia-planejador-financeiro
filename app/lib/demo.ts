import { currentMonth } from "./calculations";
import type { Account, Budget, Category, CreditCard, Goal, Transaction } from "./types";

const now = new Date().toISOString();
const month = currentMonth();
const day = (value: number) => month + "-" + String(value).padStart(2, "0");

export const defaultCategories: Category[] = [
  ["moradia", "Moradia", "expense", "#F8BF4D", "casa"],
  ["alimentacao", "Alimentação", "expense", "#FBB321", "talher"],
  ["transporte", "Transporte", "expense", "#FFC639", "carro"],
  ["saude", "Saúde", "expense", "#ED8A4B", "coração"],
  ["educacao", "Educação", "expense", "#8D6E45", "livro"],
  ["lazer", "Lazer", "expense", "#D79D18", "estrela"],
  ["assinaturas", "Assinaturas", "expense", "#A66B16", "play"],
  ["compras", "Compras", "expense", "#D4843C", "sacola"],
  ["pets", "Pets", "expense", "#B78B60", "pata"],
  ["dividas", "Dívidas", "expense", "#A6502C", "alerta"],
  ["investimentos", "Investimentos", "both", "#5A7348", "crescimento"],
  ["salario", "Salário", "income", "#47704E", "carteira"],
  ["renda-extra", "Renda extra", "income", "#6D8C54", "mais"],
  ["outros", "Outros", "both", "#7C746A", "círculo"],
].map(([id, name, kind, color, icon]) => ({
  id,
  name,
  kind: kind as Category["kind"],
  color,
  icon,
  archived: false,
  createdAt: now,
  updatedAt: now,
}));

export const demoAccounts: Account[] = [
  {
    id: "demo-account-main",
    name: "Conta principal",
    type: "digital",
    institution: "Banco fictício",
    initialBalanceCents: 185000,
    color: "#F8BF4D",
    archived: false,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "demo-account-wallet",
    name: "Carteira",
    type: "wallet",
    initialBalanceCents: 12000,
    color: "#FFE161",
    archived: false,
    createdAt: now,
    updatedAt: now,
  },
];

export const demoCards: CreditCard[] = [
  {
    id: "demo-card",
    name: "Cartão Colmeia",
    limitCents: 500000,
    closingDay: 22,
    dueDay: 2,
    paymentAccountId: "demo-account-main",
    color: "#231F20",
    archived: false,
    createdAt: now,
    updatedAt: now,
  },
];

export const demoTransactions: Transaction[] = [
  ["income", "Salário", 520000, day(5), "salario", "paid", false],
  ["expense", "Aluguel", 160000, day(7), "moradia", "paid", false],
  ["expense", "Supermercado", 68450, day(10), "alimentacao", "paid", true],
  ["expense", "Transporte", 23400, day(12), "transporte", "paid", true],
  ["expense", "Internet", 11990, day(15), "assinaturas", "paid", true],
  ["expense", "Veterinário", 28000, day(18), "pets", "paid", true],
  ["expense", "Cinema e café", 12600, day(20), "lazer", "paid", true],
  ["expense", "Academia", 9990, day(25), "saude", "pending", false],
].map(([type, description, amountCents, date, categoryId, status, card], index) => ({
  id: "demo-transaction-" + index,
  type: type as Transaction["type"],
  description: String(description),
  amountCents: Number(amountCents),
  date: String(date),
  categoryId: String(categoryId),
  accountId: "demo-account-main",
  creditCardId: card ? "demo-card" : undefined,
  paymentMethod: card ? "Crédito" : "Conta",
  tags: [],
  recurrence:
    description === "Salário" || description === "Aluguel" ? "monthly" : "none",
  status: status as Transaction["status"],
  demo: true,
  createdAt: now,
  updatedAt: now,
}));

export const demoBudgets: Budget[] = [
  {
    id: "demo-budget-food",
    categoryId: "alimentacao",
    month,
    limitCents: 85000,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "demo-budget-leisure",
    categoryId: "lazer",
    month,
    limitCents: 30000,
    createdAt: now,
    updatedAt: now,
  },
];

export const demoGoals: Goal[] = [
  {
    id: "demo-goal",
    name: "Reserva de emergência",
    targetCents: 1500000,
    currentCents: 465000,
    targetDate: new Date(new Date().setMonth(new Date().getMonth() + 12))
      .toISOString()
      .slice(0, 10),
    accountId: "demo-account-main",
    color: "#FBC108",
    icon: "escudo",
    createdAt: now,
    updatedAt: now,
  },
];
