# Resultados de qualidade — autenticação e nuvem V2

Executado em 16/07/2026 na branch `feat/auth-cloud-sync-onboarding-v2`.

| Comando                          | Resultado                                                  |
| -------------------------------- | ---------------------------------------------------------- |
| `pnpm install --frozen-lockfile` | aprovado; lockfile consistente                             |
| `pnpm typecheck`                 | aprovado; TypeScript sem erros                             |
| `pnpm lint`                      | aprovado; ESLint sem erros                                 |
| `pnpm format:check`              | aprovado; Prettier sem divergências                        |
| `pnpm test`                      | aprovado; 35 testes em 12 arquivos                         |
| `pnpm test:e2e`                  | aprovado; 14 execuções desktop/mobile, sem erro de console |
| `pnpm build`                     | aprovado; build Vinext concluído                           |
| `pnpm build:pages`               | aprovado; 6 rotas estáticas e not-found geradas            |
| `pnpm verify:migrations`         | aprovado; 1 migração, 9 tabelas e 4 políticas por tabela   |
| `pnpm check:secrets`             | aprovado; 141 arquivos verificados                         |
| `pnpm audit:deps`                | aprovado; nenhuma vulnerabilidade alta ou crítica          |
| `git diff --check`               | aprovado; sem erro de whitespace                           |

## Observações não bloqueadoras

- O build alerta para um chunk superior a 500 kB.
- `pnpm audit` completo informa uma vulnerabilidade baixa em `@babel/core`. A versão
  corrigida indicada pelo advisory (`7.29.1`) ainda não está publicada; atualizar
  para Babel 8 nesta branch seria uma mudança incompatível e desproporcional.
- Os testes de integração RLS reais exigem um projeto Supabase local ou staging
  autorizado. A branch inclui a matriz SQL e a verificação estática usada no CI.
- Nenhum deploy, staging ou merge foi executado.

## Auditorias aplicadas

- `brand-guardian`: nome, paleta, assinatura hexagonal, contraste e tom visual
  revisados nas dez capturas desktop/mobile.
- `colmeia-auth-security`: sessão, callbacks, RLS, função de exclusão e documentos
  de segurança revisados.
- `colmeia-data-migration`: contagens, backup, idempotência, conflitos e preservação
  do IndexedDB legado revisados.
- `frontend-qa`: fluxos críticos, responsividade, console, build e screenshots
  revisados.
- `colmeia-release-approval` e `release-github`: release mantida bloqueada; somente
  branch e PR de revisão são permitidos antes de `APROVADO`.
