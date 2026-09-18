import React from 'react';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  change?: string;
  isPositive?: boolean;
  icon?: React.ReactNode;
  badge?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtitle,
  change,
  isPositive = true,
  icon,
  badge,
}) => {
  return (
    <div className="bg-white border border-[#E7E5DC] p-5 rounded-2xl shadow-sm hover:border-[#1B4D3E]/40 transition space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{title}</span>
        {icon && <div className="p-2 bg-[#F6F4ED] text-[#1B4D3E] rounded-xl">{icon}</div>}
      </div>

      <div className="flex items-baseline justify-between gap-2">
        <h3 className="text-2xl md:text-3xl font-extrabold text-[#19201D] tracking-tight">{value}</h3>
        {change && (
          <span className={`text-xs font-bold font-mono px-2 py-0.5 rounded-full ${isPositive ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
            {isPositive ? '▲' : '▼'} {change}
          </span>
        )}
      </div>

      {(subtitle || badge) && (
        <div className="flex items-center justify-between text-xs text-gray-500 pt-1 border-t border-[#F6F4ED]">
          {subtitle && <span>{subtitle}</span>}
          {badge && <span className="font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">{badge}</span>}
        </div>
      )}
    </div>
  );
};
