const fs = require('fs');
const path = require('path');
const xlsx = require('xlsx');

// Resolve absolute paths
const workspaceDir = path.resolve(__dirname, '..');
const excelPath = path.join(workspaceDir, 'Bora_Impactar_Base_Oficial_PRONTA.xlsx');
const publicJsonPath = path.join(workspaceDir, 'src', 'data', 'organizations-search.public.json');
const privateJsonPath = path.join(workspaceDir, 'src', 'data', 'organizations-private.generated.json');
const reportPath = path.join(workspaceDir, 'IMPORTACAO_PLANILHA.md');

console.log('Starting Excel import process...');
console.log('Source Excel file:', excelPath);

// Validation metrics
const report = {
  fileName: 'Bora_Impactar_Base_Oficial_PRONTA.xlsx',
  importDate: new Date().toLocaleDateString('pt-BR') + ' ' + new Date().toLocaleTimeString('pt-BR'),
  sheetsFound: [],
  orgsTotal: 0,
  projectsWithoutCnpj: 0,
  contactsTotal: 0,
  territoriesTotal: 0,
  impactsTotal: 0,
  odsTotal: 0,
  opportunitiesTotal: 0,
  documentsTotal: 0,
  duplicates: [],
  ignoredRows: [],
  errors: [],
  warnings: [],
  filesGenerated: []
};

// Simple validations
function validateEmail(email) {
  if (!email) return true;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).trim());
}

function validatePhone(phone) {
  if (!phone) return true;
  const clean = String(phone).replace(/\D/g, '');
  return clean.length >= 10 && clean.length <= 11;
}

function validateCNPJ(cnpjStr) {
  if (!cnpjStr || cnpjStr === 'Sem CNPJ') return true;
  const clean = String(cnpjStr).replace(/\D/g, '');
  return clean.length === 14 && /^\d{14}$/.test(clean);
}

