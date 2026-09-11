---
version: 1
slug: "app-plannerapp-tsx"
primary_target: "app/PlannerApp.tsx"
related_targets:
  [
    "app/globals.css",
    "app/components/AuthScreen.tsx",
    "app/components/Onboarding.tsx",
    "app/components/EntryModal.tsx",
  ]
---

# Planejador financeiro

- Escopo: todas as superfícies autenticadas do planejador, autenticação, onboarding, modais e estados responsivos.
- Modo: Operate.
- Público e tarefa: pessoas brasileiras organizando o mês; compreender a situação, registrar movimentações e decidir um próximo passo com confiança.
- Ação principal: registrar uma nova transação sem perder o contexto financeiro do mês.
- Restrições: preservar domínio, persistência, segurança, conteúdo factual, acessibilidade e a assinatura reconhecível da Colmeia.
- Referência aprovada: `.impeccable/mocks/decision/editorial-acolhedora-approved.png`, aprovada por Laura Mendes no Gate G1.

## Direction contract

**THESIS:** Um caderno financeiro editorial que transforma números difíceis em uma leitura humana e orientada. Recusa o dashboard genérico feito de muitos cards iguais e deixa hierarquia, ritmo e linguagem explicarem o mês.

**OWN-WORLD:** Creme quente como papel, preto suave como tinta e amarelo-mel reservado a decisões, seleção e assinatura. Superfícies quase planas, regras finas, cantos de 12–16 px e dados tabulares. Hexágonos aparecem somente no símbolo e em momentos de marca.

**STORY:** Primeiro a pessoa entende como o mês está; depois enxerga para onde o dinheiro foi; por fim encontra um próximo passo realista. A navegação mantém os fluxos conhecidos, e cada estado difícil orienta sem culpa.

**FIRST VIEWPORT:** Sidebar escura fixa, barra superior leve e uma composição assimétrica: manchete e ações à esquerda, saldo em um campo de mel suave à direita, quatro métricas em uma faixa editorial e, abaixo, categorias, orçamentos e transações em leitura contínua. “Nova transação” permanece a ação primária.

**FORM:** Direção escolhida “Editorial acolhedora”, comp-led, opção 1 do Gate G1. A decisão explícita da marca prevalece sobre o roll; seed `76ded3ec`. Wayfinding doa uma próxima ação inequívoca e o painel de voo doa uma ordem de varredura estável entre verdades financeiras.

**FINISH:** unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

## Momento memorável

Ao trocar o mês, o campo de saldo e a faixa de métricas fazem uma única transição editorial curta, como virar uma página; com movimento reduzido, a atualização é instantânea.

## Decisões ainda abertas

- Refinamento final do desenho do símbolo e das assinaturas depende do Gate G2.
- O Brandbook completo e os arquivos finais da marca dependem do Gate G3.
