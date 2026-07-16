# Colmeia Educação Financeira

## Objetivo

Manter um planejador financeiro brasileiro local-first, acolhedor e confiável.
Os dados financeiros ficam no navegador; não adicionar backend sem decisão
arquitetural registrada.

## Mapa do repositório

- app/: interface React, componentes, domínio e persistência.
- supabase/: schema PostgreSQL, RLS, RPCs e testes de isolamento.
- public/: manifest, service worker e assets públicos.
- tests/ e e2e/: testes unitários, de componentes e ponta a ponta.
- docs/product/: escopo, jornadas e critérios de aceitação.
- docs/design/: marca, interface e acessibilidade.
- docs/architecture/: arquitetura, dados e decisões.
- docs/quality/: estratégia, checklist, limitações e evidências.
- docs/security/: privacidade e segurança.
- .agents/skills/: auditorias reutilizáveis de marca, QA e release.

## Comandos

- pnpm install: instalar pelo lockfile.
- pnpm dev: abrir desenvolvimento local.
- pnpm typecheck: validar TypeScript estrito.
- pnpm lint: validar regras estáticas.
- pnpm format:write: formatar o repositório.
- pnpm test: executar testes unitários e de componentes.
- pnpm test:e2e: executar fluxos Playwright.
- pnpm verify:migrations: verificar schema, RLS e RPCs.
- pnpm check:secrets: bloquear arquivos de ambiente e credenciais.
- pnpm build: gerar o pacote para Sites.
- pnpm build:pages: gerar out/ para GitHub Pages.

## Regras essenciais

- Armazenar dinheiro como inteiros em centavos.
- Centralizar cálculos e formatação em app/lib/calculations.ts.
- Separar IndexedDB da interface por app/lib/db.ts.
- Validar importações antes de persistir e nunca substituir silenciosamente.
- Não introduzir dados pessoais reais, tokens, chaves ou arquivos .env.
- Nunca aceitar `user_id` da interface; derive o proprietário da sessão e valide por RLS.
- Preservar o IndexedDB legado até decisão explícita da pessoa.
- Não publicar a V2 sem aprovação explícita de Lucas Campos.
- Não incorporar fontes ou assets proprietários sem licença fornecida.
- Usar “Colmeia Educação Financeira” como nome do produto.
- Usar hexágonos como assinatura, não como formato universal.
- Manter contraste WCAG AA, foco visível e navegação por teclado.
- Atualizar documentação e plano quando o comportamento mudar.
- Não concluir nem publicar com testes críticos quebrados.

## Definition of Done

Fluxos principais funcionam em desktop e mobile, dados persistem após recarga,
backup é validado, PWA gera build, typecheck/lint/testes/build aprovam, console
não apresenta erro relevante e a documentação reflete o código.
