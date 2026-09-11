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
  await expect(page.getByText("Ainda não há despesas neste mês")).toBeVisible();
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

test("capturas do tour não criam dados no painel persistente", async ({ page }) => {
  await page.goto("/?review=onboarding");
  await expect(
    page.getByRole("img", {
      name: "Tela real da visão geral com resumo financeiro e navegação lateral",
    }),
  ).toBeVisible();
  await page.goto("/?review=empty");
  await expect(page.getByTestId("onboarding-v2")).toHaveCount(0);
  await expect(page.getByText("Ainda não há despesas neste mês")).toBeVisible();
});

test("layout de autenticação e painel funciona no viewport do projeto", async ({
  page,
}) => {
  await page.goto("/?review=login");
  await expect(page.getByRole("heading", { name: "Entrar na Colmeia" })).toBeVisible();
  const loginSpacing = await page.evaluate(() => {
    const card = document.querySelector<HTMLElement>(".auth-card");
    const input = document.querySelector<HTMLElement>(".auth-input");
    if (!card || !input) throw new Error("formulário de login ausente");
    const cardRect = card.getBoundingClientRect();
    const inputRect = input.getBoundingClientRect();
    return {
      left: inputRect.left - cardRect.left,
      right: cardRect.right - inputRect.right,
      viewportOverflow: Math.max(0, cardRect.right - window.innerWidth),
    };
  });
  expect(loginSpacing.left).toBeGreaterThanOrEqual(16);
  expect(loginSpacing.right).toBeGreaterThanOrEqual(16);
  expect(loginSpacing.viewportOverflow).toBe(0);
  await page.goto("/?review=profile");
  await expect(page.getByRole("heading", { name: "Configurações" })).toBeVisible();
  await expect(page.getByText("Perfil e sessão")).toBeVisible();
});

test("sidebar permanece fixa e navegável em todas as abas desktop", async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name === "mobile", "sidebar desktop não existe no mobile");

  await page.goto("/?review=profile");
  const tabs = [
    "Visão geral",
    "Transações",
    "Contas e cartões",
    "Orçamentos",
    "Metas",
    "Relatórios",
    "Configurações",
  ];

  for (const tab of tabs) {
    await page.getByRole("button", { name: tab, exact: true }).click();
    const layout = await page.evaluate(() => {
      const sidebar = document.querySelector<HTMLElement>(".sidebar");
      const primary = document.querySelector<HTMLElement>(".sidebar-primary");
      const footer = document.querySelector<HTMLElement>(".sidebar footer");
      if (!sidebar || !primary || !footer) throw new Error("layout principal ausente");
      const sidebarStyle = getComputedStyle(sidebar);
      const sidebarRect = sidebar.getBoundingClientRect();
      const footerRect = footer.getBoundingClientRect();
      return {
        viewportHeight: window.innerHeight,
        sidebarHeight: sidebarRect.height,
        sidebarTop: sidebarRect.top,
        footerBottomGap: sidebarRect.bottom - footerRect.bottom,
        sidebarPosition: sidebarStyle.position,
        primaryPosition: getComputedStyle(primary).position,
      };
    });

    expect(
      Math.abs(layout.sidebarHeight - layout.viewportHeight),
      `${tab}: sidebar não ocupa a altura visível`,
    ).toBeLessThanOrEqual(1);
    expect(layout.sidebarTop, `${tab}: sidebar saiu do topo`).toBe(0);
    expect(layout.footerBottomGap, `${tab}: informações fora do rodapé`).toBeLessThan(
      40,
    );
    expect(layout.sidebarPosition).toBe("fixed");
    expect(layout.primaryPosition).toBe("static");

    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    const fixedTop = await page
      .locator(".sidebar")
      .evaluate((element) => element.getBoundingClientRect().top);
    expect(fixedTop, `${tab}: sidebar rolou com o conteúdo`).toBe(0);
  }
});

test("salva orçamento e usa apenas categorias configuradas", async ({ page }) => {
  await page.goto("/?review=budgets");
  await page.getByRole("button", { name: "Criar orçamento" }).first().click();
  const category = page.getByRole("combobox", { name: "Categoria" });
  await expect(category).toHaveValue("moradia");
  await expect(category.getByRole("option", { name: "Sem categoria" })).toHaveCount(0);
  await page.getByLabel("Limite planejado").fill("500");
  await page.getByLabel("Duração do planejamento").selectOption("3");
  await page.getByTestId("modal-save").click();
  await expect(page.getByRole("heading", { name: "Moradia" })).toBeVisible();
  await expect(page.locator(".budget-card", { hasText: "Moradia" })).toContainText("–");

  await page.getByRole("button", { name: "Transações", exact: true }).last().click();
  await page.getByRole("button", { name: "Nova transação" }).first().click();
  await expect(
    page.getByRole("combobox", { name: "Categoria" }).getByRole("option", {
      name: "Sem categoria",
    }),
  ).toHaveCount(0);
});

