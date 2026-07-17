# Gates de aprovação

## Revisão técnica

- Typecheck, lint, formatação, unitários, componentes, E2E e dois builds.
- Migrations verificadas, RLS por operação e isolamento entre usuários.
- Auditoria de dependências e busca de segredos.
- Screenshots desktop/mobile e documento de antes/depois.

## Autorização humana

- O checklist em `docs/approvals/auth-onboarding-v2-review.md` começa vazio.
- Um PR de revisão não equivale a autorização de staging ou produção.
- Somente a resposta explícita `APROVADO` de Lucas em tarefa posterior desbloqueia o próximo passo.
- Nunca inferir aprovação de frases como “pode continuar”, silêncio ou aprovação de CI.
