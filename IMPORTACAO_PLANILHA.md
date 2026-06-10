# Relatório de Importação de Planilha

- **Arquivo Utilizado:** `Bora_Impactar_Base_Oficial_PRONTA.xlsx`
- **Data da Importação:** 10/06/2026 15:09:15
- **Abas Encontradas:** `LEIA-ME`, `CONFIGURACOES`, `ORGANIZACOES`, `CONTATOS`, `TERRITORIOS`, `IMPACTO`, `ODS_GOVERNANCA`, `RECURSOS`, `OPORTUNIDADES`, `DOCUMENTOS`, `ATUALIZACOES`, `CONTROLE_MIGRACAO`, `RASCUNHOS`, `AUDITORIA`, `DICIONARIO_CAMPOS`, `LISTAS`, `BASE_HISTORICA`, `BASE_TRATADA`

## Estatísticas de Registros Importados
- **Quantidade de Organizações:** 118
- **Quantidade de Projetos sem CNPJ:** 47
- **Quantidade de Contatos:** 118
- **Quantidade de Territórios:** 99
- **Quantidade de Registros de Impacto:** 118
- **Quantidade de Registros de ODS:** 515
- **Quantidade de Oportunidades:** 0
- **Quantidade de Documentos:** 0

## Duplicidades Encontradas
*Nenhuma duplicidade de ID de organização encontrada (Chaves BI-XXXX íntegras).*

## Linhas Ignoradas
*Nenhuma linha de organização ignorada.*

## Alertas e Inconsistências
*Nenhum alerta de validação detectado.*

## Arquivos Gerados
- [`organizations-search.public.json`](file:///src/data/organizations-search.public.json)
- [`organizations-private.generated.json`](file:///src/data/organizations-private.generated.json)

## Comando de Execução
Para executar a importação novamente e atualizar as bases de dados e este relatório, utilize o comando:
```bash
npm run import:data
```
