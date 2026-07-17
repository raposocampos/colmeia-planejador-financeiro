import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { EntryModal } from "../../app/components/EntryModal";
import type { Category } from "../../app/lib/types";

const categories: Category[] = [
  {
    id: "alimentacao",
    name: "Alimentação",
    kind: "expense",
    color: "#F8BF4D",
    icon: "talher",
    archived: false,
    sortOrder: 0,
    createdAt: "2026-07-17T00:00:00.000Z",
    updatedAt: "2026-07-17T00:00:00.000Z",
  },
  {
    id: "arquivada",
    name: "Arquivada",
    kind: "expense",
    color: "#777777",
    icon: "categoria",
    archived: true,
    sortOrder: 1,
    createdAt: "2026-07-17T00:00:00.000Z",
    updatedAt: "2026-07-17T00:00:00.000Z",
  },
];

describe("modal de registros", () => {
  it("exibe somente categorias configuradas e seleciona a primeira ativa", () => {
    render(
      <EntryModal
        modal={{ kind: "transaction", transactionType: "expense" }}
        accounts={[]}
        cards={[]}
        categories={categories}
        onClose={vi.fn()}
        onSubmit={vi.fn()}
      />,
    );
    const select = screen.getByRole("combobox", { name: "Categoria" });
    expect(select).toHaveValue("alimentacao");
    expect(screen.queryByRole("option", { name: "Sem categoria" })).toBeNull();
    expect(screen.queryByRole("option", { name: "Arquivada" })).toBeNull();
  });
});
