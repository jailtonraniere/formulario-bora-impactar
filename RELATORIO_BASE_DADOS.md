# Relatório da Base de Dados — Bora Impactar

Este relatório descreve a análise estrutural e de qualidade de dados realizada na planilha `Bora_Impactar_Base_Oficial_PRONTA.xlsx`.

---

## 1. Resumo Quantitativo de Registros

A planilha contém 18 abas, com a seguinte contagem de linhas ativas (dados reais desconsiderando linhas vazias ou formatadas no final):

| Aba | Registros Ativos | Descrição / Função |
| :--- | :---: | :--- |
| `ORGANIZACOES` | 118 | Cadastro principal das organizações e projetos migrados. |
| `CONTATOS` | 118 | Contatos institucionais e permissões de privacidade. |
| `TERRITORIOS` | 101 | Endereços e Regiões Político-Administrativas (RPAs). |
| `IMPACTO` | 118 | Histórico de atendimento, metas e voluntários. |
| `ODS_GOVERNANCA` | 515 | Seleção histórica de ODS e itens de ESG/Governança. |
| `RECURSOS` | 74 | Faixas de orçamento, fontes de receita e chaves Pix. |
| `OPORTUNIDADES` | 0 | Aba de necessidades/oportunidades (será preenchida pelo formulário). |
| `DOCUMENTOS` | 0 | Links e metadados de arquivos salvos no Google Drive. |
| `ATUALIZACOES` | 118 | Log de controle de migração e status de formulários. |
| `CONTROLE_MIGRACAO` | 118 | Relação completa de controle e conciliação da base original. |
| `RASCUNHOS` | 0 | Fila de rascunhos temporários do formulário. |
| `AUDITORIA` | 0 | Trilha de auditoria das ações do sistema. |
| `DICIONARIO_CAMPOS` | 166 | Mapeamento lógico de campos do formulário para colunas. |
| `LISTAS` | 22 | Opções válidas e padronizadas para campos de múltipla escolha. |
| `BASE_HISTORICA` | 137 | Cópia fiel de segurança (Backup) dos dados brutos recebidos. |
| `BASE_TRATADA` | 137 | Cópia auxiliar de tratamento histórico. |

---

## 2. Análise de Duplicidades e Chaves

*   **Identificadores (`organizacao_id`):** Não foram encontrados IDs duplicados na aba `ORGANIZACOES`. Todos os 118 registros possuem identificador único válido no padrão `BI-XXXX` (ex: `BI-0001` a `BI-0118`).
*   **Nomes Oficiais:** Não foram encontradas duplicidades exatas de nomes oficiais na base tratada.
*   **CNPJs:** Todos os CNPJs declarados são únicos e válidos no formato básico de 14 dígitos (quando aplicável). Organizações sem CNPJ estão corretamente marcadas como `"Sem CNPJ"`.
*   **Órfãos:** Nenhuma aba relacionada (`CONTATOS`, `TERRITORIOS`, `IMPACTO`, `ODS_GOVERNANCA`, `RECURSOS`) possui registros vinculados a um `organizacao_id` inexistente na tabela `ORGANIZACOES`.

---

## 3. Inconsistências de Dados Identificadas

Durante a auditoria automática de células, as seguintes inconformidades foram localizadas:

### 3.1. Endereços Incompletos e Textos Misturados (`TERRITORIOS`)
A aba `TERRITORIOS` apresenta o maior volume de pendências e formatações inadequadas, que deverão ser regularizadas pelas organizações através do preenchimento do novo formulário:
*   **Falta de CEPs:** A imensa maioria dos registros originais não possui CEP cadastrado.
*   **Textos de Orientação no Logradouro:** Células da coluna `logradouro` contêm informações de ponto de referência e até chaves Pix.
    *   *Exemplo (Linha 5 - BI-0001):* `"Rua Vitoriano Palhares - 77 - Torre - Recife (Ao lado do Atacado dos Presentes)\n\nChave pix: 09.789.116/0001-26"`
*   **Endereços fora do Recife:** Algumas organizações indicam atuações regionais fora da capital.
    *   *Exemplo (Linha 7 - BI-0003):* `"Temos no Recife e em Camaragibe"`

### 3.2. Contatos Desatualizados (`CONTATOS`)
*   Vários registros possuem números de telefones fixos desativados ou contatos de e-mail pessoais (ex: @gmail.com) de antigos fundadores, dificultando a automação de envio de chaves de acesso.

---

## 4. Mapeamento Lógico de Campos Críticos

Para viabilizar a arquitetura segura e a conformidade com a LGPD, os seguintes campos foram classificados no centralizador de mapeamento:

| Campo do Formulário (React) | Coluna Física | Aba de Destino | Classificação (LGPD) | Exposto na Busca? |
| :--- | :--- | :--- | :--- | :---: |
| `id` | `organizacao_id` | `ORGANIZACOES` | Uso interno / Chave | **Sim** (Apenas ID) |
| `name` | `nome_oficial` | `ORGANIZACOES` | Público | **Sim** |
| `tradingName` | `nome_conhecido` | `ORGANIZACOES` | Público | **Sim** |
| `cnpj` | `cnpj` | `ORGANIZACOES` | Interno / Sensível | **Não** |
| `neighborhood` | `bairro` | `TERRITORIOS` | Público | **Sim** |
| `email` | `email` | `CONTATOS` | Dado Pessoal | **Não** |
| `phone` | `telefone` | `CONTATOS` | Dado Pessoal | **Não** |
| `whatsapp` | `whatsapp` | `CONTATOS` | Dado Pessoal | **Não** |
| `annualBudgetRange` | `faixa_orcamento_anual`| `RECURSOS` | Interno / Não publicar | **Não** |

---

## 5. Recomendações para Validação Humana

Recomenda-se que a equipe de triagem do Bora Impactar realize uma revisão manual nas seguintes linhas da planilha:
1.  **Linha 5 (BI-0001):** Extrair a chave Pix contida no logradouro e migrá-la para a coluna correspondente na aba `RECURSOS`, limpando o campo de endereço.
2.  **Linha 7 (BI-0003):** Confirmar a sede física no município do Recife, delimitando a atuação em Camaragibe apenas como campo descritivo secundário.
3.  **Organizações sem E-mail Cadastrado:** Entrar em contato via telefone para cadastrar um e-mail válido antes de enviar os links de atualização cadastral, visto que o e-mail é o único fator de envio de token do formulário.
