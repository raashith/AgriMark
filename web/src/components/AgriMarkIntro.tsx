'use client';

import React, { useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

export function AgriMarkIntro() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  const [fading, setFading] = useState(false);
  const [needsPlay, setNeedsPlay] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const isDismissing = useRef(false);

  const handleDismiss = () => {
    if (isDismissing.current) return;
    isDismissing.current = true;
    setFading(true);
    window.setTimeout(() => setVisible(false), 650);
  };

  const tryPlay = () => {
    const video = videoRef.current;
    if (!video) return;
    video.play()
      .then(() => setNeedsPlay(false))
      .catch(() => setNeedsPlay(true));
  };

  useEffect(() => {
    if (pathname !== '/') return;
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    try {
      if (sessionStorage.getItem('agrimark_intro_shown')) return;
      sessionStorage.setItem('agrimark_intro_shown', 'true');
    } catch {
      // Continue without session persistence.
    }

    setVisible(true);
    setFading(false);
    isDismissing.current = false;
  }, [pathname]);

  useEffect(() => {
    if (!visible) return;

    const fallbackTimer = window.setTimeout(handleDismiss, 15000);
    const readyTimer = window.setTimeout(tryPlay, 50);

    return () => {
      window.clearTimeout(fallbackTimer);
      window.clearTimeout(readyTimer);
    };
  }, [visible]);

  if (!visible) return null;

  return (
    <div
      aria-label="AgriMark Cinematic Intro"
      className={`fixed inset-0 z-[9999] bg-black w-screen h-screen overflow-hidden flex items-center justify-center transition-all duration-700 ease-in-out select-none ${
        fading ? 'opacity-0 scale-105 pointer-events-none' : 'opacity-100 scale-100'
      }`}
    >
      <video
        ref={videoRef}
        src="/videos/make_it_as_second_video.mp4"
        autoPlay
        muted
        playsInline
        preload="auto"
        onLoadedData={tryPlay}
        onCanPlay={tryPlay}
        onEnded={handleDismiss}
        onError={handleDismiss}
        className="w-full h-full object-cover max-w-none max-h-none"
      />

      {needsPlay && (
        <button
          type="button"
          onClick={tryPlay}
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/95 px-7 py-3 text-sm font-semibold text-black shadow-2xl backdrop-blur"
          aria-label="Play AgriMark intro"
        >
          Play Intro
        </button>
      )}

      <button
        type="button"
        onClick={handleDismiss}
        className="absolute bottom-6 right-6 rounded-full bg-black/45 px-4 py-2 text-xs font-medium text-white/90 backdrop-blur-md border border-white/20 hover:bg-black/65 transition"
        aria-label="Skip AgriMark intro"
      >
        Skip Intro
      </button>
    </div>
  );
}
