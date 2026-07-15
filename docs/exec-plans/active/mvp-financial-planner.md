# Plano de execução — MVP

Atualizado em 15/07/2026.

## Estado

- [x] Inspecionar as seis páginas do brandbook.
- [x] Inicializar stack e servidor de desenvolvimento.
- [x] Criar mapa AGENTS.md e documentação inicial.
- [x] Definir domínio, centavos inteiros e adapter IndexedDB.
- [x] Implementar onboarding, navegação, dashboard e formulários.
- [x] Implementar contas, cartões, transações, orçamentos e metas.
- [x] Implementar relatórios, backup, CSV e configurações.
- [x] Adicionar PWA e build estático para GitHub Pages.
- [x] Criar testes unitários, de componentes e e2e.
- [ ] Executar typecheck, lint, formatação, testes e builds.
- [ ] Executar Brand Guardian e QA em desktop/mobile.
- [ ] Corrigir achados e gerar screenshots.
- [ ] Publicar no GitHub, GitHub Pages e Sites.
- [ ] Validar URLs e mover este plano para completed.

## Decisões

Arquitetura local-first; recorrência não materializada; gráficos CSS com tabela;
fontes proprietárias substituídas; navegação de uma rota para Pages.

## Riscos

O GitHub CLI não está instalado; usar conexão GitHub e Git local. O build de
Sites e o export estático precisam ser validados separadamente. Playwright usará
o Chrome instalado para evitar baixar navegador duplicado.
