# Checklist de QA

## Engenharia

- [x] TypeScript estrito sem erros.
- [x] ESLint e Prettier aprovados.
- [x] Unitários e componentes aprovados: 16 testes em 4 arquivos.
- [ ] E2E desktop e mobile aprovados.
- [x] QA manual na URL publicada em desktop e mobile.
- [x] Builds Sites e GitHub Pages aprovados localmente.
- [x] Sem segredos ou .env versionado.

## Produto

- [x] Onboarding completo, pular e reiniciar.
- [x] CRUD de conta, cartão, transação, orçamento e meta.
- [x] Dashboard reage e persistência sobrevive à recarga.
- [x] Filtros e relatórios coerentes.
- [x] JSON/CSV exportam; importações mostram prévia.
- [x] Dados demo são removíveis.

## Marca e acessibilidade

- [x] Nome oficial em toda a interface.
- [x] Paleta e tipografia coerentes com o brandbook.
- [x] Hexágonos controlados e sem aparência genérica de fintech.
- [x] Contraste, foco, labels, teclado e reduced motion verificados.
- [x] Gráficos possuem alternativa textual.

## Publicação

- [ ] GitHub Actions aprovado.
- [ ] GitHub Pages carrega JS, CSS, manifest e service worker.
- [x] Sites privado publicado e aberto.
- [x] Console publicado sem erro ou aviso relevante.

## Evidências

- `onboarding-desktop.png`
- `dashboard-desktop.png`
- `accounts-mobile.png`

O E2E Playwright está implementado, mas não foi executado neste ambiente porque a
política do navegador bloqueou a URL local. Os mesmos fluxos críticos foram
percorridos na publicação HTTPS: onboarding, exclusão reforçada, criação de
transação, atualização do dashboard, recarga com persistência e responsividade.
