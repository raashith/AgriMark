'use client';

import React, { useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { SkipForward } from 'lucide-react';

export function AgriMarkIntro() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  const [fading, setFading] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const isDismissing = useRef(false);

  const handleDismiss = () => {
    if (isDismissing.current) return;
    isDismissing.current = true;
    setFading(true);
    setTimeout(() => {
      setVisible(false);
    }, 700);
  };

  useEffect(() => {
    // Only show intro on home landing page '/'
    if (pathname !== '/') return;

    // Check prefers-reduced-motion
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    // Check sessionStorage to play only once per browser session
    try {
      const shown = sessionStorage.getItem('agrimark_intro_shown');
      if (shown) return;
      sessionStorage.setItem('agrimark_intro_shown', 'true');
    } catch {
      // Fallback if sessionStorage is unavailable
    }

    setVisible(true);
  }, [pathname]);

  useEffect(() => {
    if (!visible) return;

    // Safety fallback timer (12 seconds) in case video fails to fire 'onEnded'
    const fallbackTimer = setTimeout(() => {
      handleDismiss();
    }, 12000);

    // Attempt video playback
    if (videoRef.current) {
      videoRef.current.play().catch(() => {
        // If autoplay fails, gracefully dismiss
        handleDismiss();
      });
    }

    return () => {
      clearTimeout(fallbackTimer);
    };
  }, [visible]);

  if (!visible) return null;

  return (
    <div
      aria-label="AgriMark Cinematic Intro"
      className={`fixed inset-0 z-[9999] bg-black flex items-center justify-center overflow-hidden transition-opacity duration-700 ease-in-out ${
        fading ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      <video
        ref={videoRef}
        src="/videos/Cinematic_second_logo_reve.mp4"
        autoPlay
        muted
        playsInline
        preload="auto"
        onEnded={handleDismiss}
        onError={handleDismiss}
        className="w-full h-full object-contain max-h-screen max-w-screen select-none"
      />

      <button
        type="button"
        onClick={handleDismiss}
        aria-label="Skip Intro Video"
        className="absolute bottom-6 right-6 z-[10000] bg-black/70 hover:bg-emerald-950/90 border border-emerald-800/60 hover:border-emerald-500 text-emerald-400 font-bold text-xs px-4 py-2.5 rounded-xl shadow-2xl backdrop-blur-md transition-all flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
      >
        <span>Skip Intro</span>
        <SkipForward className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
