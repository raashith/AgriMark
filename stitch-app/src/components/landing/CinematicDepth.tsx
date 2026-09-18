'use client';

import { useEffect, useRef } from 'react';

export function CinematicDepth() {
  const rootRef = useRef<HTMLDivElement>(null);
  const blobRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    const blob = blobRef.current;
    const ring = ringRef.current;
    if (!root || !blob || !ring) return;

    let raf = 0;
    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const finePointer = window.matchMedia('(pointer: fine)').matches;

    const onMove = (event: PointerEvent) => {
      if (reduceMotion || !finePointer) return;
      const x = event.clientX / window.innerWidth - 0.5;
      const y = event.clientY / window.innerHeight - 0.5;
      targetX = x;
      targetY = y;
    };

    const onScroll = () => {
      if (reduceMotion) return;
      const y = Math.min(window.scrollY, window.innerHeight * 1.4);
      ring.style.transform = `translate3d(${currentX * 18}px, ${y * -0.035 + currentY * 12}px, 0) rotateX(${currentY * -10}deg) rotateY(${currentX * 16}deg) rotateZ(${y * 0.018}deg)`;
      blob.style.transform = `translate3d(${currentX * -22}px, ${y * -0.018 + currentY * -14}px, 0) scale(1.02)`;
    };

    const animate = () => {
      currentX += (targetX - currentX) * 0.055;
      currentY += (targetY - currentY) * 0.055;

      root.style.setProperty('--depth-x', currentX.toFixed(4));
      root.style.setProperty('--depth-y', currentY.toFixed(4));

      if (!reduceMotion) onScroll();
      raf = requestAnimationFrame(animate);
    };

    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('scroll', onScroll, { passive: true });
    animate();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  return (
    <div
      ref={rootRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-[1] overflow-hidden"
      style={{ perspective: '1400px', transformStyle: 'preserve-3d' }}
    >
      <div
        ref={blobRef}
        className="absolute left-[7%] top-[8%] h-[28rem] w-[28rem] rounded-[42%_58%_64%_36%/40%_42%_58%_60%] bg-gradient-to-br from-amber-300/20 via-emerald-400/10 to-transparent blur-2xl"
        style={{
          transform: 'translate3d(0,0,0)',
          transition: 'filter 700ms ease',
          filter: 'saturate(125%)',
        }}
      />

      <div
        ref={ringRef}
        className="absolute right-[8%] top-[13%] h-[23rem] w-[23rem] rounded-full border border-amber-300/25"
        style={{
          transform: 'translate3d(0,0,0) rotateX(0deg) rotateY(0deg)',
          transformStyle: 'preserve-3d',
          boxShadow: '0 0 90px rgba(229,169,60,.12), inset 0 0 60px rgba(62,123,84,.10)',
        }}
      >
        <div className="absolute inset-[11%] rounded-full border border-emerald-300/15" />
        <div className="absolute left-1/2 top-[-1.5rem] h-3 w-3 -translate-x-1/2 rounded-full bg-amber-300/80 shadow-[0_0_28px_rgba(229,169,60,.8)]" />
        <div className="absolute bottom-[-1rem] left-[14%] h-2 w-2 rounded-full bg-emerald-300/80 shadow-[0_0_20px_rgba(110,231,183,.7)]" />
      </div>
    </div>
  );
}
