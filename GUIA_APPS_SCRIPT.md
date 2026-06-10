# Guia de Referência do Google Apps Script — Bora Impactar

Este guia detalha o funcionamento e os endpoints implementados no backend baseado em **Google Apps Script Web App** (`apps-script/Code.gs`).

---

## 1. Funcionamento dos Endpoints (POST / GET)

O script publicado responde a requisições JSON via protocolo HTTPS. Ele aceita requisições do tipo `POST` com um parâmetro `action` no corpo da mensagem que direciona a operação desejada:

### `healthCheck`
Verifica a conectividade básica com a API e retorna o estado de execução.
-   **Entrada:** `{ "action": "healthCheck" }`
-   **Retorno:** `{ "success": true, "data": { "status": "OK" }, "error": null }`

### `getLists`
Obtém as opções pré-configuradas para o preenchimento de campos do formulário (ex: Bairros do Recife, causas de atuação, etc.).
-   **Entrada:** `{ "action": "getLists" }`
-   **Retorno:** Listas suspensas lidas dinamicamente da aba `LISTAS` da planilha.

### `searchOrganizations`
Busca organizações sociais previamente cadastradas com base em parte do nome oficial ou cohecido. Retorna apenas dados públicos fundamentais (sem e-mails ou contatos) para preservar a privacidade dos dados (LGPD).
-   **Entrada:** `{ "action": "searchOrganizations", "query": "esperança" }`
-   **Retorno:** Lista de organizações encontradas (máximo 30).

### `requestAccess`
Gera um token de acesso seguro temporário e inicia o envio por e-mail para o responsável pela organização.
-   **Entrada:** `{ "action": "requestAccess", "organizacao_id": "org_esperanca_recife" }`
-   **Lógica Interna:** Busca o e-mail na aba `CONTATOS`, cria uma entrada na aba `RASCUNHOS` com o token e dispara um e-mail contendo o link exclusivo via `MailApp.sendEmail`.
-   **Retorno:** E-mail mascarado (ex: `co*****@esperancarecife.org.br`) e o token (em ambiente de testes/logs).

### `getDraft`
Recupera o estado do rascunho de preenchimento a partir do token de acesso seguro fornecido na URL.
-   **Entrada:** `{ "action": "getDraft", "token": "tok_abcdef123..." }`
-   **Retorno:** Dados completos pré-preenchidos e, se existente, os dados oficiais originais para exibição de alterações (Antes vs Agora).

### `saveDraft`
Salva o progresso parcial do formulário à medida que o usuário preenche as etapas.
-   **Entrada:** `{ "action": "saveDraft", "token": "tok_...", "step": 3, "percentage": 35, "data": { ... } }`
-   **Retorno:** Confirmação de salvamento.

### `submitExistingOrganizationUpdate`
Submete a atualização cadastral final de uma organização existente. Limpa o rascunho temporário e envia os novos dados para a fila de triagem.
-   **Entrada:** `{ "action": "submitExistingOrganizationUpdate", "token": "tok_...", "data": { ... } }`
-   **Lógica Interna:** Grava as alterações completas na aba `ATUALIZACOES` (coluna `dados_json` e colunas de controle), remove a linha correspondente da aba `RASCUNHOS` e insere log em `AUDITORIA`.
-   **Retorno:** Número de protocolo gerado (ex: `BI-2026-123456`).

### `submitNewOrganization`
Submete uma solicitação de novo cadastro para iniciativas que ainda não estão registradas.
-   **Entrada:** `{ "action": "submitNewOrganization", "data": { ... } }`
-   **Retorno:** Número de protocolo gerado para acompanhamento.

---

## 2. Instruções de Implantação Manual

Caso não utilize a ferramenta de linha de comando `clasp` da Google, a implantação manual é simples:

1.  Abra a planilha oficial no Google Planilhas.
2.  Vá no menu **Extensões** > **Apps Script**.
3.  Crie um arquivo chamado `Code.gs` e cole o código contido em [Code.gs](file:///c:/Users/User/Desktop/Jailton/Antigravity/Formulario%20do%20Bora%20Impactar/apps-script/Code.gs).
4.  Crie um arquivo de manifesto `appsscript.json` e insira o conteúdo de [appsscript.json](file:///c:/Users/User/Desktop/Jailton/Antigravity/Formulario%20do%20Bora%20Impactar/apps-script/appsscript.json).
5.  No painel esquerdo, clique em **Configurações do Projeto** (ícone de engrenagem) e configure as variáveis internas se desejar.
6.  Clique em **Salvar** (ícone de disquete).
7.  Clique em **Implantar** > **Nova implantação**, escolha **Aplicativo da Web**, configure para executar como **O Proprietário** e dar acesso a **Qualquer Pessoa**.
8.  Clique em **Implantar** e copie a URL de produção gerada para o seu arquivo `.env` do frontend.
