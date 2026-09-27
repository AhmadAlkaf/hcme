"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { Plus, Search, Edit, Trash2, ChevronRight, X, Loader2, Fingerprint } from 'lucide-react';
import { 
  getDeviceFingerprintsServerAction, 
  createDeviceFingerprintServerAction, 
  updateDeviceFingerprintServerAction, 
  deleteDeviceFingerprintServerAction 
} from '@/actions/hr/device-fingerprints.actions';
import type { ApiDeviceFingerprint } from '@/types/api';
import { DeleteConfirmModal } from '@/components/dashboard/Modals';
import { ToastNotification, ToastMessage } from '@/components/ui/ToastNotification';
import { Pagination } from '@/components/ui/Pagination';
import { usePaginatedList } from '@/lib/use-paginated-list';

export default function DeviceFingerprintPage() {
  const {
    items: filteredData,
    meta,
    loading,
    search,
    setSearch,
    setPage,
    setPageSize,
    firstRowIndex,
    reload,
  } = usePaginatedList<ApiDeviceFingerprint>(getDeviceFingerprintsServerAction);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ApiDeviceFingerprint | null>(null);
  const [toast, setToast] = useState<ToastMessage | null>(null);
  
  // Form State
  const [formData, setFormData] = useState({ 
    name: '', 
    sn: '', 
    location: '', 
    ip_address: '', 
    port: '' as string | number, 
    password: '' 
  });

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData({ name: '', sn: '', location: '', ip_address: '', port: '', password: '' });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: ApiDeviceFingerprint) => {
    setEditingId(item.id);
    setFormData({ 
      name: item.name, 
      sn: item.sn, 
      location: item.location, 
      ip_address: item.ip_address, 
      port: item.port ?? '', 
      password: item.password || '' 
    });
    setIsModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setIsSubmitting(true);
    try {
      const res = await deleteDeviceFingerprintServerAction(deleteTarget.id);
      if (res.success) {
        // Deleting the only row of the last page would leave the user on an
        // empty page, so fall back to the previous one.
        if (filteredData.length === 1 && meta.page > 1) {
          setPage(meta.page - 1);
        } else {
          reload();
        }
        setToast({ type: 'success', message: 'تم حذف جهاز البصمة بنجاح' });
      } else {
        setToast({ type: 'error', message: res.error || 'فشل الحذف' });
      }
    } catch (error) {
      setToast({ type: 'error', message: (error instanceof Error ? (error instanceof Error ? error.message : undefined) : undefined) || 'حدث خطأ أثناء الحذف' });
    } finally {
      setIsSubmitting(false);
      setDeleteTarget(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const payload = {
        name: formData.name,
        sn: formData.sn,
        location: formData.location,
        ip_address: formData.ip_address,
        port: formData.port ? Number(formData.port) : null,
        password: formData.password
      };

      if (editingId) {
        const res = await updateDeviceFingerprintServerAction(editingId, payload);
        if (res.success && res.data) {
          reload();
          setIsModalOpen(false);
          setToast({ type: 'success', message: 'تم تعديل بيانات جهاز البصمة بنجاح' });
        } else {
          setToast({ type: 'error', message: res.error || 'فشل التعديل' });
        }
      } else {
        const res = await createDeviceFingerprintServerAction(payload);
        if (res.success && res.data) {
          // A new record belongs on page 1, so return there to see it.
          setPage(1);
          reload();
          setIsModalOpen(false);
          setToast({ type: 'success', message: 'تمت إضافة جهاز البصمة بنجاح' });
        } else {
          setToast({ type: 'error', message: res.error || 'فشل الإضافة' });
        }
      }
    } catch (error) {
      setToast({ type: 'error', message: (error instanceof Error ? (error instanceof Error ? error.message : undefined) : undefined) || 'حدث خطأ' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 relative">
      {/* Global submitting overlay */}
      {isSubmitting && (
        <div className="fixed inset-0 z-[200] bg-black/40 backdrop-blur-xs flex items-center justify-center">
          <div className="bg-card border border-border p-6 rounded-3xl shadow-xl flex items-center gap-3 text-sm font-bold text-foreground">
            <Loader2 className="w-5 h-5 text-primary animate-spin" />
            <span>جاري معالجة طلبك</span>
          </div>
        </div>
      )}

      {/* Breadcrumb */}
      <div className="flex items-center text-sm text-muted-foreground gap-2">
        <Link href="/dashboard/hr" className="hover:text-primary transition-colors">الموارد البشرية</Link>
        <ChevronRight className="w-4 h-4" />
        <span className="text-foreground font-medium">أجهزة البصمة</span>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">أجهزة البصمة</h1>
          <p className="text-muted-foreground text-sm mt-1">إدارة أجهزة البصمة الخاصة بالحضور والانصراف</p>
        </div>
        <button 
          onClick={handleOpenAdd}
          className="bg-primary text-primary-foreground px-4 py-2 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-primary/90 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          إضافة جهاز بصمة
        </button>
      </div>

      {/* Toolbar & Filters */}
      {/* <div className="bg-card border border-border rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input 
            type="text" 
            placeholder="بحث بالاسم، السيريال، الموقع..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-background border border-border rounded-xl pl-4 pr-10 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
          />
        </div>
      </div> */}

      {/* Data Table Container */}
      <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden min-h-[300px] relative">
        {loading ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-card/80 backdrop-blur-sm z-10">
            <Loader2 className="w-8 h-8 animate-spin text-primary mb-2" />
            <span className="text-sm font-medium text-muted-foreground">جاري تحميل البيانات...</span>
          </div>
        ) : null}

        <div className="overflow-x-auto">
          <table className="w-full text-right text-sm">
            <thead className="bg-muted/50 text-muted-foreground">
              <tr>
                <th className="px-6 py-4 font-bold">#</th>
                <th className="px-6 py-4 font-bold">اسم الجهاز</th>
                <th className="px-6 py-4 font-bold">السيريال (SN)</th>
                <th className="px-6 py-4 font-bold">IP Address</th>
                <th className="px-6 py-4 font-bold">المنفذ</th>
                <th className="px-6 py-4 font-bold">الموقع</th>
                <th className="px-6 py-4 font-bold text-left">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredData.length > 0 ? (
                filteredData.map((item, index) => (
                  <tr key={item.id} className="hover:bg-muted/30 transition-colors group">
                    <td className="px-6 py-4">{firstRowIndex + index}</td>
                    <td className="px-6 py-4 font-bold text-primary">
                      <div className="flex items-center gap-2">
                        <Fingerprint className="w-4 h-4 text-muted-foreground" />
                        {item.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">{item.sn}</td>
                    <td className="px-6 py-4 text-muted-foreground" dir="ltr">{item.ip_address}</td>
                    <td className="px-6 py-4 text-muted-foreground">{item.port || '—'}</td>
                    <td className="px-6 py-4 text-muted-foreground">{item.location}</td>
                    <td className="px-6 py-4 text-left">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => handleOpenEdit(item)}
                          className="p-2 text-muted-foreground hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => setDeleteTarget(item)}
                          className="p-2 text-muted-foreground hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                !loading && (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-muted-foreground font-medium">
                      لا توجد أجهزة مضافة حالياً أو مطابقة للبحث.
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        </div>
        {meta.totalPages > 0 && (
          <div className="p-4 border-t border-border">
            <Pagination
              meta={meta}
              onPageChange={setPage}
              onPageSizeChange={setPageSize}
              idPrefix="device-fingerprints"
            />
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-card w-full max-w-2xl rounded-2xl shadow-xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h2 className="text-lg font-bold">{editingId ? 'تعديل جهاز البصمة' : 'إضافة جهاز بصمة جديد'}</h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-muted-foreground hover:bg-muted rounded-xl transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-foreground">اسم الجهاز <span className="text-red-500">*</span></label>
                  <input 
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                    placeholder="مثال: جهاز الإدارة"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-bold text-foreground">السيريال (SN) <span className="text-red-500">*</span></label>
                  <input 
                    type="text"
                    required
                    value={formData.sn}
                    onChange={(e) => setFormData({...formData, sn: e.target.value})}
                    className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                    placeholder="مثال: AFK92104820"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-foreground">الموقع <span className="text-red-500">*</span></label>
                  <input 
                    type="text"
                    required
                    value={formData.location}
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                    className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                    placeholder="مثال: العامة"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-foreground">عنوان IP <span className="text-red-500">*</span></label>
                  <input 
                    type="text"
                    required
                    dir="ltr"
                    value={formData.ip_address}
                    onChange={(e) => setFormData({...formData, ip_address: e.target.value})}
                    className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-left"
                    placeholder="192.168.1.201"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-foreground">المنفذ (Port)</label>
                  <input 
                    type="number"
                    dir="ltr"
                    value={formData.port}
                    onChange={(e) => setFormData({...formData, port: e.target.value})}
                    className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-left"
                    placeholder="4370"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-foreground">كلمة المرور</label>
                  <input 
                    type="text"
                    dir="ltr"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-left"
                    placeholder="123456"
                  />
                </div>
              </div>

              <div className="pt-6 flex gap-3">
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="flex-1 bg-primary text-primary-foreground font-bold py-2.5 rounded-xl flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors disabled:opacity-70"
                >
                  {editingId ? 'حفظ التعديلات' : 'إضافة الجهاز'}
                </button>
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 bg-muted text-muted-foreground font-bold py-2.5 rounded-xl hover:bg-muted/80 hover:text-foreground transition-colors"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reusable Delete Modal */}
      <DeleteConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        title={deleteTarget ? deleteTarget.name : ''}
      />

      {/* Floating Bottom Toast Notification */}
      <ToastNotification toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
