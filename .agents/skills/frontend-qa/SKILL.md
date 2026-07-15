---
name: frontend-qa
description: Executar QA funcional, visual, responsivo e acessível do planejador Colmeia. Usar após mudanças de fluxo ou interface, antes de release, ao investigar regressões e para produzir evidências de desktop e mobile.
---

# Frontend QA

## Procedimento

1. Ler docs/product/acceptance-criteria.md e docs/quality/testing-strategy.md.
2. Instalar pelo lockfile e iniciar a aplicação.
3. Executar typecheck, lint, formatação, testes unitários, componentes, e2e e builds.
4. Abrir primeiro acesso em perfil limpo; concluir e pular onboarding em execuções separadas.
5. Criar conta, cartão, receita, despesa, orçamento e meta; editar, duplicar e excluir com confirmação.
6. Verificar dashboard, filtros, relatórios, JSON, CSV, importações e persistência após recarga.
7. Inspecionar console e service worker; testar desktop e viewport móvel.
8. Testar teclado, foco, Escape, labels, progressos, contraste e reduced motion.
9. Salvar screenshots relevantes em docs/quality/screenshots/.
10. Registrar cada falha, corrigir, repetir o fluxo afetado e atualizar o checklist.

## Critérios de sucesso

- Todos os gates críticos aprovam.
- Fluxos principais, persistência e importações funcionam.
- Nenhum erro relevante no console.
- Desktop e mobile não têm corte, sobreposição ou ação inacessível.
- Evidências e checklist refletem a última versão.

## Recuperação

Se o navegador conectado falhar, usar Playwright configurado no projeto. Se o ambiente impedir e2e, executar os demais gates, registrar comando e bloqueio sem declarar aprovação. Nunca usar skip para esconder falha real.
