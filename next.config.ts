import type { NextConfig } from "next";

const isGitHubPages = process.env.DEPLOY_TARGET === "github-pages";
const repositoryName =
  process.env.GITHUB_REPOSITORY?.split("/")[1] ?? "colmeia-planejador-financeiro";
const basePath = isGitHubPages ? "/" + repositoryName : "";

const nextConfig: NextConfig = {
  output: isGitHubPages ? "export" : undefined,
  trailingSlash: true,
  basePath,
  assetPrefix: basePath || undefined,
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
  },
};

export default nextConfig;
