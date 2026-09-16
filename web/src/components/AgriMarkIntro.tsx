'use client';

import React, { useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

export function AgriMarkIntro() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  const [fadeToApp, setFadeToApp] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const isDismissing = useRef(false);

  const handleIntroComplete = () => {
    if (isDismissing.current) return;
    isDismissing.current = true;

    if (videoRef.current) {
      try {
        videoRef.current.pause();
      } catch {}
    }

    setFadeToApp(true);
    setTimeout(() => {
      setVisible(false);
    }, 1000); // 1000ms smooth fade-out transition to application
  };

  useEffect(() => {
    // Only show intro on root landing entry '/' or login route '/auth/login'
    const allowedRoutes = ['/', '/auth/login'];
    if (!allowedRoutes.includes(pathname)) return;

    // Respect prefers-reduced-motion setting
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

  // Handle autoplay and safety fallback timer
  useEffect(() => {
    if (!visible) return;

    if (videoRef.current) {
      videoRef.current.muted = true;
      videoRef.current.play().catch(() => {
        // If autoplay is rejected by browser policy, gracefully fade into the application
        handleIntroComplete();
      });
    }

    // Safety fallback: if video stalls or hangs, finish intro automatically after 18 seconds
    const safetyTimer = setTimeout(() => {
      handleIntroComplete();
    }, 18000);

    return () => {
      clearTimeout(safetyTimer);
    };
  }, [visible]);

  if (!visible) return null;

  return (
    <div
      aria-label="AgriMark Cinematic Intro Experience"
      className={`fixed inset-0 z-[99999] bg-black w-screen h-screen overflow-hidden flex items-center justify-center transition-opacity duration-1000 ease-in-out select-none pointer-events-none ${
        fadeToApp ? 'opacity-0' : 'opacity-100'
      }`}
    >
      <video
        ref={videoRef}
        src="/videos/make_it_as_second_video.mp4"
        autoPlay
        muted
        playsInline
        preload="auto"
        controls={false}
        onEnded={handleIntroComplete}
        onError={handleIntroComplete}
        className="w-full h-full object-cover max-w-none max-h-none border-none outline-none bg-black"
      />
    </div>
  );
}
