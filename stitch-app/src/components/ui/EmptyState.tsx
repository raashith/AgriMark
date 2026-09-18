import React from 'react';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 md:p-12 text-center bg-[#F6F4ED]/60 border border-dashed border-[#C8C5B8] rounded-2xl space-y-4">
      {icon && <div className="p-4 bg-white rounded-full text-[#1B4D3E] shadow-sm">{icon}</div>}
      <div className="max-w-md space-y-1">
        <h3 className="text-lg font-bold text-[#19201D]">{title}</h3>
        <p className="text-xs text-gray-500 leading-relaxed">{description}</p>
      </div>
      {action && <div className="pt-2">{action}</div>}
    </div>
  );
};
