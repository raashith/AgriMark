'use client';

import React from 'react';
import { Bot, Sparkles, TrendingUp, ShieldCheck, Clock } from 'lucide-react';

interface AIInsightCardProps {
  title: string;
  recommendation: string;
  confidenceScore: number; // e.g. 0.92
  freshnessTimestamp?: string;
  sourceReference?: string;
}

export const AIInsightCard: React.FC<AIInsightCardProps> = ({
  title,
  recommendation,
  confidenceScore,
  freshnessTimestamp = 'Updated 10m ago',
  sourceReference = 'AGMARKNET & MLOps Price Engine',
}) => {
  const scorePct = Math.round(confidenceScore * 100);

  return (
    <div className="p-5 bg-[#121a16] border border-purple-900/50 rounded-3xl space-y-3 shadow-xl relative overflow-hidden">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-purple-950/80 border border-purple-800/60 rounded-xl text-purple-400">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-extrabold text-sm text-white">{title}</h4>
            <span className="text-[10px] text-purple-400 font-mono">AgriMark AI Decision Signal</span>
          </div>
        </div>

        <span className="px-2.5 py-1 bg-purple-950/80 text-purple-300 border border-purple-800 text-[10px] font-mono font-bold rounded-full">
          {scorePct}% Confidence
        </span>
      </div>

      <p className="text-xs text-gray-200 leading-relaxed font-medium bg-[#0a0f0d] p-3 rounded-2xl border border-[#1e2d26]">
        {recommendation}
      </p>

      <div className="flex items-center justify-between text-[10px] font-mono text-gray-500 pt-1">
        <span>Source: {sourceReference}</span>
        <span className="flex items-center gap-1">
          <Clock className="w-3 h-3 text-purple-400" /> {freshnessTimestamp}
        </span>
      </div>
    </div>
  );
};
