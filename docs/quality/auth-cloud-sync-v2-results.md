# Resultados de qualidade — autenticação e nuvem V2

Executado em 16/07/2026 na branch `feat/auth-cloud-sync-onboarding-v2`.

| Comando                          | Resultado                                                                      |
| -------------------------------- | ------------------------------------------------------------------------------ |
| `pnpm install --frozen-lockfile` | aprovado; lockfile consistente                                                 |
| `pnpm typecheck`                 | aprovado; TypeScript sem erros                                                 |
| `pnpm lint`                      | aprovado; ESLint sem erros                                                     |
| `pnpm format:check`              | aprovado; Prettier sem divergências                                            |
| `pnpm test`                      | aprovado; 38 testes em 13 arquivos                                             |
| `pnpm test:e2e`                  | aprovado; 15 execuções, 1 skip desktop-only no mobile e nenhum erro de console |
| `pnpm build`                     | aprovado; build Vinext concluído                                               |
| `pnpm build:pages`               | aprovado; 6 rotas estáticas e not-found geradas                                |
| `pnpm verify:migrations`         | aprovado; 1 migração, 9 tabelas e 4 políticas por tabela                       |
| `pnpm check:secrets`             | aprovado; 141 arquivos verificados                                             |
| `pnpm audit:deps`                | aprovado; nenhuma vulnerabilidade alta ou crítica                              |
| `git diff --check`               | aprovado; sem erro de whitespace                                               |

## Observações não bloqueadoras

- O build alerta para um chunk superior a 500 kB.
- `pnpm audit` completo informa uma vulnerabilidade baixa em `@babel/core`. A versão
  corrigida indicada pelo advisory (`7.29.1`) ainda não está publicada; atualizar
  para Babel 8 nesta branch seria uma mudança incompatível e desproporcional.
- Os testes de integração RLS reais exigem um projeto Supabase local ou staging
  autorizado. A branch inclui a matriz SQL e a verificação estática usada no CI.
- Nenhum deploy, staging ou merge foi executado.

## Ajuste após a primeira revisão visual

Após o feedback de Lucas, o shell desktop passou a pintar a faixa lateral escura
por toda a altura do documento. Na segunda revisão, a sidebar passou a acompanhar
a altura real de cada aba; assim, o bloco de privacidade e o rodapé são posicionados
no final da página, em vez de ficarem no meio de documentos longos. Um cenário
Playwright percorre as sete abas e compara shell, sidebar e rodapé. O comportamento
mobile continua usando o menu fixo, e a impressão permanece sem a faixa estrutural.

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

## Preparação de staging após aprovação

Em 16/07/2026, Lucas autorizou explicitamente preparar staging sem merge e sem
produção. A preparação adicionou:

- GitHub Environment `staging`, sem credenciais e restrito à branch V2;
- Supabase CLI `2.109.1` fixada no lockfile;
- workflow acionável no PR pelas labels `staging-dry-run` e `staging-apply`, além do
  gate manual `STAGING`; sempre executa dry-run antes da migration e não faz deploy;
- bloqueio das URLs conhecidas de produção e exigência de host identificado como
  staging;
- teste remoto descartável de RLS A/B/anônimo, ownership, cascata e migração
  idempotente;
- build guardado somente como artefato por sete dias.

Após essas mudanças, instalação congelada com pnpm 11.7.0, typecheck, lint, formato,
38 testes, 15 execuções E2E, verificação SQL, varredura de 146 arquivos, auditoria,
build Vinext, build Pages e `git diff --check` passaram. Produção, Sites, Pages e
`main` permaneceram intocados.

## Execução integrada de staging

Após autorização explícita para usar o Chrome autenticado, foi criado o projeto
isolado `colmeia-v2-staging` em `ca-central-1`. Confirmação de e-mail ficou ativa;
SMTP próprio, Google OAuth e callbacks hospedados permanecem pendentes. Chaves,
token e senha rotacionada foram armazenados exclusivamente no GitHub Environment
`staging` e não foram copiados para arquivos, commits ou comentários.

O primeiro dry-run válido foi concluído no
[run 29535218591](https://github.com/raposocampos/colmeia-planejador-financeiro/actions/runs/29535218591):
todos os gates passaram, as credenciais foram aceitas e somente a migration
`202607160001_auth_cloud_sync_v2.sql` apareceu na prévia. Aplicação e testes reais
continuaram bloqueados nessa execução.

O [run 29535426194](https://github.com/raposocampos/colmeia-planejador-financeiro/actions/runs/29535426194)
repetiu os gates, aplicou exclusivamente a migration prevista e aprovou isolamento
A/B, bloqueio anônimo, ownership, cascata e migração idempotente. Os três usuários
fictícios foram removidos. Um artefato de 34 arquivos foi guardado por sete dias,
sem deploy. A URL `.invalid` usada no build é deliberadamente não roteável e deve
ser substituída antes do QA hospedado.
