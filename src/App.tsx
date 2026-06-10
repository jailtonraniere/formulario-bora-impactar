/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Building2, Phone, Sparkles, Plus, Trash2, ArrowLeft, ArrowRight, Save, 
  LogOut, HelpCircle, Check, MapPin, CheckCircle2, ChevronDown, ChevronUp, 
  Info, AlertCircle, FileText, Download, RotateCcw, ShieldCheck, Loader2 
} from 'lucide-react';

import { OrganizationData, FormStatus, ImpactResult, Opportunity } from './types';
import { INITIAL_ORGANIZATIONS, EMPTY_ORGANIZATION, LIST_OF_CAUSES, LIST_OF_NEIGHBORHOODS, COOPERATIVE_OPPORTUNITIES_CATEGORIES } from './data/mockData';
import { storageService } from './services/storage';
import { RecifeLogo, BoraImpactarLogo } from './components/Logo';
import { InputField, TextAreaField, SelectField, ProgressBar, PhoneMaskHelper, CnpjMaskHelper, CepMaskHelper, YesNoField } from './components/FormFields';
import { SearchSection } from './components/SearchSection';
import { OdsEsgGov } from './components/OdsEsgGov';
import { ReviewTab } from './components/ReviewTab';
import { AdminPanel } from './components/AdminPanel';

export interface StepProgressInfo {
  step: number;
  name: string;
  percentage: number;
  status: 'completed' | 'in_progress' | 'pending';
  filled: number;
  total: number;
  missing: string[];
}

export function getStepCompletionData(data: OrganizationData): StepProgressInfo[] {
  const isStringFilled = (val: string | undefined | null) => !!val && typeof val === 'string' && val.trim() !== '';
  const isArrayFilled = (val: any[] | undefined | null) => Array.isArray(val) && val.length > 0;
  const isDefined = (val: any) => val !== undefined && val !== null && val !== '';

  const steps: StepProgressInfo[] = [];

  // 1. Identificação
  {
    const items: { label: string; filled: boolean }[] = [
      { label: 'Nome oficial da organização', filled: isStringFilled(data.name) },
      { label: 'Situação de formalização', filled: isStringFilled(data.formalizationStatus) },
      { label: 'CEP', filled: isStringFilled(data.cep) },
      { label: 'Bairro', filled: isStringFilled(data.neighborhood) },
      { label: 'Rua', filled: isStringFilled(data.street) },
      { label: 'Número', filled: isStringFilled(data.number) },
      { label: 'Horário de funcionamento', filled: isStringFilled(data.operatingHours) },
    ];
    if (data.formalizationStatus === 'with_cnpj') {
      items.push({ label: 'CNPJ', filled: isStringFilled(data.cnpj) });
    }
    const filled = items.filter(i => i.filled).length;
    const total = items.length;
    const pct = total > 0 ? Math.round((filled / total) * 100) : 0;
    steps.push({
      step: 1,
      name: 'Identificação',
      percentage: pct,
      status: pct === 100 ? 'completed' : pct > 0 ? 'in_progress' : 'pending',
      filled,
      total,
      missing: items.filter(i => !i.filled).map(i => i.label),
    });
  }

  // 2. Contatos
  {
    const items: { label: string; filled: boolean }[] = [
      { label: 'Quem está preenchendo', filled: isStringFilled(data.fillerName) },
      { label: 'Telefone de contato', filled: isStringFilled(data.phone) },
      { label: 'WhatsApp', filled: isStringFilled(data.whatsapp) },
      { label: 'E-mail principal', filled: isStringFilled(data.email) },
    ];
    const filled = items.filter(i => i.filled).length;
    const total = items.length;
    const pct = total > 0 ? Math.round((filled / total) * 100) : 0;
    steps.push({
      step: 2,
      name: 'Contatos',
      percentage: pct,
      status: pct === 100 ? 'completed' : pct > 0 ? 'in_progress' : 'pending',
      filled,
      total,
      missing: items.filter(i => !i.filled).map(i => i.label),
    });
  }

  // 3. Atuação e perfil
  {
    const items: { label: string; filled: boolean }[] = [
      { label: 'Causa principal', filled: isStringFilled(data.mainCause) },
      { label: 'Histórico da iniciativa', filled: isStringFilled(data.history) },
      { label: 'Missão', filled: isStringFilled(data.mission) },
      { label: 'Problema prioritário', filled: isStringFilled(data.socialProblem) },
      { label: 'Principais atividades', filled: isStringFilled(data.mainActivities) },
    ];
    const filled = items.filter(i => i.filled).length;
    const total = items.length;
    const pct = total > 0 ? Math.round((filled / total) * 100) : 0;
    steps.push({
      step: 3,
      name: 'Atuação e perfil',
      percentage: pct,
      status: pct === 100 ? 'completed' : pct > 0 ? 'in_progress' : 'pending',
      filled,
      total,
      missing: items.filter(i => !i.filled).map(i => i.label),
    });
  }

  // 4. Público e território
  {
    const items: { label: string; filled: boolean }[] = [
      { label: 'Públicos atendidos', filled: isArrayFilled(data.audiences) },
      { label: 'Faixas etárias', filled: isArrayFilled(data.ageRanges) },
      { label: 'Bairros de atuação', filled: isArrayFilled(data.neighborhoodsOfActivity) },
    ];
    const filled = items.filter(i => i.filled).length;
    const total = items.length;
    const pct = total > 0 ? Math.round((filled / total) * 100) : 0;
    steps.push({
      step: 4,
      name: 'Público e território',
      percentage: pct,
      status: pct === 100 ? 'completed' : pct > 0 ? 'in_progress' : 'pending',
      filled,
      total,
      missing: items.filter(i => !i.filled).map(i => i.label),
    });
  }

  // 5. Resultados e impacto
  {
    const items: { label: string; filled: boolean }[] = [
      { label: 'Beneficiários atendidos', filled: isStringFilled(data.servedLast12Months) },
      { label: 'Atendimentos realizados', filled: isStringFilled(data.totalAttendancesLast12Months) },
      { label: 'Tipo de dado', filled: isStringFilled(data.isEstimateOrExact) },
      { label: 'Resumo das conquistas', filled: isStringFilled(data.mainResultsSummary) },
    ];
    const filled = items.filter(i => i.filled).length;
    const total = items.length;
    const pct = total > 0 ? Math.round((filled / total) * 100) : 0;
    steps.push({
      step: 5,
      name: 'Resultados e impacto',
      percentage: pct,
      status: pct === 100 ? 'completed' : pct > 0 ? 'in_progress' : 'pending',
      filled,
      total,
      missing: items.filter(i => !i.filled).map(i => i.label),
    });
  }

  // 6. ODS e governança
  {
    const items: { label: string; filled: boolean }[] = [
      { label: 'ODS selecionados', filled: isArrayFilled(data.selectedOdsList) },
    ];
    // Add Prioritized ODS explanations to required fields if they exist as priorities
    if (data.priorityOdsList && data.priorityOdsList.length > 0) {
      data.priorityOdsList.forEach(odsId => {
        const hasExplanation = isStringFilled(data.odsExplanations?.[odsId]);
        items.push({
          label: `Explicação do ODS ${odsId.replace('ods_', '')}`,
          filled: hasExplanation
        });
      });
    }
    const filled = items.filter(i => i.filled).length;
    const total = items.length;
    const pct = total > 0 ? Math.round((filled / total) * 100) : 0;
    steps.push({
      step: 6,
      name: 'ODS e governança',
      percentage: pct,
      status: pct === 100 ? 'completed' : pct > 0 ? 'in_progress' : 'pending',
      filled,
      total,
      missing: items.filter(i => !i.filled).map(i => i.label),
    });
  }

  // 7. Recursos e oportunidades
  {
    const items: { label: string; filled: boolean }[] = [
      { label: 'Orçamento anual estimado', filled: isStringFilled(data.annualBudgetRange) },
      { label: 'Conta jurídica ativa', filled: isDefined(data.hasInstitutionalBankInstAccount) },
      { label: 'Pode receber de empresas', filled: isDefined(data.canReceiveCorporateDonations) },
    ];
    const filled = items.filter(i => i.filled).length;
    const total = items.length;
    const pct = total > 0 ? Math.round((filled / total) * 100) : 0;
    steps.push({
      step: 7,
      name: 'Recursos e oportunidades',
      percentage: pct,
      status: pct === 100 ? 'completed' : pct > 0 ? 'in_progress' : 'pending',
      filled,
      total,
      missing: items.filter(i => !i.filled).map(i => i.label),
    });
  }

  // 8. Materiais
  {
    const items: { label: string; filled: boolean }[] = [
      { label: 'Autorização sobre fotos', filled: isDefined(data.photosAuthorization) },
      { label: 'Autorização sobre documentos', filled: isDefined(data.documentsReviewAuthorization) },
    ];
    const filled = items.filter(i => i.filled).length;
    const total = items.length;
    const pct = total > 0 ? Math.round((filled / total) * 100) : 0;
    steps.push({
      step: 8,
      name: 'Materiais',
      percentage: pct,
      status: pct === 100 ? 'completed' : pct > 0 ? 'in_progress' : 'pending',
      filled,
      total,
      missing: items.filter(i => !i.filled).map(i => i.label),
    });
  }

  return steps;
}


