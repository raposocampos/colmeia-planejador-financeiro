# ADR — autenticação e sincronização V2

Status: aceito. Produção autorizada em 16/07/2026 após aprovação visual, validação
de RLS, SMTP próprio, entrega real e gates automatizados.

## Contexto

O MVP usa Dexie/IndexedDB e não possui identidade. A V2 precisa confirmar e-mail,
oferecer Google OAuth, sincronizar entre dispositivos e migrar dados locais sem
perda, preservando o build client-side para Sites e GitHub Pages.

## Alternativas

### Continuar somente com IndexedDB

Mantém privacidade, offline e custo operacional baixo, mas não oferece identidade,
confirmação de e-mail nem sincronização. Não atende a missão da V2.

### Backend próprio

Oferece controle total, porém exige API, autenticação, banco, e-mail, OAuth,
observabilidade, patches e operação contínua. Aumenta o risco e o custo antes de
validar o produto.

### Firebase

Entrega autenticação e sincronização madura. O Firestore favorece documentos e
regras próprias, enquanto o domínio atual é relacional e depende de integridade entre
contas, cartões, categorias e transações. A migração exigiria mais adaptação.

### Supabase

Combina Auth, confirmação de e-mail, Google OAuth, PostgreSQL, transações e Row
Level Security. O cliente JavaScript funciona no frontend estático e o modelo
relacional preserva IDs e referências existentes.

## Decisão

Usar Supabase Auth + PostgreSQL + RLS. Supabase é a fonte oficial; IndexedDB passa
a ser cache e origem de migração legada. Escritas ocorrem primeiro no remoto e só
atualizam o cache após sucesso. Offline permite leitura do cache, mas desabilita
edições nesta versão.

O cliente usa somente URL e chave anônima públicas. `service_role` é proibida no
frontend. RLS usa `auth.uid()` em cada operação. IDs legados continuam como texto e
chaves estrangeiras compostas com `user_id` impedem relacionamentos entre donos.

## Sessão

O modo padrão usa `sessionStorage`. Com consentimento em “Manter-me conectado”,
o adaptador do Supabase usa `localStorage`. Logout remove ambas as cópias. Senhas e
tokens próprios nunca são armazenados.

## Migração

O fluxo detecta dados reais, recomenda backup, impede merge automático com remoto
não vazio e usa RPC transacional idempotente. O IndexedDB não é apagado. A
conclusão depende de releitura, contagens e integridade referencial.

## Consequências e limites

- Dependência operacional do Supabase e das cotas do plano escolhido.
- E-mail e Google exigem configuração externa e URLs autorizadas.
- Sem resolução automática de conflitos na V2 inicial.
- Exclusão usa função de banco restrita ao usuário atual e cascata de dados.
- Staging deve validar RLS real antes de produção.
