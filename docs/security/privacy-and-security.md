# Privacidade e segurança

## Dados

O MVP público mantém contas, transações, categorias, orçamentos, metas e preferências
somente no IndexedDB. Na V2 em revisão, o Supabase passa a ser a fonte oficial e um
IndexedDB separado por usuário funciona como cache de leitura. O banco legado é
preservado durante a migração e nunca é apagado automaticamente.

O repositório inclui apenas dados fictícios. Os usuários e registros descartáveis
dos testes automatizados foram removidos. Uma conta de produção autorizada pelo
proprietário foi criada para comprovar a entrega de recuperação; seu endereço não
é registrado no repositório.

## Ameaças e controles

- Perda por limpeza do navegador: exportação JSON e aviso explícito.
- Importação malformada: parse JSON, schema Zod e confirmação antes de substituir.
- Sobrescrita CSV: importação somente aditiva e com prévia.
- Segredos: .env ignorado e nenhuma credencial no código.
- Identidade e dados remotos: RLS por operação, `auth.uid()` no banco e chaves
  estrangeiras compostas impedem leitura ou referência entre usuários.
- Ordem de categorias: a RPC recebe apenas IDs, exige a lista completa, rejeita
  duplicatas e deriva o proprietário da sessão; o cliente nunca envia `user_id`.
- Evolução de schema: `sort_order` é opcional e a correção de `month` altera
  somente constraints, sem backfill ou exclusão de registros financeiros.
- Migração: backup recomendado, validação de referências, RPC transacional,
  idempotência e bloqueio quando o remoto não está vazio.
- Staging: chaves administrativas ficam no GitHub Environment e não entram no
  bundle; testes fictícios são removidos ao final.
- Produção: região `sa-east-1`, exposição automática de novas tabelas desabilitada,
  privilégios SQL explícitos e RLS remoto testado com usuários A/B e acesso anônimo.
- XSS: React escapa texto; CSV/JSON nunca são executados como HTML.
- Dependências: lockfile versionado e gates antes de release.

## Limites

Quem tiver acesso ao perfil do navegador pode acessar sessão e IndexedDB. Backup
JSON não é criptografado. O produto não deve armazenar senhas bancárias, cartões
completos, documentos ou credenciais. Os callbacks, o SMTP próprio e o teste de
entrega externa de produção foram validados. Google OAuth, retenção e textos
jurídicos ainda precisam de validação operacional.
