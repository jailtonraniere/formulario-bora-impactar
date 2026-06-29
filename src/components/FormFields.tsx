/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { InputHTMLAttributes, TextareaHTMLAttributes } from 'react';
import { HelpCircle, Star, Sparkles, CheckCircle, AlertCircle } from 'lucide-react';

export interface FillingTip {
  title: string;
  examples: string[];
  practices: string[];
}

interface BaseFieldProps {
  id: string;
  label: string;
  required?: boolean;
  error?: string;
  helpText?: string;
  exampleText?: string;
  fillingTip?: FillingTip;
}

interface InputFieldProps extends BaseFieldProps, Omit<InputHTMLAttributes<HTMLInputElement>, 'id'> {
  icon?: React.ReactNode;
}

export const FillingTipTooltip: React.FC<{ tip: FillingTip }> = ({ tip }) => {
  return (
    <span className="relative inline-flex items-center group ml-1 select-none pointer-events-auto">
      <button
        type="button"
        className="inline-flex items-center justify-center p-0.5 text-brand-cyan hover:text-brand-blue bg-blue-50/70 hover:bg-blue-100 rounded-full transition-all duration-200 cursor-help focus:outline-none focus:ring-1 focus:ring-brand-cyan"
        tabIndex={-1}
        title="Dica de preenchimento"
      >
        <HelpCircle className="w-3.5 h-3.5 shrink-0" />
      </button>
      
      {/* Tooltip Card */}
      <span className="invisible opacity-0 group-hover:visible group-hover:opacity-100 active:visible active:opacity-100 absolute z-[100] bottom-full left-1/2 -translate-x-1/2 mb-2 w-72 sm:w-80 p-3.5 bg-slate-900 border border-slate-700 text-slate-100 rounded-xl shadow-2xl transition-all duration-200 ease-out flex flex-col gap-2">
        <span className="flex items-center gap-1.5 border-b border-slate-850 pb-1.5 font-bold text-slate-200 uppercase tracking-widest text-[10px]">
          <Sparkles className="w-3.5 h-3.5 text-yellow-400 shrink-0" />
          Dica: {tip.title}
        </span>
        
        {tip.practices && tip.practices.length > 0 && (
          <span className="text-left select-text">
            <strong className="text-emerald-400 text-[10px] uppercase font-bold block mb-1">💡 Boas Práticas:</strong>
            <span className="flex flex-col gap-1 pl-1 text-[11px] text-slate-300 font-normal leading-normal">
              {tip.practices.map((p, i) => (
                <span key={i} className="flex items-start gap-1">
                  <span className="text-emerald-400 mt-0.5 shrink-0">•</span>
                  <span>{p}</span>
                </span>
              ))}
            </span>
          </span>
        )}
        
        {tip.examples && tip.examples.length > 0 && (
          <span className="text-left border-t border-slate-800 pt-2 select-text">
            <strong className="text-amber-400 text-[10px] uppercase font-bold block mb-1">📝 Exemplos:</strong>
            <span className="flex flex-col gap-1 pl-1 text-[11px] text-slate-300 font-normal leading-normal italic">
              {tip.examples.map((ex, i) => (
                <span key={i} className="flex items-start gap-1">
                  <span className="text-amber-400 mt-0.5 shrink-0">“</span>
                  <span>{ex}”</span>
                </span>
              ))}
            </span>
          </span>
        )}
        
        {/* Pointer Arrow */}
        <span className="absolute top-full -translate-y-1 left-1/2 -translate-x-1/2 w-2 h-2 rotate-45 bg-slate-900 border-r border-b border-slate-700" />
      </span>
    </span>
  );
};

