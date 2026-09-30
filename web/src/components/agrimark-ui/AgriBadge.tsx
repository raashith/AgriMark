'use client';

import React from 'react';

interface AgriBadgeProps { children: React.ReactNode; variant?: 'emerald'|'amber'|'blue'|'purple'|'red'|'gray'; size?: 'sm'|'md'; className?: string; }

export const AgriBadge: React.FC<AgriBadgeProps>=({children,variant='emerald',size='sm',className=''})=>{
 const variants={
   emerald:'bg-[#1B4D3E]/35 border-[#3E7B54]/60 text-[#9BC7A2]',
   amber:'bg-[#E5A93C]/10 border-[#E5A93C]/50 text-[#FCE196]',
   blue:'bg-sky-950/30 border-sky-800/60 text-sky-300',
   purple:'bg-violet-950/30 border-violet-800/60 text-violet-300',
   red:'bg-red-950/30 border-red-800/60 text-red-300',
   gray:'bg-white/[0.04] border-white/10 text-[#ADBDB2]',
 };
 return <span className={`inline-flex items-center gap-1 rounded-full border font-mono font-bold tracking-wide ${size==='sm'?'px-2.5 py-0.5 text-[10px]':'px-3 py-1 text-xs'} ${variants[variant]} ${className}`}>{children}</span>;
};
export default AgriBadge;
