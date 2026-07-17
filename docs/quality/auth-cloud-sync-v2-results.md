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
Google OAuth e seus callbacks permanecem pendentes. Chaves, token e senha rotacionada
foram armazenados exclusivamente nos serviços externos e no GitHub Environment
`staging`; não foram copiados para arquivos, commits ou comentários.

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

Em 16/07/2026, o domínio `auth.colmeiaeducacao.com` foi verificado no Resend e o
SMTP próprio foi ativado no projeto de staging com chave restrita somente a envio
por esse domínio. Os templates versionados de confirmação e recuperação foram
aplicados no Supabase. Um envio de recuperação autorizado foi aceito pelo Supabase
e registrado como `delivered` no Resend, com remetente, assunto e conteúdo da
Colmeia e sem assinatura visual do Supabase. O endereço completo e a credencial não
foram registrados. Google OAuth permanece pendente. A validação não libera o projeto
de produção, que exige sua própria configuração e comprovação de SMTP.

O primeiro e-mail revelou que o editor do painel havia anexado o HTML da Colmeia ao
modelo padrão em inglês. Os modelos de recuperação e confirmação foram reaplicados
com substituição integral e conferidos novamente após recarregar o painel: cada um
corresponde ao arquivo versionado, contém exatamente um `ConfirmationURL` e não
contém o bloco padrão em inglês.

Um segundo envio de recuperação autorizado foi registrado como `delivered`. A
mensagem gerada contém um único botão “Criar nova senha”, um único bloco visual da
Colmeia e nenhum trecho do modelo padrão em inglês; remetente e assunto personalizados
também foram confirmados sem registrar o endereço do destinatário ou o link assinado.

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
versionados em `supabase/templates/`. O SMTP do Resend foi ativado no projeto de
produção com remetente do domínio verificado `auth.colmeiaeducacao.com`, e os dois
templates foram aplicados por substituição integral. Google OAuth permanece
desativado e seu botão fica oculto por padrão, evitando uma ação não funcional até
que credenciais e callbacks próprios sejam validados.

Uma conta autorizada pelo proprietário recebeu uma recuperação real registrada
como `delivered`. A mensagem entregue contém exatamente um botão “Criar nova
senha”, um único link assinado, remetente, assunto e rodapé da Colmeia, e nenhum
trecho do modelo padrão em inglês. O endereço e o link assinado não foram
registrados. A primeira chave criada durante a configuração foi revogada antes de
ser salva ou utilizada; a substituta ficou armazenada somente no Supabase e no
provedor externo.

Após essa validação, instalação congelada, typecheck, lint, formato, 38 testes,
15 execuções E2E, migrations/RLS, varredura de 159 arquivos, auditoria sem
vulnerabilidade alta ou crítica, build Vinext, build Pages e `git diff --check`
foram aprovados. O gate de SMTP para merge e publicação está atendido.

## Publicação de produção

A PR #3 foi retirada de rascunho após o
[CI 29547363948](https://github.com/raposocampos/colmeia-planejador-financeiro/actions/runs/29547363948)
aprovar todos os gates e foi mesclada em `main` sem force push. O
[run 29547451690](https://github.com/raposocampos/colmeia-planejador-financeiro/actions/runs/29547451690)
repetiu os gates e publicou a V2 no GitHub Pages.

Na primeira versão empacotada para Sites, a validação pós-deploy detectou que as
variáveis públicas `NEXT_PUBLIC_*` estavam cadastradas no host, mas não tinham sido
incorporadas ao bundle cliente. A entrega não foi considerada concluída. O build
foi refeito carregando as variáveis diretamente do ambiente hospedado, sem criar
ou versionar `.env`, e a versão corrigida substituiu a anterior no endereço público.
O runbook passou a registrar essa exigência para releases futuras.

Sites e GitHub Pages foram abertos após a publicação. Nos dois hosts, login, assets,
rotas de recuperação, Termos e Privacidade, foco do campo de senha, controle único
de visualização e ausência de overflow foram aprovados. Um login real no Sites
alcançou o aviso de migração do IndexedDB, comprovando a conexão com o Supabase de
produção; o teste foi interrompido nesse ponto e nenhum dado local foi importado,
mesclado ou apagado.

- Domínio principal: https://colmeiaeducacao.com
- Sites alternativo: https://colmeia-planejador-financeiro.lucascampos.chatgpt.site
- GitHub Pages: https://raposocampos.github.io/colmeia-planejador-financeiro/

## Domínio próprio

Em 16/07/2026, a zona DNS da Locaweb passou a manter os dois destinos `A` do
Sites no mesmo registro raiz, conforme o modelo de múltiplos conteúdos do provedor.
Também foram adicionados os TXT de propriedade do OpenAI Sites e validação do
hostname Cloudflare. MX, SPF, DKIM e DMARC do Resend permaneceram intactos.

`https://colmeiaeducacao.com/` foi definido como Site URL de produção no Supabase,
com callbacks explícitos para confirmação e recuperação. O endereço também passou
a ser `NEXT_PUBLIC_SITE_URL` do Sites; os hosts técnicos anteriores continuam na
lista autorizada para compatibilidade e rollback.