test("relatórios formam um dashboard interativo sem estourar o viewport", async ({
  page,
}) => {
  await page.goto("/?review=reports");
  await expect(page.getByRole("heading", { name: "Relatórios" })).toBeVisible();
  await expect(page.getByText("Fluxo dos últimos 6 meses")).toBeVisible();

  const months = page.locator(".manager-cashflow__plot > button");
  await expect(months).toHaveCount(6);
  const periodInput = page.locator('.report-filters input[type="month"]');
  const initialPeriod = await periodInput.inputValue();
  const initialMonths = await months.evaluateAll((items) =>
    items.map((item) => item.getAttribute("data-month")),
  );
  const selectedMonth = await months.nth(4).getAttribute("data-month");
  if (!selectedMonth) throw new Error("mês interativo ausente");
  await months.nth(4).click();
  await expect(
    page.locator(`.manager-cashflow__plot > button[data-month="${selectedMonth}"]`),
  ).toHaveAttribute("aria-pressed", "true");
  await expect(periodInput).toHaveValue(initialPeriod);
  expect(
    await months.evaluateAll((items) =>
      items.map((item) => item.getAttribute("data-month")),
    ),
  ).toEqual(initialMonths);

  const layout = await page.evaluate(() => {
    const dashboard = document.querySelector<HTMLElement>(".report-dashboard");
    const panels = [...document.querySelectorAll<HTMLElement>(".report-panel")];
    if (!dashboard || !panels.length) throw new Error("dashboard ausente");
    return {
      dashboardRight: dashboard.getBoundingClientRect().right,
      viewportWidth: window.innerWidth,
      panelOverflow: panels.some(
        (panel) => panel.getBoundingClientRect().right > window.innerWidth + 1,
      ),
    };
  });
  expect(layout.dashboardRight).toBeLessThanOrEqual(layout.viewportWidth + 1);
  expect(layout.panelOverflow).toBe(false);
});

test("cabeçalho e navegação inferior ficam centralizados no celular", async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== "mobile", "validação específica do celular");
  await page.setViewportSize({ width: 320, height: 720 });
  await page.goto("/?review=migrated");

  const menu = page.locator(".mobile-menu");
  const menuIcon = menu.locator("svg");
  const brand = page.locator(".mobile-brand");
  const buttons = page.locator(".bottom-nav button:visible");
  await expect(buttons).toHaveCount(5);
  await expect(
    page.getByRole("button", { name: "Nova transação" }).last(),
  ).toBeVisible();
  const [menuBox, iconBox, brandBox] = await Promise.all([
    menu.boundingBox(),
    menuIcon.boundingBox(),
    brand.boundingBox(),
  ]);
  if (!menuBox || !iconBox || !brandBox) throw new Error("cabeçalho móvel ausente");
  expect(
    Math.abs(menuBox.x + menuBox.width / 2 - (iconBox.x + iconBox.width / 2)),
  ).toBeLessThanOrEqual(1);
  const viewportWidth = await page.evaluate(() => window.innerWidth);
  expect(
    Math.abs(viewportWidth / 2 - (brandBox.x + brandBox.width / 2)),
  ).toBeLessThanOrEqual(1);
  for (const button of await buttons.all()) {
    const box = await button.boundingBox();
    const label = button.locator("span");
    if (!box) throw new Error("botão móvel ausente");
    expect(box.x).toBeGreaterThanOrEqual(0);
    expect(box.x + box.width).toBeLessThanOrEqual(viewportWidth + 1);
    expect(box.width).toBeGreaterThanOrEqual(44);
    if (await label.isVisible()) {
      const labelBox = await label.boundingBox();
      const labelWidth = await label.evaluate((element) => ({
        client: element.clientWidth,
        scroll: element.scrollWidth,
      }));
      if (!labelBox) throw new Error("rótulo móvel ausente");
      expect(labelBox.x).toBeGreaterThanOrEqual(box.x - 1);
      expect(labelBox.x + labelBox.width).toBeLessThanOrEqual(box.x + box.width + 1);
      expect(labelWidth.scroll).toBeLessThanOrEqual(labelWidth.client + 1);
    }
  }

  await expect(page.getByText("Próximo desconto · mensal")).toBeVisible();
  await page.getByRole("button", { name: "Mais opções" }).click();
  await expect(
    page.getByRole("dialog", { name: "Mais opções de navegação" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Relatórios" }).last().click();
  await expect(page.getByRole("heading", { name: "Relatórios" })).toBeVisible();
});

test("painel gerencial se adapta ao celular sem cortar cartões ou a página", async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== "mobile", "validação específica do celular");
  for (const width of [320, 360, 390, 430]) {
    await page.setViewportSize({ width, height: 820 });
    await page.goto("/?review=migrated");
    await expect(
      page.getByRole("heading", { name: /Seu dinheiro, com mais clareza/ }),
    ).toBeVisible();
    await expect(page.locator(".dashboard-kpi")).toHaveCount(4);
    await expect(page.locator(".manager-cashflow__plot > button")).toHaveCount(6);
    const layout = await page.evaluate(() => ({
      bodyOverflow: document.documentElement.scrollWidth > window.innerWidth + 1,
      clippedSummary: [
        ...document.querySelectorAll<HTMLElement>(
          ".dashboard-overview, .dashboard-kpi, .dashboard-period-control",
        ),
      ].some((element) => {
        const rect = element.getBoundingClientRect();
        return rect.left < -1 || rect.right > window.innerWidth + 1;
      }),
      chartScrollable:
        document.querySelector<HTMLElement>(".manager-cashflow")!.scrollWidth >
        document.querySelector<HTMLElement>(".manager-cashflow")!.clientWidth,
    }));
    expect(layout.bodyOverflow).toBe(false);
    expect(layout.clippedSummary).toBe(false);
    expect(layout.chartScrollable).toBe(true);
  }
});

