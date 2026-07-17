# Baseline antes da V2

Executado em 16/07/2026 na branch `feat/auth-cloud-sync-onboarding-v2`, antes de
alterações de produto.

| Comando                          | Resultado                                     |
| -------------------------------- | --------------------------------------------- |
| `pnpm install --frozen-lockfile` | aprovado; lockfile sem alteração              |
| `pnpm typecheck`                 | aprovado                                      |
| `pnpm lint`                      | aprovado                                      |
| `pnpm format:check`              | falhou em `app/layout.tsx` e `next.config.ts` |
| `pnpm test`                      | aprovado; 16 testes em 4 arquivos             |
| `pnpm test:e2e`                  | falhou aguardando o servidor local por 120 s  |
| `pnpm build`                     | aprovado                                      |
| `pnpm build:pages`               | aprovado                                      |

As duas falhas eram preexistentes e foram reproduzidas sem modificar código. O E2E
também constava como limitação conhecida. A V2 deve corrigir o gate de formatação
e desacoplar os cenários de autenticação de credenciais reais.

## Publicação confirmada

- Produção atual: GitHub Pages e ChatGPT Sites.
- Workflow: `.github/workflows/pages.yml`, deploy somente em push para `main`.
- Esta branch não fará merge nem acionará deploy.
