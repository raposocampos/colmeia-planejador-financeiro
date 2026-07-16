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
| `pnpm verify:migrations`         | aprovado; 3 migrations, 9 tabelas, políticas RLS e grants explícitos           |
| `pnpm check:secrets`             | aprovado; 159 arquivos verificados                                             |
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

## Ajustes após as revisões visuais

Após o feedback final de Lucas, o campo de senha passou a remover o controle nativo
duplicado do Edge e a delegar o foco visual somente ao contêiner. A sidebar desktop
ficou fixa em `100svh`, com navegação e rodapé sempre disponíveis durante a rolagem.
O onboarding substituiu cartões textuais por cinco capturas reais e sanitizadas do
dashboard, transações, contas/cartões, orçamentos/metas e configurações. Um cenário
Playwright percorre as sete abas, rola o documento e verifica posição, viewport e
rodapé; outro garante que as capturas não criam dados persistentes.

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
  branch e PR de revisão eram permitidos antes de `APROVADO`; a produção foi depois
  autorizada explicitamente e permanece condicionada aos gates técnicos.

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
38 testes, 15 execuções E2E, verificação SQL, varredura de 159 arquivos, auditoria,
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

## QA hospedado em staging

O host foi publicado no repositório separado
`raposocampos/colmeia-planejador-financeiro-staging`, sem merge da PR V2 e sem
alterar o Sites público. O
[run 29537395850](https://github.com/raposocampos/colmeia-planejador-financeiro-staging/actions/runs/29537395850)
aprovou instalação congelada, typecheck, lint, formato, 38 testes, schema/RLS,
segredos, auditoria, E2E, build Pages e deploy.

A URL `https://raposocampos.github.io/colmeia-planejador-financeiro-staging/`
carregou a tela de login com assets e chave pública do Supabase, sem erros de
console. Em 390 × 844, `scrollWidth` permaneceu igual a 390 e o formulário ficou
completo. O Supabase Auth foi configurado com a Site URL do staging e callbacks
explícitos para confirmação e recuperação.

Evidências:

- [login hospedado desktop](screenshots/staging-v2-login-desktop.png);
- [login hospedado mobile](screenshots/staging-v2-login-mobile.png).

SMTP próprio e Google OAuth não foram ativados por ausência de credenciais próprias.
O teste de entrega de e-mail, confirmação real e recuperação permanece pendente de
um endereço de teste autorizado. Merge e produção continuam bloqueados.

## Preparação do ambiente de produção

Após a autorização explícita “faça os ajustes e suba para Prod”, foi criado o
projeto `colmeia-producao` em `sa-east-1`, com Data API ativa, exposição automática
de novas tabelas desabilitada e RLS automático. As migrations versionadas foram
aplicadas; grants mínimos para `authenticated` e administrativos para `service_role`
foram adicionados porque a produção não usa privilégios automáticos. O teste remoto
aprovou isolamento A/B, bloqueio anônimo, ownership, cascata e migração idempotente.
As contas fictícias foram removidas e a senha de banco foi rotacionada.

Sites e GitHub receberam somente a URL e a chave pública publicável do projeto; não
há chave administrativa no bundle. Site URL e callbacks de confirmação/recuperação
foram configurados para Sites e GitHub Pages. Os templates em português ficaram
versionados em `supabase/templates/`, mas a API do plano gratuito recusou aplicá-los
sem SMTP próprio. Como o provedor padrão também limita entrega a membros autorizados
do time, merge e deploy seguem bloqueados até SMTP e teste externo aprovados.
Google OAuth permanece desativado e seu botão fica oculto por padrão, evitando uma
ação não funcional até que credenciais e callbacks próprios sejam validados.
