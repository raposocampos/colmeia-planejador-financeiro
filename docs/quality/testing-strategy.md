# Estratégia de testes

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
