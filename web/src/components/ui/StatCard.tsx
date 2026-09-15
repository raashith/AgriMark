'use client';

import React from 'react';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: LucideIcon;
  trend?: {
    value: string;
    isUpward: boolean;
  };
  variant?: 'default' | 'emerald' | 'amber' | 'purple' | 'rose';
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  variant = 'default',
}) => {
  const variantStyles = {
    default: 'border-[#1e2d26] bg-[#121a16] text-white',
    emerald: 'border-emerald-800/60 bg-emerald-950/40 text-emerald-300',
    amber: 'border-amber-800/60 bg-amber-950/40 text-amber-300',
    purple: 'border-purple-800/60 bg-purple-950/40 text-purple-300',
    rose: 'border-rose-800/60 bg-rose-950/40 text-rose-300',
  };

  const iconStyles = {
    default: 'bg-emerald-950/80 text-emerald-400 border-emerald-800/60',
    emerald: 'bg-emerald-900/60 text-emerald-300 border-emerald-700/60',
    amber: 'bg-amber-900/60 text-amber-300 border-amber-700/60',
    purple: 'bg-purple-900/60 text-purple-300 border-purple-700/60',
    rose: 'bg-rose-900/60 text-rose-300 border-rose-700/60',
  };

  return (
    <div className={`p-5 rounded-3xl border shadow-lg flex flex-col justify-between transition hover:border-emerald-700/60 group ${variantStyles[variant]}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-gray-400">{title}</span>
          <h3 className="text-2xl font-black mt-1 text-white tracking-tight">{value}</h3>
        </div>

        {Icon && (
          <div className={`p-2.5 rounded-2xl border ${iconStyles[variant]} group-hover:scale-105 transition`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      {(subtitle || trend) && (
        <div className="mt-3 pt-2 border-t border-white/5 flex items-center justify-between text-[11px] font-mono">
          {subtitle && <span className="text-gray-400">{subtitle}</span>}
          {trend && (
            <span className={`inline-flex items-center gap-1 font-bold ${trend.isUpward ? 'text-emerald-400' : 'text-rose-400'}`}>
              {trend.isUpward ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
              {trend.value}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
