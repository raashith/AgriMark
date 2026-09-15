'use client';

import React from 'react';

interface AgriCardProps {
  children: React.ReactNode;
  variant?: 'default' | 'highlight' | 'alert' | 'dark';
  className?: string;
  onClick?: () => void;
}

export const AgriCard: React.FC<AgriCardProps> = ({
  children,
  variant = 'default',
  className = '',
  onClick,
}) => {
  const baseStyles = 'rounded-2xl p-4 md:p-6 transition-all border shadow-sm';

  const variants = {
    default: 'bg-[#121a16] border-[#1e2d26] text-gray-100',
    highlight: 'bg-[#121a16] border-emerald-600/50 text-gray-100 ring-1 ring-emerald-500/20',
    alert: 'bg-[#121a16] border-amber-600/50 text-gray-100 ring-1 ring-amber-500/20',
    dark: 'bg-[#0a0f0d] border-[#1e2d26] text-gray-100',
  };

  const clickableStyles = onClick ? 'cursor-pointer hover:border-emerald-600 transition' : '';

  return (
    <div
      onClick={onClick}
      className={`${baseStyles} ${variants[variant]} ${clickableStyles} ${className}`}
    >
      {children}
    </div>
  );
};

export default AgriCard;
