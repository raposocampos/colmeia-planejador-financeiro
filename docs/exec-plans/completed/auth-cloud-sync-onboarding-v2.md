# Plano de execução — autenticação e nuvem V2

Concluído em 16/07/2026. Produção bloqueada até aprovação explícita.

## Estado

- [x] Inspecionar repositório, docs, skills, testes, workflows e publicação.
- [x] Executar e registrar baseline.
- [x] Decidir Supabase Auth + PostgreSQL + RLS no ADR.
- [x] Criar schema, RLS, verificações e configuração local.
- [x] Separar repositório local, remoto e cache.
- [x] Implementar autenticação, sessão, callbacks e recuperação.
- [x] Implementar detecção, backup e migração idempotente.
- [x] Implementar onboarding em memória e painel vazio.
- [x] Adicionar perfil, termos, privacidade e exclusão.
- [x] Atualizar documentação, CI e testes.
- [x] Executar auditorias de marca, segurança, migração e release.
- [x] Gerar screenshots e documento de aprovação.
- [x] Abrir PR de revisão sem merge e solicitar `APROVADO`.

PR em rascunho: https://github.com/raposocampos/colmeia-planejador-financeiro/pull/3

## Decisões

- Supabase é fonte oficial; IndexedDB é cache e origem legada.
- Escrita remota antes do cache; edição offline desabilitada.
- Sessão usa armazenamento alternável entre sessão e dispositivo.
- Dados de demonstração ficam somente em memória durante o tour.
- Não existe merge automático local/remoto nesta fase.

## Bloqueios externos

Configuração real de projeto Supabase, SMTP, Google OAuth, URLs autorizadas e
revisão jurídica pertencem a staging/produção e não foram inventadas nesta branch.
Merge, staging e produção permanecem bloqueados até autorização explícita de Lucas.
