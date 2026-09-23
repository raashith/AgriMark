'use client';

import React from 'react';
import Link from 'next/link';

export const LandingFooter: React.FC = () => {
  return (
    <footer className="py-12 bg-[#020805] border-t border-white/5 text-xs font-mono text-white/50 relative z-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 rounded-full overflow-hidden border border-[#E5A93C]/40">
            <img
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuASEMZC5bvtH8BurA9dR6FJxEnhTFQ03wQfEKM56bWKs118TiFwI9uaNutADm_O7zN2EgdUy2Jq0Owh2lBwSooLIyxhe7GK9SRzqPfWOFMp4dtgEGn13atAN5YmLD1Zc4hsqLD-6hPpeihXxFfTap669q493a4f5g-DbWXGfpmL7CGW_TUoWMMTpuWBKtXjapypqtWWxx-WPQ01XCZOUrtoe3YWwzOnN966dRcZXILbkJK_b5TgkUnKF8FoBgf6KjJoFA"
              alt="AgriMark"
              className="w-full h-full object-cover"
            />
          </div>
          <span className="font-display font-bold text-white text-sm tracking-tight">
            Agri<span className="text-[#E5A93C]">Mark</span>.ai
          </span>
          <span className="text-white/20">|</span>
          <span>The Connected Agricultural Operating Layer</span>
        </div>
        <div className="flex items-center gap-6">
          <Link href="/auth/login" className="hover:text-white transition-colors">
            Login
          </Link>
          <Link href="/auth/register" className="hover:text-white transition-colors">
            Start for Free
          </Link>
          <a href="#scene-farm" className="hover:text-[#E5A93C] transition-colors">
            Back to Top ↑
          </a>
        </div>
      </div>
    </footer>
  );
};