test("perfil do topo abre as configurações por clique e teclado", async ({ page }) => {
  await page.goto("/?review=migrated");
  const profile = page.getByRole("button", {
    name: "Abrir configurações de Lucas",
  });
  await expect(profile).toBeVisible();
  await profile.focus();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("heading", { name: "Configurações" })).toBeVisible();
});

test("topo editorial fica restrito à Visão Geral", async ({ page }) => {
  await page.goto("/?review=transactions");
  await expect(page.getByRole("heading", { name: "Transações" })).toBeVisible();
  await expect(page.locator(".dashboard-overview")).toHaveCount(0);
  await expect(page.locator(".dashboard-period-control")).toHaveCount(0);
  await expect(page.locator(".topbar")).not.toHaveClass(/topbar--dashboard/);
});

test("acabamento do painel mantém pontos circulares e ações sem colisões", async ({
  page,
}, testInfo) => {
  const widths =
    testInfo.project.name === "mobile" ? [320, 360, 390, 430] : [1280, 1440];

  for (const width of widths) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/?review=migrated");
    const periodInput = page.locator('.dashboard-period-control input[type="month"]');
    const anchorMonth = await periodInput.inputValue();

    await page.getByRole("button", { name: "12 meses" }).click();
    const months = page.locator(".manager-cashflow__plot > button");
    await expect(months).toHaveCount(12);
    const lastMonth = await months.last().getAttribute("data-month");
    await months.nth(10).click();
    await expect(months.nth(10)).toHaveAttribute("aria-pressed", "true");
    await months.nth(10).press("ArrowLeft");
    await expect(months.nth(9)).toHaveAttribute("aria-pressed", "true");
    await months.nth(9).press("ArrowRight");
    await expect(months.nth(10)).toHaveAttribute("aria-pressed", "true");
    await expect(periodInput).toHaveValue(anchorMonth);
    await expect(months).toHaveCount(12);
    await expect(months.last()).toHaveAttribute("data-month", lastMonth ?? "");

    await page.getByRole("button", { name: "6 meses" }).click();
    await expect(months).toHaveCount(6);
    await expect(months.last()).toHaveAttribute("data-month", anchorMonth);
    await expect(months.last()).toHaveAttribute("aria-pressed", "true");
    await page.getByRole("button", { name: "12 meses" }).click();
    await expect(months).toHaveCount(12);
    await expect(months.last()).toHaveAttribute("aria-pressed", "true");

    const layout = await page.evaluate(() => {
      const overlaps = (left: DOMRect, right: DOMRect) =>
        left.left < right.right &&
        left.right > right.left &&
        left.top < right.bottom &&
        left.bottom > right.top;
      const pointSizes = [
        ...document.querySelectorAll<HTMLElement>(".manager-cashflow__points i"),
      ].map((point) => {
        const rect = point.getBoundingClientRect();
        return { width: rect.width, height: rect.height };
      });
      const summaryCollisions = [
        ...document.querySelectorAll<HTMLElement>(".dashboard-kpi"),
      ].flatMap((metric) => {
        const metricRect = metric.getBoundingClientRect();
        return [
          ...metric.querySelectorAll<HTMLElement>(
            ":scope > span, :scope > strong, :scope > small",
          ),
        ]
          .filter((element) => {
            const rect = element.getBoundingClientRect();
            return (
              rect.left < metricRect.left - 1 ||
              rect.right > metricRect.right + 1 ||
              rect.top < metricRect.top - 1 ||
              rect.bottom > metricRect.bottom + 1
            );
          })
          .map((element) => element.textContent?.trim() ?? "indicador");
      });
      const headerCollisions = [
        ...document.querySelectorAll<HTMLElement>(".manager-panel__header"),
      ].flatMap((header) => {
        const copy = header.querySelector<HTMLElement>(":scope > div:first-child");
        const action = header.querySelector<HTMLElement>(
          ":scope > .text-button, :scope > .info-tooltip, :scope > .manager-range",
        );
        if (!copy || !action) return [];
        return overlaps(copy.getBoundingClientRect(), action.getBoundingClientRect())
          ? [header.textContent?.trim() ?? "cabeçalho"]
          : [];
      });
      return {
        pointSizes,
        summaryCollisions,
        headerCollisions,
        documentOverflow: document.documentElement.scrollWidth > window.innerWidth + 1,
      };
    });

    expect(layout.pointSizes).toHaveLength(12);
    for (const point of layout.pointSizes) {
      expect(Math.abs(point.width - point.height)).toBeLessThanOrEqual(0.5);
      expect(point.width).toBeGreaterThanOrEqual(11.5);
      expect(point.width).toBeLessThanOrEqual(12.5);
    }
    expect(layout.summaryCollisions).toEqual([]);
    expect(layout.headerCollisions).toEqual([]);
    expect(layout.documentOverflow).toBe(false);

    const activeMonth = months.last();
    await activeMonth.click();
    const activeTooltip = activeMonth.locator(".manager-cashflow__tooltip");

    if (testInfo.project.name === "desktop") {
      await expect(activeTooltip).toBeVisible();
      await page.mouse.move(1, 1);
      await expect(activeTooltip).toBeHidden();
      await activeMonth.hover();
      await expect(activeTooltip).toBeVisible();
      await page.mouse.move(1, 1);
      await expect(activeTooltip).toBeHidden();
      await activeMonth.press("ArrowLeft");
      const keyboardTooltip = months.nth(10).locator(".manager-cashflow__tooltip");
      await expect(keyboardTooltip).toBeVisible();
    } else {
      await expect(activeTooltip).toBeHidden();
    }
  }
});

