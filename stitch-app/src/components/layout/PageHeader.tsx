import React from 'react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  badge?: string;
  action?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  badge,
  action,
}) => {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-4 border-b border-[#E7E5DC]">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#19201D] tracking-tight">{title}</h1>
          {badge && (
            <span className="text-xs font-mono font-bold bg-[#1B4D3E] text-amber-300 px-2.5 py-0.5 rounded-full">
              {badge}
            </span>
          )}
        </div>
        {subtitle && <p className="text-xs md:text-sm text-gray-600 leading-relaxed">{subtitle}</p>}
      </div>
      {action && <div className="flex items-center gap-2">{action}</div>}
    </div>
  );
};
