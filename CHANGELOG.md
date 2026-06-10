# Histórico de Alterações (Changelog) — Bora Impactar

Este documento consolida todas as modificações técnicas realizadas no projeto para a estruturação, segurança e conexão do **Formulário Inteligente de Atualização Cadastral**.

---

## [1.0.0] - 2026-06-10

### Segurança e LGPD
-   **Desvinculação do Painel Admin:** Remoção completa de importações, renderização e botões do componente `AdminPanel.tsx` do frontend de produção (`src/App.tsx`) para evitar vazamento de credenciais e rotas administrativas no lado do cliente.
-   **Desativação do Rascunho de IA Simulado:** O assistente de reformulação de texto por IA simulada foi substituído por um botão desabilitado contendo `"IA: Disponível em breve"` nos campos de área de texto para prevenir o uso de chaves inseguras ou retornos arbitrários client-side.
-   **Omissão de Dados na Busca Pública:** O fluxo de pesquisa de organizações agora exibe exclusivamente o ID, nome oficial, nome conhecido, bairro e situação de formalização. Todos os contatos e dados sensíveis ficam estritamente ocultados.

### Integração e Conexão de Rede
-   **Validação por Token Seguro:** Implementação de suporte a parâmetros de URL `?token=...` na inicialização do app. O formulário carrega e pré-preenche automaticamente as respostas lidas da API de rascunhos segura.
-   **Centralizador de Mapeamento de Campos:** Criação de `src/config/fieldMapping.ts` para mapear os campos da interface do formulário React diretamente para as colunas físicas correspondentes nas abas oficiais do Google Planilhas.
-   **Serviço de API e Simulação local:** Desenvolvimento do cliente `src/services/api.ts` para realizar chamadas HTTPS ao Google Apps Script. O cliente entra automaticamente em modo de simulação local baseado em localStorage caso nenhuma variável de ambiente seja fornecida.
-   **Salvamento Debouncado:** A rotina de auto-salvamento do rascunho de preenchimento no backend do Apps Script foi otimizada com um temporizador de debounce de 2 segundos para evitar gargalos de rede por digitação constante.
-   **Três Estados em Respostas Binárias:** Atualização do componente `YesNoField` e do modelo de dados do formulário para suportar três estados (`"sim"`, `"nao"` ou `""` não selecionado), evitando marcações automáticas indevidas de "Não".

### Testes e Qualidade de Código
-   **Configuração de Suíte de Testes:** Integração da biblioteca de testes unitários **Vitest** no projeto, com configuração de novos scripts de execução no `package.json`.
-   **Testes Automatizados:** Criação de `src/App.test.tsx` com testes de formatação de máscaras (CNPJ, CEP, Telefone), integridade do mapeamento de colunas e validações do progresso de etapas do formulário.

### Documentação Técnica
-   Criação de `ARQUITETURA.md` com explicações arquiteturais e fluxogramas em Mermaid.
-   Criação de `CONFIGURACAO_IMPLANTACAO.md` detalhando segredos e deploy.
-   Criação de `GUIA_APPS_SCRIPT.md` descrevendo os endpoints de API.
-   Criação de `GUIA_PLANILHA.md` mapeando a base de dados de planilhas.
-   Criação de `TESTES_REALIZADOS.md` com o sumário de cobertura de testes.
-   Criação de `SEGURANCA_E_LGPD.md` com as regras de proteção de dados.
-   Criação de `PENDENCIAS.md` com os checklists operacionais pré-lançamento.
