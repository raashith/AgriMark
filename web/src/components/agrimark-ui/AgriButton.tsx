'use client';

import React from 'react';

interface AgriButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'accent' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  children: React.ReactNode;
}

export const AgriButton: React.FC<AgriButtonProps> = ({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  className = '',
  children,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-semibold rounded-xl transition active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none min-h-[48px]';

  const variants = {
    primary: 'bg-[#1B4D3E] text-white hover:bg-[#143B30] shadow-sm',
    secondary: 'bg-[#F6F4ED] text-[#1B4D3E] border border-[#E7E5DC] hover:bg-white',
    outline: 'border border-[#E7E5DC] text-[#1C1917] hover:bg-[#F6F4ED]',
    accent: 'bg-[#D97706] text-white hover:bg-amber-700 shadow-sm',
    danger: 'bg-red-600 text-white hover:bg-red-700 shadow-sm',
  };

  const sizes = {
    sm: 'px-3 py-2 text-xs',
    md: 'px-5 py-3 text-sm',
    lg: 'px-6 py-4 text-base font-bold',
  };

  const widthStyle = fullWidth ? 'w-full' : '';

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${widthStyle} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default AgriButton;
