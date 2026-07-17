# Prontidão técnica LGPD — V2

Documento técnico preliminar. Necessita de revisão jurídica antes da disponibilização pública.

## Inventário e finalidades

| Dados                                                       | Finalidade                                       | Local                                                  |
| ----------------------------------------------------------- | ------------------------------------------------ | ------------------------------------------------------ |
| Nome, e-mail, provedor e datas da conta                     | autenticação, perfil e suporte                   | Supabase Auth/PostgreSQL                               |
| Contas, cartões, categorias, transações, orçamentos e metas | entregar o planejador e sincronizar dispositivos | Supabase PostgreSQL                                    |
| Estado do onboarding e fuso                                 | experiência consistente                          | PostgreSQL e cache local                               |
| Sessão autenticada                                          | manter o acesso autorizado                       | `sessionStorage` ou, com consentimento, `localStorage` |
| Cópia sincronizada                                          | leitura do último estado sem conexão             | IndexedDB separado por usuário                         |

Não há venda de dados nem dados financeiros no seed. Google recebe dados somente
quando a pessoa escolhe esse provedor. A base legal, o controlador, o encarregado,
o canal do titular e transferências internacionais precisam de definição jurídica.

## Controles do titular

- exportação de todo o estado em JSON e transações em CSV;
- logout e escolha de não persistir a sessão;
- visualização de perfil e provedores;
- exclusão da conta por RPC restrita à identidade atual;
- preservação do legado até decisão explícita de migração.

## Fornecedores e limites

Supabase presta autenticação, banco e APIs. Google participa apenas do OAuth. Região,
suboperadores, SLA, backups, prazo de expurgo e limites do plano gratuito devem ser
confirmados no contrato e no projeto escolhido. Cotas podem interromper autenticação
ou sincronização; exportações feitas pela pessoa não podem ser removidas pela Colmeia.

## Logs e riscos residuais

Logs técnicos podem usar ID de correlação, tipo de operação, horário e código de erro.
São proibidos valores financeiros, descrições, nomes de contas, e-mails completos,
tokens e payloads de backup. Permanecem riscos de dispositivo comprometido, senha
reutilizada, configuração incorreta de OAuth/SMTP, indisponibilidade do fornecedor e
retenção em backups gerenciados.
