'use client';

import React, { useState, useTransition } from 'react';
import { Plus, Edit, Trash2, Loader2, Star, MessageSquareQuote } from 'lucide-react';
import Image from 'next/image';
import { ApiCustomerReview } from '@/types/api';
import { TestimonialModal } from '../TestimonialModal';
import { DeleteConfirmModal } from '../../Modals';
import { ToastNotification, ToastMessage } from '@/components/ui/ToastNotification';
import { Pagination } from '@/components/ui/Pagination';
import { usePaginatedList } from '@/lib/use-paginated-list';
import {
  createTestimonialServerAction,
  deleteTestimonialServerAction,
  getTestimonialsServerAction,
  updateTestimonialServerAction,
} from '@/actions/testimonials.actions';

export const TestimonialsTab = () => {
  const {
    items: testimonials,
    meta,
    setPage,
    setPageSize,
    reload,
  } = usePaginatedList<ApiCustomerReview>(getTestimonialsServerAction);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTestimonial, setEditingTestimonial] = useState<ApiCustomerReview | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ApiCustomerReview | null>(null);
  
  // Transition state for server actions feedback
  const [isPending, startTransition] = useTransition();
  const [toast, setToast] = useState<ToastMessage | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
  };

  const handleAddClick = () => {
    setEditingTestimonial(null);
    setIsModalOpen(true);
  };

  const handleEditClick = (testimonial: ApiCustomerReview) => {
    setEditingTestimonial(testimonial);
    setIsModalOpen(true);
  };

  const handleSaveTestimonial = async (formData: FormData) => {
    setIsModalOpen(false); // Close immediately for better UX
    startTransition(async () => {
      if (editingTestimonial) {
        // Edit Testimonial
        const res = await updateTestimonialServerAction(editingTestimonial.id, formData);
        if (res.success && res.data) {
          reload();
          showToast('تم تعديل التقييم بنجاح');
        } else {
          showToast(res.error || 'فشل تعديل التقييم', 'error');
        }
      } else {
        // Add Testimonial
        const res = await createTestimonialServerAction(formData);
        if (res.success && res.data) {
          setPage(1);
          reload();
          showToast('تم إضافة التقييم بنجاح');
        } else {
          showToast(res.error || 'فشل إضافة التقييم', 'error');
        }
      }
      setEditingTestimonial(null);
    });
  };

  const handleConfirmDelete = () => {
    if (!deleteTarget) return;

    const targetId = deleteTarget.id;
    setDeleteTarget(null); // Close modal immediately

    startTransition(async () => {
      const res = await deleteTestimonialServerAction(targetId);
      if (res.success) {
        // Deleting the only row of the last page would leave the user on an
        // empty page, so fall back to the previous one.
        if (testimonials.length === 1 && meta.page > 1) {
          setPage(meta.page - 1);
        } else {
          reload();
        }
        showToast('تم حذف التقييم بنجاح');
      } else {
        showToast(res.error || 'فشل حذف التقييم', 'error');
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
            <MessageSquareQuote className="w-5 h-5 text-amber-500" />
            إدارة تقييمات وآراء العملاء
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            آراء ومراجعات المهندسين والشركات حول خدمات ومنتجات المركز
          </p>
        </div>
        <button
          onClick={handleAddClick}
          disabled={isPending}
          className="px-4 py-2.5 rounded-2xl bg-primary text-primary-foreground font-bold text-xs flex items-center gap-2 shadow-md shadow-primary/20 hover:opacity-90 transition-all disabled:opacity-50"
        >
          <Plus className="w-4 h-4" />
          إضافة تقييم جديد
        </button>
      </div>

      {/* Grid List */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {testimonials.length === 0 ? (
          <div className="col-span-full bg-card border border-border/80 rounded-3xl p-12 text-center text-muted-foreground">
            <MessageSquareQuote className="w-12 h-12 mx-auto text-muted-foreground/30 mb-3" />
            <p className="text-sm font-bold">لا توجد تقييمات مضافة حالياً.</p>
            <p className="text-xs mt-1">اضغط على زر الإضافة لإدراج تقييم جديد بالسيرفر.</p>
          </div>
        ) : (
          testimonials.map((test) => (
            <div
              key={test.id}
              className="bg-card text-card-foreground border border-border rounded-3xl p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between space-y-5"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {test.image ? (
                      <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-primary/20 shadow-sm shrink-0">
                        <Image src={test.image} alt={test.name_ar} fill className="object-cover" />
                      </div>
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                        <Star className="w-5 h-5 text-primary" />
                      </div>
                    )}
                    <div>
                      <h4 className="font-bold text-sm text-foreground">{test.name_ar}</h4>
                      <span className="text-[10px] text-muted-foreground block dir-ltr text-left mt-0.5">
                        {test.name_en}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-0.5 text-amber-500">
                    <Star className="w-3.5 h-3.5 fill-current" />
                    <Star className="w-3.5 h-3.5 fill-current" />
                    <Star className="w-3.5 h-3.5 fill-current" />
                    <Star className="w-3.5 h-3.5 fill-current" />
                    <Star className="w-3.5 h-3.5 fill-current" />
                  </div>
                </div>

                <div className="bg-muted/40 p-4 rounded-2xl border border-border/50 relative">
                  <MessageSquareQuote className="w-6 h-6 text-muted-foreground/20 absolute top-2 right-2" />
                  <p className="text-xs text-foreground font-medium leading-relaxed italic mb-3 relative z-10">
                    "{test.review_ar}"
                  </p>
                  <div className="border-t border-border/50 pt-2 relative z-10">
                    <p className="text-[10px] text-muted-foreground leading-relaxed dir-ltr text-left">
                      "{test.review_en}"
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-border flex items-center justify-between">
                <span className="text-[10px] text-muted-foreground font-medium bg-muted px-2.5 py-1 rounded-full">
                  تاريخ: {new Date(test.create_at).toLocaleDateString('ar-EG')}
                </span>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleEditClick(test)}
                    disabled={isPending}
                    className="p-2 rounded-xl border border-input hover:bg-muted text-blue-600 transition-colors disabled:opacity-50"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeleteTarget(test)}
                    disabled={isPending}
                    className="p-2 rounded-xl border border-rose-500/20 text-rose-600 hover:bg-rose-500/10 transition-colors disabled:opacity-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
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
            idPrefix="cms-testimonials"
          />
        </div>
      )}

      <TestimonialModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveTestimonial}
        initialData={editingTestimonial}
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
