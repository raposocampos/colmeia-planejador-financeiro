import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { readStagingConfig } from "../../scripts/validate-staging-config.mjs";

const keys = [
  "COLMEIA_DEPLOY_TARGET",
  "SUPABASE_PROJECT_ID",
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SITE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "SUPABASE_ACCESS_TOKEN",
  "SUPABASE_DB_PASSWORD",
];
const previous = new Map();
const fixtureValues = [
  "staging",
  "abcdefghijklmnopqrst",
  "https://abcdefghijklmnopqrst.supabase.co",
  "https://colmeia-v2-staging.example.com",
  "fake-anon-key-for-configuration-only",
  "fake-service-key-for-configuration-only",
  "fake-access-token-for-configuration-only",
  "fake-database-password",
];

beforeEach(() => {
  keys.forEach((key, index) => {
    previous.set(key, process.env[key]);
    process.env[key] = fixtureValues[index];
  });
});

afterEach(() => {
  for (const key of keys) {
    const value = previous.get(key);
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }
  previous.clear();
});

describe("configuração segura de staging", () => {
  it("aceita apenas um conjunto isolado e coerente", () => {
    expect(readStagingConfig()).toMatchObject({
      projectId: "abcdefghijklmnopqrst",
      siteUrl: "https://colmeia-v2-staging.example.com",
      supabaseUrl: "https://abcdefghijklmnopqrst.supabase.co",
    });
  });

  it("bloqueia as URLs públicas atuais", () => {
    process.env.NEXT_PUBLIC_SITE_URL =
      "https://colmeia-planejador-financeiro.lucascampos.chatgpt.site";
    expect(() => readStagingConfig()).toThrow("produção bloqueada");
  });

  it("bloqueia projeto Supabase divergente", () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://zyxwvutsrqponmlkjihg.supabase.co";
    expect(() => readStagingConfig()).toThrow("não corresponde");
  });
});
