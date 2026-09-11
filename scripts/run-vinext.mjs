import { spawn } from "node:child_process";
import { resolve } from "node:path";

const mode = process.argv[2];
if (!["dev", "build", "start"].includes(mode)) {
  console.error("Uso: node scripts/run-vinext.mjs <dev|build|start>");
  process.exit(2);
}

if (mode === "build") {
  const requiredPublicVariables = [
    "NEXT_PUBLIC_SUPABASE_URL",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  ];
  const missingVariables = requiredPublicVariables.filter(
    (name) => !process.env[name]?.trim(),
  );

  if (missingVariables.length > 0) {
    console.error(
      `Build interrompido: configure ${missingVariables.join(", ")} antes de gerar o pacote de produção.`,
    );
    process.exit(2);
  }
}

const executable = resolve("node_modules/vinext/dist/cli.js");
const child = spawn(process.execPath, [executable, mode], {
  stdio: "inherit",
  env: {
    ...process.env,
    NEXT_PUBLIC_REVIEW_MODE: "false",
    WRANGLER_LOG_PATH: ".wrangler/wrangler.log",
  },
});

child.on("exit", (code) => process.exit(code ?? 1));
