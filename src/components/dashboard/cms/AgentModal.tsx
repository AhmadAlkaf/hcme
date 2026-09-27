'use client';

import React, { useState, useEffect, useRef } from 'react';
import { X, Check, Image as ImageIcon, Briefcase } from 'lucide-react';
import { ApiAgent } from '@/types/api';
import Image from 'next/image';

interface AgentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (formData: FormData) => void;
  initialData?: ApiAgent | null;
}

export const AgentModal: React.FC<AgentModalProps> = ({ isOpen, onClose, onSave, initialData }) => {
  const [nameAr, setNameAr] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [urls, setUrls] = useState('');
  const [buyFomeUsAr, setBuyFomeUsAr] = useState('');
  const [buyFomeUsEn, setBuyFomeUsEn] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialData) {
      setNameAr(initialData.name_ar || '');
      setNameEn(initialData.name_en || '');
      setUrls(initialData.urls || '');
      setBuyFomeUsAr(initialData.buy_fome_us_ar || '');
      setBuyFomeUsEn(initialData.buy_fome_us_en || '');
      setImagePreview(initialData.image || null);
    } else {
      setNameAr('');
      setNameEn('');
      setUrls('');
      setBuyFomeUsAr('');
      setBuyFomeUsEn('');
      setImagePreview(null);
    }
  }, [initialData, isOpen]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('name_ar', nameAr);
    formData.append('name_en', nameEn);
    if (urls) formData.append('urls', urls);
    formData.append('buy_fome_us_ar', buyFomeUsAr);
    formData.append('buy_fome_us_en', buyFomeUsEn);
    
    // Append image only if a new file is selected
    if (fileInputRef.current?.files?.[0]) {
      formData.append('image', fileInputRef.current.files[0]);
    } else if (!initialData?.image) {
      // If it's a new agent and no image is uploaded, we might want to handle it (though usually it's required)
      // Here we assume Backend handles the null/empty if it's optional, or throws an error.
    }

    onSave(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-card text-card-foreground border border-border w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="px-6 py-4 bg-primary/10 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary text-primary-foreground">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground">
                {initialData ? 'تعديل بيانات الوكيل' : 'إضافة وكيل جديد'}
              </h3>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg text-muted-foreground hover:bg-muted">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 text-sm">
          
          {/* Image Upload Area */}
          <div className="space-y-2">
            <label className="block font-semibold text-foreground">صورة / شعار الوكيل *</label>
            <div className="flex items-center gap-4">
              <div 
                className="w-24 h-24 rounded-2xl border-2 border-dashed border-border flex items-center justify-center bg-muted/50 relative overflow-hidden group cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                {imagePreview ? (
                  <Image 
                    src={imagePreview} 
                    alt="Preview" 
                    fill 
                    className="object-cover"
                  />
                ) : (
                  <ImageIcon className="w-8 h-8 text-muted-foreground" />
                )}
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-white text-xs font-bold text-center px-2">تغيير الصورة</span>
                </div>
              </div>
              <div className="flex-1">
                <input 
                  type="file" 
                  ref={fileInputRef}
                  onChange={handleImageChange}
                  accept="image/png, image/jpeg, image/webp"
                  className="hidden"
                />
                <button 
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 border border-input rounded-xl hover:bg-muted transition-colors font-medium text-xs text-foreground"
                >
                  اختر صورة من الجهاز
                </button>
                
              </div>
            </div>
          </div>

          {/* Texts Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block mb-1 font-semibold text-foreground">اسم الوكيل بالعربية *</label>
              <input
                type="text"
                required
                value={nameAr}
                onChange={(e) => setNameAr(e.target.value)}
                placeholder="مثال: شنايدر إلكتريك"
                className="w-full px-3 py-2 rounded-lg border border-input bg-background"
              />
            </div>
            <div>
              <label className="block mb-1 font-semibold text-foreground">اسم الوكيل بالإنجليزية *</label>
              <input
                type="text"
                required
                value={nameEn}
                onChange={(e) => setNameEn(e.target.value)}
                placeholder="Example: Schneider Electric"
                className="w-full px-3 py-2 rounded-lg border border-input bg-background dir-ltr text-left"
              />
            </div>
          </div>

          <div>
            <label className="block mb-1 font-semibold text-foreground">رابط موقع الوكيل (URLs)</label>
            <input
              type="url"
              value={urls}
              onChange={(e) => setUrls(e.target.value)}
              placeholder="https://www.example.com"
              className="w-full px-3 py-2 rounded-lg border border-input bg-background dir-ltr text-left"
            />
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div>
              <label className="block mb-1 font-semibold text-foreground">لماذا تشتري منا هذا الوكيل؟ (عربي) *</label>
              <textarea
                required
                rows={4}
                value={buyFomeUsAr}
                onChange={(e) => setBuyFomeUsAr(e.target.value)}
                placeholder="اكتب أسباب اختياركم وكلاء لهذه الماركة..."
                className="w-full px-3 py-2 rounded-lg border border-input bg-background resize-none"
              />
            </div>
            <div>
              <label className="block mb-1 font-semibold text-foreground">لماذا تشتري منا هذا الوكيل؟ (إنجليزي) *</label>
              <textarea
                required
                rows={4}
                value={buyFomeUsEn}
                onChange={(e) => setBuyFomeUsEn(e.target.value)}
                placeholder="Why buy from us for this agent..."
                className="w-full px-3 py-2 rounded-lg border border-input bg-background resize-none dir-ltr text-left"
              />
            </div>
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
