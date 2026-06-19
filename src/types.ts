/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type FormStatus = 
  | 'Rascunho'
  | 'Enviado'
  | 'Em análise'
  | 'Ajustes solicitados'
  | 'Reenviado'
  | 'Aprovado'
  | 'Publicado'
  | 'Temporariamente oculto'
  | 'Arquivado';

export interface VolunteerData {
  receivesVolunteers: 'yes' | 'interest' | 'no' | '';
  activeCount?: number;
  hasCoordinator?: boolean;
  acceptsCorporate?: boolean;
  acceptsGroups?: boolean;
  maxGroupSize?: number;
  availableActivities?: string[];
  desiredSkills?: string;
  hoursRequired?: number;
  frequency?: string;
  modality?: 'presencial' | 'virtual' | 'hibrida' | '';
  location?: string;
  period?: string;
  needsTraining?: boolean;
  restrictions?: string;
}

export interface Opportunity {
  id: string;
  title: string;
  category: string;
  description: string;
  problemSolved: string;
  itemsNeeded: string;
  quantityNeeded: string;
  estimatedValue: string;
  acceptsPartialSupport: boolean;
  urgency: 'low' | 'medium' | 'high' | 'urgent';
  deadline: string;
  location: string;
  beneficiaryPublic: string;
  estimatedBeneficiaryCount: number;
  expectedResult: string;
  evidencePresented: string;
  offeredCounterparts: string[];
  responsibleName: string;
  status: 'open' | 'negotiation' | 'met' | 'closed';
}

export interface ImpactResult {
  id: string;
  title: string;
  description: string;
  quantity: string;
  unit: string;
  period: string;
  evidence: string;
  observation?: string;
}

export interface OrganizationData {
  // Identification (Step 1)
  id?: string;
  name: string;
  tradingName: string;
  formalizationStatus: 'with_cnpj' | 'no_cnpj' | 'linked' | 'formalizing' | '';
  parentOrgName?: string;
  parentOrgCnpj?: string;
  parentOrgRelationType?: string;
  parentOrgRep?: string;
  parentOrgContact?: string;
  parentOrgReceivesDonations?: string;
  parentOrgEmitsReceipts?: string;
  parentOrgReportingResponsible?: string;
  formalizationExpectedDate?: string;
  formalizationStage?: string;
  formalizationHasSupport?: 'sim' | 'nao' | 'em_construcao' | '';
  formalizationNeeds?: string;
  cnpj: string;
  foundationYear: string;
  legalNature: string;
  certifications: string[];
  certificationsOther?: string;
  cep: string;
  street: string;
  number: string;
  complement: string;
  neighborhood: string;
  city: string;
  state: string;
  rpa: string;
  communitiesOfActivity: string;
  operatingHours: string;

  // Contacts (Step 2)
  legalRepName: string;
  legalRepRole: string;
  fillerName: string;
  fillerRole: string;
  companyContactName: string;
  phone: string;
  whatsapp: string;
  email: string;
  website: string;
  instagram: string;
  facebook: string;
  linkedin: string;
  youtube: string;
  otherSocials: string;
  
  // Permissions for contacts
  phonePermission: Array<'internal' | 'partners' | 'public'> | 'internal' | 'partners' | 'public';
  whatsappPermission: Array<'internal' | 'partners' | 'public'> | 'internal' | 'partners' | 'public';
  emailPermission: Array<'internal' | 'partners' | 'public'> | 'internal' | 'partners' | 'public';
  socialPermission: Array<'internal' | 'partners' | 'public'> | 'internal' | 'partners' | 'public';

  // About organization (Step 3)
  mainCause: string;
  mainCauseOther?: string;
  secondaryCauses: string[];
  history: string;
  mission: string;
  vision: string;
  values: string;
  socialProblem: string;
  relevanceRecife: string;
  mainActivities: string;
  differentiator: string;

  // Audience & Territory (Step 4)
  audiences: string[];
  ageRanges: string[];
  neighborhoodsOfActivity: string[];
  communitiesAttended: string;
  citiesOfActivity: string[];
  attendanceType: string[];
  territorialScope: string;
  participationCriteria: string;
  monthlyAverageAttendance: string;
  resultsTrackingMethodsInformal?: string[];

  // Impact (Step 5)
  servedLast12Months: string;
  totalAttendancesLast12Months: string;
  isEstimateOrExact: 'exact' | 'estimate' | '';
  mainResultsSummary: string;
  beneficiaryProfile?: string;
  indicators?: string;
  indicatorStatus: 'has_indicators' | 'building' | 'no_indicators' | 'needs_support' | '';
  resultsTrackingMethod: string;
  evaluationFrequency: string;
  goalsNext12Months: string;
  goalsMediumTerm?: string;
  goalsLongTerm?: string;
  hasActivityReport: boolean;
  hasImpactReport: boolean;
  hasTestimonials: boolean;
  testimonialsText?: string;
  authorizeTestimonialsPublishing: boolean;
  impactResultsList: ImpactResult[];

