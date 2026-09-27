'use client';

import React, { useState, useEffect } from 'react';
import { X, Check, FolderPlus, Upload, Video } from 'lucide-react';
import { ApiProject, ApiAgent, ApiProjectImage } from '@/types/api';
import { getImageUrl } from '@/lib/utils';
import { getAgentsServerAction } from '@/actions/products.actions';

interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (
    formData: FormData,
    newSubImages: File[],
    deletedSubImageIds: number[]
  ) => void;
  initialData?: ApiProject | null;
  agents?: ApiAgent[];
}

export const ProjectModal: React.FC<ProjectModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  agents = []
}) => {
  const [localAgents, setLocalAgents] = useState<ApiAgent[]>(agents || []);
  const [formData, setFormData] = useState({
    name_ar: '',
    name_en: '',
    short_description_ar: '',
    short_description_en: '',
    description_ar: '',
    description_en: '',
    location_ar: '',
    location_en: '',
    commit_owner_ar: '',
    commit_owner_en: '',
    name_owner_ar: '',
    name_owner_en: '',
    attribute_ar: '',
    attribute_en: '',
    start: '',
    completed: '',
    video_files: '',
    agent: '',
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);

  // Sub-images (Gallery) state
  const [existingSubImages, setExistingSubImages] = useState<ApiProjectImage[]>([]);
  const [deletedSubImageIds, setDeletedSubImageIds] = useState<number[]>([]);
  const [newSubImageFiles, setNewSubImageFiles] = useState<{ file: File; preview: string }[]>([]);

  // Sync or fetch agents list
  useEffect(() => {
    if (agents && agents.length > 0) {
      setLocalAgents(agents);
    } else if (isOpen) {
      // `getAgentsServerAction` sends `?pagination=false`, so every agent is
      // available in the dropdown rather than just the first 15.
      getAgentsServerAction().then((res) => {
        if (res && res.length > 0) {
          setLocalAgents(res);
        }
      });
    }
  }, [agents, isOpen]);

  // Set default agent selection when localAgents are loaded
  useEffect(() => {
    if (!initialData && localAgents.length > 0 && !formData.agent) {
      setFormData((prev) => ({
        ...prev,
        agent: String(localAgents[0].id),
      }));
    }
  }, [localAgents, initialData, formData.agent]);

  useEffect(() => {
    if (initialData) {
      setFormData({
        name_ar: initialData.name_ar || '',
        name_en: initialData.name_en || '',
        short_description_ar: initialData.short_description_ar || '',
        short_description_en: initialData.short_description_en || '',
        description_ar: initialData.description_ar || '',
        description_en: initialData.description_en || '',
        location_ar: initialData.location_ar || '',
        location_en: initialData.location_en || '',
        commit_owner_ar: initialData.commit_owner_ar || '',
        commit_owner_en: initialData.commit_owner_en || '',
        name_owner_ar: initialData.name_owner_ar || '',
        name_owner_en: initialData.name_owner_en || '',
        attribute_ar: initialData.attribute_ar || '',
        attribute_en: initialData.attribute_en || '',
        start: initialData.start || '',
        completed: initialData.completed || '',
        video_files: initialData.video_files || '',
        agent: initialData.agent ? String(initialData.agent) : '',
      });
      setImageFile(null);
      setImagePreview(getImageUrl(initialData.image));
      setVideoFile(null);
      setVideoPreview(initialData.video_files ? getImageUrl(initialData.video_files) : null);
      setExistingSubImages(initialData.project_images || []);
      setDeletedSubImageIds([]);
      setNewSubImageFiles([]);
    } else {
      setFormData({
        name_ar: '',
        name_en: '',
        short_description_ar: '',
        short_description_en: '',
        description_ar: '',
        description_en: '',
        location_ar: '',
        location_en: '',
        commit_owner_ar: '',
        commit_owner_en: '',
        name_owner_ar: '',
        name_owner_en: '',
        attribute_ar: '',
        attribute_en: '',
        start: '',
        completed: '',
        video_files: '',
        agent: localAgents[0] ? String(localAgents[0].id) : '',
      });
      setImageFile(null);
      setImagePreview(null);
      setVideoFile(null);
      setVideoPreview(null);
      setExistingSubImages([]);
      setDeletedSubImageIds([]);
      setNewSubImageFiles([]);
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

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setVideoFile(file);
      setVideoPreview(URL.createObjectURL(file));
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

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6">
      <div className="bg-card text-card-foreground border border-border w-full max-w-5xl lg:max-w-6xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95">
        <div className="px-6 py-4 bg-primary/10 border-b border-border flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary text-primary-foreground">
              <FolderPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground">
                {initialData ? 'تعديل بيانات المشروع' : 'إضافة مشروع جديد'}
              </h3>
              <p className="text-xs text-muted-foreground mt-1">قم بإدخال تفاصيل المشروع والعميل والتواريخ والوسائط</p>
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
            data.append('name_ar', formData.name_ar);
            data.append('name_en', formData.name_en);
            data.append('short_description_ar', formData.short_description_ar);
            data.append('short_description_en', formData.short_description_en);
            data.append('description_ar', formData.description_ar);
            data.append('description_en', formData.description_en);
            data.append('location_ar', formData.location_ar);
            data.append('location_en', formData.location_en);
            data.append('commit_owner_ar', formData.commit_owner_ar);
            data.append('commit_owner_en', formData.commit_owner_en);
            data.append('name_owner_ar', formData.name_owner_ar);
            data.append('name_owner_en', formData.name_owner_en);
            data.append('attribute_ar', formData.attribute_ar);
            data.append('attribute_en', formData.attribute_en);
            if (formData.start) data.append('start', formData.start);
            if (formData.completed) data.append('completed', formData.completed);
            if (videoFile) {
              data.append('video_files', videoFile);
            }
            if (formData.agent) data.append('agent', formData.agent);
            if (imageFile) data.append('image', imageFile);

            onSave(
              data,
              newSubImageFiles.map((item) => item.file),
              deletedSubImageIds
            );
            onClose();
          }}
          className="p-6 sm:p-8 overflow-y-auto space-y-6 text-xs sm:text-sm flex-1"
        >
          {/* Section 1: Basic Project Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary" />
              <h4 className="font-bold text-xs text-primary uppercase tracking-wider">بيانات المشروع والوكيل</h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block mb-1.5 font-bold text-foreground">اسم المشروع (العربية) *</label>
                <input
                  type="text"
                  required
                  value={formData.name_ar}
                  onChange={(e) => setFormData({ ...formData, name_ar: e.target.value })}
                  placeholder="اسم المشروع"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-input bg-background/50 font-bold focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block mb-1.5 font-bold text-foreground">اسم المشروع (الإنجليزية)</label>
                <input
                  type="text"
                  value={formData.name_en}
                  onChange={(e) => setFormData({ ...formData, name_en: e.target.value })}
                  placeholder="Project Name"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-input bg-background/50 font-bold focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block mb-1.5 font-bold text-foreground">الوكيل / العلامة التجارية *</label>
                <select
                  value={formData.agent}
                  required
                  onChange={(e) => setFormData({ ...formData, agent: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-input bg-background/50 font-bold focus:ring-2 focus:ring-primary text-xs"
                >
                  <option value="">اختر الوكيل</option>
                  {localAgents.map((agent) => (
                    <option key={agent.id} value={agent.id}>
                      {agent.name_ar || agent.name_en}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Owner & Location Details (Arabic & English) */}
          <div className="space-y-4 pt-4 border-t border-border">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary" />
              <h4 className="font-bold text-xs text-primary uppercase tracking-wider">بيانات العميل والموقع والتصنيف (العربية والإنجليزية)</h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block mb-1.5 font-bold text-foreground">اسم المالك (العربية)</label>
                <input
                  type="text"
                  value={formData.name_owner_ar}
                  onChange={(e) => setFormData({ ...formData, name_owner_ar: e.target.value })}
                  placeholder="اسم المالك"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-input bg-background/50 font-bold focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block mb-1.5 font-bold text-foreground">اسم المالك (الإنجليزية)</label>
                <input
                  type="text"
                  value={formData.name_owner_en}
                  onChange={(e) => setFormData({ ...formData, name_owner_en: e.target.value })}
                  placeholder="Owner Name"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-input bg-background/50 font-bold focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block mb-1.5 font-bold text-foreground">الموقع (العربية)</label>
                <input
                  type="text"
                  value={formData.location_ar}
                  onChange={(e) => setFormData({ ...formData, location_ar: e.target.value })}
                  placeholder="الموقع"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-input bg-background/50 font-bold focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block mb-1.5 font-bold text-foreground">الموقع (الإنجليزية)</label>
                <input
                  type="text"
                  value={formData.location_en}
                  onChange={(e) => setFormData({ ...formData, location_en: e.target.value })}
                  placeholder="Location"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-input bg-background/50 font-bold focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block mb-1.5 font-bold text-foreground">صفة المالك (العربية)</label>
                <input
                  type="text"
                  value={formData.commit_owner_ar}
                  onChange={(e) => setFormData({ ...formData, commit_owner_ar: e.target.value })}
                  placeholder="صفة المالك"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-input bg-background/50 font-bold focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block mb-1.5 font-bold text-foreground">صفة المالك (الإنجليزية)</label>
                <input
                  type="text"
                  value={formData.commit_owner_en}
                  onChange={(e) => setFormData({ ...formData, commit_owner_en: e.target.value })}
                  placeholder="Client Role"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-input bg-background/50 font-bold focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block mb-1.5 font-bold text-foreground">تصنيف المشروع (العربية)</label>
                <input
                  type="text"
                  value={formData.attribute_ar}
                  onChange={(e) => setFormData({ ...formData, attribute_ar: e.target.value })}
                  placeholder="تصنيف المشروع"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-input bg-background/50 font-bold focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block mb-1.5 font-bold text-foreground">تصنيف المشروع (الإنجليزية)</label>
                <input
                  type="text"
                  value={formData.attribute_en}
                  onChange={(e) => setFormData({ ...formData, attribute_en: e.target.value })}
                  placeholder="Project Attribute"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-input bg-background/50 font-bold focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Dates & Media */}
          <div className="space-y-4 pt-4 border-t border-border">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary" />
              <h4 className="font-bold text-xs text-primary uppercase tracking-wider">التواريخ والوسائط</h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block mb-1.5 font-bold text-foreground">تاريخ البدء</label>
                <input
                  type="date"
                  value={formData.start}
                  onChange={(e) => setFormData({ ...formData, start: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-input bg-background/50 font-bold focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block mb-1.5 font-bold text-foreground">تاريخ الانتهاء</label>
                <input
                  type="date"
                  value={formData.completed}
                  onChange={(e) => setFormData({ ...formData, completed: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-input bg-background/50 font-bold focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block mb-1.5 font-bold text-foreground">الصورة الرئيسية للمشروع *</label>
                <div className="flex items-center gap-4">
                  {imagePreview && (
                    <div className="relative w-20 h-20 rounded-2xl overflow-hidden border border-border bg-muted shrink-0 shadow-sm">
                      <img src={imagePreview} alt="Project Main Preview" className="w-full h-full object-cover" />
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
                <label className="block mb-1.5 font-bold text-foreground">فيديو المشروع</label>
                <div className="flex items-center gap-4">
                  {videoPreview && (
                    <div className="relative w-20 h-20 rounded-2xl overflow-hidden border border-border bg-black shrink-0 shadow-sm flex items-center justify-center">
                      <video src={videoPreview} className="w-full h-full object-cover" />
                    </div>
                  )}
                  <label className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-input hover:border-primary rounded-2xl p-4 cursor-pointer transition-colors text-center text-xs font-bold text-muted-foreground bg-background/30 hover:bg-primary/5">
                    <Video className="w-5 h-5 mb-1 text-primary" />
                    <span className="truncate max-w-[180px]">{videoFile ? videoFile.name : (initialData?.video_files ? 'تغيير الفيديو' : 'اختر ملف الفيديو')}</span>
                    <input type="file" accept="video/*" onChange={handleVideoChange} className="hidden" />
                  </label>
                </div>
              </div>

              <div className="md:col-span-2">
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

          {/* Section 4: Descriptions (Arabic & English) */}
          <div className="space-y-4 pt-4 border-t border-border">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary" />
              <h4 className="font-bold text-xs text-primary uppercase tracking-wider">وصف وملخص المشروع (العربية والإنجليزية)</h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block mb-1.5 font-bold text-foreground">الوصف القصير (العربية)</label>
                <textarea
                  rows={2}
                  value={formData.short_description_ar}
                  onChange={(e) => setFormData({ ...formData, short_description_ar: e.target.value })}
                  placeholder="الوصف القصير"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-input bg-background/50 resize-none text-xs focus:ring-2 focus:ring-primary font-medium"
                />
              </div>
              <div>
                <label className="block mb-1.5 font-bold text-foreground">الوصف القصير (الإنجليزية)</label>
                <textarea
                  rows={2}
                  value={formData.short_description_en}
                  onChange={(e) => setFormData({ ...formData, short_description_en: e.target.value })}
                  placeholder="Short description"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-input bg-background/50 resize-none text-xs focus:ring-2 focus:ring-primary font-medium"
                />
              </div>
              <div>
                <label className="block mb-1.5 font-bold text-foreground">الوصف التفصيلي (العربية)</label>
                <textarea
                  rows={3}
                  value={formData.description_ar}
                  onChange={(e) => setFormData({ ...formData, description_ar: e.target.value })}
                  placeholder="الوصف التفصيلي"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-input bg-background/50 resize-none text-xs focus:ring-2 focus:ring-primary font-medium"
                />
              </div>
              <div>
                <label className="block mb-1.5 font-bold text-foreground">الوصف التفصيلي (الإنجليزية)</label>
                <textarea
                  rows={3}
                  value={formData.description_en}
                  onChange={(e) => setFormData({ ...formData, description_en: e.target.value })}
                  placeholder="Detailed description"
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
              حفظ المشروع
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
