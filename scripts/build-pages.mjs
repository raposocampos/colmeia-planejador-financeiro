import { spawn } from "node:child_process";
import { resolve } from "node:path";

const executable = resolve("node_modules/next/dist/bin/next");
const child = spawn(process.execPath, [executable, "build"], {
  stdio: "inherit",
  env: {
    ...process.env,
    DEPLOY_TARGET: "github-pages",
    NEXT_PUBLIC_REVIEW_MODE: "false",
  },
});

child.on("exit", (code) => process.exit(code ?? 1));
