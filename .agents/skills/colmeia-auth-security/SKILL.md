---
name: colmeia-auth-security
description: Auditar autenticação Supabase, sessões, callbacks, validações, RLS, separação entre usuários, exclusão de conta e logs da Colmeia V2. Usar ao criar ou revisar login, cadastro, OAuth, recuperação de senha, migrations SQL, perfil ou qualquer mudança que toque identidade e dados remotos; não usar para alterações puramente visuais sem impacto de sessão.
---

# Colmeia Auth Security

## Procedimento

1. Ler `references/security-review.md` e o ADR vigente de autenticação.
2. Inspecionar o diff, dependências, variáveis públicas e bundles; rejeitar `service_role`, tokens, senhas ou credenciais reais.
3. Validar cadastro, confirmação de e-mail, Google OAuth, callback PKCE, recuperação, logout e mensagens não enumeráveis.
4. Confirmar que “Manter-me conectado” usa armazenamento do provedor, nunca senha ou token próprio, e que logout limpa os dois modos de sessão.
5. Conferir RLS em cada tabela exposta, com políticas separadas para SELECT, INSERT, UPDATE e DELETE, `TO authenticated` e identidade de `auth.uid()`.
6. Executar testes de isolamento, callbacks, sessão e exclusão; registrar limitações de testes sem credenciais reais.
7. Revisar logs e erros para impedir valores financeiros, descrições, nomes de contas, e-mails completos, tokens e backups.
8. Bloquear aprovação se houver segredo, RLS incompleta, acesso anônimo, callback aberto ou exclusão insegura.

## Critérios de sucesso

- A chave anônima é a única credencial pública prevista e nenhum valor real está versionado.
- Usuários acessam somente os próprios registros e visitantes não autenticados não acessam dados financeiros.
- Sessão, callbacks e mensagens de erro seguem o modelo documentado.
- Exclusão e retenção correspondem aos documentos de privacidade.

## Recuperação

Se o Supabase local não estiver disponível, executar validação estática das migrations e testes com cliente simulado. Registrar que a verificação integrada de RLS permanece obrigatória antes de staging; nunca substituir por confiança no filtro do frontend.
