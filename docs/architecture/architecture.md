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

## Fluxo de dados V2

`AppGate` valida a sessão e confirmação de e-mail antes de configurar o gateway.
`PlannerRepository` desacopla a UI. `SupabasePlannerRepository` grava primeiro no
PostgreSQL e atualiza `AuthenticatedCacheRepository` somente após sucesso. Leitura
online atualiza o cache; offline usa o último cache e bloqueia mutações. O
`LocalPlannerRepository` encapsula exclusivamente o banco legado e nunca é apagado
pela migração.

Supabase Auth usa PKCE e armazenamento de sessão alternável. RLS deriva o dono de
`auth.uid()`. `profiles.onboarding_completed_at` sincroniza o tour. Nenhum cálculo
financeiro oficial é persistido como ponto flutuante.

## Evolução

Conflitos complexos e edição offline permanecem futuros. O ADR da V2 registra a
comparação tecnológica e o motivo da escolha do Supabase.
