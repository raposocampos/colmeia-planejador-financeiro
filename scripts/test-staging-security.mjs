import { randomBytes, randomUUID } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import { readStagingConfig } from "./validate-staging-config.mjs";

const config = readStagingConfig();
const clientOptions = {
  auth: { autoRefreshToken: false, persistSession: false },
};
const admin = createClient(config.supabaseUrl, config.serviceRoleKey, clientOptions);
const anonymous = createClient(config.supabaseUrl, config.anonKey, clientOptions);
const createdUserIds = [];

const fail = (code) => {
  throw new Error(`Falha no cenário de staging: ${code}.`);
};

const assertNoError = (result, code) => {
  if (result.error) fail(`${code}:${result.error.code ?? "provider_error"}`);
  return result.data;
};

const createTestUser = async () => {
  const suffix = randomUUID();
  const email = `colmeia-stage-${suffix}@example.com`;
  const password = `Stage-${randomBytes(24).toString("base64url")}!9a`;
  const created = assertNoError(
    await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { name: "Teste automatizado" },
    }),
    "create_user",
  );
  if (!created.user?.id) fail("create_user:missing_id");
  createdUserIds.push(created.user.id);

  const client = createClient(config.supabaseUrl, config.anonKey, clientOptions);
  const signedIn = assertNoError(
    await client.auth.signInWithPassword({ email, password }),
    "sign_in",
  );
  if (!signedIn.session) fail("sign_in:missing_session");
  return { client, id: created.user.id };
};

const verifyRlsIsolation = async (userA, userB) => {
  const now = new Date().toISOString();
  const accountId = `rls-${randomUUID()}`;
  const own = assertNoError(
    await userA.client
      .from("accounts")
      .insert({
        id: accountId,
        name: "Conta de teste",
        type: "digital",
        initial_balance_cents: 12345,
        color: "#F8BF4D",
        archived: false,
        created_at: now,
        updated_at: now,
      })
      .select("id")
      .single(),
    "rls_own_insert",
  );
  if (own.id !== accountId) fail("rls_own_insert:wrong_record");

  const ownRead = assertNoError(
    await userA.client.from("accounts").select("id").eq("id", accountId),
    "rls_own_read",
  );
  if (ownRead.length !== 1) fail("rls_own_read:not_visible");

  const crossRead = assertNoError(
    await userB.client.from("accounts").select("id").eq("id", accountId),
    "rls_cross_read",
  );
  if (crossRead.length !== 0) fail("rls_cross_read:leaked");

  const crossUpdate = assertNoError(
    await userB.client
      .from("accounts")
      .update({ name: "Alteração indevida", updated_at: now })
      .eq("id", accountId)
      .select("id"),
    "rls_cross_update",
  );
  if (crossUpdate.length !== 0) fail("rls_cross_update:allowed");

  const forged = await userB.client.from("accounts").insert({
    user_id: userA.id,
    id: `forged-${randomUUID()}`,
    name: "Tentativa indevida",
    type: "digital",
    initial_balance_cents: 1,
    color: "#F8BF4D",
    archived: false,
    created_at: now,
    updated_at: now,
  });
  if (!forged.error) fail("rls_forged_owner:allowed");

  const anonRead = await anonymous.from("accounts").select("id").eq("id", accountId);
  if (!anonRead.error && anonRead.data?.length) fail("rls_anon_read:leaked");

  assertNoError(await admin.auth.admin.deleteUser(userA.id), "delete_user_a");
  createdUserIds.splice(createdUserIds.indexOf(userA.id), 1);
  const cascade = await admin
    .from("accounts")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userA.id);
  assertNoError(cascade, "cascade_read");
  if (cascade.count !== 0) fail("cascade_delete:orphan_record");
};

const verifyLegacyMigration = async (user) => {
  const categories = assertNoError(
    await user.client
      .from("categories")
      .select("id,name,kind,color,icon,archived,created_at,updated_at"),
    "migration_read_categories",
  );
  if (!categories.length) fail("migration_read_categories:empty");

  const now = new Date().toISOString();
  const accountId = `migration-account-${randomUUID()}`;
  const transactionId = `migration-transaction-${randomUUID()}`;
  const migrationId = randomUUID();
  const state = {
    accounts: [
      {
        id: accountId,
        name: "Conta migrada",
        type: "digital",
        initialBalanceCents: 54321,
        color: "#F8BF4D",
        archived: false,
        createdAt: now,
        updatedAt: now,
      },
    ],
    cards: [],
    categories: categories.map((category) => ({
      id: category.id,
      name: category.name,
      kind: category.kind,
      color: category.color,
      icon: category.icon,
      archived: category.archived,
      createdAt: category.created_at,
      updatedAt: category.updated_at,
    })),
    transactions: [
      {
        id: transactionId,
        type: "expense",
        description: "Registro fictício",
        amountCents: 1099,
        date: "2026-07-16",
        categoryId: categories[0].id,
        accountId,
        tags: [],
        recurrence: "none",
        status: "paid",
        createdAt: now,
        updatedAt: now,
      },
    ],
    budgets: [],
    goals: [],
    settings: {
      currency: "BRL",
      locale: "pt-BR",
      timezone: "America/Sao_Paulo",
    },
  };

  const first = assertNoError(
    await user.client.rpc("migrate_legacy_planner", {
      planner_state: state,
      migration_id: migrationId,
    }),
    "migration_first_run",
  );
  if (first?.status !== "completed") fail("migration_first_run:wrong_status");

  const second = assertNoError(
    await user.client.rpc("migrate_legacy_planner", {
      planner_state: state,
      migration_id: migrationId,
    }),
    "migration_second_run",
  );
  if (second?.status !== "already_completed")
    fail("migration_second_run:not_idempotent");

  const [accounts, transactions, migrations] = await Promise.all([
    user.client.from("accounts").select("id").eq("id", accountId),
    user.client.from("transactions").select("id").eq("id", transactionId),
    user.client.from("data_migrations").select("id").eq("id", migrationId),
  ]);
  if (assertNoError(accounts, "migration_accounts").length !== 1)
    fail("migration_accounts:wrong_count");
  if (assertNoError(transactions, "migration_transactions").length !== 1)
    fail("migration_transactions:wrong_count");
  if (assertNoError(migrations, "migration_metadata").length !== 1)
    fail("migration_metadata:wrong_count");
};

try {
  const [userA, userB, migrationUser] = await Promise.all([
    createTestUser(),
    createTestUser(),
    createTestUser(),
  ]);
  await verifyRlsIsolation(userA, userB);
  await verifyLegacyMigration(migrationUser);
  console.log(
    "Staging aprovado: isolamento A/B/anônimo, ownership, cascata e migração idempotente verificados.",
  );
} finally {
  const cleanup = await Promise.allSettled(
    createdUserIds.map((userId) => admin.auth.admin.deleteUser(userId)),
  );
  const cleanupFailed = cleanup.some(
    (result) => result.status === "rejected" || result.value.error,
  );
  if (cleanupFailed) fail("cleanup_users");
}
