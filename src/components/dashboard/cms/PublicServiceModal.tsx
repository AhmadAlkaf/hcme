'use client';

import React, { useState, useEffect } from 'react';
import { X, Check, Layers } from 'lucide-react';
import { ApiPublicService } from '@/types/api';

interface PublicServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (service: { name_ar: string; name_en: string }) => void;
  initialData?: ApiPublicService | null;
}

export const PublicServiceModal: React.FC<PublicServiceModalProps> = ({ isOpen, onClose, onSave, initialData }) => {
  const [formData, setFormData] = useState({
    name_ar: '',
    name_en: '',
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        name_ar: initialData.name_ar || '',
        name_en: initialData.name_en || '',
      });
    } else {
      setFormData({
        name_ar: '',
        name_en: '',
      });
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-card text-card-foreground border border-border w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="px-6 py-4 bg-primary/10 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary text-primary-foreground">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground">
                {initialData ? 'تعديل الخدمة العامة' : 'إضافة خدمة عامة جديدة'}
              </h3>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg text-muted-foreground hover:bg-muted">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSave(formData);
            onClose();
          }}
          className="p-6 overflow-y-auto space-y-4 text-sm"
        >
          <div>
            <label className="block mb-1 font-semibold text-foreground">الخدمة باللغة العربية *</label>
            <textarea
              required
              rows={3}
              value={formData.name_ar}
              onChange={(e) => setFormData({ ...formData, name_ar: e.target.value })}
              placeholder="اكتب اسم الخدمة باللغة العربية هنا..."
              className="w-full px-3 py-2 rounded-lg border border-input bg-background resize-none"
            />
          </div>

          <div>
            <label className="block mb-1 font-semibold text-foreground">الخدمة باللغة الإنجليزية *</label>
            <textarea
              required
              rows={3}
              value={formData.name_en}
              onChange={(e) => setFormData({ ...formData, name_en: e.target.value })}
              placeholder="Write the service in English here..."
              className="w-full px-3 py-2 rounded-lg border border-input bg-background resize-none dir-ltr text-left"
            />
          </div>

          <div className="pt-4 border-t border-border flex items-center justify-end gap-3">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg border border-input hover:bg-muted">
              إلغاء
            </button>
            <button type="submit" className="px-5 py-2 rounded-lg bg-primary text-primary-foreground font-bold flex items-center gap-2">
              <Check className="w-4 h-4" />
              حفظ
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
