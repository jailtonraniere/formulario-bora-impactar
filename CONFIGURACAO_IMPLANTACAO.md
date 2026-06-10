# Guia de Configuração e Implantação — Bora Impactar

Este guia fornece orientações passo a passo para configurar as variáveis de ambiente, preparar o Google Planilhas, implantar o Google Apps Script e realizar a publicação do frontend da aplicação.

---

## 1. Variáveis de Ambiente do Frontend

Para conectar o formulário React ao serviço do Google Apps Script em produção, configure o arquivo `.env` na raiz do projeto:

1.  Crie um arquivo `.env` na raiz do projeto (copie o modelo de `.env.example`).
2.  Insira o endereço de publicação do seu Apps Script Web App na variável `VITE_API_BASE_URL`:

```env
# URL da API do Google Apps Script publicada como Web App
VITE_API_BASE_URL="https://script.google.com/macros/s/AKfycb.../exec"
```

*Nota: Durante o desenvolvimento local, se a variável `VITE_API_BASE_URL` estiver em branco, o frontend entrará automaticamente em **modo de simulação local de alta fidelidade**, salvando rascunhos e filas no localStorage do navegador para facilitar testes sem dependências de rede.*

---

## 2. Preparação do Google Planilhas

Para o correto funcionamento do script do Apps Script, a planilha de banco de dados oficial deve conter exatamente as seguintes abas (conforme a estrutura do Bora Impactar):

1.  **`ORGANIZACOES`:** Tabela principal das iniciativas.
2.  **`CONTATOS`:** Telefones, e-mails, representantes e permissões.
3.  **`TERRITORIOS`:** Endereço, bairro, RPA e abrangência territorial.
4.  **`IMPACTO`:** Indicadores quantitativos de beneficiários e métricas.
5.  **`ODS_GOVERNANCA`:** Mapeamento de ODS e políticas ESG de governança.
6.  **`RECURSOS`:** Orçamentos, dados bancários e patrocínios de empresas.
7.  **`RASCUNHOS`:** Controle de formulários em preenchimento temporário.
8.  **`ATUALIZACOES`:** Fila de triagem para novos cadastros e edições enviadas.
9.  **`DOCUMENTOS`:** Metadados e links do Google Drive para arquivos anexados.
10. **`AUDITORIA`:** Registro de logs e ações do sistema.
11. **`LISTAS`:** Opções de listas suspensas (bairros, causas, etc.).

*Importante: O Apps Script assume que a linha 4 de cada aba contém os cabeçalhos das colunas (em minúsculas, separados por sublinhado) e os dados reais iniciam na linha 5.*

---

## 3. Implantação e Publicação do Google Apps Script

Siga os passos abaixo para implantar a API no ambiente do Google Planilhas:

1.  Abra a planilha oficial do Bora Impactar no navegador.
2.  No menu superior, clique em **Extensões** > **Apps Script**.
3.  Exclua qualquer código inicial e copie o conteúdo completo do arquivo `apps-script/Code.gs` para o editor.
4.  Crie um arquivo chamado `appsscript.json` (ou configure no menu de configurações do projeto para exibir o manifesto) e insira as configurações de escopos descritas em `apps-script/appsscript.json`.
5.  Clique no ícone de engrenagem (**Configurações do Projeto**) e adicione a seguinte propriedade de script:
    -   `SPREADSHEET_ID`: *(Opcional)* ID da planilha caso queira forçar a conexão externa (se deixado em branco, o script usa a planilha ativa contida).
6.  Clique em **Implantar** (botão azul no topo direito) > **Nova implantação**.
7.  Selecione o tipo de implantação como **Web App** (Aplicativo da Web).
8.  Preencha as seguintes configurações de publicação:
    -   **Descrição:** API Smart Form Bora Impactar v1
    -   **Executar como:** O Proprietário (sua conta do Google Workspace / Prefeitura do Recife). *Isso garante que o script consiga ler e gravar na planilha mesmo sem dar acesso direto à base de dados para o usuário final.*
    -   **Quem tem acesso:** Qualquer pessoa (necessário para receber requisições do frontend público).
9.  Clique em **Implantar**. O Google solicitará autorização de acesso à sua conta. Conceda as permissões necessárias.
10. Copie a **URL do aplicativo da Web** gerada (terminada em `/exec`) e cole-a no arquivo `.env` do seu frontend.

---

## 4. Hospedagem do Frontend (Firebase Hosting)

O frontend é uma aplicação estática e pode ser implantado no Firebase Hosting seguindo estes comandos:

```bash
# 1. Instalar a CLI do Firebase globalmente (se já não estiver instalada)
npm install -g firebase-tools

# 2. Fazer login na conta do Firebase vinculada ao projeto
firebase login

# 3. Inicializar o Firebase no diretório do projeto (se for primeira vez)
firebase init hosting
# -> Selecione "Use an existing project" e aponte para o projeto correto.
# -> Defina o diretório público como "dist" (diretório de build do Vite).
# -> Responda "Yes" para configurar como Single Page App (rewrites para index.html).

# 4. Executar o build do Vite com a variável de ambiente correta configurada
npm run build

# 5. Publicar no Firebase Hosting
firebase deploy --only hosting
```

A aplicação estará disponível no endereço público fornecido pelo Firebase (ex: `https://seu-projeto.web.app`).
