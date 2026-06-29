/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Building2, Users, FileText, ArrowLeft, CheckCircle2, AlertCircle, Info,
  Search, Filter, ShieldCheck, Download, Trash2, RotateCcw,
  Check, Play, Save, ChevronRight, MapPin, Globe, Award, HelpCircle, MessageSquare,
  LogOut, KeyRound, Lock, Eye, EyeOff, Plus, Pencil, X
} from 'lucide-react';
import { OrganizationData, FormStatus, Opportunity, ImpactResult } from '../types';
import { storageService } from '../services/storage';
import { SDG_DETAILS, EMPTY_ORGANIZATION } from '../data/mockData';
import privateData from '../data/organizations-private.generated.json';

const EXPORT_COLUMNS_MAP = {
  basic: {
    label: 'Dados Básicos',
    columns: [
      { key: 'id', label: 'ID' },
      { key: 'name', label: 'Nome Oficial' },
      { key: 'tradingName', label: 'Nome Fantasia' },
      { key: 'cnpj', label: 'CNPJ' },
      { key: 'formalizationStatus', label: 'Situação Formal' },
      { key: 'foundationYear', label: 'Ano Fundação' },
      { key: 'legalNature', label: 'Natureza Jurídica' },
      { key: 'rpa', label: 'RPA' },
      { key: 'completeness', label: 'Completitude' },
      { key: 'status', label: 'Status' },
      { key: 'lastUpdated', label: 'Última Atualização' }
    ]
  },
  contact: {
    label: 'Contatos e Representantes',
    columns: [
      { key: 'legalRepName', label: 'Representante Legal' },
      { key: 'legalRepRole', label: 'Cargo Representante' },
      { key: 'fillerName', label: 'Preenchido Por' },
      { key: 'fillerRole', label: 'Cargo Preenchedor' },
      { key: 'phone', label: 'Telefone', isPersonal: true },
      { key: 'whatsapp', label: 'WhatsApp', isPersonal: true },
      { key: 'email', label: 'E-mail', isPersonal: true },
      { key: 'website', label: 'Website' },
      { key: 'instagram', label: 'Instagram', isPersonal: true },
      { key: 'facebook', label: 'Facebook' },
      { key: 'linkedin', label: 'LinkedIn' }
    ]
  },
  activity: {
    label: 'Atividades e ODS',
    columns: [
      { key: 'neighborhood', label: 'Bairro de Atuação' },
      { key: 'mainCause', label: 'Causa Principal' },
      { key: 'secondaryCauses', label: 'Causas Secundárias' },
      { key: 'audiences', label: 'Públicos-Alvo' },
      { key: 'ageRanges', label: 'Faixas Etárias' },
      { key: 'monthlyAverageAttendance', label: 'Média de Atendimento Mensal' },
      { key: 'servedLast12Months', label: 'Pessoas Atendidas (12 Meses)' },
      { key: 'totalAttendancesLast12Months', label: 'Acolhimentos Feitos' },
      { key: 'indicatorStatus', label: 'Controle de Indicadores' },
      { key: 'selectedOdsList', label: 'ODS Selecionadas' },
      { key: 'priorityOdsList', label: 'ODS Prioritárias' }
    ]
  },
  finance: {
    label: 'Dados Financeiros e Termos',
    columns: [
      { key: 'annualBudgetRange', label: 'Faixa de Orçamento Anual' },
      { key: 'revenueSources', label: 'Fontes de Receita' },
      { key: 'hasInstitutionalBankInstAccount', label: 'Tem Conta Institucional' },
      { key: 'consentCatalogPublishing', label: 'Permite Publicação no Catálogo' },
      { key: 'photosAuthorization', label: 'Autorização de Uso de Imagens' }
    ]
  }
};

interface AdminPanelProps {
  onBack: () => void;
  organizations: OrganizationData[];
  onRefreshList: () => void;
}

