/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Building2, Users, FileText, ArrowLeft, CheckCircle2, AlertCircle, Info,
  Search, Filter, ShieldCheck, Download, Trash2, RotateCcw,
  Check, Play, Save, ChevronRight, MapPin, Globe, Award, HelpCircle, MessageSquare
} from 'lucide-react';
import { OrganizationData, FormStatus, Opportunity, ImpactResult } from '../types';
import { storageService } from '../services/storage';
import { SDG_DETAILS } from '../data/mockData';

interface AdminPanelProps {
  onBack: () => void;
  organizations: OrganizationData[];
  onRefreshList: () => void;
}

export function AdminPanel({ onBack, organizations, onRefreshList }: AdminPanelProps) {
  // Authentication simulation state
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);
  const [adminUsername, setAdminUsername] = useState<string>('diretoria.impacto');
  const [adminPassword, setAdminPassword] = useState<string>('recife123');
  const [authError, setAuthError] = useState<string>('');

  // Export Modal Configuration states
  const [isExportModalOpen, setIsExportModalOpen] = useState<boolean>(false);
  const [exportSeparator, setExportSeparator] = useState<';' | ','>(';');
  const [exportScope, setExportScope] = useState<'all' | 'filtered'>('all');

  // Active view states inside dashboard
  const [activeTab, setActiveTab] = useState<'listings' | 'analytics' | 'opportunities'>('listings');
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

  // Handle mock log in
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminUsername === 'diretoria.impacto' && adminPassword === 'recife123') {
      setIsAuthenticated(true);
      setAuthError('');
    } else {
      setAuthError('Usuário ou senha inválido para a rede administrativa.');
    }
  };

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
      matchCause = org.mainCause === causeFilter;
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
  const uniqueCauses = Array.from(new Set(organizations.map(o => o.mainCause).filter(Boolean)));

  // Select an organization for side panel detailed viewing
  const handleSelectOrgDetails = (org: OrganizationData) => {
    setSelectedOrg(org);
    setEvaluationStatus(org.status || 'Em análise');
    // Mock restore evaluation history or set blank
    setEvaluationFeedback(org.secondaryCauses?.includes('feedback_mock_temp') ? 'Estatuto de governança precisa de upload atualizado.' : '');
    setEvaluationInternalNotes('Entidade com cadastro preenchido de forma consistente sob conformidade dos ODS.');
    setSaveSuccessBlock(false);
  };

  // Post update to database list
  const handleSaveEvaluation = () => {
    if (!selectedOrg) return;
    
    // Create new organization copy with updated settings
    const updated: OrganizationData = {
      ...selectedOrg,
      status: evaluationStatus,
      lastUpdated: new Date().toLocaleDateString('pt-BR')
    };

    // If evaluative feedback is added, we can store it or simulate saving
    storageService.saveOrganizationToList(updated);
    
    // Re-sync locally
    setSelectedOrg(updated);
    setSaveSuccessBlock(true);
    onRefreshList();

    setTimeout(() => {
      setSaveSuccessBlock(false);
    }, 2500);
  };

  // Simulate exporting entire CSV data with robust formatting
  const handleExportCSV = (scope: 'all' | 'filtered' = 'all', separator: ';' | ',' = ';') => {
    const listToExport = scope === 'all' ? organizations : filteredOrganizations;

    const headers = [
      'ID',
      'Nome Oficial',
      'Nome Fantasia',
      'CNPJ',
      'Situacao Formal',
      'CNPJ do Parceiro/Mae',
      'Ano Fundacao',
      'Natureza Juridica',
      'Bairro',
      'RPA',
      'Completitude',
      'Status',
      'Causa Principal',
      'Causas Secundarias',
      'Publicos-Alvo',
      'Faixas Etarias',
      'Preenchido Por',
      'Cargo Preenchedor',
      'Representante Legal',
      'Telefone',
      'Whatsapp',
      'Email',
      'Website',
      'Instagram',
      'Atendidos Mensal (Media)',
      'Atendidos Anual',
      'Acolhimentos Anual',
      'Controle por Indicadores',
      'ODS Selecionados',
      'ODS Prioritarios',
      'Faixa Orcamento Anual',
      'Fontes de Receita',
      'Tem Conta Institucional',
      'Permite Publicacao Catalogo',
      'Ultima Atualizacao'
    ];

    const escapeAndQuote = (val: any) => {
      if (val === undefined || val === null) return '""';
      const stringified = String(val).trim();
      // Replace any double quotes with two double quotes, like in standard CSVs
      const escaped = stringified.replace(/"/g, '""');
      // Wrap in double quotes
      return `"${escaped}"`;
    };

    const rows = listToExport.map(o => {
      const completeness = `${getCompletenessPercent(o)}%`;
      return [
        escapeAndQuote(o.id || ''),
        escapeAndQuote(o.name),
        escapeAndQuote(o.tradingName || ''),
        escapeAndQuote(o.cnpj || 'Sem CNPJ'),
        escapeAndQuote(o.formalizationStatus === 'with_cnpj' ? 'Com CNPJ próprio' : o.formalizationStatus === 'no_cnpj' ? 'Sem CNPJ (Coletivo)' : o.formalizationStatus === 'linked' ? 'Vinculado a parceira' : o.formalizationStatus === 'formalizing' ? 'Em formalização' : 'Não informado'),
        escapeAndQuote(o.parentOrgCnpj || ''),
        escapeAndQuote(o.foundationYear || ''),
        escapeAndQuote(o.legalNature || ''),
        escapeAndQuote(o.neighborhood || ''),
        escapeAndQuote(o.rpa || ''),
        escapeAndQuote(completeness),
        escapeAndQuote(o.status || 'Rascunho'),
        escapeAndQuote(o.mainCause || ''),
        escapeAndQuote(o.secondaryCauses?.join(' | ') || ''),
        escapeAndQuote(o.audiences?.join(' | ') || ''),
        escapeAndQuote(o.ageRanges?.join(' | ') || ''),
        escapeAndQuote(o.fillerName || ''),
        escapeAndQuote(o.fillerRole || ''),
        escapeAndQuote(o.legalRepName || ''),
        escapeAndQuote(o.phone || ''),
        escapeAndQuote(o.whatsapp || ''),
        escapeAndQuote(o.email || ''),
        escapeAndQuote(o.website || ''),
        escapeAndQuote(o.instagram || ''),
        escapeAndQuote(o.monthlyAverageAttendance || '0'),
        escapeAndQuote(o.servedLast12Months || '0'),
        escapeAndQuote(o.totalAttendancesLast12Months || '0'),
        escapeAndQuote(o.indicatorStatus || ''),
        escapeAndQuote(o.selectedOdsList?.map(ods => ods.toUpperCase().replace('_', ' ')).join(' | ') || ''),
        escapeAndQuote(o.priorityOdsList?.map(ods => ods.toUpperCase().replace('_', ' ')).join(' | ') || ''),
        escapeAndQuote(o.annualBudgetRange || ''),
        escapeAndQuote(o.revenueSources?.join(' | ') || ''),
        escapeAndQuote(o.hasInstitutionalBankInstAccount ? 'Sim' : 'Não'),
        escapeAndQuote(o.consentCatalogPublishing ? 'Sim' : 'Não'),
        escapeAndQuote(o.lastUpdated || '-')
      ];
    });

    const csvContent = "\uFEFF" 
      + [headers.join(separator), ...rows.map(e => e.join(separator))].join('\r\n');
    
    // Modern Blob-based download to prevent URI length limitations and special character issues
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement("a");
    const formattedScope = scope === 'all' ? 'consolidado' : 'filtrado';
    link.href = url;
    link.setAttribute("download", `bora_impactar_${formattedScope}_recife_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
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
      <div className="max-w-md mx-auto my-12 bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden">
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

        <form onSubmit={handleLogin} className="p-6 space-y-4">
          {authError && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg text-xs flex gap-2 items-start">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{authError}</span>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase">Usuário Técnico</label>
            <input 
              type="text" 
              value={adminUsername}
              onChange={(e) => setAdminUsername(e.target.value)}
              className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-1 focus:ring-brand-cyan outline-none" 
              placeholder="Ex: diretoria.impacto"
              required 
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase">Senha Administrativa</label>
            <input 
              type="password" 
              value={adminPassword}
              onChange={(e) => setAdminPassword(e.target.value)}
              className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-1 focus:ring-brand-cyan outline-none" 
              placeholder="Senha do sistema"
              required
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-2.5 px-4 bg-brand-blue hover:bg-brand-cyan text-white text-xs font-bold rounded-xl transition shadow-md cursor-pointer flex justify-center items-center gap-1.5"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Entrar no Painel Seguro</span>
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
          <button
            onClick={handleResetStorage}
            title="Resetar Banco"
            className="p-2 border border-slate-200 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition shrink-0 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsExportModalOpen(true)}
            className="py-2 px-3 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition flex-1 md:flex-none cursor-pointer animate-pulse"
          >
            <Download className="w-4 h-4 text-emerald-600 animate-bounce" />
            <span className="text-emerald-700">Exportar para Excel</span>
          </button>
          <button
            onClick={onBack}
            className="py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition flex-1 md:flex-none cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Sair do Painel</span>
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
          📂 Envio de Fichas ({filteredOrganizations.length})
        </button>
        <button
          onClick={() => setActiveTab('analytics')}
          className={`pb-3 text-xs font-bold uppercase tracking-wider border-b-2 transition select-none cursor-pointer ${
            activeTab === 'analytics' ? 'border-brand-cyan text-brand-blue' : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          📊 Visão Geográfica & ODS
        </button>
        <button
          onClick={() => setActiveTab('opportunities')}
          className={`pb-3 text-xs font-bold uppercase tracking-wider border-b-2 transition select-none cursor-pointer ${
            activeTab === 'opportunities' ? 'border-brand-cyan text-brand-blue' : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          💼 Nec. de Empresas ({totalOpportsCount})
        </button>
      </div>

      {/* CORE BODY OF SELECTED TAB */}
      {activeTab === 'listings' && (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          
          {/* LISTS FILTER & VIEW GRID */}
          <div className="xl:col-span-2 space-y-4">
            
            {/* ADVANCED ADVANCED FILTERS ROW */}
            <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm space-y-3">
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
                    <option value="PENDING_REVIEW">⏱️ Pendente de Análise</option>
                    <option value="Enviado">Enviado</option>
                    <option value="Em análise">Em análise</option>
                    <option value="Ajustes solicitados">Ajustes solicitados</option>
                    <option value="Aprovado">Aprovado</option>
                    <option value="Rascunho">Rascunho / Sem Envio</option>
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
                    <option value="RECENT">📅 Atualizados (&lt; 90 dias)</option>
                    <option value="OUTDATED">⚠️ Desatualizados (&gt; 90 dias)</option>
                    <option value="NEVER">🚫 Sem data (Crítico)</option>
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
                      <td colSpan={7} className="p-8 text-center text-slate-400">
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
                          <td className="p-3.5">
                            <span className="font-bold text-brand-blue text-xs block leading-tight truncate max-w-[200px]" title={org.name}>
                              {org.name}
                            </span>
                            <span className="text-[10px] font-mono text-slate-400 block mt-0.5">
                              {org.cnpj ? org.cnpj : '🚫 Sem CNPJ (Coletivo)'}
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
                <div className="w-12 h-12 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center mx-auto text-xl">
                  📁
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
                  <span className={`text-[10px] font-extrabold border px-2 py-0.5 rounded ${getStatusBadgeStyles(selectedOrg.status || 'Rascunho')}`}>
                    {selectedOrg.status || 'Rascunho'}
                  </span>
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
                    <h4 className="font-bold text-indigo-900 uppercase text-[9px] tracking-normal">📌 1. Identificação & Endereço</h4>
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
                    <h4 className="font-bold text-indigo-900 uppercase text-[9px] tracking-normal">👥 2. Representantes & Contatos</h4>
                    <p><strong className="text-slate-400">Representante Legal:</strong> {selectedOrg.legalRepName} ({selectedOrg.legalRepRole})</p>
                    <p><strong className="text-slate-400">Preenchido por:</strong> {selectedOrg.fillerName} ({selectedOrg.fillerRole})</p>
                    <p><strong className="text-slate-400">Telefone direto:</strong> {selectedOrg.phone || '-'}</p>
                    <p><strong className="text-slate-400">WhatsApp operacional:</strong> {selectedOrg.whatsapp || '-'}</p>
                    <p><strong className="text-slate-400">E-mail principal:</strong> {selectedOrg.email || '-'}</p>
                    {selectedOrg.website && <p><strong className="text-slate-400">Site oficial:</strong> <a href={`https://${selectedOrg.website}`} target="_blank" rel="noreferrer" className="text-brand-cyan hover:underline inline-flex items-center gap-0.5">{selectedOrg.website} 🔗</a></p>}
                    {selectedOrg.instagram && <p><strong className="text-slate-400">Instagram:</strong> <span className="text-slate-600">{selectedOrg.instagram}</span></p>}
                  </div>

                  {/* SEÇÃO 3: CAUSAS E TEXTOS DIAGNÓSTICOS */}
                  <div className="space-y-2 text-[11px] border-b border-slate-50 pb-3">
                    <h4 className="font-bold text-indigo-900 uppercase text-[9px] tracking-normal">💡 3. Sobre a Organização</h4>
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

                  {/* SEÇÃO 4: PÚBLICO E TERRITÓRIOS */}
                  <div className="space-y-2 text-[11px] border-b border-slate-50 pb-3">
                    <h4 className="font-bold text-indigo-900 uppercase text-[9px] tracking-normal">🎯 4. Público & Territórios atendidos</h4>
                    <p><strong className="text-slate-400">Públicos-alvo:</strong> {selectedOrg.audiences?.join(', ')}</p>
                    <p><strong className="text-slate-400">Faixas etárias:</strong> {selectedOrg.ageRanges?.join(', ')}</p>
                    <p><strong className="text-slate-400">Bairros de atuação direta no Recife:</strong> {selectedOrg.neighborhoodsOfActivity?.join(', ') || 'Nenhum'}</p>
                    <p><strong className="text-slate-400">Pessoas atendidas p/ mês (média):</strong> {selectedOrg.monthlyAverageAttendance || '0'}</p>
                    <p><strong className="text-slate-400">Regra de entrada/adesão:</strong> {selectedOrg.participationCriteria || 'Inscrição comunitária direta'}</p>
                  </div>

                  {/* SEÇÃO 5: IMPACTOS E HISTÓRICO QUANTITATIVO */}
                  <div className="space-y-2 text-[11px] border-b border-slate-50 pb-3">
                    <h4 className="font-bold text-indigo-900 uppercase text-[9px] tracking-normal">📊 5. Resultados de Impacto nos últimos 12M</h4>
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
                    <h4 className="font-bold text-indigo-900 uppercase text-[9px] tracking-normal">🇺🇳 6. Vinculação com ODS Municipais</h4>
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
                    <h4 className="font-bold text-indigo-900 uppercase text-[9px] tracking-normal">💰 7. Orçamento & Contas</h4>
                    <p><strong className="text-slate-400">Faixa anual estimada:</strong> {selectedOrg.annualBudgetRange || 'Não declarada'}</p>
                    <p><strong className="text-slate-400">Fontes de recurso:</strong> {selectedOrg.revenueSources?.join(', ') || 'Nenhuma'}</p>
                    <p><strong className="text-slate-400">Possui conta jurídica ativa:</strong> {selectedOrg.hasInstitutionalBankInstAccount ? '✔️ Sim' : '❌ Não'}</p>
                    <p><strong className="text-slate-400">Pode receber doações corporativas:</strong> {selectedOrg.canReceiveCorporateDonations ? '✔️ Sim (Emite Recibos)' : '❌ Não possui documentação comercial'}</p>
                  </div>

                  {/* SEÇÃO 9: DOCUMENTAÇÃO / ARQUIVOS SIMULADOS */}
                  <div className="space-y-2 text-[11px] border-b border-slate-50 pb-3">
                    <h4 className="font-bold text-indigo-900 uppercase text-[9px] tracking-normal">📁 9. Auditoria de Arquivos Digitais</h4>
                    <div className="space-y-1.5 pt-1">
                      {selectedOrg.simulatedFiles?.logo ? (
                        <p className="text-[10px] text-emerald-800 bg-emerald-50/50 p-1 rounded font-mono truncate">🎨 Logomarca: {selectedOrg.simulatedFiles.logo}</p>
                      ) : (
                        <p className="text-[10px] text-slate-400 italic font-mono">🎨 Logomarca: Ausente</p>
                      )}
                      
                      {selectedOrg.simulatedFiles?.bylawsFile ? (
                        <p className="text-[10px] text-emerald-800 bg-emerald-50/50 p-1 rounded font-mono truncate">📄 Estatuto/Regimento: {selectedOrg.simulatedFiles.bylawsFile}</p>
                      ) : (
                        <p className="text-[10px] text-amber-600 bg-amber-50/30 p-1 rounded font-mono">📄 Estatuto/Regimento: Não anexado no rascunho</p>
                      )}

                      {selectedOrg.simulatedFiles?.annualReport ? (
                        <p className="text-[10px] text-emerald-800 bg-emerald-50/50 p-1 rounded font-mono truncate">📈 Relatório Atividades: {selectedOrg.simulatedFiles.annualReport}</p>
                      ) : (
                        <p className="text-[10px] text-slate-400 italic font-mono">📈 Relatório Atividades: Ausente</p>
                      )}
                    </div>
                  </div>

                </div>

                {/* WORKFLOW EVALUATION CONSOLE */}
                <div className="border-t border-slate-100 pt-4 space-y-4">
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
                    <span className="text-[10px] font-bold text-brand-blue uppercase tracking-wider block">🛠️ Painel de Ação de Auditoria</span>
                    
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-bold text-slate-400 uppercase">Definir Status de Análise</label>
                      <div className="grid grid-cols-2 gap-1.5">
                        {[
                          { val: 'Enviado', label: 'Enviado' },
                          { val: 'Em análise', label: 'Em Análise' },
                          { val: 'Ajustes solicitados', label: 'Pedir Ajustes' },
                          { val: 'Aprovado', label: 'Acolher/Aprovar' }
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
                  const orgsForCause = organizations.filter(o => o.mainCause === cause || o.secondaryCauses?.includes(cause));
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
                    {o.urgency === 'urgent' ? '🚨 Urgente' : o.urgency === 'high' ? '⚠️ Alta' : 'Média'}
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
                  <h3 className="font-extrabold text-sm tracking-tight font-display text-white">Exportação Consolidada de Dados</h3>
                  <p className="text-[10px] text-slate-300">Gere relatórios compatíveis com Microsoft Excel e Google Planilhas</p>
                </div>
              </div>
              <button 
                onClick={() => setIsExportModalOpen(false)}
                className="text-white hover:text-brand-cyan text-xs font-bold bg-white/10 hover:bg-white/20 p-2 rounded-lg transition"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-5 text-left">
              {/* Scope Selection */}
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">1. Escopo das Organizações</span>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setExportScope('all')}
                    className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                      exportScope === 'all'
                        ? 'border-brand-blue bg-blue-50/20 ring-1 ring-brand-blue'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <span className="font-bold text-xs text-brand-blue block">Todas ({organizations.length})</span>
                    <span className="text-[10px] text-slate-500 mt-0.5 block leading-tight">Banco de dados completo consolidado do Recife.</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setExportScope('filtered')}
                    className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                      exportScope === 'filtered'
                        ? 'border-brand-blue bg-blue-50/20 ring-1 ring-brand-blue'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <span className="font-bold text-xs text-brand-blue block">Filtradas Atuais ({filteredOrganizations.length})</span>
                    <span className="text-[10px] text-slate-500 mt-0.5 block leading-tight">Apenas as que atendem aos filtros ativos da tabela.</span>
                  </button>
                </div>
              </div>

              {/* Format / delimiter selection */}
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">2. Formato do Separador (Compatibilidade Excel)</span>
                <div className="space-y-2">
                  <label className="flex items-start gap-2.5 p-3 rounded-xl border border-slate-100 hover:bg-slate-50 transition cursor-pointer">
                    <input 
                      type="radio" 
                      name="delimiter_sel" 
                      checked={exportSeparator === ';'} 
                      onChange={() => setExportSeparator(';')}
                      className="mt-1" 
                    />
                    <div>
                      <span className="font-bold text-xs text-slate-700 block">Ponto e Vírgula ( ; ) — [Recomendado para Excel Brasil]</span>
                      <span className="text-[10px] text-slate-500 block leading-normal">
                        Evita problemas onde o Microsoft Excel quebra colunas incorretamente em computadores com sistema em português.
                      </span>
                    </div>
                  </label>

                  <label className="flex items-start gap-2.5 p-3 rounded-xl border border-slate-100 hover:bg-slate-50 transition cursor-pointer">
                    <input 
                      type="radio" 
                      name="delimiter_sel" 
                      checked={exportSeparator === ','} 
                      onChange={() => setExportSeparator(',')}
                      className="mt-1" 
                    />
                    <div>
                      <span className="font-bold text-xs text-slate-700 block">Vírgula ( , ) — [Formato Universal / Google Planilhas]</span>
                      <span className="text-[10px] text-slate-500 block leading-normal">
                        Padrão internacional de arquivos CSV. Ideal para carregar no Google Sheets ou sistemas estrangeiros.
                      </span>
                    </div>
                  </label>
                </div>
              </div>

              {/* Info summary */}
              <div className="bg-sky-50 border border-sky-100 p-3.5 rounded-xl text-sky-800 text-[10px] leading-relaxed flex gap-2">
                <Info className="w-4 h-4 text-sky-500 shrink-0 mt-0.5 animate-pulse" />
                <span>
                  O relatório gerado inclui <strong>35 colunas consolidadas</strong> contendo contatos, nível de formalização municipal, ODS vinculadas, faixas de orçamento, volumetria de acolhidos, preenchedor e status.
                </span>
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
                  handleExportCSV(exportScope, exportSeparator);
                  setIsExportModalOpen(false);
                }}
                className="py-2 px-5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-md transition cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Gerar Planilha Completa (.csv)</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
