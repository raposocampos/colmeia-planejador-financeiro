# Prontidão de staging — Colmeia V2

Data: 16/07/2026

Escopo autorizado: preparar staging isolado, sem merge e sem publicação em produção.

## Estado

| Item                                       | Estado                                               |
| ------------------------------------------ | ---------------------------------------------------- |
| Branch V2 separada da `main`               | pronto                                               |
| GitHub Environment `staging`               | credenciais protegidas; restrito à branch e ao PR #3 |
| Gate por labels no PR e confirmação manual | pronto                                               |
| Supabase CLI fixada em `2.109.1`           | pronto                                               |
| Validação contra URLs de produção          | pronto                                               |
| Dry-run antes de migrations                | pronto                                               |
| Teste real de RLS A/B/anônimo e cascata    | aprovado                                             |
| Teste real de migração idempotente         | aprovado                                             |
| Build armazenado como artefato por 7 dias  | aprovado                                             |
| Projeto Supabase exclusivo                 | criado em `ca-central-1`                             |
| Secrets e variáveis de staging             | configurados fora do repositório                     |
| Migration remota V2                        | aplicada somente no projeto de staging               |
| URL hospedada de staging                   | não publicada                                        |
| Merge e produção                           | bloqueados                                           |

## Execução remota concluída

O projeto `colmeia-v2-staging` foi criado exclusivamente para a V2. A confirmação
de e-mail permanece obrigatória, o provedor de e-mail está ativo e os demais
provedores permanecem desativados até existirem credenciais próprias de staging.

O GitHub Environment guarda quatro secrets e três variáveis sem expor valores no
repositório. Como ainda não existe hospedagem de staging, `NEXT_PUBLIC_SITE_URL` usa
temporariamente o domínio reservado e não roteável
`https://colmeia-v2-staging.invalid`. Esse valor serve somente para validar e gerar
o artefato; deve ser substituído antes de qualquer teste de autenticação hospedado.

O dry-run aprovado listou exclusivamente
`202607160001_auth_cloud_sync_v2.sql`. A execução seguinte aplicou essa migration e
aprovou isolamento A/B, bloqueio anônimo, ownership, exclusão em cascata e segunda
execução idempotente da migração legada. Os três usuários fictícios foram removidos
ao final e o painel de Auth voltou ao estado sem usuários.

Evidências do GitHub Actions:

- [dry-run aprovado](https://github.com/raposocampos/colmeia-planejador-financeiro/actions/runs/29535218591);
- [migration e testes integrados aprovados](https://github.com/raposocampos/colmeia-planejador-financeiro/actions/runs/29535426194);
- artefato técnico `colmeia-v2-staging-8bf634f407208ac8a90611e46ab170c9cd87faa2`,
  retido por sete dias e sem deploy.

Enquanto o workflow não está na branch padrão, `workflow_dispatch` não aparece na
interface. As labels permitem executar o mesmo pipeline no PR sem merge.

O workflow gera somente um artefato técnico. Hospedagem de staging exige uma URL
separada que contenha `staging`; o projeto Sites público atual e o GitHub Pages não
podem ser reutilizados para esse fim. SMTP próprio, Google OAuth e callbacks reais
também permanecem pendentes até essa URL existir.

## Evidência esperada

- quality gates completos aprovados;
- CLI confirma o projeto de staging e lista apenas a migration esperada no dry-run;
- script registra somente a aprovação dos cenários, sem e-mails, tokens ou valores;
- três usuários temporários são removidos mesmo em falha;
- artefato `colmeia-v2-staging-<sha>` disponível por sete dias;
- nenhuma execução de deploy presente no workflow.
