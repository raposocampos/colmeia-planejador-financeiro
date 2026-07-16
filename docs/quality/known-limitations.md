# Limitações conhecidas

## V2 em revisão

- O projeto Supabase de staging existe em `ca-central-1`, a confirmação de e-mail,
  a migration V2, a Site URL e os callbacks hospedados foram configurados. SMTP
  próprio e Google OAuth ainda aguardam credenciais exclusivas de staging.
- O projeto de produção `colmeia-producao` existe em `sa-east-1`; schema, grants,
  RLS, migração e callbacks foram validados. O provedor padrão de e-mail do plano
  gratuito entrega apenas a endereços autorizados do time, por isso o deploy público
  permanece bloqueado até configurar SMTP próprio e comprovar confirmação/recuperação.
- O botão Google OAuth fica oculto por padrão e só é compilado quando
  `NEXT_PUBLIC_GOOGLE_AUTH_ENABLED=true`; ele não será exibido em produção até o
  provedor e os callbacks do Google serem validados.
- RLS passou na verificação estática e no teste remoto A/B/anônimo, incluindo
  ownership e exclusão em cascata no projeto exclusivo de staging.
- A V2 não edita offline nem resolve conflitos; remoto não vazio nunca recebe merge automático.
- O IndexedDB legado é preservado e pode voltar a oferecer migração em outro login.
- Retenção em backups, suboperadores, canal do titular e textos legais aguardam validação.
- O bundle principal ainda gera um aviso de chunk superior a 500 kB; code splitting fica para uma otimização posterior.
- A árvore de desenvolvimento mantém um aviso de baixa severidade em `@babel/core`; a correção indicada (`7.29.1`) ainda não foi publicada e uma mudança para Babel 8 seria incompatível nesta fase.
- O GitHub Environment e o workflow de banco foram executados com secrets
  protegidos. O host navegável existe em um repositório GitHub Pages separado e
  deve receber somente dados fictícios. Merge e produção foram autorizados, mas a
  publicação segue bloqueada pelo gate de entrega de e-mail.

- No MVP público atual os dados existem apenas no navegador; a V2 adiciona conta e
  sincronização assim que o gate de produção for liberado.
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
