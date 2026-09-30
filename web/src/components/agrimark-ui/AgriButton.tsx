'use client';

import React from 'react';

interface AgriButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'accent' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  children: React.ReactNode;
}

export const AgriButton: React.FC<AgriButtonProps> = ({ variant='primary', size='md', fullWidth=false, className='', children, ...props }) => {
  const base='inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl font-semibold transition active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-[#E5A93C] focus-visible:outline-offset-2';
  const variants={
    primary:'bg-[#1B4D3E] text-[#F7F5EE] hover:bg-[#2B6650] shadow-sm',
    secondary:'bg-[#F7F5EE] text-[#19201D] border border-[#E2DDD1] hover:bg-white',
    outline:'bg-transparent border border-[#E2DDD1] text-[#F7F5EE] hover:border-[#3E7B54] hover:bg-white/[0.04]',
    accent:'bg-[#E5A93C] text-[#19201D] hover:bg-[#F2BE5B] shadow-sm',
    danger:'bg-[#B91C1C] text-white hover:bg-[#991B1B] shadow-sm',
  };
  const sizes={sm:'px-3 py-2 text-xs',md:'px-5 py-3 text-sm',lg:'px-6 py-4 text-base font-bold'};
  return <button className={`${base} ${variants[variant]} ${sizes[size]} ${fullWidth?'w-full':''} ${className}`} {...props}>{children}</button>;
};
export default AgriButton;
