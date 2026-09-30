import React from 'react';
import { LucideIcon, TrendingUp, TrendingDown, Minus } from 'lucide-react';

export interface TelemetryCardProps {
  label: string;
  value: string | number;
  unit?: string;
  change?: string;
  trend?: 'up' | 'down' | 'neutral';
  icon?: LucideIcon;
  subtext?: string;
  accentColor?: 'emerald' | 'amber' | 'gold' | 'red';
  className?: string;
}

export const TelemetryCard: React.FC<TelemetryCardProps> = ({
  label,
  value,
  unit,
  change,
  trend = 'neutral',
  icon: Icon,
  subtext,
  accentColor = 'emerald',
  className = '',
}) => {
  const accentBorderMap = {
    emerald: 'border-emerald-800/40 hover:border-emerald-500/60',
    amber: 'border-amber-800/40 hover:border-amber-500/60',
    gold: 'border-[#E5A93C]/40 hover:border-[#E5A93C]',
    red: 'border-rose-800/40 hover:border-rose-500/60',
  };

  const accentGlowMap = {
    emerald: 'bg-emerald-950/40 text-emerald-400',
    amber: 'bg-amber-950/40 text-amber-400',
    gold: 'bg-[#18241F] text-[#FCE196]',
    red: 'bg-rose-950/40 text-rose-400',
  };

  return (
    <div
      className={`p-4 bg-[#121A16] border ${accentBorderMap[accentColor]} rounded-xl shadow-lg transition-all duration-300 ${className}`}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] font-mono font-bold tracking-widest uppercase text-gray-400">
          {label}
        </span>
        {Icon && (
          <div className={`p-1.5 rounded-lg ${accentGlowMap[accentColor]}`}>
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>

      <div className="flex items-baseline gap-1.5 my-1">
        <span className="text-2xl font-bold font-mono tracking-tight text-[#F7F5EE]">
          {value}
        </span>
        {unit && (
          <span className="text-xs font-mono text-gray-400 font-medium">
            {unit}
          </span>
        )}
      </div>

      <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#1E2D26]">
        {change && (
          <span
            className={`inline-flex items-center gap-1 text-[11px] font-mono font-bold ${
              trend === 'up'
                ? 'text-emerald-400'
                : trend === 'down'
                ? 'text-rose-400'
                : 'text-gray-400'
            }`}
          >
            {trend === 'up' && <TrendingUp className="w-3 h-3" />}
            {trend === 'down' && <TrendingDown className="w-3 h-3" />}
            {trend === 'neutral' && <Minus className="w-3 h-3" />}
            <span>{change}</span>
          </span>
        )}
        {subtext && (
          <span className="text-[10px] font-sans text-gray-400 truncate">
            {subtext}
          </span>
        )}
      </div>
    </div>
  );
};
