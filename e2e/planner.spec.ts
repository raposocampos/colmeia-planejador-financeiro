import { expect, test } from "@playwright/test";

test("onboarding, conta, transação, orçamento, meta, backup e persistência", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Pular por agora" }).click();
  await expect(
    page.getByRole("heading", { name: "Seu dinheiro, com mais clareza." }),
  ).toBeVisible();

  await page
    .locator(".sidebar")
    .getByRole("button", { name: "Contas e cartões" })
    .click();
  await page.getByRole("button", { name: "Adicionar conta" }).click();
  await page.getByLabel("Nome da conta").fill("Conta teste");
  await page.getByLabel("Saldo inicial").fill("1.000,00");
  await page.getByTestId("modal-save").click();
  await expect(page.getByText("Conta teste")).toBeVisible();

  await page.getByRole("button", { name: "Nova transação" }).click();
  await page.getByTestId("transaction-description").fill("Mercado teste");
  await page.getByTestId("transaction-amount").fill("125,50");
  await page.getByLabel("Conta", { exact: true }).selectOption({
    label: "Conta teste",
  });
  await page.getByLabel("Categoria").selectOption({ label: "Alimentação" });
  await page.getByTestId("modal-save").click();

  await page.locator(".sidebar").getByRole("button", { name: "Visão geral" }).click();
  await expect(page.getByText("Mercado teste")).toBeVisible();

  await page.locator(".sidebar").getByRole("button", { name: "Orçamentos" }).click();
  await page.getByRole("button", { name: "Criar orçamento" }).click();
  await page.getByLabel("Categoria").selectOption({ label: "Alimentação" });
  await page.getByLabel("Limite planejado").fill("500,00");
  await page.getByTestId("modal-save").click();
  await expect(page.getByText("Você ainda tem")).toBeVisible();

  await page.locator(".sidebar").getByRole("button", { name: "Metas" }).click();
  await page.getByRole("button", { name: "Criar meta" }).click();
  await page.getByLabel("Nome da meta").fill("Reserva teste");
  await page.getByLabel("Valor-alvo").fill("2.000,00");
  await page.getByLabel("Valor atual").fill("500,00");
  await page.getByTestId("modal-save").click();
  await expect(page.getByText("Reserva teste")).toBeVisible();

  await page.locator(".sidebar").getByRole("button", { name: "Configurações" }).click();
  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: "Exportar JSON" }).click();
  await download;

  await page.reload();
  await page.locator(".sidebar").getByRole("button", { name: "Transações" }).click();
  await expect(page.getByText("Mercado teste")).toBeVisible();
});

test("navegação compacta permanece acessível em viewport móvel", async ({
  page,
}, testInfo) => {
  test.skip(!testInfo.project.name.includes("mobile"), "Fluxo exclusivo mobile");
  await page.goto("/");
  if (await page.getByRole("button", { name: "Pular por agora" }).isVisible())
    await page.getByRole("button", { name: "Pular por agora" }).click();
  await expect(page.getByRole("navigation", { name: "Navegação móvel" })).toBeVisible();
  await page
    .getByRole("navigation", { name: "Navegação móvel" })
    .getByRole("button", { name: "Transações" })
    .click();
  await expect(page.getByRole("heading", { name: "Transações" })).toBeVisible();
});