try {
  if (!fs.existsSync(excelPath)) {
    throw new Error(`Excel file not found at: ${excelPath}`);
  }

  const workbook = xlsx.readFile(excelPath);
  report.sheetsFound = workbook.SheetNames;

  // Helper to parse sheets starting from Row 5 (0-indexed 3 is headers, data is 4+)
  function parseSheet(sheetName) {
    const sheet = workbook.Sheets[sheetName];
    if (!sheet) return [];
    const rawRows = xlsx.utils.sheet_to_json(sheet, { header: 1 });
    if (rawRows.length < 4) return [];
    
    const headers = rawRows[3];
    const dataRows = rawRows.slice(4);
    
    return dataRows.map((row, rIdx) => {
      const obj = {};
      headers.forEach((h, cIdx) => {
        if (h) {
          obj[h] = row[cIdx] !== undefined && row[cIdx] !== null ? row[cIdx] : '';
        }
      });
      obj.__lineNum = rIdx + 5; // Track 1-based Excel row number
      return obj;
    });
  }

  const rawOrgs = parseSheet('ORGANIZACOES');
  const rawContatos = parseSheet('CONTATOS');
  const rawTerritorios = parseSheet('TERRITORIOS');
  const rawImpactos = parseSheet('IMPACTO');
  const rawOdsGov = parseSheet('ODS_GOVERNANCA');
  const rawRecursos = parseSheet('RECURSOS');
  const rawOportunidades = parseSheet('OPORTUNIDADES');
  const rawDocumentos = parseSheet('DOCUMENTOS');

  // Filter organizations with valid IDs matching BI-XXXX
  const orgs = [];
  const orgIds = new Set();
  const orgNames = new Set();
  const orgCnpjs = new Set();

  rawOrgs.forEach(row => {
    const id = String(row.organizacao_id || '').trim();
    const name = String(row.nome_oficial || '').trim();
    const cnpj = String(row.cnpj || '').trim();

    if (!id) {
      if (name) {
        report.ignoredRows.push(`Linha ${row.__lineNum} em ORGANIZACOES ignorada: Nome oficial '${name}' está presente mas organizacao_id está em branco.`);
      }
      return;
    }

    if (!/^BI-\d{4}$/.test(id)) {
      report.warnings.push(`ID de organização inválido na linha ${row.__lineNum}: '${id}'. Não segue o padrão BI-XXXX.`);
    }

    // Check duplicate ID
    if (orgIds.has(id)) {
      report.duplicates.push(`ID Duplicado: '${id}' na linha ${row.__lineNum}.`);
      return; // Skip duplicate ID
    }
    orgIds.add(id);

    // Check duplicate Name
    if (name) {
      const lowerName = name.toLowerCase();
      if (orgNames.has(lowerName)) {
        report.warnings.push(`Nome oficial duplicado: '${name}' na linha ${row.__lineNum}.`);
      }
      orgNames.add(lowerName);
    }

    // Check duplicate CNPJ
    if (cnpj && cnpj !== 'Sem CNPJ') {
      const cleanCnpj = cnpj.replace(/\D/g, '');
      if (cleanCnpj) {
        if (orgCnpjs.has(cleanCnpj)) {
          report.warnings.push(`CNPJ duplicado: '${cnpj}' para '${name}' na linha ${row.__lineNum}.`);
        }
        orgCnpjs.add(cleanCnpj);

        if (!validateCNPJ(cnpj)) {
          report.warnings.push(`CNPJ com formato inválido: '${cnpj}' para '${name}' na linha ${row.__lineNum}.`);
        }
      }
    } else {
      report.projectsWithoutCnpj++;
    }

    orgs.push(row);
  });

  report.orgsTotal = orgs.length;

  // Build relational maps
  const contactsMap = {};
  rawContatos.forEach(c => {
    const orgId = String(c.organizacao_id || '').trim();
    if (!orgId) return;

    if (!orgIds.has(orgId)) {
      report.warnings.push(`Contato órfão na linha ${c.__lineNum}: organizacao_id '${orgId}' não corresponde a nenhuma organização cadastrada.`);
      return;
    }

    if (c.email && !validateEmail(c.email)) {
      report.warnings.push(`E-mail com formato inválido na linha ${c.__lineNum} (Org ${orgId}): '${c.email}'.`);
    }

    if (c.telefone && !validatePhone(c.telefone)) {
      report.warnings.push(`Telefone com formato inválido na linha ${c.__lineNum} (Org ${orgId}): '${c.telefone}'.`);
    }

    if (c.whatsapp && !validatePhone(c.whatsapp)) {
      report.warnings.push(`WhatsApp com formato inválido na linha ${c.__lineNum} (Org ${orgId}): '${c.whatsapp}'.`);
    }

    contactsMap[orgId] = c;
    report.contactsTotal++;
  });

  const territoriesMap = {};
  rawTerritorios.forEach(t => {
    const orgId = String(t.organizacao_id || '').trim();
    if (!orgId) return;

    if (!orgIds.has(orgId)) {
      report.warnings.push(`Território órfão na linha ${t.__lineNum}: organizacao_id '${orgId}' não corresponde a nenhuma organização cadastrada.`);
      return;
    }

    territoriesMap[orgId] = t;
    report.territoriesTotal++;
  });

  const impactsMap = {};
  rawImpactos.forEach(imp => {
    const orgId = String(imp.organizacao_id || '').trim();
    if (!orgId) return;

    if (!orgIds.has(orgId)) {
      report.warnings.push(`Registro de impacto órfão na linha ${imp.__lineNum}: organizacao_id '${orgId}' não corresponde a nenhuma organização cadastrada.`);
      return;
    }

    impactsMap[orgId] = imp;
    report.impactsTotal++;
  });

  const odsMap = {};
  rawOdsGov.forEach(row => {
    const orgId = String(row.organizacao_id || '').trim();
    if (!orgId) return;

    if (!orgIds.has(orgId)) {
      report.warnings.push(`ODS/Governança órfão na linha ${row.__lineNum}: organizacao_id '${orgId}' não corresponde a nenhuma organização cadastrada.`);
      return;
    }

    if (row.tipo_registro === 'ODS') {
      const num = parseInt(row.ods_numero, 10);
      if (isNaN(num) || num < 1 || num > 17) {
        report.warnings.push(`ODS fora do intervalo 1-17 na linha ${row.__lineNum} (Org ${orgId}): número '${row.ods_numero}'.`);
      }
      
      if (!odsMap[orgId]) {
        odsMap[orgId] = [];
      }
      odsMap[orgId].push(row);
      report.odsTotal++;
    }
  });

  const recursosMap = {};
  rawRecursos.forEach(r => {
    const orgId = String(r.organizacao_id || '').trim();
    if (!orgId) return;

    if (!orgIds.has(orgId)) {
      report.warnings.push(`Recurso órfão na linha ${r.__lineNum}: organizacao_id '${orgId}' não corresponde a nenhuma organização cadastrada.`);
      return;
    }

    recursosMap[orgId] = r;
    report.recursosTotal = (report.recursosTotal || 0) + 1;
  });

  // Check opportunities and documents
  rawOportunidades.forEach(op => {
    const orgId = String(op.organizacao_id || '').trim();
    if (orgId) {
      if (!orgIds.has(orgId)) {
        report.warnings.push(`Oportunidade órfã na linha ${op.__lineNum}: organizacao_id '${orgId}'.`);
      } else {
        report.opportunitiesTotal++;
      }
    }
  });

  rawDocumentos.forEach(doc => {
    const orgId = String(doc.organizacao_id || '').trim();
    if (orgId) {
      if (!orgIds.has(orgId)) {
        report.warnings.push(`Documento órfão na linha ${doc.__lineNum}: organizacao_id '${orgId}'.`);
      } else {
        report.documentsTotal++;
      }
    }
  });

  // Helpers for mapping
  const mapFormalizationStatus = (val) => {
    const v = String(val || '').trim();
    if (v === 'Organização com CNPJ próprio') return 'with_cnpj';
    if (v === 'Projeto ou coletivo sem CNPJ') return 'no_cnpj';
    if (v === 'Projeto vinculado a outra organização') return 'linked';
    if (v === 'Em processo de formalização') return 'formalizing';
    return '';
  };

  const mapYesNo = (val) => {
    const v = String(val || '').trim().toLowerCase();
    if (v === 'sim') return 'sim';
    if (v === 'não' || v === 'nao') return 'nao';
    return '';
  };

  const mapYesNoBool = (val) => {
    const v = String(val || '').trim().toLowerCase();
    if (v === 'sim') return true;
    if (v === 'não' || v === 'nao') return false;
    return null;
  };

  const mapPermission = (row, defaultVal) => {
    if (!row) return defaultVal;
    if (row.publicar_catalogo === 'Sim') return 'public';
    if (row.compartilhar_empresas === 'Sim') return 'partners';
    return 'internal';
  };

  // Generate private and public databases
  const publicData = [];
  const privateData = {};

  orgs.forEach(org => {
    const orgId = org.organizacao_id;
    const name = org.nome_oficial || '';
    const tradingName = org.nome_conhecido || name;
    
    const matchedTerritorio = territoriesMap[orgId] || {};
    const neighborhood = matchedTerritorio.bairro || 'Recife';
    const formalizationStatus = mapFormalizationStatus(org.situacao_formalizacao);
    
    const typeIndicator = (formalizationStatus === 'with_cnpj') ? 'Organização' : 'Projeto';

    // Add to public index
    publicData.push({
      id: orgId,
      name: name,
      tradingName: tradingName,
      neighborhood: neighborhood,
      formalizationStatus: formalizationStatus,
      type: typeIndicator,
      status: org.status_cadastro || 'Rascunho'
    });

    // Merge detailed private data
    const c = contactsMap[orgId] || {};
    const imp = impactsMap[orgId] || {};
    const r = recursosMap[orgId] || {};
    const myOds = odsMap[orgId] || [];

    // ODS arrays
    const selectedOdsList = [];
    const priorityOdsList = [];
    const odsExplanations = {};

    myOds.forEach(item => {
      const odsKey = `ods_${item.ods_numero}`;
      selectedOdsList.push(odsKey);
      if (String(item.ods_prioritario).toLowerCase() === 'sim') {
        priorityOdsList.push(odsKey);
        odsExplanations[odsKey] = item.contribuicao_ods || '';
      }
    });

    // Impact result list
    const impactResultsList = [];
    if (imp.resultado_titulo || imp.resultado_descricao || imp.resultado_quantidade) {
      impactResultsList.push({
        id: imp.impacto_id || `res_${orgId}_1`,
        title: imp.resultado_titulo || '',
        description: imp.resultado_descricao || '',
        quantity: imp.resultado_quantidade || '',
        unit: imp.resultado_unidade || '',
        period: imp.resultado_periodo || '',
        evidence: imp.resultado_evidencia || '',
        observation: imp.observacoes || ''
      });
    }

    // Volunteer details
    const volunteerData = {
      receivesVolunteers: (imp.voluntarios_informacao || imp.quantidade_voluntarios_estimativa) ? 'yes' : '',
      activeCount: imp.quantidade_voluntarios_estimativa ? parseInt(imp.quantidade_voluntarios_estimativa, 10) || undefined : undefined,
      desiredSkills: imp.voluntarios_informacao || '',
      availableActivities: [],
      frequency: '',
      modality: ''
    };

    // Full consolidated profile
    privateData[orgId] = {
      id: orgId,
      name: name,
      tradingName: tradingName,
      formalizationStatus: formalizationStatus,
      parentOrgName: '',
      parentOrgCnpj: '',
      parentOrgRelationType: '',
      parentOrgRep: '',
      parentOrgContact: '',
      parentOrgReceivesDonations: '',
      parentOrgEmitsReceipts: '',
      parentOrgReportingResponsible: '',
      formalizationExpectedDate: '',
      formalizationStage: '',
      formalizationHasSupport: '',
      formalizationNeeds: '',
      cnpj: org.cnpj || '',
      foundationYear: String(org.ano_fundacao || ''),
      legalNature: org.natureza_juridica || 'Não se aplica',
      certifications: org.certificacoes ? org.certificacoes.split(', ') : [],
      certificationsOther: '',
      
      cep: matchedTerritorio.cep || '',
      street: matchedTerritorio.logradouro || '',
      number: matchedTerritorio.numero || '',
      complement: matchedTerritorio.complemento || '',
      neighborhood: neighborhood,
      city: matchedTerritorio.cidade || 'Recife',
      state: matchedTerritorio.estado || 'PE',
      rpa: matchedTerritorio.rpa || '',
      communitiesOfActivity: matchedTerritorio.comunidade || '',
      operatingHours: org.horario_funcionamento || '',

      // Contacts
      legalRepName: c.nome || '',
      legalRepRole: c.funcao || '',
      fillerName: '',
      fillerRole: '',
      companyContactName: '',
      phone: c.telefone || '',
      whatsapp: c.whatsapp || '',
      email: c.email || '',
      website: c.site || '',
      instagram: c.instagram || '',
      facebook: c.facebook || '',
      linkedin: c.linkedin || '',
      youtube: c.youtube || '',
      otherSocials: c.outras_redes || '',
      phonePermission: mapPermission(c, 'internal'),
      whatsappPermission: mapPermission(c, 'partners'),
      emailPermission: mapPermission(c, 'public'),
      socialPermission: 'internal',

      // About
      mainCause: org.causa_principal || '',
      secondaryCauses: org.causas_relacionadas ? org.causas_relacionadas.split(', ') : [],
      history: org.historia || '',
      mission: org.missao || '',
      vision: org.visao || '',
      values: org.valores || '',
      socialProblem: org.problema_social || '',
      relevanceRecife: org.relevancia_recife || '',
      mainActivities: org.atividades || '',
      differentiator: org.differentiator || '',

      // Audience & Territory
      audiences: imp.publicos_atendidos ? imp.publicos_atendidos.split(', ') : [],
      ageRanges: imp.faixas_etarias ? imp.faixas_etarias.split(', ') : [],
      neighborhoodsOfActivity: [],
      communitiesAttended: '',
      citiesOfActivity: ['Recife'],
      attendanceType: [],
      territorialScope: 'Comunitária',
      participationCriteria: matchedTerritorio.criterios_participacao || '',
      monthlyAverageAttendance: '',
      resultsTrackingMethodsInformal: [],

      // Impact
      servedLast12Months: String(imp.pessoas_atendidas || ''),
      totalAttendancesLast12Months: String(imp.atendimentos_realizados || ''),
      isEstimateOrExact: imp.numero_exato_ou_estimado === 'Exato' ? 'exact' : (imp.numero_exato_ou_estimado === 'Estimado' ? 'estimate' : ''),
      mainResultsSummary: imp.resultado_descricao || '',
      beneficiaryProfile: '',
      indicators: '',
      indicatorStatus: imp.situacao_indicadores || '',
      resultsTrackingMethod: imp.forma_acompanhamento || '',
      evaluationFrequency: imp.frequencia_avaliacao || '',
      goalsNext12Months: imp.metas_12_meses || '',
      goalsMediumTerm: '',
      goalsLongTerm: '',
      hasActivityReport: mapYesNoBool(imp.possui_relatorio_atividades),
      hasImpactReport: mapYesNoBool(imp.possui_relatorio_impacto),
      hasTestimonials: mapYesNoBool(imp.possui_casos_sucesso),
      authorizeTestimonialsPublishing: mapYesNoBool(imp.autoriza_divulgacao_relatos),
      impactResultsList: impactResultsList,

      // ODS
      selectedOdsList: selectedOdsList,
      priorityOdsList: priorityOdsList,
      odsExplanations: odsExplanations,
      odsSpecificGoals: {},
      odsSpecificGoalsOptional: '',
      esgSocialPractices: [],
      esgEnvironmentalPractices: [],
      esgGovernancePractices: [],

      // Governance
      governanceHasBylaws: '',
      governanceHasBoard: '',
      governanceHasFiscalCouncil: '',
      governanceHasAdminCouncil: '',
      governanceDoesMeetings: '',
      governanceHasReporingPolicy: '',
      governancePublishesReports: '',
      governancePublishesFinance: '',
      governanceHasEthicsCode: '',
      governanceHasChildProtection: '',
      governanceHasDataProtection: '',
      governanceHasWhistleblowerChannel: '',
      governanceDesiresSupport: null,

      // Resources
      annualBudgetRange: r.faixa_orcamento_anual || '',
      revenueSources: r.fontes_receita ? r.fontes_receita.split(', ') : [],
      hasInstitutionalBankInstAccount: mapYesNoBool(r.possui_conta_institucional),
      canReceiveCorporateDonations: mapYesNoBool(r.recebe_doacoes_empresariais),
      emitsReceipts: mapYesNoBool(r.emite_recibos),
      hasApprovedIncentiveProject: mapYesNoBool(r.possui_projeto_lei_incentivo),
      incentiveProjectName: r.nome_projeto_incentivado || '',
      incentiveProjectLawName: r.lei_incentivo || '',
      incentiveApprovedValue: r.valor_aprovado || '',
      incentiveCaptationDeadline: r.prazo_captacao || '',
      incentiveProjectCurrentStatus: r.situacao_captacao || '',
      hasReceivedCorporateSupport: mapYesNoBool(r.recebeu_apoio_empresas),
      supportedCompaniesNames: r.empresas_apoiadoras || '',
      authorizeCitingCompanies: mapYesNoBool(r.autoriza_citar_empresas),
      seeksNewPartners: mapYesNoBool(r.busca_novos_parceiros),
      hasCompanyRelationStaff: mapYesNoBool(r.responsavel_parcerias),

      // Opportunities & Volunteer
      corporateOpportunitiesList: [],
      volunteerData: volunteerData,

      // Materials
      simulatedFiles: {},
      photosAuthorization: null,
      documentsReviewAuthorization: null,

      // Consents
      consentTrueInformation: null,
      consentCatalogPublishing: null,
      consentPublishedContactsOnly: null,
      consentImageUsage: null,
      consentDataGovernanceUsage: null,
      consentCommunicationSubscription: null,
      consentReviewAwareness: null,

      wantEmailConfirmation: true,
      wantDeadlineReminders: true,

      status: org.status_cadastro || 'Rascunho',
      lastUpdated: org.data_ultima_atualizacao || ''
    };
  });

  // Write outputs
  fs.writeFileSync(publicJsonPath, JSON.stringify(publicData, null, 2), 'utf-8');
  fs.writeFileSync(privateJsonPath, JSON.stringify(privateData, null, 2), 'utf-8');

  report.filesGenerated.push(`src/data/organizations-search.public.json`);
  report.filesGenerated.push(`src/data/organizations-private.generated.json`);

  console.log(`Successfully generated public and private JSON databases!`);
  console.log(`- Public search items: ${publicData.length}`);
  console.log(`- Private profiles: ${Object.keys(privateData).length}`);

  // Build Markdown Report
  const mdReport = `# Relatório de Importação de Planilha

- **Arquivo Utilizado:** \`${report.fileName}\`
- **Data da Importação:** ${report.importDate}
- **Abas Encontradas:** ${report.sheetsFound.map(s => `\`${s}\``).join(', ')}

