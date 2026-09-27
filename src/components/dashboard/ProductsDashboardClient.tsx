'use client';

import React, { useMemo, useState } from 'react';
import { ProductsSection } from '@/components/dashboard/ProductsSection';
import { ProductModal, DeleteConfirmModal, NewUnitInput } from '@/components/dashboard/Modals';
import { ApiProduct, ApiAgent, ApiDepartment } from '@/types/api';
import { 
  createProductServerAction, 
  updateProductServerAction, 
  deleteProductServerAction,
  addProductImageServerAction,
  deleteProductImageServerAction,
  createProductUnitServerAction,
  deleteProductUnitServerAction,
  getProductByIdServerAction,
  getProductsServerAction
} from '@/actions/products.actions';
import { Loader2 } from 'lucide-react';
import { ToastNotification, ToastMessage } from '@/components/ui/ToastNotification';
import { usePaginatedList } from '@/lib/use-paginated-list';

interface ProductsDashboardClientProps {
  /** Kept for the product modal, which groups departments under their agent. */
  agents: ApiAgent[];
  /** Filter options and the department column's lookup table. */
  departments: ApiDepartment[];
}

export default function ProductsDashboardClient({
  agents = [],
  departments = [],
}: ProductsDashboardClientProps) {
  const {
    items: fetchedProducts,
    meta,
    setFilter,
    setPage,
    setPageSize,
    reload,
  } = usePaginatedList<ApiProduct>(getProductsServerAction);

  // Toggling `is_active` is applied optimistically. Keeping the override in a
  // map — instead of a second copy of the list — means a refetch can never
  // leave two sources of truth out of sync.
  const [activeOverrides, setActiveOverrides] = useState<Record<number, boolean>>({});

  const products = useMemo(
    () =>
      fetchedProducts.map((product) =>
        product.id in activeOverrides
          ? { ...product, is_active: activeOverrides[product.id] }
          : product
      ),
    [fetchedProducts, activeOverrides]
  );

  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ApiProduct | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ApiProduct | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<ToastMessage | null>(null);

  const handleSaveProduct = async (
    formData: FormData,
    newSubImages: File[],
    deletedSubImageIds: number[],
    newUnits: NewUnitInput[],
    deletedUnitIds: number[]
  ) => {
    setIsSubmitting(true);
    try {
      let productId: number | string | undefined;
      const isEditing = !!editingProduct;

      if (editingProduct) {
        // Update product
        const res = await updateProductServerAction(editingProduct.id, formData);
        if (res.success && res.data) {
          productId = res.data.id;
        } else {
          setToast({ type: 'error', message: res.error || 'حدث خطأ أثناء تعديل بيانات المنتج' });
          return;
        }
      } else {
        // Create product
        const res = await createProductServerAction(formData);
        if (res.success && res.data) {
          productId = res.data.id;
        } else {
          setToast({ type: 'error', message: res.error || 'حدث خطأ أثناء إضافة المنتج الجديد' });
          return;
        }
      }

      if (productId) {
        // 1. Delete removed sub-images
        if (deletedSubImageIds && deletedSubImageIds.length > 0) {
          for (const imgId of deletedSubImageIds) {
            await deleteProductImageServerAction(imgId);
          }
        }

        // 2. Upload new sub-images to /products/productimage/
        if (newSubImages && newSubImages.length > 0) {
          for (const file of newSubImages) {
            const imgRes = await addProductImageServerAction(productId, file);
            if (!imgRes.success) {
              setToast({ type: 'error', message: imgRes.error || 'فشل رفع إحدى الصور الفرعية للمنتج' });
            }
          }
        }

        // 3. Delete removed units
        if (deletedUnitIds && deletedUnitIds.length > 0) {
          for (const unitId of deletedUnitIds) {
            await deleteProductUnitServerAction(unitId);
          }
        }

        // 4. Create new units to /products/unit/
        if (newUnits && newUnits.length > 0) {
          for (const unit of newUnits) {
            const unitRes = await createProductUnitServerAction({
              name_unit_ar: unit.name_unit_ar,
              name_unit_en: unit.name_unit_en,
              price: unit.price,
              is_active: unit.is_active,
              product: productId,
            });
            if (!unitRes.success) {
              setToast({ type: 'error', message: unitRes.error || 'فشل إضافة إحدى وحدات المنتج' });
            }
          }
        }

        // 5. Fetch latest product with full updated product_images and name_uint
        const updatedProduct = await getProductByIdServerAction(productId);
        if (updatedProduct) {
          if (isEditing) {
            setToast({ type: 'success', message: 'تم تعديل بيانات المنتج والوحدات بنجاح ⚡' });
            reload();
          } else {
            setToast({ type: 'success', message: 'تمت إضافة المنتج والوحدات بنجاح ⚡' });
            // A new product belongs on page 1, so return there to see it.
            setPage(1);
            reload();
          }
        } else {
          setToast({ type: 'success', message: isEditing ? 'تم التعديل بنجاح' : 'تمت الإضافة بنجاح' });
        }
      }
    } catch (error) {
      console.error('Error saving product:', error);
      setToast({ type: 'error', message: (error instanceof Error ? error.message : undefined) || 'فشلت العملية، يرجى المحاولة مرة أخرى' });
    } finally {
      setIsSubmitting(false);
      setEditingProduct(null);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setIsSubmitting(true);
    try {
      const res = await deleteProductServerAction(deleteTarget.id);
      if (res.success) {
        // Deleting the only row of the last page would leave the user on an
        // empty page, so fall back to the previous one.
        if (products.length === 1 && meta.page > 1) {
          setPage(meta.page - 1);
        } else {
          reload();
        }
        setToast({ type: 'success', message: 'تم حذف المنتج بنجاح 🗑️' });
      } else {
        setToast({ type: 'error', message: res.error || 'حدث خطأ أثناء حذف المنتج من السيرفر' });
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      setToast({ type: 'error', message: (error instanceof Error ? error.message : undefined) || 'فشل حذف المنتج، يرجى التحقق من الاتصال بالشبكة' });
    } finally {
      setIsSubmitting(false);
      setDeleteTarget(null);
    }
  };

  const handleFilterChange = (departmentId: string) => {
    setFilter('department', departmentId === 'all' ? undefined : departmentId);
  };

  const handleToggleActive = async (product: ApiProduct, newStatus: boolean) => {
    // Optimistic update
    setActiveOverrides((prev) => ({ ...prev, [product.id]: newStatus }));

    try {
      const formData = new FormData();
      formData.append('is_active', String(newStatus));
      
      const res = await updateProductServerAction(product.id, formData);
      if (!res.success) {
        // Revert on failure
        setActiveOverrides((prev) => {
          const next = { ...prev };
          delete next[product.id];
          return next;
        });
        setToast({ type: 'error', message: res.error || 'فشل في تغيير حالة المنتج' });
      } else {
        setToast({ type: 'success', message: 'تم تحديث حالة المنتج بنجاح' });
      }
    } catch (error) {
      console.error('Error toggling product active status:', error);
      // Revert on failure
      setActiveOverrides((prev) => {
        const next = { ...prev };
        delete next[product.id];
        return next;
      });
      setToast({ type: 'error', message: 'حدث خطأ أثناء تغيير حالة المنتج' });
    }
  };

  return (
    <div className="relative">
      {/* Global loading spinner overlay during submit/delete */}
      {isSubmitting && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center">
          <div className="bg-card border border-border p-6 rounded-3xl shadow-xl flex items-center gap-3 text-sm font-bold text-foreground">
            <Loader2 className="w-5 h-5 text-primary animate-spin" />
            <span>جاري معالجة طلبك</span>
          </div>
        </div>
      )}

      <ProductsSection
        products={products}
        departments={departments}
        meta={meta}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
        onFilterChange={handleFilterChange}
        onToggleActive={handleToggleActive}
        onAddProduct={() => {
          setEditingProduct(null);
          setIsProductModalOpen(true);
        }}
        onEditProduct={(prod) => {
          setEditingProduct(prod);
          setIsProductModalOpen(true);
        }}
        onDeleteProduct={(prod) => setDeleteTarget(prod)}
      />

      <ProductModal
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
        onSave={handleSaveProduct}
        initialData={editingProduct}
        agents={agents}
      />

      <DeleteConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        title={deleteTarget ? (deleteTarget.name_product_ar || deleteTarget.name_product_en) : ''}
      />

      {/* Floating Bottom Toast Notification */}
      <ToastNotification toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