export const InputField: React.FC<InputFieldProps> = ({
  id,
  label,
  required = false,
  error,
  helpText,
  exampleText,
  icon,
  className = '',
  fillingTip,
  ...props
}) => {
  const isPending = required && (!props.value || String(props.value).trim() === '');

  return (
    <div className={`flex flex-col w-full h-full ${className}`}>
      <div>
        <label htmlFor={id} className="text-xs sm:text-sm font-bold text-brand-blue mb-1.5 inline-flex items-center flex-wrap gap-1">
          <span>{label}</span>
          {required && <span className="text-color-error" aria-hidden="true">*</span>}
          {isPending && (
            <span className="text-[9px] bg-amber-50 text-amber-700 font-extrabold px-1.5 py-0.5 rounded border border-amber-200 uppercase select-none leading-none ml-1.5 inline-block">
              Pendente
            </span>
          )}
          {fillingTip && <FillingTipTooltip tip={fillingTip} />}
        </label>
        
        {helpText && <p className="text-xs text-brand-cyan mb-1.5 font-medium">{helpText}</p>}
      </div>
      
      <div className="mt-auto flex flex-col">
        <div className="relative">
        {icon && (
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
            {icon}
          </div>
        )}
        <input
          id={id}
          className={`w-full px-4 py-3 rounded-xl border text-sm bg-white shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-brand-cyan/20 focus:border-brand-cyan ${
            icon ? 'pl-11' : ''
          } ${
            error 
              ? 'border-red-500 focus:ring-red-500/20 focus:border-red-500 text-red-900' 
              : 'border-slate-200/80 hover:border-slate-350'
          }`}
          required={required}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : undefined}
          {...props}
        />
      </div>

      {exampleText && (
        <span className="text-xs text-slate-400 italic mt-1.5 pl-1">
          Exemplo: {exampleText}
        </span>
      )}

        {error && (
          <span id={`${id}-error`} className="text-xs text-red-650 mt-1.5 flex items-center gap-1 font-semibold">
            <AlertCircle className="w-3.5 h-3.5 text-red-500" />
            {error}
          </span>
        )}
      </div>
    </div>
  );
};

interface TextAreaFieldProps extends BaseFieldProps, Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'id'> {
  maxLength?: number;
  onAiImproveClick?: () => void;
}

export const TextAreaField: React.FC<TextAreaFieldProps> = ({
  id,
  label,
  required = false,
  error,
  helpText,
  exampleText,
  maxLength = 1000,
  value = '',
  onAiImproveClick,
  className = '',
  fillingTip,
  ...props
}) => {
  const charCount = typeof value === 'string' ? value.length : 0;
  const isPending = required && (!value || String(value).trim() === '');

  return (
    <div className={`flex flex-col w-full h-full ${className}`}>
      <div>
        <div className="flex justify-between items-baseline mb-1.5">
          <label htmlFor={id} className="text-xs sm:text-sm font-bold text-brand-blue inline-flex items-center flex-wrap gap-1">
            <span>{label}</span>
            {required && <span className="text-color-error" aria-hidden="true">*</span>}
            {isPending && (
              <span className="text-[9px] bg-amber-50 text-amber-700 font-extrabold px-1.5 py-0.5 rounded border border-amber-200 uppercase select-none leading-none ml-1.5 inline-block">
                Pendente
              </span>
            )}
            {fillingTip && <FillingTipTooltip tip={fillingTip} />}
          </label>
          
          {maxLength && (
            <span className="text-[10px] font-mono font-bold text-slate-400 bg-slate-50 px-2 py-0.5 rounded border border-slate-100">
              {charCount}/{maxLength}
            </span>
          )}
        </div>

        {helpText && <p className="text-xs text-brand-cyan mb-1.5 font-medium">{helpText}</p>}
      </div>

      <div className="mt-auto flex flex-col">
        <div className="relative">
        <textarea
          id={id}
          rows={3.5}
          maxLength={maxLength}
          className={`w-full px-4 py-3 rounded-xl border text-sm bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-cyan/20 focus:border-brand-cyan resize-y ${
            error 
              ? 'border-red-500 focus:ring-red-500/20 focus:border-red-500' 
              : 'border-slate-200/80 hover:border-slate-350'
          }`}
          required={required}
          value={value}
          {...props}
        />
        
        {/* Animated AI help button inside */}
        {onAiImproveClick && charCount > 10 && (
          <button
            type="button"
            className="absolute bottom-3.5 right-3.5 flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-400 bg-slate-50 border border-slate-250 rounded-lg cursor-not-allowed select-none"
            title="Recurso de IA disponível em breve"
            disabled
          >
            <Sparkles className="w-3.5 h-3.5 shrink-0" />
            <span>IA: Disponível em breve</span>
          </button>
        )}
      </div>

      {exampleText && (
        <span className="text-xs bg-slate-50/70 text-slate-600 p-3 rounded-xl border border-dashed border-slate-200 italic mt-2 leading-relaxed block pl-3">
          💡 <strong>Exemplo:</strong> "{exampleText}"
        </span>
      )}

        {error && (
          <span className="text-xs text-red-650 mt-1.5 flex items-center gap-1 font-semibold">
            <AlertCircle className="w-3.5 h-3.5 text-red-500" />
            {error}
          </span>
        )}
      </div>
    </div>
  );
};

