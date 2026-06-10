/**
 * Form Rules and Conditional Logic — Bora Impactar
 * 
 * Centralized configuration to control field visibility and required status
 * based on the initiative situation:
 * - with_cnpj: Organização com CNPJ próprio
 * - no_cnpj: Projeto ou coletivo sem CNPJ
 * - linked: Projeto vinculado a outra organização
 * - formalizing: Em processo de formalização
 */

export function isFieldVisible(fieldId: string, status: string): boolean {
  // 1. Fields only visible for organizations with CNPJ
  const cnpjOnlyFields = [
    'cnpj',
    'legalNature',
    'certifications',
    'certificationsOther'
  ];
  if (cnpjOnlyFields.includes(fieldId)) {
    return status === 'with_cnpj';
  }

  // 2. Fields only visible for linked projects
  const linkedOnlyFields = [
    'parentOrgName',
    'parentOrgCnpj',
    'parentOrgRelationType',
    'parentOrgRep',
    'parentOrgContact',
    'parentOrgReceivesDonations',
    'parentOrgEmitsReceipts',
    'parentOrgReportingResponsible'
  ];
  if (linkedOnlyFields.includes(fieldId)) {
    return status === 'linked';
  }

  // 3. Fields only visible for formalizing projects
  const formalizingOnlyFields = [
    'formalizationExpectedDate',
    'formalizationStage',
    'formalizationHasSupport',
    'formalizationNeeds'
  ];
  if (formalizingOnlyFields.includes(fieldId)) {
    return status === 'formalizing';
  }

  // 4. Questions about results tracking (bureaucratic vs informal)
  if (fieldId === 'resultsTrackingMethod' || fieldId === 'indicators' || fieldId === 'indicatorStatus' || fieldId === 'evaluationFrequency') {
    return status !== 'no_cnpj';
  }
  if (fieldId === 'resultsTrackingMethodsInformal') {
    return status === 'no_cnpj';
  }

  // 5. Activity and impact reports (formal documents)
  if (fieldId === 'hasActivityReport' || fieldId === 'hasImpactReport' || fieldId === 'simulatedFiles.annualReport' || fieldId === 'simulatedFiles.bylawsFile') {
    return status !== 'no_cnpj';
  }

  // 6. Formal budget, bank accounts, direct corporate donation aptitude and incentives
  const formalFinancialFields = [
    'annualBudgetRange',
    'hasInstitutionalBankInstAccount',
    'canReceiveCorporateDonations',
    'emitsReceipts',
    'hasApprovedIncentiveProject',
    'incentiveProjectName',
    'incentiveProjectLawName',
    'incentiveApprovedValue',
    'incentiveCaptationDeadline',
    'incentiveProjectCurrentStatus',
    'documentsReviewAuthorization'
  ];
  if (formalFinancialFields.includes(fieldId)) {
    return status !== 'no_cnpj';
  }

  // 7. ESG and governance practices
  if (fieldId.startsWith('esg') || fieldId.startsWith('governance')) {
    return status !== 'no_cnpj';
  }

  return true; // All other fields are visible by default
}

export function isFieldRequired(fieldId: string, status: string): boolean {
  if (!isFieldVisible(fieldId, status)) {
    return false; // Hidden fields are never required
  }

  // Fields that are required for all types
  const coreRequiredFields = [
    'name',
    'formalizationStatus',
    'foundationYear',
    'cep',
    'street',
    'number',
    'neighborhood',
    'city',
    'state',
    'operatingHours',
    'legalRepName',
    'legalRepRole',
    'fillerName',
    'fillerRole',
    'phone',
    'whatsapp',
    'email',
    'phonePermission',
    'whatsappPermission',
    'emailPermission',
    'mainCause',
    'history',
    'mission',
    'vision',
    'values',
    'socialProblem',
    'relevanceRecife',
    'mainActivities',
    'differentiator',
    'audiences',
    'ageRanges',
    'citiesOfActivity',
    'neighborhoodsOfActivity',
    'servedLast12Months',
    'totalAttendancesLast12Months',
    'isEstimateOrExact',
    'beneficiaryProfile',
    'mainResultsSummary',
    'selectedOdsList',
    'priorityOdsList',
    'odsExplanations',
    'revenueSources',
    'photosAuthorization'
  ];

  if (coreRequiredFields.includes(fieldId)) {
    // For projects without CNPJ, the metas (goals) are optional, so goalsNext12Months is only required for others
    if (fieldId === 'goalsNext12Months') {
      return status !== 'no_cnpj';
    }
    return true;
  }

  // Specific required fields for with_cnpj
  if (status === 'with_cnpj') {
    return [
      'cnpj',
      'legalNature',
      'resultsTrackingMethod',
      'annualBudgetRange',
      'hasInstitutionalBankInstAccount',
      'canReceiveCorporateDonations',
      'documentsReviewAuthorization'
    ].includes(fieldId);
  }

  // Specific required fields for linked
  if (status === 'linked') {
    return [
      'parentOrgName',
      'parentOrgCnpj',
      'parentOrgRelationType',
      'parentOrgRep',
      'parentOrgContact',
      'parentOrgReceivesDonations',
      'parentOrgEmitsReceipts',
      'parentOrgReportingResponsible',
      'resultsTrackingMethod',
      'annualBudgetRange',
      'hasInstitutionalBankInstAccount',
      'canReceiveCorporateDonations',
      'documentsReviewAuthorization'
    ].includes(fieldId);
  }

  // Specific required fields for formalizing
  if (status === 'formalizing') {
    return [
      'formalizationExpectedDate',
      'formalizationStage',
      'formalizationHasSupport',
      'resultsTrackingMethod',
      'annualBudgetRange',
      'hasInstitutionalBankInstAccount',
      'canReceiveCorporateDonations',
      'documentsReviewAuthorization'
    ].includes(fieldId);
  }

  // Specific required fields for no_cnpj
  if (status === 'no_cnpj') {
    return [
      'resultsTrackingMethodsInformal'
    ].includes(fieldId);
  }

  return false;
}
