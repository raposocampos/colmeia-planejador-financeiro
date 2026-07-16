# Checklist de QA — autenticação e nuvem V2

Executado em 16/07/2026 na branch `feat/auth-cloud-sync-onboarding-v2`.

## Engenharia

- [x] TypeScript estrito sem erros.
- [x] ESLint e Prettier aprovados.
- [x] Unitários e componentes aprovados: 35 testes em 12 arquivos.
- [x] E2E aprovado: 14 execuções em projetos desktop e mobile.
- [x] Console e exceções de página falham automaticamente o E2E.
- [x] Builds Vinext/Sites e GitHub Pages aprovados localmente.
- [x] Migração, estrutura RLS e ownership por sessão verificados estaticamente.
- [x] Auditoria de dependências sem vulnerabilidade alta ou crítica.
- [x] Sem segredos ou .env versionado.

## Produto

- [x] Login, cadastro, confirmação simulada, recuperação e sessão testados.
- [x] Onboarding V2 completo, pular e reiniciar.
- [x] CRUD de conta, cartão, transação, orçamento e meta.
- [x] Dashboard reage e persistência sobrevive à recarga.
- [x] Filtros e relatórios coerentes.
- [x] JSON/CSV exportam; importações mostram prévia.
- [x] Exemplos do onboarding permanecem somente em memória.
- [x] Migração mostra contagens, backup e impede merge silencioso.

## Marca e acessibilidade

- [x] Nome oficial em toda a interface.
- [x] Paleta e tipografia coerentes com o brandbook.
- [x] Hexágonos controlados e sem aparência genérica de fintech.
- [x] Favicon usa a assinatura hexagonal da Colmeia e possui fallback PNG.
- [x] Contraste, foco, labels, teclado e reduced motion verificados.
- [x] Gráficos possuem alternativa textual.

## Release

- [x] GitHub Actions atualizado para os gates da V2.
- [x] Branch de revisão isolada da `main`.
- [ ] Merge autorizado por Lucas.
- [ ] Staging autorizado por Lucas.
- [ ] Produção autorizada por Lucas.

## Evidências

- `docs/quality/screenshots/v2/login-desktop.png`
- `docs/quality/screenshots/v2/login-mobile.png`
- `docs/quality/screenshots/v2/signup-desktop.png`
- `docs/quality/screenshots/v2/signup-mobile.png`
- `docs/quality/screenshots/v2/onboarding-desktop.png`
- `docs/quality/screenshots/v2/onboarding-mobile.png`
- `docs/quality/screenshots/v2/migration-data.png`
- `docs/quality/screenshots/v2/dashboard-empty.png`
- `docs/quality/screenshots/v2/dashboard-migrated.png`
- `docs/quality/screenshots/v2/profile-privacy.png`

A V2 não foi publicada. As evidências foram capturadas no build local exclusivo de
revisão, sem credenciais reais e sem alterar o MVP público.
