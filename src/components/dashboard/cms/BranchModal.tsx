'use client';

import React, { useState, useEffect, useRef } from 'react';
import { X, Check, Image as ImageIcon, MapPin } from 'lucide-react';
import { ApiBranch } from '@/types/api';
import Image from 'next/image';

interface BranchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (formData: FormData) => void;
  initialData?: ApiBranch | null;
}

export const BranchModal: React.FC<BranchModalProps> = ({ isOpen, onClose, onSave, initialData }) => {
  const [nameAr, setNameAr] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [addressAr, setAddressAr] = useState('');
  const [addressEn, setAddressEn] = useState('');
  const [linkLocation, setLinkLocation] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialData) {
      setNameAr(initialData.name_ar || '');
      setNameEn(initialData.name_en || '');
      setAddressAr(initialData.address_ar || '');
      setAddressEn(initialData.address_en || '');
      setLinkLocation(initialData.link_location || '');
      setPhone(initialData.phone || '');
      setEmail(initialData.email || '');
      setImagePreview(initialData.images || null);
    } else {
      setNameAr('');
      setNameEn('');
      setAddressAr('');
      setAddressEn('');
      setLinkLocation('');
      setPhone('');
      setEmail('');
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
    formData.append('address_ar', addressAr);
    formData.append('address_en', addressEn);
    if (linkLocation) formData.append('link_location', linkLocation);
    if (phone) formData.append('phone', phone);
    if (email) formData.append('email', email);
    
    // Append image only if a new file is selected
    if (fileInputRef.current?.files?.[0]) {
      formData.append('images', fileInputRef.current.files[0]);
    }

    onSave(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-card text-card-foreground border border-border w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="px-6 py-4 bg-primary/10 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary text-primary-foreground">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground">
                {initialData ? 'تعديل بيانات الفرع' : 'إضافة فرع جديد'}
              </h3>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg text-muted-foreground hover:bg-muted">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 text-sm">
          
          {/* Image Upload Area */}
          <div className="space-y-2">
            <label className="block font-semibold text-foreground">صورة الفرع (واجهة المعرض/المقر) *</label>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              {imagePreview ? (
                <div className="relative w-32 h-24 rounded-xl overflow-hidden border-2 border-primary/20 shrink-0">
                  <Image src={imagePreview} alt="Preview" fill className="object-cover" />
                </div>
              ) : (
                <div className="w-32 h-24 rounded-xl border-2 border-dashed border-input flex flex-col items-center justify-center text-muted-foreground bg-muted/50 shrink-0">
                  <ImageIcon className="w-6 h-6 mb-1 opacity-50" />
                  <span className="text-[10px] font-medium">لا توجد صورة</span>
                </div>
              )}
              
              <div className="flex-1">
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  className="hidden"
                  onChange={handleImageChange}
                  {...(!initialData && !imagePreview ? { required: true } : {})}
                />
                <button 
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 border border-input rounded-xl hover:bg-muted transition-colors font-medium text-xs text-foreground"
                >
                  اختر صورة من الجهاز
                </button>
                <p className="text-xs text-muted-foreground mt-2">
                  يفضل رفع صورة بجودة عالية للواجهة أو المعرض لتعكس احترافية المركز.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 border-t border-border/50 pt-5">
            <div>
              <label className="block mb-1 font-semibold text-foreground">اسم الفرع بالعربية *</label>
              <input
                type="text"
                required
                value={nameAr}
                onChange={(e) => setNameAr(e.target.value)}
                placeholder="مثال: فرع المكلا الرئيسي"
                className="w-full px-3 py-2 rounded-lg border border-input bg-background"
              />
            </div>

            <div>
              <label className="block mb-1 font-semibold text-foreground">اسم الفرع بالإنجليزية *</label>
              <input
                type="text"
                required
                value={nameEn}
                onChange={(e) => setNameEn(e.target.value)}
                placeholder="Example: Mukalla Main Branch"
                className="w-full px-3 py-2 rounded-lg border border-input bg-background dir-ltr text-left"
              />
            </div>
            
            <div>
              <label className="block mb-1 font-semibold text-foreground">عنوان الفرع بالعربية *</label>
              <input
                type="text"
                required
                value={addressAr}
                onChange={(e) => setAddressAr(e.target.value)}
                placeholder="مثال: الشارع العام، المكلا"
                className="w-full px-3 py-2 rounded-lg border border-input bg-background"
              />
            </div>

            <div>
              <label className="block mb-1 font-semibold text-foreground">عنوان الفرع بالإنجليزية *</label>
              <input
                type="text"
                required
                value={addressEn}
                onChange={(e) => setAddressEn(e.target.value)}
                placeholder="Example: Main Street, Mukalla"
                className="w-full px-3 py-2 rounded-lg border border-input bg-background dir-ltr text-left"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 border-t border-border/50 pt-5">
            <div>
              <label className="block mb-1 font-semibold text-foreground">رقم الهاتف</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="مثال: 777123456"
                className="w-full px-3 py-2 rounded-lg border border-input bg-background dir-ltr text-left"
              />
            </div>

            <div>
              <label className="block mb-1 font-semibold text-foreground">البريد الإلكتروني</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="branch@hmec.com"
                className="w-full px-3 py-2 rounded-lg border border-input bg-background dir-ltr text-left"
              />
            </div>

            <div>
              <label className="block mb-1 font-semibold text-foreground">رابط الخريطة (Google Maps)</label>
              <input
                type="url"
                value={linkLocation}
                onChange={(e) => setLinkLocation(e.target.value)}
                placeholder="https://maps.google.com/..."
                className="w-full px-3 py-2 rounded-lg border border-input bg-background dir-ltr text-left"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-border flex items-center justify-end gap-3">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg border border-input hover:bg-muted">
              إلغاء
            </button>
            <button type="submit" className="px-5 py-2 rounded-lg bg-primary text-primary-foreground font-bold flex items-center gap-2">
              <Check className="w-4 h-4" />
              حفظ بيانات الفرع
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
