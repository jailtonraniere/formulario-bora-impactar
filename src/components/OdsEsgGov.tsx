/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { HelpCircle, Star, Sparkles, CheckCircle } from 'lucide-react';
import { OrganizationData } from '../types';
import { isFieldVisible, isFieldRequired } from '../config/formRules';
import { SDG_DETAILS } from '../data/mockData';

interface OdsEsgGovProps {
  data: OrganizationData;
  onChange: (updated: Partial<OrganizationData>) => void;
  badgeForField: (fieldName: string) => React.ReactNode;
}

export const OdsEsgGov: React.FC<OdsEsgGovProps> = ({
  data,
  onChange,
  badgeForField,
}) => {
  const [activeOdsTab, setActiveOdsTab] = useState<'selection' | 'priorities'>('selection');

  // Toggle ODS related
  const handleToggleOds = (odsId: string) => {
    let current = [...(data.selectedOdsList || [])];
    if (current.includes(odsId)) {
      current = current.filter(id => id !== odsId);
      // Also remove from priority if removed from relation
      let priorities = [...(data.priorityOdsList || [])].filter(id => id !== odsId);
      const explanations = { ...(data.odsExplanations || {}) };
      delete explanations[odsId];
      onChange({ selectedOdsList: current, priorityOdsList: priorities, odsExplanations: explanations });
    } else {
      if (current.length >= 5) {
        alert('Você pode selecionar no máximo até 5 ODS relacionados.');
        return;
      }
      current.push(odsId);
      onChange({ selectedOdsList: current });
    }
  };

  // Toggle ODS priority
  const handleTogglePriority = (odsId: string) => {
    let priorities = [...(data.priorityOdsList || [])];
    if (priorities.includes(odsId)) {
      priorities = priorities.filter(id => id !== odsId);
      onChange({ priorityOdsList: priorities });
    } else {
      if (priorities.length >= 3) {
        alert('Você pode selecionar até 3 ODS prioritários.');
        return;
      }
      priorities.push(odsId);
      onChange({ priorityOdsList: priorities });
    }
  };

  // Update explanation
  const handleExplanationChange = (odsId: string, text: string) => {
    const explanations = { ...(data.odsExplanations || {}), [odsId]: text };
    onChange({ odsExplanations: explanations });
  };

  const handleEsgSocialToggle = (item: string) => {
    const current = [...(data.esgSocialPractices || [])];
    const updated = current.includes(item) ? current.filter(i => i !== item) : [...current, item];
    onChange({ esgSocialPractices: updated });
  };

  const handleEsgEnvToggle = (item: string) => {
    const current = [...(data.esgEnvironmentalPractices || [])];
    const updated = current.includes(item) ? current.filter(i => i !== item) : [...current, item];
    onChange({ esgEnvironmentalPractices: updated });
  };

  const handleEsgGovToggle = (item: string) => {
    const current = [...(data.esgGovernancePractices || [])];
    const updated = current.includes(item) ? current.filter(i => i !== item) : [...current, item];
    onChange({ esgGovernancePractices: updated });
  };

  const GOV_QUESTIONS = [
    { key: 'governanceHasBylaws', label: 'Possui estatuto social ou regimento interno?' },
    { key: 'governanceHasBoard', label: 'Possui diretoria formalmente constituída?' },
    { key: 'governanceHasFiscalCouncil', label: 'Possui conselho fiscal ativo?' },
    { key: 'governanceHasAdminCouncil', label: 'Possui conselho de administração ou consultivo?' },
    { key: 'governanceDoesMeetings', label: 'Realiza assembleias ou reuniões ordinárias frequentes?' },
    { key: 'governanceHasReporingPolicy', label: 'Possui diretriz/política para publicação de prestação de contas?' },
    { key: 'governancePublishesReports', label: 'Publica publicamente relatórios de suas atividades anuais?' },
    { key: 'governancePublishesFinance', label: 'Publica informes econômicos ou balanços auditados?' },
    { key: 'governanceHasEthicsCode', label: 'Possui código de conduta ética ou integridade?' },
    { key: 'governanceHasChildProtection', label: 'Possui política para proteção de crianças, adolescentes ou vulneráveis?' },
    { key: 'governanceHasDataProtection', label: 'Possui política de proteção aos dados coletados (LGPD)?' },
    { key: 'governanceHasWhistleblowerChannel', label: 'Possui ou opera canal para recebimento de denúncias ou manifestações?' },
  ] as const;

  const GOV_OPTIONS = [
    { value: 'sim', label: 'Sim' },
    { value: 'nao', label: 'Não' },
    { value: 'em_construcao', label: 'Em construção' },
    { value: 'nao_se_aplica', label: 'Não se aplica' },
    { value: 'nao_sei', label: 'Não sei informar' }
  ];

  return (
    <div className="space-y-8 text-sm select-none">
      
      {/* 1. ODS SECTIONS */}
      <div className="space-y-4">
        <div className="bg-brand-cyan/5 p-4 rounded-xl border border-brand-cyan/10">
          <h3 className="font-bold text-brand-blue flex items-center gap-1.5 mb-1 text-sm">
            🎯 Objetivos de Desenvolvimento Sustentável (ODS)
          </h3>
          <p className="text-xs text-brand-text-sub leading-relaxed">
            Os ODS são objetivos globais propostos pela ONU para enfrentar grandes crises sociais, governamentais e de desigualdade. Selecione abaixo as ODS que possuem ligação forte com o trabalho da sua organização.
          </p>
        </div>

        {/* Tabs for ODS navigation */}
        <div className="flex border-b border-slate-200">
          <button
            type="button"
            onClick={() => setActiveOdsTab('selection')}
            className={`px-4 py-2.5 font-bold text-xs border-b-2 transition flex items-center gap-1.5 ${
              activeOdsTab === 'selection' 
                ? 'border-brand-blue text-brand-blue' 
                : 'border-transparent text-slate-500 hover:text-brand-blue'
            }`}
          >
            <span>1. Selecionar ODS Atendidos ({data.selectedOdsList?.length || 0} de 5)</span>
            {isFieldRequired('selectedOdsList', data.formalizationStatus) && (!data.selectedOdsList || data.selectedOdsList.length === 0) && (
              <span className="text-[8px] bg-amber-50 text-amber-700 font-extrabold px-1.5 py-0.5 rounded border border-amber-200 uppercase select-none leading-none inline-block">
                Pendente
              </span>
            )}
          </button>
          
          <button
            type="button"
            onClick={() => setActiveOdsTab('priorities')}
            disabled={!data.selectedOdsList || data.selectedOdsList.length === 0}
            className={`px-4 py-2.5 font-bold text-xs border-b-2 transition flex items-center gap-1.5 ${
              !data.selectedOdsList || data.selectedOdsList.length === 0
                ? 'opacity-40 cursor-not-allowed'
                : activeOdsTab === 'priorities'
                  ? 'border-brand-blue text-brand-blue'
                  : 'border-transparent text-slate-500 hover:text-brand-blue'
            }`}
          >
            <span>2. Definir Prioritários ({data.priorityOdsList?.length || 0} de 3)</span>
            {isFieldRequired('priorityOdsList', data.formalizationStatus) && (!data.priorityOdsList || data.priorityOdsList.length === 0) && (
              <span className="text-[8px] bg-amber-50 text-amber-700 font-extrabold px-1.5 py-0.5 rounded border border-amber-200 uppercase select-none leading-none inline-block">
                Pendente
              </span>
            )}
          </button>
        </div>

        {activeOdsTab === 'selection' ? (
          <div>
            <p className="text-xs text-slate-500 mb-4 font-semibold">Selecione até 5 objetivos correspondentes à sua iniciativa:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {SDG_DETAILS.map((ods) => {
                const isSelected = data.selectedOdsList?.includes(ods.id);
                return (
                  <div
                    key={ods.id}
                    onClick={() => handleToggleOds(ods.id)}
                    className={`p-4 rounded-2xl border cursor-pointer select-none transition-all duration-300 flex items-start gap-3.5 shadow-sm hover:scale-[1.015] active:scale-[0.98] ${
                      isSelected 
                        ? 'border-brand-cyan bg-sky-50/50 shadow-md shadow-sky-500/10 ring-1 ring-brand-cyan/30' 
                        : 'border-slate-200/70 bg-white hover:border-slate-350 hover:shadow-md'
                    }`}
                  >
                    <img 
                      src={ods.image} 
                      alt={`ODS ${ods.num}`} 
                      className={`w-14 h-14 rounded-xl shrink-0 object-contain shadow-sm transition-all duration-350 ${!isSelected && 'opacity-80 grayscale-[20%]'}`}
                    />
                    <div className="min-w-0">
                      <h4 className="font-extrabold text-xs text-brand-blue truncate">{ods.name}</h4>
                      <p className="text-[10.5px] text-slate-500 mt-1 leading-relaxed line-clamp-2 font-medium">{ods.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-xs text-slate-500 font-semibold">Dentre as ODS indicadas, selecione até 3 como prioritárias e explique brevemente as ações práticas correspondentes:</p>
            
            <div className="space-y-4">
              {SDG_DETAILS.filter(ods => data.selectedOdsList?.includes(ods.id)).map((ods) => {
                const isPriority = data.priorityOdsList?.includes(ods.id);
                return (
                  <div key={ods.id} className="p-5 bg-white/90 backdrop-blur-md rounded-2xl border border-slate-200/60 shadow-sm flex flex-col gap-4">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <img src={ods.image} alt={`ODS ${ods.num}`} className="w-9 h-9 rounded-lg shrink-0 object-contain shadow-sm" />
                        <span className="font-extrabold text-xs sm:text-sm text-brand-blue leading-tight">{ods.name}</span>
                      </div>
                      
                      <button
                        type="button"
                        onClick={() => handleTogglePriority(ods.id)}
                        className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold border transition-all duration-200 ${
                          isPriority
                            ? 'bg-amber-550 bg-amber-500 text-white border-amber-500 shadow-md shadow-amber-500/10'
                            : 'bg-white text-slate-600 border-slate-200/80 hover:bg-slate-50 hover:border-slate-300'
                        }`}
                      >
                        <Star className={`w-3.5 h-3.5 ${isPriority ? 'fill-white text-white' : ''}`} />
                        <span>{isPriority ? 'Prioritário' : 'Marcar Prioritário'}</span>
                      </button>
                    </div>

                    {isPriority && (
                      <div className="mt-1">
                        <label className="text-[11px] font-bold text-brand-blue block mb-1.5 uppercase tracking-wide">
                          Como sua organização contribui ativamente para esse ODS? *
                          {!(data.odsExplanations?.[ods.id]?.trim()) && (
                            <span className="text-[9px] bg-amber-50 text-amber-700 font-extrabold px-1.5 py-0.5 rounded border border-amber-200 uppercase select-none leading-none ml-1.5 inline-block">
                              Pendente
                            </span>
                          )}
                        </label>
                        <textarea
                          rows={2.5}
                          value={data.odsExplanations?.[ods.id] || ''}
                          onChange={(e) => handleExplanationChange(ods.id, e.target.value)}
                          placeholder="Explique suas atividades práticas ligadas a esta causa..."
                          className="w-full text-xs p-3 rounded-xl border border-slate-200/80 bg-white focus:outline-none focus:ring-2 focus:ring-brand-cyan/20 focus:border-brand-cyan transition shadow-sm"
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>



      {/* 2. ESG COLUMN CHECKBOXES */}
      {data.formalizationStatus !== 'no_cnpj' && (
        <div className="border-t border-slate-200 pt-6 space-y-4">
          <h3 className="font-bold text-base text-brand-blue flex items-center gap-2">
            🍃 Pilares Sustentáveis ESG
          </h3>
          <p className="text-xs text-slate-500 mt-[-10px] font-semibold">
            Marque quais temas socioambientais constam nas ações operacionais da sua entidade:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Environmental */}
            <div className="p-5 bg-emerald-50/30 border border-emerald-100 rounded-2xl space-y-3 shadow-sm">
              <h4 className="text-xs font-bold text-emerald-800 uppercase tracking-widest flex items-center gap-1.5 pb-1 border-b border-emerald-100/50">
                🌱 Ambiental
              </h4>
              <div className="flex flex-wrap gap-2 pt-1">
                {['Educação ambiental', 'Reciclagem', 'Redução de resíduos', 'Preservação ambiental', 'Hortas comunitárias', 'Consumo consciente'].map(item => {
                  const isChecked = data.esgEnvironmentalPractices?.includes(item) || false;
                  return (
                    <button
                      key={item}
                      type="button"
                      onClick={() => handleEsgEnvToggle(item)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                        isChecked
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm shadow-emerald-500/10'
                          : 'bg-white text-slate-600 border-slate-200/80 hover:bg-slate-50'
                      }`}
                    >
                      {isChecked ? '✓ ' : ''}{item}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Social */}
            <div className="p-5 bg-blue-50/30 border border-blue-100 rounded-2xl space-y-3 shadow-sm">
              <h4 className="text-xs font-bold text-brand-blue uppercase tracking-widest flex items-center gap-1.5 pb-1 border-b border-blue-100/50">
                🤝 Social
              </h4>
              <div className="flex flex-wrap gap-2 pt-1">
                {['Promoção de direitos', 'Educação', 'Saúde', 'Diversidade e inclusão', 'Geração de renda', 'Desenvolvimento comunitário'].map(item => {
                  const isChecked = data.esgSocialPractices?.includes(item) || false;
                  return (
                    <button
                      key={item}
                      type="button"
                      onClick={() => handleEsgSocialToggle(item)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                        isChecked
                          ? 'bg-brand-blue text-white border-brand-blue shadow-sm shadow-indigo-500/10'
                          : 'bg-white text-slate-600 border-slate-200/80 hover:bg-slate-50'
                      }`}
                    >
                      {isChecked ? '✓ ' : ''}{item}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Governance */}
            <div className="p-5 bg-amber-50/30 border border-amber-100 rounded-2xl space-y-3 shadow-sm">
              <h4 className="text-xs font-bold text-amber-800 uppercase tracking-widest flex items-center gap-1.5 pb-1 border-b border-amber-100/50">
                ⚖️ Governança (ESG)
              </h4>
              <div className="flex flex-wrap gap-2 pt-1">
                {['Conselho', 'Prestação de contas', 'Código de ética', 'Transparência financeira', 'Política de proteção', 'Prevenção de conflitos de interesse'].map(item => {
                  const isChecked = data.esgGovernancePractices?.includes(item) || false;
                  return (
                    <button
                      key={item}
                      type="button"
                      onClick={() => handleEsgGovToggle(item)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                        isChecked
                          ? 'bg-amber-600 text-white border-amber-600 shadow-sm shadow-amber-500/10'
                          : 'bg-white text-slate-600 border-slate-200/80 hover:bg-slate-50'
                      }`}
                    >
                      {isChecked ? '✓ ' : ''}{item}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. GOVERNANCE CHECKLIST */}
      {data.formalizationStatus !== 'no_cnpj' && (
        <div className="border-t border-slate-200 pt-6 space-y-4">
          <h3 className="font-bold text-base text-brand-blue flex items-center gap-2">
            🏛️ Nível de Governança Institucional
          </h3>
          <p className="text-xs text-slate-500 mt-[-10px] font-semibold">
            Selecione o estado real correspondente de cada item administrative listado abaixo. Estas informações ajudam a subsidiar futuras formações coletivas gratuitas apoiadas pela prefeitura:
          </p>

          <div className="space-y-3">
            {GOV_QUESTIONS.map(({ key, label }) => {
              const isRequired = isFieldRequired(key, data.formalizationStatus);
              const isPending = isRequired && !data[key];
              return (
                <div key={key} className="p-4 bg-white border border-slate-200/60 rounded-2xl flex flex-col lg:flex-row lg:items-center justify-between gap-3.5 shadow-sm hover:border-slate-350 hover:shadow-md transition-all duration-200">
                  <span className="text-xs sm:text-sm font-bold text-brand-blue flex items-start gap-1.5 flex-wrap">
                    <span>{label}</span>
                    {isRequired && <span className="text-color-error" aria-hidden="true">*</span>}
                    {isPending && (
                      <span className="text-[9px] bg-amber-50 text-amber-700 font-extrabold px-1.5 py-0.5 rounded border border-amber-200 uppercase select-none leading-none ml-1.5 inline-block">
                        Pendente
                      </span>
                    )}
                    {badgeForField(key)}
                  </span>
                  
                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    {GOV_OPTIONS.map((opt) => {
                      const isChecked = data[key] === opt.value;
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => onChange({ [key]: opt.value })}
                          className={`px-3 py-1.5 rounded-lg text-[11px] font-bold border transition-all duration-200 select-none ${
                            isChecked
                              ? 'bg-brand-blue text-white border-brand-blue shadow-sm shadow-indigo-500/10'
                              : 'bg-slate-50 text-slate-655 border-slate-200/80 hover:bg-slate-100/80'
                          }`}
                        >
                          {opt.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Support Request Flag */}
          <div className="p-4 bg-blue-50/50 border border-brand-cyan/20 rounded-2xl flex items-center justify-between gap-4 mt-4">
            <p className="text-xs text-slate-700 font-semibold leading-relaxed">
              💡 A organização demonstra interesse ou precisa de apoio operacional/cursos sobre governança, prestação de contas públicas ou LGPD?
            </p>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={data.governanceDesiresSupport || false}
                onChange={(e) => onChange({ governanceDesiresSupport: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-cyan" />
              <span className="ml-2 text-xs font-bold text-slate-700">Sim</span>
            </label>
          </div>
        </div>
      )}

    </div>
  );
};

