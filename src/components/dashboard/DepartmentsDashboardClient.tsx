'use client';

import React, { useState } from 'react';
import { DepartmentsSection } from '@/components/dashboard/DepartmentsSection';
import { DepartmentModal, DeleteConfirmModal } from '@/components/dashboard/Modals';
import { ApiAgent, ApiDepartment } from '@/types/api';
import {
  getDepartmentsServerAction,
  createDepartmentServerAction,
  updateDepartmentServerAction,
  deleteDepartmentServerAction,
} from '@/actions/products.actions';
import { Loader2 } from 'lucide-react';
import { ToastNotification, ToastMessage } from '@/components/ui/ToastNotification';
import { usePaginatedList } from '@/lib/use-paginated-list';

interface DepartmentsDashboardClientProps {
  agents: ApiAgent[];
}

export default function DepartmentsDashboardClient({
  agents = [],
}: DepartmentsDashboardClientProps) {
  const {
    items: departments,
    meta,
    search,
    setSearch,
    setPage,
    setPageSize,
    reload,
  } = usePaginatedList<ApiDepartment>(getDepartmentsServerAction);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<ApiDepartment | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ApiDepartment | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<ToastMessage | null>(null);

  const handleSave = async (formData: FormData) => {
    setIsSubmitting(true);
    try {
      const res = editingDepartment
        ? await updateDepartmentServerAction(editingDepartment.id, formData)
        : await createDepartmentServerAction(formData);

      if (res.success) {
        if (editingDepartment) {
          setToast({ type: 'success', message: 'تم تعديل القسم بنجاح' });
        } else {
          setToast({ type: 'success', message: 'تمت إضافة القسم بنجاح' });
          // A new department belongs on page 1, so return there to see it.
          setPage(1);
        }
        reload();
        setIsModalOpen(false);
      } else {
        setToast({ type: 'error', message: res.error || 'حدث خطأ أثناء حفظ القسم' });
      }
    } catch (error) {
      console.error('Error saving department:', error);
      setToast({
        type: 'error',
        message: (error instanceof Error ? error.message : undefined) || 'فشلت العملية، يرجى المحاولة مرة أخرى',
      });
    } finally {
      setIsSubmitting(false);
      setEditingDepartment(null);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setIsSubmitting(true);
    try {
      const res = await deleteDepartmentServerAction(deleteTarget.id);
      if (res.success) {
        // Deleting the only row of the last page would leave the user on an
        // empty page, so fall back to the previous one.
        if (departments.length === 1 && meta.page > 1) {
          setPage(meta.page - 1);
        } else {
          reload();
        }
        setToast({ type: 'success', message: 'تم حذف القسم ومنتجاته بنجاح' });
      } else {
        setToast({ type: 'error', message: res.error || 'حدث خطأ أثناء حذف القسم' });
      }
    } catch (error) {
      console.error('Error deleting department:', error);
      setToast({
        type: 'error',
        message: (error instanceof Error ? error.message : undefined) || 'فشل حذف القسم، يرجى التحقق من الاتصال بالشبكة',
      });
    } finally {
      setIsSubmitting(false);
      setDeleteTarget(null);
    }
  };

  return (
    <div className="relative">
      {isSubmitting && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center">
          <div className="bg-card border border-border p-6 rounded-3xl shadow-xl flex items-center gap-3 text-sm font-bold text-foreground">
            <Loader2 className="w-5 h-5 text-primary animate-spin" />
            <span>جاري معالجة طلبك</span>
          </div>
        </div>
      )}

      <DepartmentsSection
        departments={departments}
        meta={meta}
        agents={agents}
        search={search}
        onSearchChange={setSearch}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
        onAddDepartment={() => {
          setEditingDepartment(null);
          setIsModalOpen(true);
        }}
        onEditDepartment={(department) => {
          setEditingDepartment(department);
          setIsModalOpen(true);
        }}
        onDeleteDepartment={(department) => setDeleteTarget(department)}
      />

      <DepartmentModal
        // Remounting on open/target change resets the form without an effect.
        key={`${isModalOpen}-${editingDepartment?.id ?? 'new'}`}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        initialData={editingDepartment}
        agents={agents}
      />

      <DeleteConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        title={deleteTarget ? (deleteTarget.name_ar || deleteTarget.name_en) : ''}
        warning="حذف القسم سيحذف جميع المنتجات المرتبطة به نهائياً."
      />

      <ToastNotification toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
