import { expect, test, type Page } from "@playwright/test";

const browserErrors = new WeakMap<Page, string[]>();

test.beforeEach(async ({ page }) => {
  const errors: string[] = [];
  browserErrors.set(page, errors);
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(`console: ${message.text()}`);
  });
  page.on("pageerror", (error) => errors.push(`pageerror: ${error.message}`));
});

test.afterEach(async ({ page }) => {
  expect(browserErrors.get(page) ?? [], "erros no console do navegador").toEqual([]);
});

const completeOnboarding = async (page: Page) => {
  await expect(page.getByTestId("onboarding-v2")).toBeVisible();
  for (let step = 0; step < 4; step += 1)
    await page.getByRole("button", { name: "Continuar" }).click();
  await page.getByRole("button", { name: "Ir para meu painel" }).click();
};

const switchToLogin = async (page: Page) => {
  await page.getByRole("button", { name: "Entrar", exact: true }).last().click();
};

test("novo usuário confirma sessão simulada, vê onboarding e chega ao painel vazio", async ({
  page,
}) => {
  await page.goto("/?review=flow");
  await page.getByRole("button", { name: "Criar conta" }).click();
  await expect(page.getByRole("heading", { name: "Criar conta" })).toBeVisible();
  await page.getByLabel("Nome").fill("Pessoa Teste");
  await page.getByLabel("E-mail", { exact: true }).fill("pessoa@exemplo.test");
  await page.getByLabel("Senha", { exact: true }).fill("SenhaForte1234");
  await page.getByLabel("Confirmar senha").fill("SenhaForte1234");
  await page.getByLabel(/Termos de Uso/).check();
  await page.getByLabel(/Política de Privacidade/).check();
  await page.getByRole("button", { name: "Criar conta", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Confirme seu e-mail" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Simular e-mail confirmado" }).click();
  await completeOnboarding(page);
  await expect(
    page.getByRole("heading", { name: "Seu dinheiro, com mais clareza." }),
  ).toBeVisible();
  await expect(page.getByText("Nenhuma transação registrada.")).toBeVisible();
});

test("onboarding concluído leva diretamente ao painel", async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem("colmeia-review-session", "confirmed");
    localStorage.setItem("colmeia-review-onboarding", "true");
  });
  await page.goto("/?review=flow");
  await expect(
    page.getByRole("heading", { name: "Seu dinheiro, com mais clareza." }),
  ).toBeVisible();
  await expect(page.getByTestId("onboarding-v2")).toHaveCount(0);
});

test("manter conectado usa armazenamento persistente e sobrevive à recarga", async ({
  page,
}) => {
  await page.goto("/?review=flow");
  await switchToLogin(page);
  await page.getByLabel("E-mail").fill("pessoa@exemplo.test");
  await page.locator('input[name="password"]').fill("SenhaForte1234");
  await page.getByLabel(/Manter-me conectado/).check();
  await page.getByRole("button", { name: "Entrar", exact: true }).first().click();
  await completeOnboarding(page);
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "Seu dinheiro, com mais clareza." }),
  ).toBeVisible();
  expect(
    await page.evaluate(() => localStorage.getItem("colmeia-review-session")),
  ).toBe("confirmed");
});

test("sessão sem manter conectado fica no contexto da sessão atual", async ({
  page,
}) => {
  await page.goto("/?review=flow");
  await switchToLogin(page);
  await page.getByLabel("E-mail").fill("pessoa@exemplo.test");
  await page.locator('input[name="password"]').fill("SenhaForte1234");
  await page.getByRole("button", { name: "Entrar", exact: true }).first().click();
  expect(
    await page.evaluate(() => sessionStorage.getItem("colmeia-review-session")),
  ).toBe("confirmed");
  expect(
    await page.evaluate(() => localStorage.getItem("colmeia-review-session")),
  ).toBeNull();
});

test("migração exibe contagens, backup e importação sem merge silencioso", async ({
  page,
}) => {
  await page.goto("/?review=migration");
  await expect(
    page.getByRole("heading", {
      name: "Encontramos dados deste planejador neste navegador.",
    }),
  ).toBeVisible();
  await expect(page.getByText("48")).toBeVisible();
  await expect(page.getByRole("button", { name: "Fazer backup JSON" })).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Importar para minha conta" }),
  ).toBeVisible();
});

test("dados demonstrativos do tour não aparecem no painel persistente", async ({
  page,
}) => {
  await page.goto("/?review=onboarding");
  await expect(page.getByText("Receitas R$ 4.800,00")).toBeVisible();
  await page.goto("/?review=empty");
  await expect(page.getByText("Receitas R$ 4.800,00")).toHaveCount(0);
  await expect(page.getByText("Nenhuma transação registrada.")).toBeVisible();
});

test("layout de autenticação e painel funciona no viewport do projeto", async ({
  page,
}) => {
  await page.goto("/?review=login");
  await expect(page.getByRole("heading", { name: "Entrar na Colmeia" })).toBeVisible();
  await page.goto("/?review=profile");
  await expect(page.getByRole("heading", { name: "Configurações" })).toBeVisible();
  await expect(page.getByText("Perfil e sessão")).toBeVisible();
});