test("reordena categorias pelo teclado e mantém a lista configurada", async ({
  page,
}) => {
  await page.goto("/?review=settings");
  const moveHousing = page.getByRole("button", { name: /Mover Moradia/ });
  await moveHousing.focus();
  await moveHousing.press("End");
  await expect(page.getByText("Ordem das categorias atualizada.")).toBeVisible();

  const pills = page.locator(".category-pills > span");
  await expect(pills.first()).toContainText("Alimentação");
  await expect(pills.last()).toContainText("Moradia");

  await page.getByRole("button", { name: "Transações", exact: true }).last().click();
  await page.getByRole("button", { name: "Nova transação" }).first().click();
  const options = page.getByRole("combobox", { name: "Categoria" }).locator("option");
  await expect(options.first()).toHaveText("Alimentação");
  await expect(options).toHaveCount(14);
});

test("arrasta uma categoria para uma nova posição", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name === "mobile", "gesto validado no viewport desktop");
  await page.goto("/?review=settings");
  const source = page.getByRole("button", { name: /Mover Moradia/ });
  const target = page.getByRole("button", { name: /Mover Transporte/ });
  await source.scrollIntoViewIfNeeded();
  const sourceBox = await source.boundingBox();
  const targetBox = await target.boundingBox();
  if (!sourceBox || !targetBox) throw new Error("Marcadores de categoria ausentes");

  await page.mouse.move(
    sourceBox.x + sourceBox.width / 2,
    sourceBox.y + sourceBox.height / 2,
  );
  await page.mouse.down();
  await page.mouse.move(
    targetBox.x + targetBox.width / 2,
    targetBox.y + targetBox.height / 2,
    { steps: 8 },
  );
  await page.mouse.up();

  await expect(page.getByText("Ordem das categorias atualizada.")).toBeVisible();
  const pills = page.locator(".category-pills > span");
  await expect(pills.nth(0)).toContainText("Alimentação");
  await expect(pills.nth(1)).toContainText("Transporte");
  await expect(pills.nth(2)).toContainText("Moradia");
});
