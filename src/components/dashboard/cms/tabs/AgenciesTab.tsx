'use client';

import React, { useState, useTransition } from 'react';
import { Plus, Edit, Trash2, Loader2, Briefcase, ExternalLink } from 'lucide-react';
import Image from 'next/image';
import { ApiAgent } from '@/types/api';
import { AgentModal } from '../AgentModal';
import { DeleteConfirmModal } from '../../Modals';
import { ToastNotification, ToastMessage } from '@/components/ui/ToastNotification';
import { Pagination } from '@/components/ui/Pagination';
import { usePaginatedList } from '@/lib/use-paginated-list';
import {
  createAgentServerAction,
  deleteAgentServerAction,
  getAgentsServerAction,
  updateAgentServerAction,
} from '@/actions/agents.actions';

export const AgenciesTab = () => {
  const {
    items: agencies,
    meta,
    setPage,
    setPageSize,
    reload,
  } = usePaginatedList<ApiAgent>(getAgentsServerAction);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAgent, setEditingAgent] = useState<ApiAgent | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ApiAgent | null>(null);
  
  // Transition state for server actions feedback
  const [isPending, startTransition] = useTransition();
  const [toast, setToast] = useState<ToastMessage | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
  };

  const handleAddClick = () => {
    setEditingAgent(null);
    setIsModalOpen(true);
  };

  const handleEditClick = (agent: ApiAgent) => {
    setEditingAgent(agent);
    setIsModalOpen(true);
  };

  const handleSaveAgent = async (formData: FormData) => {
    setIsModalOpen(false); // Close immediately for better UX
    startTransition(async () => {
      if (editingAgent) {
        // Edit Agent
        const res = await updateAgentServerAction(editingAgent.id, formData);
        if (res.success && res.data) {
          reload();
          showToast('تم تعديل الوكيل بنجاح');
        } else {
          showToast(res.error || 'فشل تعديل الوكيل', 'error');
        }
      } else {
        // Add Agent
        const res = await createAgentServerAction(formData);
        if (res.success && res.data) {
          // A new record belongs on page 1, so return there to see it.
          setPage(1);
          reload();
          showToast('تم إضافة الوكيل بنجاح');
        } else {
          showToast(res.error || 'فشل إضافة الوكيل', 'error');
        }
      }
      setEditingAgent(null);
    });
  };

  const handleConfirmDelete = () => {
    if (!deleteTarget) return;

    const targetId = deleteTarget.id;
    setDeleteTarget(null); // Close modal immediately

    startTransition(async () => {
      const res = await deleteAgentServerAction(targetId);
      if (res.success) {
        // Deleting the only row of the last page would leave the user on an
        // empty page, so fall back to the previous one.
        if (agencies.length === 1 && meta.page > 1) {
          setPage(meta.page - 1);
        } else {
          reload();
        }
        showToast('تم حذف الوكيل بنجاح');
      }
    });
  };

  return (
    <div className="space-y-5 relative">
      {/* Toast Feedback */}
      <ToastNotification toast={toast} onClose={() => setToast(null)} />

      {/* Global loading spinner overlay */}
      {isPending && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center">
          <div className="bg-card border border-border p-6 rounded-3xl shadow-xl flex items-center gap-3 text-sm font-bold text-foreground">
            <Loader2 className="w-5 h-5 text-primary animate-spin" />
            <span>جاري معالجة طلبك</span>
          </div>
        </div>
      )}

      {/* Header Panel */}
      <div className="flex items-center justify-between bg-card p-5 rounded-3xl border border-border shadow-sm">
        <div>
          <h3 className="font-extrabold text-foreground text-base">إدارة وكلاء العلامات التجارية المعتمدة</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            عرض وتحديث الوكلاء المتاحين في الموقع مع إمكانية رفع الصور والروابط
          </p>
        </div>
        <button
          onClick={handleAddClick}
          disabled={isPending}
          className="px-4 py-2.5 rounded-2xl bg-primary text-primary-foreground font-bold text-xs flex items-center gap-2 shadow-md shadow-primary/20 hover:opacity-90 transition-all disabled:opacity-50"
        >
          <Plus className="w-4 h-4" />
          إضافة وكيل جديد
        </button>
      </div>

      {/* Grid List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {agencies.length === 0 ? (
          <div className="col-span-full bg-card border border-border/80 rounded-3xl p-12 text-center text-muted-foreground">
            <Briefcase className="w-12 h-12 mx-auto text-muted-foreground/30 mb-3" />
            <p className="text-sm font-bold">لا يوجد وكلاء مضافين حالياً.</p>
            <p className="text-xs mt-1">اضغط على زر الإضافة لإدراج وكيل جديد بالسيرفر.</p>
          </div>
        ) : (
          agencies.map((agency) => (
            <div
              key={agency.id}
              className="bg-card text-card-foreground border border-border/80 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
            >
              {/* Image Header */}
              <div className="relative h-40 bg-muted flex items-center justify-center border-b border-border/50">
                {agency.image ? (
                  <Image 
                    src={agency.image} 
                    alt={agency.name_ar} 
                    fill 
                    className="object-cover"
                  />
                ) : (
                  <Briefcase className="w-10 h-10 text-muted-foreground/30" />
                )}
                <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-black/50 backdrop-blur-md text-white text-[10px] font-black">
                  #{agency.id}
                </div>
              </div>

              {/* Content */}
              <div className="p-5 space-y-4 flex-1">
                <div>
                  <h4 className="font-extrabold text-base text-foreground flex items-center justify-between">
                    {agency.name_ar}
                    {agency.urls && (
                      <a href={agency.urls} target="_blank" rel="noopener noreferrer" className="text-primary hover:text-primary/80" title="زيارة الموقع">
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                  </h4>
                  <span className="text-xs text-primary font-bold block">{agency.name_en}</span>
                </div>

                <div className="space-y-1 text-xs">
                  <span className="font-bold text-muted-foreground">لماذا تشتري منا؟</span>
                  <p className="text-foreground leading-relaxed line-clamp-2">
                    {agency.buy_fome_us_ar}
                  </p>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="p-4 pt-0 mt-auto border-t border-border/50 flex items-center justify-end gap-2 bg-muted/20">
                <button
                  onClick={() => handleEditClick(agency)}
                  disabled={isPending}
                  className="p-2 mt-3 rounded-xl border border-input text-muted-foreground hover:text-foreground hover:bg-muted transition-all disabled:opacity-50"
                  title="تعديل الوكيل"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setDeleteTarget(agency)}
                  disabled={isPending}
                  className="p-2 mt-3 rounded-xl border border-destructive/20 text-destructive hover:bg-destructive/10 transition-all disabled:opacity-50"
                  title="حذف الوكيل"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {meta.totalPages > 0 && (
        <div className="bg-card border border-border/80 rounded-3xl p-4 shadow-sm">
          <Pagination
            meta={meta}
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
            idPrefix="cms-agencies"
          />
        </div>
      )}

      {/* Agent Modal component */}
      <AgentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveAgent}
        initialData={editingAgent}
      />

      <DeleteConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        title={deleteTarget ? deleteTarget.name_ar : ''}
      />
    </div>
  );
};
