# Auditoria Inicial — Formulário Inteligente de Atualização Cadastral

Este documento apresenta a análise técnica do estado inicial da aplicação do Formulário Inteligente de Atualização Cadastral do Bora Impactar.

---

## 1. Tecnologias Identificadas

A aplicação frontend é baseada em uma infraestrutura moderna de desenvolvimento web:

*   **Framework Principal:** React v19.0.1 (com React DOM v19.0.1)
*   **Gerenciador de Tipos:** TypeScript ~v5.8.2
*   **Ferramenta de Build e Servidor de Desenvolvimento:** Vite v6.2.3 (e v6.4.3 no ambiente local)
*   **Estilização:** Tailwind CSS v4.1.14 (integrado com o plugin `@tailwindcss/vite` v4.1.14 e Autoprefixer v10.4.21)
*   **Biblioteca de Ícones:** Lucide React v0.546.0
*   **Animações:** Motion v12.23.24
*   **Integração com IA (Original):** `@google/genai` v2.4.0 (usando SDK para Gemini AI)
*   **Servidor Auxiliar / Template:** Express v4.21.2 (com `@types/express` v4.17.21) e Dotenv v17.2.3
*   **Ferramenta de Scripting Local:** TSX v4.21.0, Esbuild v0.25.0

---

## 2. Estrutura de Pastas

A estrutura atual do repositório é organizada da seguinte forma:

```text
Formulario do Bora Impactar/
├── .env.example              # Exemplo de variáveis de ambiente
├── .gitignore                # Arquivos ignorados pelo Git
├── Bora_Impactar_Base_Oficial_PRONTA.xlsx # Base de dados Excel oficial
├── README.md                 # Documento de orientação de execução
├── index.html                # Ponto de entrada do navegador
├── metadata.json             # Metadados de exportação do AI Studio
├── package.json              # Configurações do npm, dependências e scripts
├── package-lock.json         # Travamento de versões das dependências
├── tsconfig.json             # Configurações do compilador TypeScript
├── vite.config.ts            # Configuração do bundler Vite
├── assets/                   # Recursos estáticos gerais
└── src/                      # Código-fonte da aplicação
    ├── App.tsx               # Componente central (Wizard, estados, controle de views)
    ├── index.css             # Estilos globais (Tailwind e variáveis)
    ├── main.tsx              # Ponto de entrada do React
    ├── types.ts              # Definições de tipos TypeScript para toda a aplicação
    ├── components/           # Componentes React reutilizáveis
    │   ├── AdminPanel.tsx    # Painel administrativo (mockado)
    │   ├── FormFields.tsx    # Campos customizados (Input, Select, Máscaras, etc.)
    │   ├── Logo.tsx          # Componentes para logos oficiais (Recife e Bora Impactar)
    │   ├── OdsEsgGov.tsx     # Seleção de ODS, ESG e Governabilidade (Etapa 6)
    │   ├── ReviewTab.tsx     # Aba de revisão final (Antes vs Agora)
    │   └── SearchSection.tsx # Tela de boas-vindas com pesquisa de organizações
    ├── data/
    │   └── mockData.ts       # Dados mockados e constantes de RPA/Bairros/ODS
    └── services/
        └── storage.ts        # Serviço de armazenamento local (localStorage)
```

---

## 3. Arquivos Principais