## Estatísticas de Registros Importados
- **Quantidade de Organizações:** ${report.orgsTotal}
- **Quantidade de Projetos sem CNPJ:** ${report.projectsWithoutCnpj}
- **Quantidade de Contatos:** ${report.contactsTotal}
- **Quantidade de Territórios:** ${report.territoriesTotal}
- **Quantidade de Registros de Impacto:** ${report.impactsTotal}
- **Quantidade de Registros de ODS:** ${report.odsTotal}
- **Quantidade de Oportunidades:** ${report.opportunitiesTotal}
- **Quantidade de Documentos:** ${report.documentsTotal}

## Duplicidades Encontradas
${report.duplicates.length > 0 
    ? report.duplicates.map(d => `- ${d}`).join('\n') 
    : '*Nenhuma duplicidade de ID de organização encontrada (Chaves BI-XXXX íntegras).*'}

## Linhas Ignoradas
${report.ignoredRows.length > 0 
    ? report.ignoredRows.map(i => `- ${i}`).join('\n') 
    : '*Nenhuma linha de organização ignorada.*'}

## Alertas e Inconsistências
${report.warnings.length > 0 
    ? report.warnings.map(w => `- ${w}`).join('\n') 
    : '*Nenhum alerta de validação detectado.*'}

## Arquivos Gerados
${report.filesGenerated.map(f => `- [\`${path.basename(f)}\`](file:///${f.replace(/\\/g, '/')})`).join('\n')}

## Comando de Execução
Para executar a importação novamente e atualizar as bases de dados e este relatório, utilize o comando:
\`\`\`bash
npm run import:data
\`\`\`
`;

  fs.writeFileSync(reportPath, mdReport, 'utf-8');
  console.log(`Report successfully generated at: ${reportPath}`);

} catch (err) {
  console.error('Import process failed with error:', err);
  process.exit(1);
}
