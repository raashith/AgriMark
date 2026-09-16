'use client';

import React, { useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { Volume2, VolumeX, SkipForward } from 'lucide-react';

export function AgriMarkIntro() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  const [stage, setStage] = useState<'logo' | 'video'>('logo');
  const [fadeStage1, setFadeStage1] = useState(false);
  const [fadeToApp, setFadeToApp] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [showAudioToggle, setShowAudioToggle] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const isDismissing = useRef(false);

  const finishIntro = () => {
    if (isDismissing.current) return;
    isDismissing.current = true;

    // Immediately stop video playback audio
    if (videoRef.current) {
      try {
        videoRef.current.pause();
      } catch {}
    }

    setFadeToApp(true);
    setTimeout(() => {
      setVisible(false);
    }, 1000); // 1000ms smooth scale/fade transition to app
  };

  useEffect(() => {
    // Only show intro on root landing entry '/' or login route '/auth/login'
    const allowedRoutes = ['/', '/auth/login'];
    if (!allowedRoutes.includes(pathname)) return;

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

  // Stage 1 -> Stage 2 Timer (Lotus logo reveal plays for 2.8 seconds)
  useEffect(() => {
    if (!visible) return;

    const logoTimer = setTimeout(() => {
      setFadeStage1(true);
      setTimeout(() => {
        setStage('video');
      }, 700); // Crossfade transition between Stage 1 and Stage 2
    }, 2800);

    // Global safety timer in case video stalls or hangs
    const safetyTimer = setTimeout(() => {
      finishIntro();
    }, 16000);

    return () => {
      clearTimeout(logoTimer);
      clearTimeout(safetyTimer);
    };
  }, [visible]);

  // Stage 2: Attempt video playback with intelligent audio autoplay fallback
  useEffect(() => {
    if (stage !== 'video' || !videoRef.current) return;

    const playVideo = async () => {
      try {
        videoRef.current!.muted = false;
        await videoRef.current!.play();
        setIsMuted(false);
        setShowAudioToggle(true);
      } catch {
        // If unmuted autoplay is blocked by browser policy, fallback to muted autoplay
        try {
          if (videoRef.current) {
            videoRef.current.muted = true;
            await videoRef.current.play();
            setIsMuted(true);
            setShowAudioToggle(true);
          }
        } catch {
          // If video still fails, gracefully finish intro
          finishIntro();
        }
      }
    };

    void playVideo();
  }, [stage]);

  const toggleMute = () => {
    if (!videoRef.current) return;
    const nextMuted = !isMuted;
    videoRef.current.muted = nextMuted;
    setIsMuted(nextMuted);
  };

  if (!visible) return null;

  return (
    <div
      aria-label="AgriMark Cinematic Intro Experience"
      className={`fixed inset-0 z-[99999] bg-[#060a08] w-screen h-screen overflow-hidden flex items-center justify-center transition-all duration-1000 ease-in-out select-none ${
        fadeToApp ? 'opacity-0 scale-105 pointer-events-none' : 'opacity-100 scale-100'
      }`}
    >
      {/* STAGE 1: CINEMATIC AGRIMARK LOTUS LOGO REVEAL */}
      <div
        className={`absolute inset-0 flex flex-col items-center justify-center transition-opacity duration-700 ease-in-out ${
          stage === 'logo' && !fadeStage1 ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'
        }`}
      >
        {/* Subtle Radial Glow */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-emerald-900/30 via-[#060a08]/80 to-[#060a08] pointer-events-none" />

        {/* Animated Lotus Logo Icon */}
        <div className="relative z-10 flex flex-col items-center space-y-6">
          <div className="relative w-32 h-32 md:w-40 md:h-40 flex items-center justify-center">
            {/* Outer Pulsing Emerald Ring */}
            <div className="absolute inset-0 rounded-full border border-emerald-500/30 animate-ping opacity-25" />
            <div className="absolute inset-2 rounded-full border border-emerald-400/40 animate-pulse" />

            {/* Glowing Lotus SVG */}
            <svg
              viewBox="0 0 100 100"
              className="w-24 h-24 md:w-32 md:h-32 text-emerald-400 filter drop-shadow-[0_0_20px_rgba(16,185,129,0.6)] animate-[bounce_3s_infinite_ease-in-out]"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              {/* Outer Petals */}
              <path
                d="M50 15 C35 35, 15 50, 20 70 C30 85, 50 80, 50 80 C50 80, 70 85, 80 70 C85 50, 65 35, 50 15 Z"
                className="fill-emerald-950/80 stroke-emerald-400"
              />
              {/* Inner Petals */}
              <path
                d="M50 25 C40 40, 25 55, 32 72 C40 80, 50 75, 50 75 C50 75, 60 80, 68 72 C75 55, 60 40, 50 25 Z"
                className="fill-emerald-800/60 stroke-emerald-300"
              />
              {/* Golden Center Lotus Pistil */}
              <path
                d="M50 35 C45 45, 38 55, 42 68 C46 72, 50 70, 50 70 C50 70, 54 72, 58 68 C62 55, 55 45, 50 35 Z"
                className="fill-amber-400/90 stroke-amber-300"
              />
              <circle cx="50" cy="48" r="4" className="fill-amber-300 animate-pulse" />
            </svg>
          </div>

          {/* Typography Reveal */}
          <div className="text-center space-y-2 z-10">
            <h1 className="text-3xl md:text-5xl font-extrabold tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-emerald-300 via-teal-200 to-amber-300 uppercase">
              AgriMark
            </h1>
            <p className="text-xs md:text-sm font-mono tracking-widest text-emerald-400/90 uppercase">
              National Agricultural Digital OS
            </p>
          </div>
        </div>
      </div>

      {/* STAGE 2: SECOND INTRO VIDEO */}
      <div
        className={`absolute inset-0 w-full h-full transition-opacity duration-800 ease-in-out ${
          stage === 'video' ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        <video
          ref={videoRef}
          src="/videos/make_it_as_second_video.mp4"
          playsInline
          preload="auto"
          onEnded={finishIntro}
          onError={finishIntro}
          className="w-full h-full object-cover max-w-none max-h-none"
        />
      </div>

      {/* CONTROLS OVERLAY: SKIP INTRO & AUDIO MUTE TOGGLE */}
      <div className="fixed bottom-6 right-6 z-[100000] flex items-center gap-3">
        {/* Audio Mute/Unmute Toggle */}
        {showAudioToggle && stage === 'video' && (
          <button
            type="button"
            onClick={toggleMute}
            aria-label={isMuted ? 'Unmute Audio' : 'Mute Audio'}
            className="p-2.5 bg-black/70 hover:bg-emerald-950/90 border border-emerald-800/60 rounded-full text-emerald-400 shadow-xl backdrop-blur-md transition flex items-center justify-center text-xs font-semibold gap-1.5"
          >
            {isMuted ? (
              <>
                <VolumeX className="w-4 h-4 text-amber-400" />
                <span className="hidden sm:inline text-[11px] text-amber-300">Unmute</span>
              </>
            ) : (
              <>
                <Volume2 className="w-4 h-4 text-emerald-400" />
                <span className="hidden sm:inline text-[11px] text-emerald-300">Audio On</span>
              </>
            )}
          </button>
        )}

        {/* Skip Intro Button */}
        <button
          type="button"
          onClick={finishIntro}
          className="px-4 py-2.5 bg-black/70 hover:bg-emerald-950/90 border border-emerald-800/60 rounded-full text-gray-200 hover:text-white text-xs font-bold shadow-xl backdrop-blur-md transition flex items-center gap-2 group"
        >
          <span>Skip Intro</span>
          <SkipForward className="w-3.5 h-3.5 text-emerald-400 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>
    </div>
  );
}
