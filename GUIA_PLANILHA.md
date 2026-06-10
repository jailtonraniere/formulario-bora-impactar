# Guia de Estrutura do Google Planilhas — Bora Impactar

Este guia detalha o formato, os cabeçalhos e a estrutura interna das tabelas do banco de dados relacional oficial contido na planilha do **Bora Impactar**.

---

## 1. Regra de Estruturação das Abas (Layout de Linhas)

Diferente de planilhas comuns que iniciam os cabeçalhos na Linha 1, a base oficial do Bora Impactar adota uma estrutura de metadados integrada:

*   **Linhas 1 a 3:** Metadados (Nome da aba, finalidade do documento e instruções gerais para a equipe de triagem).
*   **Linha 4 (Índice 3 no Apps Script):** Contém os **Cabeçalhos Físicos** oficiais em minúsculas e sem acentuação (ex: `organizacao_id`, `situacao_formalizacao`).
*   **Linha 5 em diante (Índice 4+ no Apps Script):** Registros de dados das organizações e históricos.

*Aviso: Qualquer leitura ou escrita programática na planilha deve pular as primeiras 4 linhas e buscar a linha de cabeçalhos na Linha 4 para evitar corromper a base.*

---

## 2. Dicionário de Abas e Colunas Físicas

### Aba: `ORGANIZACOES`
Contém as informações de identificação institucional da organização social.
-   `organizacao_id` (Chave Primária): Identificador único da organização (ex: `org_esperanca_recife` ou `BI-TEMP-XXXX`).
-   `nome_oficial`: Nome formal ou razão social registrado.
-   `nome_conhecido`: Nome de marca ou de atuação conhecido pela comunidade.
-   `situacao_formalizacao`: Estado jurídico (`with_cnpj`, `no_cnpj`, `linked`, `formalizing`).
-   `cnpj`: Número do CNPJ (obrigatório para `with_cnpj`).
-   `ano_fundacao`: Ano de início das atividades.
-   `natureza_juridica`: Tipo legal da entidade (ex: Associação, Cooperativa, Coletivo).
-   `historia`: Histórico resumido da iniciativa.
-   `missao`: Missão institucional declarada.
-   `status_cadastro`: Situação cadastral (`Rascunho`, `Enviado`, `Aprovado`, `Arquivado`).

### Aba: `CONTATOS`
Registros de representantes, canais de contato e permissões de privacidade.
-   `organizacao_id` (Chave Estrangeira).
-   `legal_rep_nome`: Nome do responsável legal pela instituição.
-   `legal_rep_funcao`: Cargo ou função do representante.
-   `filler_nome`: Nome da pessoa que realizou o preenchimento do formulário.
-   `telefone`: Telefone comercial de contato.
-   `whatsapp`: Número de WhatsApp rápido.
-   `email`: E-mail oficial cadastrado (utilizado para disparo de tokens).
-   `site` / `instagram` / `facebook` / `linkedin`: Redes sociais institucionais.
-   `uso_interno` / `compartilhar_empresas` / `publicar_catalogo`: Níveis de privacidade concedidos no Passo 2 do formulário (`internal`, `partners`, `public`).

### Aba: `TERRITORIOS`
Informações de endereço físico e áreas de atuação local na cidade do Recife.
-   `organizacao_id` (Chave Estrangeira).
-   `cep`: CEP oficial da sede.
-   `logradouro` / `numero` / `complemento`: Endereço de correspondência.
-   `bairro`: Bairro da sede principal.
-   `rpa`: Região Político-Administrativa (calculada automaticamente de RPA 1 a RPA 6 pelo CEP/Bairro).
-   `bairro_abrangencia`: Lista de bairros do Recife onde a organização desenvolve projetos.

### Aba: `IMPACTO`
Métricas de beneficiários e resultados sociais quantitativos.
-   `organizacao_id` (Chave Estrangeira).
-   `pessoas_atendidas`: Pessoas únicas atendidas nos últimos 12 meses.
-   `atendimentos_realizados`: Total de atividades ou participações acumuladas.
-   `numero_exato_ou_estimado`: Se as métricas são exatas ou estimativas (`exact` ou `estimate`).
-   `resultado_descricao`: Resumo narrativo das conquistas e impacto social.
-   `situacao_indicadores`: Maturidade de medição (`has_indicators`, `building`, `no_indicators`, `needs_support`).

### Aba: `ATUALIZACOES` (Fila de Triagem)
Fila de aprovação contendo todos os cadastros e revisões submetidas pelos parceiros.
-   `atualizacao_id` (Chave Primária): Identificador único da solicitação.
-   `organizacao_id`: ID temporário (BI-TEMP-...) ou o ID permanente da organização atualizada.
-   `protocolo`: Número de protocolo gerado no envio (ex: `BI-2026-XXXXXX`).
-   `tipo_solicitacao`: Tipo da requisição (`Novo Cadastro` ou `Atualização`).
-   `status`: Situação da triagem (`Enviado`, `Em análise`, `Aprovado`, `Rejeitado`).
-   `data_envio`: Data e hora da submissão.
-   `email_responsavel`: E-mail de quem enviou.
-   `dados_json`: **JSON completo contendo todas as respostas do formulário estruturadas.** A equipe Bora Impactar revisa o JSON antes de atualizar as abas principais.

### Aba: `AUDITORIA`
Logs automáticos de integridade e uso do sistema.
-   `registro_id` (Chave Primária).
-   `data_hora`: Momento exato da ação.
-   `acao`: Tipo de evento (`SOLICITAR_ACESSO`, `VALIDAR_ACESSO`, `SUBMETER_FORMULARIO`, etc.).
-   `organizacao_id`: Organização associada ao evento.
-   `resultado`: Detalhe textual do evento para controle.
