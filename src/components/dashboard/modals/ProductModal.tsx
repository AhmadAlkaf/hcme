'use client';

import React, { useState, useEffect } from 'react';
import { X, Check, Package, Upload, Plus, Trash2 } from 'lucide-react';
import { ApiProduct, ApiAgent, ApiProductImage, ApiProductUnit, ApiDepartment } from '@/types/api';
import { getImageUrl } from '@/lib/utils';
import { getAgentsServerAction, getAllDepartmentsServerAction } from '@/actions/products.actions';
import { groupDepartmentsByAgent, normalizeDepartmentRef } from '@/lib/products';

export interface NewUnitInput {
  name_unit_ar: string;
  name_unit_en: string;
  price: string;
  is_active: boolean;
}

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (
    formData: FormData,
    newSubImages: File[],
    deletedSubImageIds: number[],
    newUnits: NewUnitInput[],
    deletedUnitIds: number[]
  ) => void;
  initialData?: ApiProduct | null;
  agents?: ApiAgent[];
}

export const ProductModal: React.FC<ProductModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  agents = []
}) => {
  const [localAgents, setLocalAgents] = useState<ApiAgent[]>(agents || []);
  const [departments, setDepartments] = useState<ApiDepartment[]>([]);
  const [formData, setFormData] = useState({
    name_product_ar: '',
    name_product_en: '',
    number_group: '',
    number_product: '',
    department: '',
    description_product_ar: '',
    description_product_en: '',
    is_active: true,
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Sub-images (Gallery) state
  const [existingSubImages, setExistingSubImages] = useState<ApiProductImage[]>([]);
  const [deletedSubImageIds, setDeletedSubImageIds] = useState<number[]>([]);
  const [newSubImageFiles, setNewSubImageFiles] = useState<{ file: File; preview: string }[]>([]);

  // Product Units state
  const [existingUnits, setExistingUnits] = useState<ApiProductUnit[]>([]);
  const [deletedUnitIds, setDeletedUnitIds] = useState<number[]>([]);
  const [newUnits, setNewUnits] = useState<NewUnitInput[]>([]);
  const [unitInput, setUnitInput] = useState<NewUnitInput>({
    name_unit_ar: '',
    name_unit_en: '',
    price: '',
    is_active: true,
  });

  // Departments own the agent now, so the form picks a department and the agent
  // follows from it. Agents are still needed, but only to label the optgroups.
  useEffect(() => {
    if (agents && agents.length > 0) {
      setLocalAgents(agents);
    } else if (isOpen) {
      // `getAgentsServerAction` sends `?pagination=false`, so every agent is
      // available rather than just the first 15.
      getAgentsServerAction().then((res) => {
        if (res && res.length > 0) {
          setLocalAgents(res);
        }
      });
    }
  }, [agents, isOpen]);

  // `?pagination=false` for the same reason: a dropdown capped at the first
  // page would hide valid departments.
  useEffect(() => {
    if (!isOpen) return;
    let cancelled = false;
    getAllDepartmentsServerAction().then((res) => {
      if (!cancelled) setDepartments(res || []);
    });
    return () => {
      cancelled = true;
    };
  }, [isOpen]);

  useEffect(() => {
    if (initialData) {
      setFormData({
        name_product_ar: initialData.name_product_ar || '',
        name_product_en: initialData.name_product_en || '',
        number_group: initialData.number_group || '',
        number_product: initialData.number_product || '',
        department: normalizeDepartmentRef(initialData.department)?.toString() || '',
        description_product_ar: initialData.description_product_ar || '',
        description_product_en: initialData.description_product_en || '',
        is_active: initialData.is_active,
      });
      setImageFile(null);
      setImagePreview(getImageUrl(initialData.image));
      setExistingSubImages(initialData.product_images || []);
      setDeletedSubImageIds([]);
      setNewSubImageFiles([]);

      setExistingUnits(initialData.name_uint || []);
      setDeletedUnitIds([]);
      setNewUnits([]);
      setUnitInput({ name_unit_ar: '', name_unit_en: '', price: '', is_active: true });
    } else {
      setFormData({
        name_product_ar: '',
        name_product_en: '',
        number_group: '',
        number_product: '',
        department: '',
        description_product_ar: '',
        description_product_en: '',
        is_active: true,
      });
      setImageFile(null);
      setImagePreview(null);
      setExistingSubImages([]);
      setDeletedSubImageIds([]);
      setNewSubImageFiles([]);

      setExistingUnits([]);
      setDeletedUnitIds([]);
      setNewUnits([]);
      setUnitInput({ name_unit_ar: '', name_unit_en: '', price: '', is_active: true });
    }
  }, [initialData, isOpen, localAgents]);

  if (!isOpen) return null;

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleNewSubImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      const items = files.map((file) => ({
        file,
        preview: URL.createObjectURL(file),
      }));
      setNewSubImageFiles((prev) => [...prev, ...items]);
    }
  };

  const removeNewSubImage = (index: number) => {
    setNewSubImageFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const removeExistingSubImage = (id: number) => {
    setExistingSubImages((prev) => prev.filter((img) => img.id !== id));
    setDeletedSubImageIds((prev) => [...prev, id]);
  };

  const handleAddUnitInline = () => {
    if (!unitInput.name_unit_ar.trim()) {
      alert('يرجى كتابة اسم الوحدة بالعربية');
      return;
    }
    if (!unitInput.price.trim()) {
      alert('يرجى تحديد سعر الوحدة');
      return;
    }
    setNewUnits((prev) => [...prev, { ...unitInput }]);
    setUnitInput({ name_unit_ar: '', name_unit_en: '', price: '', is_active: true });
  };

  const removeNewUnit = (index: number) => {
    setNewUnits((prev) => prev.filter((_, i) => i !== index));
  };

  const removeExistingUnit = (id: number) => {
    setExistingUnits((prev) => prev.filter((u) => u.id !== id));
    setDeletedUnitIds((prev) => [...prev, id]);
  };

  // Departments are listed under their owning agent so a long list stays
  // scannable, and a department with no agent gets its own group.
  const departmentGroups = Array.from(groupDepartmentsByAgent(departments));
  const agentLabel = (agentId: number | null) => {
    if (agentId === null) return 'بدون وكيل';
    const agent = localAgents.find((a) => a.id === agentId);
    return agent?.name_ar || agent?.name_en || `وكيل #${agentId}`;
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6">
      <div className="bg-card text-card-foreground border border-border w-full max-w-5xl lg:max-w-6xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95">
        <div className="px-6 py-4 bg-primary/10 border-b border-border flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary text-primary-foreground">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground">
                {initialData ? 'تعديل بيانات المنتج' : 'إضافة منتج جديد'}
              </h3>
              <p className="text-xs text-muted-foreground mt-1">قم بإدخال واستكمال بيانات المنتج والأسعار والوسائط</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg text-muted-foreground hover:bg-muted transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            const data = new FormData();
            data.append('name_product_ar', formData.name_product_ar);
            data.append('name_product_en', formData.name_product_en);
            data.append('number_group', formData.number_group);
            data.append('number_product', formData.number_product);
            data.append('is_active', String(formData.is_active));
            data.append('description_product_ar', formData.description_product_ar);
            data.append('description_product_en', formData.description_product_en);
            if (formData.department) {
              data.append('department', formData.department);
            }
            if (imageFile) {
              data.append('image', imageFile);
            }
            onSave(
              data,
              newSubImageFiles.map((item) => item.file),
              deletedSubImageIds,
              newUnits,
              deletedUnitIds
            );
            onClose();
          }}
          className="p-6 sm:p-8 overflow-y-auto space-y-6 text-xs sm:text-sm flex-1"
        >
          {/* Section 1: Basic Information */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary" />
              <h4 className="font-bold text-xs text-primary uppercase tracking-wider">البيانات الأساسية</h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block mb-1.5 font-bold text-foreground">اسم المنتج (العربية) *</label>
                <input
                  type="text"
                  required
                  value={formData.name_product_ar}
                  onChange={(e) => setFormData({ ...formData, name_product_ar: e.target.value })}
                  placeholder="اسم المنتج"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-input bg-background/50 font-bold focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block mb-1.5 font-bold text-foreground">اسم المنتج (الإنجليزية)</label>
                <input
                  type="text"
                  value={formData.name_product_en}
                  onChange={(e) => setFormData({ ...formData, name_product_en: e.target.value })}
                  placeholder="Product Name"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-input bg-background/50 font-bold focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block mb-1.5 font-bold text-foreground">القسم *</label>
                <select
                  value={formData.department}
                  required
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-input bg-background/50 font-bold focus:ring-2 focus:ring-primary text-xs"
                >
                  <option value="">اختر القسم</option>
                  {departmentGroups.map(([agentId, items]) => (
                    <optgroup
                      key={agentId ?? 'no-agent'}
                      label={agentLabel(agentId)}
                    >
                      {items.map((dept) => (
                        <option key={dept.id} value={dept.id}>
                          {dept.name_ar || dept.name_en}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
                {departments.length === 0 ? (
                  <p className="mt-1.5 text-[11px] text-amber-600 font-bold">
                    لا توجد أقسام بعد — أضف قسماً من صفحة «الأقسام» أولاً.
                  </p>
                ) : (
                  <p className="mt-1.5 text-[11px] text-muted-foreground">
                    الوكيل يُحدَّد تلقائياً من القسم المختار.
                  </p>
                )}
              </div>

              <div>
                <label className="block mb-1.5 font-bold text-foreground">رقم المجموعة *</label>
                <input
                  type="text"
                  required
                  value={formData.number_group}
                  onChange={(e) => setFormData({ ...formData, number_group: e.target.value })}
                  placeholder="رقم المجموعة"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-input bg-background/50 font-bold focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block mb-1.5 font-bold text-foreground">رمز المنتج / الموديل *</label>
                <input
                  type="text"
                  required
                  value={formData.number_product}
                  onChange={(e) => setFormData({ ...formData, number_product: e.target.value })}
                  placeholder="رمز المنتج"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-input bg-background/50 font-bold focus:ring-2 focus:ring-primary"
                />
              </div>
              <div className="flex items-center pt-6">
                <label className="flex items-center gap-2.5 cursor-pointer font-bold text-foreground bg-muted/30 px-3.5 py-2.5 rounded-xl border border-border/60 w-full">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="w-4 h-4 rounded text-primary focus:ring-primary"
                  />
                  <span>منتج نشط للمستخدمين</span>
                </label>
              </div>
            </div>
          </div>

          {/* Section 2: Product Images */}
          <div className="space-y-4 pt-4 border-t border-border">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary" />
              <h4 className="font-bold text-xs text-primary uppercase tracking-wider">صور المنتج والمعرض</h4>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div>
                <label className="block mb-1.5 font-bold text-foreground">الصورة الرئيسية *</label>
                <div className="flex items-center gap-4">
                  {imagePreview && (
                    <div className="relative w-20 h-20 rounded-2xl overflow-hidden border border-border bg-muted shrink-0 shadow-sm">
                      <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                  <label className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-input hover:border-primary rounded-2xl p-4 cursor-pointer transition-colors text-center text-xs font-bold text-muted-foreground bg-background/30 hover:bg-primary/5">
                    <Upload className="w-5 h-5 mb-1 text-primary" />
                    <span>اختر الصورة الرئيسية</span>
                    <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                  </label>
                </div>
              </div>

              <div>
                <label className="block mb-1.5 font-bold text-foreground">الصور الفرعية (المعرض)</label>
                <div className="space-y-3">
                  {(existingSubImages.length > 0 || newSubImageFiles.length > 0) && (
                    <div className="flex flex-wrap gap-2.5 p-3 rounded-2xl bg-muted/40 border border-border/80 max-h-28 overflow-y-auto">
                      {existingSubImages.map((img) => (
                        <div key={`existing-${img.id}`} className="relative w-14 h-14 rounded-xl overflow-hidden border border-border group shrink-0">
                          <img src={getImageUrl(img.image)} alt="Sub image" className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => removeExistingSubImage(img.id)}
                            className="absolute top-1 right-1 p-1 rounded-full bg-rose-500/90 text-white opacity-90 sm:opacity-0 group-hover:opacity-100 transition-opacity hover:bg-rose-600"
                            title="حذف الصورة"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                      {newSubImageFiles.map((item, idx) => (
                        <div key={`new-${idx}`} className="relative w-14 h-14 rounded-xl overflow-hidden border border-primary/40 group shrink-0">
                          <img src={item.preview} alt="New sub image" className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => removeNewSubImage(idx)}
                            className="absolute top-1 right-1 p-1 rounded-full bg-rose-500/90 text-white opacity-90 sm:opacity-0 group-hover:opacity-100 transition-opacity hover:bg-rose-600"
                            title="إزالة الصورة"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <label className="flex items-center justify-center gap-2 border border-dashed border-input hover:border-primary rounded-xl p-3 cursor-pointer transition-colors text-center text-xs font-bold text-primary bg-primary/5 hover:bg-primary/10">
                    <Upload className="w-4 h-4" />
                    <span>إضافة صور فرعية</span>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleNewSubImagesChange}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Units & Pricing */}
          <div className="space-y-3 pt-4 border-t border-border">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-primary" />
                <h4 className="font-bold text-xs text-primary uppercase tracking-wider">وحدات القياس والأسعار</h4>
              </div>
              <span className="text-xs font-bold text-muted-foreground">
                ({existingUnits.length + newUnits.length} وحدة مضافة)
              </span>
            </div>

            {(existingUnits.length > 0 || newUnits.length > 0) && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 max-h-40 overflow-y-auto p-3 rounded-2xl bg-muted/40 border border-border/80">
                {existingUnits.map((u) => (
                  <div
                    key={`unit-exist-${u.id}`}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-background border border-border/80 text-xs font-bold"
                  >
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-lg bg-primary/10 text-primary font-black">
                        {u.name_unit_ar || u.name_unit_en}
                      </span>
                      <span className="text-foreground">
                        {parseFloat(u.price || '0').toLocaleString()} ر.ي
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeExistingUnit(u.id)}
                      className="p-1 rounded-lg text-rose-500 hover:bg-rose-500/10 transition-colors"
                      title="حذف الوحدة"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}

                {newUnits.map((u, idx) => (
                  <div
                    key={`unit-new-${idx}`}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-background border border-primary/30 text-xs font-bold"
                  >
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-lg bg-emerald-500/10 text-emerald-600 font-black">
                        {u.name_unit_ar} {u.name_unit_en ? `(${u.name_unit_en})` : ''}
                      </span>
                      <span className="text-foreground">
                        {parseFloat(u.price || '0').toLocaleString()} ر.ي
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeNewUnit(idx)}
                      className="p-1 rounded-lg text-rose-500 hover:bg-rose-500/10 transition-colors"
                      title="إزالة الوحدة"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="p-3 rounded-2xl bg-background/60 border border-border/80 space-y-2.5">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <input
                  type="text"
                  value={unitInput.name_unit_ar}
                  onChange={(e) => setUnitInput({ ...unitInput, name_unit_ar: e.target.value })}
                  placeholder="اسم الوحدة"
                  className="w-full px-3.5 py-2 rounded-xl border border-input text-xs font-bold focus:ring-2 focus:ring-primary"
                />
                <input
                  type="text"
                  value={unitInput.name_unit_en}
                  onChange={(e) => setUnitInput({ ...unitInput, name_unit_en: e.target.value })}
                  placeholder="Unit Name"
                  className="w-full px-3.5 py-2 rounded-xl border border-input text-xs font-bold focus:ring-2 focus:ring-primary"
                />
                <input
                  type="number"
                  value={unitInput.price}
                  onChange={(e) => setUnitInput({ ...unitInput, price: e.target.value })}
                  placeholder="السعر"
                  className="w-full px-3.5 py-2 rounded-xl border border-input text-xs font-bold focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground cursor-pointer">
                  <input
                    type="checkbox"
                    checked={unitInput.is_active}
                    onChange={(e) => setUnitInput({ ...unitInput, is_active: e.target.checked })}
                    className="w-3.5 h-3.5 rounded text-primary focus:ring-primary"
                  />
                  <span>وحدة نشطة</span>
                </label>

                <button
                  type="button"
                  onClick={handleAddUnitInline}
                  className="px-4 py-1.5 rounded-xl bg-primary/10 hover:bg-primary text-primary hover:text-primary-foreground text-xs font-extrabold transition-all flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  إضافة الوحدة
                </button>
              </div>
            </div>
          </div>

          {/* Section 4: Specifications & Descriptions */}
          <div className="space-y-4 pt-4 border-t border-border">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary" />
              <h4 className="font-bold text-xs text-primary uppercase tracking-wider">الوصف والمواصفات</h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block mb-1.5 font-bold text-foreground">الوصف (العربية)</label>
                <textarea
                  rows={3}
                  value={formData.description_product_ar}
                  onChange={(e) => setFormData({ ...formData, description_product_ar: e.target.value })}
                  placeholder="الوصف بالعربية"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-input bg-background/50 resize-none text-xs focus:ring-2 focus:ring-primary font-medium"
                />
              </div>
              <div>
                <label className="block mb-1.5 font-bold text-foreground">الوصف (الإنجليزية)</label>
                <textarea
                  rows={3}
                  value={formData.description_product_en}
                  onChange={(e) => setFormData({ ...formData, description_product_en: e.target.value })}
                  placeholder="English description"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-input bg-background/50 resize-none text-xs focus:ring-2 focus:ring-primary font-medium"
                />
              </div>
            </div>
          </div>

          {/* Form Actions Footer */}
          <div className="pt-4 border-t border-border flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-input hover:bg-muted text-xs font-bold transition-colors"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-primary text-primary-foreground font-extrabold text-xs flex items-center gap-2 shadow-lg shadow-primary/20 hover:opacity-90 transition-opacity"
            >
              <Check className="w-4 h-4" />
              حفظ
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