*   [`src/App.tsx`](file:///c:/Users/User/Desktop/Jailton/Antigravity/Formulario%20do%20Bora%20Impactar/src/App.tsx): Concentra toda a orquestração de telas (`home`, `search`, `diagnostic`, `form`, `success`, `admin`), controle de estado do formulário (`formData`), cálculo de progresso das 8 etapas obrigatórias e ações do ciclo de vida do rascunho.
*   [`src/types.ts`](file:///c:/Users/User/Desktop/Jailton/Antigravity/Formulario%20do%20Bora%20Impactar/src/types.ts): Define a interface do formulário (`OrganizationData`), dados de voluntariado (`VolunteerData`), oportunidades de parceria (`Opportunity`), conquistas (`ImpactResult`) e os status possíveis (`FormStatus`).
*   [`src/components/AdminPanel.tsx`](file:///c:/Users/User/Desktop/Jailton/Antigravity/Formulario%20do%20Bora%20Impactar/src/components/AdminPanel.tsx): Implementa uma tela de auditoria administrativa mockada com login fictício (`diretoria.impacto` / `recife123`), gráficos, listagens de triagem e ferramentas de exportação CSV.
*   [`src/components/SearchSection.tsx`](file:///c:/Users/User/Desktop/Jailton/Antigravity/Formulario%20do%20Bora%20Impactar/src/components/SearchSection.tsx): Controla a busca de organizações a partir de dados locais.
*   [`src/services/storage.ts`](file:///c:/Users/User/Desktop/Jailton/Antigravity/Formulario%20do%20Bora%20Impactar/src/services/storage.ts): Abstração que atualmente simula o banco de dados escrevendo no `localStorage` do navegador.

---

## 4. Comandos de Execução

No ambiente local, os seguintes scripts estão configurados no `package.json`:

*   **Instalação de Dependências:** `npm install`
*   **Execução do Servidor de Desenvolvimento:** `npm run dev` (Inicia na porta 3000)
*   **Compilação de Produção:** `npm run build` (Gera arquivos otimizados na pasta `dist/`)
*   **Visualização de Build de Produção:** `npm run preview`
*   **Limpeza de Diretórios de Saída:** `npm run clean`
*   **Verificação TypeScript (Lint):** `npm run lint` (`tsc --noEmit`)

---

## 5. Problemas Encontrados

Após uma análise aprofundada do código-fonte e dos arquivos, foram mapeados os seguintes problemas e inconformidades:

1.  **Exposição de Painel Administrativo:** Existe um botão de "Painel Admin" acessível no cabeçalho público e a rota carrega o componente `AdminPanel.tsx` diretamente no navegador do usuário.
2.  **Credenciais de Acesso no Código (Hardcoded):** O painel administrativo possui autenticação fictícia baseada em valores fixos (`adminUsername === 'diretoria.impacto'` e `adminPassword === 'recife123'`) expostos no código client-side.
3.  **Persistência de Rascunhos Insegura:** O rascunho é persistido exclusivamente no `localStorage` do navegador (`bora_impactar_current_draft`). Não há salvamento centralizado em banco de dados quando há conectividade.
4.  **Inexistência de Backend Real:** A escrita de dados após o envio simula a gravação apenas atualizando a lista mockada no `localStorage` (`bora_impactar_organizations`). Não há integração ativa com o Google Sheets ou Google Apps Script.
5.  **Falha na Validação de Acesso (Exposição de Dados):** Qualquer usuário consegue buscar uma organização pelo nome na tela inicial e, ao selecioná-la, carregar todos os dados históricos sem passar por uma validação de acesso segura (como token via e-mail ou link seguro).
6.  **Inconsistência de Endereços Históricos:** A planilha `Bora_Impactar_Base_Oficial_PRONTA.xlsx` possui dados com CEPs e bairros ausentes, além de descrições e contatos misturados na coluna `logradouro` (ex: chave PIX inserida no endereço).
7.  **Campos Booleanos Incompatíveis:** Algumas perguntas binárias (Sim/Não) no código frontend iniciam implicitamente como falsas (valores default), em vez de possuírem três estados distintos (`não respondido`, `sim`, `não`), violando o escopo funcional.
8.  **Valores Mockados de IA:** O botão de "Ajudar a melhorar este texto" utiliza timeouts simulados com textos fixos pré-definidos no código, em vez de uma chamada segura à API ou sinalização correta de desativação ("Disponível em breve").
9.  **Limitações de Acessibilidade:** Faltam validações acessíveis ao teclado em modais e foco claro ao navegar pelas etapas do formulário.

---

## 6. Riscos Associados

*   **Risco de Vazamento de Dados (LGPD):** Se a busca pública expuser CNPJ completo, e-mails, telefones ou dados de orçamento sem autenticação, haverá violação da LGPD.
*   **Risco de Sobrescrita de Dados:** A gravação direta de novas informações sobre a base histórica original causaria perda irreparável de registros governamentais.
*   **Risco de Fraude Cadastral:** Sem tokens longos e seguros, agentes mal-intencionados podem preencher formulários fingindo representar instituições existentes do município do Recife.

---

## 7. Plano de Correção e Evolução

A execução das correções seguirá os seguintes passos prioritários:

1.  **Proteção e Ocultação Administrativa:** Remover a exibição do botão e a rota do painel administrativo no frontend de produção.
2.  **Criação do Mapeador de Dados:** Implementar `src/config/fieldMapping.ts` para converter chaves JavaScript em colunas/abas reais com regras de classificação LGPD.
3.  **Criação do Backend Google Apps Script:** Desenvolver a infraestrutura em `apps-script/` para rodar de forma server-side com Google Sheets, expondo endpoints seguros sob o formato de resposta padrão.
4.  **Implementação do Link Seguro por Token:** Desenvolver fluxo onde a organização pesquisa seu nome público e solicita acesso. O backend busca o e-mail registrado, gera um token seguro e associa a um rascunho de preenchimento, liberando o formulário apenas após a verificação do token na URL.
5.  **Ajuste dos Estados dos Campos Sim/Não:** Adequar as variáveis binárias no formulário React para operarem com três estados (`""` / `"sim"` / `"nao"`).
6.  **Validações e Tratamento de Erros:** Adicionar validações robustas ao final de cada etapa (CNPJ, e-mail, telefone, CEP com consulta ViaCEP funcionando) com redirecionamento de foco para acessibilidade.
7.  **Desativação Temporária do Auxílio de IA:** Substituir a simulação de melhoria de texto por "Disponível em breve" até que a integração com chave de API segura do Apps Script esteja ativada sem expor credenciais no cliente.

---

## 8. Estratégia de Implantação

*   **Frontend React:** Gerar o build estático (`dist/`) e implantar em plataforma segura como Firebase Hosting (ou compatível), garantindo o roteamento SPA e variáveis de ambiente no build (`.env`).
*   **Backend Google Apps Script:** Publicado como aplicação web (`Web App`) rodando sob a permissão da conta proprietária da planilha. A comunicação com o frontend será feita via chamadas HTTP POST/GET seguras (utilizando cabeçalhos CORS corretos).
*   **Banco de Dados:** Conexão direta com a planilha oficial Google Sheets convertida a partir do arquivo `Bora_Impactar_Base_Oficial_PRONTA.xlsx`.
