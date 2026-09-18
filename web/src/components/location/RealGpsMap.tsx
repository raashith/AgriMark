'use client';

/**
 * RealGpsMap — backward-compatibility shim.
 *
 * This file was previously a Leaflet CDN script-injection map.
 * It now delegates to AgriMarkLocationMap (MapLibre GL / MapCN).
 *
 * Existing imports of RealGpsMap continue to work without changes.
 */

import dynamic from 'next/dynamic';

const AgriMarkLocationMap = dynamic(
  () => import('./AgriMarkLocationMap').then((m) => m.AgriMarkLocationMap),
  {
    ssr: false,
    loading: () => (
      <div
        className="w-full rounded-2xl border border-[#1e2d26] bg-[#0a0f0d] flex items-center justify-center"
        style={{ minHeight: '280px' }}
        aria-label="Loading map..."
        role="status"
      >
        <div className="flex flex-col items-center gap-3">
          <div className="w-7 h-7 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs text-gray-400 font-mono">Loading map...</span>
        </div>
      </div>
    ),
  }
);

export interface RealGpsMapProps {
  center: { lat: number; lng: number };
  onPinChange: (lat: number, lng: number) => void;
  accuracy?: number | null;
  onLocateRequest?: () => void;
}

export const RealGpsMap: React.FC<RealGpsMapProps> = (props) => {
  return (
    <AgriMarkLocationMap
      center={props.center}
      onPinChange={props.onPinChange}
      accuracy={props.accuracy}
      onLocateRequest={props.onLocateRequest}
      className="h-72"
    />
  );
};

import React from 'react';

export default RealGpsMap;