interface SelectFieldProps extends BaseFieldProps, Omit<InputHTMLAttributes<HTMLSelectElement>, 'id' | 'type'> {
  options: Array<{ value: string; label: string }>;
}

export const SelectField: React.FC<SelectFieldProps> = ({
  id,
  label,
  required = false,
  error,
  helpText,
  exampleText,
  options,
  className = '',
  value,
  fillingTip,
  ...props
}) => {
  const isPending = required && (!value || String(value).trim() === '');

  return (
    <div className={`flex flex-col w-full h-full ${className}`}>
      <div>
        <label htmlFor={id} className="text-xs sm:text-sm font-bold text-brand-blue mb-1.5 inline-flex items-center flex-wrap gap-1">
          <span>{label}</span>
          {required && <span className="text-color-error" aria-hidden="true">*</span>}
          {isPending && (
            <span className="text-[9px] bg-amber-50 text-amber-700 font-extrabold px-1.5 py-0.5 rounded border border-amber-200 uppercase select-none leading-none ml-1.5 inline-block">
              Pendente
            </span>
          )}
          {fillingTip && <FillingTipTooltip tip={fillingTip} />}
        </label>

        {helpText && <p className="text-xs text-brand-cyan mb-1.5 font-medium">{helpText}</p>}
      </div>

      <div className="mt-auto flex flex-col">
        <select
        id={id}
        value={value}
        className={`w-full px-4 py-3 rounded-xl border text-sm bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-cyan/20 focus:border-brand-cyan cursor-pointer ${
          error 
            ? 'border-red-500 focus:ring-red-500/20 focus:border-red-500' 
            : 'border-slate-200/80 hover:border-slate-350'
        }`}
        required={required}
        {...props as any}
      >
        <option value="">Selecione uma opção...</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

        {error && (
          <span className="text-xs text-red-650 mt-1.5 flex items-center gap-1 font-semibold">
            <AlertCircle className="w-3.5 h-3.5 text-red-500" />
            {error}
          </span>
        )}
      </div>
    </div>
  );
};

