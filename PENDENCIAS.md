# Pendências e Próximos Passos para Lançamento — Bora Impactar

Este documento descreve os ajustes operacionais e configurações finais de ambiente que a equipe técnica da Prefeitura do Recife deve realizar para colocar a aplicação em produção definitiva.

---

## 1. Configurações Finais no Google Apps Script

No arquivo `apps-script/Code.gs` publicado no Apps Script:

-   [ ] **Atualizar o domínio do cliente (`CONFIG.APP_URL`):**
    Substitua o valor provisório pelo endereço oficial da URL de produção onde o formulário React está hospedado:
    ```javascript
    // Código atual (Code.gs linha 10):
    var CONFIG = {
      APP_URL: "https://recife-bora-impactar.web.app", // Substituir pela URL oficial da PCR
      DEFAULT_EMAIL_SENDER: "Bora Impactar <contato.boraimpactar@recife.pe.gov.br>"
    };
    ```
-   [ ] **Autorização de Envio de E-mails:**
    Certifique-se de que a conta Google que está executando o Apps Script possui cota e permissões de disparo de e-mails para endereços externos através do serviço `MailApp`.

---

## 2. Configurações de Deploy no Frontend

-   [ ] **Cadastrar a URL do Web App no Frontend (`.env`):**
    Coloque a URL de produção final do Apps Script Web App (terminada em `/exec`) no arquivo `.env` de produção antes de executar o build final:
    ```env
    VITE_API_BASE_URL="https://script.google.com/macros/s/SUA_URL_FINAL_AQUI/exec"
    ```
-   [ ] **Configurar cabeçalhos de segurança (CORS):**
    Caso a hospedagem do frontend no Firebase Hosting exija restrições estritas de cabeçalhos de segurança, certifique-se de que as requisições para o domínio `script.google.com` estejam liberadas nas diretivas de segurança da rede.

---

## 3. Fluxo de Operação e Homologação na Planilha

-   [ ] **Configurar a conta de e-mail de suporte:**
    Garantir que todas as organizações cadastradas na aba `CONTATOS` possuam e-mails válidos e ativos. Caso alguma organização tente solicitar acesso e não possua e-mail configurado na planilha principal, a API retornará o erro de negócio `"NO_EMAIL_CONFIGURED"`.
-   [ ] **Homologação e Atualização manual de Planilhas:**
    Treinar a equipe de triagem do Bora Impactar para ler os envios consolidados em JSON na aba `ATUALIZACOES`, validar se os dados estão coerentes e aprovar o cadastro. O script Apps Script não subscreve a aba principal automaticamente, garantindo que um administrador sempre valide a consistência antes de atualizar.
