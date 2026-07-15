# Registro de decisões

## ADR-001 — Local-first

Decisão: IndexedDB via Dexie, sem backend no MVP. Motivo: privacidade, offline,
publicação estática e custo zero. Consequência: dados não sincronizam e dependem
de backup.

## ADR-002 — Centavos inteiros

Decisão: todo valor oficial é number inteiro em centavos. Conversão decimal
ocorre apenas na entrada e formatação. Motivo: evitar erros de ponto flutuante.

## ADR-003 — Duplo alvo de build

Decisão: Vinext/Vite para Sites e Next static export para GitHub Pages. Motivo:
preservar a estrutura hospedável do ambiente e cumprir a entrega no Pages. A
aplicação evita rotas dependentes de servidor.

## ADR-004 — Fontes de sistema

Decisão: não baixar Genty Sans ou Mont. Motivo: arquivos e licença não foram
fornecidos. Fallbacks foram escolhidos por proximidade e legibilidade.

## ADR-005 — Gráficos em CSS

Decisão: barras em CSS com tabela HTML alternativa. Motivo: reduzir dependência,
melhorar performance e manter leitura acessível.

## ADR-006 — Recorrência declarativa

Decisão: registrar a frequência sem gerar lançamentos automáticos. Motivo:
impedir duplicações silenciosas no MVP.
