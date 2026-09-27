'use client';

import React, { useState, useEffect } from 'react';
import { X, Check, MapPin } from 'lucide-react';
import type { ApiBranch } from '@/types/api';

interface BranchModalProps {
  isOpen: boolean;
  onClose: () => void;
  branch?: ApiBranch | null;
  onSave: (branch: Partial<ApiBranch>) => void;
}

export const BranchModal: React.FC<BranchModalProps> = ({ isOpen, onClose, onSave, branch }) => {
  const [formData, setFormData] = useState<Partial<ApiBranch>>(
    branch || {
      name_ar: '',
      address_ar: '',
      phone: '',
      email: '',
    }
  );

  useEffect(() => {
    if (branch) {
      setFormData(branch);
    } else {
      setFormData({
        name_ar: '',
        address_ar: '',
        phone: '',
        email: '',
      });
    }
  }, [branch, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6">
      <div className="bg-card text-card-foreground border border-border rounded-3xl w-full max-w-3xl lg:max-w-4xl max-h-[92vh] shadow-2xl p-6 sm:p-8 space-y-6 animate-in fade-in zoom-in-95 overflow-y-auto">
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-primary/10 text-primary">
              <MapPin className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-lg text-foreground">
                {branch ? 'تعديل بيانات الفرع' : 'إضافة فرع جديد'}
              </h3>
              <p className="text-xs text-muted-foreground font-medium">قم بإدخال بيانات ومعلومات اتصال الفرع</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-xl text-muted-foreground hover:bg-muted transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSave(formData);
            onClose();
          }}
          className="space-y-5 text-xs sm:text-sm"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block mb-1.5 font-bold text-foreground">اسم الفرع *</label>
              <input
                type="text"
                required
                value={formData.name_ar || ''}
                onChange={(e) => setFormData({ ...formData, name_ar: e.target.value })}
                placeholder="اسم الفرع"
                className="w-full px-3.5 py-2.5 rounded-xl border border-input bg-background/50 font-bold focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block mb-1.5 font-bold text-foreground">العنوان</label>
              <input
                type="text"
                value={formData.address_ar || ''}
                onChange={(e) => setFormData({ ...formData, address_ar: e.target.value })}
                placeholder="العنوان"
                className="w-full px-3.5 py-2.5 rounded-xl border border-input bg-background/50 font-bold focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block mb-1.5 font-bold text-foreground">رقم الهاتف</label>
              <input
                type="text"
                value={formData.phone || ''}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="رقم الهاتف"
                className="w-full px-3.5 py-2.5 rounded-xl border border-input bg-background/50 font-bold focus:ring-2 focus:ring-primary dir-ltr text-right"
              />
            </div>
            <div>
              <label className="block mb-1.5 font-bold text-foreground">البريد الإلكتروني</label>
              <input
                type="email"
                value={formData.email || ''}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="البريد الإلكتروني"
                className="w-full px-3.5 py-2.5 rounded-xl border border-input bg-background/50 font-bold focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>



          <div className="pt-3 border-t border-border flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-input hover:bg-muted text-xs font-bold"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-primary text-primary-foreground font-extrabold text-xs flex items-center gap-1.5 shadow-md shadow-primary/20"
            >
              <Check className="w-4 h-4" />
              حفظ الفرع
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
