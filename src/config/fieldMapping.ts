/**
 * central mapping configuration between frontend fields (OrganizationData)
 * and Google Planilhas destination sheets and columns.
 */

export interface FieldMapping {
  sheet: string;
  column: string;
  type: 'string' | 'number' | 'boolean' | 'array' | 'object' | 'date';
  classification: 'public' | 'internal' | 'personal' | 'partners' | 'not_publish';
}

export const fieldMapping: Record<string, FieldMapping> = {
  // Identification (Sheet: ORGANIZACOES)
  id: { sheet: 'ORGANIZACOES', column: 'organizacao_id', type: 'string', classification: 'public' },
  name: { sheet: 'ORGANIZACOES', column: 'nome_oficial', type: 'string', classification: 'public' },
  tradingName: { sheet: 'ORGANIZACOES', column: 'nome_conhecido', type: 'string', classification: 'public' },
  formalizationStatus: { sheet: 'ORGANIZACOES', column: 'situacao_formalizacao', type: 'string', classification: 'public' },
  cnpj: { sheet: 'ORGANIZACOES', column: 'cnpj', type: 'string', classification: 'internal' },
  foundationYear: { sheet: 'ORGANIZACOES', column: 'ano_fundacao', type: 'string', classification: 'public' },
  legalNature: { sheet: 'ORGANIZACOES', column: 'natureza_juridica', type: 'string', classification: 'public' },
  certifications: { sheet: 'ORGANIZACOES', column: 'certificacoes', type: 'array', classification: 'public' },
  certificationsOther: { sheet: 'ORGANIZACOES', column: 'certificacoes_outras', type: 'string', classification: 'public' },
  history: { sheet: 'ORGANIZACOES', column: 'historia', type: 'string', classification: 'public' },
  mission: { sheet: 'ORGANIZACOES', column: 'missao', type: 'string', classification: 'public' },
  vision: { sheet: 'ORGANIZACOES', column: 'visao', type: 'string', classification: 'public' },
  values: { sheet: 'ORGANIZACOES', column: 'valores', type: 'string', classification: 'public' },
  mainCause: { sheet: 'ORGANIZACOES', column: 'causa_principal', type: 'string', classification: 'public' },
  secondaryCauses: { sheet: 'ORGANIZACOES', column: 'causas_relacionadas', type: 'array', classification: 'public' },
  socialProblem: { sheet: 'ORGANIZACOES', column: 'problema_social', type: 'string', classification: 'public' },
  relevanceRecife: { sheet: 'ORGANIZACOES', column: 'relevancia_recife', type: 'string', classification: 'public' },
  mainActivities: { sheet: 'ORGANIZACOES', column: 'atividades', type: 'string', classification: 'public' },
  differentiator: { sheet: 'ORGANIZACOES', column: 'diferencial', type: 'string', classification: 'public' },
  operatingHours: { sheet: 'ORGANIZACOES', column: 'horario_funcionamento', type: 'string', classification: 'public' },
  status: { sheet: 'ORGANIZACOES', column: 'status_cadastro', type: 'string', classification: 'internal' },
  lastUpdated: { sheet: 'ORGANIZACOES', column: 'data_ultima_atualizacao', type: 'string', classification: 'internal' },

  // Address (Sheet: TERRITORIOS)
  cep: { sheet: 'TERRITORIOS', column: 'cep', type: 'string', classification: 'public' },
  street: { sheet: 'TERRITORIOS', column: 'logradouro', type: 'string', classification: 'public' },
  number: { sheet: 'TERRITORIOS', column: 'numero', type: 'string', classification: 'public' },
  complement: { sheet: 'TERRITORIOS', column: 'complemento', type: 'string', classification: 'public' },
  neighborhood: { sheet: 'TERRITORIOS', column: 'bairro', type: 'string', classification: 'public' },
  city: { sheet: 'TERRITORIOS', column: 'cidade', type: 'string', classification: 'public' },
  state: { sheet: 'TERRITORIOS', column: 'estado', type: 'string', classification: 'public' },
  rpa: { sheet: 'TERRITORIOS', column: 'rpa', type: 'string', classification: 'public' },
  communitiesOfActivity: { sheet: 'TERRITORIOS', column: 'comunidade', type: 'string', classification: 'public' },

  // Contacts (Sheet: CONTATOS - mapped flat for Org representatives, permission tags mapped separately)
  legalRepName: { sheet: 'CONTATOS', column: 'legal_rep_nome', type: 'string', classification: 'personal' },
  legalRepRole: { sheet: 'CONTATOS', column: 'legal_rep_funcao', type: 'string', classification: 'personal' },
  fillerName: { sheet: 'CONTATOS', column: 'filler_nome', type: 'string', classification: 'personal' },
  fillerRole: { sheet: 'CONTATOS', column: 'filler_funcao', type: 'string', classification: 'personal' },
  phone: { sheet: 'CONTATOS', column: 'telefone', type: 'string', classification: 'personal' },
  whatsapp: { sheet: 'CONTATOS', column: 'whatsapp', type: 'string', classification: 'personal' },
  email: { sheet: 'CONTATOS', column: 'email', type: 'string', classification: 'personal' },
  website: { sheet: 'CONTATOS', column: 'site', type: 'string', classification: 'public' },
  instagram: { sheet: 'CONTATOS', column: 'instagram', type: 'string', classification: 'public' },
  facebook: { sheet: 'CONTATOS', column: 'facebook', type: 'string', classification: 'public' },
  linkedin: { sheet: 'CONTATOS', column: 'linkedin', type: 'string', classification: 'public' },
  youtube: { sheet: 'CONTATOS', column: 'youtube', type: 'string', classification: 'public' },
  otherSocials: { sheet: 'CONTATOS', column: 'outras_redes', type: 'string', classification: 'public' },
  
  phonePermission: { sheet: 'CONTATOS', column: 'uso_interno', type: 'string', classification: 'internal' },
  whatsappPermission: { sheet: 'CONTATOS', column: 'compartilhar_empresas', type: 'string', classification: 'internal' },
  emailPermission: { sheet: 'CONTATOS', column: 'publicar_catalogo', type: 'string', classification: 'internal' },

  // Audience & Territory (Sheet: TERRITORIOS / IMPACTO)
  audiences: { sheet: 'IMPACTO', column: 'publicos_atendidos', type: 'array', classification: 'public' },
  ageRanges: { sheet: 'IMPACTO', column: 'faixas_etarias', type: 'array', classification: 'public' },
  neighborhoodsOfActivity: { sheet: 'TERRITORIOS', column: 'bairro_abrangencia', type: 'array', classification: 'public' },

  // Impact (Sheet: IMPACTO)
  servedLast12Months: { sheet: 'IMPACTO', column: 'pessoas_atendidas', type: 'string', classification: 'public' },
  totalAttendancesLast12Months: { sheet: 'IMPACTO', column: 'atendimentos_realizados', type: 'string', classification: 'public' },
  isEstimateOrExact: { sheet: 'IMPACTO', column: 'numero_exato_ou_estimado', type: 'string', classification: 'public' },
  mainResultsSummary: { sheet: 'IMPACTO', column: 'resultado_descricao', type: 'string', classification: 'public' },
  indicatorStatus: { sheet: 'IMPACTO', column: 'situacao_indicadores', type: 'string', classification: 'public' },
  resultsTrackingMethod: { sheet: 'IMPACTO', column: 'forma_acompanhamento', type: 'string', classification: 'public' },
  evaluationFrequency: { sheet: 'IMPACTO', column: 'frequencia_avaliacao', type: 'string', classification: 'public' },
  goalsNext12Months: { sheet: 'IMPACTO', column: 'metas_12_meses', type: 'string', classification: 'public' },
  hasActivityReport: { sheet: 'IMPACTO', column: 'possui_relatorio_atividades', type: 'boolean', classification: 'public' },
  hasImpactReport: { sheet: 'IMPACTO', column: 'possui_relatorio_impacto', type: 'boolean', classification: 'public' },
  hasTestimonials: { sheet: 'IMPACTO', column: 'possui_casos_sucesso', type: 'boolean', classification: 'public' },
  authorizeTestimonialsPublishing: { sheet: 'IMPACTO', column: 'autoriza_divulgacao_relatos', type: 'boolean', classification: 'public' },

  // Governance & ESG (Sheet: ODS_GOVERNANCA - governed dynamically or simplified flat mapping for governance)
  governanceHasBylaws: { sheet: 'RECURSOS', column: 'governo_estatuto', type: 'string', classification: 'internal' },
  governanceHasBoard: { sheet: 'RECURSOS', column: 'governo_diretoria', type: 'string', classification: 'internal' },
  governanceHasFiscalCouncil: { sheet: 'RECURSOS', column: 'governo_conselho_fiscal', type: 'string', classification: 'internal' },
  
  // Resources (Sheet: RECURSOS)
  annualBudgetRange: { sheet: 'RECURSOS', column: 'faixa_orcamento_anual', type: 'string', classification: 'not_publish' },
  revenueSources: { sheet: 'RECURSOS', column: 'fontes_receita', type: 'array', classification: 'internal' },
  hasInstitutionalBankInstAccount: { sheet: 'RECURSOS', column: 'possui_conta_institucional', type: 'boolean', classification: 'internal' },
  canReceiveCorporateDonations: { sheet: 'RECURSOS', column: 'recebe_doacoes_empresariais', type: 'boolean', classification: 'internal' },
  emitsReceipts: { sheet: 'RECURSOS', column: 'emite_recibos', type: 'boolean', classification: 'internal' },
  hasApprovedIncentiveProject: { sheet: 'RECURSOS', column: 'possui_projeto_lei_incentivo', type: 'boolean', classification: 'internal' },
  incentiveProjectLawName: { sheet: 'RECURSOS', column: 'lei_incentivo', type: 'string', classification: 'internal' },
  incentiveProjectName: { sheet: 'RECURSOS', column: 'nome_projeto_incentivado', type: 'string', classification: 'internal' },
  incentiveApprovedValue: { sheet: 'RECURSOS', column: 'valor_aprovado', type: 'string', classification: 'internal' },
  incentiveCaptationDeadline: { sheet: 'RECURSOS', column: 'prazo_captacao', type: 'string', classification: 'internal' },
  incentiveProjectCurrentStatus: { sheet: 'RECURSOS', column: 'situacao_captacao', type: 'string', classification: 'internal' },
  hasReceivedCorporateSupport: { sheet: 'RECURSOS', column: 'recebeu_apoio_empresas', type: 'boolean', classification: 'internal' },
  supportedCompaniesNames: { sheet: 'RECURSOS', column: 'empresas_apoiadoras', type: 'string', classification: 'internal' },
  authorizeCitingCompanies: { sheet: 'RECURSOS', column: 'autoriza_citar_empresas', type: 'boolean', classification: 'internal' },
  seeksNewPartners: { sheet: 'RECURSOS', column: 'busca_novos_parceiros', type: 'boolean', classification: 'public' },
  hasCompanyRelationStaff: { sheet: 'RECURSOS', column: 'responsavel_parcerias', type: 'boolean', classification: 'internal' }
};

/**
 * Returns a list of public fields suitable for public search output.
 */
export function getPublicFields(data: any): any {
  if (!data) return null;
  return {
    organizacao_id: data.id || '',
    nome_oficial: data.name || '',
    nome_conhecido: data.tradingName || '',
    bairro: data.neighborhood || '',
    situacao_formalizacao: data.formalizationStatus || '',
    status_cadastro: data.status || 'Rascunho'
  };
}
