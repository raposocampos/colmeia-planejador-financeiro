import { describe, expect, it } from "vitest";
import { MemoryPlannerRepository } from "../../app/lib/repositories/memory";

describe("painel de novo usuário", () => {
  it("começa sem contas, transações, orçamentos ou metas", async () => {
    const state = await new MemoryPlannerRepository().readState();
    expect(state.accounts).toEqual([]);
    expect(state.transactions).toEqual([]);
    expect(state.budgets).toEqual([]);
    expect(state.goals).toEqual([]);
  });
});
