'use client';

import React, { useState, useTransition } from 'react';
import { Plus, Edit, Trash2, Loader2, Layers, Tag } from 'lucide-react';
import { ApiService, ApiAgent } from '@/types/api';
import { DetailedServiceModal } from '../DetailedServiceModal';
import { DeleteConfirmModal } from '../../Modals';
import { ToastNotification, ToastMessage } from '@/components/ui/ToastNotification';
import { Pagination } from '@/components/ui/Pagination';
import { usePaginatedList } from '@/lib/use-paginated-list';
import {
  createDetailedServiceServerAction,
  deleteDetailedServiceServerAction,
  getDetailedServicesServerAction,
  updateDetailedServiceServerAction,
} from '@/actions/detailed-services.actions';

interface ServicesTabProps {
  agents: ApiAgent[];
}

export const ServicesTab: React.FC<ServicesTabProps> = ({ agents }) => {
  const {
    items: services,
    meta,
    setPage,
    setPageSize,
    reload,
  } = usePaginatedList<ApiService>(getDetailedServicesServerAction);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<ApiService | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ApiService | null>(null);
  
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

  const handleEditClick = (service: ApiService) => {
    setEditingService(service);
    setIsModalOpen(true);
  };

  const handleSaveService = async (formData: { name_ar: string; name_en: string; agent: number }) => {
    setIsModalOpen(false); // Close immediately for better UX
    startTransition(async () => {
      if (editingService) {
        // Edit Service
        const res = await updateDetailedServiceServerAction(editingService.id, formData);
        if (res.success && res.data) {
          reload();
          showToast('تم تعديل الخدمة التفصيلية بنجاح');
        } else {
          showToast(res.error || 'فشل تعديل الخدمة التفصيلية', 'error');
        }
      } else {
        // Add Service
        const res = await createDetailedServiceServerAction(formData);
        if (res.success && res.data) {
          // A new record belongs on page 1, so return there to see it.
          setPage(1);
          reload();
          showToast('تم إضافة الخدمة التفصيلية بنجاح');
        } else {
          showToast(res.error || 'فشل إضافة الخدمة التفصيلية', 'error');
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
      const res = await deleteDetailedServiceServerAction(targetId);
      if (res.success) {
        // Deleting the only row of the last page would leave the user on an
        // empty page, so fall back to the previous one.
        if (services.length === 1 && meta.page > 1) {
          setPage(meta.page - 1);
        } else {
          reload();
        }
        showToast('تم حذف الخدمة التفصيلية بنجاح');
      } else {
        showToast(res.error || 'فشل حذف الخدمة التفصيلية', 'error');
      }
    });
  };

  return (
    <div className="space-y-6 relative">
      {/* Global loading spinner overlay */}
      {isPending && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center">
          <div className="bg-card border border-border p-6 rounded-3xl shadow-xl flex items-center gap-3 text-sm font-bold text-foreground">
            <Loader2 className="w-5 h-5 text-primary animate-spin" />
            <span>جاري معالجة طلبك</span>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast && (
        <ToastNotification 
          toast={toast}
          onClose={() => setToast(null)} 
        />
      )}

      {/* Header Panel */}
      <div className="flex items-center justify-between bg-card p-5 rounded-3xl border border-border shadow-sm">
        <div>
          <h3 className="font-extrabold text-foreground text-base flex items-center gap-2">
            <Layers className="w-5 h-5 text-indigo-500" />
            الخدمات التفصيلية  للوكلاء
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            إدارة الخدمات الفرعية التابعة للوكلاء المعتمدين وتحديث تفاصيلها باللغتين
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {services.length === 0 ? (
          <div className="col-span-full py-16 text-center border-2 border-dashed border-border rounded-2xl bg-card">
            <Layers className="w-12 h-12 text-muted-foreground/50 mx-auto mb-3" />
            <p className="text-muted-foreground font-medium">لا توجد خدمات مضافة حتى الآن</p>
          </div>
        ) : (
          services.map((service) => (
            <div
              key={service.id}
              className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all group flex flex-col"
            >
              <div className="p-5 flex-1 space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="p-3 bg-indigo-500/10 text-indigo-600 rounded-xl">
                    <Layers className="w-6 h-6" />
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-background/80 backdrop-blur-sm p-1 rounded-lg border border-border shadow-sm">
                    <button
                      onClick={() => handleEditClick(service)}
                      className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-md transition-colors"
                      title="تعديل"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeleteTarget(service)}
                      className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
                      title="حذف"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-bold text-foreground text-lg mb-1">{service.name_ar}</h4>
                  <p className="text-sm text-muted-foreground dir-ltr text-left font-medium">
                    {service.name_en}
                  </p>
                </div>

                {service.agent_name_ar && (
                  <div className="inline-flex items-center gap-1.5 bg-muted/50 px-2.5 py-1 rounded-md text-xs font-semibold text-muted-foreground border border-border/50">
                    <Tag className="w-3 h-3" />
                    الوكيل: {service.agent_name_ar}
                  </div>
                )}
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
            idPrefix="cms-services"
          />
        </div>
      )}

      <DetailedServiceModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveService}
        initialData={editingService}
        agents={agents}
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
