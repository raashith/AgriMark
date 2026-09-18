'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Play, ChevronDown, Sprout, ShieldCheck, Sparkles, X } from 'lucide-react';
import { HeroSelector } from './HeroSelector';

export const CinematicHero: React.FC = () => {
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  return (
    <section id="hero" className="relative min-h-screen w-full flex flex-col justify-between pt-28 pb-12 overflow-hidden bg-[#0a0f0d]">
      {/* Video Background with Atmospheric Overlay */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <video
          ref={videoRef}
          autoPlay
          muted
          loop
          playsInline
          poster="/images/landing/farmer_hero.png"
          className="w-full h-full object-cover scale-105 filter brightness-[0.45] contrast-[1.1] transition-transform duration-1000"
        >
          <source src="/videos/make_it_as_second_video.mp4" type="video/mp4" />
        </video>

        {/* Cinematic Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0f0d] via-[#0a0f0d]/60 to-[#0a0f0d]/70" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent via-[#0a0f0d]/40 to-[#0a0f0d]" />
      </div>

      {/* Left Cut-out Visual (Parallax & Depth) */}
      <div className="hidden lg:block absolute -left-20 top-1/3 z-10 w-72 h-96 rounded-3xl overflow-hidden border border-emerald-500/20 shadow-[0_0_50px_rgba(0,0,0,0.8)] transform -rotate-6 hover:rotate-0 hover:scale-105 transition-all duration-500 pointer-events-auto group">
        <Image
          src="/images/landing/farmer_hero.png"
          alt="Indian Farmer Agriculture"
          fill
          className="object-cover filter brightness-90 group-hover:brightness-100 transition-all duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0f0d] via-transparent to-transparent opacity-90" />
        <div className="absolute bottom-4 left-4 right-4 p-3 bg-[#121a16]/90 border border-[#1e2d26] rounded-2xl backdrop-blur-md">
          <span className="text-[10px] font-mono font-bold text-emerald-400 block uppercase">Field Intelligence</span>
          <span className="text-xs font-bold text-white block">Soil & Crop Health Tracking</span>
        </div>
      </div>

      {/* Right Cut-out Visual (Parallax & Depth) */}
      <div className="hidden lg:block absolute -right-20 top-1/3 z-10 w-72 h-96 rounded-3xl overflow-hidden border border-emerald-500/20 shadow-[0_0_50px_rgba(0,0,0,0.8)] transform rotate-6 hover:rotate-0 hover:scale-105 transition-all duration-500 pointer-events-auto group">
        <Image
          src="/images/landing/market_hero.png"
          alt="Agricultural Produce Marketplace"
          fill
          className="object-cover filter brightness-90 group-hover:brightness-100 transition-all duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0f0d] via-transparent to-transparent opacity-90" />
        <div className="absolute bottom-4 left-4 right-4 p-3 bg-[#121a16]/90 border border-[#1e2d26] rounded-2xl backdrop-blur-md">
          <span className="text-[10px] font-mono font-bold text-amber-400 block uppercase">Mandi Ticker</span>
          <span className="text-xs font-bold text-white block">Direct Buyer Lot Bidding</span>
        </div>
      </div>

      {/* Main Center Content Container */}
      <div className="relative z-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8 my-auto">
        {/* Eyebrow Pill */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#121a16]/90 border border-emerald-500/40 rounded-full text-xs font-mono font-bold text-emerald-300 shadow-xl backdrop-blur-md animate-fade-in">
          <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
          <span>AGRICULTURE • AI • MARKET</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
        </div>

        {/* Main Headline */}
        <div className="space-y-2">
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-white leading-none">
            GROW SMARTER. <br />
            <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-amber-300 bg-clip-text text-transparent">
              SELL BETTER.
            </span>
          </h1>
        </div>

        {/* Supporting Copy */}
        <p className="max-w-2xl mx-auto text-sm sm:text-base md:text-lg text-gray-300 font-normal leading-relaxed">
          AgriMark connects farmers, buyers, markets and logistics in one intelligent agricultural ecosystem — helping every harvest move from field to opportunity.
        </p>

        {/* CTA Button Group */}
        <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
          <Link
            href="/auth/register"
            className="px-8 py-4 bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-extrabold rounded-full text-sm shadow-[0_0_30px_rgba(16,185,129,0.3)] flex items-center gap-3 transition-all duration-300 hover:scale-105 active:scale-95 border border-emerald-300/30"
          >
            <span>EXPLORE AGRIMARK</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <Link
            href="/farmer/dashboard"
            className="px-7 py-4 bg-[#121a16]/90 border border-[#1e2d26] hover:border-emerald-600 text-gray-200 hover:text-white font-extrabold rounded-full text-sm backdrop-blur-md transition-all duration-300 hover:scale-105 active:scale-95"
          >
            FOR FARMERS
          </Link>

          <button
            onClick={() => setIsVideoModalOpen(true)}
            className="px-5 py-4 text-xs font-bold text-gray-300 hover:text-emerald-300 flex items-center gap-2 transition-colors group"
          >
            <div className="p-2 bg-emerald-950/80 border border-emerald-700/60 rounded-full group-hover:scale-110 transition-transform">
              <Play className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400" />
            </div>
            <span>WATCH HOW IT WORKS</span>
          </button>
        </div>

        {/* Interactive Ecosystem Selector */}
        <div className="pt-6 max-w-3xl mx-auto">
          <HeroSelector />
        </div>
      </div>

      {/* Bottom Scroll Indicator */}
      <div className="relative z-20 flex flex-col items-center gap-2 pt-6">
        <a
          href="#why-agrimark"
          className="flex flex-col items-center gap-1.5 text-gray-400 hover:text-emerald-400 transition-colors group"
          aria-label="Scroll to Why AgriMark section"
        >
          <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-emerald-500/80">Scroll to Explore</span>
          <div className="p-2 bg-[#121a16]/80 border border-[#1e2d26] rounded-full group-hover:border-emerald-600 transition-colors animate-bounce">
            <ChevronDown className="w-4 h-4 text-emerald-400" />
          </div>
        </a>
      </div>

      {/* Video Modal Popup */}
      {isVideoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
          <div className="relative bg-[#121a16] border border-[#1e2d26] rounded-3xl max-w-3xl w-full p-4 shadow-2xl space-y-3">
            <div className="flex justify-between items-center px-2">
              <span className="text-xs font-bold text-white flex items-center gap-2">
                <Sprout className="w-4 h-4 text-emerald-400" /> AgriMark Agricultural Ecosystem
              </span>
              <button
                onClick={() => setIsVideoModalOpen(false)}
                className="p-1.5 text-gray-400 hover:text-white rounded-xl bg-[#0a0f0d] border border-[#1e2d26]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="relative aspect-video rounded-2xl overflow-hidden border border-[#1e2d26]">
              <video controls autoPlay className="w-full h-full object-cover">
                <source src="/videos/make_it_as_second_video.mp4" type="video/mp4" />
              </video>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
