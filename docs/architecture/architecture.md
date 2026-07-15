# Arquitetura

## Visão geral

A aplicação usa React 19 e TypeScript estrito no App Router. Vinext/Vite produz o
pacote compatível com Sites. Um segundo build estático com Next output export
gera out/ para GitHub Pages. A interface é uma SPA de uma rota com navegação de
seções em estado local, evitando problemas de fallback de rotas no Pages.

## Camadas

- app/PlannerApp.tsx: orquestra estado, fluxos e telas.
- app/components/: marca, onboarding, formulários e indicadores reutilizáveis.
- app/lib/types.ts: contratos de domínio.
- app/lib/calculations.ts: cálculos puros e formatação.
- app/lib/db.ts: adapter Dexie/IndexedDB e transações de persistência.
- app/lib/backup.ts: contrato Zod de backup e validação.
- app/lib/demo.ts: seed estritamente fictício.

## Fluxo de dados

Cada mutação é gravada pelo adapter e seguida de uma leitura consistente. O
estado React representa um snapshot do banco. Nenhum cálculo financeiro oficial
é persistido como ponto flutuante.

## Evolução

Um backend futuro deve implementar outro repositório e sincronização explícita,
sem mover cálculos para a UI. Migrações IndexedDB recebem novas versões Dexie.
