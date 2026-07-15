# Plano de execução — MVP

Atualizado em 15/07/2026.

## Estado

- [x] Inspecionar as seis páginas do brandbook.
- [x] Inicializar stack e servidor de desenvolvimento.
- [x] Criar mapa AGENTS.md e documentação inicial.
- [x] Definir domínio, centavos inteiros e adapter IndexedDB.
- [x] Implementar onboarding, navegação, dashboard e formulários.
- [x] Implementar contas, cartões, transações, orçamentos e metas.
- [x] Implementar relatórios, backup, CSV e configurações.
- [x] Adicionar PWA e build estático para GitHub Pages.
- [x] Criar testes unitários, de componentes e e2e.
- [x] Executar typecheck, lint, formatação, testes e builds.
- [x] Executar Brand Guardian e QA em desktop/mobile.
- [x] Corrigir achados e gerar screenshots.
- [x] Publicar uma versão privada no Sites.
- [ ] Publicar no GitHub e GitHub Pages.
- [ ] Validar URLs e mover este plano para completed.

## Decisões

Arquitetura local-first; recorrência não materializada; gráficos CSS com tabela;
fontes proprietárias substituídas; navegação de uma rota para Pages.

## Riscos

O GitHub CLI não está instalado e a conexão disponível não cria repositórios; a
criação e o push público estão bloqueados até instalar/autenticar `gh` ou criar o
repositório manualmente. O build Sites e o export estático foram validados
separadamente. O navegador local foi bloqueado pela política de URL; a QA manual
foi concluída na publicação HTTPS.

## Achados corrigidos

- A conta inicial agora substitui a conta principal da demonstração, sem duplicar.
- O service worker usa rede primeiro e cache como fallback para receber releases.
- A barra mobile mostra cinco destinos e mantém Relatórios/Configurações no menu.
