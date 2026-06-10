import React from 'react';
import logoImg from '../assets/images/bora_impactar_logo_1780867765790.png';

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
      src={logoImg} 
      alt="Bora Impactar" 
      className={`object-contain select-none ${height} ${className}`} 
    />
  );
};

export const RecifeLogo: React.FC<LogoProps> = () => {
  return null;
};
