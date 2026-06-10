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
            <strong className="text-amber-400 text-[10px] uppercase font-bold block mb-1">📝 Exemplos Recomendados:</strong>
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
  return (
    <div className={`flex flex-col w-full ${className}`}>
      <label htmlFor={id} className="text-sm font-semibold text-brand-blue mb-1 inline-flex items-center flex-wrap gap-1">
        <span>{label}</span>
        {required && <span className="text-color-error" aria-hidden="true">*</span>}
        {fillingTip && <FillingTipTooltip tip={fillingTip} />}
      </label>
      
      {helpText && <p className="text-xs text-brand-cyan mb-1">{helpText}</p>}
      
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            {icon}
          </div>
        )}
        <input
          id={id}
          className={`w-full px-4 py-2.5 rounded-lg border text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-cyan focus:border-transparent ${
            icon ? 'pl-10' : ''
          } ${
            error 
              ? 'border-red-500 focus:ring-red-500 text-red-900' 
              : 'border-slate-200 outline-none hover:border-slate-300'
          }`}
          required={required}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : undefined}
          {...props}
        />
      </div>

      {exampleText && (
        <span className="text-xs text-gray-400 italic mt-1">
          Exemplo: {exampleText}
        </span>
      )}

      {error && (
        <span id={`${id}-error`} className="text-xs text-red-600 mt-1 flex items-center gap-1 font-medium">
          <AlertCircle className="w-3.5 h-3.5" />
          {error}
        </span>
      )}
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

  return (
    <div className={`flex flex-col w-full ${className}`}>
      <div className="flex justify-between items-baseline mb-1">
        <label htmlFor={id} className="text-sm font-semibold text-brand-blue inline-flex items-center flex-wrap gap-1">
          <span>{label}</span>
          {required && <span className="text-color-error" aria-hidden="true">*</span>}
          {fillingTip && <FillingTipTooltip tip={fillingTip} />}
        </label>
        
        {maxLength && (
          <span className="text-[11px] font-mono text-gray-400">
            {charCount}/{maxLength}
          </span>
        )}
      </div>

      {helpText && <p className="text-xs text-brand-cyan mb-1">{helpText}</p>}

      <div className="relative">
        <textarea
          id={id}
          rows={3}
          maxLength={maxLength}
          className={`w-full px-4 py-2.5 rounded-lg border text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-cyan focus:border-transparent resize-y ${
            error 
              ? 'border-red-500 focus:ring-red-500' 
              : 'border-slate-200 hover:border-slate-300'
          }`}
          required={required}
          value={value}
          {...props}
        />
        
        {/* Animated AI help button inside */}
        {onAiImproveClick && charCount > 10 && (
          <button
            type="button"
            onClick={onAiImproveClick}
            className="absolute bottom-3 right-3 flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-brand-blue bg-blue-50 border border-blue-200 rounded-md hover:bg-brand-cyan hover:text-white transition duration-200 shadow-sm"
            title="Clique para que a IA ajude a formular seu texto com base somente nas suas ideias"
          >
            <Sparkles className="w-3.5 h-3.5 shrink-0" />
            <span>Melhorar texto</span>
          </button>
        )}
      </div>

      {exampleText && (
        <span className="text-xs bg-slate-50 text-gray-500 p-2.5 rounded-md border border-dashed border-slate-200 italic mt-1.5 leading-relaxed">
          💡 <strong>Exemplo recomendado:</strong> "{exampleText}"
        </span>
      )}

      {error && (
        <span className="text-xs text-red-600 mt-1 flex items-center gap-1">
          <AlertCircle className="w-3.5 h-3.5" />
          {error}
        </span>
      )}
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
  return (
    <div className={`flex flex-col w-full ${className}`}>
      <label htmlFor={id} className="text-sm font-semibold text-brand-blue mb-1 inline-flex items-center flex-wrap gap-1">
        <span>{label}</span>
        {required && <span className="text-color-error" aria-hidden="true">*</span>}
        {fillingTip && <FillingTipTooltip tip={fillingTip} />}
      </label>

      {helpText && <p className="text-xs text-brand-cyan mb-1">{helpText}</p>}

      <select
        id={id}
        value={value}
        className={`w-full px-4 py-2.5 rounded-lg border text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-cyan focus:border-transparent ${
          error 
            ? 'border-red-500 focus:ring-red-500' 
            : 'border-slate-200 hover:border-slate-300'
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
        <span className="text-xs text-red-600 mt-1 flex items-center gap-1 font-medium">
          <AlertCircle className="w-3.5 h-3.5" />
          {error}
        </span>
      )}
    </div>
  );
};

export const ProgressBar: React.FC<{
  currentStep: number;
  totalSteps: number;
  stepName: string;
}> = ({ currentStep, totalSteps, stepName }) => {
  const percentage = Math.round((currentStep / totalSteps) * 100);

  return (
    <div className="w-full bg-white border border-slate-100 rounded-xl p-4 shadow-sm select-none">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-2">
        <div>
          <span className="text-xs font-semibold text-brand-cyan uppercase tracking-normal">
            Etapa {currentStep} de {totalSteps}
          </span>
          <h2 className="text-base font-bold text-brand-blue">
            {stepName}
          </h2>
        </div>
        <div className="shrink-0 text-right">
          <span className="text-lg font-extrabold text-brand-blue">
            {percentage}%
          </span>
          <span className="text-xs text-gray-400 block mt-[-4px]">concluído</span>
        </div>
      </div>
      
      {/* Outer shell progress line */}
      <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
        <div 
          className="bg-brand-cyan h-full rounded-full transition-all duration-500 ease-out"
          style={{ width: `${percentage}%` }}
        />
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
  value: boolean | null | undefined;
  onChange: (val: boolean) => void;
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
  return (
    <div className="flex flex-col w-full">
      <label className="text-sm font-semibold text-brand-blue mb-1 inline-flex items-center flex-wrap gap-1">
        <span>{label}</span>
        {required && <span className="text-color-error" aria-hidden="true">*</span>}
      </label>
      
      {helpText && <p className="text-xs text-brand-text-sub mb-2">{helpText}</p>}
      
      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => onChange(true)}
          className={`py-2.5 px-4 rounded-xl text-sm font-bold border transition-all cursor-pointer flex-1 text-center ${
            value === true
              ? 'bg-emerald-600 text-white border-emerald-600 shadow-md'
              : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
          }`}
        >
          Sim
        </button>
        <button
          type="button"
          onClick={() => onChange(false)}
          className={`py-2.5 px-4 rounded-xl text-sm font-bold border transition-all cursor-pointer flex-1 text-center ${
            value === false
              ? 'bg-rose-700 text-white border-rose-700 shadow-md'
              : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
          }`}
        >
          Não
        </button>
      </div>

      {exampleText && (
        <span className="text-xs text-slate-400 italic mt-1.5 block">
          {exampleText}
        </span>
      )}

      {error && (
        <span className="text-xs text-red-600 mt-1.5 flex items-center gap-1 font-medium">
          <AlertCircle className="w-3.5 h-3.5" />
          {error}
        </span>
      )}
    </div>
  );
};

