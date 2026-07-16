# Revisão para aprovação — autenticação, nuvem e onboarding V2

Data da preparação: 16/07/2026

Branch: `feat/auth-cloud-sync-onboarding-v2`

Pull Request: https://github.com/raposocampos/colmeia-planejador-financeiro/pull/3

Estado: **merge e produção autorizados; deploy bloqueado até SMTP funcional**

## Ajuste solicitado após a primeira revisão

Em 16/07/2026, Lucas aprovou visualmente login e onboarding e solicitou que a
barra lateral escura permanecesse visível durante a rolagem. A sidebar agora é fixa,
ocupa `100svh` e mantém navegação, privacidade, versão e sincronização na viewport,
sem alterar o menu móvel ou a impressão. Um teste de regressão percorre Visão geral,
Transações, Contas e cartões, Orçamentos, Metas, Relatórios e Configurações.

Evidências atualizadas:

- [Dashboard com sidebar fixa](../quality/screenshots/v2/dashboard-empty.png)
- [Configurações com sidebar fixa](../quality/screenshots/v2/profile-privacy.png)

Na revisão final, Lucas pediu que o painel lateral voltasse ao comportamento da
primeira versão. A coluna deixou de rolar com o documento e o bloco “Sincronizado
com privacidade” fica ancorado ao final da viewport. O menu móvel continua fixo
somente quando aberto.

## 1. Resumo das alterações

A V2 adiciona autenticação Supabase por e-mail/senha, confirmação obrigatória,
Google OAuth, recuperação, sessão opcional persistente, perfil, páginas legais,
sincronização remota com cache local, migração do IndexedDB e onboarding por conta.
O dashboard, a linguagem e a identidade visual do MVP foram preservados.

## 2. Arquivos principais

- `app/AppGate.tsx`, `app/components/AuthScreen.tsx`, `app/components/Onboarding.tsx`;
- `app/components/MigrationDialog.tsx`, `app/PlannerApp.tsx`;
- `app/lib/repositories/`, `app/lib/supabase.ts`, `app/lib/migration.ts`;
- `supabase/migrations/202607160001_auth_cloud_sync_v2.sql` e migrations de grants;
- `supabase/templates/` com modelos de confirmação e recuperação versionados;
- `app/termos/page.tsx`, `app/privacidade/page.tsx`;
- `docs/security/`, `docs/operations/` e `.agents/skills/colmeia-*`.

## 3. Texto completo do onboarding

### Etapa 1 — Comece pela visão geral

“Receitas, despesas e o resultado do mês aparecem juntos para você enxergar o
momento atual com clareza.”

“A captura usa dados fictícios e mostra onde consultar o resumo do mês.”

Captura sanitizada: `public/tutorial/visao-geral.png`.

### Etapa 2 — Registre suas transações

“Adicione receitas e despesas, depois edite ou exclua quando precisar. Você
continua no controle.”

“Abra “Transações” na barra lateral para pesquisar, filtrar e adicionar lançamentos.”

Captura sanitizada: `public/tutorial/transacoes.png`.

### Etapa 3 — Organize contas e cartões

“Cadastre onde o dinheiro fica e acompanhe saldos, faturas, limites usados e
disponíveis.”

“Use “Contas e cartões” na barra lateral. Nada é criado automaticamente ao concluir.”

Captura sanitizada: `public/tutorial/contas-cartoes.png`.

### Etapa 4 — Planeje com orçamentos e metas

“Defina referências mensais e acompanhe objetivos no seu ritmo, com mensagens
educativas e sem julgamento.”

“Orçamentos e Metas ficam em áreas separadas e não constituem recomendação financeira.”

Captura sanitizada: `public/tutorial/orcamentos-metas.png`.

### Etapa 5 — Seus dados, suas escolhas

“A nuvem sincroniza seus registros entre dispositivos. Você também pode exportar
JSON e CSV quando quiser.”

“Em Configurações você encontra perfil, backup e privacidade. Em dispositivos
compartilhados, sempre saia da conta.”

Captura sanitizada: `public/tutorial/configuracoes-backup.png`.

Nota permanente: “As capturas usam dados fictícios e não alteram sua conta.”

## 4. Antes e depois

| Área        | Antes (MVP público)                | Depois (V2 em revisão)                                  |
| ----------- | ---------------------------------- | ------------------------------------------------------- |
| Entrada     | onboarding local direto            | login/cadastro antes do painel                          |
| Dados       | IndexedDB oficial                  | Supabase oficial + cache separado por usuário           |
| Onboarding  | 4 passos, demonstração persistível | 5 etapas com capturas reais e sanitizadas               |
| Identidade  | perfil local `LF`                  | nome, e-mail, confirmação e provedores                  |
| Offline     | leitura e edição local             | leitura do cache; edição bloqueada para evitar conflito |
| Privacidade | aviso local-first                  | perfil, exclusão, Termos e Privacidade preliminares     |

Referências “antes”:

- [Dashboard desktop](../quality/screenshots/dashboard-desktop.png)
- [Onboarding desktop](../quality/screenshots/onboarding-desktop.png)
- [Contas mobile](../quality/screenshots/accounts-mobile.png)

Evidências “depois”:

