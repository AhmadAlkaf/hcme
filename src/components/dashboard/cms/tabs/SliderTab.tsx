'use client';

import React from 'react';
import { Plus, Edit, Trash2, Eye, EyeOff, Sparkles, ExternalLink } from 'lucide-react';
import type { SliderSlide } from '@/types';

interface SliderTabProps {
  slides: SliderSlide[];
  onAddSlide: () => void;
  onEditSlide: (slide: SliderSlide) => void;
  onDeleteSlide: (id: string) => void;
  onToggleActive: (id: string) => void;
}

export const SliderTab: React.FC<SliderTabProps> = ({
  slides,
  onAddSlide,
  onEditSlide,
  onDeleteSlide,
  onToggleActive,
}) => {
  return (
    <div className="space-y-5">
      {/* Top Header Card - Matching GoalsTab design */}
      <div className="flex items-center justify-between bg-card p-5 rounded-3xl border border-border shadow-sm">
        <div>
          <h3 className="font-extrabold text-foreground text-base">إدارة شريط التمرير والبنرات الرئيسي</h3>
          <p className="text-xs text-muted-foreground mt-0.5">بنرات السلايدر، صور العروض، وتوجيه أزرار الدعوة للإجراء</p>
        </div>
        <button
          onClick={onAddSlide}
          className="px-4 py-2.5 rounded-2xl bg-primary text-primary-foreground font-bold text-xs flex items-center gap-2 shadow-md shadow-primary/20"
        >
          <Plus className="w-4 h-4" />
          إضافة شريحة بنر
        </button>
      </div>

      {/* 3-Column Cards Grid - Matching GoalsTab layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {slides.map((s) => (
          <div
            key={s.id}
            className="bg-card text-card-foreground border border-border/80 rounded-3xl p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between space-y-4"
          >
            <div className="space-y-3">
              {/* Image Preview & Badges Top Row */}
              <div className="relative w-full h-36 rounded-2xl overflow-hidden bg-muted border border-border shadow-inner group">
                <img src={s.image} alt={s.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute top-2.5 right-2.5">
                  <span className="px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-[10px] font-black border border-white/20">
                    {s.badge}
                  </span>
                </div>
                <div className="absolute top-2.5 left-2.5">
                  <button
                    onClick={() => onToggleActive(s.id)}
                    className={`px-2.5 py-1 rounded-full text-[10px] font-black transition-all ${
                      s.isActive
                        ? 'bg-emerald-500 text-white shadow-md'
                        : 'bg-gray-700/80 text-white/80'
                    }`}
                  >
                    {s.isActive ? 'نشط 🟢' : 'مخفي 🔴'}
                  </button>
                </div>
              </div>

              {/* Title & Subtitle */}
              <div>
                <h4 className="font-extrabold text-base text-foreground line-clamp-1">{s.title}</h4>
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2 leading-relaxed">{s.subtitle}</p>
              </div>

              {/* Call to action Button info */}
              <div className="p-3 rounded-2xl bg-muted/40 border border-border text-xs space-y-1">
                <span className="text-[10px] font-bold text-muted-foreground block">زر التوجيه الرئيسي (CTA):</span>
                <div className="flex items-center justify-between font-bold text-primary">
                  <span className="flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    {s.ctaText}
                  </span>
                  <span className="text-[10px] text-muted-foreground dir-ltr flex items-center gap-1">
                    {s.ctaLink}
                    <ExternalLink className="w-3 h-3 text-muted-foreground" />
                  </span>
                </div>
              </div>
            </div>

            {/* Bottom Actions Bar - Matching GoalsTab */}
            <div className="pt-3 border-t border-border flex items-center justify-between gap-2">
              <button
                onClick={() => onToggleActive(s.id)}
                className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 border transition-all ${
                  s.isActive
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                    : 'bg-gray-500/10 text-gray-500 border-gray-500/20'
                }`}
              >
                {s.isActive ? <Eye className="w-3.5 h-3.5 text-emerald-500" /> : <EyeOff className="w-3.5 h-3.5" />}
                {s.isActive ? 'معروض' : 'مخفي'}
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => onEditSlide(s)}
                  className="p-2 rounded-xl border border-input text-muted-foreground hover:text-foreground hover:bg-muted"
                  title="تعديل الشريحة"
                >
                  <Edit className="w-4 h-4" />
                </button>

                <button
                  onClick={() => onDeleteSlide(s.id)}
                  className="p-2 rounded-xl border border-destructive/20 text-destructive hover:bg-destructive/10"
                  title="حذف الشريحة"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
