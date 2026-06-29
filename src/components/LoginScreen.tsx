/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Lock, 
  Mail, 
  ArrowLeft, 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  AlertCircle, 
  ArrowRight,
  Info
} from 'lucide-react';
import { apiService } from '../services/api';
import { OrganizationData } from '../types';

interface LoginScreenProps {
  organizations: any[];
  onLoginSuccess: (organization: OrganizationData, token: string) => void;
  onBack: () => void;
  initialSelectedOrg?: any;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  organizations,
  onLoginSuccess,
  onBack,
  initialSelectedOrg = null
}) => {
  // Login States
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Handle Login submission
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginIdentifier.trim() || !loginPassword) {
      setLoginError('Por favor, preencha o login e a senha.');
      return;
    }

    setLoginLoading(true);
    setLoginError(null);

    try {
      const response = await apiService.login(loginIdentifier, loginPassword);
      if (response.success && response.data) {
        onLoginSuccess(response.data.organization, response.data.token);
      } else {
        setLoginError(response.error?.message || 'Login ou senha incorretos.');
      }
    } catch (err: any) {
      setLoginError('Ocorreu um erro ao tentar efetuar o login. Tente novamente.');
      console.error(err);
    } finally {
      setLoginLoading(false);
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto px-4 py-8 animate-in fade-in duration-300">
      
      {/* Back button */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-slate-500 hover:text-brand-blue text-xs font-bold mb-6 transition cursor-pointer bg-transparent border-0"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Voltar para tela inicial</span>
      </button>

      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-2xl font-extrabold text-brand-blue font-display tracking-tight">
          Acesso Restrito e Seguro
        </h1>
        <p className="text-xs text-slate-500 mt-2 font-semibold">
          Prefeitura do Recife — Plataforma Bora Impactar
        </p>
      </div>

      {/* Card container */}
      <div className="custom-card p-6 sm:p-8 bg-white/95 backdrop-blur-md shadow-2xl border border-slate-200/50 rounded-3xl overflow-hidden relative">
        
        {/* Security badge top-right */}
        <div className="absolute top-4 right-4 text-emerald-500 flex items-center gap-1 text-[10px] font-black uppercase tracking-wider bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Seguro</span>
        </div>

        {/* Section title */}
        <div className="mb-6">
          <h2 className="text-sm font-extrabold text-brand-blue uppercase tracking-wider">
            Entrar
          </h2>
          <div className="w-12 h-0.5 bg-brand-cyan mt-1.5 rounded-full" />
        </div>

        {/* LOGIN FORM */}
        <form onSubmit={handleLoginSubmit} className="space-y-4">
          <div>
            <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-wider">
              E-mail ou CNPJ da Organização
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Ex: 12.345.678/0001-99 ou contato@ong.org"
                value={loginIdentifier}
                onChange={(e) => setLoginIdentifier(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-cyan/20 focus:border-brand-cyan transition font-semibold text-slate-700 bg-white"
                required
              />
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-wider">
              Senha
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Digite sua senha cadastrada"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                className="w-full pl-10 pr-10 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-cyan/20 focus:border-brand-cyan transition font-semibold text-slate-700 bg-white"
                required
              />
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-650 cursor-pointer p-1 bg-transparent border-0"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Info box: contact admin */}
          <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 text-[11px] text-amber-800 leading-relaxed font-semibold flex items-start gap-2">
            <Info className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
            <span>
              Caso não possua acesso, entre em contato com o <strong className="text-amber-900">administrador do sistema</strong> para solicitar seu usuário e senha.
            </span>
          </div>

          {loginError && (
            <div className="flex items-start gap-2.5 bg-rose-50 border border-rose-100 rounded-xl p-3.5 text-xs text-rose-800 font-semibold animate-shake">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{loginError}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loginLoading}
            className="w-full py-3 px-6 bg-brand-blue hover:bg-brand-blue-hover disabled:bg-slate-300 disabled:cursor-not-allowed text-white text-xs font-bold rounded-xl transition flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-brand-blue/15 active:scale-98 mt-2"
          >
            {loginLoading ? (
              <>
                <div className="w-4.5 h-4.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Autenticando...</span>
              </>
            ) : (
              <>
                <span>Entrar com Segurança</span>
                <ArrowRight className="w-4.5 h-4.5" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
