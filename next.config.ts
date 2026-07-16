import type { NextConfig } from "next";

const isGitHubPages = process.env.DEPLOY_TARGET === "github-pages";
const repositoryOwner =
  process.env.GITHUB_REPOSITORY_OWNER ??
  process.env.GITHUB_REPOSITORY?.split("/")[0] ??
  "raposocampos";
const repositoryName =
  process.env.GITHUB_REPOSITORY?.split("/")[1] ?? "colmeia-planejador-financeiro";
const basePath = isGitHubPages ? "/" + repositoryName : "";
const siteUrl = isGitHubPages
  ? `https://${repositoryOwner}.github.io/${repositoryName}`
  : (process.env.NEXT_PUBLIC_SITE_URL ??
    "https://colmeia-planejador-financeiro.lucascampos.chatgpt.site");

const nextConfig: NextConfig = {
  output: isGitHubPages ? "export" : undefined,
  trailingSlash: true,
  basePath,
  assetPrefix: basePath || undefined,
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
    NEXT_PUBLIC_SITE_URL: siteUrl,
  },
};

export default nextConfig;
