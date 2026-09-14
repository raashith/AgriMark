'use client';

import React, { useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

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
    }, 1000); // 1000ms smooth fade/scale transition
  };

  useEffect(() => {
    // Only show intro on root landing entry '/'
    if (pathname !== '/') return;

    // Check prefers-reduced-motion
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    // Check sessionStorage to prevent repeated intro during internal navigation in same tab session
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

    // Safety fallback timer (10 seconds) in case video playback fails or stalls
    const fallbackTimer = setTimeout(() => {
      handleDismiss();
    }, 10000);

    // Attempt video playback
    if (videoRef.current) {
      videoRef.current.play().catch(() => {
        // If autoplay fails, gracefully transition
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
      className={`fixed inset-0 z-[9999] bg-black w-screen h-screen overflow-hidden flex items-center justify-center transition-all duration-1000 ease-in-out select-none ${
        fading ? 'opacity-0 scale-105 pointer-events-none' : 'opacity-100 scale-100'
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
        className="w-full h-full object-cover max-w-none max-h-none pointer-events-none"
      />
    </div>
  );
}
