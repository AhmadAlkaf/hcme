'use client';

import React, { useState, useTransition } from 'react';
import { Plus, Edit, Trash2, Loader2, MapPin, ExternalLink, Phone, Mail } from 'lucide-react';
import Image from 'next/image';
import { ApiBranch } from '@/types/api';
import { BranchModal } from '../BranchModal';
import { DeleteConfirmModal } from '../../Modals';
import { ToastNotification, ToastMessage } from '@/components/ui/ToastNotification';
import { Pagination } from '@/components/ui/Pagination';
import { usePaginatedList } from '@/lib/use-paginated-list';
import {
  createBranchServerAction,
  deleteBranchServerAction,
  getBranchesServerAction,
  updateBranchServerAction,
} from '@/actions/branches.actions';

export const BranchesTab = () => {
  const {
    items: branches,
    meta,
    setPage,
    setPageSize,
    reload,
  } = usePaginatedList<ApiBranch>(getBranchesServerAction);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState<ApiBranch | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ApiBranch | null>(null);
  
  // Transition state for server actions feedback
  const [isPending, startTransition] = useTransition();
  const [toast, setToast] = useState<ToastMessage | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
  };

  const handleAddClick = () => {
    setEditingBranch(null);
    setIsModalOpen(true);
  };

  const handleEditClick = (branch: ApiBranch) => {
    setEditingBranch(branch);
    setIsModalOpen(true);
  };

  const handleSaveBranch = async (formData: FormData) => {
    setIsModalOpen(false); // Close immediately for better UX
    startTransition(async () => {
      if (editingBranch) {
        // Edit Branch
        const res = await updateBranchServerAction(editingBranch.id, formData);
        if (res.success && res.data) {
          reload();
          showToast('تم تعديل الفرع بنجاح');
        } else {
          showToast(res.error || 'فشل تعديل الفرع', 'error');
        }
      } else {
        // Add Branch
        const res = await createBranchServerAction(formData);
        if (res.success && res.data) {
          // A new record belongs on page 1, so return there to see it.
          setPage(1);
          reload();
          showToast('تم إضافة الفرع بنجاح');
        } else {
          showToast(res.error || 'فشل إضافة الفرع', 'error');
        }
      }
      setEditingBranch(null);
    });
  };

  const handleConfirmDelete = () => {
    if (!deleteTarget) return;

    const targetId = deleteTarget.id;
    setDeleteTarget(null); // Close modal immediately

    startTransition(async () => {
      const res = await deleteBranchServerAction(targetId);
      if (res.success) {
        // Deleting the only row of the last page would leave the user on an
        // empty page, so fall back to the previous one.
        if (branches.length === 1 && meta.page > 1) {
          setPage(meta.page - 1);
        } else {
          reload();
        }
        showToast('تم حذف الفرع بنجاح');
      } else {
        showToast(res.error || 'فشل حذف الفرع', 'error');
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
          <h3 className="font-extrabold text-foreground text-base flex items-center gap-2">
            <MapPin className="w-5 h-5 text-rose-500" />
            إدارة فروع المركز (صالة العرض والمكاتب)
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            عرض وتحديث معلومات الفروع وأماكن التواجد وصور الواجهات
          </p>
        </div>
        <button
          onClick={handleAddClick}
          disabled={isPending}
          className="px-4 py-2.5 rounded-2xl bg-primary text-primary-foreground font-bold text-xs flex items-center gap-2 shadow-md shadow-primary/20 hover:opacity-90 transition-all disabled:opacity-50"
        >
          <Plus className="w-4 h-4" />
          إضافة فرع جديد
        </button>
      </div>

      {/* Grid List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5">
        {branches.length === 0 ? (
          <div className="col-span-full bg-card border border-border/80 rounded-3xl p-12 text-center text-muted-foreground">
            <MapPin className="w-12 h-12 mx-auto text-muted-foreground/30 mb-3" />
            <p className="text-sm font-bold">لا توجد فروع مضافة حالياً.</p>
            <p className="text-xs mt-1">اضغط على زر الإضافة لإدراج فرع جديد بالسيرفر.</p>
          </div>
        ) : (
          branches.map((branch) => (
            <div
              key={branch.id}
              className="bg-card rounded-3xl border border-border overflow-hidden flex flex-col group shadow-sm hover:shadow-xl transition-all duration-300"
            >
              {/* Branch Image Banner */}
              <div className="relative h-48 w-full bg-muted/50 border-b border-border/50">
                {branch.images ? (
                  <Image
                    src={branch.images}
                    alt={branch.name_ar}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-muted-foreground/30">
                    <MapPin className="w-12 h-12" />
                  </div>
                )}
                {/* Actions overlay */}
                <div className="absolute top-3 left-3 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleEditClick(branch)}
                    disabled={isPending}
                    className="p-2 bg-background/90 hover:bg-background text-blue-600 rounded-xl shadow-lg backdrop-blur-md transition-all disabled:opacity-50"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeleteTarget(branch)}
                    disabled={isPending}
                    className="p-2 bg-background/90 hover:bg-background text-rose-600 rounded-xl shadow-lg backdrop-blur-md transition-all disabled:opacity-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Branch Info */}
              <div className="p-5 flex flex-col flex-1 gap-4">
                <div>
                  <h4 className="font-extrabold text-foreground text-lg">{branch.name_ar}</h4>
                  <p className="text-xs text-muted-foreground font-medium dir-ltr text-left">{branch.name_en}</p>
                </div>

                <div className="space-y-3 flex-1 bg-muted/30 p-3.5 rounded-2xl border border-border/50">
                  <div className="flex items-start gap-2.5">
                    <MapPin className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-semibold text-foreground leading-tight">{branch.address_ar}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5 dir-ltr text-left">{branch.address_en}</p>
                    </div>
                  </div>

                  {(branch.phone || branch.email) && (
                    <div className="pt-3 border-t border-border/50 grid grid-cols-2 gap-2">
                      {branch.phone && (
                        <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
                          <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                            <Phone className="w-3 h-3" />
                          </div>
                          <span className="dir-ltr">{branch.phone}</span>
                        </div>
                      )}
                      {branch.email && (
                        <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
                          <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                            <Mail className="w-3 h-3" />
                          </div>
                          <span className="truncate" title={branch.email}>{branch.email}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {branch.link_location && (
                  <a
                    href={branch.link_location}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border border-input text-xs font-bold text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    فتح في خرائط جوجل
                  </a>
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
            idPrefix="cms-branches"
          />
        </div>
      )}

      <BranchModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveBranch}
        initialData={editingBranch}
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
