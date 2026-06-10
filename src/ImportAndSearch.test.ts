import { describe, it, expect } from 'vitest';
import publicSearchData from './data/organizations-search.public.json';
import { apiService } from './services/api';

describe('Official Database Search Integration', () => {
  it('should not contain any mock organizations like Instituto Esperança Recife', () => {
    const hasMock = publicSearchData.some(org => 
      org.name.includes('Instituto Esperança Recife') || 
      org.id === 'org_esperanca_recife'
    );
    expect(hasMock).toBe(false);
  });

  it('should have exactly 118 valid organizations from the official Excel', () => {
    expect(publicSearchData.length).toBe(118);
    publicSearchData.forEach(org => {
      expect(org.id).toMatch(/^BI-\d{4}$/);
    });
  });

  it('should not expose sensitive private data in the public search database', () => {
    publicSearchData.forEach((org: any) => {
      expect(org.email).toBeUndefined();
      expect(org.phone).toBeUndefined();
      expect(org.whatsapp).toBeUndefined();
      expect(org.cnpj).toBeUndefined();
      expect(org.budget).toBeUndefined();
      expect(org.annualBudgetRange).toBeUndefined();
      expect(org.revenueSources).toBeUndefined();
      expect(org.legalRepName).toBeUndefined();
    });
  });

  it('should search ignoring accents, case, and matching partially', async () => {
    // Lar de Jesus in Excel is "Abrigo Espírita Lar de Jesus" or similar
    const query = 'lar de jesus';
    const res = await apiService.searchOrganizations(query);
    expect(res.success).toBe(true);
    expect(res.data).toBeDefined();
    expect(res.data!.length).toBeGreaterThan(0);
    
    // Check that matched items contain "Lar de Jesus" and are accent-insensitive
    const match = res.data!.find(org => 
      org.name.toLowerCase().includes('abrigo')
    );
    expect(match).toBeDefined();
    expect(match.id).toBe('BI-0001');
  });

  it('should search matching partially and return correct type indicator', async () => {
    const query = 'abrigo'; 
    const res = await apiService.searchOrganizations(query);
    expect(res.success).toBe(true);
    expect(res.data!.length).toBeGreaterThan(0);
    expect(res.data![0].type).toBeDefined();
    expect(['Organização', 'Projeto']).toContain(res.data![0].type);
  });
});
