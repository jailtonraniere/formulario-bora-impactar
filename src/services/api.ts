/**
 * Frontend API Service client — Bora Impactar
 * 
 * Communicates with the Google Apps Script Web App.
 * Handles automatic fallback to local simulation mode if no API URL is configured.
 */

import { OrganizationData, FormStatus } from '../types';
import { storageService } from './storage';
import publicSearchData from '../data/organizations-search.public.json';

const API_BASE_URL = ((import.meta as any).env?.VITE_API_BASE_URL || '').trim();

export interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  error: {
    code: string;
    message: string;
  } | null;
}

/**
 * Checks if the API is configured.
 */
export const isApiConfigured = (): boolean => {
  return API_BASE_URL !== '';
};

/**
 * General helper to execute POST requests to Apps Script Web App.
 */
async function callApi<T>(action: string, payload: any = {}): Promise<ApiResponse<T>> {
  if (!isApiConfigured()) {
    throw new Error('API Base URL is not configured. Falling back to simulation.');
  }

  try {
    const response = await fetch(API_BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      mode: 'cors',
      body: JSON.stringify({
        action,
        ...payload,
      }),
    });

    if (!response.ok) {
      return {
        success: false,
        data: null,
        error: {
          code: 'HTTP_ERROR',
          message: `Network response failed with status ${response.status}`,
        },
      };
    }

    const json = await response.json();
    return json as ApiResponse<T>;
  } catch (err: any) {
    console.error(`API Call failed for action: ${action}`, err);
    return {
      success: false,
      data: null,
      error: {
        code: 'NETWORK_ERROR',
        message: err.message || 'Check your internet connection or backend permissions.',
      },
    };
  }
}

