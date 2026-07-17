import "fake-indexeddb/auto";
import type { SupabaseClient } from "@supabase/supabase-js";
import { describe, expect, it } from "vitest";
import { SupabasePlannerRepository } from "../../app/lib/repositories/supabase";

const account = () => {
  const now = new Date().toISOString();
  return {
    id: "account",
    name: "Conta",
    type: "digital" as const,
    initialBalanceCents: 9090,
    color: "#F8BF4D",
    archived: false,
    createdAt: now,
    updatedAt: now,
  };
};

const client = (fail: boolean, writes: unknown[]): SupabaseClient =>
  ({
    auth: {
      getUser: async () => ({ data: { user: { id: "user-test" } }, error: null }),
    },
    from: (table: string) => ({
      upsert: async (record: unknown) => {
        writes.push({ table, record });
        return { error: fail ? { message: "offline" } : null };
      },
    }),
    rpc: async (name: string, args: unknown) => {
      writes.push({ rpc: name, args });
      return { error: fail ? { message: "offline" } : null };
    },
  }) as unknown as SupabaseClient;

describe("repositório Supabase", () => {
  it("grava remotamente antes de atualizar o cache", async () => {
    const writes: unknown[] = [];
    const matching = new SupabasePlannerRepository(client(false, writes), "user-test");
    await matching.saveAccount(account());
    expect(writes).toHaveLength(1);
    expect((await matching.cache.readState()).accounts[0].initialBalanceCents).toBe(
      9090,
    );
    await matching.cache.clear();
  });

  it("não atualiza o cache quando a gravação remota falha", async () => {
    const repository = new SupabasePlannerRepository(client(true, []), "user-test");
    await expect(repository.saveAccount(account())).rejects.toThrow(
      "Não foi possível sincronizar",
    );
    expect((await repository.cache.readState()).accounts).toEqual([]);
    await repository.cache.clear();
  });

  it("envia o mês do orçamento no formato aceito pelo banco", async () => {
    const writes: unknown[] = [];
    const repository = new SupabasePlannerRepository(
      client(false, writes),
      "user-test",
    );
    const now = new Date().toISOString();
    await repository.saveBudget({
      id: "budget",
      categoryId: "alimentacao",
      month: "2026-07",
      limitCents: 50000,
      createdAt: now,
      updatedAt: now,
    });
    expect(writes[0]).toMatchObject({
      table: "budgets",
      record: { month: "2026-07", limit_cents: 50000 },
    });
    await repository.cache.clear();
  });

  it("reordena por RPC derivando o dono da sessão, sem enviar user_id", async () => {
    const writes: unknown[] = [];
    const repository = new SupabasePlannerRepository(
      client(false, writes),
      "user-test",
    );
    await repository.cache.saveCategory({
      id: "a",
      name: "A",
      kind: "expense",
      color: "#F8BF4D",
      icon: "categoria",
      archived: false,
      createdAt: "2026-07-17T00:00:00.000Z",
      updatedAt: "2026-07-17T00:00:00.000Z",
    });
    await repository.cache.saveCategory({
      id: "b",
      name: "B",
      kind: "expense",
      color: "#F8BF4D",
      icon: "categoria",
      archived: false,
      createdAt: "2026-07-17T00:00:00.000Z",
      updatedAt: "2026-07-17T00:00:00.000Z",
    });
    await repository.reorderCategories(["b", "a"]);
    expect(writes[0]).toEqual({
      rpc: "reorder_categories",
      args: { ordered_ids: ["b", "a"] },
    });
    expect(JSON.stringify(writes[0])).not.toContain("user_id");
    expect(
      (await repository.cache.readState()).categories
        .sort((left, right) => (left.sortOrder ?? 0) - (right.sortOrder ?? 0))
        .map((item) => item.id),
    ).toEqual(["b", "a"]);
    await repository.cache.clear();
  });
});
