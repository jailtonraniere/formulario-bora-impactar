/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const BoraImpactarLogo: React.FC<LogoProps> = ({ className = '', size = 'md' }) => {
  const sizes = {
    sm: {
      bora: 'text-[14px]',
      impacta: 'text-[20px]',
      gap: 'gap-0.5',
      marginTop: 'mt-[-1px]',
    },
    md: {
      bora: 'text-[18px]',
      impacta: 'text-[26px]',
      gap: 'gap-1',
      marginTop: 'mt-[-2px]',
    },
    lg: {
      bora: 'text-[24px]',
      impacta: 'text-[36px]',
      gap: 'gap-1',
      marginTop: 'mt-[-3px]',
    },
  };

  const currentSize = sizes[size] || sizes.md;

  return (
    <div className={`flex flex-col select-none leading-none ${currentSize.gap} ${className}`}>
      <span 
        className={`font-display font-medium text-brand-cyan tracking-normal italic ${currentSize.bora}`}
        style={{ fontFamily: '"Space Grotesk", cursive, sans-serif' }}
      >
        Bora
      </span>
      <span className={`font-sans font-black text-brand-blue tracking-tight ${currentSize.marginTop} ${currentSize.impacta}`}>
        impacta
      </span>
    </div>
  );
};

export const RecifeLogo: React.FC<LogoProps> = () => {
  // Deactivated as requested ("pode retirar da prefeitura")
  return null;
};
