'use client';

import React from 'react';
import { ShieldCheck, Clock, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';

interface StatusBadgeProps {
  status: string;
  type?: 'role' | 'order' | 'verification' | 'listing' | 'priority';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, type = 'verification' }) => {
  const normalized = (status || '').toLowerCase();

  let colorClasses = 'bg-emerald-950/80 border-emerald-800/80 text-emerald-300';
  let Icon = ShieldCheck;

  if (normalized.includes('pending') || normalized.includes('requested') || normalized.includes('unverified')) {
    colorClasses = 'bg-amber-950/80 border-amber-800/80 text-amber-300';
    Icon = Clock;
  } else if (normalized.includes('delivered') || normalized.includes('verified') || normalized.includes('active') || normalized.includes('confirmed')) {
    colorClasses = 'bg-emerald-950/80 border-emerald-800/80 text-emerald-300';
    Icon = CheckCircle2;
  } else if (normalized.includes('cancelled') || normalized.includes('failed') || normalized.includes('rejected')) {
    colorClasses = 'bg-rose-950/80 border-rose-800/80 text-rose-300';
    Icon = XCircle;
  } else if (normalized.includes('urgent') || normalized.includes('high')) {
    colorClasses = 'bg-purple-950/80 border-purple-800/80 text-purple-300';
    Icon = AlertTriangle;
  }

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 border text-[10px] font-mono font-bold uppercase rounded-full backdrop-blur-md ${colorClasses}`}>
      <Icon className="w-3 h-3" />
      <span>{status}</span>
    </span>
  );
};
