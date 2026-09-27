'use client';

import React, { useState, useTransition } from 'react';
import { Plus, Edit, Trash2, Loader2, Layers } from 'lucide-react';
import { ApiPublicService } from '@/types/api';
import { PublicServiceModal } from '../PublicServiceModal';
import { DeleteConfirmModal } from '../../Modals';
import { ToastNotification, ToastMessage } from '@/components/ui/ToastNotification';
import { Pagination } from '@/components/ui/Pagination';
import { usePaginatedList } from '@/lib/use-paginated-list';
import {
  createPublicServiceServerAction,
  deletePublicServiceServerAction,
  getPublicServicesServerAction,
  updatePublicServiceServerAction,
} from '@/actions/public-services.actions';

export const PublicServicesTab = () => {
  const {
    items: services,
    meta,
    setPage,
    setPageSize,
    reload,
  } = usePaginatedList<ApiPublicService>(getPublicServicesServerAction);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<ApiPublicService | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ApiPublicService | null>(null);
  
  // Transition state for server actions feedback
  const [isPending, startTransition] = useTransition();
  const [toast, setToast] = useState<ToastMessage | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
  };

  const handleAddClick = () => {
    setEditingService(null);
    setIsModalOpen(true);
  };

  const handleEditClick = (service: ApiPublicService) => {
    setEditingService(service);
    setIsModalOpen(true);
  };

  const handleSaveService = async (formData: { name_ar: string; name_en: string }) => {
    setIsModalOpen(false); // Close immediately for better UX
    startTransition(async () => {
      if (editingService) {
        // Edit Service
        const res = await updatePublicServiceServerAction(editingService.id, formData);
        if (res.success && res.data) {
          reload();
          showToast('تم تعديل الخدمة العامة بنجاح');
        } else {
          showToast(res.error || 'فشل تعديل الخدمة العامة', 'error');
        }
      } else {
        // Add Service
        const res = await createPublicServiceServerAction(formData);
        if (res.success && res.data) {
          // A new record belongs on page 1, so return there to see it.
          setPage(1);
          reload();
          showToast('تم إضافة الخدمة العامة بنجاح');
        } else {
          showToast(res.error || 'فشل إضافة الخدمة العامة', 'error');
        }
      }
      setEditingService(null);
    });
  };

  const handleConfirmDelete = () => {
    if (!deleteTarget) return;

    const targetId = deleteTarget.id;
    setDeleteTarget(null); // Close modal immediately

    startTransition(async () => {
      const res = await deletePublicServiceServerAction(targetId);
      if (res.success) {
        // Deleting the only row of the last page would leave the user on an
        // empty page, so fall back to the previous one.
        if (services.length === 1 && meta.page > 1) {
          setPage(meta.page - 1);
        } else {
          reload();
        }
        showToast('تم حذف الخدمة العامة بنجاح');
      }
    });
  };

  return (
    <div className="space-y-5 relative">
      {/* Toast Feedback */}
      <ToastNotification toast={toast} onClose={() => setToast(null)} />

      {/* Global loading spinner overlay during submit/delete (matches Products/Projects) */}
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
          <h3 className="font-extrabold text-foreground text-base">إدارة الخدمات العامة للمركز</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            عرض وتحديث الخدمات العامة المتاحة باللغتين العربية والإنجليزية والمحفوظة في السيرفر
          </p>
        </div>
        <button
          onClick={handleAddClick}
          disabled={isPending}
          className="px-4 py-2.5 rounded-2xl bg-primary text-primary-foreground font-bold text-xs flex items-center gap-2 shadow-md shadow-primary/20 hover:opacity-90 transition-all disabled:opacity-50"
        >
          <Plus className="w-4 h-4" />
          إضافة خدمة جديدة
        </button>
      </div>

      {/* Grid List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {services.length === 0 ? (
          <div className="col-span-full bg-card border border-border/80 rounded-3xl p-12 text-center text-muted-foreground">
            <Layers className="w-12 h-12 mx-auto text-muted-foreground/30 mb-3" />
            <p className="text-sm font-bold">لا يوجد خدمات عامة مضافة حالياً.</p>
            <p className="text-xs mt-1">اضغط على زر الإضافة لإدراج خدمة جديدة بالسيرفر.</p>
          </div>
        ) : (
          services.map((s) => (
            <div
              key={s.id}
              className="bg-card text-card-foreground border border-border/80 rounded-3xl p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-3xl p-3 rounded-2xl bg-primary/10 border border-primary/20">
                    🛠️
                  </span>
                  <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-black">
                    معرّف السيرفر: #{s.id}
                  </span>
                </div>

                <div className="space-y-2">
                  <div>
                    <span className="text-[10px] text-muted-foreground block font-bold">عربي</span>
                    <p className="font-extrabold text-sm text-foreground leading-relaxed">
                      {s.name_ar}
                    </p>
                  </div>
                  <div className="border-t border-border/50 pt-2">
                    <span className="text-[10px] text-muted-foreground block font-bold">ENGLISH</span>
                    <p className="font-semibold text-xs text-muted-foreground leading-relaxed dir-ltr text-left">
                      {s.name_en}
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-border/80 flex items-center justify-end gap-2">
                <button
                  onClick={() => handleEditClick(s)}
                  disabled={isPending}
                  className="p-2 rounded-xl border border-input text-muted-foreground hover:text-foreground hover:bg-muted transition-all disabled:opacity-50"
                  title="تعديل الخدمة"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setDeleteTarget(s)}
                  disabled={isPending}
                  className="p-2 rounded-xl border border-destructive/20 text-destructive hover:bg-destructive/10 transition-all disabled:opacity-50"
                  title="حذف الخدمة"
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
            idPrefix="cms-public-services"
          />
        </div>
      )}

      {/* PublicService Modal component */}
      <PublicServiceModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveService}
        initialData={editingService}
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
