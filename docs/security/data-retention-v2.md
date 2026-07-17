# Retenção e exclusão — V2

Documento técnico preliminar. Necessita de revisão jurídica antes da disponibilização pública.

| Classe                      | Retenção proposta                              | Exclusão                                                     |
| --------------------------- | ---------------------------------------------- | ------------------------------------------------------------ |
| Conta e perfil              | enquanto a conta estiver ativa                 | RPC de exclusão remove `auth.users`; cascata remove tabelas  |
| Dados financeiros           | enquanto a conta estiver ativa                 | cascata ou limpeza explícita do planejador                   |
| Metadados de migração       | enquanto a conta estiver ativa                 | cascata; contém somente versão, data e contagens             |
| Cache IndexedDB autenticado | até limpeza do navegador                       | exclusão local pelo navegador; inacessível sem sessão no app |
| IndexedDB legado            | preservado até decisão da pessoa               | não é apagado pela migração V2                               |
| Sessão                      | sessão do navegador ou persistente por escolha | logout limpa `localStorage` e `sessionStorage`               |
| Backups exportados          | sob controle da pessoa                         | responsabilidade de quem exportou                            |

O prazo de retenção de logs, snapshots, disaster recovery e backups do Supabase
depende do plano e do contrato selecionados. Deve ser preenchido antes de produção.
O processo de suporte não deve copiar conteúdo financeiro para tickets.
