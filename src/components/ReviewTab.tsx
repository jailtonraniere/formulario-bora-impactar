/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Edit2, CheckCircle2, AlertTriangle, Eye, ArrowRight, CornerDownRight, FileText } from 'lucide-react';
import { OrganizationData } from '../types';
import { SDG_DETAILS } from '../data/mockData';
import { isFieldVisible } from '../config/formRules';

interface ReviewTabProps {
  data: OrganizationData;
  originalData: OrganizationData | null;
  onJumpToStep: (step: number) => void;
  onConfirmAndSubmit: () => void;
  errors: string[];
}

export const ReviewTab: React.FC<ReviewTabProps> = ({
  data,
  originalData,
  onJumpToStep,
  onConfirmAndSubmit,
  errors,
}) => {
  // Utility tool to check if a specific key was changed
  const renderCompareItem = (label: string, key: keyof OrganizationData, stepNum: number) => {
    const valNew = data[key];
    const valOld = originalData ? originalData[key] : undefined;
    
    // Handle complex types
    if (Array.isArray(valNew) || typeof valNew === 'object') return null;

    const hasChanged = originalData && valNew !== valOld && valOld !== undefined && valOld !== '';
    const isNew = !valOld && valNew;

    return (
      <div className="py-3.5 border-b border-slate-100/60 flex flex-col sm:flex-row sm:items-start justify-between gap-2 text-xs transition-colors hover:bg-slate-50/30 px-1">
        <div className="w-full sm:w-1/3">
          <span className="font-bold text-slate-700">{label}</span>
        </div>
        
        <div className="w-full sm:w-2/3 space-y-1.5">
          {hasChanged ? (
            <div className="space-y-1.5">
              <div className="text-[10.5px] text-slate-400 line-through bg-red-50/40 p-2 rounded-lg border border-red-100 max-w-max font-medium">
                {String(valOld || '(Vazio)')}
              </div>
              <div className="text-xs text-brand-blue font-bold bg-amber-50/60 p-2 rounded-lg border border-amber-100 max-w-max">
                {String(valNew || '(Vazio)')}
              </div>
              <span className="text-[9px] font-extrabold text-amber-700 bg-amber-100 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                ✏️ Alterado
              </span>
            </div>
          ) : isNew ? (
            <div>
              <span className="text-slate-800 font-semibold">{String(valNew || '-')}</span>
              <div className="mt-1">
                <span className="text-[9px] font-extrabold text-brand-cyan bg-sky-50 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  ✨ Novo campo
                </span>
              </div>
            </div>
          ) : valNew ? (
            <div className="flex items-center flex-wrap gap-1">
              <span className="text-slate-850 font-semibold">{String(valNew)}</span>
              {originalData && (
                <span className="text-[9px] font-extrabold text-emerald-750 bg-emerald-50 border border-emerald-100 px-2.5 py-0.5 rounded-full uppercase select-none tracking-wider ml-1">
                  ✔️ Confirmado
                </span>
              )}
            </div>
          ) : (
            <span className="text-slate-400 italic font-medium">(Não preenchido)</span>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8 select-none text-sm">
      
      {/* 1. WARNING BANNER CODES */}
      <div className="bg-brand-blue-light/5 border border-brand-blue-light/10 p-4 rounded-xl flex items-start gap-3">
        <div className="p-2 bg-white rounded-lg text-brand-blue shrink-0">
          <Eye className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-bold text-brand-blue text-sm">Revisão Completa dos Dados</h3>
          <p className="text-xs text-brand-text-sub mt-1 leading-relaxed">
            Revise abaixo todas as informações agrupadas por etapas corporativas. Em caso de correções, você pode clicar em qualquer botão de edição para voltar diretamente ao preenchimento da respectiva fase.
          </p>
        </div>
      </div>

      {/* Errors checklist if any validation failed */}
      {errors.length > 0 && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl space-y-2">
          <div className="flex items-center gap-2 text-red-800 font-bold text-xs">
            <AlertTriangle className="w-4 h-4 shrink-0 text-red-600" />
            <span>Campos pendentes obrigatórios antes do envio definitiva:</span>
          </div>
          <ul className="list-disc list-inside space-y-1 pl-1 text-xs text-red-700">
            {errors.map((err, idx) => (
              <li key={idx}>{err}</li>
            ))}
          </ul>
        </div>
      )}

      {/* 2. STEP SECTIONS BENTO DECK */}
      <div className="space-y-6">
        
        {/* Step 1: Identificação */}
        <div className="bg-white/90 backdrop-blur-md p-6 rounded-2xl border border-slate-200/60 shadow-sm space-y-4 hover:border-slate-300 hover:shadow-md transition-all duration-200">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <h4 className="font-bold text-sm text-brand-blue flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-brand-cyan/10 text-brand-cyan flex items-center justify-center text-xs">1</span>
              Identificação Básica
            </h4>
            <button
              onClick={() => onJumpToStep(1)}
              className="text-xs font-bold text-brand-cyan hover:text-brand-blue flex items-center gap-1 hover:underline"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>Editar</span>
            </button>
          </div>
          <div className="space-y-1">
            {renderCompareItem('Razão Social / Nome completo', 'name', 1)}
            {renderCompareItem('Conhecido como', 'tradingName', 1)}
            {isFieldVisible('cnpj', data.formalizationStatus) && renderCompareItem('CNPJ', 'cnpj', 1)}
            {renderCompareItem('Situação de formalização', 'formalizationStatus', 1)}
            {renderCompareItem('Ano de Fundação', 'foundationYear', 1)}
            {renderCompareItem('Bairro', 'neighborhood', 1)}
            {renderCompareItem('Cidade', 'city', 1)}
            {renderCompareItem('Horário de Funcionamento', 'operatingHours', 1)}
          </div>
        </div>

        {/* Step 2: Contatos */}
        <div className="bg-white/90 backdrop-blur-md p-6 rounded-2xl border border-slate-200/60 shadow-sm space-y-4 hover:border-slate-300 hover:shadow-md transition-all duration-200">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <h4 className="font-bold text-sm text-brand-blue flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-brand-cyan/10 text-brand-cyan flex items-center justify-center text-xs">2</span>
              Representação & Contatos
            </h4>
            <button
              onClick={() => onJumpToStep(2)}
              className="text-xs font-bold text-brand-cyan hover:text-brand-blue flex items-center gap-1 hover:underline"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>Editar</span>
            </button>
          </div>
          <div className="space-y-1">
            {renderCompareItem('Responsável Legal', 'legalRepName', 2)}
            {renderCompareItem('Função do Responsável', 'legalRepRole', 2)}
            {renderCompareItem('Quem Preencheu', 'fillerName', 2)}
            {renderCompareItem('Telefone', 'phone', 2)}
            {renderCompareItem('WhatsApp', 'whatsapp', 2)}
            {renderCompareItem('Website / Link oficial', 'website', 2)}
            {renderCompareItem('Instagram', 'instagram', 2)}
          </div>
        </div>

        {/* Step 3: Sobre */}
        <div className="bg-white/90 backdrop-blur-md p-6 rounded-2xl border border-slate-200/60 shadow-sm space-y-4 hover:border-slate-300 hover:shadow-md transition-all duration-200">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <h4 className="font-bold text-sm text-brand-blue flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-brand-cyan/10 text-brand-cyan flex items-center justify-center text-xs">3</span>
              Sobre o Trabalho
            </h4>
            <button
              onClick={() => onJumpToStep(3)}
              className="text-xs font-bold text-brand-cyan hover:text-brand-blue flex items-center gap-1 hover:underline"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>Editar</span>
            </button>
          </div>
          <div className="space-y-1">
            {renderCompareItem('Causa Principal', 'mainCause', 3)}
            {renderCompareItem('História', 'history', 3)}
            {renderCompareItem('Missão', 'mission', 3)}
            {renderCompareItem('Valores', 'values', 3)}
            {renderCompareItem('Problema Social Enfrentado', 'socialProblem', 3)}
            {renderCompareItem('Atividades Principais', 'mainActivities', 3)}
            {renderCompareItem('Diferencial da Organização', 'differentiator', 3)}
          </div>
        </div>

        {/* Step 4: Público e Territórios */}
        <div className="bg-white/90 backdrop-blur-md p-6 rounded-2xl border border-slate-200/60 shadow-sm space-y-4 hover:border-slate-300 hover:shadow-md transition-all duration-200">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <h4 className="font-bold text-sm text-brand-blue flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-brand-cyan/10 text-brand-cyan flex items-center justify-center text-xs">4</span>
              Público Alvo e Geografia
            </h4>
            <button
              onClick={() => onJumpToStep(4)}
              className="text-xs font-bold text-brand-cyan hover:text-brand-blue flex items-center gap-1 hover:underline"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>Editar</span>
            </button>
          </div>
          <div className="space-y-1">
            {renderCompareItem('Comunidades Atendidas', 'communitiesAttended', 4)}
            {renderCompareItem('Abrangência Territorial', 'territorialScope', 4)}
            {renderCompareItem('Critério de Participação', 'participationCriteria', 4)}
            {renderCompareItem('Média de Atendimentos Mensais', 'monthlyAverageAttendance', 4)}
            
            <div className="py-2 flex flex-col gap-1 text-xs">
              <span className="font-semibold text-slate-700">Públicos Selecionados:</span>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {data.audiences && data.audiences.length > 0 ? (
                  data.audiences.map((aud, idx) => (
                    <span key={idx} className="bg-blue-50 text-brand-blue px-2 py-0.5 rounded text-[10px] font-semibold border border-blue-100">
                      {aud}
                    </span>
                  ))
                ) : (
                  <span className="text-slate-400 italic">Nenhum</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Step 5: Impacto Social */}
        <div className="bg-white/90 backdrop-blur-md p-6 rounded-2xl border border-slate-200/60 shadow-sm space-y-4 hover:border-slate-300 hover:shadow-md transition-all duration-200">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <h4 className="font-bold text-sm text-brand-blue flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-brand-cyan/10 text-brand-cyan flex items-center justify-center text-xs">5</span>
              Resultados e Impacto Social
            </h4>
            <button
              onClick={() => onJumpToStep(5)}
              className="text-xs font-bold text-brand-cyan hover:text-brand-blue flex items-center gap-1 hover:underline"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>Editar</span>
            </button>
          </div>
          <div className="space-y-1">
            {renderCompareItem('Atendidos Últimos 12 Meses', 'servedLast12Months', 5)}
            {renderCompareItem('Volume de Atendimentos', 'totalAttendancesLast12Months', 5)}
            {renderCompareItem('Acompanhamento do Impacto', 'resultsTrackingMethod', 5)}
            {renderCompareItem('Metas Próximos 12 meses', 'goalsNext12Months', 5)}

            <div className="py-2.5 text-xs">
              <span className="font-semibold text-slate-700 block mb-2">Metas Físicas Cadastradas ({data.impactResultsList?.length || 0}):</span>
              {data.impactResultsList && data.impactResultsList.length > 0 ? (
                <div className="space-y-2 mt-1">
                  {data.impactResultsList.map((res) => (
                    <div key={res.id} className="p-3 bg-slate-50 border border-slate-100 rounded-lg">
                      <div className="flex justify-between items-baseline gap-2">
                        <span className="font-bold text-brand-blue text-xs">{res.title}</span>
                        <span className="font-mono text-[10px] bg-brand-cyan/10 text-brand-cyan px-2 py-0.5 rounded font-bold">{res.quantity} {res.unit}</span>
                      </div>
                      <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">{res.description}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <span className="text-slate-400 italic">Nenhum resultado quantitativo adicionado.</span>
              )}
            </div>
          </div>
        </div>

        {/* Step 6: ODS / ESG */}
        <div className="bg-white/90 backdrop-blur-md p-6 rounded-2xl border border-slate-200/60 shadow-sm space-y-4 hover:border-slate-300 hover:shadow-md transition-all duration-200">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <h4 className="font-bold text-sm text-brand-blue flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-brand-cyan/10 text-brand-cyan flex items-center justify-center text-xs">6</span>
              ODS, ESG e Governança
            </h4>
            <button
              onClick={() => onJumpToStep(6)}
              className="text-xs font-bold text-brand-cyan hover:text-brand-blue flex items-center gap-1 hover:underline"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>Editar</span>
            </button>
          </div>
          <div className="space-y-2.5 text-xs">
            <div>
              <span className="font-bold text-slate-700 block">ODS Relacionados:</span>
              <div className="flex flex-wrap gap-1 mt-1.5">
                {data.selectedOdsList && data.selectedOdsList.length > 0 ? (
                  data.selectedOdsList.map((id) => {
                    const found = SDG_DETAILS.find(item => item.id === id);
                    const isPri = data.priorityOdsList?.includes(id);
                    return (
                      <span key={id} className={`px-2 py-1 rounded text-[10px] font-bold border ${
                        isPri 
                          ? 'bg-amber-100 text-amber-800 border-amber-300' 
                          : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      }`}>
                        ODS {found?.num} - {found?.name} {isPri ? '⭐ Prioritário' : ''}
                      </span>
                    );
                  })
                ) : (
                  <span className="text-slate-400 italic">Nenhum ODS selecionado</span>
                )}
              </div>
            </div>

            {/* ESG — only visible for non-no_cnpj */}
            {isFieldVisible('esgEnvironmentalPractices', data.formalizationStatus) && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <div>
                  <span className="font-bold text-emerald-800 block">🍃 Ambiental:</span>
                  <p className="text-[10.5px] text-slate-600 mt-1">{data.esgEnvironmentalPractices?.join(', ') || 'Nenhum'}</p>
                </div>
                <div>
                  <span className="font-bold text-brand-blue block">🔵 Social:</span>
                  <p className="text-[10.5px] text-slate-600 mt-1">{data.esgSocialPractices?.join(', ') || 'Nenhum'}</p>
                </div>
                <div>
                  <span className="font-bold text-amber-800 block">🟡 Governança:</span>
                  <p className="text-[10.5px] text-slate-600 mt-1">{data.esgGovernancePractices?.join(', ') || 'Nenhum'}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Step 7: Parcerias */}
        <div className="bg-white/90 backdrop-blur-md p-6 rounded-2xl border border-slate-200/60 shadow-sm space-y-4 hover:border-slate-300 hover:shadow-md transition-all duration-200">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <h4 className="font-bold text-sm text-brand-blue flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-brand-cyan/10 text-brand-cyan flex items-center justify-center text-xs">7</span>
              Recursos Financeiros & Parcerias
            </h4>
            <button
              onClick={() => onJumpToStep(7)}
              className="text-xs font-bold text-brand-cyan hover:text-brand-blue flex items-center gap-1 hover:underline"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>Editar</span>
            </button>
          </div>
          <div className="space-y-1">
            {renderCompareItem('Faixa de Orçamento Anual', 'annualBudgetRange', 7)}
            {renderCompareItem('Empresas Parceiras Anteriores', 'supportedCompaniesNames', 7)}

            {isFieldVisible('hasInstitutionalBankInstAccount', data.formalizationStatus) && (
              <div className="py-1 flex flex-wrap gap-x-4 gap-y-2 mt-1 text-xs">
                <span className="flex items-center gap-1 font-medium text-slate-700">
                  📥 Conta bancária institucional? <strong className="text-brand-blue">{data.hasInstitutionalBankInstAccount ? 'Sim' : 'Não'}</strong>
                </span>
                <span className="flex items-center gap-1 font-medium text-slate-700">
                  🧾 Emite recibos aos doadores? <strong className="text-brand-blue">{data.emitsReceipts ? 'Sim' : 'Não'}</strong>
                </span>
                <span className="flex items-center gap-1 font-medium text-slate-700">
                  ⚖️ Projeto aprovado em lei incentivo? <strong className="text-brand-blue">{data.hasApprovedIncentiveProject ? 'Sim' : 'Não'}</strong>
                </span>
              </div>
            )}

            {data.formalizationStatus === 'no_cnpj' && (
              <div className="py-2 text-[11px] text-blue-700 bg-blue-50 border border-blue-100 rounded-lg px-3">
                💡 Projetos sem CNPJ não precisam de conta jurídica própria para participar do catálogo.
              </div>
            )}
          </div>
        </div>

        {/* Step 8: Oportunidades & Voluntariado */}
        <div className="bg-white/90 backdrop-blur-md p-6 rounded-2xl border border-slate-200/60 shadow-sm space-y-4 hover:border-slate-300 hover:shadow-md transition-all duration-200">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <h4 className="font-bold text-sm text-brand-blue flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-brand-cyan/10 text-brand-cyan flex items-center justify-center text-xs">8</span>
              Oportunidades Cadastradas para Empresas
            </h4>
            <button
              onClick={() => onJumpToStep(8)}
              className="text-xs font-bold text-brand-cyan hover:text-brand-blue flex items-center gap-1 hover:underline"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>Editar</span>
            </button>
          </div>
          <div className="space-y-3 text-xs">
            {data.corporateOpportunitiesList && data.corporateOpportunitiesList.length > 0 ? (
              <div className="space-y-3">
                {data.corporateOpportunitiesList.map((opt) => (
                  <div key={opt.id} className="p-4 bg-slate-50 border border-slate-100 rounded-xl space-y-1.5 relative overflow-hidden">
                    <div className="absolute top-0 right-[-10px] w-12 h-12 bg-brand-cyan/5 rotate-45" />
                    <div className="flex justify-between items-center">
                      <span className="font-extrabold text-brand-blue text-sm">{opt.title}</span>
                      <span className="text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200 px-2 py-0.5 roundeduppercase">Urgent: {opt.urgency}</span>
                    </div>
                    <p className="text-slate-600 leading-relaxed text-[11px]">{opt.description}</p>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 font-semibold text-[10px] text-slate-500">
                      <span>🎒 {opt.category}</span>
                      <span>💰 Estimativa: {opt.estimatedValue}</span>
                      <span>📍 Local: {opt.location}</span>
                      <span>👥 Público: {opt.beneficiaryPublic}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <span className="text-slate-400 italic">Nenhuma oportunidade empresarial cadastrada ainda.</span>
            )}

            {/* Volunteer data block */}
            <div className="pt-2 border-t border-slate-100">
              <span className="font-bold text-brand-blue block mb-1">Voluntariado Institucional:</span>
              {data.volunteerData?.receivesVolunteers === 'yes' ? (
                <div className="bg-brand-cyan/5 p-3 rounded-xl border border-brand-cyan/10">
                  <span className="text-emerald-800 font-bold text-[11px] block">✅ Organização já capta voluntariado ativo!</span>
                  <p className="text-[11px] text-slate-600 mt-1">Carga horária pedida: {data.volunteerData.hoursRequired} horas | Atividades: {data.volunteerData.availableActivities?.join(', ') || 'Nenhuma descrita'}</p>
                </div>
              ) : data.volunteerData?.receivesVolunteers === 'interest' ? (
                <p className="text-slate-600 italic">Interessados em obter voluntários corporativos corporações.</p>
              ) : (
                <p className="text-slate-400 italic">Não recebem voluntários no momento.</p>
              )}
            </div>
          </div>
        </div>

        {/* Step 9: Anexos Simulados */}
        <div className="bg-white/90 backdrop-blur-md p-6 rounded-2xl border border-slate-200/60 shadow-sm space-y-4 hover:border-slate-300 hover:shadow-md transition-all duration-200">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <h4 className="font-bold text-sm text-brand-blue flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-brand-cyan/10 text-brand-cyan flex items-center justify-center text-xs">9</span>
              Materiais e anexos de documentos
            </h4>
            <button
              onClick={() => onJumpToStep(9)}
              className="text-xs font-bold text-brand-cyan hover:text-brand-blue flex items-center gap-1 hover:underline"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>Editar</span>
            </button>
          </div>
          <div className="space-y-2 text-xs">
            <div className="flex flex-wrap gap-2">
              {data.simulatedFiles?.logo && (
                <span className="flex items-center gap-1 bg-slate-100 text-slate-700 py-1 px-2.5 rounded border border-slate-200">
                  <FileText className="w-3 h-3 text-brand-cyan" />
                  Logo: {data.simulatedFiles.logo}
                </span>
              )}
              {data.simulatedFiles?.presentation && (
                <span className="flex items-center gap-1 bg-slate-100 text-slate-700 py-1 px-2.5 rounded border border-slate-200">
                  <FileText className="w-3 h-3 text-brand-cyan" />
                  Doc: {data.simulatedFiles.presentation}
                </span>
              )}
              {data.simulatedFiles?.annualReport && (
                <span className="flex items-center gap-1 bg-slate-100 text-slate-700 py-1 px-2.5 rounded border border-slate-200">
                  <FileText className="w-3 h-3 text-brand-cyan" />
                  Relatório: {data.simulatedFiles.annualReport}
                </span>
              )}
            </div>
            {data.institutionalVideoLink && (
              <p className="text-[11px] text-slate-600 font-medium">🎥 Link de vídeo: <a href={data.institutionalVideoLink} className="text-brand-cyan underline" target="_blank" rel="noreferrer">{data.institutionalVideoLink}</a></p>
            )}
          </div>
        </div>

      </div>

    </div>
  );
};