export function AdminPanel({ onBack, organizations, onRefreshList }: AdminPanelProps) {
  // Authentication & Profile states
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [userEmail, setUserEmail] = useState<string>('');
  const [userName, setUserName] = useState<string>('');
  const [userRole, setUserRole] = useState<'admin' | 'analista' | 'consulta'>('admin');
  const [authError, setAuthError] = useState<string>('');
  const [simulatedEmailInput, setSimulatedEmailInput] = useState<string>('');

  // Audit Log State
  interface AuditLog {
    id: string;
    timestamp: string;
    user: string;
    role: string;
    action: string;
    details: string;
    hasPersonalData: boolean;
  }
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);

  // Selected organization IDs for batch export
  const [selectedOrgIds, setSelectedOrgIds] = useState<string[]>([]);

  // Load audit logs on mount
  useEffect(() => {
    const stored = localStorage.getItem('bora_impactar_audit_logs');
    if (stored) {
      try {
        setAuditLogs(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to parse audit logs', e);
      }
    }
  }, []);

  // Helper to add audit logs
  const addAuditLog = (action: string, details: string, hasPersonalData: boolean) => {
    const newLog: AuditLog = {
      id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      timestamp: new Date().toLocaleString('pt-BR'),
      user: userName || userEmail || 'Simulador',
      role: userRole,
      action,
      details,
      hasPersonalData
    };
    setAuditLogs(prev => {
      const updated = [newLog, ...prev];
      localStorage.setItem('bora_impactar_audit_logs', JSON.stringify(updated));
      return updated;
    });
  };

  const googleClientId = ((import.meta as any).env?.VITE_GOOGLE_CLIENT_ID || '').trim();

  // JWT Decoder helper
  const decodeJwt = (token: string) => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (e) {
      return null;
    }
  };

  // Common validator and profile mapper
  const validateAndLogin = (email: string, name: string) => {
    const emailLower = email.toLowerCase().trim();
    
    // Lista de administradores autorizados
    const authorizedAdmins = [
      'jailtonraniere@recife.pe.gov.br',
      'bianca.carvalho@recife.pe.gov.br',
      'carlos.gestao@recife.pe.gov.br',
      'maria.gestao@recife.pe.gov.br',
      'joao.gestao@recife.pe.gov.br',
      'jailton.raniere@gmail.com'
    ];
    
    const isAuthorized = authorizedAdmins.includes(emailLower);

    if (!isAuthorized) {
      setAuthError('Acesso negado. Apenas usuários administradores previamente autorizados têm acesso ao sistema de gestão.');
      return;
    }

    // Role mapping based on email keywords/lists (All users are admins)
    const role: 'admin' | 'analista' | 'consulta' = 'admin';

    setUserEmail(email);
    setUserName(name);
    setUserRole(role);
    setIsAuthenticated(true);
    setAuthError('');

    // Write to audit log
    const userDisplay = name || email;
    const newLog: AuditLog = {
      id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      timestamp: new Date().toLocaleString('pt-BR'),
      user: userDisplay,
      role: role,
      action: 'Login',
      details: `Login efetuado com perfil ${role.toUpperCase()}`,
      hasPersonalData: false
    };
    setAuditLogs(prev => {
      const updated = [newLog, ...prev];
      localStorage.setItem('bora_impactar_audit_logs', JSON.stringify(updated));
      return updated;
    });
  };

  // Google Login response handler
  const handleGoogleLoginResponse = (response: any) => {
    try {
      const user = decodeJwt(response.credential);
      if (user && user.email) {
        validateAndLogin(user.email, user.name || user.email);
      } else {
        setAuthError('Falha ao decodificar dados de autenticação do Google.');
      }
    } catch (err) {
      setAuthError('Erro no fluxo de autenticação do Google.');
    }
  };

  // Initialize Google Sign-In SDK
  useEffect(() => {
    const g = (window as any).google;
    if (googleClientId && g && !isAuthenticated) {
      try {
        g.accounts.id.initialize({
          client_id: googleClientId,
          callback: handleGoogleLoginResponse,
        });
        g.accounts.id.renderButton(
          document.getElementById('google-signin-btn-container'),
          { theme: 'outline', size: 'large', width: 280 }
        );
      } catch (err) {
        console.error('Failed to initialize Google Sign-In SDK', err);
      }
    }
  }, [googleClientId, isAuthenticated]);

  // Handle mock login submit
  const handleSimulatedSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!simulatedEmailInput) {
      setAuthError('Por favor, informe seu e-mail corporativo.');
      return;
    }
    const email = simulatedEmailInput.trim();
    const name = email.split('@')[0].replace('.', ' ');
    validateAndLogin(email, name);
  };

  const handleLogout = () => {
    const logoutMsg = {
      id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      timestamp: new Date().toLocaleString('pt-BR'),
      user: userName || userEmail || 'Simulador',
      role: userRole,
      action: 'Logout',
      details: 'Sessão encerrada pelo usuário',
      hasPersonalData: false
    };
    setAuditLogs(prev => {
      const updated = [logoutMsg, ...prev];
      localStorage.setItem('bora_impactar_audit_logs', JSON.stringify(updated));
      return updated;
    });

    setIsAuthenticated(false);
    setUserEmail('');
    setUserName('');
    setUserRole('admin');
    setSimulatedEmailInput('');
    setSelectedOrg(null);
    setSelectedOrgIds([]);
    setActiveTab('listings');
  };

  // Export Modal Configuration states
  const [isExportModalOpen, setIsExportModalOpen] = useState<boolean>(false);
  const [exportSeparator, setExportSeparator] = useState<';' | ','>(';');
  const [exportScope, setExportScope] = useState<'all' | 'filtered' | 'selected'>('all');
  const [exportFormat, setExportFormat] = useState<'csv' | 'xlsx'>('xlsx');
  const [selectedCategories, setSelectedCategories] = useState<string[]>(['basic', 'contact', 'activity', 'finance']);

  // Active view states inside dashboard
  const [activeTab, setActiveTab] = useState<'listings' | 'analytics' | 'opportunities' | 'audit' | 'credentials'>('listings');

  // Credential management states
  const [credentialsList, setCredentialsList] = useState<any[]>([]);
  const [showCredForm, setShowCredForm] = useState(false);
  const [credFormOrgId, setCredFormOrgId] = useState('');
  const [credFormLogin, setCredFormLogin] = useState('');
  const [credFormPassword, setCredFormPassword] = useState('');
  const [credFormShowPwd, setCredFormShowPwd] = useState(false);
  const [credFormError, setCredFormError] = useState<string | null>(null);
  const [credFormSuccess, setCredFormSuccess] = useState<string | null>(null);
  const [credEditingOrgId, setCredEditingOrgId] = useState<string | null>(null);
  const [credEditPassword, setCredEditPassword] = useState('');
  const [credSearchTerm, setCredSearchTerm] = useState('');
  const [credFormIsPreRegister, setCredFormIsPreRegister] = useState(false);
  const [credFormNewOrgName, setCredFormNewOrgName] = useState('');

  // Load credentials whenever the tab is shown
  useEffect(() => {
    if (activeTab === 'credentials') {
      setCredentialsList(storageService.getCredentials());
    }
  }, [activeTab]);

  const refreshCredentials = () => {
    setCredentialsList(storageService.getCredentials());
  };

  const handleCreateCredential = () => {
    setCredFormError(null);
    setCredFormSuccess(null);

    let orgId = '';
    let orgName = '';

    if (credFormIsPreRegister) {
      if (!credFormNewOrgName.trim()) {
        setCredFormError('Informe o nome da nova organização.');
        return;
      }
      orgName = credFormNewOrgName.trim();
      orgId = `org_pre_${Date.now()}`;
    } else {
      if (!credFormOrgId) {
        setCredFormError('Selecione uma organização.');
        return;
      }
      orgId = credFormOrgId;
      const org = organizations.find(o => o.id === orgId);
      orgName = org?.name || orgId;
    }

    if (!credFormLogin.trim()) {
      setCredFormError('Informe o login.');
      return;
    }
    if (!credFormPassword || credFormPassword.length < 4) {
      setCredFormError('A senha precisa ter no mínimo 4 caracteres.');
      return;
    }

    // Check if login is already used
    const loginLower = credFormLogin.toLowerCase().trim();
    if (credentialsList.some(c => c.login === loginLower)) {
      setCredFormError('Este login já está cadastrado para outra organização.');
      return;
    }

    // Check if already exists for this org
    if (!credFormIsPreRegister) {
      const existing = credentialsList.find(c => c.organizacaoId === orgId);
      if (existing) {
        setCredFormError('Já existe uma credencial para esta organização. Edite ou remova a existente.');
        return;
      }
    }

    // Pre-create the organization in database simulator if selected
    if (credFormIsPreRegister) {
      const newOrg: OrganizationData = {
        ...EMPTY_ORGANIZATION,
        id: orgId,
        name: orgName,
        tradingName: orgName,
        cnpj: loginLower.includes('@') ? '' : loginLower,
        email: loginLower.includes('@') ? loginLower : '',
        status: 'Rascunho',
        lastUpdated: new Date().toLocaleDateString('pt-BR'),
      };
      storageService.saveOrganizationToList(newOrg);
      onRefreshList();
    }

    const res = storageService.registerNewCredentials(orgId, loginLower, credFormPassword);
    if (res.success) {
      addAuditLog('CREDENCIAL_CRIADA', `Credencial criada para: ${orgName} (${credFormIsPreRegister ? 'Nova Org' : 'Existente'})`, false);
      setCredFormSuccess('Credencial criada com sucesso!');
      setCredFormOrgId('');
      setCredFormNewOrgName('');
      setCredFormLogin('');
      setCredFormPassword('');
      setCredFormIsPreRegister(false);
      setShowCredForm(false);
      refreshCredentials();
      setTimeout(() => setCredFormSuccess(null), 3000);
    } else {
      setCredFormError(res.error || 'Erro ao criar credencial.');
    }
  };

  const handleDeleteCredential = (orgId: string) => {
    const org = organizations.find(o => o.id === orgId);
    if (!window.confirm(`Tem certeza que deseja remover a credencial de "${org?.name || orgId}"?`)) return;
    const res = storageService.deleteCredentials(orgId);
    if (res.success) {
      addAuditLog('CREDENCIAL_REMOVIDA', `Credencial removida de: ${org?.name || orgId}`, false);
      
      // If pre-registered organization has not been submitted yet (status is still 'Rascunho'), delete it too
      if (orgId.startsWith('org_pre_') && org && org.status === 'Rascunho') {
        const storedOrgs = storageService.getOrganizations();
        const filteredOrgs = storedOrgs.filter((o: any) => o.id !== orgId);
        localStorage.setItem('bora_impactar_organizations', JSON.stringify(filteredOrgs));
        onRefreshList();
      }

      refreshCredentials();
    }
  };

  const handleUpdatePassword = (orgId: string) => {
    if (!credEditPassword || credEditPassword.length < 4) {
      return;
    }
    const res = storageService.updateCredentialPassword(orgId, credEditPassword);
    if (res.success) {
      const org = organizations.find(o => o.id === orgId);
      addAuditLog('SENHA_ALTERADA', `Senha alterada para: ${org?.name || orgId}`, false);
      setCredEditingOrgId(null);
      setCredEditPassword('');
      refreshCredentials();
    }
  };
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [formalizationFilter, setFormalizationFilter] = useState<string>('ALL');
  const [causeFilter, setCauseFilter] = useState<string>('ALL');
  const [freshnessFilter, setFreshnessFilter] = useState<string>('ALL');

  // Selected organization for details drawer
  const [selectedOrg, setSelectedOrg] = useState<OrganizationData | null>(null);
  
  // Evaluation workflow states
  const [evaluationStatus, setEvaluationStatus] = useState<FormStatus>('Em análise');
  const [evaluationFeedback, setEvaluationFeedback] = useState<string>('');
  const [evaluationInternalNotes, setEvaluationInternalNotes] = useState<string>('');
  const [saveSuccessBlock, setSaveSuccessBlock] = useState<boolean>(false);


  // Helper calculation for overall completion metrics of an organization
  const getCompletenessPercent = (org: OrganizationData): number => {
    const isStringFilled = (val: string | undefined | null) => !!val && val.trim() !== '';
    const isArrayFilled = (val: any[] | undefined | null) => Array.isArray(val) && val.length > 0;
    const isDefined = (val: any) => val !== undefined && val !== null && val !== '';

    let total = 0;
    let filled = 0;

    // We take a robust representation of key indicator fields across all 10 steps
    const fields: boolean[] = [
      isStringFilled(org.name),
      isStringFilled(org.tradingName),
      isStringFilled(org.formalizationStatus),
      isStringFilled(org.foundationYear),
      isStringFilled(org.cep),
      isStringFilled(org.neighborhood),
      isStringFilled(org.street),
      isStringFilled(org.number),
      isStringFilled(org.operatingHours),
      isStringFilled(org.legalRepName),
      isStringFilled(org.legalRepRole),
      isStringFilled(org.fillerName),
      isStringFilled(org.fillerRole),
      isStringFilled(org.phone),
      isStringFilled(org.email),
      isStringFilled(org.mainCause),
      isStringFilled(org.history),
      isStringFilled(org.mission),
      isStringFilled(org.socialProblem),
      isStringFilled(org.differentiator),
      isStringFilled(org.mainActivities),
      isArrayFilled(org.audiences),
      isArrayFilled(org.ageRanges),
      isStringFilled(org.monthlyAverageAttendance),
      isStringFilled(org.servedLast12Months),
      isStringFilled(org.totalAttendancesLast12Months),
      isStringFilled(org.mainResultsSummary),
      isArrayFilled(org.selectedOdsList),
      isStringFilled(org.annualBudgetRange),
      isArrayFilled(org.revenueSources),
      isDefined(org.hasInstitutionalBankInstAccount),
      isDefined(org.photosAuthorization),
      isDefined(org.consentCatalogPublishing)
    ];

    total = fields.length;
    filled = fields.filter(x => x).length;

    return total > 0 ? Math.round((filled / total) * 100) : 0;
  };

  const maskPhone = (phone: string) => {
    if (!phone) return '-';
    if (phone.length <= 4) return '****';
    return phone.substring(0, phone.length - 4) + '****';
  };

  const maskEmail = (emailStr: string) => {
    if (!emailStr || !emailStr.includes('@')) return '-';
    const parts = emailStr.split('@');
    const namePart = parts[0];
    const domainPart = parts[1];
    if (namePart.length <= 2) {
      return namePart + '***@' + domainPart;
    }
    return namePart.substring(0, 2) + '*****' + namePart.substring(namePart.length - 1) + '@' + domainPart;
  };

  const renderContactField = (value: string | undefined, _permission: 'internal' | 'partners' | 'public' | undefined, _isEmail: boolean = false) => {
    if (!value) return '-';
    return value;
  };

  // Status badging styles
  const getStatusBadgeStyles = (status: FormStatus) => {
    const defaultColor = 'bg-slate-100 text-slate-700 border-slate-200';
    const mapper: Record<FormStatus, string> = {
      'Rascunho': 'bg-slate-100 text-slate-500 border-slate-200',
      'Enviado': 'bg-sky-50 text-sky-700 border-sky-100',
      'Em análise': 'bg-amber-50 text-amber-700 border-amber-200',
      'Ajustes solicitados': 'bg-pink-50 text-pink-700 border-pink-200 animate-pulse',
      'Reenviado': 'bg-indigo-50 text-indigo-700 border-indigo-200',
      'Aprovado': 'bg-emerald-50 text-emerald-700 border-emerald-200',
      'Rejeitado': 'bg-rose-50 text-rose-700 border-rose-200',
      'Publicado': 'bg-teal-50 text-teal-700 border-teal-200',
      'Temporariamente oculto': 'bg-amber-100/50 text-amber-800 border-amber-200',
      'Arquivado': 'bg-gray-200 text-gray-700 border-gray-300'
    };
    return mapper[status] || defaultColor;
  };

  // Quick statistics
  const totalSubmissions = organizations.length;
  const submissionsEnviado = organizations.filter(o => o.status === 'Enviado' || o.status === 'Reenviado').length;
  const submissionsAnalyzing = organizations.filter(o => o.status === 'Em análise').length;
  const submissionsApproved = organizations.filter(o => o.status === 'Aprovado' || o.status === 'Publicado').length;
  const submissionsDrafts = organizations.filter(o => o.status === 'Rascunho' || !o.status).length;

  // Average completeness across all databases
  const overallCompletitudes = organizations.map(o => getCompletenessPercent(o));
  const avgCompleteness = overallCompletitudes.length > 0 
    ? Math.round(overallCompletitudes.reduce((a, b) => a + b, 0) / overallCompletitudes.length) 
    : 0;

  // Sum of total people served in 12 months (where field is standard numeric)
  const totalServedSum = organizations.reduce((acc, curr) => {
    const val = parseInt(curr.servedLast12Months?.replace(/\D/g, '') || '0', 10);
    return acc + (isNaN(val) ? 0 : val);
  }, 0);

  // Total investment opportunities posted
  const totalOpportsCount = organizations.reduce((acc, curr) => {
    return acc + (curr.corporateOpportunitiesList?.length || 0);
  }, 0);

  // Helper to compute freshness of a record
  const checkFreshness = (dateStr?: string) => {
    if (!dateStr) {
      return {
        isOutdated: true,
        days: 9999,
        label: 'Sem data',
        badgeClass: 'bg-rose-50 text-rose-700 border-rose-200',
        textClass: 'text-rose-600 font-bold',
        daysLabel: 'Crítico (Sem data)',
        icon: 'critical'
      };
    }

    try {
      const parts = dateStr.split('/');
      if (parts.length === 3) {
        const day = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1;
        const year = parseInt(parts[2], 10);
        const updateDate = new Date(year, month, day);
        // Current local time referenced: June 7, 2026
        const refDate = new Date(2026, 5, 7);
        const diffMs = refDate.getTime() - updateDate.getTime();
        const diffDays = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
        
        const isOutdated = diffDays > 90;

        let daysLabel = `${diffDays} dias atrás`;
        if (diffDays === 0) daysLabel = 'Hoje';
        else if (diffDays === 1) daysLabel = 'Ontem';
        else if (diffDays > 30) {
          const months = Math.floor(diffDays / 30);
          daysLabel = months === 1 ? '1 mês atrás' : `Há ${months} meses`;
        }

        return {
          isOutdated,
          days: diffDays,
          label: dateStr,
          badgeClass: isOutdated
            ? 'bg-amber-50 text-amber-700 border-amber-200'
            : 'bg-emerald-50 text-emerald-800 border-emerald-200',
          textClass: isOutdated ? 'text-amber-600' : 'text-emerald-700',
          daysLabel,
          icon: isOutdated ? 'warning' : 'ok'
        };
      }
    } catch (_) {}

    return {
      isOutdated: false,
      days: 0,
      label: dateStr,
      badgeClass: 'bg-slate-50 text-slate-500 border-slate-200',
      textClass: 'text-slate-500',
      daysLabel: '',
      icon: 'unknown'
    };
  };

  // Filter logic
  const filteredOrganizations = organizations.filter(org => {
    // Search query matching
    const matchSearch = searchQuery.trim() === '' || 
      org.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      org.tradingName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      org.cnpj.replace(/\D/g, '').includes(searchQuery.replace(/\D/g, '')) ||
      (org.neighborhood && org.neighborhood.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (org.legalRepName && org.legalRepName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (org.mainCause && org.mainCause.toLowerCase().includes(searchQuery.toLowerCase()));

    // Status filter matching
    let matchStatus = true;
    if (statusFilter !== 'ALL') {
      if (statusFilter === 'PENDING_REVIEW') {
        matchStatus = ['Enviado', 'Reenviado', 'Em análise'].includes(org.status);
      } else {
        matchStatus = org.status === statusFilter;
      }
    }

    // Formalization filter matching
    let matchFormal = true;
    if (formalizationFilter !== 'ALL') {
      matchFormal = org.formalizationStatus === formalizationFilter;
    }

    // Cause filter matching
    let matchCause = true;
    if (causeFilter !== 'ALL') {
      const orgCauses = org.mainCause ? org.mainCause.split(', ').map(c => c.trim()) : [];
      matchCause = orgCauses.includes(causeFilter);
    }

    // Freshness filter matching
    let matchFreshness = true;
    if (freshnessFilter !== 'ALL') {
      const freshness = checkFreshness(org.lastUpdated);
      if (freshnessFilter === 'OUTDATED') {
        matchFreshness = freshness.isOutdated;
      } else if (freshnessFilter === 'RECENT') {
        matchFreshness = !freshness.isOutdated && freshness.days !== 9999;
      } else if (freshnessFilter === 'NEVER') {
        matchFreshness = freshness.days === 9999;
      }
    }

    return matchSearch && matchStatus && matchFormal && matchCause && matchFreshness;
  });

  // Extract unique causes for filter dropdown
  const uniqueCauses = Array.from(new Set(
    organizations.flatMap(o => o.mainCause ? o.mainCause.split(', ').map(c => c.trim()) : []).filter(Boolean)
  ));

  // Select an organization for side panel detailed viewing
  const handleSelectOrgDetails = (org: OrganizationData) => {
    setSelectedOrg(org);
    setEvaluationStatus(org.status || 'Em análise');
    setEvaluationFeedback((org as any).evaluationFeedback || '');
    setEvaluationInternalNotes((org as any).evaluationInternalNotes || 'Entidade com cadastro preenchido de forma consistente sob conformidade dos ODS.');
    setSaveSuccessBlock(false);

    // Write visual audit log entry
    addAuditLog(
      'Visualização de Ficha',
      `Visualização da ficha detalhada de "${org.name}" (CNPJ: ${org.cnpj || 'Coletivo'})`,
      userRole === 'admin'
    );
  };

  // Post update to database list
  const handleSaveEvaluation = () => {
    if (!selectedOrg) return;
    
    // Create new organization copy with updated settings
    const updated: OrganizationData = {
      ...selectedOrg,
      status: evaluationStatus,
      lastUpdated: new Date().toLocaleDateString('pt-BR'),
      evaluationFeedback,
      evaluationInternalNotes
    } as any;

    storageService.saveOrganizationToList(updated);
    
    // Re-sync locally
    setSelectedOrg(updated);
    setSaveSuccessBlock(true);
    onRefreshList();

    // Write visual audit log entry
    addAuditLog(
      'Alteração de Status',
      `Alterado status de "${selectedOrg.name}" para "${evaluationStatus}". Mensagem de ajuste: "${evaluationFeedback || 'Nenhuma'}". Notas internas: "${evaluationInternalNotes || 'Nenhuma'}"`,
      false
    );

    setTimeout(() => {
      setSaveSuccessBlock(false);
    }, 2500);
  };

  const handleToggleSelectAll = () => {
    const visibleIds = filteredOrganizations.map(o => o.id).filter(Boolean) as string[];
    if (visibleIds.length === 0) return;
    const allSelected = visibleIds.every(id => selectedOrgIds.includes(id));
    if (allSelected) {
      setSelectedOrgIds(prev => prev.filter(id => !visibleIds.includes(id)));
    } else {
      setSelectedOrgIds(prev => Array.from(new Set([...prev, ...visibleIds])));
    }
  };

  const renderContactValueOnly = (value: string | undefined, _permission: 'internal' | 'partners' | 'public' | undefined, _isEmail: boolean = false): string => {
    if (!value) return '-';
    return value;
  };

  const getChangedFields = (org: OrganizationData) => {
    const original = (privateData as any)[org.id || ''];
    if (!original) return null;

    const fieldsToCompare = [
      { key: 'name', label: 'Nome Oficial' },
      { key: 'tradingName', label: 'Nome Fantasia' },
      { key: 'cnpj', label: 'CNPJ' },
      { key: 'formalizationStatus', label: 'Situação Formal', format: (v: string) => {
          if (v === 'with_cnpj') return 'Com CNPJ próprio';
          if (v === 'no_cnpj') return 'Sem CNPJ (Coletivo)';
          if (v === 'linked') return 'Vinculado a parceira';
          if (v === 'formalizing') return 'Em formalização';
          return v || '-';
        }
      },
      { key: 'cep', label: 'CEP' },
      { key: 'neighborhood', label: 'Bairro' },
      { key: 'street', label: 'Rua' },
      { key: 'number', label: 'Número' },
      { key: 'operatingHours', label: 'Horário de Funcionamento' },
      { key: 'legalRepName', label: 'Representante Legal' },
      { key: 'phone', label: 'Telefone', isContact: true, isEmail: false },
      { key: 'whatsapp', label: 'WhatsApp', isContact: true, isEmail: false },
      { key: 'email', label: 'E-mail', isContact: true, isEmail: true },
      { key: 'mainCause', label: 'Causa Principal' },
      { key: 'annualBudgetRange', label: 'Faixa de Orçamento' }
    ];

    const changes: { label: string; originalVal: string; newVal: string; hasChanged: boolean }[] = [];

    fieldsToCompare.forEach(({ key, label, format, isContact, isEmail }) => {
      let rawOrig = original[key];
      let rawNew = org[key as keyof typeof org];

      if (Array.isArray(rawOrig)) rawOrig = rawOrig.join(', ');
      if (Array.isArray(rawNew)) rawNew = rawNew.join(', ');

      let origStr = String(rawOrig || '').trim();
      let newStr = String(rawNew || '').trim();

      if (format) {
        origStr = format(origStr);
        newStr = format(newStr);
      }

      const hasChanged = origStr !== newStr;

      let displayOrig = origStr;
      let displayNew = newStr;
      if (isContact) {
        const permKey = `${key}Permission`;
        const origPerm = original[permKey];
        const newPerm = org[permKey as keyof typeof org];

        displayOrig = renderContactValueOnly(origStr, origPerm, isEmail || false);
        displayNew = renderContactValueOnly(newStr, newPerm as any, isEmail || false);
      }

      changes.push({
        label,
        originalVal: displayOrig || '(vazio)',
        newVal: displayNew || '(vazio)',
        hasChanged
      });
    });

    return changes;
  };

  const generateExcelXLSX = (headers: string[], rows: string[][], filename: string) => {
    const tableHtml = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta charset="utf-8" />
        <!--[if gte mso 9]>
        <xml>
          <x:ExcelWorkbook>
            <x:ExcelWorksheets>
              <x:ExcelWorksheet>
                <x:Name>Bora Impactar</x:Name>
                <x:WorksheetOptions>
                  <x:DisplayGridlines/>
                </x:WorksheetOptions>
              </x:ExcelWorksheet>
            </x:ExcelWorksheets>
          </x:ExcelWorkbook>
        </xml>
        <![endif]-->
        <style>
          table { border-collapse: collapse; font-family: sans-serif; font-size: 11px; }
          th { background-color: #0d3b66; color: #ffffff; font-weight: bold; border: 1px solid #cccccc; padding: 6px; }
          td { border: 1px solid #cccccc; padding: 6px; }
          .text { mso-number-format:"\\@"; }
        </style>
      </head>
      <body>
        <table>
          <thead>
            <tr>
              ${headers.map(h => `<th>${h}</th>`).join('')}
            </tr>
          </thead>
          <tbody>
            ${rows.map(row => `
              <tr>
                ${row.map(cell => `<td class="text">${cell}</td>`).join('')}
              </tr>
            `).join('')}
          </tbody>
        </table>
      </body>
      </html>
    `;

    const blob = new Blob([tableHtml], { type: 'application/vnd.ms-excel;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const generateCSV = (headers: string[], rows: string[][], separator: ';' | ',', filename: string) => {
    const escapeAndQuote = (val: string) => {
      const valStr = val === undefined || val === null ? '' : String(val);
      const escaped = valStr.replace(/"/g, '""');
      return `"${escaped}"`;
    };

    const csvContent = "\uFEFF" 
      + [headers.map(escapeAndQuote).join(separator), ...rows.map(row => row.map(escapeAndQuote).join(separator))].join('\r\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleExportIndividualFicha = (org: OrganizationData, format: 'csv' | 'xlsx') => {
    const headers = ['Campo', 'Valor Atualizado', 'Valor Original (Se houver)'];
    const original = (privateData as any)[org.id || ''] || {};
    
    const rows: string[][] = [];
    
    const addRow = (label: string, key: string, formatFn?: (v: any) => string, isPersonal: boolean = false, isEmail: boolean = false) => {
      let rawOrig = original[key];
      let rawNew = org[key as keyof typeof org];
      
      if (Array.isArray(rawOrig)) rawOrig = rawOrig.join(', ');
      if (Array.isArray(rawNew)) rawNew = rawNew.join(', ');
      
      let origStr = String(rawOrig || '').trim();
      let newStr = String(rawNew || '').trim();
      
      if (formatFn) {
        origStr = formatFn(origStr);
        newStr = formatFn(newStr);
      }
      
      let displayOrig = origStr;
      let displayNew = newStr;
      
      if (isPersonal) {
        const permKey = `${key}Permission`;
        const origPerm = original[permKey];
        const newPerm = org[permKey as keyof typeof org];
        
        displayOrig = renderContactValueOnly(origStr, origPerm, isEmail);
        displayNew = renderContactValueOnly(newStr, newPerm as any, isEmail);
      }
      
      rows.push([label, displayNew || '(vazio)', displayOrig || '(vazio)']);
    };
    
    addRow('ID da Iniciativa', 'id');
    addRow('Nome Oficial', 'name');
    addRow('Nome Fantasia', 'tradingName');
    addRow('CNPJ', 'cnpj');
    addRow('Situação Formal', 'formalizationStatus', (v) => {
      if (v === 'with_cnpj') return 'Com CNPJ próprio';
      if (v === 'no_cnpj') return 'Sem CNPJ (Coletivo)';
      if (v === 'linked') return 'Vinculado a parceira';
      if (v === 'formalizing') return 'Em formalização';
      return v || '-';
    });
    addRow('Ano Fundação', 'foundationYear');
    addRow('Natureza Jurídica', 'legalNature');
    addRow('CEP', 'cep');
    addRow('Rua', 'street');
    addRow('Número', 'number');
    addRow('Bairro', 'neighborhood');
    addRow('RPA', 'rpa');
    addRow('Horário de Funcionamento', 'operatingHours');
    addRow('Representante Legal', 'legalRepName');
    addRow('Cargo do Representante', 'legalRepRole');
    addRow('Preenchido Por', 'fillerName');
    addRow('Cargo do Preenchedor', 'fillerRole');
    addRow('Telefone', 'phone', undefined, true, false);
    addRow('WhatsApp', 'whatsapp', undefined, true, false);
    addRow('E-mail', 'email', undefined, true, true);
    addRow('Website', 'website');
    addRow('Instagram', 'instagram', undefined, true, false);
    addRow('Causa Principal', 'mainCause');
    addRow('Causas Secundárias', 'secondaryCauses');
    addRow('Públicos-Alvo', 'audiences');
    addRow('Faixas Etárias', 'ageRanges');
    addRow('Média de Atendidos Mensal', 'monthlyAverageAttendance');
    addRow('Pessoas Atendidas (12 Meses)', 'servedLast12Months');
    addRow('Acolhimentos Realizados', 'totalAttendancesLast12Months');
    addRow('Status do Cadastro', 'status');
    addRow('Última Atualização', 'lastUpdated');
    
    const filename = `ficha_${org.name.toLowerCase().replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.${format}`;
    const containsPersonal = userRole === 'admin';
    
    if (format === 'xlsx') {
      generateExcelXLSX(headers, rows, filename);
    } else {
      generateCSV(headers, rows, ';', filename);
    }
    
    addAuditLog(
      'Exportação', 
      `Ficha Individual exportada em ${format.toUpperCase()}. Iniciativa: "${org.name}". Contém dados pessoais em claro: ${containsPersonal ? 'Sim' : 'Não'}`, 
      containsPersonal
    );
  };

  const handleExportData = () => {
    let listToExport = organizations;
    if (exportScope === 'filtered') {
      listToExport = filteredOrganizations;
    } else if (exportScope === 'selected') {
      listToExport = organizations.filter(o => selectedOrgIds.includes(o.id || ''));
    }

    if (listToExport.length === 0) {
      alert('Nenhuma organização para exportar.');
      return;
    }

    const columnsToExport: { key: string; label: string; isPersonal?: boolean }[] = [];
    selectedCategories.forEach((catKey) => {
      const category = (EXPORT_COLUMNS_MAP as any)[catKey];
      if (category) {
        columnsToExport.push(...category.columns);
      }
    });

    if (columnsToExport.length === 0) {
      alert('Selecione pelo menos uma categoria de colunas para exportação.');
      return;
    }

    const headers = columnsToExport.map(c => c.label);
    
    const rows = listToExport.map(o => {
      return columnsToExport.map(col => {
        const key = col.key;
        
        if (key === 'completeness') {
          return `${getCompletenessPercent(o)}%`;
        }
        if (key === 'cnpj') {
          return o.cnpj || 'Sem CNPJ (Coletivo)';
        }
        if (key === 'formalizationStatus') {
          const v = o.formalizationStatus;
          if (v === 'with_cnpj') return 'Com CNPJ próprio';
          if (v === 'no_cnpj') return 'Sem CNPJ (Coletivo)';
          if (v === 'linked') return 'Vinculado a parceira';
          if (v === 'formalizing') return 'Em formalização';
          return v || 'Não informado';
        }
        
        let value: any = o[key as keyof typeof o];
        
        if (Array.isArray(value)) {
          if (key === 'selectedOdsList' || key === 'priorityOdsList') {
            value = value.map(ods => ods.toUpperCase().replace('_', ' ')).join(' | ');
          } else {
            value = value.join(' | ');
          }
        } else if (typeof value === 'boolean') {
          value = value ? 'Sim' : 'Não';
        }

        if (col.isPersonal) {
          const isEmail = key === 'email';
          const permKey = `${key}Permission` as keyof typeof o;
          const perm = o[permKey] as any;
          value = renderContactValueOnly(value, perm, isEmail);
        }

        return String(value === undefined || value === null ? '' : value).trim();
      });
    });

    const dateStr = new Date().toISOString().split('T')[0];
    const scopeLabel = exportScope === 'all' ? 'consolidado' : exportScope === 'filtered' ? 'filtrado' : 'selecionado';
    const filename = `bora_impactar_${scopeLabel}_recife_${dateStr}.${exportFormat}`;

    if (exportFormat === 'xlsx') {
      generateExcelXLSX(headers, rows, filename);
    } else {
      generateCSV(headers, rows, exportSeparator, filename);
    }

    const containsPersonalInClear = selectedCategories.includes('contact') && userRole === 'admin';

    const activeFilters = [
      searchQuery ? `Pesquisa: "${searchQuery}"` : null,
      statusFilter !== 'ALL' ? `Status: ${statusFilter}` : null,
      formalizationFilter !== 'ALL' ? `Formalização: ${formalizationFilter}` : null,
      causeFilter !== 'ALL' ? `Causa: ${causeFilter}` : null,
      freshnessFilter !== 'ALL' ? `Período: ${freshnessFilter}` : null
    ].filter(Boolean).join(', ') || 'Nenhum';

    addAuditLog(
      'Exportação',
      `Exportação efetuada. Escopo: ${exportScope}. Registros: ${listToExport.length}. Formato: ${exportFormat.toUpperCase()}. Filtros aplicados: [${activeFilters}]. Categorias de colunas: [${selectedCategories.map(c => (EXPORT_COLUMNS_MAP as any)[c].label).join(', ')}]. Contém dados pessoais em claro: ${containsPersonalInClear ? 'Sim' : 'Não'}`,
      containsPersonalInClear
    );
  };

  // Re-seed original list to repair database state
  const handleResetStorage = () => {
    if (window.confirm('Tem certeza de que deseja resetar os cadastros para os valores originais do Prefeitura? (Isso limpará novos cadastros criados)')) {
      storageService.resetDatabase();
      onRefreshList();
      setSelectedOrg(null);
    }
  };

  // Authenticated State check gate
  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto my-12 bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden font-sans">
        <div className="bg-brand-blue p-6 text-white text-center">
          <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-3">
            <ShieldCheck className="w-6 h-6 text-brand-cyan" />
          </div>
          <span className="text-[10px] font-bold text-brand-cyan uppercase tracking-wider block">Área Crítica Governamental</span>
          <h2 className="text-md font-bold font-display mt-1">
            Portal Administrativo • Prefeitura do Recife
          </h2>
          <p className="text-[11px] text-slate-200 mt-1.5 leading-normal">
            Acesso reservado aos técnicos e auditores do Bora Impactar para recebimento, monitoramento e certificação de organizações.
          </p>
        </div>

        <div className="p-6 space-y-5">
          {authError && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg text-xs flex gap-2 items-start">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{authError}</span>
            </div>
          )}

          {googleClientId ? (
            <div className="flex flex-col items-center justify-center py-4 space-y-3 border-b border-slate-100 pb-5">
              <span className="text-[10px] font-bold text-slate-400 uppercase text-center block">Autenticação via Google Workspace</span>
              <div id="google-signin-btn-container" className="flex justify-center" />
            </div>
          ) : (
            <div className="bg-amber-50/50 border border-amber-100 text-amber-800 p-3 rounded-lg text-xs leading-normal">
              <strong>Modo de Homologação Local</strong><br />
              O SDK do Google Sign-In requer um Client ID configurado. Para testar localmente, utilize o simulador corporativo abaixo.
            </div>
          )}

          {/* SIMULATED CORPORATIVE LOGIN */}
          <form onSubmit={handleSimulatedSubmit} className="space-y-4 pt-1">
            <div className="text-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Simulador de Acesso Institucional</span>
            </div>

            {/* Quick test accounts selector */}
            <div className="space-y-1.5">
              <label className="text-[9px] font-bold text-slate-400 uppercase">Escolha uma conta de teste para homologação:</label>
              <div className="grid grid-cols-1 gap-1.5">
                {[
                  { email: 'jailtonraniere@recife.pe.gov.br', label: 'Jailton Raniere (Administrador)', desc: 'Controle total de gestão do sistema' },
                  { email: 'bianca.carvalho@recife.pe.gov.br', label: 'Bia Ferraz (Administradora)', desc: 'Controle total de gestão do sistema' },
                  { email: 'carlos.gestao@recife.pe.gov.br', label: 'Carlos (Administrador)', desc: 'Controle total de gestão do sistema' },
                  { email: 'maria.gestao@recife.pe.gov.br', label: 'Maria (Administradora)', desc: 'Controle total de gestão do sistema' },
                  { email: 'joao.gestao@recife.pe.gov.br', label: 'João (Administrador)', desc: 'Controle total de gestão do sistema' }
                ].map((acc, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => {
                      setSimulatedEmailInput(acc.email);
                      const name = acc.email.split('@')[0].replace('.', ' ');
                      validateAndLogin(acc.email, name);
                    }}
                    className="p-2 border border-slate-200 bg-slate-50 hover:bg-brand-blue hover:text-white rounded-lg text-left transition select-none cursor-pointer group"
                  >
                    <div className="text-[11px] font-bold group-hover:text-white text-slate-700">{acc.label}</div>
                    <div className="text-[9px] group-hover:text-slate-100 text-slate-400 mt-0.5">{acc.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="relative flex py-2 items-center">
              <div className="flex-grow border-t border-slate-200"></div>
              <span className="flex-shrink mx-3 text-[9px] text-slate-400 font-bold uppercase">Ou insira outro e-mail</span>
              <div className="flex-grow border-t border-slate-200"></div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase">E-mail Corporativo</label>
              <input 
                type="email" 
                value={simulatedEmailInput}
                onChange={(e) => setSimulatedEmailInput(e.target.value)}
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-1 focus:ring-brand-cyan outline-none" 
                placeholder="Ex: nome@recife.pe.gov.br"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-2.5 px-4 bg-brand-blue hover:bg-brand-cyan text-white text-xs font-bold rounded-xl transition shadow-md cursor-pointer flex justify-center items-center gap-1.5"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Acessar como Servidor</span>
              </button>
            </div>

            <button
              type="button"
              onClick={onBack}
              className="w-full py-2 text-center text-[11px] font-semibold text-slate-400 hover:text-slate-600 block transition"
            >
              Voltar para o Portal Público
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* MODULE HEADER BAR */}
      <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 text-brand-blue">
            <ShieldCheck className="w-5 h-5 text-brand-cyan" />
            <h1 className="font-extrabold text-base tracking-tight font-display">Área de Auditoria Administrativa</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1 leading-normal">
            Acompanhe o preenchimento, audite documentação legal e certifique as submissões de iniciativas sociais do Recife.
          </p>
        </div>

        <div className="flex gap-2 w-full md:w-auto">
          {userRole === 'admin' && (
            <button
              onClick={handleResetStorage}
              title="Resetar Banco"
              className="p-2 border border-slate-200 text-slate-500 hover:text-red-655 hover:bg-red-50 rounded-lg transition shrink-0 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={() => setIsExportModalOpen(true)}
            className="py-2 px-3 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition flex-1 md:flex-none cursor-pointer"
          >
            <Download className="w-4 h-4 text-emerald-600" />
            <span className="text-emerald-700">Exportar Dados</span>
          </button>
          <button
            onClick={handleLogout}
            className="py-2 px-3 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition flex-1 md:flex-none cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Encerrar Sessão</span>
          </button>
          <button
            onClick={onBack}
            className="py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition flex-1 md:flex-none cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Voltar ao Form</span>
          </button>
        </div>
      </div>

      {/* METRICS DASHBOARD CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Registros Históricos</span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-extrabold text-brand-blue">{totalSubmissions}</span>
            <span className="text-[10px] text-slate-400 font-semibold">cadastrados</span>
          </div>
          <div className="mt-2 text-[10px] text-slate-500 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
            <span>{submissionsDrafts} rascunhos no total</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-100 bg-sky-50/20 shadow-sm flex flex-col justify-between">
          <span className="text-[10px] font-bold text-sky-700 uppercase tracking-wider block">Avaliação Pendente</span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-extrabold text-sky-700">{submissionsEnviado}</span>
            <span className="text-[10px] text-slate-400 font-semibold">novos envios</span>
          </div>
          <div className="mt-2 text-[10px] text-sky-600 flex items-center gap-1 font-semibold">
            <AlertCircle className="w-3 h-3 text-sky-500 shrink-0" />
            <span>Aguardando triagem técnica</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-amber-100 bg-amber-50/10 shadow-sm flex flex-col justify-between">
          <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider block">Em Análise Ativa</span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-extrabold text-amber-700">{submissionsAnalyzing}</span>
            <span className="text-[10px] text-slate-400 font-semibold">fichas abertas</span>
          </div>
          <div className="mt-2 text-[10px] text-amber-600 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
            <span>Processando auditorias</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-emerald-100 bg-emerald-50/10 shadow-sm flex flex-col justify-between">
          <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">Certificado Bora Impactar</span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-extrabold text-emerald-600">{submissionsApproved}</span>
            <span className="text-[10px] text-slate-400 font-semibold">aprovados</span>
          </div>
          <div className="mt-2 text-[10px] text-emerald-600 flex items-center gap-1 font-semibold">
            <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0" />
            <span>Ativos no catálogo municipal</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm col-span-2 lg:col-span-1 flex flex-col justify-between">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Completude Média</span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-extrabold text-brand-cyan">{avgCompleteness}%</span>
            <span className="text-[10px] text-slate-400 font-semibold">médio</span>
          </div>
          <div className="mt-2 w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
            <div className="bg-brand-cyan h-full" style={{ width: `${avgCompleteness}%` }} />
          </div>
        </div>
      </div>

      {/* TABS SELECTOR */}
      <div className="border-b border-slate-200 flex space-x-6">
        <button
          onClick={() => setActiveTab('listings')}
          className={`pb-3 text-xs font-bold uppercase tracking-wider border-b-2 transition select-none cursor-pointer ${
            activeTab === 'listings' ? 'border-brand-cyan text-brand-blue' : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          Envio de Fichas ({filteredOrganizations.length})
        </button>
        <button
          onClick={() => setActiveTab('analytics')}
          className={`pb-3 text-xs font-bold uppercase tracking-wider border-b-2 transition select-none cursor-pointer ${
            activeTab === 'analytics' ? 'border-brand-cyan text-brand-blue' : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          Visão Geográfica & ODS
        </button>
        <button
          onClick={() => setActiveTab('opportunities')}
          className={`pb-3 text-xs font-bold uppercase tracking-wider border-b-2 transition select-none cursor-pointer ${
            activeTab === 'opportunities' ? 'border-brand-cyan text-brand-blue' : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          Necessidades de Empresas ({totalOpportsCount})
        </button>
        {userRole === 'admin' && (
          <button
            onClick={() => setActiveTab('credentials')}
            className={`pb-3 text-xs font-bold uppercase tracking-wider border-b-2 transition select-none cursor-pointer ${
              activeTab === 'credentials' ? 'border-brand-cyan text-brand-blue' : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            <span className="flex items-center gap-1"><KeyRound className="w-3.5 h-3.5" /> Credenciais ({credentialsList.length})</span>
          </button>
        )}
        {userRole === 'admin' && (
          <button
            onClick={() => setActiveTab('audit')}
            className={`pb-3 text-xs font-bold uppercase tracking-wider border-b-2 transition select-none cursor-pointer ${
              activeTab === 'audit' ? 'border-brand-cyan text-brand-blue' : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            Logs de Auditoria ({auditLogs.length})
          </button>
        )}
      </div>

      {/* CORE BODY OF SELECTED TAB */}
      {activeTab === 'listings' && (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          
          {/* LISTS FILTER & VIEW GRID */}
          <div className="xl:col-span-2 space-y-4">
            
            {/* ADVANCED ADVANCED FILTERS ROW */}
            <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm space-y-3">
              <div className="flex flex-col sm:flex-row justify-between items-center pb-2 border-b border-slate-100 mb-2">
                <h3 className="font-bold text-slate-700 text-sm">Filtros e Exportação</h3>
                <button
                  onClick={() => {
                    // Csv export logic
                    const headers = [
                      'ID', 'Nome da Organização', 'CNPJ', 'Email', 'Telefone', 'Causa Principal',
                      'Território (Recife)', 'Status', 'Data de Atualização', 'Progresso de Cadastro'
                    ];
                    const rows = filteredOrganizations.map(org => [
                      org.id || '',
                      `"${org.name || ''}"`,
                      org.cnpj || 'Não possui',
                      org.email || '',
                      org.phone || '',
                      org.mainCause || '',
                      org.actingRegion || '',
                      org.status || '',
                      org.lastUpdated || '',
                      `${org.registrationProgress || 0}%`
                    ]);
                    
                    let csvContent = "data:text/csv;charset=utf-8,\uFEFF" 
                      + headers.join(',') + '\n' 
                      + rows.map(e => e.join(',')).join('\n');
                    
                    const encodedUri = encodeURI(csvContent);
                    const link = document.createElement('a');
                    link.setAttribute('href', encodedUri);
                    link.setAttribute('download', `bora_impactar_export_${new Date().toISOString().split('T')[0]}.csv`);
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                  }}
                  className="flex items-center gap-2 px-3 py-1.5 bg-brand-cyan hover:bg-brand-blue text-white text-xs font-bold rounded-lg shadow-sm transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Exportar Planilha CSV
                </button>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full text-xs pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-20s0 rounded-lg outline-none focus:ring-1 focus:ring-brand-cyan"
                    placeholder="Buscar por nome, CNPJ, bairro, responsável ou causa principal..."
                  />
                </div>
                
                <div className="flex gap-2">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="text-xs border border-slate-200 rounded-lg p-2 bg-white text-slate-600 focus:outline-none focus:ring-1 focus:ring-brand-cyan outline-none"
                  >
                    <option value="ALL">Todos os status</option>
                    <option value="PENDING_REVIEW">Pendente de Análise</option>
                    <option value="Rascunho">Rascunho</option>
                    <option value="Enviado">Enviado</option>
                    <option value="Em análise">Em análise</option>
                    <option value="Ajustes solicitados">Ajustes solicitados</option>
                    <option value="Reenviado">Reenviado</option>
                    <option value="Aprovado">Aprovado</option>
                    <option value="Rejeitado">Rejeitado</option>
                    <option value="Arquivado">Arquivado</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-2 border-t border-slate-100 flex-wrap justify-between items-center">
                <div className="flex gap-2 col-span-1 sm:col-span-1 md:col-span-2 flex-wrap">
                  <select
                    value={formalizationFilter}
                    onChange={(e) => setFormalizationFilter(e.target.value)}
                    className="text-xs border border-slate-200 rounded-lg p-2 bg-white text-slate-600 focus:outline-none focus:ring-1 focus:ring-brand-cyan outline-none min-w-[120px] flex-1"
                  >
                    <option value="ALL">Todas formalizações</option>
                    <option value="with_cnpj">Com CNPJ próprio</option>
                    <option value="no_cnpj">Sem CNPJ (Coletivo)</option>
                    <option value="linked">Vinculado a parceira</option>
                    <option value="formalizing">Em formalização</option>
                  </select>

                  <select
                    value={causeFilter}
                    onChange={(e) => setCauseFilter(e.target.value)}
                    className="text-xs border border-slate-200 rounded-lg p-2 bg-white text-slate-600 focus:outline-none focus:ring-1 focus:ring-brand-cyan outline-none min-w-[120px] flex-1"
                  >
                    <option value="ALL">Todas as causas</option>
                    {uniqueCauses.map((cause, idx) => (
                      <option key={idx} value={cause}>{cause}</option>
                    ))}
                  </select>

                  <select
                    value={freshnessFilter}
                    onChange={(e) => setFreshnessFilter(e.target.value)}
                    className="text-xs border border-slate-200 rounded-lg p-2 bg-white text-slate-600 focus:outline-none focus:ring-1 focus:ring-brand-cyan outline-none min-w-[120px] flex-1"
                  >
                    <option value="ALL">Período de Atualização</option>
                    <option value="RECENT">Atualizados (&lt; 90 dias)</option>
                    <option value="OUTDATED">Desatualizados (&gt; 90 dias)</option>
                    <option value="NEVER">Sem data (Crítico)</option>
                  </select>
                </div>

                <div className="text-[11px] text-slate-400 text-right col-span-1 sm:col-span-1 md:col-span-1">
                  Exibindo <strong className="text-slate-600">{filteredOrganizations.length}</strong> de <strong className="text-slate-600">{organizations.length}</strong> em Recife
                </div>
              </div>
            </div>

            {/* DATA GRID */}
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-x-auto">
              <table className="w-full text-xs text-left min-w-[700px]">
                <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="p-3.5 w-10 text-center">
                      <input 
                        type="checkbox"
                        checked={filteredOrganizations.length > 0 && filteredOrganizations.every(o => selectedOrgIds.includes(o.id || ''))}
                        onChange={handleToggleSelectAll}
                        className="rounded border-slate-300 text-brand-blue focus:ring-brand-cyan cursor-pointer"
                      />
                    </th>
                    <th className="p-3.5">Organização / CNPJ</th>
                    <th className="p-3.5">Setor / Causa</th>
                    <th className="p-3.5">Território (Recife)</th>
                    <th className="p-3.5 text-center">Cadastro %</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5">Última At.</th>
                    <th className="p-3.5 text-center">Detalhamento</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {filteredOrganizations.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-slate-400">
                        <Building2 className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                        Nenhum envio ou rascunho de organização localizado sob filtros correntes.
                      </td>
                    </tr>
                  ) : (
                    filteredOrganizations.map((org, idx) => {
                      const completedPct = getCompletenessPercent(org);
                      return (
                        <tr 
                          key={org.id || idx}
                          onClick={() => handleSelectOrgDetails(org)}
                          className={`hover:bg-slate-50/80 cursor-pointer transition ${
                            selectedOrg?.id === org.id ? 'bg-slate-50' : ''
                          }`}
                        >
                          <td className="p-3.5 text-center" onClick={(e) => e.stopPropagation()}>
                            <input 
                              type="checkbox"
                              checked={selectedOrgIds.includes(org.id || '')}
                              onChange={(e) => {
                                const orgId = org.id || '';
                                setSelectedOrgIds(prev => 
                                  prev.includes(orgId) ? prev.filter(id => id !== orgId) : [...prev, orgId]
                                );
                              }}
                              className="rounded border-slate-300 text-brand-blue focus:ring-brand-cyan cursor-pointer"
                            />
                          </td>
                          <td className="p-3.5">
                            <span className="font-bold text-brand-blue text-xs block leading-tight truncate max-w-[200px]" title={org.name}>
                              {org.name}
                            </span>
                            <span className="text-[10px] font-mono text-slate-400 block mt-0.5">
                              {org.cnpj ? org.cnpj : 'Sem CNPJ (Coletivo)'}
                            </span>
                          </td>
                          <td className="p-3.5">
                            <span className="bg-blue-50 text-indigo-900 border border-indigo-100/40 text-[9px] font-bold py-0.5 px-2 rounded-full uppercase">
                              {org.mainCause || 'Não cadastrado'}
                            </span>
                          </td>
                          <td className="p-3.5">
                            <span className="block truncate max-w-[120px]">{org.neighborhood || 'Recife'}</span>
                            <span className="text-[9px] text-slate-400 block">{org.rpa || 'RPA'}</span>
                          </td>
                          <td className="p-3.5">
                            <div className="flex flex-col items-center">
                              <span className="text-[10px] font-mono font-bold text-brand-blue mb-1">{completedPct}%</span>
                              <div className="w-16 bg-slate-100 h-1.5 rounded-full overflow-hidden flex">
                                <div 
                                  className={`h-full ${
                                    completedPct === 100 
                                      ? 'bg-emerald-500' 
                                      : completedPct > 60 
                                        ? 'bg-brand-cyan' 
                                        : 'bg-amber-400'
                                  }`} 
                                  style={{ width: `${completedPct}%` }} 
                                />
                              </div>
                            </div>
                          </td>
                          <td className="p-3.5">
                            <span className={`text-[10px] font-bold border rounded px-2 py-0.5 inline-block text-center leading-none ${getStatusBadgeStyles(org.status || 'Rascunho')}`}>
                              {org.status || 'Rascunho'}
                            </span>
                          </td>
                          <td className="p-3.5 text-[10px]">
                            {(() => {
                              const freshness = checkFreshness(org.lastUpdated);
                              return (
                                <div className="flex flex-col space-y-0.5">
                                  <span className={`font-mono text-[10px] px-1.5 py-0.5 rounded border inline-block w-fit leading-none font-bold ${freshness.badgeClass}`}>
                                    {freshness.label}
                                  </span>
                                  <span className={`text-[9px] block leading-tight font-medium ${freshness.isOutdated ? 'text-amber-600 font-semibold' : 'text-slate-400 font-medium'}`}>
                                    {freshness.daysLabel}
                                  </span>
                                </div>
                              );
                            })()}
                          </td>
                          <td className="p-3.5 text-center">
                            <button className="p-1 px-2 border border-slate-200 text-slate-400 hover:text-brand-blue hover:border-brand-blue hover:bg-blue-50/50 text-[10px] font-bold rounded transition">
                              Analisar
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* TIP BLOCK */}
            <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-lg text-[11px] text-slate-500 leading-relaxed flex gap-2">
              <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
              <span>
                <strong>Atalho de Auditoria:</strong> Ao clicar no botão de análise em qualquer linha, a ficha cadastral completa composta por 10 blocos de dados integrados (incluindo ODS explicadas e metas financeiras) é aberta na coluna lateral para revisão imediata e atualização de status.
              </span>
            </div>
          </div>

          {/* DYNAMIC DETAILS DRAWER (AUDIT CHASSIS) */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5 self-start space-y-6">
            {!selectedOrg ? (
              <div className="text-center py-12 space-y-3 text-slate-400">
                <div className="w-12 h-12 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center mx-auto text-slate-400">
                  <FileText className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-500 text-xs">Nenhum Registro Selecionado</h3>
                  <p className="text-[11px] text-slate-400 leading-normal max-w-[200px] mx-auto mt-1">
                    Selecione uma organização na tabela ao lado para visualizar e certificar.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-6 animate-in fade-in duration-200">
                
                {/* DRAWER TOP BAR */}
                <div className="border-b border-slate-100 pb-3 flex justify-between items-start">
                  <div>
                    <span className="text-[9px] font-extrabold text-brand-cyan tracking-wider uppercase block">Análise de Submissão</span>
                    <h2 className="font-bold text-brand-blue text-sm leading-tight max-w-[200px] truncate" title={selectedOrg.name}>
                      {selectedOrg.name}
                    </h2>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className={`text-[10px] font-extrabold border px-2 py-0.5 rounded ${getStatusBadgeStyles(selectedOrg.status || 'Rascunho')}`}>
                      {selectedOrg.status || 'Rascunho'}
                    </span>
                    <button
                      onClick={() => handleExportIndividualFicha(selectedOrg, 'xlsx')}
                      className="text-[9px] font-bold text-emerald-700 hover:text-emerald-950 flex items-center gap-0.5 cursor-pointer mt-1"
                      title="Exportar ficha individual em Excel"
                    >
                      <Download className="w-3 h-3" />
                      <span>Ficha Individual (Excel)</span>
                    </button>
                  </div>
                </div>

                {/* SCROLL CONTAINER WITH METRICS */}
                <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-1">
                  
                  {/* COMPLETENESS HERO */}
                  <div className="bg-slate-50 border border-slate-100 p-3 rounded-lg flex justify-between items-center">
                    <div>
                      <span className="text-[10px] text-slate-400 block font-bold uppercase leading-none">Completude Geral</span>
                      <span className="text-xs text-slate-500 mt-1 block">Preenchidos {getCompletenessPercent(selectedOrg)}%</span>
                    </div>
                    <span className="text-lg font-extrabold text-brand-blue">{getCompletenessPercent(selectedOrg)}%</span>
                  </div>

                  {/* thematic block definitions */}

                  {/* SEÇÃO 1: IDENTIFICAÇÃO */}
                  <div className="space-y-2 text-[11px] border-b border-slate-50 pb-3">
                    <h4 className="font-bold text-indigo-900 uppercase text-[9px] tracking-normal">1. Identificação & Endereço</h4>
                    <p><strong className="text-slate-400">Nome fantasia:</strong> {selectedOrg.tradingName || '-'}</p>
                    <p><strong className="text-slate-400">CNPJ oficial:</strong> {selectedOrg.cnpj || 'Sem CNPJ'}</p>
                    <p><strong className="text-slate-400">Ano de fundação:</strong> {selectedOrg.foundationYear || 'Não preenchido'}</p>
                    <p><strong className="text-slate-400">Forma tributária:</strong> {selectedOrg.legalNature || '-'}</p>
                    <p><strong className="text-slate-400">Certificações:</strong> {selectedOrg.certifications && selectedOrg.certifications.length > 0 ? selectedOrg.certifications.join(', ') : 'Nenhuma'}</p>
                    <p><strong className="text-slate-400">Endereço completo:</strong> {selectedOrg.street}, nº {selectedOrg.number} - {selectedOrg.neighborhood}, CEP {selectedOrg.cep}. ({selectedOrg.rpa})</p>
                    <p><strong className="text-slate-400">Horário operante:</strong> {selectedOrg.operatingHours || 'Comercial'}</p>
                  </div>

                  {/* SEÇÃO 2: REPRESENTANTES E CONTATOS */}
                  <div className="space-y-2 text-[11px] border-b border-slate-50 pb-3">
                    <h4 className="font-bold text-indigo-900 uppercase text-[9px] tracking-normal">2. Representantes & Contatos</h4>
                    <p><strong className="text-slate-400">Representante Legal:</strong> {selectedOrg.legalRepName} ({selectedOrg.legalRepRole})</p>
                    <p><strong className="text-slate-400">Preenchido por:</strong> {selectedOrg.fillerName} ({selectedOrg.fillerRole})</p>
                    <p><strong className="text-slate-400">Telefone direto:</strong> {renderContactField(selectedOrg.phone, selectedOrg.phonePermission)}</p>
                    <p><strong className="text-slate-400">WhatsApp operacional:</strong> {renderContactField(selectedOrg.whatsapp, selectedOrg.whatsappPermission)}</p>
                    <p><strong className="text-slate-400">E-mail principal:</strong> {renderContactField(selectedOrg.email, selectedOrg.emailPermission, true)}</p>
                    {selectedOrg.website && <p><strong className="text-slate-400">Site oficial:</strong> <a href={`https://${selectedOrg.website}`} target="_blank" rel="noreferrer" className="text-brand-cyan hover:underline inline-flex items-center gap-0.5">{selectedOrg.website}</a></p>}
                    {selectedOrg.instagram && <p><strong className="text-slate-400">Instagram:</strong> <span className="text-slate-605">{renderContactField(selectedOrg.instagram, selectedOrg.socialPermission)}</span></p>}
                  </div>

                  {/* SEÇÃO 3: CAUSAS E TEXTOS DIAGNÓSTICOS */}
                  <div className="space-y-2 text-[11px] border-b border-slate-50 pb-3">
                    <h4 className="font-bold text-indigo-900 uppercase text-[9px] tracking-normal">3. Sobre a Organização</h4>
                    <p><strong className="text-slate-400">Causa principal:</strong> <span className="font-semibold text-brand-blue">{selectedOrg.mainCause}</span></p>
                    {selectedOrg.secondaryCauses && selectedOrg.secondaryCauses.length > 0 && (
                      <p><strong className="text-slate-400">Causas secundárias:</strong> {selectedOrg.secondaryCauses.filter(x => !x.startsWith('feedback_')).join(', ')}</p>
                    )}
                    <div className="bg-slate-50 p-2.5 rounded text-[10px] leading-relaxed text-slate-600 italic">
                      <strong>História institucional:</strong> "{selectedOrg.history || 'Sem declaração descrita.'}"
                    </div>
                    <div className="bg-slate-50 p-2.5 rounded text-[10px] leading-relaxed text-slate-600 italic">
                      <strong>Missão declarada:</strong> "{selectedOrg.mission || 'Sem declaração descrita.'}"
                    </div>
                    <div className="bg-slate-50 p-2.5 rounded text-[10px] leading-relaxed text-slate-600 italic">
                      <strong>Problema que combate:</strong> "{selectedOrg.socialProblem || 'Sem declaração descrita.'}"
                    </div>
                    <p><strong className="text-slate-400">Diferencial territorial:</strong> {selectedOrg.differentiator || '-'}</p>
                  </div>

                  {/* COMPARISON BLOCK */}
                  {(() => {
                    const changes = getChangedFields(selectedOrg);
                    if (!changes) {
                      return (
                        <div className="bg-blue-50 border border-blue-200 text-blue-800 p-3 rounded-lg text-xs leading-normal">
                          <strong>Nova Iniciativa</strong><br />
                          Esta organização foi cadastrada diretamente no ambiente de homologação e não possui registro na base histórica original.
                        </div>
                      );
                    }

                    const modifiedOnly = changes.filter(c => c.hasChanged);

                    return (
                      <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2.5">
                        <div className="flex justify-between items-center border-b border-slate-200 pb-1.5">
                          <span className="text-[10px] font-bold text-brand-blue uppercase tracking-wider block">Comparação com Dados Originais</span>
                          <span className="text-[9px] font-bold bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded">
                            {modifiedOnly.length} alteração{modifiedOnly.length !== 1 ? 's' : ''}
                          </span>
                        </div>
                        
                        {modifiedOnly.length === 0 ? (
                          <p className="text-[10px] text-slate-500 italic">Nenhum dado cadastrado foi alterado em relação à base original.</p>
                        ) : (
                          <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1">
                            {modifiedOnly.map((ch, idx) => (
                              <div key={idx} className="text-[10px] border-b border-slate-100 pb-1.5 last:border-0 last:pb-0">
                                <span className="font-bold text-slate-700 block">{ch.label}</span>
                                <div className="grid grid-cols-2 gap-2 mt-1">
                                  <div className="p-1 bg-red-50 text-red-800 rounded border border-red-100/50 truncate">
                                    <span className="text-[8px] text-red-500 uppercase block font-semibold">Anterior</span>
                                    <span className="line-through">{ch.originalVal}</span>
                                  </div>
                                  <div className="p-1 bg-emerald-50 text-emerald-800 rounded border border-emerald-100/50 truncate">
                                    <span className="text-[8px] text-emerald-500 uppercase block font-semibold">Atualizado</span>
                                    <span>{ch.newVal}</span>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })()}

                  {/* SEÇÃO 4: PÚBLICO E TERRITÓRIOS */}
                  <div className="space-y-2 text-[11px] border-b border-slate-50 pb-3">
                    <h4 className="font-bold text-indigo-900 uppercase text-[9px] tracking-normal">4. Público & Territórios atendidos</h4>
                    <p><strong className="text-slate-400">Públicos-alvo:</strong> {selectedOrg.audiences?.join(', ')}</p>
                    <p><strong className="text-slate-400">Faixas etárias:</strong> {selectedOrg.ageRanges?.join(', ')}</p>
                    <p><strong className="text-slate-400">Bairros de atuação direta no Recife:</strong> {selectedOrg.neighborhoodsOfActivity?.join(', ') || 'Nenhum'}</p>
                    <p><strong className="text-slate-400">Pessoas atendidas p/ mês (média):</strong> {selectedOrg.monthlyAverageAttendance || '0'}</p>
                    <p><strong className="text-slate-400">Regra de entrada/adesão:</strong> {selectedOrg.participationCriteria || 'Inscrição comunitária direta'}</p>
                  </div>

                  {/* SEÇÃO 5: IMPACTOS E HISTÓRICO QUANTITATIVO */}
                  <div className="space-y-2 text-[11px] border-b border-slate-50 pb-3">
                    <h4 className="font-bold text-indigo-900 uppercase text-[9px] tracking-normal">5. Resultados de Impacto nos últimos 12M</h4>
                    <p><strong className="text-slate-400">Beneficiados diretos:</strong> {selectedOrg.servedLast12Months || '0'} ({selectedOrg.isEstimateOrExact === 'exact' ? 'Número exato de Cadastros' : 'Estimativa amostral'})</p>
                    <p><strong className="text-slate-400">Acolhimentos totais prestados:</strong> {selectedOrg.totalAttendancesLast12Months || '0'}</p>
                    <div className="bg-slate-50 p-2.5 rounded text-[10px] text-slate-600">
                      <strong>Resultados quantitativos auditados:</strong>
                      {selectedOrg.impactResultsList && selectedOrg.impactResultsList.length > 0 ? (
                        <ul className="space-y-2 mt-2 divide-y divide-slate-100">
                          {selectedOrg.impactResultsList.map((res: ImpactResult, i) => (
                            <li key={res.id || i} className="pt-1 text-[9px]">
                              <strong className="text-brand-blue">{res.title}</strong>: {res.quantity} {res.unit || 'atendimentos'} ({res.period})
                              {res.evidence && <p className="text-slate-400 italic">Evidência: {res.evidence}</p>}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="italic text-slate-400 block mt-1">Nenhum resultado quantitativo catalogado separadamente.</p>
                      )}
                    </div>
                  </div>

                  {/* SEÇÃO 6: ODS E GOVERNANÇA */}
                  <div className="space-y-2 text-[11px] border-b border-slate-50 pb-3">
                    <h4 className="font-bold text-indigo-900 uppercase text-[9px] tracking-normal">6. Vinculação com ODS Municipais</h4>
                    <p><strong className="text-slate-400">ODS Selecionadas (Geral):</strong> {selectedOrg.selectedOdsList?.map(o => o.toUpperCase().replace('_', ' ')).join(', ') || 'Nenhuma'}</p>
                    <div className="space-y-1">
                      <strong className="text-slate-400 block mb-1">ODS Prioritários e Justificativas de Vínculo:</strong>
                      {selectedOrg.priorityOdsList && selectedOrg.priorityOdsList.length > 0 ? (
                        selectedOrg.priorityOdsList.map((odsId, idx) => {
                          const matchingOds = SDG_DETAILS.find(o => o.id === odsId);
                          const text = selectedOrg.odsExplanations?.[odsId] || 'Justificativa de contribuição social não descrita.';
                          return (
                            <div key={idx} className="bg-slate-50 border border-slate-100 p-2 rounded text-[10px] space-y-1">
                              <span className="font-bold text-brand-blue block">
                                ODS {matchingOds?.num || odsId.replace('ods_', '')} - {matchingOds?.name || odsId}
                              </span>
                              <p className="text-slate-500 italic">"{text}"</p>
                            </div>
                          );
                        })
                      ) : (
                        <p className="text-[10px] text-slate-400 block italic">Entidade não pontou justificativa formal de ODS.</p>
                      )}
                    </div>
                  </div>

                  {/* SEÇÃO 7: ORÇAMENTO E CONTAS JURÍDICAS */}
                  <div className="space-y-2 text-[11px] border-b border-slate-50 pb-3">
                    <h4 className="font-bold text-indigo-900 uppercase text-[9px] tracking-normal">7. Orçamento & Contas</h4>
                    <p><strong className="text-slate-400">Faixa anual estimada:</strong> {selectedOrg.annualBudgetRange || 'Não declarada'}</p>
                    <p><strong className="text-slate-400">Fontes de recurso:</strong> {selectedOrg.revenueSources?.join(', ') || 'Nenhuma'}</p>
                    <p><strong className="text-slate-400">Possui conta jurídica ativa:</strong> {selectedOrg.hasInstitutionalBankInstAccount ? 'Sim' : 'Não'}</p>
                    <p><strong className="text-slate-400">Pode receber doações corporativas:</strong> {selectedOrg.canReceiveCorporateDonations ? 'Sim (Emite Recibos)' : 'Não possui documentação comercial'}</p>
                  </div>

                  {/* SEÇÃO 9: DOCUMENTAÇÃO / ARQUIVOS SIMULADOS */}
                  <div className="space-y-2 text-[11px] border-b border-slate-50 pb-3">
                    <h4 className="font-bold text-indigo-900 uppercase text-[9px] tracking-normal">9. Auditoria de Arquivos Digitais</h4>
                    <div className="space-y-1.5 pt-1">
                      {selectedOrg.simulatedFiles?.logo ? (
                        <p className="text-[10px] text-emerald-800 bg-emerald-50/50 p-1 rounded font-mono truncate">Logomarca: {selectedOrg.simulatedFiles.logo}</p>
                      ) : (
                        <p className="text-[10px] text-slate-400 italic font-mono">Logomarca: Ausente</p>
                      )}
                      
                      {selectedOrg.simulatedFiles?.bylawsFile ? (
                        <p className="text-[10px] text-emerald-800 bg-emerald-50/50 p-1 rounded font-mono truncate">Estatuto/Regimento: {selectedOrg.simulatedFiles.bylawsFile}</p>
                      ) : (
                        <p className="text-[10px] text-amber-600 bg-amber-50/30 p-1 rounded font-mono">Estatuto/Regimento: Não anexado no rascunho</p>
                      )}

                      {selectedOrg.simulatedFiles?.annualReport ? (
                        <p className="text-[10px] text-emerald-800 bg-emerald-50/50 p-1 rounded font-mono truncate">Relatório Atividades: {selectedOrg.simulatedFiles.annualReport}</p>
                      ) : (
                        <p className="text-[10px] text-slate-400 italic font-mono">Relatório Atividades: Ausente</p>
                      )}
                    </div>
                  </div>

                </div>

                {/* WORKFLOW EVALUATION CONSOLE */}
                {userRole !== 'consulta' && (
                  <div className="border-t border-slate-100 pt-4 space-y-4">
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
                      <span className="text-[10px] font-bold text-brand-blue uppercase tracking-wider block">Painel de Ação de Auditoria</span>
                      
                      <div className="space-y-1.5">
                        <label className="text-[9px] font-bold text-slate-400 uppercase">Definir Status de Análise</label>
                        <div className="grid grid-cols-2 gap-1.5">
                          {[
                            { val: 'Rascunho', label: 'Rascunho' },
                            { val: 'Enviado', label: 'Enviado' },
                            { val: 'Em análise', label: 'Em Análise' },
                            { val: 'Ajustes solicitados', label: 'Pedir Ajustes' },
                            { val: 'Reenviado', label: 'Reenviado' },
                            { val: 'Aprovado', label: 'Aprovado' },
                            { val: 'Rejeitado', label: 'Rejeitado' },
                            { val: 'Arquivado', label: 'Arquivado' }
                          ].map((st, i) => (
                            <button
                              key={i}
                              type="button"
                              onClick={() => setEvaluationStatus(st.val as FormStatus)}
                              className={`p-1.5 rounded font-bold text-[10px] transition text-center cursor-pointer ${
                                evaluationStatus === st.val
                                  ? 'bg-brand-blue text-white shadow'
                                  : 'bg-white border border-slate-200 text-slate-500 hover:bg-slate-100'
                              }`}
                            >
                              {st.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-slate-400 uppercase block">Mensagem de Ajuste (Enviada p/ ONG)</label>
                        <textarea
                          value={evaluationFeedback}
                          onChange={(e) => setEvaluationFeedback(e.target.value)}
                          placeholder="Ex: Favor re-anexar o Estatuto Social de Fundação assinado em cartório..."
                          rows={2}
                          className="w-full text-[11px] p-2 bg-white border border-slate-200 rounded-lg outline-none focus:ring-1 focus:ring-brand-cyan"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-slate-400 uppercase block">Notas Internas da Prefeitura</label>
                        <textarea
                          value={evaluationInternalNotes}
                          onChange={(e) => setEvaluationInternalNotes(e.target.value)}
                          placeholder="Anotações internas reservadas dos avaliadores municipais..."
                          rows={2}
                          className="w-full text-[11px] p-2 bg-white border border-slate-200 rounded-lg outline-none focus:ring-1 focus:ring-brand-cyan"
                        />
                      </div>

                      {saveSuccessBlock && (
                        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-2.5 rounded-lg text-[11px] font-bold flex gap-1.5 items-center justify-center animate-in fade-in">
                          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span>Status e avaliações salvas com sucesso!</span>
                        </div>
                      )}

                      <button
                        type="button"
                        onClick={handleSaveEvaluation}
                        className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Save className="w-4 h-4" />
                        <span>Salvar Deliberação</span>
                      </button>
                    </div>
                  </div>
                )}

              </div>
            )}
          </div>

        </div>
      )}

      {activeTab === 'analytics' && (
        <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm space-y-6">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="font-bold text-brand-blue text-sm">Distribuição Geográfica e Contribuições Regionais</h3>
            <p className="text-xs text-slate-500 mt-1">
              Indicadores gerais consolidados sobre a base territorial de Recife atendidos pelas organizações sociais.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* CAUSE BREAKDOWN SVG */}
            <div className="space-y-4">
              <span className="text-xs font-bold text-slate-500 uppercase block">Atendimentos por Causa Principal (Estimativa Geral)</span>
              
              <div className="bg-slate-50 p-4 rounded-xl space-y-3 border border-slate-100">
                {['Educação', 'Esporte', 'Assistência Social', 'Inclusão Digital'].map((cause, idx) => {
                  const orgsForCause = organizations.filter(o => {
                    const orgCauses = o.mainCause ? o.mainCause.split(', ').map(c => c.trim()) : [];
                    return orgCauses.includes(cause) || o.secondaryCauses?.includes(cause);
                  });
                  const sumOfAttendees = orgsForCause.reduce((acc, curr) => {
                    const parsed = parseInt(curr.servedLast12Months?.replace(/\D/g, '') || '0', 10);
                    return acc + (isNaN(parsed) ? 0 : parsed);
                  }, 0);
                  
                  // Calculate width percentage based on max
                  const maxPercent = 500; // Arbitrary safe scale
                  const percentWidth = Math.min(100, Math.round((sumOfAttendees / maxPercent) * 100));

                  return (
                    <div key={idx} className="space-y-1 text-xs">
                      <div className="flex justify-between items-center text-slate-600">
                        <span className="font-bold">{cause}</span>
                        <span className="font-mono text-[11px] font-bold">{sumOfAttendees} pessoas assistidas</span>
                      </div>
                      <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden flex">
                        <div 
                          className="bg-brand-blue h-full rounded-full transition-all duration-300"
                          style={{ width: `${percentWidth || 10}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* NEIGHBORHOOD / RPAS MAP BAR CHART */}
            <div className="space-y-4">
              <span className="text-xs font-bold text-slate-500 uppercase block">Distribuição Geográfica por RPAs de Recife</span>
              
              <div className="bg-slate-50 p-4 rounded-xl space-y-3 border border-slate-100 text-xs">
                {['RPA 1', 'RPA 2', 'RPA 3', 'RPA 4', 'RPA 5', 'RPA 6'].map((rpa, idx) => {
                  // Count organizations operating in this RPA
                  const rpaCount = organizations.filter(o => o.rpa === rpa || o.neighborhoodsOfActivity?.includes(rpa)).length;
                  const maxOrgs = organizations.length || 5;
                  const scalePct = Math.round((rpaCount / maxOrgs) * 100);

                  return (
                    <div key={idx} className="space-y-1">
                      <div className="flex justify-between items-center text-slate-600">
                        <span className="font-bold">{rpa} (Centro/Zonas)</span>
                        <span className="font-mono text-[11px] font-bold">{rpaCount} ONG{rpaCount > 1 ? 's' : ''} ativa{rpaCount > 1 ? 's' : ''}</span>
                      </div>
                      <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden flex">
                        <div 
                          className="bg-brand-cyan h-full rounded-full transition-all duration-300"
                          style={{ width: `${scalePct || 10}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

          {/* ODS HEATMAP METRICS */}
          <div className="pt-4 border-t border-slate-100 space-y-4">
            <span className="text-xs font-bold text-slate-500 uppercase block">Ativação de ODS Municipais prioritárias</span>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-9 gap-3">
              {SDG_DETAILS.map((ods) => {
                // Count how many organizations selected this ODS as priority
                const activeOrgsForOds = organizations.filter(o => o.priorityOdsList?.includes(ods.id));
                const count = activeOrgsForOds.length;
                
                return (
                  <div 
                    key={ods.id} 
                    className={`p-3 rounded-lg border text-center transition flex flex-col justify-between items-center ${
                      count > 0 
                        ? 'bg-blue-50/50 border-brand-cyan/20 text-brand-blue shadow-sm' 
                        : 'bg-white border-slate-100 text-slate-400'
                    }`}
                  >
                    <span className="text-xs font-extrabold uppercase font-mono block mb-1">ODS {ods.num}</span>
                    <div 
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold mx-auto mb-1 ${
                        count > 0 ? 'bg-brand-cyan text-white' : 'bg-slate-100 text-slate-400'
                      }`}
                    >
                      {count}
                    </div>
                    <span className="text-[8px] line-clamp-2 leading-tight tracking-tight min-h-[22px]">{ods.name}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'opportunities' && (
        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="font-bold text-brand-blue text-sm">Monitoramento de Necessidades de Apoio (Match de Empresas)</h3>
            <p className="text-xs text-slate-500 mt-1">
              Catálogo completo de oportunidades de apoio enviadas pelas ONGs para conexão direta com corporações e fundações patrocinadoras de Recife.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {organizations.flatMap((org) => (org.corporateOpportunitiesList || []).map((o: Opportunity, idx: number) => (
              <div key={o.id || idx} className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 hover:bg-slate-50 transition flex flex-col justify-between space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[9px] font-mono font-bold uppercase bg-brand-cyan/10 text-brand-cyan px-2 py-0.5 rounded-full inline-block">
                      {o.category}
                    </span>
                    <h4 className="font-bold text-brand-blue text-xs mt-1.5 leading-snug">{o.title}</h4>
                  </div>
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase ${
                    o.urgency === 'urgent' || o.urgency === 'high' 
                      ? 'bg-red-50 text-red-700' 
                      : o.urgency === 'medium'
                        ? 'bg-amber-50 text-amber-800'
                        : 'bg-slate-100 text-slate-500'
                  }`}>
                    {o.urgency === 'urgent' ? 'Urgente' : o.urgency === 'high' ? 'Alta' : 'Média'}
                  </span>
                </div>

                <p className="text-[11px] text-slate-500 leading-normal line-clamp-3">
                  "{o.description || 'Pedido de fomento social visando ampliação de atividades territoriais.'}"
                </p>

                {o.itemsNeeded && (
                  <p className="text-[11px] text-slate-600 bg-white p-2 border border-slate-100 rounded text-xs select-text">
                    <strong>Itens demandados:</strong> {o.itemsNeeded} (Qtd: {o.quantityNeeded || '1'})
                  </p>
                )}

                <div className="pt-2 border-t border-slate-100 flex justify-between items-center text-[10px] text-slate-500">
                  <div className="flex items-center gap-1">
                    <Building2 className="w-3.5 h-3.5 text-slate-400" />
                    <span className="font-bold text-brand-blue truncate max-w-[120px]" title={org.name}>
                      {org.name}
                    </span>
                  </div>
                  
                  {o.estimatedValue && (
                    <span className="font-mono font-bold text-indigo-900 bg-indigo-50/60 p-1 px-2 rounded">
                      R$ {o.estimatedValue}
                    </span>
                  )}
                </div>
              </div>
            )))}

            {totalOpportsCount === 0 && (
              <div className="col-span-2 p-12 text-center text-slate-400">
                <Users className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                Nenhuma oportunidade ou necessidade financeira pontuada pelos cadastrados até o momento.
              </div>
            )}
          </div>
        </div>
      )}

      {/* CREDENTIALS MANAGEMENT TAB */}
      {activeTab === 'credentials' && userRole === 'admin' && (
        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm space-y-5">
          <div className="border-b border-slate-100 pb-3 flex justify-between items-center">
            <div>
              <h3 className="font-bold text-brand-blue text-sm flex items-center gap-2">
                <KeyRound className="w-4.5 h-4.5 text-brand-cyan" />
                Gerenciamento de Credenciais
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Crie, edite ou remova usuários e senhas das organizações cadastradas.
              </p>
            </div>
            <button
              onClick={() => {
                setShowCredForm(!showCredForm);
                setCredFormError(null);
                setCredFormSuccess(null);
                setCredFormOrgId('');
                setCredFormLogin('');
                setCredFormPassword('');
                setCredFormIsPreRegister(false);
                setCredFormNewOrgName('');
              }}
              className={`py-2 px-4 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-sm ${
                showCredForm
                  ? 'bg-slate-100 border border-slate-200 text-slate-600 hover:bg-slate-200'
                  : 'bg-brand-blue hover:bg-brand-blue-hover text-white'
              }`}
            >
              {showCredForm ? (
                <><X className="w-3.5 h-3.5" /><span>Cancelar</span></>
              ) : (
                <><Plus className="w-3.5 h-3.5" /><span>Nova Credencial</span></>
              )}
            </button>
          </div>

          {/* Success feedback */}
          {credFormSuccess && (
            <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-100 rounded-xl p-3 text-xs text-emerald-800 font-semibold animate-in fade-in duration-150">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{credFormSuccess}</span>
            </div>
          )}

          {/* NEW CREDENTIAL FORM */}
          {showCredForm && (
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4 animate-in slide-in-from-top-2 duration-200">
              <h4 className="text-xs font-extrabold text-brand-blue uppercase tracking-wider flex items-center gap-1.5">
                <Plus className="w-3.5 h-3.5 text-brand-cyan" />
                Criar Nova Credencial
              </h4>

              {/* Checkbox for pre-registration */}
              <div className="flex items-center gap-2 bg-white/60 border border-slate-200/55 rounded-xl p-3">
                <input
                  type="checkbox"
                  id="isPreRegister"
                  checked={credFormIsPreRegister}
                  onChange={(e) => {
                    setCredFormIsPreRegister(e.target.checked);
                    setCredFormOrgId('');
                    setCredFormNewOrgName('');
                    setCredFormLogin('');
                  }}
                  className="rounded border-slate-300 text-brand-cyan focus:ring-brand-cyan/20 w-4 h-4 cursor-pointer"
                />
                <label htmlFor="isPreRegister" className="text-xs font-bold text-slate-700 cursor-pointer select-none">
                  Pré-cadastrar nova organização (que ainda não tem cadastro)
                </label>
              </div>

              {/* Organization selector or name input */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-wider">
                  {credFormIsPreRegister ? 'Nome da Nova Organização' : 'Organização'}
                </label>
                {credFormIsPreRegister ? (
                  <input
                    type="text"
                    value={credFormNewOrgName}
                    onChange={(e) => setCredFormNewOrgName(e.target.value)}
                    placeholder="Ex: Associação Viva Recife ou Coletivo Social"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-cyan/20 focus:border-brand-cyan"
                  />
                ) : (
                  <select
                    value={credFormOrgId}
                    onChange={(e) => {
                      setCredFormOrgId(e.target.value);
                      const org = organizations.find(o => o.id === e.target.value);
                      if (org) {
                        setCredFormLogin((org.email || org.cnpj || '').toLowerCase().trim());
                      }
                    }}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-cyan/20 focus:border-brand-cyan cursor-pointer"
                  >
                    <option value="">Selecione uma organização...</option>
                    {organizations
                      .filter(org => !credentialsList.some(c => c.organizacaoId === org.id))
                      .map(org => (
                        <option key={org.id} value={org.id}>{org.name} {org.neighborhood ? `— ${org.neighborhood}` : ''}</option>
                      ))}
                  </select>
                )}
              </div>

              {/* Login field */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-wider">
                  Login (e-mail ou CNPJ)
                </label>
                <input
                  type="text"
                  value={credFormLogin}
                  onChange={(e) => setCredFormLogin(e.target.value)}
                  placeholder="Ex: contato@ong.org ou 12.345.678/0001-99"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-cyan/20 focus:border-brand-cyan"
                />
              </div>

              {/* Password field */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-wider">
                  Senha (mín. 4 caracteres)
                </label>
                <div className="relative">
                  <input
                    type={credFormShowPwd ? 'text' : 'password'}
                    value={credFormPassword}
                    onChange={(e) => setCredFormPassword(e.target.value)}
                    placeholder="Defina uma senha para a organização"
                    className="w-full pl-4 pr-10 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-cyan/20 focus:border-brand-cyan"
                  />
                  <button
                    type="button"
                    onClick={() => setCredFormShowPwd(!credFormShowPwd)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer p-0.5 bg-transparent border-0"
                  >
                    {credFormShowPwd ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {credFormError && (
                <div className="flex items-center gap-2 bg-rose-50 border border-rose-100 rounded-xl p-3 text-xs text-rose-800 font-semibold">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{credFormError}</span>
                </div>
              )}

              <button
                onClick={handleCreateCredential}
                className="w-full py-2.5 px-5 bg-brand-blue hover:bg-brand-blue-hover text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer shadow-md active:scale-98"
              >
                <Check className="w-4 h-4" />
                <span>Criar Credencial</span>
              </button>
            </div>
          )}

          {/* Search */}
          <div className="relative">
            <input
              type="text"
              value={credSearchTerm}
              onChange={(e) => setCredSearchTerm(e.target.value)}
              placeholder="Filtrar credenciais por nome da organização..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-xs focus:outline-none focus:ring-2 focus:ring-brand-cyan/10 focus:border-brand-cyan font-semibold"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          </div>

          {/* Credentials table */}
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left min-w-[600px]">
              <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-3">Organização</th>
                  <th className="p-3">Login</th>
                  <th className="p-3">Senha</th>
                  <th className="p-3 text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {credentialsList.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-slate-400">
                      <KeyRound className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                      Nenhuma credencial cadastrada. Clique em "Nova Credencial" para criar.
                    </td>
                  </tr>
                ) : (
                  credentialsList
                    .filter(cred => {
                      if (!credSearchTerm.trim()) return true;
                      const org = organizations.find(o => o.id === cred.organizacaoId);
                      const orgName = (org?.name || '').toLowerCase();
                      return orgName.includes(credSearchTerm.toLowerCase()) || cred.login.includes(credSearchTerm.toLowerCase());
                    })
                    .map((cred) => {
                      const org = organizations.find(o => o.id === cred.organizacaoId);
                      const isEditing = credEditingOrgId === cred.organizacaoId;
                      return (
                        <tr key={cred.organizacaoId} className="hover:bg-slate-50/50">
                          <td className="p-3">
                            <div className="flex items-center gap-2">
                              <Building2 className="w-4 h-4 text-brand-cyan shrink-0" />
                              <div>
                                <span className="font-bold text-brand-blue block">{org?.name || cred.organizacaoId}</span>
                                {org?.neighborhood && <span className="text-[10px] text-slate-400">{org.neighborhood}</span>}
                              </div>
                            </div>
                          </td>
                          <td className="p-3">
                            <span className="font-mono text-[11px] text-slate-600 bg-slate-100 px-2 py-0.5 rounded">{cred.login}</span>
                          </td>
                          <td className="p-3">
                            {isEditing ? (
                              <div className="flex items-center gap-1.5">
                                <input
                                  type="text"
                                  value={credEditPassword}
                                  onChange={(e) => setCredEditPassword(e.target.value)}
                                  placeholder="Nova senha..."
                                  className="w-28 px-2 py-1.5 rounded-lg border border-brand-cyan text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-brand-cyan/20"
                                  autoFocus
                                />
                                <button
                                  onClick={() => handleUpdatePassword(cred.organizacaoId)}
                                  disabled={!credEditPassword || credEditPassword.length < 4}
                                  className="p-1.5 bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-200 text-white rounded-lg transition cursor-pointer"
                                  title="Salvar nova senha"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => { setCredEditingOrgId(null); setCredEditPassword(''); }}
                                  className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-lg transition cursor-pointer"
                                  title="Cancelar"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ) : (
                              <span className="font-mono text-[11px] text-slate-500">{'•'.repeat(Math.min(cred.senhaHash.length, 8))}</span>
                            )}
                          </td>
                          <td className="p-3 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                onClick={() => {
                                  setCredEditingOrgId(cred.organizacaoId);
                                  setCredEditPassword('');
                                }}
                                className="p-1.5 bg-blue-50 hover:bg-blue-100 text-brand-blue rounded-lg transition cursor-pointer"
                                title="Editar senha"
                              >
                                <Pencil className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteCredential(cred.organizacaoId)}
                                className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition cursor-pointer"
                                title="Remover credencial"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                )}
              </tbody>
            </table>
          </div>

          {/* Summary */}
          <div className="bg-sky-50 border border-sky-100 p-3 rounded-xl text-[10px] text-sky-800 leading-relaxed flex gap-2 font-semibold">
            <Info className="w-4 h-4 text-sky-500 shrink-0 mt-0.5" />
            <span>
              As credenciais são gerenciadas exclusivamente pelo administrador. As organizações utilizam o login e senha definidos aqui para acessar o formulário.
            </span>
          </div>
        </div>
      )}

      {activeTab === 'audit' && userRole === 'admin' && (
        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm space-y-4">
          <div className="border-b border-slate-100 pb-3 flex justify-between items-center">
            <div>
              <h3 className="font-bold text-brand-blue text-sm">Registro de Auditoria de Ações Administrativas</h3>
              <p className="text-xs text-slate-500 mt-1">
                Histórico completo e imutável de deliberações, acessos e exportações de dados de homologação.
              </p>
            </div>
            <button
              onClick={() => {
                if (window.confirm('Tem certeza de que deseja limpar os logs de auditoria local?')) {
                  localStorage.removeItem('bora_impactar_audit_logs');
                  setAuditLogs([]);
                }
              }}
              className="py-1.5 px-3 bg-red-50 border border-red-100 text-red-700 hover:bg-red-100 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Limpar Logs</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left min-w-[700px]">
              <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-3">Data / Hora</th>
                  <th className="p-3">Operador</th>
                  <th className="p-3">Perfil</th>
                  <th className="p-3">Ação</th>
                  <th className="p-3">Detalhamento</th>
                  <th className="p-3 text-center">Dados Pessoais?</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {auditLogs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-400">
                      <ShieldCheck className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                      Nenhum registro de auditoria gravado no momento.
                    </td>
                  </tr>
                ) : (
                  auditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/50">
                      <td className="p-3 font-mono text-[10px] text-slate-400 whitespace-nowrap">{log.timestamp}</td>
                      <td className="p-3 font-bold text-brand-blue">{log.user}</td>
                      <td className="p-3">
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase ${
                          log.role === 'admin' ? 'bg-indigo-50 text-indigo-700' : log.role === 'analista' ? 'bg-amber-50 text-amber-800' : 'bg-slate-100 text-slate-500'
                        }`}>
                          {log.role}
                        </span>
                      </td>
                      <td className="p-3 font-extrabold text-slate-700">{log.action}</td>
                      <td className="p-3 text-slate-500 leading-normal select-text max-w-[350px] truncate" title={log.details}>
                        {log.details}
                      </td>
                      <td className="p-3 text-center">
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded ${
                          log.hasPersonalData ? 'bg-amber-100 text-amber-800 font-bold' : 'bg-slate-100 text-slate-400'
                        }`}>
                          {log.hasPersonalData ? 'Sim (Em claro)' : 'Não'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* PROFESSIONAL EXCEL / CSV EXPORT DIALOG */}
      {isExportModalOpen && (
        <div id="export_modal" className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden animate-in zoom-in-95 duration-155">
            {/* Header */}
            <div className="bg-brand-blue p-5 text-white flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-brand-cyan/20 rounded-lg">
                  <Download className="w-5 h-5 text-brand-cyan" />
                </div>
                <div className="text-left">
                  <h3 className="font-extrabold text-sm tracking-tight font-display text-white">Exportação Customizada de Dados</h3>
                  <p className="text-[10px] text-slate-300">Escolha o formato, escopo e colunas para exportação</p>
                </div>
              </div>
              <button 
                onClick={() => setIsExportModalOpen(false)}
                className="text-white hover:text-brand-cyan text-xs font-bold bg-white/10 hover:bg-white/20 p-2 rounded-lg transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-5 text-left max-h-[60vh] overflow-y-auto">
              {/* Scope Selection */}
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">1. Escopo das Organizações</span>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setExportScope('all')}
                    className={`p-2.5 rounded-xl border text-center transition cursor-pointer ${
                      exportScope === 'all'
                        ? 'border-brand-blue bg-blue-50/20 ring-1 ring-brand-blue font-bold text-brand-blue'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                    }`}
                  >
                    <span className="text-xs block">Todas ({organizations.length})</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setExportScope('filtered')}
                    className={`p-2.5 rounded-xl border text-center transition cursor-pointer ${
                      exportScope === 'filtered'
                        ? 'border-brand-blue bg-blue-50/20 ring-1 ring-brand-blue font-bold text-brand-blue'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                    }`}
                  >
                    <span className="text-xs block">Filtradas ({filteredOrganizations.length})</span>
                  </button>

                  <button
                    type="button"
                    disabled={selectedOrgIds.length === 0}
                    onClick={() => setExportScope('selected')}
                    className={`p-2.5 rounded-xl border text-center transition cursor-pointer ${
                      selectedOrgIds.length === 0 ? 'opacity-40 cursor-not-allowed' : ''
                    } ${
                      exportScope === 'selected'
                        ? 'border-brand-blue bg-blue-50/20 ring-1 ring-brand-blue font-bold text-brand-blue'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                    }`}
                  >
                    <span className="text-xs block">Selecionadas ({selectedOrgIds.length})</span>
                  </button>
                </div>
              </div>

              {/* Format selection */}
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">2. Formato do Arquivo</span>
                <div className="grid grid-cols-2 gap-3">
                  <label className={`flex items-center gap-2 p-3 rounded-xl border cursor-pointer transition ${
                    exportFormat === 'xlsx' ? 'border-brand-blue bg-blue-50/10' : 'border-slate-200 hover:bg-slate-50'
                  }`}>
                    <input 
                      type="radio" 
                      name="format_sel" 
                      checked={exportFormat === 'xlsx'} 
                      onChange={() => setExportFormat('xlsx')}
                      className="cursor-pointer"
                    />
                    <div>
                      <span className="font-bold text-xs text-slate-700 block">Planilha Excel (.xlsx)</span>
                      <span className="text-[9px] text-slate-400 block leading-tight">Ideal para relatórios locais</span>
                    </div>
                  </label>

                  <label className={`flex items-center gap-2 p-3 rounded-xl border cursor-pointer transition ${
                    exportFormat === 'csv' ? 'border-brand-blue bg-blue-50/10' : 'border-slate-200 hover:bg-slate-50'
                  }`}>
                    <input 
                      type="radio" 
                      name="format_sel" 
                      checked={exportFormat === 'csv'} 
                      onChange={() => setExportFormat('csv')}
                      className="cursor-pointer"
                    />
                    <div>
                      <span className="font-bold text-xs text-slate-700 block">Arquivo de Texto (.csv)</span>
                      <span className="text-[9px] text-slate-400 block leading-tight">Formato aberto universal</span>
                    </div>
                  </label>
                </div>
              </div>

              {/* Delimiter selector (Only visible if CSV is selected) */}
              {exportFormat === 'csv' && (
                <div className="space-y-2 animate-in slide-in-from-top-1 duration-150">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">3. Separador do CSV</span>
                  <div className="grid grid-cols-2 gap-3">
                    <label className={`flex items-center gap-2 p-2.5 rounded-xl border cursor-pointer transition ${
                      exportSeparator === ';' ? 'border-slate-350 bg-slate-50' : 'border-slate-100 hover:bg-slate-50'
                    }`}>
                      <input 
                        type="radio" 
                        name="sep_sel" 
                        checked={exportSeparator === ';'} 
                        onChange={() => setExportSeparator(';')}
                        className="cursor-pointer"
                      />
                      <span className="text-xs text-slate-750 font-semibold">Ponto e Vírgula ( ; ) [Excel Br]</span>
                    </label>

                    <label className={`flex items-center gap-2 p-2.5 rounded-xl border cursor-pointer transition ${
                      exportSeparator === ',' ? 'border-slate-350 bg-slate-50' : 'border-slate-100 hover:bg-slate-50'
                    }`}>
                      <input 
                        type="radio" 
                        name="sep_sel" 
                        checked={exportSeparator === ','} 
                        onChange={() => setExportSeparator(',')}
                        className="cursor-pointer"
                      />
                      <span className="text-xs text-slate-750 font-semibold">Vírgula ( , ) [Google Sheets]</span>
                    </label>
                  </div>
                </div>
              )}

              {/* Column selection categories */}
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  {exportFormat === 'csv' ? '4.' : '3.'} Seleção de Colunas por Categorias
                </span>
                
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(EXPORT_COLUMNS_MAP).map(([key, cat]) => (
                    <label 
                      key={key} 
                      className={`flex items-start gap-2 p-2.5 border rounded-xl cursor-pointer hover:bg-slate-50 transition ${
                        selectedCategories.includes(key) ? 'border-brand-cyan/30 bg-blue-50/5' : 'border-slate-200'
                      }`}
                    >
                      <input 
                        type="checkbox"
                        checked={selectedCategories.includes(key)}
                        onChange={() => {
                          setSelectedCategories(prev => 
                            prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
                          );
                        }}
                        className="mt-0.5 rounded text-brand-blue focus:ring-brand-cyan cursor-pointer"
                      />
                      <div>
                        <span className="font-bold text-xs text-slate-700 block leading-tight">{cat.label}</span>
                        <span className="text-[8px] text-slate-400 block mt-0.5">{cat.columns.length} colunas</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Info summary */}
              <div className="bg-sky-50 border border-sky-100 p-3.5 rounded-xl text-sky-850 text-[10px] leading-relaxed flex gap-2">
                <Info className="w-4 h-4 text-sky-500 shrink-0 mt-0.5" />
                <div>
                  <strong>Regras de Privacidade de Dados Pessoais:</strong><br />
                  As colunas contendo informações pessoais de contatos (telefones, whatsapp e e-mail) serão exportadas em texto claro apenas para operadores com perfil de <strong>Administrador</strong>. Para outros perfis, essas colunas serão mascaradas.
                </div>
              </div>
            </div>

            {/* Footer with actions */}
            <div className="bg-slate-50 p-4 border-t border-slate-100 flex justify-between items-center">
              <button
                type="button"
                onClick={() => setIsExportModalOpen(false)}
                className="py-2 px-4 border border-slate-200 hover:bg-slate-100 text-slate-600 rounded-lg text-xs font-bold transition cursor-pointer"
              >
                Cancelar
              </button>
              
              <button
                type="button"
                onClick={() => {
                  handleExportData();
                  setIsExportModalOpen(false);
                }}
                className="py-2 px-5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-md transition cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Exportar Dados</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
