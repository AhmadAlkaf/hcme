'use client';

import React, { useState, useEffect } from 'react';
import { X, Check, Image as ImageIcon, Award, Layers, Star, Plus, Trash } from 'lucide-react';
import {
  SliderSlide,
  CmsAgency,
  CmsService,
  CmsTestimonial
} from '@/types';
import { ApiGoal, ApiPublicService } from '@/types/api';

// --- Modal 1: Hero Slider Modal ---
interface SliderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (slide: Partial<SliderSlide>) => void;
  initialData?: SliderSlide | null;
}

export const SliderModal: React.FC<SliderModalProps> = ({ isOpen, onClose, onSave, initialData }) => {
  const [formData, setFormData] = useState({
    badge: '⚡ شريحة جديدة',
    title: '',
    subtitle: '',
    ctaText: 'استكشف الآن',
    ctaLink: '#products',
    image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&auto=format&fit=crop&q=80',
    isActive: true,
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        badge: initialData.badge,
        title: initialData.title,
        subtitle: initialData.subtitle,
        ctaText: initialData.ctaText,
        ctaLink: initialData.ctaLink,
        image: initialData.image,
        isActive: initialData.isActive,
      });
    } else {
      setFormData({
        badge: '⚡ شريحة ترويجية جديدة',
        title: '',
        subtitle: '',
        ctaText: 'استكشف منتجاتنا',
        ctaLink: '#products',
        image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&auto=format&fit=crop&q=80',
        isActive: true,
      });
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-card text-card-foreground border border-border w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="px-6 py-4 bg-primary/10 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary text-primary-foreground">
              <ImageIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground">
                {initialData ? 'تعديل شريحة السلايدر' : 'إضافة شريحة بنر جديدة'}
              </h3>
              <p className="text-xs text-muted-foreground">تعديل بنرات العرض الرئيسية في واجهة الموقع</p>
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
            <label className="block mb-1 font-semibold text-foreground">العنوان الرئيسي للشريحة *</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="مثال: حلول وتجهيزات كهربائية متكاملة"
              className="w-full px-3 py-2 rounded-lg border border-input bg-background"
            />
          </div>

          <div>
            <label className="block mb-1 font-semibold text-foreground">الشارة العلوي (Badge)</label>
            <input
              type="text"
              value={formData.badge}
              onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-input bg-background"
            />
          </div>

          <div>
            <label className="block mb-1 font-semibold text-foreground">الوصف الفرعي للشريحة</label>
            <textarea
              rows={2}
              value={formData.subtitle}
              onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
              placeholder="نص توضيحي للعرض الترويجي..."
              className="w-full px-3 py-2 rounded-lg border border-input bg-background resize-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block mb-1 font-semibold text-foreground">نص زر الإجراء (CTA Text)</label>
              <input
                type="text"
                value={formData.ctaText}
                onChange={(e) => setFormData({ ...formData, ctaText: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-input bg-background"
              />
            </div>
            <div>
              <label className="block mb-1 font-semibold text-foreground">رابط الزر (URL Link)</label>
              <input
                type="text"
                value={formData.ctaLink}
                onChange={(e) => setFormData({ ...formData, ctaLink: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-input bg-background"
              />
            </div>
          </div>

          <div>
            <label className="block mb-1 font-semibold text-foreground">رابط صورة البنر خلفية (Image URL)</label>
            <input
              type="url"
              value={formData.image}
              onChange={(e) => setFormData({ ...formData, image: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-input bg-background"
            />
          </div>

          <div className="pt-2">
            <label className="inline-flex items-center gap-2 cursor-pointer text-foreground">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="w-4 h-4 rounded text-primary focus:ring-primary border-input"
              />
              <span>تفعيل الشريحة للعرض في السلايدر الآن</span>
            </label>
          </div>

          <div className="pt-4 border-t border-border flex items-center justify-end gap-3">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg border border-input hover:bg-muted">
              إلغاء
            </button>
            <button type="submit" className="px-5 py-2 rounded-lg bg-primary text-primary-foreground font-bold flex items-center gap-2">
              <Check className="w-4 h-4" />
              حفظ الشريحة
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// --- Modal 2: Goal Modal ---
interface GoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (goal: { name_ar: string; name_en: string }) => void;
  initialData?: ApiGoal | null;
}

export const GoalModal: React.FC<GoalModalProps> = ({ isOpen, onClose, onSave, initialData }) => {
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
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground">
                {initialData ? 'تعديل الهدف' : 'إضافة هدف جديد'}
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
            <label className="block mb-1 font-semibold text-foreground">الهدف باللغة العربية *</label>
            <textarea
              required
              rows={3}
              value={formData.name_ar}
              onChange={(e) => setFormData({ ...formData, name_ar: e.target.value })}
              placeholder="اكتب الهدف باللغة العربية هنا..."
              className="w-full px-3 py-2 rounded-lg border border-input bg-background resize-none"
            />
          </div>

          <div>
            <label className="block mb-1 font-semibold text-foreground">الهدف باللغة الإنجليزية *</label>
            <textarea
              required
              rows={3}
              value={formData.name_en}
              onChange={(e) => setFormData({ ...formData, name_en: e.target.value })}
              placeholder="Write the goal in English here..."
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

// --- Modal 3: Agency Modal ---
interface AgencyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (agency: Partial<CmsAgency>) => void;
  initialData?: CmsAgency | null;
}

export const AgencyModal: React.FC<AgencyModalProps> = ({ isOpen, onClose, onSave, initialData }) => {
  const [formData, setFormData] = useState({
    name: '',
    nameEn: '',
    logo: '⚡',
    description: '',
    isFeatured: true,
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name,
        nameEn: initialData.nameEn,
        logo: initialData.logo,
        description: initialData.description,
        isFeatured: initialData.isFeatured,
      });
    } else {
      setFormData({
        name: '',
        nameEn: '',
        logo: '⚡',
        description: '',
        isFeatured: true,
      });
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-card text-card-foreground border border-border w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="px-6 py-4 bg-primary/10 border-b border-border flex items-center justify-between">
          <h3 className="text-lg font-bold text-foreground">
            {initialData ? 'تعديل بيانات الوكالة' : 'إضافة وكالة جديدة'}
          </h3>
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block mb-1 font-semibold text-foreground">الاسم بالعربية *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="شنايدر إلكتريك"
                className="w-full px-3 py-2 rounded-lg border border-input bg-background"
              />
            </div>
            <div>
              <label className="block mb-1 font-semibold text-foreground">الاسم بالإنجليزية</label>
              <input
                type="text"
                value={formData.nameEn}
                onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
                placeholder="Schneider Electric"
                className="w-full px-3 py-2 rounded-lg border border-input bg-background dir-ltr text-right"
              />
            </div>
          </div>

          <div>
            <label className="block mb-1 font-semibold text-foreground">شعار الوكالة (Emoji / Icon)</label>
            <input
              type="text"
              value={formData.logo}
              onChange={(e) => setFormData({ ...formData, logo: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-input bg-background"
            />
          </div>

          <div>
            <label className="block mb-1 font-semibold text-foreground">الوصف التوضيحي للعلامة</label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-input bg-background resize-none"
            />
          </div>

          <div className="pt-2">
            <label className="inline-flex items-center gap-2 cursor-pointer text-foreground">
              <input
                type="checkbox"
                checked={formData.isFeatured}
                onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                className="w-4 h-4 rounded text-primary focus:ring-primary border-input"
              />
              <span>عرض كعلامة بارزة ومفضلة بمقدمة الموقع</span>
            </label>
          </div>

          <div className="pt-4 border-t border-border flex items-center justify-end gap-3">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg border border-input hover:bg-muted">
              إلغاء
            </button>
            <button type="submit" className="px-5 py-2 rounded-lg bg-primary text-primary-foreground font-bold flex items-center gap-2">
              <Check className="w-4 h-4" />
              حفظ الوكالة
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// --- Modal 4: Service Modal ---
interface ServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (service: Partial<CmsService>) => void;
  initialData?: CmsService | null;
}

export const ServiceModal: React.FC<ServiceModalProps> = ({ isOpen, onClose, onSave, initialData }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    icon: '⚡',
    featuresText: 'ميزة 1, ميزة 2, ميزة 3',
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title,
        description: initialData.description,
        icon: initialData.icon,
        featuresText: initialData.features ? initialData.features.join(', ') : '',
      });
    } else {
      setFormData({
        title: '',
        description: '',
        icon: '⚡',
        featuresText: 'توريد سريع, ضمان أصلية, تركيب ميداني',
      });
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-card text-card-foreground border border-border w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="px-6 py-4 bg-primary/10 border-b border-border flex items-center justify-between">
          <h3 className="text-lg font-bold text-foreground">
            {initialData ? 'تعديل بيانات الخدمة' : 'إضافة خدمة جديدة'}
          </h3>
          <button onClick={onClose} className="p-2 rounded-lg text-muted-foreground hover:bg-muted">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            const features = formData.featuresText
              .split(',')
              .map((f) => f.trim())
              .filter(Boolean);
            onSave({
              title: formData.title,
              description: formData.description,
              icon: formData.icon,
              features,
            });
            onClose();
          }}
          className="p-6 overflow-y-auto space-y-4 text-sm"
        >
          <div>
            <label className="block mb-1 font-semibold text-foreground">عنوان الخدمة *</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="مثال: أنظمة الطاقة الشمسية"
              className="w-full px-3 py-2 rounded-lg border border-input bg-background"
            />
          </div>

          <div>
            <label className="block mb-1 font-semibold text-foreground">الأيقونة</label>
            <input
              type="text"
              value={formData.icon}
              onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-input bg-background"
            />
          </div>

          <div>
            <label className="block mb-1 font-semibold text-foreground">شرح الخدمة التفصيلي</label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-input bg-background resize-none"
            />
          </div>

          <div>
            <label className="block mb-1 font-semibold text-foreground">نقاط وميزات الخدمة (مفصولة بفواصل ,)</label>
            <input
              type="text"
              value={formData.featuresText}
              onChange={(e) => setFormData({ ...formData, featuresText: e.target.value })}
              placeholder="ألواح شمسية, محولات هجينة, بطاريات"
              className="w-full px-3 py-2 rounded-lg border border-input bg-background"
            />
          </div>

          <div className="pt-4 border-t border-border flex items-center justify-end gap-3">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg border border-input hover:bg-muted">
              إلغاء
            </button>
            <button type="submit" className="px-5 py-2 rounded-lg bg-primary text-primary-foreground font-bold flex items-center gap-2">
              <Check className="w-4 h-4" />
              حفظ الخدمة
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// --- Modal 5: Testimonial Modal ---
interface TestimonialModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (testimonial: Partial<CmsTestimonial>) => void;
  initialData?: CmsTestimonial | null;
}

export const TestimonialModal: React.FC<TestimonialModalProps> = ({ isOpen, onClose, onSave, initialData }) => {
  const [formData, setFormData] = useState({
    name: '',
    role: 'عميل مميز',
    company: 'مؤسسة إعمار',
    rating: 5,
    text: '',
    date: new Date().toISOString().split('T')[0],
    avatar: '👤',
    isApproved: true,
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name,
        role: initialData.role,
        company: initialData.company,
        rating: initialData.rating,
        text: initialData.text,
        date: initialData.date,
        avatar: initialData.avatar,
        isApproved: initialData.isApproved,
      });
    } else {
      setFormData({
        name: '',
        role: 'عميل مميز',
        company: 'مؤسسة إعمار',
        rating: 5,
        text: '',
        date: new Date().toISOString().split('T')[0],
        avatar: '👤',
        isApproved: true,
      });
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-card text-card-foreground border border-border w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="px-6 py-4 bg-primary/10 border-b border-border flex items-center justify-between">
          <h3 className="text-lg font-bold text-foreground">
            {initialData ? 'تعديل التقييم' : 'إضافة تقييم عميل جديد'}
          </h3>
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
            <label className="block mb-1 font-semibold text-foreground">اسم العميل *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="مثال: المهندس أحمد باعباد"
              className="w-full px-3 py-2 rounded-lg border border-input bg-background"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block mb-1 font-semibold text-foreground">الصفة / المنصب</label>
              <input
                type="text"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-input bg-background"
              />
            </div>
            <div>
              <label className="block mb-1 font-semibold text-foreground">الشركة / الجهة</label>
              <input
                type="text"
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-input bg-background"
              />
            </div>
          </div>

          <div>
            <label className="block mb-1 font-semibold text-foreground">التقييم بالنجوم (1 إلى 5)</label>
            <select
              value={formData.rating}
              onChange={(e) => setFormData({ ...formData, rating: Number(e.target.value) })}
              className="w-full px-3 py-2 rounded-lg border border-input bg-background"
            >
              <option value={5}>⭐⭐⭐⭐⭐ (5 نجوم - ممتاز جداً)</option>
              <option value={4}>⭐⭐⭐⭐ (4 نجوم - جبار)</option>
              <option value={3}>⭐⭐⭐ (3 نجوم - جيد)</option>
            </select>
          </div>

          <div>
            <label className="block mb-1 font-semibold text-foreground">نص التقييم والمراجعة *</label>
            <textarea
              rows={3}
              required
              value={formData.text}
              onChange={(e) => setFormData({ ...formData, text: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-input bg-background resize-none"
            />
          </div>

          <div className="pt-2">
            <label className="inline-flex items-center gap-2 cursor-pointer text-foreground">
              <input
                type="checkbox"
                checked={formData.isApproved}
                onChange={(e) => setFormData({ ...formData, isApproved: e.target.checked })}
                className="w-4 h-4 rounded text-primary focus:ring-primary border-input"
              />
              <span>تعتمد هذه التوصية وتظهر في الموقع الرئيسي فوراً</span>
            </label>
          </div>

          <div className="pt-4 border-t border-border flex items-center justify-end gap-3">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg border border-input hover:bg-muted">
              إلغاء
            </button>
            <button type="submit" className="px-5 py-2 rounded-lg bg-primary text-primary-foreground font-bold flex items-center gap-2">
              <Check className="w-4 h-4" />
              حفظ التقييم
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
