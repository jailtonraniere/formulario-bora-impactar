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
    localStorage.setItem(STORAGE_KEY, JSON.stringify(Object.values(privateData)));
  }
};
