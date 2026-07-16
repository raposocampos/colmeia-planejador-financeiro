# Colmeia Educação Financeira

Planejador financeiro para organizar contas, cartões, receitas, despesas,
orçamentos e metas com clareza e sem linguagem punitiva.

> A branch `feat/auth-cloud-sync-onboarding-v2` é uma revisão não publicada da
> autenticação e sincronização. A versão pública atual continua no MVP local-first.

![Prévia social da Colmeia Educação Financeira](public/og.png)

Versão privada publicada: https://colmeia-planejador-financeiro.lucascampos.chatgpt.site

![Dashboard do planejador](docs/quality/screenshots/dashboard-desktop.png)

![Contas em viewport mobile](docs/quality/screenshots/accounts-mobile.png)

## Funcionalidades

- Autenticação por e-mail/senha, confirmação, Google OAuth e recuperação (V2 em revisão).
- Onboarding autenticado em cinco etapas, com capturas reais e dados sanitizados.
- Migração segura do IndexedDB legado, Supabase como fonte oficial e cache por usuário.
- Dashboard mensal, saldo, categorias, orçamentos, metas e compromissos.
- Contas, cartões e transações com edição, busca, filtro e confirmação.
- Orçamentos mensais e metas com progresso.
- Relatórios filtráveis e tabelas alternativas acessíveis.
- Backup JSON, CSV e importações com validação e pré-visualização.
- IndexedDB, service worker, PWA e layouts desktop/mobile.

## Stack

React 19, TypeScript estrito, App Router, Vinext/Vite, Supabase JS, CSS com
tokens, Dexie, Zod, React Hook Form, Vitest, Testing Library e Playwright.

## Começar

Requer Node 22 e pnpm 11.

1. pnpm install
2. Copie `.env.example` para `.env.local` e use um projeto Supabase local.
3. pnpm dev
4. Abra http://localhost:3000

## Qualidade

- pnpm typecheck
- pnpm lint
- pnpm format:check
- pnpm test
- pnpm test:e2e
- pnpm verify:migrations
- pnpm check:secrets
- pnpm build
- pnpm build:pages

## Armazenamento e backup

Na V2, o Supabase é a fonte oficial e um IndexedDB separado por usuário guarda
o último cache. O banco legado não é apagado automaticamente. Em Configurações,
JSON e CSV continuam disponíveis. Offline permite leitura, mas não edição.

## Arquitetura e documentação

AGENTS.md é o mapa do harness. Requisitos, decisões, modelo de dados, estratégia
de testes, privacidade e limitações estão em docs/.

## Publicação

O workflow existente continua publicando somente a `main`. Pull requests executam
os gates da V2. Esta branch não faz merge, staging ou deploy sem aprovação explícita
de Lucas Campos.

## Limitações e roadmap

A V2 ainda depende da configuração externa de Supabase, SMTP, Google OAuth e URLs
autorizadas, além de revisão jurídica. Open Finance, OFX, compartilhamento familiar,
pagamentos, assinaturas, planejamento familiar/aposentadoria e IA estão fora do escopo.

## Aviso

A Colmeia Educação Financeira oferece ferramentas de organização e educação
financeira. As informações apresentadas não constituem recomendação de
investimento, consultoria financeira, contábil ou jurídica.

## Licença

MIT. Fontes proprietárias do brandbook não estão incluídas.
