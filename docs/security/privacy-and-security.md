# Privacidade e segurança

## Dados

O MVP público mantém contas, transações, categorias, orçamentos, metas e preferências
somente no IndexedDB. Na V2 em revisão, o Supabase passa a ser a fonte oficial e um
IndexedDB separado por usuário funciona como cache de leitura. O banco legado é
preservado durante a migração e nunca é apagado automaticamente.

O repositório inclui apenas dados fictícios. Os projetos Supabase de staging e
produção receberam somente usuários e registros descartáveis criados pelos testes
automatizados; a limpeza foi executada ao final.

## Ameaças e controles

- Perda por limpeza do navegador: exportação JSON e aviso explícito.
- Importação malformada: parse JSON, schema Zod e confirmação antes de substituir.
- Sobrescrita CSV: importação somente aditiva e com prévia.
- Segredos: .env ignorado e nenhuma credencial no código.
- Identidade e dados remotos: RLS por operação, `auth.uid()` no banco e chaves
  estrangeiras compostas impedem leitura ou referência entre usuários.
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
completos, documentos ou credenciais. Os callbacks de produção foram configurados,
mas SMTP próprio e teste de entrega externa continuam obrigatórios antes do deploy;
Google OAuth, retenção e textos jurídicos ainda precisam de validação operacional.
