"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Search, Edit, Trash2, ChevronRight, X, Loader2, Database } from 'lucide-react';
import { 
  getDataReceptionsServerAction, 
  createDataReceptionServerAction, 
  updateDataReceptionServerAction, 
  deleteDataReceptionServerAction,
} from '@/actions/hr/data-receptions.actions';
import { getAllDeviceFingerprintsServerAction } from '@/actions/hr/device-fingerprints.actions';
import type { ApiDataReception, ApiDeviceFingerprint } from '@/types/api';
import { DeleteConfirmModal } from '@/components/dashboard/Modals';
import { ToastNotification, ToastMessage } from '@/components/ui/ToastNotification';
import { Pagination } from '@/components/ui/Pagination';
import { usePaginatedList } from '@/lib/use-paginated-list';

export default function DataReceptionPage() {
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
  } = usePaginatedList<ApiDataReception>(getDataReceptionsServerAction);

  // Dropdown options. These must be the *complete* lists: the paginated action
  // would silently cap them at the first 15 records, hiding valid options.
  const [devices, setDevices] = useState<ApiDeviceFingerprint[]>([]);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ApiDataReception | null>(null);
  const [toast, setToast] = useState<ToastMessage | null>(null);
  
  // Form State
  const [formData, setFormData] = useState({ 
    user_id: '' as string | number,
    timestamp: '',
    status: '',
    finger_print_data: '',
    device_finger_print: '' as string | number
  });

  // Dropdown options are fetched once and never paginated.
  useEffect(() => {
    let cancelled = false;
    const loadOptions = async () => {
      try {
        const [devices] = await Promise.all([
          getAllDeviceFingerprintsServerAction(),
        ]);
        if (cancelled) return;
        setDevices(devices);
      } catch (error) {
        console.error('Error loading dropdown options:', error);
      }
    };
    void loadOptions();
    return () => { cancelled = true; };
  }, []);

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData({ 
      user_id: '',
      timestamp: '',
      status: '',
      finger_print_data: '',
      device_finger_print: ''
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: ApiDataReception) => {
    setEditingId(item.id);
    
    // Format timestamp for datetime-local input (YYYY-MM-DDThh:mm)
    let formattedTimestamp = '';
    if (item.timestamp) {
      try {
        const dateObj = new Date(item.timestamp);
        formattedTimestamp = dateObj.toISOString().slice(0, 16);
      } catch (e) {
        formattedTimestamp = item.timestamp;
      }
    }

    setFormData({ 
      user_id: item.user_id ?? '',
      timestamp: formattedTimestamp,
      status: item.status || '',
      finger_print_data: item.finger_print_data || '',
      device_finger_print: item.device_finger_print ?? ''
    });
    setIsModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setIsSubmitting(true);
    try {
      const res = await deleteDataReceptionServerAction(deleteTarget.id);
      if (res.success) {
        // Deleting the only row of the last page would leave the user on an
        // empty page, so fall back to the previous one.
        if (filteredData.length === 1 && meta.page > 1) {
          setPage(meta.page - 1);
        } else {
          reload();
        }
        setToast({ type: 'success', message: 'تم الحذف بنجاح' });
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
      // Create ISO 8601 string if timestamp exists
      let finalTimestamp: string | null = null;
      if (formData.timestamp) {
        finalTimestamp = new Date(formData.timestamp).toISOString();
      }

      const payload = {
        user_id: formData.user_id ? Number(formData.user_id) : null,
        timestamp: finalTimestamp,
        status: formData.status,
        finger_print_data: formData.finger_print_data,
        device_finger_print: formData.device_finger_print ? Number(formData.device_finger_print) : null
      };

      if (editingId) {
        const res = await updateDataReceptionServerAction(editingId, payload);
        if (res.success && res.data) {
          reload();
          setIsModalOpen(false);
          setToast({ type: 'success', message: 'تم التعديل بنجاح' });
        } else {
          setToast({ type: 'error', message: res.error || 'فشل التعديل' });
        }
      } else {
        const res = await createDataReceptionServerAction(payload);
        if (res.success && res.data) {
          // A new record belongs on page 1, so return there to see it.
          setPage(1);
          reload();
          setIsModalOpen(false);
          setToast({ type: 'success', message: 'تمت الإضافة بنجاح' });
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

  const getDeviceName = (deviceId: number | null) => {
    if (!deviceId) return '—';
    const device = devices.find(d => d.id === deviceId);
    return device ? device.name : deviceId;
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
        <span className="text-foreground font-medium">استقبال البيانات</span>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">استقبال البيانات</h1>
          <p className="text-muted-foreground text-sm mt-1">إدارة بيانات البصمات الواردة من الأجهزة</p>
        </div>
        <button 
          onClick={handleOpenAdd}
          className="bg-primary text-primary-foreground px-4 py-2 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-primary/90 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          إضافة استقبال
        </button>
      </div>

      {/* Toolbar & Filters */}
      {/* <div className="bg-card border border-border rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input 
            type="text" 
            placeholder="بحث بالحالة، رقم المستخدم..." 
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
                <th className="px-6 py-4 font-bold">رقم المستخدم</th>
                <th className="px-6 py-4 font-bold">جهاز البصمة</th>
                <th className="px-6 py-4 font-bold">تاريخ البصمة</th>
                <th className="px-6 py-4 font-bold">الحالة</th>
                <th className="px-6 py-4 font-bold">بيانات البصمة</th>
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
                        <Database className="w-4 h-4 text-muted-foreground" />
                        {item.user_id || '—'}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground font-medium">{getDeviceName(item.device_finger_print)}</td>
                    <td className="px-6 py-4 text-muted-foreground" dir="ltr">
                      {item.timestamp ? new Date(item.timestamp).toLocaleString('en-US', { hour12: false }).replace(',', '') : '—'}
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {item.status ? (
                        <span className="bg-blue-500/10 text-blue-600 px-2 py-1 rounded-md text-xs font-bold">{item.status}</span>
                      ) : '—'}
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">{item.finger_print_data || '—'}</td>
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
                      لا توجد بيانات متاحة حالياً أو مطابقة للبحث.
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
              idPrefix="data-descriptions"
            />
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-card w-full max-w-2xl rounded-2xl shadow-xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h2 className="text-lg font-bold">{editingId ? 'تعديل البيانات' : 'إضافة استقبال بيانات جديد'}</h2>
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
                  <label className="text-sm font-bold text-foreground">رقم المستخدم <span className="text-red-500">*</span></label>
                  <input 
                    type="number"
                    required
                    value={formData.user_id}
                    onChange={(e) => setFormData({...formData, user_id: e.target.value})}
                    className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                    placeholder="مثال: 4"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-foreground">جهاز البصمة <span className="text-red-500">*</span></label>
                  <select 
                    required
                    value={formData.device_finger_print}
                    onChange={(e) => setFormData({...formData, device_finger_print: e.target.value})}
                    className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-foreground"
                  >
                    <option value="" disabled>-- اختر الجهاز --</option>
                    {devices.map(dev => (
                      <option key={dev.id} value={dev.id}>{dev.name}</option>
                    ))}
                  </select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-bold text-foreground">تاريخ ووقت البصمة <span className="text-red-500">*</span></label>
                  <input 
                    type="datetime-local"
                    required
                    dir="ltr"
                    value={formData.timestamp}
                    onChange={(e) => setFormData({...formData, timestamp: e.target.value})}
                    className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-left"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-foreground">الحالة</label>
                  <input 
                    type="text"
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                    className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                    placeholder="مثال: EWQEW"
                  />
                </div>

                <div className="space-y-2 sm:col-span-2">
                  <label className="text-sm font-bold text-foreground">بيانات البصمة</label>
                  <textarea 
                    value={formData.finger_print_data}
                    onChange={(e) => setFormData({...formData, finger_print_data: e.target.value})}
                    className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all resize-none h-24"
                    placeholder="مثال: QWEWQ..."
                  ></textarea>
                </div>

              </div>

              <div className="pt-6 flex gap-3">
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="flex-1 bg-primary text-primary-foreground font-bold py-2.5 rounded-xl flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors disabled:opacity-70"
                >
                  {editingId ? 'حفظ التعديلات' : 'إضافة الاستقبال'}
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
        title={deleteTarget ? `سجل مستخدم ${deleteTarget.user_id}` : ''}
      />

      {/* Floating Bottom Toast Notification */}
      <ToastNotification toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
