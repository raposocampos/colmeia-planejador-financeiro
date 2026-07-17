import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";

const git = process.platform === "win32" ? "git.exe" : "git";
const files = execFileSync(
  git,
  ["ls-files", "--cached", "--others", "--exclude-standard"],
  {
    encoding: "utf8",
  },
)
  .split(/\r?\n/)
  .filter(Boolean);

const forbiddenFiles = files.filter(
  (file) => /^\.env(?:\.|$)/.test(file) && file !== ".env.example",
);
const findings = [];
const secretPatterns = [
  { name: "JWT", pattern: /\beyJ[A-Za-z0-9_-]{16,}\.[A-Za-z0-9_-]{16,}\./ },
  {
    name: "Supabase service role atribuída",
    pattern:
      /(?:service[_-]?role|SUPABASE_SERVICE_ROLE_KEY)\s*[:=]\s*["']?[A-Za-z0-9_-]{16,}/i,
  },
  {
    name: "Chave privada",
    pattern: /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/,
  },
];

for (const file of files) {
  if (!existsSync(file)) continue;
  if (/\.(?:png|jpe?g|webp|ico|pdf)$/i.test(file)) continue;
  const content = readFileSync(file, "utf8");
  for (const rule of secretPatterns) {
    if (rule.pattern.test(content)) findings.push(`${file}: ${rule.name}`);
  }
}

if (forbiddenFiles.length || findings.length) {
  console.error(
    [
      ...forbiddenFiles.map((file) => `${file}: arquivo de ambiente proibido`),
      ...findings,
    ].join("\n"),
  );
  process.exit(1);
}

console.log(`Verificação concluída em ${files.length} arquivos versionados.`);
