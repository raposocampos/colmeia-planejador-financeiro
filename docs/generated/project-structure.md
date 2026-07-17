# Estrutura do projeto

- app/AppGate.tsx: sessão, perfil, migração e onboarding autenticado.
- app/components/AuthScreen.tsx: login, cadastro, confirmação e recuperação.
- app/lib/repositories/: adapters legado, cache, Supabase e memória de teste.
- supabase/migrations/: schema, RLS, triggers e RPCs da V2.
- docs/approvals/: pacote visual e checklist de aprovação humana.
- docs/operations/: configuração, publicação e rollback.
- docs/security/*-v2.md: prontidão LGPD, ameaças, retenção e incidentes.

- .agents/skills/brand-guardian: auditoria de marca.
- .agents/skills/frontend-qa: ciclo de QA.
- .agents/skills/release-github: release e Pages.
- .github/workflows/pages.yml: CI e publicação.
- app/PlannerApp.tsx: shell e telas do planejador.
- app/components/: BrandMark, EntryModal, Onboarding e ProgressBar.
- app/lib/: tipos, cálculos, ordem de categorias, Dexie, backup e demo.
- public/: PWA, service worker e Open Graph.
- scripts/: wrappers multiplataforma de build.
- tests/: unitários e componentes.
- e2e/: fluxos Playwright.
- docs/: produto, design, arquitetura, qualidade e segurança.
