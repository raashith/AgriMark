'use client';

import React from 'react';
import { LucideIcon, Sprout } from 'lucide-react';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon = Sprout,
  title,
  description,
  actionLabel,
  onAction,
}) => {
  return (
    <div className="p-10 text-center bg-[#121a16] border border-[#1e2d26] rounded-3xl space-y-4 shadow-lg flex flex-col items-center justify-center">
      <div className="p-4 bg-emerald-950/60 border border-emerald-800/40 rounded-2xl text-emerald-400">
        <Icon className="w-8 h-8" />
      </div>
      <div className="space-y-1 max-w-sm">
        <h3 className="text-base font-bold text-white">{title}</h3>
        <p className="text-xs text-gray-400 leading-relaxed">{description}</p>
      </div>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md transition"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};