export const apiService = {
  /**
   * Health Check
   */
  async healthCheck(): Promise<ApiResponse<{ status: string; environment: string }>> {
    if (!isApiConfigured()) {
      return { success: true, data: { status: 'SIMULATION_OK', environment: 'development' }, error: null };
    }
    return callApi<{ status: string; environment: string }>('healthCheck');
  },

  /**
   * Fetch standardized lists for selector fields
   */
  async getLists(): Promise<ApiResponse<Record<string, string[]>>> {
    if (!isApiConfigured()) {
      // Simulate lists response
      return {
        success: true,
        data: {
          situacao_formalizacao: ['with_cnpj', 'no_cnpj', 'linked', 'formalizing'],
          natureza_juridica: ['Associação', 'Fundação Privada', 'Cooperativa', 'Organização Social (OS)', 'Coletivo Informal'],
          causas: ['Educação', 'Inclusão Digital', 'Meio Ambiente', 'Cultura', 'Esportes', 'Assistência Social', 'Saúde'],
        },
        error: null,
      };
    }
    return callApi<Record<string, string[]>>('getLists');
  },

  /**
   * Searches organizations by name (Public fields only)
   */
  async searchOrganizations(query: string): Promise<ApiResponse<any[]>> {
    if (!isApiConfigured()) {
      if (!query || query.trim() === '') {
        return { success: true, data: [], error: null };
      }

      const normalizeStr = (str: string) => {
        return (str || '')
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .toLowerCase();
      };

      const normQuery = normalizeStr(query);

      // Filter and score results for relevance sorting
      const matches = publicSearchData
        .map(org => {
          const normName = normalizeStr(org.name);
          const normTrading = normalizeStr(org.tradingName || '');
          
          let score = 0;
          if (normName.startsWith(normQuery) || normTrading.startsWith(normQuery)) {
            score = 10;
          } else if (normName.includes(normQuery) || normTrading.includes(normQuery)) {
            score = 5;
          }

          return { org, score };
        })
        .filter(m => m.score > 0);

      // Sort by relevance score desc, then alphabetically
      matches.sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        return a.org.name.localeCompare(b.org.name);
      });

      const results = matches.map(m => m.org);
      return { success: true, data: results, error: null };
    }
    return callApi<any[]>('searchOrganizations', { query });
  },

  /**
   * Requests a secure token to access/edit an organization
   */
  async requestAccess(organizacaoId: string): Promise<ApiResponse<{ emailMasked: string; developmentToken?: string }>> {
    if (!isApiConfigured()) {
      try {
        const privateOrgsModule = await import('../data/organizations-private.generated.json');
        const privateOrgs = privateOrgsModule.default as Record<string, any>;
        const org = privateOrgs[organizacaoId];

        if (!org) {
          return { success: false, data: null, error: { code: 'NOT_FOUND', message: 'Organização não encontrada.' } };
        }

        const email = org.email || 'contato@entidade.org';
        
        // Safe email masking
        const maskEmail = (emailStr: string) => {
          if (!emailStr || !emailStr.includes('@')) return '';
          const parts = emailStr.split('@');
          const namePart = parts[0];
          const domainPart = parts[1];
          if (namePart.length <= 2) {
            return namePart + '***@' + domainPart;
          }
          return namePart.substring(0, 2) + '*****' + namePart.substring(namePart.length - 1) + '@' + domainPart;
        };
        const masked = maskEmail(email);

        const mockToken = 'mock_tok_' + Math.random().toString(36).substring(2, 15);
        
        // Save draft clone
        const draft = JSON.parse(JSON.stringify(org));
        localStorage.setItem(`bora_draft_${mockToken}`, JSON.stringify({
          organizacao_id: organizacaoId,
          etapa_atual: 1,
          percentual_conclusao: 0,
          dados: draft,
        }));
        
        return {
          success: true,
          data: {
            emailMasked: masked,
            developmentToken: mockToken,
          },
          error: null,
        };
      } catch (err: any) {
        console.error('Failed to load private data dynamically', err);
        return { success: false, data: null, error: { code: 'LOAD_ERROR', message: 'Erro ao carregar dados locais privados.' } };
      }
    }
    return callApi<{ emailMasked: string; developmentToken?: string }>('requestAccess', { organizacao_id: organizacaoId });
  },

  /**
   * Retrieves organization draft using the access token
   */
  async getDraft(token: string): Promise<ApiResponse<{ organizacao_id: string; etapa_atual: number; percentual_conclusao: number; dados: OrganizationData }>> {
    if (!isApiConfigured()) {
      // Local simulation
      let orgId = '';
      if (token.startsWith('mock_token_')) {
        const parts = token.split('_');
        orgId = parts[2]; // mock_token_ORGID_timestamp -> ORGID
      }

      let draftRaw = localStorage.getItem(`bora_draft_${token}`);

      // If draft not found by token, look up any saved draft for this orgId
      if (!draftRaw && orgId) {
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith('bora_draft_')) {
            try {
              const draftObj = JSON.parse(localStorage.getItem(key) || '');
              if (draftObj.organizacao_id === orgId) {
                draftRaw = localStorage.getItem(key);
                break;
              }
            } catch {}
          }
        }
      }

      // If draft still doesn't exist, create it from the existing organization data
      if (!draftRaw && orgId) {
        const orgs = storageService.getOrganizations();
        const org = orgs.find(o => o.id === orgId);
        if (org) {
          const newDraft = {
            organizacao_id: orgId,
            etapa_atual: 1,
            percentual_conclusao: 0,
            dados: org,
          };
          localStorage.setItem(`bora_draft_${token}`, JSON.stringify(newDraft));
          return { success: true, data: newDraft, error: null };
        }
      }

      if (!draftRaw) {
        return { success: false, data: null, error: { code: 'UNAUTHORIZED', message: 'Token de acesso inválido ou expirado.' } };
      }
      
      return { success: true, data: JSON.parse(draftRaw), error: null };
    }
    return callApi<{ organizacao_id: string; etapa_atual: number; percentual_conclusao: number; dados: OrganizationData }>('getDraft', { token });
  },

  /**
   * Saves progress draft to the backend
   */
  async saveDraft(token: string, step: number, percentage: number, data: OrganizationData): Promise<ApiResponse<{ message: string }>> {
    if (!isApiConfigured()) {
      // Local simulation
      let orgId = data.id || 'BI-TEMP';
      if (token.startsWith('mock_token_')) {
        const parts = token.split('_');
        orgId = parts[2] || orgId;
      }
      const draftObj = {
        organizacao_id: orgId,
        etapa_atual: step,
        percentual_conclusao: percentage,
        dados: data,
      };
      localStorage.setItem(`bora_draft_${token}`, JSON.stringify(draftObj));
      // Also update overall client draft
      storageService.saveCurrentDraft(data);
      return { success: true, data: { message: 'Rascunho salvo localmente.' }, error: null };
    }
    return callApi<{ message: string }>('saveDraft', { token, step, percentage, data });
  },

  /**
   * Submits updates for an existing organization.
   */
  async submitExistingOrganizationUpdate(token: string, data: OrganizationData): Promise<ApiResponse<{ protocol: string; message: string }>> {
    if (!isApiConfigured()) {
      // Local simulation
      const protocol = storageService.generateProtocol();
      const submittedOrg: OrganizationData = {
        ...data,
        status: 'Enviado',
        lastUpdated: new Date().toLocaleDateString('pt-BR'),
      };
      
      // Update global list simulator
      storageService.saveOrganizationToList(submittedOrg);
      // Remove mock draft
      localStorage.removeItem(`bora_draft_${token}`);
      storageService.clearCurrentDraft();
      
      return {
        success: true,
        data: {
          protocol,
          message: 'Atualização enviada para homologação com sucesso.',
        },
        error: null,
      };
    }
    return callApi<{ protocol: string; message: string }>('submitExistingOrganizationUpdate', { token, data });
  },

  /**
   * Submits a new organization registration.
   */
  async submitNewOrganization(data: OrganizationData): Promise<ApiResponse<{ protocol: string; message: string }>> {
    if (!isApiConfigured()) {
      // Local simulation
      const protocol = storageService.generateProtocol();
      const submittedOrg: OrganizationData = {
        ...data,
        id: data.id || `BI-TEMP-${Math.floor(1000 + Math.random() * 9000)}`,
        status: 'Enviado',
        lastUpdated: new Date().toLocaleDateString('pt-BR'),
      };
      
      // Save
      storageService.saveOrganizationToList(submittedOrg);
      storageService.clearCurrentDraft();
      
      return {
        success: true,
        data: {
          protocol,
          message: 'Novo cadastro enviado com sucesso para triagem.',
        },
        error: null,
      };
    }
    return callApi<{ protocol: string; message: string }>('submitNewOrganization', { data });
  },

  /**
   * Saves file metadata
   */
  async saveDocumentMetadata(organizacaoId: string, tipoDocumento: string, nomeArquivo: string, linkDrive: string): Promise<ApiResponse<any>> {
    if (!isApiConfigured()) {
      return {
        success: true,
        data: { documento_id: `doc_${Date.now()}`, organizacao_id: organizacaoId, tipo_documento: tipoDocumento, nome_arquivo: nomeArquivo, link_drive: linkDrive },
        error: null,
      };
    }
    return callApi<any>('saveDocumentMetadata', { organizacao_id: organizacaoId, tipo_documento: tipoDocumento, nome_arquivo: nomeArquivo, link_drive: linkDrive });
  },

  /**
   * Logs system events for auditing
   */
  async registerAudit(organizacaoId: string, acao: string, detalhes: string): Promise<ApiResponse<{ message: string }>> {
    if (!isApiConfigured()) {
      console.log(`[AUDIT LOG] OrgId: ${organizacaoId} | Action: ${acao} | Details: ${detalhes}`);
      return { success: true, data: { message: 'Audit logged in console.' }, error: null };
    }
    return callApi<{ message: string }>('registerAudit', { organizacao_id: organizacaoId, acao, detalhes });
  },

  /**
   * Performs login.
   */
  async login(loginIdentifier: string, passwordPlain: string): Promise<ApiResponse<{ token: string; organization: OrganizationData }>> {
    if (!isApiConfigured()) {
      const res = storageService.login(loginIdentifier, passwordPlain);
      if (res.success && res.token && res.organization) {
        return {
          success: true,
          data: { token: res.token, organization: res.organization },
          error: null
        };
      }
      return {
        success: false,
        data: null,
        error: { code: 'AUTH_ERROR', message: res.error || 'Erro de autenticação.' }
      };
    }
    return callApi<{ token: string; organization: OrganizationData }>('login', { login: loginIdentifier, senha: passwordPlain });
  },

  /**
   * Requests a verification code for first access.
   */
  async requestVerificationCode(orgId: string): Promise<ApiResponse<{ emailMasked: string }>> {
    if (!isApiConfigured()) {
      const res = storageService.requestVerificationCode(orgId);
      if (res.success && res.emailMasked) {
        return {
          success: true,
          data: { emailMasked: res.emailMasked },
          error: null
        };
      }
      return {
        success: false,
        data: null,
        error: { code: 'VERIFICATION_ERROR', message: res.error || 'Erro ao enviar código.' }
      };
    }
    return callApi<{ emailMasked: string }>('requestVerificationCode', { organizacao_id: orgId });
  },

  /**
   * Registers/defines password after code verification.
   */
  async registerCredentials(orgId: string, login: string, passwordPlain: string, code: string): Promise<ApiResponse<{ message: string }>> {
    if (!isApiConfigured()) {
      const res = storageService.registerCredentials(orgId, login, passwordPlain, code);
      if (res.success) {
        return {
          success: true,
          data: { message: 'Senha cadastrada com sucesso!' },
          error: null
        };
      }
      return {
        success: false,
        data: null,
        error: { code: 'REGISTRATION_ERROR', message: res.error || 'Erro ao cadastrar credenciais.' }
      };
    }
    return callApi<{ message: string }>('registerCredentials', { organizacao_id: orgId, login, senha: passwordPlain, codigo: code });
  },

  /**
   * Directly registers credentials for a new organization registration.
   */
  async registerNewCredentials(orgId: string, login: string, passwordPlain: string): Promise<ApiResponse<{ message: string }>> {
    if (!isApiConfigured()) {
      const res = storageService.registerNewCredentials(orgId, login, passwordPlain);
      if (res.success) {
        return {
          success: true,
          data: { message: 'Credenciais criadas com sucesso!' },
          error: null
        };
      }
      return {
        success: false,
        data: null,
        error: { code: 'REGISTRATION_ERROR', message: res.error || 'Erro ao criar credenciais.' }
      };
    }
    return callApi<{ message: string }>('registerNewCredentials', { organizacao_id: orgId, login, senha: passwordPlain });
  },

  /**
   * Deletes credentials for an organization (admin action).
   */
  async deleteCredentials(orgId: string): Promise<ApiResponse<{ message: string }>> {
    if (!isApiConfigured()) {
      const res = storageService.deleteCredentials(orgId);
      if (res.success) {
        return {
          success: true,
          data: { message: 'Credencial removida com sucesso!' },
          error: null
        };
      }
      return {
        success: false,
        data: null,
        error: { code: 'DELETE_ERROR', message: res.error || 'Erro ao remover credencial.' }
      };
    }
    return callApi<{ message: string }>('deleteCredentials', { organizacao_id: orgId });
  },

  /**
   * Updates credential password for an organization (admin action).
   */
  async updateCredentialPassword(orgId: string, newPassword: string): Promise<ApiResponse<{ message: string }>> {
    if (!isApiConfigured()) {
      const res = storageService.updateCredentialPassword(orgId, newPassword);
      if (res.success) {
        return {
          success: true,
          data: { message: 'Senha atualizada com sucesso!' },
          error: null
        };
      }
      return {
        success: false,
        data: null,
        error: { code: 'UPDATE_ERROR', message: res.error || 'Erro ao atualizar senha.' }
      };
    }
    return callApi<{ message: string }>('updateCredentialPassword', { organizacao_id: orgId, nova_senha: newPassword });
  }
};
