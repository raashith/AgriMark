'use client';

import React from 'react';
import { useI18n } from '@/lib/i18n';
import { Sprout } from 'lucide-react';

export const Footer: React.FC = () => {
  const { t } = useI18n();

  return (
    <footer className="bg-[#0c1310] border-t border-[#1e2d26] py-8 px-4 mt-auto text-gray-400 text-sm">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left">
        <div className="flex items-center gap-2 font-bold text-emerald-400">
          <Sprout className="w-5 h-5" />
          <span>{t('appName')}</span>
        </div>
        <p className="text-xs text-gray-500">
          © {new Date().getFullYear()} AgriMark. {t('tagline')}. Direct Farm-to-Buyer Marketplace.
        </p>
        <div className="flex gap-4 text-xs font-medium text-gray-400">
          <span>Supported Languages: English / தமிழ்</span>
        </div>
      </div>
    </footer>
  );
};
