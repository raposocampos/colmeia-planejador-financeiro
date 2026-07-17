import { mkdir } from "node:fs/promises";
import { chromium } from "@playwright/test";
import { join } from "node:path";
import { spawn } from "node:child_process";

const output = join(process.cwd(), "docs", "quality", "screenshots", "v2");
await mkdir(output, { recursive: true });
const server = spawn(process.execPath, ["scripts/serve-static.mjs", "out"], {
  stdio: "inherit",
});
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
  ["login-desktop.png", "login", { width: 1440, height: 900 }, "Entrar na Colmeia"],
  ["login-mobile.png", "login", { width: 390, height: 844 }, "Entrar na Colmeia"],
  ["signup-desktop.png", "signup", { width: 1440, height: 1000 }, "Criar conta"],
  ["signup-mobile.png", "signup", { width: 390, height: 844 }, "Criar conta"],
  [
    "onboarding-desktop.png",
    "onboarding",
    { width: 1440, height: 900 },
    "Comece pela visão geral",
  ],
  [
    "onboarding-mobile.png",
    "onboarding",
    { width: 390, height: 844 },
    "Comece pela visão geral",
  ],
  [
    "migration-data.png",
    "migration",
    { width: 1280, height: 900 },
    "Encontramos dados deste planejador neste navegador.",
  ],
  [
    "dashboard-empty.png",
    "empty",
    { width: 1440, height: 1000 },
    "Seu dinheiro, com mais clareza.",
  ],
  [
    "dashboard-migrated.png",
    "migrated",
    { width: 1440, height: 1000 },
    "Seu dinheiro, com mais clareza.",
  ],
  ["profile-privacy.png", "profile", { width: 1440, height: 1200 }, "Configurações"],
];

for (const [filename, review, viewport, heading] of shots) {
  const context = await browser.newContext({ viewport });
  const page = await context.newPage();
  await page.goto(`http://127.0.0.1:3000/?review=${review}`);
  await page.waitForLoadState("networkidle");
  if (
    review === "signup" &&
    (await page.getByRole("heading", { name: "Entrar na Colmeia" }).isVisible())
  )
    await page.getByRole("button", { name: "Criar conta" }).click();
  await page.getByRole("heading", { name: heading }).waitFor();
  await page.screenshot({ path: join(output, filename), fullPage: true });
  await context.close();
}

await browser.close();
server.kill();
console.log(`${shots.length} screenshots salvas em ${output}`);
