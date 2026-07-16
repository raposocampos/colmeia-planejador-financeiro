# Prontidão de staging — Colmeia V2

Data: 16/07/2026

Escopo autorizado: preparar staging isolado, sem merge e sem publicação em produção.

## Estado

| Item                                      | Estado                                          |
| ----------------------------------------- | ----------------------------------------------- |
| Branch V2 separada da `main`              | pronto                                          |
| GitHub Environment `staging`              | preparado sem credenciais; restrito à branch V2 |
| Workflow manual e confirmação `STAGING`   | pronto                                          |
| Supabase CLI fixada em `2.109.1`          | pronto                                          |
| Validação contra URLs de produção         | pronto                                          |
| Dry-run antes de migrations               | pronto                                          |
| Teste real de RLS A/B/anônimo e cascata   | pronto para executar                            |
| Teste real de migração idempotente        | pronto para executar                            |
| Build armazenado como artefato por 7 dias | pronto para executar                            |
| Projeto Supabase exclusivo                | aguarda criação/autenticação                    |
| Secrets e variáveis de staging            | aguardam configuração segura                    |
| URL hospedada de staging                  | não publicada                                   |
| Merge e produção                          | bloqueados                                      |

## Como desbloquear a execução remota

1. Criar no painel do Supabase um projeto exclusivo, sem dados reais.
2. Configurar confirmação de e-mail, SMTP de teste, Google OAuth de teste e somente
   callbacks do host de staging.
3. No GitHub, abrir **Settings → Environments → staging** e cadastrar as variáveis e
   secrets descritas em `environment-setup.md`. Não copiar credenciais para issues,
   PRs, commits, logs ou mensagens.
4. Executar **Prepare V2 staging** primeiro com `confirmation=STAGING` e
   `apply_migrations=false`.
5. Revisar o dry-run e repetir com `apply_migrations=true` para aplicar o schema e
   executar os testes reais.

O workflow gera somente um artefato técnico. Hospedagem de staging exige uma URL
separada que contenha `staging`; o projeto Sites público atual e o GitHub Pages não
podem ser reutilizados para esse fim.

## Evidência esperada

- quality gates completos aprovados;
- CLI confirma o projeto de staging e lista apenas a migration esperada no dry-run;
- script registra somente a aprovação dos cenários, sem e-mails, tokens ou valores;
- três usuários temporários são removidos mesmo em falha;
- artefato `colmeia-v2-staging-<sha>` disponível por sete dias;
- nenhuma execução de deploy presente no workflow.
