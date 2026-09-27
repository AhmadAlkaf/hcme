'use client';

import React, { useState, useTransition } from 'react';
import { FileText, Save, Loader2, Info, MapPin, Share2 } from 'lucide-react';
import { ApiContent } from '@/types/api';
import { createContentServerAction, updateContentServerAction } from '@/actions/content.actions';
import { ToastNotification } from '@/components/ui/ToastNotification';

interface MainContentTabProps {
  initialContent: ApiContent | null;
}

export const MainContentTab: React.FC<MainContentTabProps> = ({ initialContent }) => {
  const [isPending, startTransition] = useTransition();
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const [formData, setFormData] = useState<Partial<ApiContent>>({
    id: initialContent?.id,
    we_are_ar: initialContent?.we_are_ar || '',
    we_are_en: initialContent?.we_are_en || '',
    our_vision_ar: initialContent?.our_vision_ar || '',
    our_vision_en: initialContent?.our_vision_en || '',
    our_message_ar: initialContent?.our_message_ar || '',
    our_message_en: initialContent?.our_message_en || '',
    buy_fome_us_ar: initialContent?.buy_fome_us_ar || '',
    buy_fome_us_en: initialContent?.buy_fome_us_en || '',
    our_values_ar: initialContent?.our_values_ar || '',
    our_values_en: initialContent?.our_values_en || '',
    address_ar: initialContent?.address_ar || '',
    address_en: initialContent?.address_en || '',
    email: initialContent?.email || '',
    facebook: initialContent?.facebook || '',
    instagram: initialContent?.instagram || '',
    toktek: initialContent?.toktek || '',
    whatsapp: initialContent?.whatsapp || '',
    location: initialContent?.location || '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    startTransition(async () => {
      let res: { success: boolean; data?: ApiContent; error?: string };
      if (formData.id) {
        // Update existing content
        res = await updateContentServerAction(formData.id, formData);
      } else {
        // Create new content if none exists
        res = await createContentServerAction(formData as Omit<ApiContent, 'id' | 'create_at' | 'update_at'>);
        if (res.success && res.data) {
          setFormData((prev) => ({ ...prev, id: res.data!.id }));
        }
      }

      if (res.success) {
        setToast({ type: 'success', message: 'تم حفظ وتحديث بيانات الموقع بنجاح' });
      } else {
        setToast({ type: 'error', message: res.error || 'حدث خطأ أثناء حفظ البيانات' });
      }
    });
  };

  return (
    <div className="space-y-6 relative">
      {/* Global loading spinner overlay during submit */}
      {isPending && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center">
          <div className="bg-card border border-border p-6 rounded-3xl shadow-xl flex items-center gap-3 text-sm font-bold text-foreground">
            <Loader2 className="w-5 h-5 text-primary animate-spin" />
            <span>جاري الحفظ...</span>
          </div>
        </div>
      )}

      {toast && (
        <ToastNotification
          toast={toast}
          onClose={() => setToast(null)}
        />
      )}

      {/* Top Header Card */}
      <div className="flex items-center justify-between bg-card p-5 rounded-3xl border border-border shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-blue-500/10 text-blue-500">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-extrabold text-foreground text-base">المحتوى الرئيسي وبيانات التواصل</h3>
            <p className="text-xs text-muted-foreground mt-0.5">تعديل نصوص واجهة الموقع وروابط السوشيال ميديا</p>
          </div>
        </div>
        <button
          onClick={handleSave}
          disabled={isPending}
          className="px-5 py-2.5 rounded-2xl bg-primary text-primary-foreground font-bold text-xs flex items-center gap-2 shadow-md shadow-primary/20 hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          حفظ كافة التغييرات
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Card 1: من نحن ولماذا نحن */}
        <div className="bg-card text-card-foreground border border-border/80 p-6 rounded-3xl shadow-sm space-y-5">
          <div className="flex items-center gap-2 text-primary pb-3 border-b border-border/50">
            <Info className="w-5 h-5" />
            <h4 className="font-extrabold text-sm">من نحن (عن المركز)</h4>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block mb-1.5 font-bold text-xs">من نحن (عربي)</label>
              <textarea
                name="we_are_ar"
                rows={3}
                value={formData.we_are_ar}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl border border-input bg-background/50 resize-none text-xs focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block mb-1.5 font-bold text-xs">من نحن (إنجليزي)</label>
              <textarea
                name="we_are_en"
                rows={3}
                value={formData.we_are_en}
                onChange={handleChange}
                dir="ltr"
                className="w-full px-3.5 py-2.5 rounded-xl border border-input bg-background/50 resize-none text-xs focus:ring-2 focus:ring-primary text-left"
              />
            </div>
            
            <div className="pt-4 pb-2 border-b border-border/50">
              <h4 className="font-extrabold text-sm text-foreground">لماذا تختارنا (Why Us)</h4>
            </div>

            <div>
              <label className="block mb-1.5 font-bold text-xs">لماذا تشتري منا (عربي)</label>
              <textarea
                name="buy_fome_us_ar"
                rows={3}
                value={formData.buy_fome_us_ar}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl border border-input bg-background/50 resize-none text-xs focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block mb-1.5 font-bold text-xs">لماذا تشتري منا (إنجليزي)</label>
              <textarea
                name="buy_fome_us_en"
                rows={3}
                value={formData.buy_fome_us_en}
                onChange={handleChange}
                dir="ltr"
                className="w-full px-3.5 py-2.5 rounded-xl border border-input bg-background/50 resize-none text-xs focus:ring-2 focus:ring-primary text-left"
              />
            </div>
          </div>
        </div>

        {/* Card 2: الرؤية، الرسالة، والقيم */}
        <div className="bg-card text-card-foreground border border-border/80 p-6 rounded-3xl shadow-sm space-y-5">
          <div className="flex items-center gap-2 text-primary pb-3 border-b border-border/50">
            <FileText className="w-5 h-5" />
            <h4 className="font-extrabold text-sm">الرؤية والرسالة والقيم</h4>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block mb-1.5 font-bold text-xs">الرؤية (عربي)</label>
                <textarea
                  name="our_vision_ar"
                  rows={2}
                  value={formData.our_vision_ar}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-input bg-background/50 resize-none text-xs focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block mb-1.5 font-bold text-xs">الرؤية (إنجليزي)</label>
                <textarea
                  name="our_vision_en"
                  rows={2}
                  value={formData.our_vision_en}
                  onChange={handleChange}
                  dir="ltr"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-input bg-background/50 resize-none text-xs focus:ring-2 focus:ring-primary text-left"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block mb-1.5 font-bold text-xs">الرسالة (عربي)</label>
                <textarea
                  name="our_message_ar"
                  rows={2}
                  value={formData.our_message_ar}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-input bg-background/50 resize-none text-xs focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block mb-1.5 font-bold text-xs">الرسالة (إنجليزي)</label>
                <textarea
                  name="our_message_en"
                  rows={2}
                  value={formData.our_message_en}
                  onChange={handleChange}
                  dir="ltr"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-input bg-background/50 resize-none text-xs focus:ring-2 focus:ring-primary text-left"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block mb-1.5 font-bold text-xs">القيم (عربي)</label>
                <textarea
                  name="our_values_ar"
                  rows={2}
                  value={formData.our_values_ar}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-input bg-background/50 resize-none text-xs focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block mb-1.5 font-bold text-xs">القيم (إنجليزي)</label>
                <textarea
                  name="our_values_en"
                  rows={2}
                  value={formData.our_values_en}
                  onChange={handleChange}
                  dir="ltr"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-input bg-background/50 resize-none text-xs focus:ring-2 focus:ring-primary text-left"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Card 3: العنوان والتواصل */}
        <div className="bg-card text-card-foreground border border-border/80 p-6 rounded-3xl shadow-sm space-y-5">
          <div className="flex items-center gap-2 text-emerald-500 pb-3 border-b border-border/50">
            <MapPin className="w-5 h-5" />
            <h4 className="font-extrabold text-sm">العنوان وبيانات الاتصال الأساسية</h4>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block mb-1.5 font-bold text-xs">البريد الإلكتروني (Email)</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                dir="ltr"
                className="w-full px-3.5 py-2.5 rounded-xl border border-input bg-background/50 text-xs focus:ring-2 focus:ring-primary text-left font-semibold"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block mb-1.5 font-bold text-xs">العنوان (عربي)</label>
                <textarea
                  name="address_ar"
                  rows={2}
                  value={formData.address_ar}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-input bg-background/50 resize-none text-xs focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block mb-1.5 font-bold text-xs">العنوان (إنجليزي)</label>
                <textarea
                  name="address_en"
                  rows={2}
                  value={formData.address_en}
                  onChange={handleChange}
                  dir="ltr"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-input bg-background/50 resize-none text-xs focus:ring-2 focus:ring-primary text-left"
                />
              </div>
            </div>

            <div>
              <label className="block mb-1.5 font-bold text-xs">رابط الموقع</label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                dir="ltr"
                className="w-full px-3.5 py-2.5 rounded-xl border border-input bg-background/50 text-xs focus:ring-2 focus:ring-primary text-left"
              />
            </div>
          </div>
        </div>

        {/* Card 4: السوشيال ميديا */}
        <div className="bg-card text-card-foreground border border-border/80 p-6 rounded-3xl shadow-sm space-y-5">
          <div className="flex items-center gap-2 text-purple-500 pb-3 border-b border-border/50">
            <Share2 className="w-5 h-5" />
            <h4 className="font-extrabold text-sm">روابط السوشيال ميديا والواتساب</h4>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block mb-1.5 font-bold text-xs">الواتساب (WhatsApp URL/Number)</label>
              <input
                type="text"
                name="whatsapp"
                value={formData.whatsapp}
                onChange={handleChange}
                dir="ltr"
                className="w-full px-3.5 py-2.5 rounded-xl border border-input bg-background/50 text-xs focus:ring-2 focus:ring-primary text-left font-semibold"
              />
            </div>
            <div>
              <label className="block mb-1.5 font-bold text-xs">فيسبوك (Facebook URL)</label>
              <input
                type="text"
                name="facebook"
                value={formData.facebook}
                onChange={handleChange}
                dir="ltr"
                className="w-full px-3.5 py-2.5 rounded-xl border border-input bg-background/50 text-xs focus:ring-2 focus:ring-primary text-left font-semibold"
              />
            </div>
            <div>
              <label className="block mb-1.5 font-bold text-xs">إنستغرام (Instagram URL)</label>
              <input
                type="text"
                name="instagram"
                value={formData.instagram}
                onChange={handleChange}
                dir="ltr"
                className="w-full px-3.5 py-2.5 rounded-xl border border-input bg-background/50 text-xs focus:ring-2 focus:ring-primary text-left font-semibold"
              />
            </div>
            <div>
              <label className="block mb-1.5 font-bold text-xs">تيك توك (TikTok URL)</label>
              <input
                type="text"
                name="toktek"
                value={formData.toktek}
                onChange={handleChange}
                dir="ltr"
                className="w-full px-3.5 py-2.5 rounded-xl border border-input bg-background/50 text-xs focus:ring-2 focus:ring-primary text-left font-semibold"
              />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
