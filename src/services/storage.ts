/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { OrganizationData } from '../types';
import publicSearchData from '../data/organizations-search.public.json';
import privateData from '../data/organizations-private.generated.json';

const STORAGE_KEY = 'bora_impactar_organizations';
const DRAFT_KEY = 'bora_impactar_current_draft';

export const storageService = {
  /**
   * Initializes or gets the full list of organizations.
   * Seeds from the private generated JSON (imported from spreadsheet) which
   * contains complete data for each organization.
   */
  getOrganizations(): any[] {
    const data = localStorage.getItem(STORAGE_KEY);
    // Convert private object-map to array (file is keyed by org ID)
    const privateArray: any[] = Object.values(privateData as unknown as Record<string, any>);
    if (!data) {
      // Seed initial imported organizations (full private data from spreadsheet)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(privateArray));
      return privateArray;
    }
    try {
      const parsed = JSON.parse(data);
      // Auto-migration: if stored data is old public-only format (no mainCause field),
      // reseed with full private data from spreadsheet
      if (Array.isArray(parsed) && parsed.length > 0 && !parsed[0].mainCause && !parsed[0].history) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(privateArray));
        return privateArray;
      }
      return parsed;
    } catch (e) {
      console.error('Error parsing stored organizations', e);
      return privateArray;
    }
  },

  /**
   * Returns only the public search list (minimal data) for use in the search dropdown.
   */
  getPublicSearchList(): any[] {
    return publicSearchData;
  },

  /**
   * Saves or updates an organization in the global list.
   */
  saveOrganizationToList(org: OrganizationData): void {
    const list = this.getOrganizations();
    const index = list.findIndex(item => item.id === org.id || (org.cnpj && item.cnpj === org.cnpj));
    
    if (index >= 0) {
      list[index] = { ...org, lastUpdated: new Date().toLocaleDateString('pt-BR') };
    } else {
      list.push({ ...org, lastUpdated: new Date().toLocaleDateString('pt-BR') });
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  },

  /**
   * Gets the active pre-editing draft if any.
   */
  getCurrentDraft(): OrganizationData | null {
    const data = localStorage.getItem(DRAFT_KEY);
    if (!data) return null;
    try {
      return JSON.parse(data);
    } catch {
      return null;
    }
  },

  /**
   * Saves the current active progress draft.
   */
  saveCurrentDraft(org: OrganizationData): void {
    const draftWithDate = {
      ...org,
      lastUpdated: new Date().toLocaleDateString('pt-BR')
    };
    localStorage.setItem(DRAFT_KEY, JSON.stringify(draftWithDate));
  },

  /**
   * Clears the current active draft (e.g. after successful submission).
   */
  clearCurrentDraft(): void {
    localStorage.removeItem(DRAFT_KEY);
  },

  /**
   * Generates a realistic mock protocol.
   * e.g. BI-202607-428A
   */
  generateProtocol(): string {
    const year = new Date().getFullYear();
    const randNum = Math.floor(1000 + Math.random() * 9000);
    const randLetter = String.fromCharCode(65 + Math.floor(Math.random() * 26));
    return `BI-${year}${randNum}-${randLetter}`;
  },

  /**
   * Simulates full submission.
   */
  submitRegistration(org: OrganizationData): { protocol: string; success: boolean; organization: OrganizationData } {
    const protocol = this.generateProtocol();
    const submittedOrg: OrganizationData = {
      ...org,
      id: org.id || `org_${Date.now()}`,
      status: 'Enviado', // Set to Enviado
      lastUpdated: new Date().toLocaleDateString('pt-BR')
    };

    // Save back to the mock database lists
    this.saveOrganizationToList(submittedOrg);
    
    // Clear the active pre-filling draft
    this.clearCurrentDraft();

    return {
      protocol,
      success: true,
      organization: submittedOrg
    };
  },

  /**
   * Resets the entire local state to initial defaults.
   */
  resetDatabase(): void {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(DRAFT_KEY);
    localStorage.removeItem('bora_impactar_credentials');
    localStorage.removeItem('bora_impactar_verification_codes');
    localStorage.setItem(STORAGE_KEY, JSON.stringify(Object.values(privateData)));
  },

  /**
   * Helper to get credentials
   */
  getCredentials(): any[] {
    try {
      const data = localStorage.getItem('bora_impactar_credentials');
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  /**
   * Generates and registers a mock verification code for first access verification.
   */
  requestVerificationCode(orgId: string): { success: boolean; code?: string; emailMasked?: string; error?: string } {
    const orgs = this.getOrganizations();
    const org = orgs.find(o => o.id === orgId);
    if (!org) {
      return { success: false, error: 'Organização não encontrada.' };
    }

    const email = org.email || '';
    if (!email) {
      return { success: false, error: 'Esta organização não possui e-mail cadastrado. Entre em contato com o suporte.' };
    }

    // Mask email helper
    const [name, domain] = email.split('@');
    const emailMasked = name.length <= 2 
      ? `${name[0]}**@${domain}`
      : `${name.substring(0, 2)}***${name.charAt(name.length - 1)}@${domain}`;

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Save code to localStorage
    const codes = JSON.parse(localStorage.getItem('bora_impactar_verification_codes') || '{}');
    codes[orgId] = { code, expires: Date.now() + 15 * 60 * 1000 }; // 15 mins
    localStorage.setItem('bora_impactar_verification_codes', JSON.stringify(codes));

    // Console output for easy debugging/testing
    console.log(`[BORA IMPACTAR] Código de verificação para ${org.name}: ${code}`);
    
    // Trigger window.alert to show the code in browser for simulation
    if (typeof window !== 'undefined') {
      window.alert(`[Simulação] Um código de verificação foi gerado para o e-mail ${emailMasked}.\nUse o código: ${code}`);
    }

    return { success: true, code, emailMasked };
  },

  /**
   * Registers new credentials after code validation.
   */
  registerCredentials(orgId: string, login: string, passwordPlain: string, code: string): { success: boolean; error?: string } {
    // Validate verification code
    const codes = JSON.parse(localStorage.getItem('bora_impactar_verification_codes') || '{}');
    const record = codes[orgId];
    if (!record || record.code !== code || record.expires < Date.now()) {
      return { success: false, error: 'Código de verificação inválido ou expirado.' };
    }

    // Clear verification code after use
    delete codes[orgId];
    localStorage.setItem('bora_impactar_verification_codes', JSON.stringify(codes));

    const orgs = this.getOrganizations();
    const org = orgs.find(o => o.id === orgId);
    if (!org) {
      return { success: false, error: 'Organização correspondente não encontrada.' };
    }

    const credentials = this.getCredentials();
    // Remove if already exists
    const cleanCredentials = credentials.filter(c => c.organizacaoId !== orgId);
    cleanCredentials.push({
      organizacaoId: orgId,
      login: login.toLowerCase().trim(),
      senhaHash: passwordPlain // Stored in plain text for localStorage simulation
    });
    localStorage.setItem('bora_impactar_credentials', JSON.stringify(cleanCredentials));

    return { success: true };
  },

  /**
   * Registers new credentials directly for a brand new organization.
   */
  registerNewCredentials(orgId: string, login: string, passwordPlain: string): { success: boolean; error?: string } {
    const credentials = this.getCredentials();
    const cleanCredentials = credentials.filter(c => c.organizacaoId !== orgId);
    cleanCredentials.push({
      organizacaoId: orgId,
      login: login.toLowerCase().trim(),
      senhaHash: passwordPlain
    });
    localStorage.setItem('bora_impactar_credentials', JSON.stringify(cleanCredentials));
    return { success: true };
  },

  /**
   * Deletes credentials for a given organization (admin action).
   */
  deleteCredentials(orgId: string): { success: boolean; error?: string } {
    const credentials = this.getCredentials();
    const filtered = credentials.filter(c => c.organizacaoId !== orgId);
    if (filtered.length === credentials.length) {
      return { success: false, error: 'Credencial não encontrada.' };
    }
    localStorage.setItem('bora_impactar_credentials', JSON.stringify(filtered));
    return { success: true };
  },

  /**
   * Updates the password for an existing credential (admin action).
   */
  updateCredentialPassword(orgId: string, newPassword: string): { success: boolean; error?: string } {
    const credentials = this.getCredentials();
    const index = credentials.findIndex(c => c.organizacaoId === orgId);
    if (index === -1) {
      return { success: false, error: 'Credencial não encontrada para esta organização.' };
    }
    credentials[index].senhaHash = newPassword;
    localStorage.setItem('bora_impactar_credentials', JSON.stringify(credentials));
    return { success: true };
  },

  /**
   * Log in an organization using credentials or the default password.
   */
  login(loginIdentifier: string, passwordPlain: string): { success: boolean; token?: string; organization?: any; error?: string } {
    const cleanInput = loginIdentifier.replace(/\D/g, '').trim();
    const inputLower = loginIdentifier.toLowerCase().trim();

    const credentials = this.getCredentials();
    const orgs = this.getOrganizations();

    // 1. Search in credentials table first
    const credential = credentials.find(c => {
      const org = orgs.find(o => o.id === c.organizacaoId);
      if (!org) return false;
      
      const cleanOrgCnpj = (org.cnpj || '').replace(/\D/g, '');
      const orgEmailLower = (org.email || '').toLowerCase().trim();

      // Matches input login directly, or CNPJ, or Email
      return c.login === inputLower || 
             (cleanInput && cleanOrgCnpj === cleanInput) || 
             (orgEmailLower && orgEmailLower === inputLower);
    });

    if (credential) {
      if (credential.senhaHash === passwordPlain) {
        const org = orgs.find(o => o.id === credential.organizacaoId);
        return {
          success: true,
          token: `mock_token_${credential.organizacaoId}_${Date.now()}`,
          organization: org
        };
      } else {
        return { success: false, error: 'Senha incorreta.' };
      }
    }

    // No fallback — only admin-created credentials are valid
    return { success: false, error: 'Credencial não encontrada. Solicite seu acesso ao administrador do sistema.' };
  }
};
