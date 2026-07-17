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

  it("persiste a ordem das categorias sem remover registros", async () => {
    const now = new Date().toISOString();
    const repository = new MemoryPlannerRepository();
    for (const id of ["a", "b"]) {
      await repository.saveCategory({
        id,
        name: id,
        kind: "expense",
        color: "#F8BF4D",
        icon: "categoria",
        archived: false,
        createdAt: now,
        updatedAt: now,
      });
    }
    await repository.reorderCategories(["b", "a"]);
    const state = await repository.readState();
    expect(state.categories).toHaveLength(2);
    expect(
      state.categories
        .sort((left, right) => (left.sortOrder ?? 0) - (right.sortOrder ?? 0))
        .map((item) => item.id),
    ).toEqual(["b", "a"]);
  });
});
