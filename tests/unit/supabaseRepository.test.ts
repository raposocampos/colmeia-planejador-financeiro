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
});
