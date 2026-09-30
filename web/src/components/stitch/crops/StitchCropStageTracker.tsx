import React from 'react';
import { CheckCircle2, Circle, Clock, Calendar } from 'lucide-react';
import { StitchBadge } from '../common/StitchBadge';

export interface CropStageNode {
  stageName: string;
  expectedDate?: string;
  status: 'completed' | 'active' | 'upcoming';
  description?: string;
}

export interface StitchCropStageTrackerProps {
  cropName: string;
  variety?: string;
  sowingDate?: string;
  harvestExpected?: string;
  stages: CropStageNode[];
  className?: string;
}

export const StitchCropStageTracker: React.FC<StitchCropStageTrackerProps> = ({
  cropName,
  variety,
  sowingDate,
  harvestExpected,
  stages,
  className = '',
}) => {
  return (
    <div className={`p-6 bg-[#121A16] border border-[#1E2D26] rounded-2xl shadow-xl space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-400">
            Agronomy Phenology Lifecycle
          </span>
          <h3 className="text-lg font-black text-white">{cropName} {variety && <span className="text-gray-400 font-normal">({variety})</span>}</h3>
        </div>
        <StitchBadge label="ACTIVE CYCLE" variant="emerald" size="sm" />
      </div>

      <div className="grid grid-cols-2 gap-3 p-3 bg-[#0A0F0D] border border-[#1E2D26] rounded-xl text-xs font-mono">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-emerald-400 shrink-0" />
          <div>
            <span className="text-[9px] text-gray-400 block uppercase">Sowing Date</span>
            <span className="text-gray-200 font-bold">{sowingDate || 'N/A'}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-amber-400 shrink-0" />
          <div>
            <span className="text-[9px] text-gray-400 block uppercase">Expected Harvest</span>
            <span className="text-[#FCE196] font-bold">{harvestExpected || 'N/A'}</span>
          </div>
        </div>
      </div>

      {/* Phenology Nodes Sequence */}
      <div className="space-y-3 pt-2">
        {stages.map((st, idx) => (
          <div key={idx} className="flex items-start gap-3 relative">
            {idx < stages.length - 1 && (
              <div
                className={`absolute left-[11px] top-6 bottom-0 w-0.5 ${
                  st.status === 'completed' ? 'bg-emerald-500' : 'bg-[#1E2D26]'
                }`}
              />
            )}
            <div className="shrink-0 mt-0.5 z-10">
              {st.status === 'completed' && <CheckCircle2 className="w-6 h-6 text-emerald-400 fill-emerald-950" />}
              {st.status === 'active' && <Circle className="w-6 h-6 text-[#E5A93C] fill-[#E5A93C]/20 animate-pulse" />}
              {st.status === 'upcoming' && <Circle className="w-6 h-6 text-gray-600 fill-[#0A0F0D]" />}
            </div>
            <div className="flex-1 pb-3">
              <div className="flex items-center justify-between text-xs font-mono font-bold">
                <span className={st.status === 'active' ? 'text-[#FCE196]' : st.status === 'completed' ? 'text-emerald-300' : 'text-gray-400'}>
                  {st.stageName}
                </span>
                {st.expectedDate && <span className="text-[10px] text-gray-500">{st.expectedDate}</span>}
              </div>
              {st.description && <p className="text-xs text-gray-400 mt-0.5 font-sans">{st.description}</p>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
