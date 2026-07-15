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
});