export const ProgressBar: React.FC<{
  currentStep: number;
  totalSteps: number;
  stepName: string;
  onStepClick?: (step: number) => void;
}> = ({ currentStep, totalSteps, stepName, onStepClick }) => {
  const percentage = Math.round((currentStep / totalSteps) * 100);

  const stepLabels = [
    'Identificação',
    'Contatos',
    'Sobre',
    'Público',
    'Impacto',
    'ODS/ESG',
    'Recursos',
    'Materiais',
    'Revisão'
  ];

  return (
    <div className="w-full bg-white/90 backdrop-blur-md border border-slate-200/60 rounded-2xl p-5 sm:p-6 shadow-sm select-none">
      {/* Mobile Compact Progress Bar */}
      <div className="flex sm:hidden items-center justify-between gap-3">
        <div className="flex-1">
          <span className="text-[10px] font-bold text-brand-cyan uppercase tracking-wider block">
            Etapa {currentStep} de {totalSteps}
          </span>
          <h2 className="text-sm font-extrabold text-brand-blue tracking-tight leading-tight mt-0.5">
            {stepName}
          </h2>
        </div>
        <div className="relative w-12 h-12 flex items-center justify-center shrink-0">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
            <path
              className="text-slate-100"
              strokeWidth="3.5"
              stroke="currentColor"
              fill="none"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
            <path
              className="text-brand-cyan transition-all duration-500 ease-out"
              strokeWidth="3.8"
              strokeDasharray={`${percentage}, 100`}
              strokeLinecap="round"
              stroke="currentColor"
              fill="none"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
          </svg>
          <span className="absolute text-[10px] font-black text-brand-blue">{percentage}%</span>
        </div>
      </div>

      {/* Desktop/Tablet Stepper Map */}
      <div className="hidden sm:block space-y-5">
        <div className="flex justify-between items-center">
          <div>
            <span className="text-[10px] font-bold text-brand-cyan uppercase tracking-wider block">
              Progresso do Cadastro
            </span>
            <h2 className="text-lg font-extrabold text-brand-blue tracking-tight mt-0.5">
              {stepName}
            </h2>
          </div>
          <div className="text-right">
            <span className="text-2xl font-black text-brand-blue tracking-tight">
              {percentage}%
            </span>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mt-[-4px]">das Etapas</span>
          </div>
        </div>

        {/* Connecting Line Tracker */}
        <div className="relative flex items-center justify-between mt-6 px-1">
          {/* Gray Background Line */}
          <div className="absolute left-0 right-0 h-0.5 bg-slate-100 rounded-full z-0" />
          {/* Active Highlighted Line */}
          <div 
            className="absolute left-0 h-0.5 bg-gradient-to-r from-brand-blue-light to-brand-cyan rounded-full z-0 transition-all duration-500 ease-out"
            style={{ width: `${Math.max(0, Math.min(100, ((currentStep - 1) / (totalSteps - 1)) * 100))}%` }}
          />

          {stepLabels.map((label, index) => {
            const stepNum = index + 1;
            const isCompleted = stepNum < currentStep;
            const isActive = stepNum === currentStep;
            
            return (
              <button
                key={index}
                type="button"
                onClick={() => onStepClick?.(stepNum)}
                className="flex flex-col items-center relative z-10 focus:outline-none cursor-pointer group/step"
                title={`Ir para etapa ${stepNum}: ${label}`}
              >
                <div 
                  className={`w-8.5 h-8.5 rounded-full flex items-center justify-center font-bold text-xs transition-all duration-300 group-hover/step:scale-105 ${
                    isCompleted 
                      ? 'bg-emerald-500 text-white border-2 border-emerald-500 shadow-md shadow-emerald-500/10 hover:bg-emerald-600' 
                      : isActive 
                        ? 'bg-white text-brand-cyan border-2 border-brand-cyan shadow-lg shadow-sky-500/15 ring-4 ring-sky-500/10 scale-110 font-extrabold' 
                        : 'bg-white text-slate-400 border-2 border-slate-200 group-hover/step:border-brand-cyan/60 group-hover/step:text-brand-cyan'
                  }`}
                >
                  {isCompleted ? (
                    <svg className="w-4 h-4 stroke-[3]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    stepNum
                  )}
                </div>
                {/* Tiny step label */}
                <span 
                  className={`text-[9px] font-bold mt-2 select-none transition-colors duration-200 whitespace-nowrap absolute top-full group-hover/step:text-brand-cyan ${
                    isActive 
                      ? 'text-brand-cyan font-black' 
                      : isCompleted 
                        ? 'text-slate-500' 
                        : 'text-slate-400'
                  }`}
                >
                  {label}
                </span>
              </button>
            );
          })}
        </div>
        {/* Padding spacer to account for absolute labels */}
        <div className="h-2" />
      </div>
    </div>
  );
};

export const PhoneMaskHelper = (val: string): string => {
  let matched = val.replace(/\D/g, '');
  if (matched.length > 11) matched = matched.substring(0, 11);
  if (matched.length > 10) {
    return `(${matched.substring(0, 2)}) ${matched.substring(2, 7)}-${matched.substring(7, 11)}`;
  } else if (matched.length > 6) {
    return `(${matched.substring(0, 2)}) ${matched.substring(2, 6)}-${matched.substring(6)}`;
  } else if (matched.length > 2) {
    return `(${matched.substring(0, 2)}) ${matched.substring(2)}`;
  } else if (matched.length > 0) {
    return `(${matched}`;
  }
  return matched;
};

