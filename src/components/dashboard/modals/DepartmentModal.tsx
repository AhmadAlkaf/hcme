'use client';

import React, { useState, useEffect } from 'react';
import { X, FolderTree } from 'lucide-react';
import { ApiAgent, ApiDepartment } from '@/types/api';
import { getAgentsServerAction } from '@/actions/products.actions';
import { normalizeDepartmentRef } from '@/lib/products';

interface DepartmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (formData: FormData) => void;
  initialData?: ApiDepartment | null;
  agents?: ApiAgent[];
}

/**
 * Renders nothing but owns the agent fallback fetch and the remount key.
 *
 * The form lives in `DepartmentForm` and is remounted whenever the target
 * changes, so its state is initialised from props instead of being reset from
 * an effect. Mount the modal with a `key` that changes when the open state or
 * the edited department changes.
 */
export const DepartmentModal: React.FC<DepartmentModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  agents = [],
}) => {
  // Only populated when the parent had no agents to pass, so the write happens
  // in a callback rather than synchronously in the effect body.
  const [fetchedAgents, setFetchedAgents] = useState<ApiAgent[]>([]);

  useEffect(() => {
    if (agents.length > 0 || !isOpen) return;
    let cancelled = false;
    getAgentsServerAction().then((res) => {
      if (!cancelled && res && res.length > 0) {
        setFetchedAgents(res);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [agents, isOpen]);

  if (!isOpen) return null;

  const effectiveAgents = agents.length > 0 ? agents : fetchedAgents;

  return (
    <DepartmentForm
      initialData={initialData}
      agents={effectiveAgents}
      onClose={onClose}
      onSave={onSave}
    />
  );
};

interface DepartmentFormProps {
  initialData?: ApiDepartment | null;
  agents: ApiAgent[];
  onClose: () => void;
  onSave: (formData: FormData) => void;
}

const DepartmentForm: React.FC<DepartmentFormProps> = ({
  initialData,
  agents,
  onClose,
  onSave,
}) => {
  // Initialised once per mount. The parent remounts this component whenever
  // the edited department changes, so no reset effect is needed.
  const [formData, setFormData] = useState(() => ({
    name_ar: initialData?.name_ar || '',
    name_en: initialData?.name_en || '',
    // `exmple` is spelled this way in the backend model, so the field has to
    // carry that name to reach it.
    exmple: initialData?.exmple || '',
    agent: normalizeDepartmentRef(initialData?.agent)?.toString() || '',
  }));
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name_ar.trim() || !formData.name_en.trim()) {
      setError('الاسم بالعربية والإنجليزية مطلوب');
      return;
    }

    const data = new FormData();
    data.append('name_ar', formData.name_ar.trim());
    data.append('name_en', formData.name_en.trim());
    data.append('exmple', formData.exmple.trim());
    // A department without an agent is allowed by the backend, so an empty
    // select must leave the field out rather than send an empty string id.
    if (formData.agent) {
      data.append('agent', formData.agent);
    }

    onSave(data);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6">
      <div className="bg-card text-card-foreground border border-border w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95">
        <div className="px-6 py-4 bg-primary/10 border-b border-border flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary text-primary-foreground">
              <FolderTree className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground">
                {initialData ? 'تعديل القسم' : 'إضافة قسم جديد'}
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                القسم هو الوسيط بين المنتج والوكيل، والمنتج يرث قسمه
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-muted-foreground hover:bg-muted transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
          <div>
            <label className="block mb-1.5 font-bold text-foreground">الاسم بالعربية *</label>
            <input
              type="text"
              required
              value={formData.name_ar}
              onChange={(e) => {
                setError('');
                setFormData({ ...formData, name_ar: e.target.value });
              }}
              placeholder="مثال: قطع كهربائية"
              className="w-full px-3.5 py-2.5 rounded-xl border border-input bg-background/50 font-bold focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block mb-1.5 font-bold text-foreground">الاسم بالإنجليزية *</label>
            <input
              type="text"
              required
              dir="ltr"
              value={formData.name_en}
              onChange={(e) => {
                setError('');
                setFormData({ ...formData, name_en: e.target.value });
              }}
              placeholder="Example: Electrical Parts"
              className="w-full px-3.5 py-2.5 rounded-xl border border-input bg-background/50 font-bold focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block mb-1.5 font-bold text-foreground">الوكيل / العلامة التجارية</label>
            <select
              value={formData.agent}
              onChange={(e) => setFormData({ ...formData, agent: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-input bg-background/50 font-bold focus:ring-2 focus:ring-primary text-xs"
            >
              <option value="">بدون وكيل</option>
              {agents.map((agent) => (
                <option key={agent.id} value={agent.id}>
                  {agent.name_ar || agent.name_en}
                </option>
              ))}
            </select>
            <p className="mt-1.5 text-[11px] text-muted-foreground">
              اختياري — يُستخدم لتجميع الأقسام تحت العلامة التجارية في نموذج المنتج.
            </p>
          </div>

          <div>
            <label className="block mb-1.5 font-bold text-foreground">مثال توضيحي</label>
            <input
              type="text"
              value={formData.exmple}
              onChange={(e) => setFormData({ ...formData, exmple: e.target.value })}
              placeholder="وصف مختصر يساعد في توضيح القسم (اختياري)"
              className="w-full px-3.5 py-2.5 rounded-xl border border-input bg-background/50 font-bold focus:ring-2 focus:ring-primary"
            />
            <p className="mt-1.5 text-[11px] text-muted-foreground">
              الحقل اختياري ويُحفظ في الباك-إند باسم «مثال».
            </p>
          </div>

          {error && (
            <p className="text-xs font-bold text-destructive bg-destructive/10 border border-destructive/20 rounded-xl px-3 py-2">
              {error}
            </p>
          )}

          <div className="flex items-center justify-end gap-3 pt-2 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-2xl border border-input text-xs font-extrabold text-foreground hover:bg-muted transition-colors"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-2xl bg-primary text-primary-foreground text-xs font-extrabold hover:opacity-90 transition-all shadow-lg shadow-primary/20"
            >
              {initialData ? 'حفظ التعديلات' : 'إضافة القسم'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
