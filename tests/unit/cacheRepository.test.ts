import "fake-indexeddb/auto";
import { describe, expect, it } from "vitest";
import { AuthenticatedCacheRepository } from "../../app/lib/repositories/cache";

describe("cache autenticado", () => {
  it("separa bancos por usuário e preserva centavos", async () => {
    const now = new Date().toISOString();
    const first = new AuthenticatedCacheRepository(`user-a-${crypto.randomUUID()}`);
    const second = new AuthenticatedCacheRepository(`user-b-${crypto.randomUUID()}`);
    await first.saveAccount({
      id: "same-id",
      name: "Conta A",
      type: "digital",
      initialBalanceCents: 12345,
      color: "#F8BF4D",
      archived: false,
      createdAt: now,
      updatedAt: now,
    });
    expect((await first.readState()).accounts[0].initialBalanceCents).toBe(12345);
    expect((await second.readState()).accounts).toEqual([]);
    await first.clear();
    await second.clear();
  });
});
