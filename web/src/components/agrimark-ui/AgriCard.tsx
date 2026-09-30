'use client';

import React from 'react';

interface AgriCardProps { children: React.ReactNode; variant?: 'default'|'highlight'|'alert'|'dark'; className?: string; onClick?:()=>void; }

export const AgriCard: React.FC<AgriCardProps>=({children,variant='default',className='',onClick})=>{
  const base='rounded-[20px] border p-5 md:p-6 transition-all';
  const variants={
    default:'bg-[#0E1712] border-white/10 text-[#F7F5EE]',
    highlight:'bg-[#0E1712] border-[#3E7B54]/60 text-[#F7F5EE] ring-1 ring-[#3E7B54]/20',
    alert:'bg-[#0E1712] border-[#E5A93C]/60 text-[#F7F5EE] ring-1 ring-[#E5A93C]/15',
    dark:'bg-[#0C120F] border-[#24382E] text-[#F7F5EE]',
  };
  return <div onClick={onClick} className={`${base} ${variants[variant]} ${onClick?'cursor-pointer hover:border-[#3E7B54]':''} ${className}`}>{children}</div>;
};
export default AgriCard;
