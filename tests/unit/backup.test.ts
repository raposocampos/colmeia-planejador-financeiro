import { describe, expect, it } from "vitest";
import { createBackup, parseBackup } from "../../app/lib/backup";
import { emptyState } from "../../app/lib/types";

describe("backup", () => {
  it("exporta e valida um backup versionado", () => {
    const backup = createBackup(emptyState());
    expect(parseBackup(JSON.stringify(backup))).toEqual(backup);
  });

  it("recusa JSON inválido", () => {
    expect(() => parseBackup("{incompleto")).toThrow("JSON válido");
  });

  it("recusa arquivos que não pertencem à aplicação", () => {
    expect(() => parseBackup(JSON.stringify({ hello: "world" }))).toThrow(
      "Backup incompatível",
    );
  });

  it("interpreta orçamento de backup antigo como plano de um mês", () => {
    const backup = createBackup({
      ...emptyState(),
      budgets: [
        {
          id: "budget-legacy",
          categoryId: "alimentacao",
          month: "2026-09",
          limitCents: 50000,
          createdAt: "2026-09-01T12:00:00.000Z",
          updatedAt: "2026-09-01T12:00:00.000Z",
        },
      ],
    });
    const parsed = parseBackup(JSON.stringify(backup));
    expect(parsed.data.budgets[0].durationMonths).toBe(1);
  });
});