- [Login desktop](../quality/screenshots/v2/login-desktop.png)
- [Login mobile](../quality/screenshots/v2/login-mobile.png)
- [Cadastro desktop](../quality/screenshots/v2/signup-desktop.png)
- [Cadastro mobile](../quality/screenshots/v2/signup-mobile.png)
- [Onboarding desktop](../quality/screenshots/v2/onboarding-desktop.png)
- [Onboarding mobile](../quality/screenshots/v2/onboarding-mobile.png)
- [Migração de dados](../quality/screenshots/v2/migration-data.png)
- [Painel vazio](../quality/screenshots/v2/dashboard-empty.png)
- [Painel com dados migrados](../quality/screenshots/v2/dashboard-migrated.png)
- [Perfil e privacidade](../quality/screenshots/v2/profile-privacy.png)

## 5. Fluxos de autenticação

- Cadastro valida nome, e-mail, senha de 12 caracteres, confirmação e aceites.
- O Supabase envia a confirmação; `AppGate` impede o painel sem `email_confirmed_at`.
- Login Google usa o provedor `google`, PKCE e callback `/auth/callback/`.
- Recuperação sempre responde de modo neutro; redefinição ocorre em rota dedicada.
- Logout encerra a sessão local e limpa as cópias dos dois storages.
- CI simula provedores; não automatiza uma conta Google real.

## 6. Manter-me conectado

O checkbox começa desmarcado. Desmarcado, a sessão do Supabase fica em
`sessionStorage`; marcado, fica em `localStorage`. A senha nunca é armazenada e não
há token criado pela aplicação. A opção alerta sobre dispositivo compartilhado.

## 7. Migração do IndexedDB

O fluxo ignora categorias padrão como evidência de uso, conta registros, recomenda
backup, valida referências e bloqueia merge se a nuvem já tiver dados. A RPC deriva
o proprietário de `auth.uid()`, roda em transação, usa ID determinístico, preserva
IDs/centavos/datas e só registra conclusão após contagens. O banco legado não é apagado.

## 8. Limitações conhecidas

- Supabase de staging e produção, schema, grants, RLS, Site URL e callbacks foram
  configurados e validados. O plano gratuito recusou templates personalizados sem
  SMTP próprio, e o provedor padrão não atende usuários externos ao time.
- O host navegável usa um repositório GitHub Pages separado e aceita somente dados
  fictícios; o Sites público e a produção permaneceram inalterados.
- Não há edição offline nem merge automático de conflitos.
- Termos, Privacidade, retenção e fornecedores precisam de revisão jurídica/contratual.
- O modo de revisão é compilado apenas pelo build local `build:review` e não é produção.

## 9. Riscos antes da produção

- SMTP ausente impedindo confirmação e recuperação para o público externo;
- configuração incorreta de OAuth ou domínio;
- cotas e retenção do plano Supabase escolhido;
- XSS ou dispositivo comprometido expondo uma sessão persistida;
- tentativa de mesclar manualmente estados divergentes sem processo futuro;
- publicação de textos legais preliminares sem parecer jurídico.

## 10. Resultados dos testes

- Baseline: typecheck, lint, 16 testes e dois builds passaram; formato e E2E tinham
  falhas preexistentes registradas em `docs/quality/baseline-auth-cloud-sync-v2.md`.
- V2: 38 testes unitários/componentes, 15 execuções E2E aprovadas e 1 skip
  intencional do cenário exclusivo de sidebar desktop no projeto mobile.
- Typecheck, lint, formato, migrações/RLS, segredos e os dois builds foram aprovados.
- A auditoria não encontrou vulnerabilidades altas ou críticas; permanece um aviso
  de baixa severidade em `@babel/core`, sem versão 7 corrigida publicada.
- O build emite um aviso não bloqueador de chunk principal acima de 500 kB.
- Nenhuma credencial real é necessária ou aceita pelos testes.

## 11. Checklist de aprovação

- [x] Aprovo o layout da tela de login
- [x] Aprovo o layout do cadastro
- [x] Aprovo os textos do onboarding
- [x] Aprovo o fluxo de migração
- [x] Aprovo o comportamento de manter conectado
- [x] Aprovo as páginas de privacidade e termos
- [x] Autorizo preparar staging
- [x] Autorizo publicar em produção

Registro de revisão: em 16/07/2026, Lucas Campos respondeu literalmente `APROVADO`
após as duas revisões da sidebar e das evidências visuais.

Registro de staging: em 16/07/2026, Lucas Campos declarou literalmente
`Autorizo preparar o ambiente de staging da V2, sem merge e sem publicação em
produção.` A autorização cobre a infraestrutura e os testes de staging isolados,
mas não autoriza merge nem qualquer alteração no site público atual.

Em seguida, Lucas autorizou explicitamente o uso do Chrome autenticado para
configurar o Supabase e confirmou pessoalmente a rotação da senha do banco. Os runs
29535218591 e 29535426194 aprovaram o dry-run, a migration exclusiva da V2 e os
testes reais de isolamento/migração. O run 29537395850 publicou somente o host
isolado de staging e repetiu todos os gates. Nenhum merge ou deploy de produção foi
executado.

Na solicitação seguinte, Lucas declarou “Agora faça os ajustes e suba para Prod”,
autorizando explicitamente merge e publicação após os ajustes. A infraestrutura de
produção foi preparada e testada, mas o deploy permanece bloqueado pelo gate de
SMTP: sem provedor próprio, confirmação e recuperação não funcionam para usuários
externos ao time do Supabase. A autorização continua válida após esse gate ser
atendido.
