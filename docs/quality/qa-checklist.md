# Checklist de QA — autenticação e nuvem V2

Executado em 16/07/2026 na branch `feat/auth-cloud-sync-onboarding-v2`.

## Engenharia

- [x] TypeScript estrito sem erros.
- [x] ESLint e Prettier aprovados.
- [x] Unitários e componentes aprovados: 38 testes em 13 arquivos.
- [x] E2E aprovado: 15 execuções aprovadas e 1 cenário desktop ignorado no projeto mobile.
- [x] Console e exceções de página falham automaticamente o E2E.
- [x] Builds Vinext/Sites e GitHub Pages aprovados localmente.
- [x] Migração, estrutura RLS e ownership por sessão verificados estaticamente.
- [x] Staging real aprovado: RLS A/B/anônimo, cascata e migração idempotente.
- [x] Produção real em `sa-east-1` aprovada: grants explícitos, RLS A/B/anônimo,
      cascata e migração idempotente.
- [x] Auditoria de dependências sem vulnerabilidade alta ou crítica.
- [x] Sem segredos ou .env versionado.

## Produto

- [x] Login, cadastro, confirmação simulada, recuperação e sessão testados.
- [x] Onboarding V2 completo, pular e reiniciar.
- [x] CRUD de conta, cartão, transação, orçamento e meta.
- [x] Dashboard reage e persistência sobrevive à recarga.
- [x] Filtros e relatórios coerentes.
- [x] JSON/CSV exportam; importações mostram prévia.
- [x] Capturas reais e sanitizadas do onboarding não criam dados na conta.
- [x] Migração mostra contagens, backup e impede merge silencioso.

## Marca e acessibilidade

- [x] Nome oficial em toda a interface.
- [x] Paleta e tipografia coerentes com o brandbook.
- [x] Hexágonos controlados e sem aparência genérica de fintech.
- [x] Favicon usa a assinatura hexagonal da Colmeia e possui fallback PNG.
- [x] Contraste, foco, labels, teclado e reduced motion verificados.
- [x] Gráficos possuem alternativa textual.
- [x] Sidebar fica fixa, ocupa a viewport e continua navegável nas sete abas desktop.
- [x] Bloco de privacidade e rodapé ficam ancorados ao final da sidebar visível.

## Release

- [x] GitHub Actions atualizado para os gates da V2.
- [x] Branch de revisão isolada da `main`.
- [x] Merge autorizado por Lucas no pedido explícito de publicação em produção.
- [x] Preparação de staging autorizada por Lucas em 16/07/2026.
- [x] Produção autorizada por Lucas em 16/07/2026.
- [x] SMTP próprio configurado e entrega para usuário externo comprovada.

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

A V2 ainda não foi publicada em produção. Código, banco, URLs de callback,
variáveis públicas dos hosts, SMTP e templates estão preparados; todos os gates
técnicos para o deploy final foram aprovados.

Evidências integradas: dry-run
[29535218591](https://github.com/raposocampos/colmeia-planejador-financeiro/actions/runs/29535218591)
e aplicação/testes
[29535426194](https://github.com/raposocampos/colmeia-planejador-financeiro/actions/runs/29535426194).
