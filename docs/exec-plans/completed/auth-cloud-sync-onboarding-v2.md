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
- [x] Registrar a aprovação explícita da preparação de staging.
- [x] Criar GitHub Environment `staging` restrito à branch V2.
- [x] Preparar workflow manual com dry-run, migrations, testes remotos e artefato.

PR em rascunho: https://github.com/raposocampos/colmeia-planejador-financeiro/pull/3

## Decisões

- Supabase é fonte oficial; IndexedDB é cache e origem legada.
- Escrita remota antes do cache; edição offline desabilitada.
- Sessão usa armazenamento alternável entre sessão e dispositivo.
- Dados de demonstração ficam somente em memória durante o tour.
- Não existe merge automático local/remoto nesta fase.

## Bloqueios externos

A preparação de staging foi autorizada em 16/07/2026. A execução remota aguarda um
projeto Supabase exclusivo e o cadastro seguro das variáveis/secrets do ambiente;
SMTP, Google OAuth e callbacks também precisam ser exclusivos. Nenhuma credencial
foi inventada ou solicitada por mensagem. Merge e produção permanecem bloqueados
até nova autorização explícita de Lucas.
