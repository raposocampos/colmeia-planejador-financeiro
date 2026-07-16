import { mkdir } from "node:fs/promises";
import { chromium } from "@playwright/test";
import { join } from "node:path";
import { spawn } from "node:child_process";

const output = join(process.cwd(), "public", "tutorial");
await mkdir(output, { recursive: true });

const server = spawn(process.execPath, ["scripts/serve-static.mjs", "out"], {
  stdio: "inherit",
});

try {
  for (let attempt = 0; attempt < 40; attempt += 1) {
    try {
      const response = await fetch("http://127.0.0.1:3000/");
      if (response.ok) break;
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 250));
    }
  }

  const browser = await chromium.launch();
  const shots = [
    ["visao-geral.png", "migrated", "Seu dinheiro, com mais clareza."],
    ["transacoes.png", "transactions", "Transações"],
    ["contas-cartoes.png", "accounts", "Contas e cartões"],
    ["orcamentos-metas.png", "budgets", "Orçamentos"],
    ["configuracoes-backup.png", "settings", "Configurações"],
  ];

  for (const [filename, review, heading] of shots) {
    const context = await browser.newContext({
      viewport: { width: 1280, height: 800 },
    });
    const page = await context.newPage();
    await page.goto(`http://127.0.0.1:3000/?review=${review}`, {
      waitUntil: "networkidle",
    });
    await page.getByRole("heading", { name: heading, exact: true }).waitFor();
    await page.screenshot({ path: join(output, filename) });
    await context.close();
  }

  await browser.close();
  console.log(`${shots.length} capturas reais salvas em ${output}`);
} finally {
  server.kill();
}
