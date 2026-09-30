import React from 'react';

export interface StitchBadgeProps {
  label: string;
  variant?: 'emerald' | 'gold' | 'amber' | 'blue' | 'rose' | 'neutral';
  size?: 'sm' | 'md';
  icon?: React.ReactNode;
  className?: string;
}

export const StitchBadge: React.FC<StitchBadgeProps> = ({
  label,
  variant = 'emerald',
  size = 'md',
  icon,
  className = '',
}) => {
  const variantMap = {
    emerald: 'bg-emerald-950/80 text-emerald-400 border-emerald-800/60',
    gold: 'bg-[#1B4D3E] text-[#FCE196] border-[#E5A93C]/40',
    amber: 'bg-amber-950/80 text-amber-300 border-amber-800/60',
    blue: 'bg-sky-950/80 text-sky-300 border-sky-800/60',
    rose: 'bg-rose-950/80 text-rose-300 border-rose-800/60',
    neutral: 'bg-[#18241F] text-gray-300 border-[#2A3C33]',
  };

  const sizeMap = {
    sm: 'px-2 py-0.5 text-[9px]',
    md: 'px-2.5 py-1 text-[10px]',
  };

  return (
    <span
      className={`inline-flex items-center gap-1 font-mono font-bold tracking-wider uppercase rounded-full border shadow-sm ${variantMap[variant]} ${sizeMap[size]} ${className}`}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{label}</span>
    </span>
  );
};
