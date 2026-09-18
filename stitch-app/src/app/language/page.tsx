'use client';

import React from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { CardPanel } from '@/components/ui/CardPanel';
import { useI18n, SUPPORTED_LANGUAGES, LanguageCode } from '@/lib/i18n';
import { Globe, Check } from 'lucide-react';

export default function LanguageSelectPage() {
  const { language, setLanguage } = useI18n();

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <PageHeader
        title="Language Selection"
        subtitle="Choose your preferred vernacular language for UI, voice guidance, and market advisories."
      />

      <CardPanel>
        <div className="space-y-3">
          {SUPPORTED_LANGUAGES.map((lang) => {
            const isSelected = language === lang.code;
            return (
              <div
                key={lang.code}
                onClick={() => setLanguage(lang.code)}
                className={`p-4 rounded-xl border flex items-center justify-between cursor-pointer transition ${
                  isSelected
                    ? 'bg-[#1B4D3E] text-white border-[#1B4D3E] shadow-sm'
                    : 'bg-[#F6F4ED] text-[#19201D] border-[#E7E5DC] hover:border-gray-400'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{lang.flag}</span>
                  <div>
                    <h4 className="font-bold text-sm">{lang.nativeName}</h4>
                    <p className={`text-xs ${isSelected ? 'text-amber-200' : 'text-gray-500'}`}>{lang.name}</p>
                  </div>
                </div>

                {isSelected && (
                  <div className="p-1 bg-amber-400 text-[#1B4D3E] rounded-full">
                    <Check className="w-4 h-4 font-bold" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </CardPanel>
    </div>
  );
}
