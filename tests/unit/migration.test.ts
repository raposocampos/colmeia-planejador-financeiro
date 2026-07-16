import { describe, expect, it } from "vitest";
import { defaultCategories, demoAccounts, demoTransactions } from "../../app/lib/demo";
import {
  compareMigrationCounts,
  countLegacyData,
  hasLegacyData,
  hasRemoteFinancialData,
  migrationIdForState,
  sanitizeLegacyState,
  validatePlannerReferences,
} from "../../app/lib/migration";
import { emptyState, type PlannerState } from "../../app/lib/types";

const usedState = (): PlannerState => {
  const state = emptyState();
  const now = new Date().toISOString();
  state.categories = defaultCategories;
  state.accounts = [
    {
      id: "account-user",
      name: "Minha conta",
      type: "digital",
      initialBalanceCents: 12345,
      color: "#F8BF4D",
      archived: false,
      createdAt: now,
      updatedAt: now,
    },
    ...demoAccounts,
  ];
  state.transactions = [
    {
      id: "transaction-user",
      type: "expense",
      description: "Registro",
      amountCents: 1099,
      date: "2026-07-16",
      accountId: "account-user",
      categoryId: "alimentacao",
      tags: [],
      recurrence: "none",
      status: "paid",
      demo: false,
      createdAt: now,
      updatedAt: now,
    },
    ...demoTransactions,
  ];
  return state;
};

describe("migração do IndexedDB legado", () => {
  it("não considera apenas categorias padrão como uso", () => {
    const state = emptyState();
    state.categories = defaultCategories;
    expect(hasLegacyData(state)).toBe(false);
    expect(hasRemoteFinancialData(state)).toBe(false);
  });

  it("conta dados reais e remove demonstração antes de migrar", () => {
    const state = usedState();
    expect(countLegacyData(state)).toMatchObject({
      accounts: 1,
      transactions: 1,
      customCategories: 0,
    });
    const clean = sanitizeLegacyState(state);
    expect(clean.accounts).toHaveLength(1);
    expect(clean.transactions).toHaveLength(1);
    expect(clean.transactions[0].amountCents).toBe(1099);
  });

  it("produz ID idempotente e sensível ao conteúdo", () => {
    const state = usedState();
    const first = migrationIdForState(state);
    expect(migrationIdForState(structuredClone(state))).toBe(first);
    state.transactions[0].amountCents += 1;
    expect(migrationIdForState(state)).not.toBe(first);
    expect(first).toMatch(/^[0-9a-f-]{36}$/);
  });

  it("valida referências e contagens antes/depois", () => {
    const local = sanitizeLegacyState(usedState());
    expect(validatePlannerReferences(local)).toEqual([]);
    expect(compareMigrationCounts(local, structuredClone(local))).toEqual([]);
    local.transactions[0].accountId = "missing";
    expect(validatePlannerReferences(local)[0]).toContain("conta inexistente");
  });
});
