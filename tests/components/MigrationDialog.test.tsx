import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { MigrationDialog } from "../../app/components/MigrationDialog";

describe("migração segura", () => {
  it("foca o título, mostra contagens e opções sem substituir silenciosamente", () => {
    render(
      <MigrationDialog
        counts={{
          accounts: 1,
          cards: 2,
          transactions: 3,
          budgets: 4,
          goals: 5,
          customCategories: 6,
        }}
        remoteHasData={false}
        onBackup={vi.fn()}
        onImport={async () => undefined}
        onUseCloud={vi.fn()}
        onCancel={vi.fn()}
      />,
    );
    expect(screen.getByRole("heading", { name: /Encontramos dados/ })).toHaveFocus();
    expect(screen.getByRole("button", { name: "Fazer backup JSON" })).toBeVisible();
    expect(
      screen.getByRole("button", { name: "Importar para minha conta" }),
    ).toBeVisible();
    expect(
      screen.getByRole("button", { name: "Continuar sem importar" }),
    ).toBeVisible();
  });

  it("bloqueia merge automático quando a nuvem já tem dados", () => {
    render(
      <MigrationDialog
        counts={{
          accounts: 1,
          cards: 0,
          transactions: 1,
          budgets: 0,
          goals: 0,
          customCategories: 0,
        }}
        remoteHasData
        onBackup={vi.fn()}
        onImport={async () => undefined}
        onUseCloud={vi.fn()}
        onCancel={vi.fn()}
      />,
    );
    expect(
      screen.queryByRole("button", { name: "Importar para minha conta" }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Usar os dados da nuvem" }),
    ).toBeVisible();
  });
});
