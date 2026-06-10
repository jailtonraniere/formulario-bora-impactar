# Segurança da Informação e LGPD — Bora Impactar

Este documento descreve as diretrizes, mecanismos de segurança e conformidade com a Lei Geral de Proteção de Dados Pessoais (LGPD - Lei nº 13.709/2018) adotados no **Formulário Inteligente de Atualização Cadastral**.

---

## 1. Princípio da Minimização de Dados na Busca Pública

Para evitar a exposição desnecessária de dados institucionais ou pessoais de representantes das organizações sociais na internet, a funcionalidade de pesquisa pública adota regras estritas de visibilidade:

-   **Campos Expostos Publicamente na Busca:** Apenas `organizacao_id`, `nome_oficial` (nome oficial), `nome_conhecido` (nome fantasia), `bairro` de atuação e `situacao_formalizacao` (com ou sem CNPJ).
-   **Campos Protegidos Ocultados:** E-mails, números de telefone, endereços residenciais de representantes, faixas de orçamento financeiro anual, detalhes de vulnerabilidades de público ou de ESG **não são disponibilizados** em endpoints públicos. O frontend nunca recebe essas informações antes da validação do token.

---

## 2. Mecanismo de Acesso Seguro por Token Temporário

Em vez de expor dados confidenciais diretamente na tela ou depender de cadastros de senhas complexas que geram esquecimentos frequentes, o acesso seguro opera por convites individuais por e-mail:

1.  **Geração do Token:** Quando o usuário seleciona sua organização e solicita acesso, o backend do Google Apps Script gera um token seguro criptograficamente forte composto por 32 caracteres alfanuméricos aleatórios (ex: `tok_aB1c2D3e4...`).
2.  **Identificação de Destino Fidedigno:** O Apps Script busca o e-mail cadastrado internamente na base. O token **nunca** é enviado para um e-mail digitado no momento pelo usuário na busca pública; ele vai exclusivamente para o canal oficial já auditado na base oficial (aba `CONTATOS`).
3.  **Mascaramento de Confirmação:** O frontend exibe apenas o e-mail mascarado (ex: `co******@esperancarecife.org.br`) para confirmar o envio sem revelar o endereço completo a estranhos na busca pública.

---

## 3. Desvinculação Completa do Painel Administrativo

Para garantir que credenciais fictícias de homologação (ex: logins do painel de triagem original) ou acessos de equipe de gestão não fiquem expostos no pacote JavaScript cliente público:

-   O componente `AdminPanel.tsx` e o botão de acesso "Painel Admin" no cabeçalho foram **completamente removidos** dos arquivos de código ativo de build de produção do frontend (`src/App.tsx`).
-   Qualquer triagem, aprovação e monitoramento técnico de dados deve ocorrer diretamente na planilha oficial de maneira segura por colaboradores autorizados pela Prefeitura do Recife, ou em ambiente separado intranet.

---

## 4. Gestão de Consentimento e Direitos (LGPD)

O formulário implementa caixas de seleção obrigatórias na Etapa 9 (Revisão e Consentimento) para documentar a conformidade com as bases legais da LGPD:

-   **Consentimento de Tratamento:** Autorização expressa para o tratamento de dados institucionais declarados no catálogo público do portal Bora Impactar.
-   **Consentimento de Contatos:** Classificação de permissões no Passo 2, onde a organização define o canal de contato como `"Apenas equipe"`, `"Empresas parceiras"` ou `"Catálogo público"`.
-   **Autorização de Imagem:** Confirmação de posse de direitos de uso de imagem sobre fotografias ou logomarcas institucionais inseridas no formulário.

---

## 5. Trilha de Auditoria e Logs

Todas as operações de alteração ou acesso a dados sensíveis são registradas na aba `AUDITORIA` da planilha:
-   **Ações Monitoradas:** Solicitação de token seguro (`SOLICITAR_ACESSO`), validação e carregamento de dados (`VALIDAR_ACESSO`), gravação de rascunhos temporários (`saveDraft`) e envios definitivos (`SUBMETER_FORMULARIO`).
-   **Dados do Log:** Código identificador único do evento, data/hora da ocorrência, ação realizada, ID da organização e descrição do resultado (ex: número do protocolo gerado).
