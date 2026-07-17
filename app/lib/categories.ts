import type { Category } from "./types";

const defaultCategoryOrder = [
  "moradia",
  "alimentacao",
  "transporte",
  "saude",
  "educacao",
  "lazer",
  "assinaturas",
  "compras",
  "pets",
  "dividas",
  "investimentos",
  "salario",
  "renda-extra",
  "outros",
];

const fallbackOrder = (category: Category): number => {
  const defaultIndex = defaultCategoryOrder.indexOf(category.id);
  if (defaultIndex >= 0) return defaultIndex;
  return 10_000;
};

export const sortCategories = (categories: Category[]): Category[] =>
  [...categories].sort((left, right) => {
    const leftOrder = Number.isInteger(left.sortOrder)
      ? (left.sortOrder as number)
      : fallbackOrder(left);
    const rightOrder = Number.isInteger(right.sortOrder)
      ? (right.sortOrder as number)
      : fallbackOrder(right);
    return (
      leftOrder - rightOrder ||
      left.createdAt.localeCompare(right.createdAt) ||
      left.id.localeCompare(right.id)
    );
  });

export const moveCategoryId = (
  orderedIds: string[],
  categoryId: string,
  targetId: string,
): string[] => {
  const from = orderedIds.indexOf(categoryId);
  const to = orderedIds.indexOf(targetId);
  if (from < 0 || to < 0 || from === to) return orderedIds;
  const next = [...orderedIds];
  const [moved] = next.splice(from, 1);
  next.splice(to, 0, moved);
  return next;
};

export const applyCategoryOrder = (
  categories: Category[],
  orderedIds: string[],
  updatedAt = new Date().toISOString(),
): Category[] => {
  const uniqueIds = new Set(orderedIds);
  if (uniqueIds.size !== categories.length || orderedIds.length !== categories.length)
    throw new Error("A ordem precisa incluir todas as categorias uma única vez.");
  if (categories.some((category) => !uniqueIds.has(category.id)))
    throw new Error("A ordem contém uma categoria inválida.");
  const positions = new Map(orderedIds.map((id, index) => [id, index]));
  return categories.map((category) => ({
    ...category,
    sortOrder: positions.get(category.id),
    updatedAt,
  }));
};
