'use client';

import React, { useState, useEffect } from 'react';
import { X, Check, Layers } from 'lucide-react';
import { ApiService, ApiAgent } from '@/types/api';

interface DetailedServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: { name_ar: string; name_en: string; agent: number }) => void;
  initialData?: ApiService | null;
  agents: ApiAgent[];
}

export const DetailedServiceModal: React.FC<DetailedServiceModalProps> = ({ 
  isOpen, 
  onClose, 
  onSave, 
  initialData,
  agents 
}) => {
  const [nameAr, setNameAr] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [agentId, setAgentId] = useState<number | ''>('');

  useEffect(() => {
    if (initialData) {
      setNameAr(initialData.name_ar || '');
      setNameEn(initialData.name_en || '');
      setAgentId(initialData.agent || (agents.length > 0 ? agents[0].id : ''));
    } else {
      setNameAr('');
      setNameEn('');
      setAgentId(agents.length > 0 ? agents[0].id : '');
    }
  }, [initialData, isOpen, agents]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!agentId) return;

    onSave({
      name_ar: nameAr,
      name_en: nameEn,
      agent: Number(agentId),
    });
  };

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
                {initialData ? 'تعديل الخدمة التفصيلية' : 'إضافة خدمة جديدة'}
              </h3>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg text-muted-foreground hover:bg-muted">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 text-sm">
          
          <div>
            <label className="block mb-1 font-semibold text-foreground">الوكيل المرتبط بالخدمة *</label>
            <select
              required
              value={agentId}
              onChange={(e) => setAgentId(Number(e.target.value))}
              className="w-full px-3 py-2.5 rounded-lg border border-input bg-background font-medium"
            >
              <option value="" disabled>اختر الوكيل من القائمة...</option>
              {agents.map((agent) => (
                <option key={agent.id} value={agent.id}>
                  {agent.name_ar} ({agent.name_en})
                </option>
              ))}
            </select>
            {agents.length === 0 && (
              <p className="text-xs text-destructive mt-1">يجب إضافة وكلاء أولاً قبل إضافة خدمات تفصيلية.</p>
            )}
          </div>

          <div>
            <label className="block mb-1 font-semibold text-foreground">اسم الخدمة بالعربية *</label>
            <input
              type="text"
              required
              value={nameAr}
              onChange={(e) => setNameAr(e.target.value)}
              placeholder="مثال: توريد لوحات التوزيع"
              className="w-full px-3 py-2 rounded-lg border border-input bg-background"
            />
          </div>

          <div>
            <label className="block mb-1 font-semibold text-foreground">اسم الخدمة بالإنجليزية *</label>
            <input
              type="text"
              required
              value={nameEn}
              onChange={(e) => setNameEn(e.target.value)}
              placeholder="Example: Supply of Distribution Boards"
              className="w-full px-3 py-2 rounded-lg border border-input bg-background dir-ltr text-left"
            />
          </div>

          <div className="pt-4 border-t border-border flex items-center justify-end gap-3">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg border border-input hover:bg-muted">
              إلغاء
            </button>
            <button 
              type="submit" 
              disabled={!agentId}
              className="px-5 py-2 rounded-lg bg-primary text-primary-foreground font-bold flex items-center gap-2 disabled:opacity-50"
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
