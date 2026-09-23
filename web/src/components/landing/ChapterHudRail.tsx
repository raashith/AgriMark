'use client';

import React, { useEffect, useState } from 'react';

const SCENES = [
  { id: 'scene-farm', title: '01 • THE LIVING FARM', label: '01' },
  { id: 'scene-field', title: '02 • FIELD INTELLIGENCE', label: '02' },
  { id: 'scene-market', title: '03 • MARKET INTELLIGENCE', label: '03' },
  { id: 'scene-traceability', title: '04 • TRACEABILITY JOURNEY', label: '04' },
  { id: 'scene-ai', title: '05 • AGRIAI COMMAND', label: '05' },
  { id: 'scene-network', title: '06 • AGRICULTURAL NETWORK', label: '06' },
  { id: 'scene-logistics', title: '07 • LOGISTICS DISPATCH', label: '07' },
  { id: 'scene-final', title: '08 • SMART TRADE FINAL', label: '08' },
];

export const ChapterHudRail: React.FC = () => {
  const [activeScene, setActiveScene] = useState<string>('scene-farm');
  const [activeIdx, setActiveIdx] = useState<number>(1);
  const [progressPercent, setProgressPercent] = useState<number>(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPos = window.scrollY + window.innerHeight * 0.4;
      const totalDocHeight = document.documentElement.scrollHeight - window.innerHeight;
      const pct = Math.min(100, Math.max(0, (window.scrollY / Math.max(1, totalDocHeight)) * 100));
      setProgressPercent(pct);

      let currentIdx = 1;
      let currentId = 'scene-farm';

      SCENES.forEach((scene, index) => {
        const el = document.getElementById(scene.id);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPos >= top && scrollPos < top + height) {
            currentIdx = index + 1;
            currentId = scene.id;
          }
        }
      });

      setActiveIdx(currentIdx);
      setActiveScene(currentId);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <aside className="fixed right-4 sm:right-6 top-1/2 -translate-y-1/2 z-50 hidden lg:flex flex-col items-end gap-3 pointer-events-none select-none">
      <div className="pointer-events-auto holo-glass rounded-2xl py-4 px-3 border border-white/10 shadow-2xl flex flex-col items-center gap-4">
        <div className="text-[9px] font-mono text-[#9BC7A2] tracking-widest uppercase border-b border-white/10 pb-2">
          SCENE
        </div>
        <div className="flex flex-col gap-3.5 relative">
          <div className="absolute left-1/2 -translate-x-1/2 top-2 bottom-2 w-px bg-white/10" />
          <div
            className="absolute left-1/2 -translate-x-1/2 top-2 w-px bg-[#E5A93C] transition-all duration-300"
            style={{ height: `${progressPercent}%` }}
          />
          {SCENES.map((scene) => {
            const isActive = activeScene === scene.id;
            return (
              <a
                key={scene.id}
                href={`#${scene.id}`}
                title={scene.title}
                className="chapter-dot group relative flex items-center justify-center"
              >
                <span
                  className={
                    isActive
                      ? 'w-2.5 h-2.5 rounded-full bg-[#E5A93C] ring-4 ring-[#E5A93C]/20 transition-all duration-200'
                      : 'w-2 h-2 rounded-full bg-white/30 hover:bg-[#E5A93C] transition-all duration-200'
                  }
                />
                <span className="absolute right-6 px-2.5 py-1 rounded-md bg-[#07110D] border border-[#E5A93C]/40 text-[10px] font-mono text-[#FCE196] whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
                  {scene.title}
                </span>
              </a>
            );
          })}
        </div>
        <div className="text-[9px] font-mono text-[#E5A93C] pt-2 border-t border-white/10">
          0{activeIdx}/08
        </div>
      </div>
    </aside>
  );
};
