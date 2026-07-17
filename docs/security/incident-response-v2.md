# Resposta a incidentes — V2

Documento técnico preliminar. Necessita de revisão jurídica antes da disponibilização pública.

## Detecção e triagem

1. Registrar horário, ambiente, versão, ID técnico anonimizado e sintoma.
2. Nunca registrar token, e-mail completo, backup ou conteúdo financeiro.
3. Classificar: indisponibilidade, acesso indevido, perda/integridade ou segredo exposto.
4. Preservar evidências técnicas com acesso mínimo.

## Contenção

- bloquear release e suspender credencial/configuração afetada;
- desabilitar provedor OAuth ou função vulnerável quando necessário;
- preservar a branch e os logs técnicos;
- não apagar dados locais usados para recuperação;
- comunicar Lucas Campos antes de qualquer ação irreversível fora do runbook.

## Recuperação e comunicação

Reaplicar migrations revisadas, testar A/B e anônimo, restaurar conforme o plano do
fornecedor, verificar contagens e liberar em etapas. Critérios e prazos legais de
notificação precisam de parecer jurídico. O pós-incidente deve registrar causa,
impacto, controles e responsável sem incluir dados financeiros.
