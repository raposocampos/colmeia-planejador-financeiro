import { describe, expect, it } from "vitest";
import {
  applyCategoryOrder,
  moveCategoryId,
  sortCategories,
} from "../../app/lib/categories";
import type { Category } from "../../app/lib/types";

const category = (id: string, sortOrder?: number): Category => ({
  id,
  name: id,
  kind: "expense",
  color: "#F8BF4D",
  icon: "categoria",
  archived: false,
  sortOrder,
  createdAt: "2026-07-17T00:00:00.000Z",
  updatedAt: "2026-07-17T00:00:00.000Z",
});

describe("ordem das categorias", () => {
  it("preserva a ordem histórica quando registros antigos não possuem posição", () => {
    const sorted = sortCategories([
      category("transporte"),
      category("moradia"),
      category("alimentacao"),
    ]);
    expect(sorted.map((item) => item.id)).toEqual([
      "moradia",
      "alimentacao",
      "transporte",
    ]);
  });

  it("move uma categoria para qualquer posição sem perder ids", () => {
    expect(moveCategoryId(["a", "b", "c", "d"], "d", "b")).toEqual([
      "a",
      "d",
      "b",
      "c",
    ]);
  });

  it("atribui posições inteiras e rejeita ordens incompletas", () => {
    const ordered = applyCategoryOrder(
      [category("a"), category("b")],
      ["b", "a"],
      "2026-07-17T10:00:00.000Z",
    );
    expect(sortCategories(ordered).map((item) => item.id)).toEqual(["b", "a"]);
    expect(() => applyCategoryOrder(ordered, ["a"])).toThrow(/todas as categorias/);
  });
});
