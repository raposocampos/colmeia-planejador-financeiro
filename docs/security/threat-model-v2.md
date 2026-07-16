# Modelo de ameaças — autenticação e nuvem V2

Documento técnico preliminar. Necessita de revisão jurídica antes da disponibilização pública.

## Fronteiras

Navegador, armazenamento local, Supabase Auth, API PostgREST, PostgreSQL, provedor de
e-mail e Google OAuth são fronteiras distintas. A chave anônima é pública e toda
autorização de dados depende de RLS, não de filtros do frontend.

## Ameaças e controles

| Ameaça                       | Controle implementado                                                             | Risco residual                                  |
| ---------------------------- | --------------------------------------------------------------------------------- | ----------------------------------------------- |
| Usuário A acessar B          | `user_id` da sessão, RLS por operação e FKs compostas                             | regressão de migration exige teste local        |
| Roubo de sessão              | PKCE, TLS do fornecedor, sessão padrão em `sessionStorage`, logout limpa storages | XSS ou dispositivo comprometido                 |
| Descoberta de contas         | mensagens iguais em login e recuperação                                           | canais externos podem ter comportamento próprio |
| CSRF/callback manipulado     | callback autorizado pelo provedor e URLs relativas conhecidas                     | lista externa configurada incorretamente        |
| Injeção ou alteração de dono | cliente não envia `user_id`; default usa `auth.uid()` e RLS valida                | funções futuras mal configuradas                |
| Perda na migração            | backup, RPC transacional, ID determinístico, contagem, releitura e integridade    | falha de fornecedor antes da resposta           |
| Vazamento em logs            | política de minimização e varredura de segredos                                   | console ou integração futura inadequada         |
| Exclusão de terceiro         | `delete_my_account()` deriva `auth.uid()` e não recebe ID                         | retenção em backup do fornecedor                |

## Premissas antes de produção

Validar em projeto Supabase isolado: políticas com duas identidades reais, SMTP,
Google OAuth, domínio autorizado, expiração de links, limites, observabilidade sem
conteúdo financeiro e procedimento de restauração.