export default function App() {
  // State definitions
  const [currentView, setCurrentView] = useState<'home' | 'search' | 'formalization_ask' | 'diagnostic' | 'form' | 'success' | 'admin'>('home');
  const [organizations, setOrganizations] = useState<OrganizationData[]>([]);
  const [formData, setFormData] = useState<OrganizationData>({ ...EMPTY_ORGANIZATION });
  const [originalData, setOriginalData] = useState<OrganizationData | null>(null);
  
  // Wizards
  const [currentStep, setCurrentStep] = useState<number>(1);
  const totalSteps = 8; // Exactly 8 editing stages, the 9th step is the review and consent section
  
  // UI states
  const [fictiveProtocol, setFictiveProtocol] = useState<string>('');
  const [showDraftModal, setShowDraftModal] = useState<boolean>(false);
  const [showExitModal, setShowExitModal] = useState<boolean>(false);
  const [showSummaryModal, setShowSummaryModal] = useState<boolean>(false);
  const [aiGeneratingField, setAiGeneratingField] = useState<string | null>(null);
  const [showHelpNoCnpj, setShowHelpNoCnpj] = useState<boolean>(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [isAutoSavedBlinking, setIsAutoSavedBlinking] = useState<boolean>(false);

  // CEP autocomplete states
  const [isFetchingCep, setIsFetchingCep] = useState<boolean>(false);
  const [cepErrorMessage, setCepErrorMessage] = useState<string>('');

  // Helper function to map neighborhood of Recife to RPA (Região Político-Administrativa)
  const mapNeighborhoodToRpa = (neighborhoodStr: string): string => {
    if (!neighborhoodStr) return '';
    const normalized = neighborhoodStr.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    
    const rpa1 = ['recife', 'santo amaro', 'boa vista', 'cabanga', 'ilha do leite', 'paissandu', 'soledade', 'coelhos', 'santo antonio', 'sao jose'];
    const rpa2 = ['arruda', 'campina do barreto', 'campo grande', 'encruzilhada', 'hipodromo', 'peixinhos', 'ponto de parada', 'rosarinho', 'torreao', 'agua fria', 'alto santa terezinha', 'beberibe', 'bomba do hemeterio', 'cajueiro', 'fundao', 'porto madeira', 'linha do tiro', 'dois unidos', 'passarinho'];
    const rpa3 = ['aflitos', 'alto do mandu', 'apipucos', 'casa amarela', 'casa forte', 'derby', 'dois irmaos', 'espinheiro', 'gracas', 'jaqueira', 'monteiro', 'parnamirim', 'poco da panela', 'santana', 'tamarineira', 'sitio dos pintos', 'macaxeira', 'nova descoberta', 'vasco da gama', 'guabiraba', 'pau ferro', 'brejo da guabiraba', 'brejo de beberibe', 'corrego do jenipapo'];
    const rpa4 = ['cordeiro', 'ilha do retiro', 'iputinga', 'madalena', 'prado', 'torre', 'zumbi', 'engenho do meio', 'san martin', 'varzea', 'cidade universitaria', 'caxanga', 'brasilit', 'roda de fogo'];
    const rpa5 = ['afogados', 'areias', 'barro', 'bongi', 'cacote', 'coque', 'estancia', 'jiquia', 'mustardinha', 'sancho', 'tejipio', 'toto', 'curado', 'jardim sao paulo'];
    const rpa6 = ['boa viagem', 'imbiribeira', 'ipsep', 'pina', 'ibura', 'jordao', 'cohab', 'tres carneiros', 'lagoa do araca'];

    if (rpa1.some(name => normalized.includes(name))) return 'RPA 1';
    if (rpa2.some(name => normalized.includes(name))) return 'RPA 2';
    if (rpa3.some(name => normalized.includes(name))) return 'RPA 3';
    if (rpa4.some(name => normalized.includes(name))) return 'RPA 4';
    if (rpa5.some(name => normalized.includes(name))) return 'RPA 5';
    if (rpa6.some(name => normalized.includes(name))) return 'RPA 6';
    return '';
  };

  // Automatically search address when CEP is 8 digits
  useEffect(() => {
    const cleanCep = formData.cep.replace(/\D/g, '');
    if (cleanCep.length === 8) {
      const fetchAddress = async () => {
        setIsFetchingCep(true);
        setCepErrorMessage('');
        try {
          const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
          if (!response.ok) throw new Error('Falha na comunicação.');
          const data = await response.json();
          if (data.erro) {
            setCepErrorMessage('CEP não encontrado.');
          } else {
            const detectedRpa = mapNeighborhoodToRpa(data.bairro || '');
            setFormData(prev => ({
              ...prev,
              street: data.logradouro || prev.street,
              neighborhood: data.bairro || prev.neighborhood,
              city: data.localidade || prev.city,
              state: data.uf || prev.state,
              rpa: detectedRpa || prev.rpa
            }));
          }
        } catch (err) {
          setCepErrorMessage('Erro ao buscar o CEP na rede.');
          console.error(err);
        } finally {
          setIsFetchingCep(false);
        }
      };
      
      fetchAddress();
    } else {
      setCepErrorMessage('');
    }
  }, [formData.cep]);

  // Operating hours builder helper states
  const [hoursSelectedDays, setHoursSelectedDays] = useState<string[]>(['Seg', 'Ter', 'Qua', 'Qui', 'Sex']);
  const [hoursStartTime, setHoursStartTime] = useState<string>('08:00');
  const [hoursEndTime, setHoursEndTime] = useState<string>('17:00');
  const [showHoursBuilder, setShowHoursBuilder] = useState<boolean>(false);

  // Dynamic step progress metrics
  const stepProgressList = getStepCompletionData(formData);
  const totalFields = stepProgressList.reduce((acc, curr) => acc + curr.total, 0);
  const filledFields = stepProgressList.reduce((acc, curr) => acc + curr.filled, 0);
  const overallPct = totalFields > 0 ? Math.round((filledFields / totalFields) * 100) : 0;

  // Load organizations and check for existing drafts on mount
  useEffect(() => {
    const list = storageService.getOrganizations();
    setOrganizations(list);

    const activeDraft = storageService.getCurrentDraft();
    if (activeDraft) {
      setShowDraftModal(true);
    }
  }, []);

  // Auto-save logic whenever form state modifications are made
  useEffect(() => {
    if (currentView === 'form' && formData.name.trim() !== '') {
      storageService.saveCurrentDraft(formData);
      setIsAutoSavedBlinking(true);
      const timer = setTimeout(() => setIsAutoSavedBlinking(false), 800);
      return () => clearTimeout(timer);
    }
  }, [formData, currentView]);

  // Restore draft
  const handleRestoreDraft = () => {
    const draft = storageService.getCurrentDraft();
    if (draft) {
      setFormData(draft);
      // If it has originalData stored internally, restore it
      const list = storageService.getOrganizations();
      const matchedOrg = list.find(o => o.id === draft.id || (draft.cnpj && o.cnpj === draft.cnpj));
      if (matchedOrg) {
        setOriginalData(matchedOrg);
      }
      setIsNewRegistration(!draft.id);
      setCurrentView('form');
      setCurrentStep(1);
    }
    setShowDraftModal(false);
  };

  const handleDiscardDraft = () => {
    storageService.clearCurrentDraft();
    setShowDraftModal(false);
  };

  // State to track if it's a completely new registration or edit progress
  const [isNewRegistration, setIsNewRegistration] = useState<boolean>(true);

  // Initiates high-fidelity update of pre-existing organization
  const handleSelectOrganization = (org: OrganizationData) => {
    const deepCopiedOrg = JSON.parse(JSON.stringify(org));
    setOriginalData(deepCopiedOrg);
    setFormData(deepCopiedOrg);
    setIsNewRegistration(false);
    setCurrentView('diagnostic');
  };

  // Initiates new organization workflow
  const handleStartNewRegisterFlow = () => {
    setOriginalData(null);
    setFormData({ ...EMPTY_ORGANIZATION });
    setIsNewRegistration(true);
    setCurrentView('formalization_ask');
  };

  const handleFormalizationSelect = (status: OrganizationData['formalizationStatus']) => {
    setFormData(prev => ({ ...prev, formalizationStatus: status }));
    setCurrentView('form');
    setCurrentStep(1);
  };

  // Helpers to define badges signifying previously filled, edited or new states
  const badgeForField = (fieldName: keyof OrganizationData) => {
    if (isNewRegistration) return null;
    if (!originalData) return null;
    
    const valNew = formData[fieldName];
    const valOld = originalData[fieldName];
    
    // For arrays or sublists compare lengths
    if (Array.isArray(valNew) && Array.isArray(valOld)) {
      const isUnchanged = valNew.length === valOld.length && valNew.every(v => valOld.includes(v));
      if (isUnchanged) {
        return <span className="text-[9px] bg-slate-100 text-slate-500 font-bold px-2 py-0.5 rounded uppercase select-none scale-[0.8] inline-block mb-1 ml-1 leading-none">✔️ Historico</span>;
      } else {
        return <span className="text-[9px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded uppercase select-none scale-[0.8] inline-block mb-1 ml-1 leading-none">✏️ Alterado</span>;
      }
    }

    if (valOld && valNew !== valOld && valOld !== '') {
      return <span className="text-[9px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded uppercase select-none scale-[0.8] inline-block mb-1 ml-1 leading-none">✏️ Alterado</span>;
    }
    if (valOld && valNew === valOld) {
      return <span className="text-[9px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded uppercase select-none scale-[0.8] inline-block mb-1 ml-1 leading-none">✔️ Confirmado</span>;
    }
    if (!valOld && valNew) {
      return <span className="text-[9px] bg-sky-100 text-sky-800 font-bold px-2 py-0.5 rounded uppercase select-none scale-[0.8] inline-block mb-1 ml-1 leading-none">✨ Novo</span>;
    }
    return <span className="text-[9px] bg-slate-100 text-slate-400 font-medium px-2 py-0.5 rounded uppercase select-none scale-[0.8] inline-block mb-1 ml-1 leading-none">Pendente</span>;
  };

  // AI text helper simulation rewrite
  const handleAiImproveText = (key: keyof OrganizationData, promptContext: string) => {
    setAiGeneratingField(key);
    
    setTimeout(() => {
      const userText = String(formData[key] || '');
      
      const suggestions: Record<string, string> = {
        history: `Fundada por voluntários locais, a iniciativa social consolidou-se a partir da identificação de vulnerabilidades educacionais e digitais persistentes na comunidade. Desde a fundação, nosso foco reside no desenvolvimento integrado da juventude e na facilitação da inserção tecnológica de famílias da região de Recife.`,
        mission: `Implementar metodologias ativas de inclusão social, gerando oportunidades educacionais avançadas e fortalecendo os arranjos socioeconômicos de grupos comunitários periféricos do Recife.`,
        socialProblem: `O persistente ciclo de exclusão digital e de oportunidades produtivas qualificadas que impede jovens periféricos de acessarem carreiras de alto valor no polo tecnológico do Recife.`,
        differentiator: `Abordagem acolhedora de base territorial dotada de acompanhamento de assistência psicossocial das famílias e alimentação gratuita integral.`
      };

      const rewriteResult = suggestions[key] || `${userText} (Reformulado sob termos didáticos e clareza institucional adequados para catálogos do Bora Impactar, mantendo todos os fatos intactos).`;
      
      setFormData(prev => ({ ...prev, [key]: rewriteResult }));
      setAiGeneratingField(null);
    }, 1500);
  };

  // Generic step transitions
  const handleNextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(prev => prev + 1);
      window.scrollTo(0, 0);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
      window.scrollTo(0, 0);
    }
  };

  // Submission validation
  const validateForm = (): boolean => {
    const list: string[] = [];
    if (!formData.name.trim()) list.push('Nome oficial da organização é obrigatório.');
    if (formData.formalizationStatus === 'with_cnpj' && !formData.cnpj) {
      list.push('Para organizações formalizadas, o CNPJ é obrigatório.');
    }
    if (!formData.legalRepName.trim()) list.push('Nome do responsável legal é obrigatório.');
    if (!formData.phone.trim()) list.push('Telefone de contato é obrigatório.');
    if (!formData.email.trim()) list.push('E-mail institucional é obrigatório e precisa de formato válido.');
    
    // Check compulsory consent boxes on Step 10
    if (!formData.consentTrueInformation) list.push('É necessário declarar que as informações fornecidas são verdadeiras.');
    if (!formData.consentCatalogPublishing) list.push('É necessário autorizar a gestão de dados para publicação no catálogo.');
    
    setValidationErrors(list);
    return list.length === 0;
  };

  // Submission handler (simulated)
  const handleSubmitForm = () => {
    if (!validateForm()) {
      return;
    }

    const submissionResult = storageService.submitRegistration(formData);
    if (submissionResult.success) {
      setFictiveProtocol(submissionResult.protocol);
      setOriginalData(null);
      setCurrentView('success');
    }
  };

  // Materials submission upload simulator
  const simulateFileUpload = (fileKey: keyof OrganizationData['simulatedFiles'], defaultName: string) => {
    setFormData(prev => ({
      ...prev,
      simulatedFiles: {
        ...prev.simulatedFiles,
        [fileKey]: defaultName
      }
    }));
  };

  // Helper to generate and apply standard operating hours string
  const handleApplyCustomHours = (days: string[], start: string, end: string) => {
    if (days.length === 0) return;
    
    let daysStr = '';
    const weekdays = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex'];
    const weekends = ['Sáb', 'Dom'];
    const allDays = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];
    
    // Sort selected days to correspond to week order
    const orderedDays = allDays.filter(d => days.includes(d));
    
    const hasAll = allDays.every(d => days.includes(d));
    const hasWeekdays = weekdays.every(d => days.includes(d)) && weekdays.length === days.length;
    const hasWeekends = weekends.every(d => days.includes(d)) && weekends.length === days.length;
    
    if (hasAll) {
      daysStr = 'Segunda a domingo';
    } else if (hasWeekdays) {
      daysStr = 'Segunda a sexta';
    } else if (hasWeekends) {
      daysStr = 'Sábados e domingos';
    } else {
      // Map abbreviation to full Portuguese weekday names
      const dayMap: Record<string, string> = {
        'Seg': 'Segunda', 'Ter': 'Terça', 'Qua': 'Quarta', 'Qui': 'Quinta', 'Sex': 'Sexta', 'Sáb': 'Sábado', 'Dom': 'Domingo'
      };
      
      if (orderedDays.length === 2 && orderedDays[0] === 'Seg' && orderedDays[1] === 'Sáb') {
        daysStr = 'Segunda a sábado';
      } else {
        daysStr = orderedDays.map(d => dayMap[d]).join(', ');
      }
    }
    
    const formatted = `${daysStr}, das ${start} às ${end}`;
    setFormData(prev => ({ ...prev, operatingHours: formatted }));
  };

  // Specific Lists logic for Step 5 (Impact RESULTS List up to 3)
  const [newResult, setNewResult] = useState({ title: '', description: '', quantity: '', unit: '', period: '', evidence: '' });
  
  const handleAddResult = () => {
    if (!newResult.title || !newResult.quantity) {
      alert('Por favor preencha pelo menos o título e a quantidade.');
      return;
    }
    const resultList = [...(formData.impactResultsList || [])];
    if (resultList.length >= 3) {
      alert('Você pode registrar no máximo até 3 resultados quantitativos.');
      return;
    }
    const item: ImpactResult = {
      id: `res_${Date.now()}`,
      title: newResult.title,
      description: newResult.description,
      quantity: newResult.quantity,
      unit: newResult.unit,
      period: newResult.period,
      evidence: newResult.evidence
    };
    setFormData(prev => ({ ...prev, impactResultsList: [...resultList, item] }));
    setNewResult({ title: '', description: '', quantity: '', unit: '', period: '', evidence: '' });
  };

  const handleRemoveResult = (id: string) => {
    setFormData(prev => ({
      ...prev,
      impactResultsList: (prev.impactResultsList || []).filter(item => item.id !== id)
    }));
  };

  // Specific Lists logic for Step 8 (Opportunities List up to 5)
  const [newOpportunity, setNewOpportunity] = useState({ title: '', category: '', description: '', itemsNeeded: '', quantityNeeded: '', estimatedValue: '', urgency: 'medium' as any, beneficiaryPublic: '' });
  const [expandedOpportunityId, setExpandedOpportunityId] = useState<string | null>(null);

  const handleAddOpportunity = () => {
    if (!newOpportunity.title || !newOpportunity.category) {
      alert('Por favor preencha o título e a categoria da oportunidade.');
      return;
    }
    const list = [...(formData.corporateOpportunitiesList || [])];
    if (list.length >= 5) {
      alert('Você pode cadastrar no máximo até 5 necessidades/oportunidades.');
      return;
    }
    const item: Opportunity = {
      id: `op_${Date.now()}`,
      title: newOpportunity.title,
      category: newOpportunity.category,
      description: newOpportunity.description,
      problemSolved: '',
      itemsNeeded: newOpportunity.itemsNeeded,
      quantityNeeded: newOpportunity.quantityNeeded,
      estimatedValue: newOpportunity.estimatedValue,
      acceptsPartialSupport: true,
      urgency: newOpportunity.urgency,
      deadline: '',
      location: formData.neighborhood || 'Recife',
      beneficiaryPublic: newOpportunity.beneficiaryPublic,
      estimatedBeneficiaryCount: 0,
      expectedResult: '',
      evidencePresented: '',
      offeredCounterparts: ['Uso da marca como apoiadora', 'Certificado de parceria'],
      responsibleName: formData.fillerName || formData.legalRepName,
      status: 'open'
    };
    setFormData(prev => ({ ...prev, corporateOpportunitiesList: [...list, item] }));
    setNewOpportunity({ title: '', category: '', description: '', itemsNeeded: '', quantityNeeded: '', estimatedValue: '', urgency: 'medium', beneficiaryPublic: '' });
  };

  const handleRemoveOpportunity = (id: string) => {
    setFormData(prev => ({
      ...prev,
      corporateOpportunitiesList: (prev.corporateOpportunitiesList || []).filter(item => item.id !== id)
    }));
  };

  const stepNames = [
    'Identificação Básica',
    'Representantes e Contatos',
    'Sobre o Trabalho',
    'Público e Territórios',
    'Resultados e Impacto',
    'ODS, ESG e Governança',
    'Recursos e Oportunidades',
    'Materiais e Apresentação',
    'Revisão e Consentimento'
  ];

  return (
    <div className="min-h-screen bg-bg-light select-none font-sans flex flex-col pt-0 pb-16">
      
      {/* GLOBAL HEADER BAR */}
      <header className="bg-white border-b border-border-soft sticky top-0 z-40 shadow-sm px-4 py-3 select-none">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-12">
            <div className="flex items-center gap-3">
              <BoraImpactarLogo size="sm" />
            </div>
            {currentView === 'form' && (
              <div className="hidden lg:flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className={`text-xs ml-1 font-semibold text-brand-blue ${isAutoSavedBlinking ? 'text-brand-cyan scale-105 transition-all' : ''}`}>
                  Modo Form • Rascunho salvo
                </span>
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-3">
            {currentView !== 'admin' ? (
              <button
                onClick={() => {
                  if (currentView === 'form') {
                    storageService.saveCurrentDraft(formData);
                  }
                  setCurrentView('admin');
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 text-brand-blue hover:text-brand-cyan bg-slate-50 hover:bg-slate-100 rounded-lg text-xs font-bold transition select-none shadow-sm cursor-pointer"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-brand-cyan" />
                <span>Painel Admin</span>
              </button>
            ) : (
              <button
                onClick={() => {
                  setCurrentView('home');
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 text-brand-blue hover:text-brand-cyan bg-slate-50 hover:bg-slate-100 rounded-lg text-xs font-bold transition select-none shadow-sm cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5 text-brand-cyan" />
                <span>Voltar ao Portal</span>
              </button>
            )}

            {currentView !== 'home' && currentView !== 'admin' && (
              <button
                onClick={() => setShowExitModal(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 border border-red-100 text-red-700 bg-red-50 hover:bg-red-100 rounded-lg text-xs font-bold transition select-none shadow-sm cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Sair e Continuar Depois</span>
                <span className="sm:hidden">Sair</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* DRAFT DETECTED MODAL */}
      {showDraftModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-xl overflow-hidden animate-in fade-in duration-200">
            <div className="p-5 border-b border-slate-100 bg-emerald-50 flex items-center gap-3">
              <div className="p-2.5 bg-emerald-100 text-emerald-800 rounded-lg">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">Recuperação Segura</span>
                <h3 className="font-bold text-brand-blue text-sm leading-tight">
                  Rascunho Encontrado!
                </h3>
              </div>
            </div>
            
            <div className="p-5 space-y-3">
              <p className="text-xs text-slate-600 leading-relaxed">
                Identificamos um progresso salvo no navegador em sua última sessão. Deseja restaurar as respostas anteriores e continuar de onde parou?
              </p>
            </div>

            <div className="p-5 bg-slate-50 border-t border-slate-100 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={handleDiscardDraft}
                className="py-2 px-3 border border-slate-200 hover:bg-slate-100 rounded-lg text-xs font-semibold text-slate-500 text-center transition"
              >
                Descartar rascunho
              </button>
              <button
                type="button"
                onClick={handleRestoreDraft}
                className="py-2 px-3 bg-brand-blue hover:bg-brand-cyan text-white rounded-lg text-xs font-semibold text-center transition shadow-sm animate-pulse"
              >
                Restaurar e Continuar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EXIT CONFIRM MODAL */}
      {showExitModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-xl overflow-hidden animate-in fade-in duration-200">
            <div className="p-5 border-b border-slate-100 bg-slate-50 flex items-center gap-3">
              <div className="p-2.5 bg-brand-cyan/10 text-brand-cyan rounded-lg">
                <Save className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-brand-blue text-sm leading-tight">
                  Salvar Rascunho e Sair?
                </h3>
              </div>
            </div>
            
            <div className="p-5 space-y-3">
              <p className="text-xs text-slate-600 leading-relaxed">
                Seu progresso da atualização cadastral foi <strong className="text-brand-blue">salvo automaticamente no navegador</strong>. 
              </p>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Você pode fechar com segurança esta aba e, ao retornar ao formulário futuramente usando o mesmo computador e navegador, seu progresso será restaurado integralmente.
              </p>
            </div>

            <div className="p-5 bg-slate-50 border-t border-slate-100 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setShowExitModal(false)}
                className="py-2 px-3 border border-slate-200 hover:bg-slate-100 rounded-lg text-xs font-semibold text-slate-500 text-center transition"
              >
                Voltar ao preenchimento
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowExitModal(false);
                  setCurrentView('home');
                }}
                className="py-2 px-3 bg-brand-blue hover:bg-brand-cyan text-white rounded-lg text-xs font-semibold text-center transition shadow-sm"
              >
                Salvar e Sair
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MAIN VIEWPORT CARD ROUTING */}
      <main className="flex-1 w-full max-w-5xl mx-auto px-4 mt-6">
        
        {/* VIEW 1: HOME PANEL */}
        {currentView === 'home' && (
          <div className="flex flex-col items-center justify-center py-10">
            <SearchSection
              organizations={organizations}
              onSelect={handleSelectOrganization}
              onNewRegister={handleStartNewRegisterFlow}
              onHelpNoCnpj={() => setShowHelpNoCnpj(true)}
            />
          </div>
        )}

        {/* VIEW 2: ASK FORMALIZATION FOR NEW REGISTER */}
        {currentView === 'formalization_ask' && (
          <div className="max-w-xl mx-auto bg-white p-8 rounded-2xl border border-slate-200 shadow-md">
            <div className="flex items-center gap-2 text-brand-blue font-bold text-base border-b border-slate-100 pb-3 mb-4">
              <Building2 className="w-5 h-5 text-brand-cyan" />
              <span>Diagnóstico Inicial: Situação da Iniciativa</span>
            </div>
            <p className="text-xs text-slate-500 mb-5 leading-relaxed">
              Para prepararmos o formulário adequado às suas necessidades tributárias e fiscais, selecione a situação jurídica atual da sua organização ou projeto:
            </p>

            <div className="space-y-3">
              {[
                { value: 'with_cnpj', title: 'Organização com CNPJ próprio', desc: 'Sua associação, instituto ou cooperativa possui registro ativo na Receita Federal.' },
                { value: 'no_cnpj', title: 'Projeto ou coletivo sem CNPJ', desc: 'Iniciativas comunitárias, grupos artísticos e informais que atuam sem representação jurídica própria.' },
                { value: 'linked', title: 'Projeto vinculado a outra organização', desc: 'Sua iniciativa social opera sob a chancela fiduciária e CNPJ de uma organização parceira.' },
                { value: 'formalizing', title: 'Em processo de formalização', desc: 'Reunião de documentação, estatutos, ou em trâmite cartorial ativo em Recife.' }
              ].map((opt) => (
                <div
                  key={opt.value}
                  onClick={() => handleFormalizationSelect(opt.value as any)}
                  className="p-4 rounded-xl border border-slate-100 hover:border-brand-cyan hover:bg-blue-50/20 cursor-pointer transition select-none flex items-start gap-3"
                >
                  <div className="w-5 h-5 rounded-full border border-slate-300 shrink-0 mt-0.5 flex items-center justify-center peer-checked:bg-brand-blue text-brand-cyan font-bold text-[11px]">
                    ●
                  </div>
                  <div>
                    <h3 className="font-bold text-xs text-brand-blue">{opt.title}</h3>
                    <p className="text-[10px] text-slate-500 mt-0.5 leading-normal">{opt.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex justify-between">
              <button
                type="button"
                onClick={() => setCurrentView('home')}
                className="py-1.5 px-4 border border-slate-200 text-slate-600 rounded-lg text-xs font-semibold hover:bg-slate-50"
              >
                Voltar à busca
              </button>
            </div>
          </div>
        )}

        {/* VIEW 3: HISTORICAL DIAGNOSTIC (PRE-LOADED SUCCESS SUMMARY) */}
        {currentView === 'diagnostic' && originalData && (
          <div className="max-w-3xl mx-auto bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-md">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4 mb-5">
              <div className="p-3 bg-brand-cyan/10 text-brand-cyan rounded-xl shrink-0">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-brand-cyan uppercase tracking-wider block">Registros Localizados</span>
                <h3 className="font-bold text-brand-blue text-base leading-tight">
                  {originalData.name}
                </h3>
              </div>
            </div>

            <div className="space-y-6">
              <p className="text-xs text-slate-600 leading-relaxed">
                Carregamos com sucesso o histórico dos dados da sua organização no Recife. Realizamos um diagnóstico prévio da completitude do preenchimento histórico por etapa técnica para facilitar seu trabalho:
              </p>

              {/* Dynamic diagnostic stats block */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-100 text-center select-none shadow-sm">
                <div className="p-2.5 bg-white rounded-lg border border-slate-100 flex flex-col justify-center">
                  <span className="text-2xl font-extrabold text-emerald-600">{filledFields}</span>
                  <span className="text-[10px] text-slate-400 block mt-[-2px]">campos preenchidos</span>
                </div>
                <div className="p-2.5 bg-white rounded-lg border border-slate-100 flex flex-col justify-center">
                  <span className="text-2xl font-extrabold text-amber-600">{totalFields - filledFields}</span>
                  <span className="text-[10px] text-slate-400 block mt-[-2px]">campos pendentes</span>
                </div>
                <div className="p-2.5 bg-white rounded-lg border border-slate-100 flex flex-col justify-center">
                  <span className="text-[9px] font-bold uppercase text-brand-cyan tracking-wider block mb-1">Completitude Geral</span>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden flex">
                    <div className="bg-brand-cyan h-full transition-all duration-300" style={{ width: `${overallPct}%` }} />
                  </div>
                  <span className="text-xs font-bold text-brand-cyan block mt-1">{overallPct}% completo</span>
                </div>
              </div>

              {/* VISUAL 'PROGRESS MAP' (GRID OF 10 STEPS) */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold uppercase text-brand-blue tracking-wider block">📊 Mapa Temático de Preenchimento (10 Etapas)</span>
                  <span className="text-[9px] font-bold text-brand-cyan uppercase bg-blue-50 px-2 py-0.5 rounded tracking-wide animate-pulse">
                    Passe o mouse p/ ver pendências • Clique p/ abrir
                  </span>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
                  {stepProgressList.map((stepInfo) => (
                    <button
                      key={stepInfo.step}
                      type="button"
                      onClick={() => {
                        setCurrentView('form');
                        setCurrentStep(stepInfo.step);
                      }}
                      className="group relative flex flex-col p-3 rounded-xl border text-left bg-white transition-all duration-150 hover:ring-2 hover:ring-brand-cyan/20 hover:border-brand-cyan shadow-sm select-none cursor-pointer"
                    >
                      <div className="flex justify-between items-start mb-1">
                        <span className="text-[9px] font-extrabold text-slate-400 group-hover:text-brand-cyan uppercase tracking-normal">
                          Etapa {stepInfo.step}
                        </span>
                        {stepInfo.percentage === 100 ? (
                          <span className="text-emerald-500 font-bold text-[9px] flex items-center gap-0.5" title="Concluída">
                            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                            OK
                          </span>
                        ) : stepInfo.percentage > 0 ? (
                          <span className="text-amber-500 font-bold text-[9px] flex items-center gap-0.5" title="Em andamento">
                            <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-ping" style={{ animationDuration: '2s' }} />
                            {stepInfo.percentage}%
                          </span>
                        ) : (
                          <span className="text-slate-300 font-bold text-[9px] flex items-center gap-0.5" title="Pendente">
                            <span className="w-1.5 h-1.5 bg-slate-300 rounded-full" />
                            Vazia
                          </span>
                        )}
                      </div>
                      
                      <span className="text-[11px] font-bold text-brand-blue line-clamp-2 leading-tight group-hover:text-brand-cyan mb-2 min-h-[1.8rem]">
                        {stepInfo.name}
                      </span>
                      
                      <div className="mt-auto">
                        <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                          <div 
                            className={`h-full transition-all duration-300 ${
                              stepInfo.percentage === 100 
                                ? 'bg-emerald-500' 
                                : stepInfo.percentage > 0 
                                  ? 'bg-amber-500' 
                                  : 'bg-slate-200'
                            }`}
                            style={{ width: `${stepInfo.percentage}%` }}
                          />
                        </div>
                        <div className="flex justify-between items-center mt-1 text-[9px] font-mono text-slate-400">
                          <span>{stepInfo.percentage}%</span>
                          <span>{stepInfo.filled}/{stepInfo.total}</span>
                        </div>
                      </div>

                      {/* Diagnostic popover tooltip showing missing fields */}
                      {stepInfo.missing.length > 0 && (
                        <div className="invisible opacity-0 group-hover:visible group-hover:opacity-100 hover:visible hover:opacity-100 absolute z-50 left-1/2 -translate-x-1/2 bottom-full mb-3 w-56 p-3 bg-slate-900 border border-slate-700 text-slate-100 rounded-xl shadow-2xl transition-all duration-200 ease-out pointer-events-none select-text">
                          <div className="font-bold border-b border-slate-800 pb-1.5 mb-1.5 text-amber-400 text-[10px] uppercase tracking-normal">
                            ⚠️ {stepInfo.missing.length} campo{stepInfo.missing.length > 1 ? 's' : ''} pendente{stepInfo.missing.length > 1 ? 's' : ''}:
                          </div>
                          <ul className="space-y-1 text-[10px] text-slate-300 font-normal">
                            {stepInfo.missing.slice(0, 5).map((field, idx) => (
                              <li key={idx} className="truncate flex items-start gap-1">
                                <span className="text-amber-500 shrink-0 select-none">•</span>
                                <span>{field}</span>
                              </li>
                            ))}
                            {stepInfo.missing.length > 5 && (
                              <li className="text-slate-400 font-semibold italic text-[9px]">e mais {stepInfo.missing.length - 5} pendências...</li>
                            )}
                          </ul>
                          {/* Pointer Arrow */}
                          <span className="absolute top-full -translate-y-1.5 left-1/2 -translate-x-1/2 w-3 h-3 rotate-45 bg-slate-900 border-r border-b border-slate-700" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Legend references */}
              <div className="space-y-2 border-t border-slate-100 pt-4 select-none">
                <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block mb-1">Guia de Cores das Etapas:</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 text-[11px] font-semibold text-slate-600">
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" /> ✔️ Concluída (100%)</span>
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0" /> 🕒 Em andamento</span>
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-slate-300 shrink-0" /> 📭 Pendente (0%)</span>
                  <span className="text-slate-400 italic text-[10px] sm:col-span-1">Clique em qualquer etapa para ir direto!</span>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-slate-100 flex justify-between">
              <button
                type="button"
                onClick={() => setCurrentView('home')}
                className="py-1.5 px-4 border border-slate-200 text-slate-600 rounded-lg text-xs font-semibold hover:bg-slate-50"
              >
                Voltar à busca
              </button>
              <button
                type="button"
                onClick={() => {
                  setCurrentView('form');
                  // Find first incomplete step or default to 1
                  const firstIncomplete = stepProgressList.find(s => s.percentage < 100);
                  setCurrentStep(firstIncomplete ? firstIncomplete.step : 1);
                }}
                className="py-2 px-5 bg-brand-blue hover:bg-brand-cyan text-white text-xs font-semibold rounded-lg flex items-center gap-1 transition shadow-sm cursor-pointer"
              >
                <span>Acessar formulário</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* VIEW 4: MAIN MULTI-STEP WIZARD FORM */}
        {currentView === 'form' && (
          <div className="space-y-6">
            
            {/* ProgressBar helper */}
            <ProgressBar
              currentStep={currentStep}
              totalSteps={totalSteps}
              stepName={stepNames[currentStep - 1]}
            />

            {/* Active details indicator flag */}
            <div className="p-3.5 bg-brand-cyan/5 border border-brand-cyan/10 rounded-xl flex items-center justify-between gap-3 text-xs select-none">
              <div className="flex items-center gap-2 text-brand-blue font-bold">
                <Building2 className="w-4 h-4 shrink-0 text-brand-cyan" />
                <span>Organização em edição: {formData.name || '(Nova Organização)'}</span>
              </div>
              <div className="hidden sm:block text-[10px] bg-white border border-slate-100 text-brand-blue font-bold py-1 px-2.5 rounded-full uppercase">
                {formData.formalizationStatus === 'with_cnpj' ? 'Com CNPJ' : 'Sem CNPJ / Coletivo'}
              </div>
            </div>

            {/* FORM CONTAINER CARD */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
              
              {/* STEP 1: IDENTIFICATION */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-xs text-brand-text-sub leading-normal">
                    📌 <strong>Introdução desta etapa:</strong> Confira os dados básicos da organização ou projeto e atualize o que for necessário. Campos com sinalização ajudam a monitorar a fidedignidade dos registros históricos.
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <InputField
                      id="name"
                      label="Nome oficial da organização ou projeto"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      exampleText="Instituto Esperança Recife"
                      helpText={badgeForField('name') as any}
                    />

                    <InputField
                      id="tradingName"
                      label="Nome conhecido como"
                      value={formData.tradingName}
                      onChange={(e) => setFormData(prev => ({ ...prev, tradingName: e.target.value }))}
                      exampleText="Esperança Recife"
                      helpText={badgeForField('tradingName') as any}
                    />

                    <SelectField
                      id="formalizationStatus"
                      label="Situação de formalização"
                      required
                      options={[
                        { value: 'with_cnpj', label: 'Organização com CNPJ próprio' },
                        { value: 'no_cnpj', label: 'Projeto ou coletivo sem CNPJ' },
                        { value: 'linked', label: 'Projeto vinculado a outra organização' },
                        { value: 'formalizing', label: 'Em processo de formalização' }
                      ]}
                      value={formData.formalizationStatus}
                      onChange={(e) => setFormData(prev => ({ ...prev, formalizationStatus: e.target.value as any }))}
                    />

                    {/* Conditional rendering depending on CNPJ status */}
                    {formData.formalizationStatus === 'with_cnpj' ? (
                      <InputField
                        id="cnpj"
                        label="CNPJ"
                        required
                        value={formData.cnpj}
                        onChange={(e) => setFormData(prev => ({ ...prev, cnpj: CnpjMaskHelper(e.target.value) }))}
                        placeholder="00.000.000/0000-00"
                        helpText={badgeForField('cnpj') as any}
                      />
                    ) : (
                      <div className="sm:col-span-1 p-3.5 bg-blue-50/50 border border-brand-cyan/10 rounded-xl flex items-start gap-2.5 text-[11px] leading-relaxed text-slate-800">
                        <span>ℹ️</span>
                        <div>
                          <p className="font-bold text-brand-blue">Iniciativas e Coletivos sem CNPJ:</p>
                          <p className="text-[10px] text-brand-text-sub">Fique tranquilo(a)! O Bora Impactar apoia e fomenta coletivos, cooperativas informais e projetos em formalização. O número fiscal de cadastro foi omitido automaticamente.</p>
                        </div>
                      </div>
                    )}

                    {formData.formalizationStatus === 'linked' && (
                      <div className="sm:col-span-2 p-4 bg-slate-50 border border-slate-100 rounded-xl space-y-3.5">
                        <span className="text-xs font-bold text-brand-blue block">Vínculos Institucionais:</span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <InputField
                            id="parentOrgName"
                            label="Nome da organização responsável vinculada"
                            value={formData.parentOrgName || ''}
                            onChange={(e) => setFormData(prev => ({ ...prev, parentOrgName: e.target.value }))}
                          />
                          <InputField
                            id="parentOrgCnpj"
                            label="CNPJ da organização parceira"
                            value={formData.parentOrgCnpj || ''}
                            onChange={(e) => setFormData(prev => ({ ...prev, parentOrgCnpj: CnpjMaskHelper(e.target.value) }))}
                            placeholder="00.000.000/0000-00"
                          />
                        </div>
                      </div>
                    )}

                    <div className="flex flex-col space-y-2">
                      <InputField
                        id="foundationYear"
                        label="Ano de fundação / início das de atuação"
                        value={formData.foundationYear}
                        onChange={(e) => setFormData(prev => ({ ...prev, foundationYear: e.target.value.replace(/\D/g, '') }))}
                        maxLength={4}
                        placeholder="Ex: 2015"
                        helpText={badgeForField('foundationYear') as any}
                      />
                      
                      {/* Interactive year suggestions and real-time age calculator */}
                      <div className="mt-1 bg-slate-50 border border-slate-100 p-2.5 rounded-xl space-y-2 select-none">
                        <div className="flex flex-wrap gap-1 items-center">
                          <span className="text-[10px] text-gray-500 font-medium mr-1">Preenchimento rápido:</span>
                          {[2026, 2025, 2024, 2023, 2022, 2020, 2018, 2015, 2010, 2005, 2000, 1995, 1990].map((y) => (
                            <button
                              key={y}
                              type="button"
                              onClick={() => setFormData(prev => ({ ...prev, foundationYear: String(y) }))}
                              className={`text-[10px] font-mono px-2 py-1 rounded-md border transition cursor-pointer ${
                                formData.foundationYear === String(y)
                                  ? 'bg-brand-blue text-white border-brand-blue font-bold shadow-sm'
                                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                              }`}
                            >
                              {y}
                            </button>
                          ))}
                        </div>
                        
                        {formData.foundationYear && (() => {
                          const yearNum = parseInt(formData.foundationYear, 10);
                          const currentYear = 2026;
                          if (isNaN(yearNum)) return null;
                          if (yearNum > currentYear) {
                            return (
                              <p className="text-[11px] font-medium text-red-500 flex items-center gap-1">
                                ⚠️ Atenção: O ano informado ({yearNum}) está no futuro. Por favor, confira o preenchimento.
                              </p>
                            );
                          }
                          if (yearNum < 1900) {
                            return (
                              <p className="text-[11px] font-medium text-amber-600 flex items-center gap-1">
                                ⚠️ Verifique se o ano {yearNum} está correto para uma organização ativa.
                              </p>
                            );
                          }
                          const yearsDelta = currentYear - yearNum;
                          return (
                            <p className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1 bg-emerald-50/50 p-1.5 rounded border border-emerald-100/30">
                              ✨ A iniciativa tem aproximadamente <strong className="underline font-bold">{yearsDelta === 0 ? 'menos de 1 ano' : `${yearsDelta} ${yearsDelta === 1 ? 'ano' : 'anos'}`}</strong> de atuação histórica reconhecida no Recife!
                            </p>
                          );
                        })()}
                      </div>
                    </div>

                    <div className="flex flex-col space-y-3 sm:col-span-2 border border-slate-100 bg-slate-50/30 p-4 rounded-xl">
                      <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                        <span className="text-xs font-bold text-brand-blue uppercase tracking-wider block">⌚ Horário de Atendimento e Funcionamento</span>
                        <button
                          type="button"
                          onClick={() => setShowHoursBuilder(!showHoursBuilder)}
                          className="text-[11px] font-bold text-brand-cyan hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          {showHoursBuilder ? '✕ Fechar Assistente' : '✨ Usar Assistente de Horários'}
                        </button>
                      </div>

                      <InputField
                        id="operatingHours"
                        label="Horário de funcionamento ordinário (Resumo consolidado)"
                        value={formData.operatingHours}
                        onChange={(e) => setFormData(prev => ({ ...prev, operatingHours: e.target.value }))}
                        exampleText="Segunda a sexta, das 09:00 às 17h"
                        helpText={badgeForField('operatingHours') as any}
                      />

                      {/* Default Common Presets list */}
                      <div className="space-y-2 select-none">
                        <span className="text-[11px] font-semibold text-slate-500 block">Preencher rapidamente com perfis comuns:</span>
                        <div className="flex flex-wrap gap-1.5">
                          {[
                            { label: '🏢 Seg a Sex (08h às 17h)', val: 'Segunda a sexta, das 08:00 às 17:00' },
                            { label: '🏫 Seg a Sex (08h às 12h / 13h às 17h)', val: 'Segunda a sexta, das 08:00 às 12:00 e das 13:00 às 17:00' },
                            { label: '📅 Seg a Sáb (08h às 12h)', val: 'Segunda a sábado, das 08:00 às 12:00' },
                            { label: '⏰ Sob Demanda / Agendamento', val: 'Atendimento sob agendamento prévio ou voltado a projetos' },
                            { label: '🌌 Plantão / 24 Horas', val: 'Funcionamento ininterrupto (24h por dia, 7 dias por semana)' }
                          ].map((perf, index) => (
                            <button
                              key={index}
                              type="button"
                              onClick={() => {
                                setFormData(prev => ({ ...prev, operatingHours: perf.val }));
                                // If the user clicked a preset, we sync the hours builder state as well for coherence
                                if (perf.val.includes('08:00') && perf.val.includes('17:00')) {
                                  setHoursStartTime('08:00');
                                  setHoursEndTime('17:00');
                                } else if (perf.val.includes('09:00') && perf.val.includes('18:00')) {
                                  setHoursStartTime('09:00');
                                  setHoursEndTime('18:00');
                                }
                              }}
                              className={`text-[10px] font-medium py-1 px-2.5 rounded-lg border transition cursor-pointer ${
                                formData.operatingHours === perf.val
                                  ? 'bg-brand-cyan text-white border-brand-cyan font-bold shadow-sm'
                                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                              }`}
                            >
                              {perf.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Interactive Time config panel */}
                      {showHoursBuilder && (
                        <div className="p-4 bg-white border border-slate-100 rounded-xl space-y-3.5 animate-in slide-in-from-top-2 duration-200">
                          <span className="text-[11px] font-bold text-brand-blue uppercase tracking-normal block">✨ Assistente de Montagem Customizada</span>
                          
                          <div className="space-y-1.5">
                            <span className="text-[10px] font-semibold text-slate-500 block">1. Selecione os dias de funcionamento:</span>
                            <div className="flex flex-wrap gap-1.5">
                              {['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'].map((d) => {
                                const isActive = hoursSelectedDays.includes(d);
                                return (
                                  <button
                                    key={d}
                                    type="button"
                                    onClick={() => {
                                      const updated = isActive
                                        ? hoursSelectedDays.filter(item => item !== d)
                                        : [...hoursSelectedDays, d];
                                      setHoursSelectedDays(updated);
                                      handleApplyCustomHours(updated, hoursStartTime, hoursEndTime);
                                    }}
                                    className={`py-1 px-3 text-xs font-bold rounded-lg border transition cursor-pointer ${
                                      isActive
                                        ? 'bg-brand-blue text-white border-brand-blue'
                                        : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100'
                                    }`}
                                  >
                                    {d}
                                  </button>
                                );
                              })}
                            </div>
                            <div className="flex gap-2 mt-1 select-none">
                              <button
                                type="button"
                                onClick={() => {
                                  const updated = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex'];
                                  setHoursSelectedDays(updated);
                                  handleApplyCustomHours(updated, hoursStartTime, hoursEndTime);
                                }}
                                className="text-[9px] text-gray-500 underline font-medium hover:text-brand-blue cursor-pointer"
                              >
                                Segunda a Sexta
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  const updated = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
                                  setHoursSelectedDays(updated);
                                  handleApplyCustomHours(updated, hoursStartTime, hoursEndTime);
                                }}
                                className="text-[9px] text-gray-500 underline font-medium hover:text-brand-blue cursor-pointer"
                              >
                                Segunda a Sábado
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  const updated = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];
                                  setHoursSelectedDays(updated);
                                  handleApplyCustomHours(updated, hoursStartTime, hoursEndTime);
                                }}
                                className="text-[9px] text-gray-500 underline font-medium hover:text-brand-blue cursor-pointer"
                              >
                                Todos os dias (Dom a Dom)
                              </button>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-3 pb-1 border-t border-slate-100 pt-3">
                            <div>
                              <span className="text-[10px] font-semibold text-slate-500 block mb-1">2. Hora Inicial:</span>
                              <select
                                value={hoursStartTime}
                                onChange={(e) => {
                                  setHoursStartTime(e.target.value);
                                  handleApplyCustomHours(hoursSelectedDays, e.target.value, hoursEndTime);
                                }}
                                className="w-full bg-slate-50 border border-slate-200 text-xs rounded-lg p-2 font-mono"
                              >
                                {['06:00', '07:00', '07:30', '08:00', '08:30', '09:00', '09:30', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'].map(t => (
                                  <option key={t} value={t}>{t}</option>
                                ))}
                              </select>
                            </div>
                            <div>
                              <span className="text-[10px] font-semibold text-slate-500 block mb-1">3. Hora Final:</span>
                              <select
                                value={hoursEndTime}
                                onChange={(e) => {
                                  setHoursEndTime(e.target.value);
                                  handleApplyCustomHours(hoursSelectedDays, hoursStartTime, e.target.value);
                                }}
                                className="w-full bg-slate-50 border border-slate-200 text-xs rounded-lg p-2 font-mono"
                              >
                                {['12:00', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30', '18:00', '18:30', '19:00', '19:30', '20:00', '21:00', '22:00', '23:00'].map(t => (
                                  <option key={t} value={t}>{t}</option>
                                ))}
                              </select>
                            </div>
                          </div>
                          
                          <div className="bg-blue-50/50 rounded-lg p-2 border border-blue-100 text-center select-none">
                            <span className="text-[10px] font-bold text-slate-400 block uppercase">Pré-visualização do Horário Gerado:</span>
                            <span className="text-xs font-extrabold text-brand-blue tracking-tight block mt-0.5">
                              {hoursSelectedDays.length === 0 ? '(Selecione os dias)' : `${hoursSelectedDays.join(', ')} das ${hoursStartTime} às ${hoursEndTime}`}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Address sub-bento */}
                  <div className="border-t border-slate-100 pt-5 space-y-4">
                    <span className="text-xs font-bold text-brand-blue uppercase tracking-wider block">📍 Endereço e Território de Operação</span>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <InputField
                        id="cep"
                        label="CEP"
                        value={formData.cep}
                        onChange={(e) => setFormData(prev => ({ ...prev, cep: CepMaskHelper(e.target.value) }))}
                        placeholder="00000-000"
                        error={cepErrorMessage}
                        helpText={isFetchingCep ? 'Buscando endereço...' : (badgeForField('cep') as any)}
                        icon={isFetchingCep ? <Loader2 className="w-4 h-4 text-brand-cyan animate-spin" /> : undefined}
                      />
                      <InputField
                        id="street"
                        label="Logradouro / Avenida / Rua"
                        value={formData.street}
                        onChange={(e) => setFormData(prev => ({ ...prev, street: e.target.value }))}
                        className="sm:col-span-2"
                      />
                      <InputField
                        id="number"
                        label="Número"
                        value={formData.number}
                        onChange={(e) => setFormData(prev => ({ ...prev, number: e.target.value }))}
                      />
                      <InputField
                        id="neighborhood"
                        label="Bairro"
                        value={formData.neighborhood}
                        onChange={(e) => setFormData(prev => ({ ...prev, neighborhood: e.target.value }))}
                        helpText={badgeForField('neighborhood') as any}
                      />
                      <InputField
                        id="city"
                        label="Cidade"
                        value={formData.city}
                        disabled
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2: CONTACTS */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-xs text-brand-text-sub leading-normal">
                    📞 <strong>Introdução desta etapa:</strong> Informe quem poderá ser procurado pela equipe do Bora Impactar e, quando autorizado, por potenciais parceiros ou empresas apoiadoras.
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <InputField
                      id="legalRepName"
                      label="Nome do responsável legal pela entidade"
                      required
                      value={formData.legalRepName}
                      onChange={(e) => setFormData(prev => ({ ...prev, legalRepName: e.target.value }))}
                      helpText={badgeForField('legalRepName') as any}
                    />

                    <InputField
                      id="legalRepRole"
                      label="Função ou cargo institucional"
                      value={formData.legalRepRole}
                      onChange={(e) => setFormData(prev => ({ ...prev, legalRepRole: e.target.value }))}
                      exampleText="Diretor Executivo"
                    />

                    <InputField
                      id="fillerName"
                      label="Nome do responsável por preencher este formulário"
                      value={formData.fillerName}
                      onChange={(e) => setFormData(prev => ({ ...prev, fillerName: e.target.value }))}
                      helpText={badgeForField('fillerName') as any}
                    />

                    <InputField
                      id="phone"
                      label="Telefone institucional de contato"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData(prev => ({ ...prev, phone: PhoneMaskHelper(e.target.value) }))}
                      placeholder="(00) 00000-0000"
                      helpText={badgeForField('phone') as any}
                    />

                    <InputField
                      id="whatsapp"
                      label="WhatsApp oficial para contato rápido"
                      value={formData.whatsapp}
                      onChange={(e) => setFormData(prev => ({ ...prev, whatsapp: PhoneMaskHelper(e.target.value) }))}
                      helpText={badgeForField('whatsapp') as any}
                    />

                    <InputField
                      id="email"
                      label="E-mail principal"
                      required
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="contato@organizacao.org"
                      helpText={badgeForField('email') as any}
                    />

                    <InputField
                      id="website"
                      label="Site oficial da organização"
                      value={formData.website}
                      onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                      placeholder="www.suaorganizacao.org"
                    />

                    <InputField
                      id="instagram"
                      label="Instagram institucional"
                      value={formData.instagram}
                      onChange={(e) => setFormData(prev => ({ ...prev, instagram: e.target.value }))}
                      placeholder="@nomeinstagram"
                      helpText={badgeForField('instagram') as any}
                    />
                  </div>

                  {/* Permissions checkboxes as requested by prompt under Stage 2 */}
                  <div className="border-t border-slate-100 pt-5 space-y-3 select-none">
                    <span className="text-xs font-bold text-brand-blue uppercase tracking-wider block">🔐 Gestão de visibilidade e compartilhamento dos contatos</span>
                    <p className="text-[11px] text-slate-500 leading-normal mb-2">Quem tem permissão para visualizar e contatar estes canais?</p>
                    
                    <div className="space-y-2">
                      {[
                        { key: 'phonePermission', label: 'Telefone Institucional de Contato' },
                        { key: 'whatsappPermission', label: 'WhatsApp de Contato Rápido' },
                        { key: 'emailPermission', label: 'E-mail Principal de Correspondência' }
                      ].map((item) => (
                        <div key={item.key} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 bg-slate-50 rounded-xl border border-slate-100">
                          <span className="text-xs font-semibold text-slate-700">{item.label}</span>
                          <div className="flex gap-2 shrink-0">
                            {[
                              { val: 'internal', label: 'Apenas equipe' },
                              { val: 'partners', label: 'Empresas parceiras' },
                              { val: 'public', label: 'Catálogo público' }
                            ].map((opt) => (
                              <button
                                key={opt.val}
                                type="button"
                                onClick={() => setFormData(prev => ({ ...prev, [item.key]: opt.val as any }))}
                                className={`px-2.5 py-1.5 rounded-lg text-[10px] font-bold border transition ${
                                  formData[item.key as keyof OrganizationData] === opt.val
                                    ? 'bg-brand-blue text-white border-brand-blue'
                                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                                }`}
                              >
                                {opt.label}
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Preferences for emails/reminders */}
                  <div className="border-t border-slate-100 pt-5 space-y-3 select-none">
                    <span className="text-xs font-bold text-brand-blue uppercase tracking-wider block">📧 Preferências de Comunicação e Alertas</span>
                    <p className="text-[11px] text-slate-500 leading-normal mb-2">Selecione quais alertas você deseja receber no e-mail informado ({formData.email || 'não preenchido'}):</p>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <label 
                        className={`flex items-start gap-3 p-3.5 rounded-xl border transition cursor-pointer select-none ${
                          formData.wantEmailConfirmation
                            ? 'bg-blue-50/45 border-brand-cyan/30 text-brand-blue'
                            : 'bg-white border-slate-150 hover:bg-slate-50'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={Boolean(formData.wantEmailConfirmation)}
                          onChange={(e) => setFormData(prev => ({ ...prev, wantEmailConfirmation: e.target.checked }))}
                          className="rounded border-slate-300 text-brand-blue w-4 h-4 shrink-0 mt-0.5 accent-brand-cyan"
                        />
                        <div className="flex flex-col">
                          <span className="text-xs font-bold">E-mail de Confirmação</span>
                          <span className="text-[11.5px] text-slate-650 mt-0.5 leading-normal">
                            Receber um e-mail com o comprovante e resumo dos dados enviados logo após a submissão.
                          </span>
                        </div>
                      </label>

                      <label 
                        className={`flex items-start gap-3 p-3.5 rounded-xl border transition cursor-pointer select-none ${
                          formData.wantDeadlineReminders
                            ? 'bg-blue-50/45 border-brand-cyan/30 text-brand-blue'
                            : 'bg-white border-slate-150 hover:bg-slate-50'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={Boolean(formData.wantDeadlineReminders)}
                          onChange={(e) => setFormData(prev => ({ ...prev, wantDeadlineReminders: e.target.checked }))}
                          className="rounded border-slate-300 text-brand-blue w-4 h-4 shrink-0 mt-0.5 accent-brand-cyan"
                        />
                        <div className="flex flex-col">
                          <span className="text-xs font-bold">Lembretes de Atualização</span>
                          <span className="text-[11.5px] text-slate-650 mt-0.5 leading-normal">
                            Receber alertas periódicos sobre prazos e vencimentos para manter seus dados atualizados em Recife.
                          </span>
                        </div>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 3: ABOUT */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-xs text-brand-text-sub leading-normal">
                    📖 <strong>Introdução desta etapa:</strong> Conte um pouco sobre a história, a missão e o trabalho desenvolvido de modo a valorizar o impacto de vocês.
                  </div>

                  <div className="grid grid-cols-1 gap-5">
                    
                    <SelectField
                      id="mainCause"
                      label="Causa prioritária / principal de atuação"
                      required
                      options={LIST_OF_CAUSES.map(c => ({ value: c, label: c }))}
                      value={formData.mainCause}
                      onChange={(e) => setFormData(prev => ({ ...prev, mainCause: e.target.value }))}
                      helpText={badgeForField('mainCause') as any}
                    />

                    <TextAreaField
                      id="history"
                      label="Como surgiu a organização? (Histórico)"
                      value={formData.history}
                      onChange={(e) => setFormData(prev => ({ ...prev, history: e.target.value }))}
                      maxLength={800}
                      exampleText="O Instituto surgiu formalmente a partir das oficinas promovidas por mães e moradores de bairros vizinhos para combater a desigualdade."
                      onAiImproveClick={() => handleAiImproveText('history', 'histórico da organização')}
                      error={aiGeneratingField === 'history' ? 'Aguardando simulação de reformulação...' : undefined}
                      fillingTip={{
                        title: "Histórico da Organização",
                        practices: [
                          "Foque na motivação original e no ano do início do projeto.",
                          "Aborde de maneira transparente os marcos importantes de crescimento.",
                          "Demonstre o contexto social do Recife que originou a causa."
                        ],
                        examples: [
                          "Iniciamos em 2018 como um grupo de apoio de reforço escolar no bairro de Santo Amaro e evoluímos para uma ONG formal em 2022.",
                          "Surgimos a partir da união de lideranças jovens do Ibura inconformadas com a escassez de atividades de inovação e robótica local."
                        ]
                      }}
                    />

                    <TextAreaField
                      id="mission"
                      label="Missão institucional"
                      value={formData.mission}
                      onChange={(e) => setFormData(prev => ({ ...prev, mission: e.target.value }))}
                      maxLength={300}
                      exampleText="Apoiar jovens do Recife através de formação socioeducativa de alta qualidade e empoderamento profissional."
                      onAiImproveClick={() => handleAiImproveText('mission', 'missão')}
                      fillingTip={{
                        title: "Missão Institucional",
                        practices: [
                          "Utilize verbos de ação inspiradores (ex: Promover, Capacitar, Oferecer).",
                          "Esclareça de maneira objetiva: o que fazem, para quem fazem e o porquê.",
                          "Seja direto e conciso, idealmente elaborando em poucas frases."
                        ],
                        examples: [
                          "Promover a emancipação socioprofissional de mulheres periféricas do Recife através de qualificações técnicas gratuitas.",
                          "Mobilizar redes colaborativas para combater a insegurança alimentar crônica infantil nos territórios vulneráveis."
                        ]
                      }}
                    />

                    <TextAreaField
                      id="socialProblem"
                      label="Qual problema social prioritário vocês buscam enfrentar em Recife?"
                      value={formData.socialProblem}
                      onChange={(e) => setFormData(prev => ({ ...prev, socialProblem: e.target.value }))}
                      maxLength={500}
                      exampleText="Preconceito demográfico, exclusão das minorias de raça e a profunda desigualdade tecnológica."
                      onAiImproveClick={() => handleAiImproveText('socialProblem', 'problema enfrentado')}
                      fillingTip={{
                        title: "Problema Social Prioritário",
                        practices: [
                          "Delimite e descreva a barreira social ou desigualdade específica na escala do Recife.",
                          "Evite generalizações abstratas; cite as causas reais observadas localmente.",
                          "Explique o impacto direto dessa vulnerabilidade na vida das pessoas atendidas."
                        ],
                        examples: [
                          "A impossibilidade de mães solo ingressarem no mercado devido à falta de vagas e estruturas de creches comunitárias no Recife.",
                          "O alto índice de evasão escolar no ensino médio devido à total ausência de atividades de contraturno motivadoras e profissionalizantes."
                        ]
                      }}
                    />

                    <TextAreaField
                      id="differentiator"
                      label="Principal diferencial ou tecnologia social proprietária de vocês"
                      value={formData.differentiator}
                      onChange={(e) => setFormData(prev => ({ ...prev, differentiator: e.target.value }))}
                      maxLength={400}
                      exampleText="Implementar creche solidária onde mães alternam cuidados das crianças para liberar demais alunas para as qualificações técnicas."
                      onAiImproveClick={() => handleAiImproveText('differentiator', 'diferenciais da ação')}
                      fillingTip={{
                        title: "Diferencial Institucional",
                        practices: [
                          "Informe o que torna sua metodologia ou atuação inovadora em relação às demais.",
                          "Pode citar abordagens psicossociais integradas, redes solidárias territoriais ou ferramentas próprias.",
                          "Foque nas soluções reais desenhadas especificamente pela sua iniciativa."
                        ],
                        examples: [
                          "Nosso modelo de 'Ensino Baseado em Pares', onde ex-alunos da escola pública atuam como facilitadores juniores da nova turma.",
                          "O sistema de horta comunitária circular que aproveita 100% da matéria orgânica local para alimentar as creches do bairro."
                        ]
                      }}
                    />
                  </div>
                </div>
              )}

              {/* STEP 4: AUDIENCES */}
              {currentStep === 4 && (
                <div className="space-y-6">
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-xs text-brand-text-sub leading-normal">
                    👥 <strong>Introdução desta etapa:</strong> Conheceremos com precisão os públicos de interesse e abrangência dos territórios nos bairros e RPA do Recife.
                  </div>

                  <div className="space-y-4">
                    {/* Audiences Checklist */}
                    <span className="text-xs font-bold text-brand-blue uppercase tracking-wider block">Públicos atendidos pelas atividades:</span>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {['Crianças', 'Adolescentes', 'Jovens', 'Mulheres', 'Famílias', 'Pessoas idosas', 'Pessoas com deficiência', 'Pessoas em situação de rua', 'População negra', 'População LGBTQIA+'].map((item) => {
                        const isChecked = formData.audiences?.includes(item);
                        return (
                          <label key={item} className="flex items-center gap-2 text-xs py-1.5 px-3 bg-slate-50 rounded-lg cursor-pointer hover:bg-slate-100 transition">
                            <input
                              type="checkbox"
                              checked={isChecked || false}
                              onChange={() => {
                                const list = [...(formData.audiences || [])];
                                const updated = list.includes(item) ? list.filter(i => i !== item) : [...list, item];
                                setFormData(prev => ({ ...prev, audiences: updated }));
                              }}
                              className="rounded border-slate-300 text-brand-blue w-4 h-4"
                            />
                            <span className="text-slate-700 font-semibold">{item}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-slate-100 pt-5">
                    <InputField
                      id="communitiesAttended"
                      label="Comunidades de atuação direta"
                      value={formData.communitiesAttended}
                      onChange={(e) => setFormData(prev => ({ ...prev, communitiesAttended: e.target.value }))}
                      exampleText="Ibura, Três Carneiros, Pantanal"
                    />

                    <SelectField
                      id="territorialScope"
                      label="Abrangência territorial global"
                      options={[
                        { value: 'Comunitária', label: 'Comunitária (Apenas no bairro ou entorno)' },
                        { value: 'Municipal', label: 'Municipal (Cidade do Recife)' },
                        { value: 'Metropolitana', label: 'Metropolitana (Grande de Recife)' },
                        { value: 'Estadual', label: 'Estadual (Pernambuco)' }
                      ]}
                      value={formData.territorialScope}
                      onChange={(e) => setFormData(prev => ({ ...prev, territorialScope: e.target.value }))}
                    />

                    <InputField
                      id="participationCriteria"
                      label="Critérios de seleção / participação social nas atividades"
                      value={formData.participationCriteria}
                      onChange={(e) => setFormData(prev => ({ ...prev, participationCriteria: e.target.value }))}
                      exampleText="Residência comprovada na periferia e pertencer a grupos com renda familiar inferior a um salário mínimo."
                    />

                    <InputField
                      id="monthlyAverageAttendance"
                      label="Quantidade média de pessoas faturadas ou atendidas por mês"
                      value={formData.monthlyAverageAttendance}
                      onChange={(e) => setFormData(prev => ({ ...prev, monthlyAverageAttendance: e.target.value.replace(/\D/g, '') }))}
                      exampleText="e.g. 120"
                      helpText={badgeForField('monthlyAverageAttendance') as any}
                    />
                  </div>
                </div>
              )}

              {/* STEP 5: IMPACT SOCIAL */}
              {currentStep === 5 && (
                <div className="space-y-6">
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-xs text-brand-text-sub leading-normal">
                    📈 <strong>Introdução desta etapa:</strong> Descreva de modo descomplicado os principais resultados sociais do último período. Caso sua iniciativa utilize indicadores informais, não tem problema.
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <InputField
                      id="servedLast12Months"
                      label="Pessoas diferentes atendidas nos últimos 12 meses"
                      value={formData.servedLast12Months}
                      onChange={(e) => setFormData(prev => ({ ...prev, servedLast12Months: e.target.value.replace(/\D/g, '') }))}
                      exampleText="Ex: 150"
                      helpText={badgeForField('servedLast12Months') as any}
                    />

                    <InputField
                      id="totalAttendancesLast12Months"
                      label="Quantidade total de participações ou atividades"
                      value={formData.totalAttendancesLast12Months}
                      onChange={(e) => setFormData(prev => ({ ...prev, totalAttendancesLast12Months: e.target.value.replace(/\D/g, '') }))}
                      exampleText="Ex: 1440"
                    />

                    <SelectField
                      id="isEstimateOrExact"
                      label="A quantidade final acima é exata ou estimada?"
                      options={[
                        { value: 'exact', label: 'Número exato registrado em fichas' },
                        { value: 'estimate', label: 'Estimativa consolidada baseada em eventos' }
                      ]}
                      value={formData.isEstimateOrExact}
                      onChange={(e) => setFormData(prev => ({ ...prev, isEstimateOrExact: e.target.value as any }))}
                    />

                    <SelectField
                      id="indicatorStatus"
                      label="Situação de maturidade dos indicadores"
                      options={[
                        { value: 'has_indicators', label: 'Possuímos indicadores formais' },
                        { value: 'building', label: 'Estamos estruturando nossos primeiros indicadores' },
                        { value: 'no_indicators', label: 'Ainda não possuímos indicadores definidos' },
                        { value: 'needs_support', label: 'Precisamos de suporte, apoio ou mentorias para mensurar impacto' }
                      ]}
                      value={formData.indicatorStatus}
                      onChange={(e) => setFormData(prev => ({ ...prev, indicatorStatus: e.target.value as any }))}
                    />
                  </div>

                  {/* Results Sub-form List up to 3 */}
                  <div className="border-t border-slate-100 pt-5 space-y-4">
                    <span className="text-xs font-bold text-brand-blue uppercase tracking-wider block">🏆 Cadastrar Resultados Concretos (Máximo até 3)</span>
                    <p className="text-[11px] text-slate-500 leading-relaxed">Demonstre conquistas em números. Veja um exemplo: "85 novos programadores qualificados no Ibura durante o ano de 2025".</p>
                    
                    {/* List of active registered results */}
                    <div className="space-y-3">
                      {(formData.impactResultsList || []).map((item) => (
                        <div key={item.id} className="p-4 bg-slate-50 border border-slate-100 rounded-xl flex items-start justify-between gap-3 shadow-inner">
                          <div>
                            <span className="font-extrabold text-brand-blue text-xs block">{item.title}</span>
                            <span className="text-[11px] font-bold text-slate-400 font-mono mt-0.5 inline-block">Métrica: {item.quantity} {item.unit} ({item.period})</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveResult(item.id)}
                            className="p-1 text-slate-400 hover:text-red-600 rounded hover:bg-white transition"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>

                    {(!formData.impactResultsList || formData.impactResultsList.length < 3) && (
                      <div className="p-4 rounded-xl border border-dashed border-slate-200 space-y-3.5 bg-slate-50/40">
                        <span className="text-xs font-bold text-brand-blue block">Adicionar Novo Indicador:</span>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <input
                            type="text"
                            placeholder="Título abreviado do resultado (Ex: Jovens Qualificados)"
                            value={newResult.title}
                            onChange={(e) => setNewResult(prev => ({ ...prev, title: e.target.value }))}
                            className="bg-white border rounded-lg p-2 text-xs"
                          />
                          <input
                            type="text"
                            placeholder="Quantidade de pessoas/atendimentos"
                            value={newResult.quantity}
                            onChange={(e) => setNewResult(prev => ({ ...prev, quantity: e.target.value }))}
                            className="bg-white border rounded-lg p-2 text-xs"
                          />
                          <input
                            type="text"
                            placeholder="Unidade/Métrica (Ex: jovens, cestas básicas)"
                            value={newResult.unit}
                            onChange={(e) => setNewResult(prev => ({ ...prev, unit: e.target.value }))}
                            className="bg-white border rounded-lg p-2 text-xs"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={handleAddResult}
                          className="flex items-center gap-1 px-3 py-1.5 bg-brand-cyan hover:bg-brand-blue text-white rounded-lg text-xs font-semibold shadow-sm transition"
                        >
                          <Plus className="w-4 h-4" />
                          <span>Vincular resultado</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* STEP 6: ODS, ESG & GOVERNANCE */}
              {currentStep === 6 && (
                <OdsEsgGov
                  data={formData}
                  onChange={(updated) => setFormData(prev => ({ ...prev, ...updated }))}
                  badgeForField={badgeForField}
                />
              )}
              {currentStep === 7 && (
                <div className="space-y-6">
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-xs text-brand-text-sub leading-normal">
                    💰 <strong>Introdução desta etapa:</strong> Esta fase unifica respostas sobre sustentabilidade financeira, metas de custeio e eventuais oportunidades ou necessidades de apoio institucional que beneficiarão a sua iniciativa.
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <SelectField
                      id="annualBudgetRange"
                      label="Faixa de orçamento anual de custeio aproximado"
                      required
                      options={[
                        { value: 'Até R$ 50 mil', label: 'Até R$ 50.000 / ano' },
                        { value: 'De R$ 50 mil a R$ 100 mil', label: 'De R$ 50.000 a R$ 100.000 / ano' },
                        { value: 'De R$ 100 mil a R$ 300 mil', label: 'De R$ 100.000 a R$ 300.000 / ano' },
                        { value: 'De R$ 300 mil a R$ 500 mil', label: 'De R$ 300.000 a R$ 500.000 / ano' },
                        { value: 'De R$ 500 mil a R$ 1 milhão', label: 'De R$ 500.000 a R$ 1.000.000 / ano' },
                        { value: 'Acima de R$ 1 milhão', label: 'Acima de R$ 1.000.000 / ano' },
                        { value: 'Ainda não possui orçamento definido', label: 'Ainda não possui orçamento definido' },
                        { value: 'Prefere não informar', label: 'Prefere não informar' }
                      ]}
                      value={formData.annualBudgetRange}
                      onChange={(e) => setFormData(prev => ({ ...prev, annualBudgetRange: e.target.value }))}
                      helpText={badgeForField('annualBudgetRange') as any}
                    />

                    <InputField
                      id="supportedCompaniesNames"
                      label="Quais empresas ou corporações já apoiaram vocês anteriormente?"
                      value={formData.supportedCompaniesNames || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, supportedCompaniesNames: e.target.value }))}
                      exampleText="Lojas do Recife S.A. e TechRecife"
                      helpText={badgeForField('supportedCompaniesNames') as any}
                    />
                  </div>

                  {/* Operational details switches with Three-State YesNoField Component */}
                  <div className="border-t border-slate-100 pt-5 space-y-4">
                    <span className="text-xs font-bold text-brand-blue uppercase tracking-wider block">Regularização Comercial e Fiscal</span>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <YesNoField
                        id="hasInstitutionalBankInstAccount"
                        label="Possui conta bancária jurídica com CNPJ da própria organização?"
                        value={formData.hasInstitutionalBankInstAccount}
                        onChange={(val) => setFormData(prev => ({ ...prev, hasInstitutionalBankInstAccount: val }))}
                        required
                        helpText={badgeForField('hasInstitutionalBankInstAccount') as any}
                      />

                      <YesNoField
                        id="canReceiveCorporateDonations"
                        label="Pode receber repasses ou doações diretas de empresas privadas?"
                        value={formData.canReceiveCorporateDonations}
                        onChange={(val) => setFormData(prev => ({ ...prev, canReceiveCorporateDonations: val }))}
                        required
                        helpText={badgeForField('canReceiveCorporateDonations') as any}
                      />

                      <YesNoField
                        id="hasApprovedIncentiveProject"
                        label="Possui projeto atualmente aprovado em lei de incentivo fiscal?"
                        value={formData.hasApprovedIncentiveProject}
                        onChange={(val) => setFormData(prev => ({ ...prev, hasApprovedIncentiveProject: val }))}
                        helpText={badgeForField('hasApprovedIncentiveProject') as any}
                      />
                    </div>
                  </div>

                  {/* Opportunities inside Step 7 */}
                  <div className="border-t border-slate-100 pt-5 space-y-4">
                    <span className="text-xs font-bold text-brand-blue uppercase tracking-wider block">🛠️ Oportunidades Registradas para Parcerias (Máx 5):</span>
                    <p className="text-[11px] text-slate-500 mt-[-10px]">Indique apoios materiais, financeiros ou serviços que sua equipe necessita para impulsionar o trabalho comunitário.</p>
                    
                    {/* List opportunities already compiled */}
                    <div className="space-y-2">
                      {(formData.corporateOpportunitiesList || []).map((opt) => (
                        <div key={opt.id} className="p-4 bg-slate-50 border border-slate-100 rounded-xl relative flex justify-between items-center transition hover:bg-slate-100/50 animate-in fade-in">
                          <div>
                            <span className="font-extrabold text-brand-blue text-xs block">{opt.title}</span>
                            <span className="text-[10px] font-bold text-slate-400 block mt-0.5">Demanda: {opt.quantityNeeded} de {opt.category} (Est: {opt.estimatedValue})</span>
                            {opt.description && <p className="text-[10.5px] text-slate-500 mt-1 italic leading-relaxed">{opt.description}</p>}
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveOpportunity(opt.id)}
                            className="p-1 px-2 text-slate-400 hover:text-red-650 rounded hover:bg-white transition border border-transparent hover:border-slate-100"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>

                    {/* Form to insert new opportunities */}
                    {(!formData.corporateOpportunitiesList || formData.corporateOpportunitiesList.length < 5) && (
                      <div className="p-4 border border-dashed border-slate-200 rounded-xl bg-slate-50/40 space-y-3">
                        <span className="text-[11px] font-bold text-brand-blue flex items-center gap-1">
                          <Plus className="w-3.5 h-3.5 text-brand-cyan" />
                          Adicionar Requisito de Parceria Corporal / Apoio:
                        </span>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <input
                            type="text"
                            placeholder="Título curto (Ex: Equipamentos de Costura)"
                            value={newOpportunity.title}
                            onChange={(e) => setNewOpportunity(prev => ({ ...prev, title: e.target.value }))}
                            className="bg-white border text-xs rounded-lg p-2 focus:ring-1 focus:ring-brand-cyan"
                          />

                          <select
                            value={newOpportunity.category}
                            onChange={(e) => setNewOpportunity(prev => ({ ...prev, category: e.target.value }))}
                            className="bg-white border text-xs rounded-lg p-2 focus:ring-1 focus:ring-brand-cyan"
                          >
                            <option value="">Selecione a categoria de apoio...</option>
                            {COOPERATIVE_OPPORTUNITIES_CATEGORIES.map(cat => (
                              <option key={cat} value={cat}>{cat}</option>
                            ))}
                          </select>

                          <input
                            type="text"
                            placeholder="Recurso ou item necessário (Ex: 05 máquinas)"
                            value={newOpportunity.itemsNeeded}
                            onChange={(e) => setNewOpportunity(prev => ({ ...prev, itemsNeeded: e.target.value }))}
                            className="bg-white border text-xs rounded-lg p-2"
                          />

                          <input
                            type="text"
                            placeholder="Valor estimado (Ex: R$ 18.000)"
                            value={newOpportunity.estimatedValue}
                            onChange={(e) => setNewOpportunity(prev => ({ ...prev, estimatedValue: e.target.value }))}
                            className="bg-white border text-xs rounded-lg p-2"
                          />

                          <input
                            type="text"
                            placeholder="Público beneficiado imediato (Ex: 45 artesãs)"
                            value={newOpportunity.beneficiaryPublic}
                            onChange={(e) => setNewOpportunity(prev => ({ ...prev, beneficiaryPublic: e.target.value }))}
                            className="bg-white border text-xs rounded-lg p-2 sm:col-span-2"
                          />

                          <textarea
                            placeholder="Descreva detalhadamente a necessidade de cooperação..."
                            rows={2}
                            value={newOpportunity.description}
                            onChange={(e) => setNewOpportunity(prev => ({ ...prev, description: e.target.value }))}
                            className="bg-white border text-xs rounded-lg p-2 sm:col-span-2"
                          />
                        </div>

                        <button
                          type="button"
                          onClick={handleAddOpportunity}
                          className="px-3.5 py-1.5 bg-brand-blue hover:bg-brand-cyan text-white rounded-lg text-xs font-bold shadow transition"
                        >
                          Anexar Oportunidade
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Voluntarism inputs inside Step 7 */}
                  <div className="border-t border-slate-100 pt-5 space-y-4">
                    <span className="text-xs font-bold text-brand-blue uppercase tracking-wider block">🤝 Gestão de Voluntariado</span>
                    <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl space-y-3">
                      <span className="text-xs font-bold text-brand-blue block">A organização recebe ou deseja receber voluntários?</span>
                      
                      <div className="flex flex-wrap gap-2">
                        {[
                          { val: 'yes', label: 'Sim, já recebemos voluntariado' },
                          { val: 'interest', label: 'Não recebemos, mas temos interesse' },
                          { val: 'no', label: 'Não recebemos voluntários no momento' }
                        ].map((opt) => (
                          <button
                            key={opt.val}
                            type="button"
                            onClick={() => setFormData(prev => ({
                              ...prev,
                              volunteerData: {
                                ...prev.volunteerData,
                                receivesVolunteers: opt.val as any
                              }
                            }))}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition select-none ${
                              formData.volunteerData?.receivesVolunteers === opt.val
                                ? 'bg-brand-blue text-white border-brand-blue'
                                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                            }`}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 8: MATTACHMENTS SIMULATED UPLOADS (FORMERLY STEP 9) */}
              {currentStep === 8 && (
                <div className="space-y-6">
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-xs text-brand-text-sub leading-normal">
                    📁 <strong>Introdução desta etapa:</strong> Faça o upload demonstrativo de mídias auxiliares e documentos institucionais da organização para que a equipe do Bora Impactar possa fundamentar e certificar seu cadastro.
                  </div>

                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
                    <p className="text-[11px] text-amber-800 leading-normal font-semibold">
                      📝 <strong>Atenção ao Protótipo:</strong> Nesta primeira versão, o upload de documentos e arquivos é apenas visual e simulado sem armazenamentos.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 select-none">
                    {[
                      { key: 'logo', label: 'Logomarca oficial da Organização' },
                      { key: 'presentation', label: 'Apresentação institucional (.pdf ou .ppt)' },
                      { key: 'annualReport', label: 'Relatório de Atividades dos últimos 12 meses' },
                      { key: 'bylawsFile', label: 'Estatuto original ou Ata de fundação' }
                    ].map((item) => {
                      const uploadedName = formData.simulatedFiles?.[item.key as keyof OrganizationData['simulatedFiles']];
                      return (
                        <div key={item.key} className="p-4 bg-slate-50 border border-slate-100 rounded-xl space-y-2 flex justify-between items-center">
                          <div>
                            <span className="text-xs font-bold text-brand-blue block">{item.label}</span>
                            {uploadedName ? (
                              <span className="text-[10px] text-brand-cyan font-bold block mt-1">✓ Anexo Simulado: {Array.isArray(uploadedName) ? uploadedName[0] : uploadedName}</span>
                            ) : (
                              <span className="text-[10px] text-slate-400 block mt-1">Upload pendente...</span>
                            )}
                          </div>
                          
                          <button
                            type="button"
                            onClick={() => simulateFileUpload(item.key as any, `simulado_${item.key}_${Date.now().toString().substring(8)}.pdf`)}
                            className="px-3 py-1.5 bg-white border hover:bg-slate-100 text-brand-blue rounded-lg text-xs font-semibold shadow-sm text-center transition"
                          >
                            Simular Upload
                          </button>
                        </div>
                      );
                    })}

                    <div className="sm:col-span-2 pt-2">
                      <InputField
                        id="institutionalVideoLink"
                        label="Link de vídeo institucional explicativo (YouTube, Vimeo ou Drive)"
                        value={formData.institutionalVideoLink || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, institutionalVideoLink: e.target.value }))}
                        placeholder="https://youtube.com/watch?v=..."
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 9: REVISION AND FINAL CONSENT (FORMERLY STEP 10) */}
              {currentStep === 9 && (
                <div className="space-y-6">
                  {/* Reviews component tab */}
                  <ReviewTab
                    data={formData}
                    originalData={originalData}
                    onJumpToStep={(step) => setCurrentStep(step)}
                    onConfirmAndSubmit={() => {}}
                    errors={validationErrors}
                  />

                  {/* Preferências de Notificação e Lembretes adicionais */}
                  <div className="border-t border-slate-100 pt-5 space-y-4">
                    <span className="text-xs font-bold text-brand-blue uppercase tracking-wider block">📨 Alertas e Notificações por E-mail</span>
                    <p className="text-[11px] text-slate-500 mt-[-10px]">Escolha como o Bora Impactar deve manter contato com você sobre seus dados:</p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <label 
                        className={`flex items-start gap-3 p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition cursor-pointer select-none border ${
                          formData.wantEmailConfirmation ? 'border-brand-cyan/20 bg-blue-50/20' : 'border-transparent'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={Boolean(formData.wantEmailConfirmation)}
                          onChange={(e) => setFormData(prev => ({ ...prev, wantEmailConfirmation: e.target.checked }))}
                          className="rounded border-slate-300 text-brand-blue w-4 h-4 shrink-0 mt-0.5 accent-brand-cyan"
                        />
                        <div>
                          <span className="text-xs font-bold text-slate-700 block">Desejo receber e-mail de confirmação</span>
                          <span className="text-[11px] text-slate-500 leading-normal block mt-0.5">
                            Um comprovante eletrônico com todos os dados cadastrados e alterados será enviado para <strong>{formData.email || 'o seu e-mail cadastrado'}</strong>.
                          </span>
                        </div>
                      </label>

                      <label 
                        className={`flex items-start gap-3 p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition cursor-pointer select-none border ${
                          formData.wantDeadlineReminders ? 'border-brand-cyan/20 bg-blue-50/20' : 'border-transparent'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={Boolean(formData.wantDeadlineReminders)}
                          onChange={(e) => setFormData(prev => ({ ...prev, wantDeadlineReminders: e.target.checked }))}
                          className="rounded border-slate-300 text-brand-blue w-4 h-4 shrink-0 mt-0.5 accent-brand-cyan"
                        />
                        <div>
                          <span className="text-xs font-bold text-slate-700 block">Desejo receber lembretes de prazos</span>
                          <span className="text-[11px] text-slate-500 leading-normal block mt-0.5">
                            Evite ficar de fora do catálogo oficial recebendo avisos sobre o vencimento da sua atualização cadastral periódica.
                          </span>
                        </div>
                      </label>
                    </div>
                  </div>

                  {/* Compulsory ticking boxes */}
                  <div className="border-t border-slate-100 pt-5 space-y-4">
                    <span className="text-xs font-bold text-brand-blue uppercase tracking-wider block">🛡️ Consentimento Legal e Declaração de Uso de Dados (LGPD)</span>
                    <p className="text-[11px] text-slate-500 mt-[-10px]">As caixas abaixo devem ser assinaladas individualmente antes do envio definitivo das atualizações:</p>

                    <div className="space-y-3">
                      {[
                        { key: 'consentTrueInformation', label: 'Declaro que todas as informações fornecidas e alteradas acima são verdadeiras e representam a real situação operacional da entidade.', required: true },
                        { key: 'consentCatalogPublishing', label: 'Autorizo expressamente o tratamento de dados institucionais declarados no catálogo público do portal do Bora Impactar.', required: true },
                        { key: 'consentPublishedContactsOnly', label: 'Estou de acordo com a publicação do telefone e contatos de visibilidade que categorizei como "Catálogo público" ou "Empresas parceiras" no passo 2.', required: false },
                        { key: 'consentImageUsage', label: 'Declaro possuir todas as autorizações sob direito de imagem das fotos e logomarcas simuladas e inseridas no formulário.', required: false },
                        { key: 'consentReviewAwareness', label: 'Estou ciente de que o preenchimento passará pela análise pedagógica e fiduciária da equipe técnica do Bora Impactar antes de entrar no catálogo oficial.', required: true }
                      ].map((box) => (
                        <label key={box.key} className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={Boolean(formData[box.key as keyof OrganizationData])}
                            onChange={(e) => setFormData(prev => ({ ...prev, [box.key]: e.target.checked }))}
                            className="rounded border-slate-300 text-brand-blue w-4 h-4 shrink-0 mt-0.5"
                          />
                          <div>
                            <span className="text-xs text-slate-700 font-semibold leading-relaxed">
                              {box.label}
                            </span>
                            {box.required && <span className="text-red-500 font-bold ml-1 text-xs">* (Obrigatório)</span>}
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* NAVIGATION BUTTONS BAR */}
              <div className="mt-8 pt-5 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  {currentStep > 1 && (
                    <button
                      type="button"
                      onClick={handlePrevStep}
                      className="flex items-center gap-1.5 px-4 py-2.5 border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 rounded-lg text-xs font-bold transition select-none cursor-pointer border-slate-200"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Etapa Anterior</span>
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  {currentStep < 8 ? (
                    <button
                      type="button"
                      onClick={handleNextStep}
                      className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-5 py-2.5 bg-brand-blue hover:bg-brand-cyan text-white rounded-lg text-xs font-bold transition select-none shadow-sm cursor-pointer"
                    >
                      <span>Avançar Etapa</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  ) : currentStep === 8 ? (
                    <button
                      type="button"
                      onClick={handleNextStep}
                      className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 bg-brand-cyan text-brand-blue hover:bg-opacity-95 rounded-lg text-xs font-black transition select-none shadow-sm cursor-pointer border border-brand-cyan"
                    >
                      <span>Visualizar Revisão</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleSubmitForm}
                      className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-6 py-2.5 bg-brand-blue hover:bg-brand-cyan text-white rounded-lg text-xs font-bold transition select-none shadow-md animate-pulse cursor-pointer"
                    >
                      <Check className="w-4 h-4" />
                      <span>Confirmar e Enviar Cadastro</span>
                    </button>
                  )}
                </div>
              </div>

            </div>
          </div>
        )}

        {/* VIEW 5: REGISTRATION SUCCESS & PROTOCOL ISSUER */}
        {currentView === 'success' && (
          <div className="max-w-xl mx-auto bg-white p-8 rounded-2xl border border-slate-200 shadow-lg text-sm select-none">
            
            <div className="text-center space-y-3 pb-6 border-b border-slate-100">
              <div className="w-16 h-16 bg-emerald-50 text-emerald-800 rounded-full flex items-center justify-center text-4xl mx-auto scale-110 shadow-sm border border-emerald-100">
                ✔️
              </div>
              <div>
                <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-widest block bg-emerald-100/60 p-1.5 rounded-full px-4 max-w-max mx-auto border border-emerald-200">
                  Enviado para análise
                </span>
                <h2 className="text-xl font-bold font-display text-brand-blue mt-3">
                  Cadastro Finalizado com Sucesso!
                </h2>
              </div>
            </div>

            <div className="py-6 space-y-4">
              <p className="text-xs text-slate-600 leading-relaxed text-center">
                Obrigado por atualizar as informações da sua organização no <strong>Bora Impactar</strong>. A equipe da Prefeitura do Recife analisará o cadastro e poderá entrar em contato caso seja necessário realizar algum ajuste.
              </p>

              {/* Protocol info block */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-3 shadow-inner">
                <div className="flex justify-between items-baseline text-xs border-b border-slate-100/50 pb-2">
                  <span className="font-semibold text-slate-500">Parceiro cadastrado:</span>
                  <span className="font-bold text-brand-blue truncate max-w-[250px]">{formData.name}</span>
                </div>
                <div className="flex justify-between items-baseline text-xs border-b border-slate-100/50 pb-2">
                  <span className="font-semibold text-slate-500">Protocolo emitido:</span>
                  <span className="font-mono font-bold text-brand-blue tracking-wide">{fictiveProtocol}</span>
                </div>
                <div className="flex justify-between items-baseline text-xs">
                  <span className="font-semibold text-slate-500">Data e hora do envio:</span>
                  <span className="font-mono text-slate-605">{new Date().toLocaleString('pt-BR')}</span>
                </div>
              </div>

              {/* Steps overview */}
              <div className="p-4 bg-blue-50/50 border border-brand-cyan/10 rounded-xl space-y-2 select-none">
                <span className="text-xs font-bold text-brand-blue uppercase tracking-wider block">Quais as próximas etapas?</span>
                <ul className="space-y-1.5 pl-1.5 text-xs text-slate-600 list-decimal list-inside leading-relaxed">
                  <li>Nossa equipe técnica audita as informações e consistência dos ODS;</li>
                  <li>As oportunidades ou necessidades listadas são disponibilizadas para empresas patrocinadoras;</li>
                  <li>Certificação final e liberação de dados no catálogo de parcerias do Bora Impactar.</li>
                </ul>
              </div>
            </div>

            {/* Action buttons Success block */}
            <div className="pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={() => {
                  storageService.clearCurrentDraft();
                  setFormData({ ...EMPTY_ORGANIZATION });
                  setOriginalData(null);
                  setCurrentView('home');
                }}
                className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 font-bold text-xs rounded-xl text-center transition"
              >
                Voltar à Página Inicial
              </button>

              <button
                onClick={() => setShowSummaryModal(true)}
                className="w-full py-2.5 px-4 bg-brand-blue hover:bg-brand-cyan text-white font-bold text-xs rounded-xl text-center transition shadow-sm"
              >
                Visualizar Resumo das Respostas
              </button>
            </div>
          </div>
        )}

        {/* VIEW 6: ADMINISTRATIVE MONITORING PANEL */}
        {currentView === 'admin' && (
          <AdminPanel
            onBack={() => {
              setCurrentView('home');
              window.scrollTo(0, 0);
            }}
            organizations={organizations}
            onRefreshList={() => {
              const list = storageService.getOrganizations();
              setOrganizations(list);
            }}
          />
        )}

      </main>

      {/* SUMMARY MODAL VIEW ON SUCCESS */}
      {showSummaryModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full border border-slate-200 shadow-xl overflow-hidden animate-in fade-in duration-200 flex flex-col max-h-[85vh]">
            <div className="p-5 border-b border-slate-100 bg-slate-50 flex justify-between items-center shrink-0">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-brand-cyan" />
                <h3 className="font-bold text-brand-blue text-sm">Resumo da Execução de Formulário</h3>
              </div>
              <span className="text-xs font-mono font-semibold px-2 py-0.5 bg-brand-cyan/10 text-brand-cyan rounded">
                Protocolo: {fictiveProtocol}
              </span>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 text-xs leading-relaxed flex-1">
              <div className="space-y-2 pb-3 border-b border-slate-100">
                <h4 className="font-bold text-brand-blue">1. Dados da Organização</h4>
                <p><strong>Nome Oficial:</strong> {formData.name}</p>
                <p><strong>Conhecido como:</strong> {formData.tradingName || '-'}</p>
                <p><strong>Situação formal:</strong> {formData.formalizationStatus}</p>
                <p><strong>CNPJ:</strong> {formData.cnpj || 'Não se aplica / Sem CNPJ'}</p>
                <p><strong>Ano de fundação:</strong> {formData.foundationYear}</p>
                <p><strong>Bairro:</strong> {formData.neighborhood || '(Não preenchido)'}</p>
              </div>

              <div className="space-y-2 pb-3 border-b border-slate-100">
                <h4 className="font-bold text-brand-blue">2. Informações de Contatos</h4>
                <p><strong>Responsável legal:</strong> {formData.legalRepName} ({formData.legalRepRole})</p>
                <p><strong>WhatsApp:</strong> {formData.whatsapp || '-'}</p>
                <p><strong>E-mail:</strong> {formData.email}</p>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-brand-blue">3. Necessidades de Apoio Cadastradas ({formData.corporateOpportunitiesList?.length || 0})</h4>
                {formData.corporateOpportunitiesList && formData.corporateOpportunitiesList.length > 0 ? (
                  formData.corporateOpportunitiesList.map((opp) => (
                    <div key={opp.id} className="p-2 bg-slate-50 rounded border border-slate-100 mt-1">
                      <p className="font-bold text-slate-800">{opp.title}</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">{opp.description}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-slate-400 italic">Nenhuma necessidade cadastrada.</p>
                )}
              </div>
            </div>

            <div className="p-5 bg-slate-50 border-t border-slate-100 flex justify-between shrink-0">
              <button
                type="button"
                onClick={() => {
                  alert('O download do PDF de resumo foi simulado com sucesso! Seus dados cadastrais foram persistidos localmente.');
                  setShowSummaryModal(false);
                }}
                className="py-1.5 px-4 bg-brand-cyan hover:bg-brand-blue text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download PDF Simulado</span>
              </button>

              <button
                type="button"
                className="py-1.5 px-4 border border-slate-200 hover:bg-slate-100 text-slate-600 rounded-lg text-xs font-bold transition"
                onClick={() => setShowSummaryModal(false)}
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* QUICK HELP / CNPJ FAQ DIALOG */}
      {showHelpNoCnpj && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-xl overflow-hidden animate-in fade-in duration-200">
            <div className="p-5 border-b border-slate-100 bg-slate-50 flex items-center gap-3">
              <div className="p-2.5 bg-brand-cyan/10 text-brand-cyan rounded-lg">
                <HelpCircle className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-brand-blue text-sm leading-tight">
                Dúvidas Frequentes — Bora Impactar
              </h3>
            </div>
            
            <div className="p-5 space-y-3.5 text-xs leading-relaxed text-slate-600 max-h-[350px] overflow-y-auto">
              <div className="space-y-1">
                <p className="font-bold text-brand-blue">Minha organização social não tem CNPJ ativo. Posso participar?</p>
                <p>Sim! O Bora Impactar acolhe projetos, iniciativas inovadoras, grêmios e coletivos comunitários sem registro de CNPJ formalizado. Basta selecionar a opção correspondente ao preencher o formulário.</p>
              </div>

              <div className="space-y-1">
                <p className="font-bold text-brand-blue">Posso interromper o preenchimento no meio?</p>
                <p>Com certeza. O formulário conta com salvamento seguro integrado ao navegador. Você pode fechar a janela do navegador e, ao retornar futuramente no mesmo dispositivo, suas respostas aparecerão recuperadas.</p>
              </div>

              <div className="space-y-1">
                <p className="font-bold text-brand-blue">As informações já entram no ar de imediato?</p>
                <p>Não. Todos os cadastros e dados de atualização cadastral sintonizam de início com a triagem técnica e apoio educacional da equipe fiduciária do Recife, garantindo que as demandas fiquem lapidadas.</p>
              </div>
            </div>

            <div className="p-5 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setShowHelpNoCnpj(false)}
                className="py-1.5 px-4 bg-brand-blue hover:bg-brand-cyan text-white text-xs font-bold rounded-lg transition"
              >
                Compreendido
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