export const CnpjMaskHelper = (val: string): string => {
  let matched = val.replace(/\D/g, '');
  if (matched.length > 14) matched = matched.substring(0, 14);
  if (matched.length > 12) {
    return `${matched.substring(0, 2)}.${matched.substring(2, 5)}.${matched.substring(5, 8)}/${matched.substring(8, 12)}-${matched.substring(12)}`;
  } else if (matched.length > 8) {
    return `${matched.substring(0, 2)}.${matched.substring(2, 5)}.${matched.substring(5, 8)}/${matched.substring(8)}`;
  } else if (matched.length > 5) {
    return `${matched.substring(0, 2)}.${matched.substring(2, 5)}.${matched.substring(5)}`;
  } else if (matched.length > 2) {
    return `${matched.substring(0, 2)}.${matched.substring(2)}`;
  }
  return matched;
};

export const CepMaskHelper = (val: string): string => {
  let matched = val.replace(/\D/g, '');
  if (matched.length > 8) matched = matched.substring(0, 8);
  if (matched.length > 5) {
    return `${matched.substring(0, 5)}-${matched.substring(5)}`;
  }
  return matched;
};

interface YesNoFieldProps {
  id: string;
  label: string;
  required?: boolean;
  value: boolean | 'sim' | 'nao' | null | undefined | '';
  onChange: (val: 'sim' | 'nao') => void;
  helpText?: string;
  exampleText?: string;
  error?: string;
}

export const YesNoField: React.FC<YesNoFieldProps> = ({
  id,
  label,
  required = false,
  value,
  onChange,
  helpText,
  exampleText,
  error,
}) => {
  const isPending = required && (value === undefined || value === null || value === '');

  return (
    <div className="flex flex-col w-full h-full font-sans">
      <div>
        <label className="text-xs sm:text-sm font-bold text-brand-blue mb-1 inline-flex items-center flex-wrap gap-1">
          <span>{label}</span>
          {required && <span className="text-color-error" aria-hidden="true">*</span>}
          {isPending && (
            <span className="text-[9px] bg-amber-50 text-amber-700 font-extrabold px-1.5 py-0.5 rounded border border-amber-200 uppercase select-none leading-none ml-1.5 inline-block">
              Pendente
            </span>
          )}
        </label>
        
        {helpText && <p className="text-xs text-slate-500 mb-2.5 font-medium">{helpText}</p>}
      </div>
      
      <div className="mt-auto flex flex-col">
        <div className="flex gap-3">
        <button
          id={id}
          type="button"
          onClick={() => onChange('sim')}
          className={`py-3 px-5 rounded-xl text-sm font-bold border transition-all cursor-pointer flex-1 text-center shadow-sm hover:scale-[1.01] active:scale-[0.99] ${
            value === true || value === 'sim'
              ? 'bg-gradient-to-br from-emerald-500 to-emerald-600 text-white border-emerald-500 shadow-md shadow-emerald-500/10'
              : 'bg-white text-slate-600 border-slate-200/80 hover:bg-slate-50 hover:border-slate-350'
          }`}
        >
          Sim
        </button>
        <button
          type="button"
          onClick={() => onChange('nao')}
          className={`py-3 px-5 rounded-xl text-sm font-bold border transition-all cursor-pointer flex-1 text-center shadow-sm hover:scale-[1.01] active:scale-[0.99] ${
            value === false || value === 'nao'
              ? 'bg-gradient-to-br from-rose-500 to-rose-600 text-white border-rose-500 shadow-md shadow-rose-500/10'
              : 'bg-white text-slate-600 border-slate-200/80 hover:bg-slate-50 hover:border-slate-350'
          }`}
        >
          Não
        </button>
      </div>

      {exampleText && (
        <span className="text-xs text-slate-400 italic mt-2 block pl-1">
          {exampleText}
        </span>
      )}

        {error && (
          <span className="text-xs text-red-655 mt-2 flex items-center gap-1 font-semibold">
            <AlertCircle className="w-3.5 h-3.5 text-red-500" />
            {error}
          </span>
        )}
      </div>
    </div>
  );
};
