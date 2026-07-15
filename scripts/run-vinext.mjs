import { spawn } from "node:child_process";
import { resolve } from "node:path";

const mode = process.argv[2];
if (!["dev", "build", "start"].includes(mode)) {
  console.error("Uso: node scripts/run-vinext.mjs <dev|build|start>");
  process.exit(2);
}

const executable = resolve("node_modules/vinext/dist/cli.js");
const child = spawn(process.execPath, [executable, mode], {
  stdio: "inherit",
  env: {
    ...process.env,
    WRANGLER_LOG_PATH: ".wrangler/wrangler.log",
  },
});

child.on("exit", (code) => process.exit(code ?? 1));
