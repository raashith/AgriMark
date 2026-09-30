'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Globe, MapPin } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { useI18n, SUPPORTED_LANGUAGES } from '@/lib/i18n';

interface AgriHeaderProps {
  title?: string;
  backHref?: string;
  showWeather?: boolean;
  locationLabel?: string;
  weatherLabel?: string;
}

export const AgriHeader: React.FC<AgriHeaderProps> = ({ title, backHref, showWeather=false, locationLabel, weatherLabel }) => {
  const router=useRouter();
  const { user }=useAuth();
  const { language,setLanguage }=useI18n();
  const currentLanguage=SUPPORTED_LANGUAGES.find((item)=>item.code===language);

  return (
    <header className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
      <div className="flex min-w-0 items-center gap-3">
        {backHref ? (
          <Link href={backHref} aria-label="Go back" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-[#0E1712] text-[#ADBDB2] transition hover:border-[#3E7B54] hover:text-[#F7F5EE]"><ArrowLeft className="h-5 w-5"/></Link>
        ) : (
          <button type="button" aria-label="Go back" onClick={()=>router.back()} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-[#0E1712] text-[#ADBDB2] transition hover:border-[#3E7B54] hover:text-[#F7F5EE]"><ArrowLeft className="h-5 w-5"/></button>
        )}
        <div className="min-w-0">
          {title && <h1 className="truncate text-xl font-bold tracking-tight text-[#F7F5EE] md:text-2xl">{title}</h1>}
          {locationLabel && <p className="mt-1 flex items-center gap-1.5 truncate text-xs text-[#ADBDB2]"><MapPin className="h-3.5 w-3.5 text-[#52A67A]"/>{locationLabel}</p>}
        </div>
      </div>
      <div className="flex items-center gap-2">
        {showWeather && weatherLabel && <div className="hidden max-w-[280px] truncate rounded-xl border border-white/10 bg-[#0E1712] px-3 py-2 text-xs font-mono text-sky-300 sm:block">{weatherLabel}</div>}
        <label className="sr-only" htmlFor="agrimark-header-language">Language</label>
        <div className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-[#0E1712] px-2.5 py-2">
          <Globe className="h-3.5 w-3.5 text-[#52A67A]"/>
          <select id="agrimark-header-language" value={language} onChange={(e)=>setLanguage(e.target.value as any)} className="bg-transparent text-xs font-semibold text-[#F7F5EE] outline-none">
            {SUPPORTED_LANGUAGES.map((item)=><option key={item.code} value={item.code} className="bg-[#0E1712] text-white">{item.nativeName||item.label}</option>)}
          </select>
        </div>
        {user && <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#3E7B54]/60 bg-[#1B4D3E]/35 text-xs font-bold text-[#F7F5EE]">{user.full_name?.[0]?.toUpperCase()||user.email?.[0]?.toUpperCase()||'U'}</div>}
      </div>
    </header>
  );
};

export default AgriHeader;
