import React from 'react';
import logoBoraImpactar from '../assets/images/bora_impactar_logo_1780867765790.png';
import logosCombinadas from '../assets/images/logos_header_combinadas.png';
import logoSecretaria from '../assets/images/logo_secretaria_recife.png';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const BoraImpactarLogo: React.FC<LogoProps> = ({ className = '', size = 'md' }) => {
  const heights = {
    sm: 'h-10',
    md: 'h-14',
    lg: 'h-24',
  };

  const height = heights[size] || heights.md;

  return (
    <img 
      src={logoBoraImpactar} 
      alt="Bora Impactar" 
      className={`object-contain select-none ${height} ${className}`} 
    />
  );
};

export const RecifeLogo: React.FC<LogoProps> = ({ className = '', size = 'md' }) => {
  const heights = {
    sm: 'h-8',
    md: 'h-12',
    lg: 'h-20',
  };

  const height = heights[size] || heights.md;

  return (
    <img 
      src={logoSecretaria} 
      alt="Secretaria de Transformação Digital, Ciência e Tecnologia - Prefeitura do Recife" 
      className={`object-contain select-none ${height} ${className}`} 
    />
  );
};

export const LogosCombinadas: React.FC<LogoProps> = ({ className = '', size = 'md' }) => {
  const heights = {
    sm: 'h-8',
    md: 'h-10',
    lg: 'h-16',
  };

  const height = heights[size] || heights.md;

  return (
    <img 
      src={logosCombinadas} 
      alt="Bora Impactar — Secretaria de Transformação Digital, Ciência e Tecnologia — Prefeitura do Recife" 
      className={`object-contain select-none ${height} ${className}`} 
    />
  );
};
