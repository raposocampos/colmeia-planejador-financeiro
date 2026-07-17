import { pathToFileURL } from "node:url";

const productionUrls = new Set([
  "https://colmeia-planejador-financeiro.lucascampos.chatgpt.site/",
  "https://raposocampos.github.io/colmeia-planejador-financeiro/",
]);

const requireValue = (name) => {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`Configuração de staging ausente: ${name}.`);
  return value;
};

const parseHttpsUrl = (name, value) => {
  let url;
  try {
    url = new URL(value);
  } catch {
    throw new Error(`${name} precisa ser uma URL válida.`);
  }
  if (url.protocol !== "https:") throw new Error(`${name} precisa usar HTTPS.`);
  if (["localhost", "127.0.0.1"].includes(url.hostname))
    throw new Error(`${name} não pode apontar para o ambiente local.`);
  return url;
};

export const readStagingConfig = () => {
  if (requireValue("COLMEIA_DEPLOY_TARGET") !== "staging")
    throw new Error("COLMEIA_DEPLOY_TARGET precisa ser exatamente staging.");

  const projectId = requireValue("SUPABASE_PROJECT_ID");
  if (!/^[a-z0-9]{20}$/.test(projectId))
    throw new Error("SUPABASE_PROJECT_ID não possui o formato esperado.");

  const supabaseUrl = parseHttpsUrl(
    "NEXT_PUBLIC_SUPABASE_URL",
    requireValue("NEXT_PUBLIC_SUPABASE_URL"),
  );
  if (!supabaseUrl.hostname.startsWith(`${projectId}.`))
    throw new Error("A URL do Supabase não corresponde ao projeto de staging.");

  const siteUrl = parseHttpsUrl(
    "NEXT_PUBLIC_SITE_URL",
    requireValue("NEXT_PUBLIC_SITE_URL"),
  );
  if (productionUrls.has(siteUrl.href))
    throw new Error("NEXT_PUBLIC_SITE_URL aponta para uma URL de produção bloqueada.");
  if (!siteUrl.href.toLowerCase().includes("staging"))
    throw new Error("A URL pública precisa identificar explicitamente o staging.");

  const anonKey = requireValue("NEXT_PUBLIC_SUPABASE_ANON_KEY");
  const serviceRoleKey = requireValue("SUPABASE_SERVICE_ROLE_KEY");
  const accessToken = requireValue("SUPABASE_ACCESS_TOKEN");
  const databasePassword = requireValue("SUPABASE_DB_PASSWORD");

  if (anonKey.length < 20 || serviceRoleKey.length < 20 || accessToken.length < 20)
    throw new Error("Uma das credenciais de staging possui formato inválido.");
  if (databasePassword.length < 12)
    throw new Error("A senha do banco de staging precisa ter ao menos 12 caracteres.");

  return {
    accessToken,
    anonKey,
    databasePassword,
    projectId,
    serviceRoleKey,
    siteUrl: siteUrl.origin,
    supabaseUrl: supabaseUrl.origin,
  };
};

const isDirectExecution =
  process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;

if (isDirectExecution) {
  readStagingConfig();
  console.log(
    "Configuração de staging validada sem exibir URLs, chaves, tokens ou senhas.",
  );
}
