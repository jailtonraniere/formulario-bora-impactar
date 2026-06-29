/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { Search, MapPin, ArrowRight, Building2, ChevronDown, Clock, Save, ShieldCheck } from 'lucide-react';

interface SearchSectionProps {
  organizations: any[];
  onSelectOrg: (org: any) => void;
  onNewRegister: () => void;
  onHelpNoCnpj: () => void;
  onGoToLogin: () => void;
}

export const SearchSection: React.FC<SearchSectionProps> = ({
  organizations,
  onSelectOrg,
  onNewRegister,
  onHelpNoCnpj,
  onGoToLogin,
}) => {
  const [flow, setFlow] = useState<'landing' | 'search'>('landing');
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const dropdownFiltered = organizations.filter(org =>
    org.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (org.neighborhood && org.neighborhood.toLowerCase().includes(searchTerm.toLowerCase())) ||
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
      <div className="w-full max-w-4xl mx-auto px-4 py-4 sm:py-6 select-none animate-in fade-in duration-350">
        <div className="text-center mb-6">
          <h1 className="text-2xl sm:text-3xl font-extrabold font-display gradient-text tracking-tight leading-tight max-w-2xl mx-auto">
            Atualize as informações da sua organização ou projeto
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-2 max-w-xl mx-auto leading-relaxed font-medium">
            Confirme os dados existentes e complemente o perfil da sua organização ou projeto para ampliar as possibilidades de parceria no portal Bora Impactar.
          </p>
        </div>

        {/* Compact info bar replacing 3 large cards */}
        <div className="bg-slate-50/80 border border-slate-200/80 rounded-2xl p-4 flex flex-col md:flex-row gap-4 justify-between items-center text-left max-w-3xl mx-auto mb-6 font-sans">
          <div className="flex items-center gap-3 w-full md:w-1/3">
            <div className="p-2 bg-sky-50 text-brand-cyan rounded-xl shrink-0">
              <Clock className="w-4.5 h-4.5" />
            </div>
            <div>
              <h4 className="font-extrabold text-[11px] text-brand-blue uppercase tracking-wide">Tempo estimado</h4>
              <p className="text-[10px] text-slate-500 leading-tight">Apenas 15 minutos para conferir e preencher</p>
            </div>
          </div>
          <div className="hidden md:block w-px h-8 bg-slate-200" />
          <div className="flex items-center gap-3 w-full md:w-1/3">
            <div className="p-2 bg-sky-50 text-brand-cyan rounded-xl shrink-0">
              <Save className="w-4.5 h-4.5" />
            </div>
            <div>
              <h4 className="font-extrabold text-[11px] text-brand-blue uppercase tracking-wide">Salvar e continuar</h4>
              <p className="text-[10px] text-slate-500 leading-tight">Os dados são salvos de forma segura no navegador</p>
            </div>
          </div>
          <div className="hidden md:block w-px h-8 bg-slate-200" />
          <div className="flex items-center gap-3 w-full md:w-1/3">
            <div className="p-2 bg-sky-50 text-brand-cyan rounded-xl shrink-0">
              <ShieldCheck className="w-4.5 h-4.5" />
            </div>
            <div>
              <h4 className="font-extrabold text-[11px] text-brand-blue uppercase tracking-wide">Análise de dados</h4>
              <p className="text-[10px] text-slate-500 leading-tight">Validação rápida do time antes da publicação</p>
            </div>
          </div>
        </div>

        {/* Action Choice Container */}
        <div className="custom-card p-6 sm:p-8 max-w-2xl mx-auto bg-white/80 backdrop-blur-md shadow-lg border border-slate-200/50">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              onClick={onGoToLogin}
              className="w-full py-3.5 px-6 bg-brand-blue hover:bg-brand-blue-hover text-white text-xs font-bold rounded-2xl transition flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-brand-blue/15"
            >
              <span>Atualizar cadastro existente</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={onNewRegister}
              className="w-full py-3.5 px-6 border border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 text-brand-blue text-xs font-bold rounded-2xl transition flex items-center justify-center gap-2 cursor-pointer shadow-sm"
            >
              <span>Inserir Novo Cadastro</span>
            </button>
          </div>

          <div className="border-t border-slate-100 mt-6 pt-5 text-center">
            <button
              onClick={onHelpNoCnpj}
              className="text-xs font-bold text-brand-cyan hover:text-brand-blue transition cursor-pointer hover:underline"
            >
              Não sei se já estou cadastrado / Dúvidas sobre o CNPJ?
            </button>
            <p className="text-[11px] text-slate-400 mt-2 leading-relaxed font-semibold">
              Iniciativas sem CNPJ, coletivos locais e ONGs em formalização são super bem-vindos.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-4 sm:py-6 select-none animate-in fade-in duration-300">
      <div className="text-center mb-6">
        <h1 className="text-xl sm:text-2xl font-bold font-display text-brand-blue">
          Atualização Cadastral
        </h1>
        <span className="text-xs font-bold text-brand-cyan tracking-wider uppercase">Bora Impactar</span>
        <p className="text-xs text-slate-500 mt-2 max-w-xl mx-auto leading-relaxed font-semibold">
          Encontre e confirme os dados da sua organização ou projeto para podermos otimizar as parcerias.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start mt-4">
        {/* Search for Existing Org */}
        <div className="md:col-span-12 custom-card p-6 sm:p-8 bg-white/90 backdrop-blur-md border border-slate-200/50 shadow-lg">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-sm sm:text-base font-bold text-brand-blue flex items-center gap-2">
              <Building2 className="w-5 h-5 text-brand-cyan" />
              Selecione sua organização ou projeto cadastrado
            </h2>
            <button
              onClick={() => {
                setFlow('landing');
                setSearchTerm('');
                setIsOpen(false);
              }}
              className="text-xs font-bold text-slate-500 hover:text-brand-cyan transition cursor-pointer hover:underline"
            >
              Voltar ao início
            </button>
          </div>

          <p className="text-xs text-slate-500 mb-6 leading-relaxed font-semibold">
            Selecione a sua instituição ou projeto na lista suspensa abaixo para atualizar os dados cadastrais. Você também pode digitar parte do nome para filtrar a lista de opções.
          </p>

          {/* Custom Select Dropdown */}
          <div className="relative mb-6" ref={containerRef}>
            <label className="block text-[10px] font-bold text-slate-400 mb-2.5 uppercase tracking-widest">
              Lista Suspensa de Organizações e Projetos
            </label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="w-full pl-4 pr-10 py-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-left text-sm font-semibold text-slate-700 flex items-center justify-between transition focus:outline-none focus:ring-2 focus:ring-brand-cyan/20 focus:border-brand-cyan hover:border-slate-350 shadow-sm cursor-pointer"
              >
                <span className="truncate flex items-center gap-2.5 text-brand-blue font-bold">
                  <Building2 className="w-4.5 h-4.5 text-brand-cyan shrink-0" />
                  Selecione uma organização ou projeto da lista suspensa...
                </span>
                <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform duration-250 ${isOpen ? 'rotate-180' : ''}`} />
              </button>
            </div>

            {isOpen && (
              <div className="absolute z-30 w-full mt-2.5 bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200/80 shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-3 duration-200">
                {/* Search filter */}
                <div className="p-3 border-b border-slate-100 bg-slate-50/70">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Pesquisar organização ou projeto na lista..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 bg-white text-xs focus:outline-none focus:ring-2 focus:ring-brand-cyan/20 focus:border-brand-cyan transition"
                      onClick={(e) => e.stopPropagation()}
                    />
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  </div>
                </div>

                <div className="max-h-[300px] overflow-y-auto divide-y divide-slate-100">
                  {dropdownFiltered.length > 0 ? (
                    dropdownFiltered.map((org) => (
                      <button
                        key={org.id}
                        type="button"
                        onClick={() => {
                          setIsOpen(false);
                          setSearchTerm('');
                          onSelectOrg(org);
                        }}
                        className="w-full px-5 py-4 text-left hover:bg-slate-50/80 transition flex flex-col gap-1 cursor-pointer group"
                      >
                        <div className="flex justify-between items-center w-full">
                          <span className="font-extrabold text-xs sm:text-sm text-brand-blue group-hover:text-brand-cyan transition-colors">
                            {org.name}
                          </span>
                          <span className={`text-[9px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider shrink-0 ${
                            org.status === 'Em análise'
                              ? 'bg-amber-50 text-amber-800 border border-amber-200'
                              : 'bg-slate-150 text-slate-600 border border-slate-200'
                          }`}>
                            {org.status}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-slate-500 font-semibold mt-0.5">
                          <span className="flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            {org.neighborhood}, Recife
                          </span>
                          <span>•</span>
                          <span className="font-mono text-[10px] text-slate-400">ID: {org.id}</span>
                        </div>
                      </button>
                    ))
                  ) : (
                    <div className="p-6 text-center text-xs text-slate-500">
                      Nenhuma organização ou projeto encontrado para a pesquisa atual.
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
              <p className="text-[11px] text-slate-500 mt-1 max-w-lg leading-relaxed font-semibold">
                Se você buscou na base e não localizou o nome, pode ser que ela precise ser inserida. Comece um cadastro do zero agora.
              </p>
            </div>
            <button
              onClick={onNewRegister}
              className="py-3 px-6 btn-primary text-xs font-bold rounded-xl shadow-md transition shrink-0 cursor-pointer text-center"
            >
              Inserir Novo Cadastro
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
