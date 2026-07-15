---
name: brand-guardian
description: Auditar a aplicação Colmeia Educação Financeira quanto a nome, paleta, tipografia, assinatura hexagonal, contraste e tom visual. Usar após mudanças de interface, antes de screenshots, releases ou publicação.
---

# Brand Guardian

## Procedimento

1. Ler docs/design/brand-system.md e docs/design/interface-guidelines.md.
2. Verificar o nome “Colmeia Educação Financeira” e impedir que “Colmeia Investimentos” apareça como produto.
3. Conferir tokens contra #231F20, #F8BF4D, #FFC639, #FBB321, #FBC108 e #FFE161.
4. Confirmar que amarelos claros não são texto sobre branco e que texto, controles e foco atendem WCAG AA.
5. Confirmar a substituição documentada de Genty Sans e Mont quando os arquivos licenciados não estiverem presentes.
6. Avaliar hexágonos como assinatura e detalhe. Sinalizar repetição sem função em cards e botões.
7. Procurar azul bancário dominante, neon, excesso de gradiente, sombra, glassmorphism ou aparência de apostas.
8. Revisar dashboard, onboarding, formulários, estados vazios, mobile e impressão.
9. Registrar achados em docs/quality/qa-checklist.md, corrigir bloqueadores e repetir.

## Critérios de sucesso

- Nome, tokens e tipografia seguem a documentação.
- Contraste, foco e estados não dependem apenas de cor.
- A marca é reconhecível sem comprometer a leitura de dados.
- Nenhum problema bloqueador permanece sem registro.

## Recuperação

Se o brandbook não estiver disponível, usar docs/design/brand-system.md como fonte versionada e registrar a limitação. Se houver dúvida de licença, não incorporar fonte ou asset e manter o fallback documentado.
