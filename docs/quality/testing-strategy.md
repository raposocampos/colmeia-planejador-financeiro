# Estratégia de testes

## V2 — autenticação e nuvem

Testes unitários cobrem normalização de e-mail, senha, sessão, detecção e contagem
do legado, idempotência, referências, painel vazio e cache separado. Componentes
cobrem login, cadastro, confirmação simulada, foco, onboarding em memória e conflito
de migração. Playwright usa build estático local de revisão, sem credenciais, para
14 execuções em desktop/mobile. A migration SQL tem verificação de RLS, policies,
índices, dono por sessão e RPCs; integração real permanece gate de staging.

`NEXT_PUBLIC_REVIEW_MODE=true` aparece somente no `build:review` local e nunca deve
ser usado em artefato público.

## Pirâmide

- Unitários: moeda, resumo, saldo, filtros, orçamento, meta, comparação e backup.
- Componentes: brand lockup e progresso acessível.
- E2E: primeiro acesso, conta, despesa, dashboard, orçamento, meta, download,
  recarga e mobile.
- QA manual no navegador: hierarquia, responsividade, console, foco e PWA.

## Quality gates

1. pnpm install --frozen-lockfile
2. pnpm typecheck
3. pnpm lint
4. pnpm format:check
5. pnpm test
6. pnpm test:e2e
7. pnpm build
8. pnpm build:pages
9. Inspeção de console, responsividade, manifest e service worker
10. Validação da URL publicada

Falhas são corrigidas e repetidas. Não usar skip ou exclusões para esconder
regressões; o único skip e2e permitido limita o cenário mobile ao projeto mobile.
