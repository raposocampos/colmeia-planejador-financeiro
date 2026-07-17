import { z } from "zod";
import type { BackupData, PlannerState } from "./types";

const base = z.object({
  id: z.string().min(1),
  createdAt: z.string().min(1),
  updatedAt: z.string().min(1),
});

const account = base.extend({
  name: z.string().min(1),
  type: z.string(),
  institution: z.string().optional(),
  initialBalanceCents: z.number().int(),
  color: z.string(),
  archived: z.boolean(),
});
const card = base.extend({
  name: z.string().min(1),
  limitCents: z.number().int().nonnegative(),
  closingDay: z.number().int().min(1).max(31),
  dueDay: z.number().int().min(1).max(31),
  paymentAccountId: z.string().optional(),
  color: z.string(),
  archived: z.boolean(),
});
const category = base.extend({
  name: z.string().min(1),
  kind: z.enum(["income", "expense", "both"]),
  color: z.string(),
  icon: z.string(),
  archived: z.boolean(),
  sortOrder: z.number().int().nonnegative().optional(),
});
const transaction = base.extend({
  type: z.enum(["income", "expense", "transfer"]),
  description: z.string().min(1),
  amountCents: z.number().int().positive(),
  date: z.string().min(10),
  categoryId: z.string().optional(),
  accountId: z.string().optional(),
  destinationAccountId: z.string().optional(),
  creditCardId: z.string().optional(),
  paymentMethod: z.string().optional(),
  notes: z.string().optional(),
  tags: z.array(z.string()),
  recurrence: z.enum(["none", "weekly", "monthly", "yearly"]),
  status: z.enum(["paid", "pending"]),
  demo: z.boolean(),
});
const budget = base.extend({
  categoryId: z.string(),
  month: z.string().regex(/^\d{4}-\d{2}$/),
  limitCents: z.number().int().positive(),
});
const goal = base.extend({
  name: z.string(),
  targetCents: z.number().int().positive(),
  currentCents: z.number().int().nonnegative(),
  targetDate: z.string().optional(),
  accountId: z.string().optional(),
  color: z.string(),
  icon: z.string(),
});
const settings = z.object({
  id: z.literal("settings"),
  onboardingComplete: z.boolean(),
  demoLoaded: z.boolean(),
  currency: z.literal("BRL"),
  locale: z.literal("pt-BR"),
  timezone: z.string(),
  version: z.literal(1),
  updatedAt: z.string(),
});

export const backupSchema = z.object({
  metadata: z.object({
    app: z.literal("colmeia-educacao-financeira"),
    version: z.literal(1),
    exportedAt: z.string(),
  }),
  data: z.object({
    accounts: z.array(account),
    cards: z.array(card),
    categories: z.array(category),
    transactions: z.array(transaction),
    budgets: z.array(budget),
    goals: z.array(goal),
    settings,
  }),
});

export const createBackup = (state: PlannerState): BackupData => ({
  metadata: {
    app: "colmeia-educacao-financeira",
    version: 1,
    exportedAt: new Date().toISOString(),
  },
  data: state,
});

export const parseBackup = (input: string): BackupData => {
  let parsed: unknown;
  try {
    parsed = JSON.parse(input);
  } catch {
    throw new Error("O arquivo não contém um JSON válido.");
  }
  const result = backupSchema.safeParse(parsed);
  if (!result.success)
    throw new Error(
      "Backup incompatível. Confira se o arquivo foi exportado por esta aplicação.",
    );
  return result.data as BackupData;
};
