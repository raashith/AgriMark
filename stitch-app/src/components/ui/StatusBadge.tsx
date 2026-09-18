import React from 'react';

export type StatusVariant =
  | 'active'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'pending'
  | 'in_transit'
  | 'completed';

interface StatusBadgeProps {
  status: string;
  variant?: StatusVariant;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, variant }) => {
  const getColors = (): string => {
    const key = (variant || status || '').toLowerCase();
    if (key.includes('active') || key.includes('growing') || key.includes('confirmed') || key.includes('success') || key.includes('completed')) {
      return 'bg-emerald-100 text-[#1B4D3E] border-emerald-300';
    }
    if (key.includes('transit') || key.includes('in_progress') || key.includes('pending') || key.includes('info')) {
      return 'bg-amber-100 text-amber-900 border-amber-300';
    }
    if (key.includes('danger') || key.includes('critical') || key.includes('disputed') || key.includes('rejected')) {
      return 'bg-red-100 text-red-800 border-red-300';
    }
    return 'bg-gray-100 text-gray-800 border-gray-300';
  };

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${getColors()}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
      <span className="capitalize">{status.replace(/_/g, ' ')}</span>
    </span>
  );
};
