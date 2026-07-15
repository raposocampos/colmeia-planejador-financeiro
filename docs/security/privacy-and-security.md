# Privacidade e segurança

## Dados

Contas, transações, categorias, orçamentos, metas e preferências ficam em
IndexedDB. A aplicação não envia esses registros a servidor. O repositório inclui
apenas seed fictício.

## Ameaças e controles

- Perda por limpeza do navegador: exportação JSON e aviso explícito.
- Importação malformada: parse JSON, schema Zod e confirmação antes de substituir.
- Sobrescrita CSV: importação somente aditiva e com prévia.
- Segredos: .env ignorado e nenhuma credencial no código.
- XSS: React escapa texto; CSV/JSON nunca são executados como HTML.
- Dependências: lockfile versionado e gates antes de release.

## Limites

Quem tiver acesso ao perfil do navegador pode acessar IndexedDB. Backup JSON não
é criptografado. O produto não deve armazenar senhas bancárias, cartões completos,
documentos ou credenciais.
