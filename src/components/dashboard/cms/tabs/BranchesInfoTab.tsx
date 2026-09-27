'use client';

import React, { useState, useEffect } from 'react';
import { Building2, Save, PhoneCall, Clock, Sparkles } from 'lucide-react';
import type { BranchesInfoConfig } from '@/types';

interface BranchesInfoTabProps {
  branchesInfo: BranchesInfoConfig;
  setBranchesInfo: React.Dispatch<React.SetStateAction<BranchesInfoConfig>>;
  onSave: (msg: string) => void;
}

export const BranchesInfoTab: React.FC<BranchesInfoTabProps> = ({
  branchesInfo,
  setBranchesInfo,
  onSave,
}) => {
  const [formData, setFormData] = useState<BranchesInfoConfig>(branchesInfo);

  useEffect(() => {
    setFormData(branchesInfo);
  }, [branchesInfo]);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setBranchesInfo(formData);
    onSave('تم حفظ نصوص ومحتوى قسم الفروع بنجاح');
  };

  return (
    <form onSubmit={handleFormSubmit} className="space-y-5">
      {/* Top Header Card - Matching GoalsTab design */}
      <div className="flex items-center justify-between bg-card p-5 rounded-3xl border border-border shadow-sm">
        <div>
          <h3 className="font-extrabold text-foreground text-base">إدارة نصوص ومحتوى قسم الفروع</h3>
          <p className="text-xs text-muted-foreground mt-0.5">صياغة عنوان الفروع وساعات استقبال الزوار في حضرموت</p>
        </div>
        <button
          type="submit"
          className="px-5 py-2.5 rounded-2xl bg-primary text-primary-foreground font-bold text-xs flex items-center gap-2 shadow-md shadow-primary/20 hover:opacity-90 transition-opacity"
        >
          <Save className="w-4 h-4" />
          حفظ كافة بيانات الفروع
        </button>
      </div>

      {/* 3-Column Cards Grid - Matching GoalsTab layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {/* Card 1: Intro Title & Subtitle */}
        <div className="bg-card text-card-foreground border border-border/80 rounded-3xl p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-3xl p-3 rounded-2xl bg-primary/10 border border-primary/20 text-primary">
                🏢
              </span>
              <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold">
                الهيدر والمقدمة
              </span>
            </div>

            <div>
              <label className="block mb-1.5 font-bold text-xs text-foreground">العنوان الرئيسي لقسم الفروع</label>
              <input
                type="text"
                value={formData.introTitle}
                onChange={(e) => setFormData({ ...formData, introTitle: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl border border-input bg-background/50 font-bold text-xs focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block mb-1.5 font-bold text-xs text-foreground">النص الترحيبي والتوضيحي</label>
              <textarea
                rows={3}
                value={formData.introSubtitle}
                onChange={(e) => setFormData({ ...formData, introSubtitle: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-input bg-background/50 resize-none text-xs focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-border flex items-center justify-between text-[11px] text-muted-foreground">
            <span className="flex items-center gap-1 text-primary font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              الترحيب الرئيسي
            </span>
            <span className="text-primary font-bold">جاهز للحفظ</span>
          </div>
        </div>

        {/* Card 2: Customer Hotline */}
        <div className="bg-card text-card-foreground border border-border/80 rounded-3xl p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-3xl p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-500">
                📞
              </span>
              <span className="px-3 py-1 rounded-full bg-amber-500/10 text-amber-500 text-xs font-bold">
                الخط المباشر
              </span>
            </div>

            <div>
              <label className="block mb-1.5 font-bold text-xs text-foreground">رقم الهاتف المباشر للفرع الرئيسي</label>
              <input
                type="text"
                value={formData.customerHotline}
                onChange={(e) => setFormData({ ...formData, customerHotline: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl border border-input bg-background/50 font-bold text-xs focus:ring-2 focus:ring-primary dir-ltr text-right"
              />
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed pt-2">
              هاتف التواصل السريع لاستقبال استفسارات العملاء والطلب الفوري.
            </p>
          </div>

          <div className="pt-3 border-t border-border flex items-center justify-between text-[11px] text-muted-foreground">
            <span className="flex items-center gap-1 text-amber-600 font-bold">
              <PhoneCall className="w-3.5 h-3.5" />
              اتصال مباشر
            </span>
            <span className="text-amber-500 font-bold">HMEC Line</span>
          </div>
        </div>

        {/* Card 3: Working Days & Hours */}
        <div className="bg-card text-card-foreground border border-border/80 rounded-3xl p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-3xl p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500">
                🕒
              </span>
              <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-500 text-xs font-bold">
                أوقات الدوام
              </span>
            </div>

            <div>
              <label className="block mb-1.5 font-bold text-xs text-foreground">أيام وأوقات استقبال الزوار</label>
              <input
                type="text"
                value={formData.workingDays}
                onChange={(e) => setFormData({ ...formData, workingDays: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl border border-input bg-background/50 font-bold text-xs focus:ring-2 focus:ring-primary"
              />
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed pt-2">
              ساعات العمل في فروع المركز بالمكلا وسيئون والشحر طوال أيام الأسبوع.
            </p>
          </div>

          <div className="pt-3 border-t border-border flex items-center justify-between text-[11px] text-muted-foreground">
            <span className="flex items-center gap-1 text-emerald-600 font-bold">
              <Clock className="w-3.5 h-3.5" />
              دوام رسمي
            </span>
            <span className="text-emerald-500 font-bold">استقبال الزوار</span>
          </div>
        </div>
      </div>
    </form>
  );
};
