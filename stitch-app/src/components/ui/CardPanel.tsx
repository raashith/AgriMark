import React from 'react';

interface CardPanelProps {
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export const CardPanel: React.FC<CardPanelProps> = ({
  title,
  subtitle,
  action,
  children,
  className = '',
}) => {
  return (
    <div className={`bg-white border border-[#E7E5DC] rounded-2xl p-5 md:p-6 shadow-sm ${className}`}>
      {(title || action) && (
        <div className="flex items-center justify-between gap-4 mb-4 pb-3 border-b border-[#F6F4ED]">
          <div>
            {title && <h2 className="text-lg font-bold text-[#19201D] tracking-tight">{title}</h2>}
            {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      {children}
    </div>
  );
};
