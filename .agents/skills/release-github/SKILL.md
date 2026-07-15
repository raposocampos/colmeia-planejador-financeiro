---
name: release-github
description: Preparar e publicar uma release segura do planejador Colmeia no GitHub e GitHub Pages. Usar quando o usuário pedir push, pull request, release, Pages ou validação final de publicação.
---

# Release GitHub

## Procedimento

1. Ler AGENTS.md, docs/quality/qa-checklist.md e docs/security/privacy-and-security.md.
2. Inspecionar status, diff, branch, remotos e escopo; não incluir mudanças alheias.
3. Procurar .env, tokens, chaves, dados pessoais e artefatos pesados.
4. Executar typecheck, lint, format check, testes, e2e, build e build:pages.
5. Confirmar que out/ contém index, manifest, service worker, ícones e assets.
6. Usar branch agent/financial-planner-mvp quando partir da branch padrão.
7. Fazer commits claros, push sem force e abrir PR draft quando o repositório já existir.
8. Em repositório novo exclusivo, criar main legível e enviar a versão validada.
9. Confirmar workflow Pages, aguardar sucesso e abrir a URL publicada.
10. Testar carregamento, navegação, transação, recarga, persistência, mobile e console.
11. Registrar URLs, branch, commits, PR, resultados e limitações.

## Critérios de sucesso

- Nenhum segredo ou dado real foi publicado.
- GitHub Actions e GitHub Pages estão aprovados.
- URL pública carrega assets e fluxos críticos.
- Relatório final distingue claramente o que foi executado do que ficou pendente.

## Recuperação

Se faltar autenticação ou permissão, manter todo o trabalho local, informar o bloqueio exato e o menor comando ou ação necessário. Não simular push, deploy ou validação. Nunca usar force push.
