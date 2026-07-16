# Revisão para aprovação — autenticação, nuvem e onboarding V2

Data da preparação: 16/07/2026

Branch: `feat/auth-cloud-sync-onboarding-v2`

Pull Request: https://github.com/raposocampos/colmeia-planejador-financeiro/pull/3

Estado: **não publicada; merge, staging e produção bloqueados**

## 1. Resumo das alterações

A V2 adiciona autenticação Supabase por e-mail/senha, confirmação obrigatória,
Google OAuth, recuperação, sessão opcional persistente, perfil, páginas legais,
sincronização remota com cache local, migração do IndexedDB e onboarding por conta.
O dashboard, a linguagem e a identidade visual do MVP foram preservados.

## 2. Arquivos principais

- `app/AppGate.tsx`, `app/components/AuthScreen.tsx`, `app/components/Onboarding.tsx`;
- `app/components/MigrationDialog.tsx`, `app/PlannerApp.tsx`;
- `app/lib/repositories/`, `app/lib/supabase.ts`, `app/lib/migration.ts`;
- `supabase/migrations/202607160001_auth_cloud_sync_v2.sql`;
- `app/termos/page.tsx`, `app/privacidade/page.tsx`;
- `docs/security/`, `docs/operations/` e `.agents/skills/colmeia-*`.

## 3. Texto completo do onboarding

### Etapa 1 — Comece pela visão geral

“Receitas, despesas e o resultado do mês aparecem juntos para você enxergar o
momento atual com clareza.”

“Os valores abaixo são apenas uma apresentação e não serão salvos.”

Exemplos em memória: “Receitas R$ 4.800,00”, “Despesas R$ 3.120,00” e
“Resultado R$ 1.680,00”.

### Etapa 2 — Registre suas transações

“Adicione receitas e despesas, depois edite ou exclua quando precisar. Você
continua no controle.”

“Descrições e valores de exemplo existem somente enquanto este tour está aberto.”

### Etapa 3 — Organize contas e cartões

“Cadastre onde o dinheiro fica e acompanhe saldos, faturas, limites usados e
disponíveis.”

“Nenhuma conta é criada automaticamente ao concluir.”

### Etapa 4 — Planeje com orçamentos e metas

“Defina referências mensais e acompanhe objetivos no seu ritmo, com mensagens
educativas e sem julgamento.”

“A Colmeia não transforma esses exemplos em recomendação financeira.”

### Etapa 5 — Seus dados, suas escolhas

“A nuvem sincroniza seus registros entre dispositivos. Você também pode exportar
JSON e CSV quando quiser.”

“Em dispositivos compartilhados, saia da conta e evite manter a sessão conectada.”

Nota permanente: “Os exemplos deste tour não são gravados no navegador nem na nuvem.”

## 4. Antes e depois

| Área        | Antes (MVP público)                | Depois (V2 em revisão)                                  |
| ----------- | ---------------------------------- | ------------------------------------------------------- |
| Entrada     | onboarding local direto            | login/cadastro antes do painel                          |
| Dados       | IndexedDB oficial                  | Supabase oficial + cache separado por usuário           |
| Onboarding  | 4 passos, demonstração persistível | 5 etapas, exemplos somente em memória                   |
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

- Supabase real, SMTP, Google OAuth e callbacks não foram configurados nesta branch.
- Teste RLS integrado precisa ser repetido em Supabase local/staging autorizado.
- Não há edição offline nem merge automático de conflitos.
- Termos, Privacidade, retenção e fornecedores precisam de revisão jurídica/contratual.
- O modo de revisão é compilado apenas pelo build local `build:review` e não é produção.

## 9. Riscos antes da produção

- configuração incorreta de RLS, SMTP, OAuth, domínio ou região;
- cotas e retenção do plano Supabase escolhido;
- XSS ou dispositivo comprometido expondo uma sessão persistida;
- tentativa de mesclar manualmente estados divergentes sem processo futuro;
- publicação de textos legais preliminares sem parecer jurídico.

## 10. Resultados dos testes

- Baseline: typecheck, lint, 16 testes e dois builds passaram; formato e E2E tinham
  falhas preexistentes registradas em `docs/quality/baseline-auth-cloud-sync-v2.md`.
- V2: 35 testes unitários/componentes e 14 execuções E2E desktop/mobile aprovadas.
- Typecheck, lint, formato, migrações/RLS, segredos e os dois builds foram aprovados.
- A auditoria não encontrou vulnerabilidades altas ou críticas; permanece um aviso
  de baixa severidade em `@babel/core`, sem versão 7 corrigida publicada.
- O build emite um aviso não bloqueador de chunk principal acima de 500 kB.
- Nenhuma credencial real é necessária ou aceita pelos testes.

## 11. Checklist de aprovação

- [ ] Aprovo o layout da tela de login
- [ ] Aprovo o layout do cadastro
- [ ] Aprovo os textos do onboarding
- [ ] Aprovo o fluxo de migração
- [ ] Aprovo o comportamento de manter conectado
- [ ] Aprovo as páginas de privacidade e termos
- [ ] Autorizo preparar staging
- [ ] Autorizo publicar em produção

Marcar os dois últimos itens exige uma tarefa futura e autorização explícita; este
documento não autoriza merge nem deploy por si só.