  // ODS, ESG & Governance (Step 6)
  selectedOdsList: string[]; // up to 5 ODS IDs (e.g. "ods_4")
  priorityOdsList: string[]; // up to 3 priority ODS IDs
  odsExplanations: Record<string, string>; // explanations of contribution for priority ODSs
  odsSpecificGoalsOptional?: string;
  odsSpecificGoals?: Record<string, string>;
  
  esgSocialPractices: string[];
  esgEnvironmentalPractices: string[];
  esgGovernancePractices: string[];
  
  governanceHasBylaws: 'sim' | 'nao' | 'em_construcao' | 'nao_se_aplica' | 'nao_sei' | '';
  governanceHasBoard: 'sim' | 'nao' | 'em_construcao' | 'nao_se_aplica' | 'nao_sei' | '';
  governanceHasFiscalCouncil: 'sim' | 'nao' | 'em_construcao' | 'nao_se_aplica' | 'nao_sei' | '';
  governanceHasAdminCouncil: 'sim' | 'nao' | 'em_construcao' | 'nao_se_aplica' | 'nao_sei' | '';
  governanceDoesMeetings: 'sim' | 'nao' | 'em_construcao' | 'nao_se_aplica' | 'nao_sei' | '';
  governanceHasReporingPolicy: 'sim' | 'nao' | 'em_construcao' | 'nao_se_aplica' | 'nao_sei' | '';
  governancePublishesReports: 'sim' | 'nao' | 'em_construcao' | 'nao_se_aplica' | 'nao_sei' | '';
  governancePublishesFinance: 'sim' | 'nao' | 'em_construcao' | 'nao_se_aplica' | 'nao_sei' | '';
  governanceHasEthicsCode: 'sim' | 'nao' | 'em_construcao' | 'nao_se_aplica' | 'nao_sei' | '';
  governanceHasChildProtection: 'sim' | 'nao' | 'em_construcao' | 'nao_se_aplica' | 'nao_sei' | '';
  governanceHasDataProtection: 'sim' | 'nao' | 'em_construcao' | 'nao_se_aplica' | 'nao_sei' | '';
  governanceHasWhistleblowerChannel: 'sim' | 'nao' | 'em_construcao' | 'nao_se_aplica' | 'nao_sei' | '';
  governanceDesiresSupport: boolean;

  // Resources & Partnerships (Step 7)
  annualBudgetRange: string;
  revenueSources: string[];
  hasInstitutionalBankInstAccount: 'sim' | 'nao' | '' | boolean;
  canReceiveCorporateDonations: 'sim' | 'nao' | '' | boolean;
  emitsReceipts: boolean;
  hasApprovedIncentiveProject: 'sim' | 'nao' | '' | boolean;
  incentiveProjectLawName?: string;
  incentiveProjectName?: string;
  incentiveApprovedValue?: string;
  incentiveCaptationDeadline?: string;
  incentiveProjectCurrentStatus?: string;
  hasReceivedCorporateSupport: boolean;
  supportedCompaniesNames?: string;
  authorizeCitingCompanies: boolean;
  seeksNewPartners: boolean;
  hasCompanyRelationStaff: boolean;
  corporateSupportsList?: Array<{
    companyName: string;
    supportType: string;
    period: string;
    result: string;
  }>;

  // Opportunities & Voluntarism (Step 8)
  corporateOpportunitiesList: Opportunity[];
  volunteerData: VolunteerData;

  // Materials & Documents (Step 9)
  simulatedFiles: {
    logo?: string; // name of file
    photos?: string[]; // list of names of files
    presentation?: string;
    annualReport?: string;
    impactReport?: string;
    bylawsFile?: string;
    testimonialsFile?: string;
    otherFiles?: string[];
  };
  institutionalVideoLink?: string;
  photosAuthorization: boolean;
  documentsReviewAuthorization: boolean;

  // Final Consents and Status
  consentTrueInformation: boolean;
  consentCatalogPublishing: boolean;
  consentPublishedContactsOnly: boolean;
  consentImageUsage: boolean;
  consentDataGovernanceUsage: boolean;
  consentCommunicationSubscription: boolean;
  consentReviewAwareness: boolean;
  
  wantEmailConfirmation?: boolean;
  wantDeadlineReminders?: boolean;
  
  status: FormStatus;
  lastUpdated?: string;
}
