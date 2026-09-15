'use client';

import React from 'react';

interface AgriBadgeProps {
  children: React.ReactNode;
  variant?: 'emerald' | 'amber' | 'blue' | 'purple' | 'red' | 'gray';
  size?: 'sm' | 'md';
  className?: string;
}

export const AgriBadge: React.FC<AgriBadgeProps> = ({
  children,
  variant = 'emerald',
  size = 'sm',
  className = '',
}) => {
  const baseStyles = 'inline-flex items-center gap-1 font-mono font-bold rounded-full border tracking-wide';

  const variants = {
    emerald: 'bg-emerald-950/80 border-emerald-800/60 text-emerald-400',
    amber: 'bg-amber-950/80 border-amber-800/60 text-amber-400',
    blue: 'bg-blue-950/80 border-blue-800/60 text-blue-400',
    purple: 'bg-purple-950/80 border-purple-800/60 text-purple-400',
    red: 'bg-red-950/80 border-red-800/60 text-red-400',
    gray: 'bg-gray-800/80 border-gray-700/60 text-gray-300',
  };

  const sizes = {
    sm: 'px-2.5 py-0.5 text-[10px]',
    md: 'px-3 py-1 text-xs',
  };

  return (
    <span className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}>
      {children}
    </span>
  );
};

export default AgriBadge;
