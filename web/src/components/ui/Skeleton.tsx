'use client';

import React from 'react';

export const Skeleton: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`animate-pulse bg-[#1a2620] rounded-xl ${className}`} />
);

export const SkeletonCard: React.FC = () => (
  <div className="p-5 bg-[#121a16] border border-[#1e2d26] rounded-2xl space-y-4">
    <Skeleton className="h-40 w-full rounded-xl" />
    <Skeleton className="h-6 w-3/4" />
    <Skeleton className="h-4 w-1/2" />
    <div className="flex justify-between items-center pt-2">
      <Skeleton className="h-8 w-24 rounded-lg" />
      <Skeleton className="h-8 w-20 rounded-lg" />
    </div>
  </div>
);
