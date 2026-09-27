'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Globe,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';

import type {
  SliderSlide,
  BranchesInfoConfig,
} from '@/types';

import { CmsCardsGrid, SubTabType } from './cms/CmsCardsGrid';
import { SliderTab } from './cms/tabs/SliderTab';


import {
  SliderModal
} from './cms/SubModals';

export const SiteCmsSection: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Read active section from URL search params (e.g. ?section=goals)
  const currentSectionParam = (searchParams.get('section') as SubTabType) || 'overview_cards';
  const [subTab, setSubTab] = useState<SubTabType>(currentSectionParam);

  // Sync state when URL search params change (supports page refresh & back button)
  useEffect(() => {
    const param = searchParams.get('section') as SubTabType;
    if (param) {
      setSubTab(param);
    } else {
      setSubTab('overview_cards');
    }
  }, [searchParams]);

  // Navigate to sub-section via URL parameter or nested route
  const handleSelectSubTab = (tab: SubTabType) => {
    if (tab === 'goals') {
      router.push('/dashboard/site-cms/goals');
      return;
    }
    if (tab === 'content') {
      router.push('/dashboard/site-cms/main-content');
      return;
    }
    if (tab === 'public_services') {
      router.push('/dashboard/site-cms/public-services');
      return;
    }
    if (tab === 'agencies') {
      router.push('/dashboard/site-cms/agencies');
      return;
    }
    if (tab === 'services') {
      router.push('/dashboard/site-cms/services');
      return;
    }
    if (tab === 'branches_info') {
      router.push('/dashboard/site-cms/branches');
      return;
    }
    if (tab === 'testimonials') {
      router.push('/dashboard/site-cms/testimonials');
      return;
    }
    setSubTab(tab);
    if (tab === 'overview_cards') {
      router.push('/dashboard/site-cms');
    } else {
      router.push(`/dashboard/site-cms?section=${tab}`);
    }
  };

  const [slides, setSlides] = useState<SliderSlide[]>([]);

  const [branchesInfo, setBranchesInfo] = useState<BranchesInfoConfig>({
    introTitle: '',
    introSubtitle: '',
    customerHotline: '',
    workingDays: '',
  });

  // Toast feedback state
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  const triggerSaveNotification = (msg: string) => {
    setSaveSuccessMsg(msg);
    setTimeout(() => setSaveSuccessMsg(null), 3000);
  };

  const [isSliderModalOpen, setIsSliderModalOpen] = useState(false);
  const [editingSlide, setEditingSlide] = useState<SliderSlide | null>(null);

  // Handlers for Slider
  const handleSaveSlide = (data: Partial<SliderSlide>) => {
    if (editingSlide) {
      setSlides((prev) => prev.map((s) => (s.id === editingSlide.id ? ({ ...s, ...data } as SliderSlide) : s)));
    } else {
      setSlides((prev) => [
        {
          id: `slide-${Date.now()}`,
          badge: data.badge || '⚡ شريحة جديدة',
          title: data.title || 'عنوان الشريحة',
          subtitle: data.subtitle || '',
          ctaText: data.ctaText || 'عرض التفاصيل',
          ctaLink: data.ctaLink || '#',
          image: data.image || 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&auto=format&fit=crop&q=80',
          isActive: data.isActive ?? true,
        },
        ...prev,
      ]);
    }
    setEditingSlide(null);
    triggerSaveNotification('تم تحديث شريحة السلايدر بنجاح');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Main Header Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-card via-card to-primary/10 text-card-foreground border border-border/80 p-6 shadow-xl backdrop-blur-xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary via-primary-dark to-accent flex items-center justify-center text-primary-foreground font-extrabold shadow-lg shadow-primary/20">
              <Globe className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-extrabold text-foreground tracking-tight">
                  إدارة محتوى وعناصر الموقع العام (CMS Hub)
                </h2>

              </div>
              <p className="text-xs text-muted-foreground mt-1">
                اختر أي كارت من الأقسام الـ 9 لتعديل وإدارة المحتوى، مع حفظ المسار التلقائي عند تحديث الصفحة
              </p>
            </div>
          </div>

          {saveSuccessMsg && (
            <div className="px-4 py-2.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-extrabold flex items-center gap-2 shadow-lg animate-in slide-in-from-top duration-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              {saveSuccessMsg}
            </div>
          )}
        </div>
      </div>

      {/* Back Button linked to URL search param reset */}
      {subTab !== 'overview_cards' && (
        <div className="flex items-center justify-start">
          <button
            onClick={() => handleSelectSubTab('overview_cards')}
            className="px-5 py-2.5 rounded-2xl bg-primary text-primary-foreground font-extrabold text-xs hover:opacity-90 transition-all flex items-center gap-2 shadow-lg shadow-primary/20"
          >
            <ArrowRight className="w-4 h-4" />
            الرجوع خلفاً للكروت الرئيسية
          </button>
        </div>
      )}

      {/* ==================== VIEW 1: THE 9 CARDS GRID OVERVIEW ==================== */}
      {subTab === 'overview_cards' && (
        <CmsCardsGrid
          slides={slides}
          onSelectTab={handleSelectSubTab}
        />
      )}

      {/* ==================== VIEW 2: SUB-SECTION EDITORS ==================== */}


      {subTab === 'slider' && (
        <SliderTab
          slides={slides}
          onAddSlide={() => {
            setEditingSlide(null);
            setIsSliderModalOpen(true);
          }}
          onEditSlide={(s) => {
            setEditingSlide(s);
            setIsSliderModalOpen(true);
          }}
          onDeleteSlide={(id) => {
            setSlides((prev) => prev.filter((item) => item.id !== id));
            triggerSaveNotification('تم حذف الشريحة');
          }}
          onToggleActive={(id) => {
            setSlides((prev) =>
              prev.map((item) => (item.id === id ? { ...item, isActive: !item.isActive } : item))
            );
          }}
        />
      )}

      {/* Global CMS Modals */}
      <SliderModal
        isOpen={isSliderModalOpen}
        onClose={() => setIsSliderModalOpen(false)}
        onSave={handleSaveSlide}
        initialData={editingSlide}
      />





    </div>
  );
};
