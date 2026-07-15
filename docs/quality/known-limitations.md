# Limitações conhecidas

- Dados existem apenas no navegador atual; não há conta nem sincronização.
- IndexedDB não representa criptografia completa.
- Recorrências são lembretes declarativos e não geram lançamentos.
- CSV aceita formato simples e não interpreta campos com separador dentro do
  texto além das aspas básicas.
- Relatórios usam mês calendário; intervalo personalizado completo fica para a
  próxima fase.
- Cartão calcula fatura do mês pela data da despesa, sem ciclo de fechamento
  avançado ou parcelas.
- Paginação/virtualização não é necessária para o volume esperado do MVP.
- Trap de foco em modal pode ser refinado; Escape, foco visível e labels existem.
- Instalação PWA depende do suporte do navegador e de HTTPS na publicação.
- Os cenários Playwright estão escritos, mas não rodaram neste ambiente por bloqueio
  da URL local; a validação equivalente foi feita manualmente na URL HTTPS publicada.
- GitHub Pages depende da criação do repositório público e da autenticação do GitHub
  CLI, indisponível neste ambiente no momento da entrega.
