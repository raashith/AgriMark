'use client';

import React, { useEffect, useState } from 'react';
import { resolveCommodityImageRecord } from '@/lib/commodity-images';

type CommodityImageProps = {
  name?: string | null;
  title?: string | null;
  category?: string | null;
  className?: string;
  imageClassName?: string;
};

export function CommodityImage({
  name,
  title,
  category,
  className = '',
  imageClassName = '',
}: CommodityImageProps) {
  const record = resolveCommodityImageRecord(name, title);
  const [imageFailed, setImageFailed] = useState(false);
  const imageSrc = imageFailed
    ? (record ? `/images/commodities/${record.key}.jpg` : '')
    : (record?.imageUrl || (record ? `/images/commodities/${record.key}.jpg` : ''));
  useEffect(() => { setImageFailed(false); }, [record?.key]);

  if (!record || imageFailed) {
    const label = record?.name || name || title || category || 'Produce';
    return (
      <div
        role="img"
        aria-label={`${label} illustration`}
        className={`relative flex h-full w-full items-center justify-center overflow-hidden bg-gradient-to-br from-[#193a2b] via-[#10251b] to-[#07110c] ${className}`}
      >
        <div className="absolute inset-0 opacity-30" style={{ backgroundImage: 'radial-gradient(circle at 25% 20%, rgba(229,169,60,.35), transparent 35%), radial-gradient(circle at 80% 80%, rgba(52,211,153,.25), transparent 40%)' }} />
        <div className="relative flex flex-col items-center gap-2 p-4 text-center">
          <span className="text-6xl drop-shadow-lg" aria-hidden="true">{record?.emoji || '🌾'}</span>
          <span className="rounded-full border border-white/10 bg-black/25 px-3 py-1 text-xs font-bold tracking-wide text-emerald-50">
            {label}
          </span>
        </div>
      </div>
    );
  }

  return (
    <img
      src={imageSrc}
      alt={record.name}
      loading="lazy"
      decoding="async"
      onError={() => {
        if (!imageFailed && record?.imageUrl) setImageFailed(true);
        else setImageFailed(true);
      }}
      className={imageClassName || 'h-full w-full object-cover'}
    />
  );
}
