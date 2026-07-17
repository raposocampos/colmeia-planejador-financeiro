import { spawn, spawnSync } from "node:child_process";

const build = spawnSync(process.execPath, ["scripts/build-review.mjs"], {
  stdio: "inherit",
  env: process.env,
});
if (build.status !== 0) process.exit(build.status ?? 1);

const server = spawn(process.execPath, ["scripts/serve-static.mjs", "out"], {
  stdio: "inherit",
  env: process.env,
});
server.on("exit", (code) => process.exit(code ?? 1));
