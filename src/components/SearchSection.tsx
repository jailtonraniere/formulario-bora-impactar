/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { Search, MapPin, Calendar, CheckCircle2, History, ArrowRight, UserCheck, Building2, TrendingUp, Handshake, ChevronDown } from 'lucide-react';
import { OrganizationData } from '../types';
import { BoraImpactarLogo, RecifeLogo } from './Logo';

interface SearchSectionProps {
  organizations: OrganizationData[];
  onSelect: (org: OrganizationData) => void;
  onNewRegister: () => void;
  onHelpNoCnpj: () => void;
}

export const SearchSection: React.FC<SearchSectionProps> = ({
  organizations,
  onSelect,
  onNewRegister,
  onHelpNoCnpj,
}) => {
  const [flow, setFlow] = useState<'landing' | 'search'>('landing');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedForDemo, setSelectedForDemo] = useState<OrganizationData | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const dropdownFiltered = organizations.filter(org => 
    org.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    org.neighborhood.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (org.tradingName && org.tradingName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  if (flow === 'landing') {
    return (
      <div className="w-full max-w-4xl mx-auto px-4 py-12 select-none animate-in fade-in duration-300">
        <div className="text-center mb-10">
          <div className="flex justify-center items-center mb-5">
            <BoraImpactarLogo size="lg" />
          </div>
          
          <h1 className="text-2xl sm:text-3xl font-bold font-display text-brand-blue tracking-tight mt-4">
            Atualize as informações da sua organização
          </h1>
          <p className="text-sm text-slate-600 mt-3 max-w-2xl mx-auto leading-relaxed">
            Confirme os dados existentes e complemente o perfil da sua organização ou projeto para ampliar as possibilidades de parceria no portal Bora Impactar.
          </p>
        </div>

        {/* Quick info block cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10 max-w-3xl mx-auto">
          <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex items-start gap-3">
            <span className="text-brand-cyan text-lg shrink-0">⏰</span>
            <div>
              <h4 className="font-bold text-xs text-brand-blue uppercase">Tempo estimado</h4>
              <p className="text-xs text-slate-500 mt-1">Apenas 15 minutos para preencher</p>
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex items-start gap-3">
            <span className="text-brand-cyan text-lg shrink-0">💾</span>
            <div>
              <h4 className="font-bold text-xs text-brand-blue uppercase">Salvar e continuar</h4>
              <p className="text-xs text-slate-500 mt-1">Os dados são salvos automaticamente</p>
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex items-start gap-3">
            <span className="text-brand-cyan text-lg shrink-0">🔍</span>
            <div>
              <h4 className="font-bold text-xs text-brand-blue uppercase">Análise de dados</h4>
              <p className="text-xs text-slate-500 mt-1">Validação rápida antes de publicar</p>
            </div>
          </div>
        </div>

        {/* Action Choice Container */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-md max-w-xl mx-auto text-center space-y-6">
          <div className="space-y-4">
            <button
              onClick={() => setFlow('search')}
              className="w-full py-4 px-6 bg-brand-blue hover:bg-brand-blue-light text-white text-sm font-bold rounded-xl transition duration-200 flex items-center justify-center gap-2 cursor-pointer shadow-md hover:shadow-lg"
            >
              <span>Atualizar cadastro existente</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="border-t border-slate-100 pt-5 text-center">
            <button
              onClick={onHelpNoCnpj}
              className="text-xs font-semibold text-brand-cyan hover:text-brand-blue transition cursor-pointer hover:underline"
            >
              Não sei se já estou cadastrado / Dúvidas sobre o CNPJ?
            </button>
            <p className="text-[11px] text-slate-400 mt-1.5 leading-relaxed">
              Iniciativas sem CNPJ, coletivos locais e ONGs em formalização são super bem-vindos.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8 select-none animate-in fade-in duration-300">
      <div className="text-center mb-8">
        <div className="flex justify-center items-center mb-4">
          <BoraImpactarLogo size="lg" />
        </div>
        <h1 className="text-xl sm:text-2xl font-bold font-display text-brand-blue mt-2">
          Atualização Cadastral — Bora Impactar
        </h1>
        <p className="text-sm text-brand-text-sub mt-2 max-w-xl mx-auto leading-relaxed">
          Encontre e confirme os dados existentes da sua organização para podermos otimizar as parcerias.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start mt-4">
        {/* Search for Existing Org */}
        <div className="md:col-span-12 bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-md">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-base font-bold text-brand-blue flex items-center gap-2">
              <Building2 className="w-5 h-5 text-brand-cyan" />
              Selecione sua organização ou projeto cadastrado
            </h2>
            <button
              onClick={() => {
                setFlow('landing');
                setSearchTerm('');
                setIsOpen(false);
              }}
              className="text-xs font-semibold text-slate-500 hover:text-brand-blue transition cursor-pointer"
            >
              Voltar ao início
            </button>
          </div>
          
          <p className="text-xs text-slate-500 mb-6 leading-relaxed">
            Selecione a sua instituição na lista suspensa abaixo para atualizar os dados cadastrais. Você também pode digitar parte do nome para filtrar a lista de opções.
          </p>

          {/* Custom Select Dropdown (Lista Suspensa) */}
          <div className="relative mb-6" ref={containerRef}>
            <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">
              Lista Suspensa de Organizações
            </label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="w-full pl-4 pr-10 py-3.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-white text-left text-sm font-semibold text-slate-700 flex items-center justify-between transition focus:outline-none focus:ring-2 focus:ring-brand-cyan hover:border-slate-300 shadow-sm"
              >
                <span className="truncate flex items-center gap-2 text-brand-blue">
                  <Building2 className="w-4.5 h-4.5 text-brand-cyan shrink-0" />
                  Selecione uma organização da lista suspensa...
                </span>
                <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
              </button>
            </div>

            {isOpen && (
              <div className="absolute z-30 w-full mt-2 bg-white rounded-xl border border-slate-200 shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
                {/* Embedded Search to filter dropdown options quickly */}
                <div className="p-2.5 border-b border-slate-100 bg-slate-50">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Pesquisar organização na lista..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-brand-cyan bg-white transition"
                      onClick={(e) => e.stopPropagation()}
                    />
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                  </div>
                </div>

                <div className="max-h-[280px] overflow-y-auto divide-y divide-slate-100">
                  {dropdownFiltered.length > 0 ? (
                    dropdownFiltered.map((org) => (
                      <button
                        key={org.id}
                        type="button"
                        onClick={() => {
                          setSelectedForDemo(org);
                          setIsOpen(false);
                          setSearchTerm('');
                        }}
                        className="w-full px-4 py-3 text-left hover:bg-slate-50 transition flex flex-col gap-1 cursor-pointer group"
                      >
                        <div className="flex justify-between items-center w-full">
                          <span className="font-bold text-xs sm:text-sm text-brand-blue group-hover:text-brand-cyan transition">
                            {org.name}
                          </span>
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase shrink-0 ${
                            org.status === 'Em análise' 
                              ? 'bg-amber-100 text-amber-800 border border-amber-200'
                              : 'bg-slate-100 text-slate-600 border border-slate-200'
                          }`}>
                            {org.status}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-slate-500">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-slate-400" />
                            {org.neighborhood}, {org.city}
                          </span>
                          <span>•</span>
                          <span>Fundação: {org.foundationYear}</span>
                        </div>
                      </button>
                    ))
                  ) : (
                    <div className="p-6 text-center text-xs text-slate-500">
                      Nenhuma organização encontrada para a pesquisa atual.
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* New Registration Prompt */}
          <div className="mt-6 pt-5 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="text-left">
              <h4 className="text-xs font-bold text-slate-700">Não encontrou sua organização ou projeto na relação acima?</h4>
              <p className="text-[11px] text-slate-500 mt-1 max-w-lg leading-relaxed">
                Se você buscou na base e não localizou o nome, pode ser que ela precise ser inserida. Comece um cadastro do zero agora.
              </p>
            </div>
            <button
              onClick={onNewRegister}
              className="py-2.5 px-5 bg-brand-cyan hover:bg-brand-blue text-white text-xs font-bold rounded-xl shadow-sm transition shrink-0 cursor-pointer text-center"
            >
              Inserir Novo Cadastro
            </button>
          </div>
        </div>
      </div>

      {/* Safety demo verification Modal */}
      {selectedForDemo && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-xl overflow-hidden animate-in fade-in duration-200">
            <div className="p-5 border-b border-slate-100 bg-slate-50 flex items-center gap-3">
              <div className="p-2.5 bg-brand-cyan/10 text-brand-cyan rounded-lg">
                <UserCheck className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-brand-cyan uppercase tracking-wider block">Segurança de Dados</span>
                <h3 className="font-bold text-brand-blue text-sm leading-tight">
                  Validação Cadastral
                </h3>
              </div>
            </div>
            
            <div className="p-5 space-y-3.5">
              <p className="text-xs text-slate-600 leading-relaxed">
                Você selecionou: <strong className="text-brand-blue font-semibold">{selectedForDemo.name}</strong>
              </p>
              
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-[11px] text-amber-800 leading-normal font-medium">
                  🔒 <strong>Na versão definitiva:</strong> enviaremos um código de segurança de 6 dígitos via email ou WhatsApp para o contato cadastrado de modo a certificar e proteger as informações da sua organização de acessos indevidos.
                </p>
              </div>

              <p className="text-xs text-slate-500 leading-relaxed">
                Para fins de teste e verificação desta primeira entrega técnica funcional, você pode avançar imediatamente para preencher.
              </p>
            </div>

            <div className="p-5 bg-slate-50 border-t border-slate-100 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setSelectedForDemo(null)}
                className="py-2 px-3 border border-slate-200 hover:bg-slate-100 rounded-lg text-xs font-semibold text-slate-600 text-center transition"
              >
                Voltar
              </button>
              <button
                type="button"
                onClick={() => {
                  onSelect(selectedForDemo);
                  setSelectedForDemo(null);
                }}
                className="py-2 px-3 bg-brand-blue hover:bg-brand-cyan text-white rounded-lg text-xs font-semibold text-center transition shadow-sm"
              >
                Continuar demonstração
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
