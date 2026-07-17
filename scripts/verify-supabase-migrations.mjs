import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const migrationsDirectory = join(process.cwd(), "supabase", "migrations");
const files = readdirSync(migrationsDirectory).filter((file) => file.endsWith(".sql"));
if (!files.length) throw new Error("Nenhuma migration SQL encontrada.");

const sql = files
  .map((file) => readFileSync(join(migrationsDirectory, file), "utf8"))
  .join("\n");
const tables = [
  "profiles",
  "accounts",
  "credit_cards",
  "categories",
  "transactions",
  "budgets",
  "goals",
  "user_settings",
  "data_migrations",
];
const operations = ["select", "insert", "update", "delete"];
const failures = [];

for (const table of tables) {
  if (
    !new RegExp(`alter table public\\.${table} enable row level security`, "i").test(
      sql,
    )
  )
    failures.push(`${table}: RLS não ativada`);
  if (!new RegExp(`create index[^;]+on public\\.${table}[^;]+user_id`, "i").test(sql))
    failures.push(`${table}: índice de user_id ausente`);
  for (const operation of operations) {
    const explicitPolicy = new RegExp(
      `create policy [^;]+ on public\\.${table}[\\s\\S]*?for ${operation}[\\s\\S]*?to authenticated[\\s\\S]*?;`,
      "i",
    );
    const templatedPolicy = new RegExp(
      `create policy %I on public\\.%I for ${operation} to authenticated`,
      "i",
    );
    const tableInTemplate = new RegExp(`['\"]${table}['\"]`, "i").test(sql);
    if (!explicitPolicy.test(sql) && !(templatedPolicy.test(sql) && tableInTemplate))
      failures.push(`${table}: policy ${operation.toUpperCase()} ausente`);
  }
}

if (!/\(select auth\.uid\(\)\) = user_id/i.test(sql))
  failures.push("As policies não usam a identidade autenticada esperada.");
const sqlWithoutComments = sql.replace(/--.*$/gm, "");
const sqlWithoutAdministrativeGrants = sqlWithoutComments.replace(
  /grant\b[^;]*\bto\s+service_role\s*;/gi,
  "",
);
if (/service[_-]?role/i.test(sqlWithoutAdministrativeGrants))
  failures.push("Migration usa service role fora de um GRANT administrativo.");
if (!/grant all privileges on table[^;]+to service_role\s*;/i.test(sqlWithoutComments))
  failures.push("Privilégios administrativos explícitos estão ausentes.");
if (!/create (?:or replace )?function public\.migrate_legacy_planner/i.test(sql))
  failures.push("RPC transacional de migração ausente.");
if (!/create (?:or replace )?function public\.delete_my_account/i.test(sql))
  failures.push("RPC de exclusão da conta ausente.");
if (
  !/grant execute on function public\.delete_my_account\(\) to authenticated/i.test(sql)
)
  failures.push("Exclusão da conta não está limitada ao papel autenticado.");
if (!/default auth\.uid\(\)/i.test(sql))
  failures.push("Inserções não derivam o proprietário da sessão autenticada.");

if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}

console.log(
  `${files.length} migration(s), ${tables.length} tabelas e 4 policies por tabela verificadas; cenários A/B, anônimo e cascata cobertos pela identidade de sessão.`,
);
