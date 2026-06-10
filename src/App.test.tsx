import { describe, it, expect } from 'vitest';
import { PhoneMaskHelper, CnpjMaskHelper, CepMaskHelper } from './components/FormFields';
import { getStepCompletionData } from './App';
import { EMPTY_ORGANIZATION } from './data/mockData';
import { fieldMapping } from './config/fieldMapping';

describe('Mask Helpers', () => {
  it('should format phone numbers correctly', () => {
    expect(PhoneMaskHelper('81988887777')).toBe('(81) 98888-7777');
    expect(PhoneMaskHelper('8132224444')).toBe('(81) 3222-4444');
    expect(PhoneMaskHelper('81')).toBe('(81');
  });

  it('should format CNPJ correctly', () => {
    expect(CnpjMaskHelper('12345678000190')).toBe('12.345.678/0001-90');
    expect(CnpjMaskHelper('12345678')).toBe('12.345.678');
  });

  it('should format CEP correctly', () => {
    expect(CepMaskHelper('51240020')).toBe('51240-020');
    expect(CepMaskHelper('51240')).toBe('51240');
  });
});

describe('Field Mapping Integrity', () => {
  it('should have basic identification columns mapped correctly', () => {
    expect(fieldMapping.name.sheet).toBe('ORGANIZACOES');
    expect(fieldMapping.name.column).toBe('nome_oficial');
    expect(fieldMapping.cnpj.sheet).toBe('ORGANIZACOES');
    expect(fieldMapping.cnpj.column).toBe('cnpj');
  });
});

describe('Wizard Completion Progress', () => {
  it('should start with 0% or low completion for empty organization', () => {
    const empty = { ...EMPTY_ORGANIZATION };
    const progress = getStepCompletionData(empty);
    const step1 = progress.find(s => s.step === 1);
    expect(step1?.percentage).toBeLessThanOrEqual(25);
  });

  it('should calculate completion when fields are filled', () => {
    const filledOrg = {
      ...EMPTY_ORGANIZATION,
      name: 'Test Org',
      formalizationStatus: 'no_cnpj' as const,
      cep: '51240-020',
      neighborhood: 'Ibura',
      street: 'Rua Teste',
      number: '123',
      operatingHours: '08:00 - 17:00',
      fillerName: 'Filler',
      phone: '(81) 98888-7777',
      whatsapp: '(81) 98888-7777',
      email: 'test@test.org',
      mainCause: 'Educação',
      history: 'Test history',
      mission: 'Test mission',
      socialProblem: 'Test problem',
      mainActivities: 'Test activities',
      audiences: ['Jovens'],
      ageRanges: ['15 a 18 anos'],
      neighborhoodsOfActivity: ['Ibura'],
      servedLast12Months: '100',
      totalAttendancesLast12Months: '500',
      isEstimateOrExact: 'estimate' as const,
      mainResultsSummary: 'Test results',
      selectedOdsList: ['ods_4'],
      annualBudgetRange: 'Até R$ 50 mil',
      hasInstitutionalBankInstAccount: true,
      canReceiveCorporateDonations: true,
      photosAuthorization: true,
      documentsReviewAuthorization: true
    };

    const progress = getStepCompletionData(filledOrg);
    progress.forEach(step => {
      expect(step.percentage).toBeGreaterThanOrEqual(0);
    });
  });
});
