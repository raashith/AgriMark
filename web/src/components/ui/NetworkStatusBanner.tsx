'use client';

import React, { useState, useEffect } from 'react';
import { WifiOff, RefreshCw, CheckCircle2 } from 'lucide-react';

export const NetworkStatusBanner: React.FC = () => {
  const [isOnline, setIsOnline] = useState(true);
  const [showRestored, setShowRestored] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    setIsOnline(navigator.onLine);

    const handleOnline = () => {
      setIsOnline(true);
      setShowRestored(true);
      setTimeout(() => setShowRestored(false), 4000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowRestored(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline && !showRestored) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 px-4 py-2 text-xs font-semibold text-center flex items-center justify-center gap-2 shadow-lg transition-all duration-300">
      {!isOnline ? (
        <div className="w-full bg-amber-950/95 border-b border-amber-800 text-amber-200 py-2 px-4 flex items-center justify-center gap-3">
          <WifiOff className="w-4 h-4 text-amber-400 shrink-0" />
          <span>Network connection lost. Form submissions are paused until connectivity is restored.</span>
          <button
            onClick={() => window.location.reload()}
            className="px-2.5 py-1 bg-amber-900 hover:bg-amber-800 text-amber-100 rounded-lg font-bold transition flex items-center gap-1 text-[11px]"
          >
            <RefreshCw className="w-3 h-3" /> Retry
          </button>
        </div>
      ) : (
        <div className="w-full bg-emerald-950/95 border-b border-emerald-800 text-emerald-200 py-2 px-4 flex items-center justify-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Network connection restored. Syncing active form state...</span>
        </div>
      )}
    </div>
  );
};
