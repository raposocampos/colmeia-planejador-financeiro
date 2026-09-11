# Colmeia Educação Financeira

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Pessoas brasileiras que querem começar ou consolidar a organização financeira pessoal com privacidade, linguagem simples e uma visão mensal acionável. A experiência deve servir tanto quem está registrando a primeira despesa quanto quem já acompanha contas, cartões, orçamentos e metas com frequência.

## Product Purpose

A Colmeia transforma contas e movimentações em uma leitura clara de saldo, receitas, despesas, compromissos, orçamento e metas. O sucesso é a pessoa entender a situação do mês em segundos, registrar uma movimentação em menos de dois minutos e saber qual próximo passo pode melhorar sua organização sem se sentir julgada.

## Positioning

Um planejador financeiro brasileiro que combina visão prática do mês, educação sem punição e controle explícito sobre os próprios dados. Em vez de prometer decisões automáticas ou aconselhamento financeiro, organiza evidências pessoais e devolve clareza para escolhas conscientes.

## Operating Context

O uso principal acontece no painel mensal, alternando entre visão geral, transações, contas e cartões, orçamentos, metas, relatórios e configurações. A V2 usa autenticação, Supabase como fonte oficial, cache local por usuário e leitura offline. Backups JSON/CSV e a migração segura do IndexedDB legado continuam parte do ritual de proteção dos dados.

## Capabilities and Constraints

- Valores oficiais permanecem em centavos inteiros e os cálculos ficam centralizados no domínio existente.
- A interface é uma SPA React/TypeScript com navegação por seções, build Vinext/Vite e exportação estática para GitHub Pages.
- A reformulação pode alterar composição, hierarquia, microinterações e linguagem visual, mas não muda regras financeiras, modelo de dados, autenticação, persistência ou contratos de segurança.
- Supabase é a fonte oficial na V2; offline permite leitura e bloqueia mutações para evitar conflitos.
- Não são recursos do produto: Open Finance, recomendações de investimento, pagamentos, assinaturas, IA financeira ou compartilhamento familiar.
- Dados demonstrativos e materiais de apresentação devem ser claramente identificados como fictícios quando puderem ser confundidos com dados reais.

## Brand Commitments

- O nome do produto é “Colmeia Educação Financeira”.
- Preservar o reconhecimento construído pelo símbolo de células da colmeia, pelo preto quente e pelo amarelo-mel; hexágonos são assinatura, não formato universal.
- A voz é clara, acolhedora, confiável, organizada e educativa, sem julgamento ou alarmismo.
- A direção visual aprovada por Laura Mendes no Gate G1 é “Editorial acolhedora”: fundo creme quente, contraste em preto suave, amarelo-mel estratégico, hierarquia tipográfica humana e uma experiência calma e confiante.
- Fontes ou assets proprietários só podem ser incorporados quando a licença for fornecida.

## Evidence on Hand

- Produto em produção: https://colmeiaeducacao.com
- Especificação, jornadas e critérios em `docs/product/`.
- Sistema de marca histórico e diretrizes de interface em `docs/design/`.
- Capturas reais e sanitizadas em `docs/quality/screenshots/`.
- Brandbook histórico `COLMEIA.pdf`, usado como referência de continuidade, sem licença de redistribuição das fontes identificadas.
- Aprovação G1 registrada na conversa com Laura Mendes em 10/09/2026: opção 1, Editorial acolhedora.
- Não há depoimentos, benchmarks, números comerciais ou alegações de resultado autorizados; não inventar esse tipo de prova.

## Product Principles

1. Clareza antes de quantidade: a pessoa deve entender o mês sem decifrar um painel cheio de widgets.
2. Educação sem culpa: estados difíceis precisam orientar uma próxima ação realista, nunca punir.
3. Privacidade visível: sincronização, cache, backup e limitações devem ser compreensíveis.
4. Controle humano: nenhuma importação, exclusão ou migração substitui dados silenciosamente.
5. Continuidade confiável: o redesign muda a experiência visual sem quebrar fluxos, dados ou acessibilidade.

## Accessibility & Inclusion

Manter WCAG AA, foco visível, navegação completa por teclado, alvos de toque de 40–44 px, leitura em viewport de 390 px, alternativa textual para gráficos, estados que não dependam apenas de cor e suporte a `prefers-reduced-motion`.
