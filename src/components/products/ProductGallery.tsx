'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useLocale } from 'next-intl';

interface ProductGalleryProps {
  images: string[];
  productName: string;
  categoryGroup?: string;
}

export default function ProductGallery({
  images,
  productName,
  categoryGroup
}: ProductGalleryProps) {
  const [selectedImage, setSelectedImage] = useState<string>(
    images[0] || ''
  );
  const locale = useLocale();

  return (
    <div className="flex flex-col gap-5">
      {/* Main Large Display */}
      <div className="relative aspect-square bg-gradient-to-b from-slate-50 to-slate-100 rounded-3xl overflow-hidden border border-slate-100 shadow-inner group">
        <img
          src={selectedImage || images[0]}
          alt={productName}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />

        {/* Badges Overlay */}
        <div className="absolute top-4 inset-x-4 flex items-center justify-between pointer-events-none">
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500 text-white text-xs font-extrabold shadow-md">
            <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
            {locale === 'ar' ? 'متوفر بالمخزن' : 'In Stock'}
          </span>

          {categoryGroup && (
            <span className="bg-slate-900/80 text-white text-xs font-bold px-3 py-1.5 rounded-full backdrop-blur-md">
              {categoryGroup}
            </span>
          )}
        </div>
      </div>

      {/* Interactive Thumbnails Selector */}
      {images.length > 1 && (
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
          {images.map((imgUrl, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedImage(imgUrl)}
              className={cn(
                'w-20 h-20 rounded-2xl overflow-hidden border-2 shrink-0 bg-slate-50 transition-all duration-300',
                selectedImage === imgUrl
                  ? 'border-primary ring-2 ring-primary/20 scale-95 shadow-md'
                  : 'border-slate-200 hover:border-primary/50 opacity-70 hover:opacity-100'
              )}
            >
              <img
                src={imgUrl}
                alt={`${productName} thumbnail ${idx}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
