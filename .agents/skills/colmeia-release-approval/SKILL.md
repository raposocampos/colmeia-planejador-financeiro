---
name: colmeia-release-approval
description: Auditar a prontidão da Colmeia V2 para revisão e bloquear merge, staging ou produção sem testes, screenshots, documentação, RLS, diff sem segredos e aprovação explícita de Lucas Campos. Usar antes de push de revisão, Pull Request, staging, merge ou deploy da V2; não usar para releases do MVP que não toquem autenticação ou nuvem.
---

# Colmeia Release Approval

## Procedimento

1. Ler `references/approval-gates.md` e `docs/approvals/auth-onboarding-v2-review.md`.
2. Confirmar branch de feature e proibir alteração direta da `main`.
3. Verificar diff, segredos, `.env`, migrations, RLS, testes, builds, screenshots e documentos.
4. Exigir que todos os itens de aprovação permaneçam desmarcados até Lucas revisar.
5. Antes de staging ou produção, procurar na conversa atual a resposta literal e inequívoca `APROVADO` de Lucas Campos.
6. Na ausência de aprovação, permitir somente commit, push da branch e PR de revisão sem merge ou deploy.
7. Registrar o bloqueio e encerrar solicitando revisão explícita.

## Bloqueios obrigatórios

- Teste crítico falhou ou não foi executado sem limitação registrada.
- Screenshots ou comparação visual ausentes.
- Documentação, threat model ou retenção desatualizados.
- Segredo, credencial real ou arquivo `.env` no diff.
- RLS sem quatro políticas por tabela ou sem testes de isolamento.
- Ausência de aprovação explícita de Lucas.

## Critério de sucesso

A V2 pode chegar apenas a um PR de revisão. Staging, merge e produção continuam bloqueados até uma tarefa futura iniciada após `APROVADO`.
