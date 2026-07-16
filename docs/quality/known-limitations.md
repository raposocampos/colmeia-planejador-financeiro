# Limitações conhecidas

## V2 em revisão

- O projeto Supabase real, SMTP, Google OAuth, região e callbacks ainda não foram configurados.
- RLS tem verificação estática em CI; o teste de integração deve ser repetido no projeto local/staging autorizado.
- A V2 não edita offline nem resolve conflitos; remoto não vazio nunca recebe merge automático.
- O IndexedDB legado é preservado e pode voltar a oferecer migração em outro login.
- Retenção em backups, suboperadores, canal do titular e textos legais aguardam validação.
- O bundle principal ainda gera um aviso de chunk superior a 500 kB; code splitting fica para uma otimização posterior.
- A árvore de desenvolvimento mantém um aviso de baixa severidade em `@babel/core`; a correção indicada (`7.29.1`) ainda não foi publicada e uma mudança para Babel 8 seria incompatível nesta fase.
- Nenhum staging, produção, merge ou deploy foi executado nesta branch.

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
