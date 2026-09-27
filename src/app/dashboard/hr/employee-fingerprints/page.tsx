"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Search, Edit, Trash2, ChevronRight, X, Loader2, Fingerprint, User } from 'lucide-react';
import { 
  getEmployeeFingerprintsServerAction, 
  createEmployeeFingerprintServerAction, 
  updateEmployeeFingerprintServerAction, 
  deleteEmployeeFingerprintServerAction,
} from '@/actions/hr/employee-fingerprints.actions';
import { getAllEmployeesServerAction } from '@/actions/hr/employees.actions';
import { getAllDeviceFingerprintsServerAction } from '@/actions/hr/device-fingerprints.actions';
import type { 
  ApiEmployeeFingerprint, 
  ApiEmployee, 
  ApiDeviceFingerprint 
} from '@/types/api';
import { DeleteConfirmModal } from '@/components/dashboard/Modals';
import { ToastNotification, ToastMessage } from '@/components/ui/ToastNotification';
import { Pagination } from '@/components/ui/Pagination';
import { usePaginatedList } from '@/lib/use-paginated-list';

export default function EmployeeFingerprintsPage() {
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
  } = usePaginatedList<ApiEmployeeFingerprint>(getEmployeeFingerprintsServerAction);

  // Dropdown options. These must be the *complete* lists: the paginated action
  // would silently cap them at the first 15 records, hiding valid options.
  const [employees, setEmployees] = useState<ApiEmployee[]>([]);
  const [devices, setDevices] = useState<ApiDeviceFingerprint[]>([]);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ApiEmployeeFingerprint | null>(null);
  const [toast, setToast] = useState<ToastMessage | null>(null);
  
  // Form State
  const initialFormState = { 
    finger_print_id: '', 
    finger_print_data: '', 
    employee: '', 
    device_finger_print: '' 
  };
  const [formData, setFormData] = useState(initialFormState);

  // Dropdown options are fetched once and never paginated.
  useEffect(() => {
    let cancelled = false;
    const loadOptions = async () => {
      try {
        const [employees, devices] = await Promise.all([
          getAllEmployeesServerAction(),
          getAllDeviceFingerprintsServerAction(),
        ]);
        if (cancelled) return;
        setEmployees(employees);
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
    setFormData(initialFormState);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: ApiEmployeeFingerprint) => {
    setEditingId(item.id!);
    setFormData({ 
      finger_print_id: item.finger_print_id, 
      finger_print_data: item.finger_print_data,
      employee: item.employee?.toString() || '',
      device_finger_print: item.device_finger_print?.toString() || '',
    });
    setIsModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget || !deleteTarget.id) return;
    setIsSubmitting(true);
    try {
      const res = await deleteEmployeeFingerprintServerAction(deleteTarget.id);
      if (res.success) {
        // Deleting the only row of the last page would leave the user on an
        // empty page, so fall back to the previous one.
        if (filteredData.length === 1 && meta.page > 1) {
          setPage(meta.page - 1);
        } else {
          reload();
        }
        setToast({ type: 'success', message: 'تم حذف بصمة الموظف بنجاح' });
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
        finger_print_id: formData.finger_print_id,
        finger_print_data: formData.finger_print_data,
        employee: formData.employee ? Number(formData.employee) : null,
        device_finger_print: formData.device_finger_print ? Number(formData.device_finger_print) : null
      };

      if (editingId) {
        const res = await updateEmployeeFingerprintServerAction(editingId, payload);
        if (res.success && res.data) {
          reload();
          setIsModalOpen(false);
          setToast({ type: 'success', message: 'تم تعديل بيانات البصمة بنجاح' });
        } else {
          setToast({ type: 'error', message: res.error || 'فشل التعديل' });
        }
      } else {
        const res = await createEmployeeFingerprintServerAction(payload);
        if (res.success && res.data) {
          // A new record belongs on page 1, so return there to see it.
          setPage(1);
          reload();
          setIsModalOpen(false);
          setToast({ type: 'success', message: 'تمت إضافة البصمة بنجاح' });
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
        <span className="text-foreground font-medium">بصمة الموظف</span>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">بصمة الموظف</h1>
          <p className="text-muted-foreground text-sm mt-1">إدارة البصمات الحيوية للموظفين وارتباطها بالأجهزة</p>
        </div>
        <button 
          onClick={handleOpenAdd}
          className="bg-primary text-primary-foreground px-4 py-2 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-primary/90 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          إضافة بصمة
        </button>
      </div>

      {/* Toolbar & Filters */}
      {/* <div className="bg-card border border-border rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input 
            type="text" 
            placeholder="بحث باسم الموظف أو رقم البصمة..." 
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
                <th className="px-6 py-4 font-bold">اسم الموظف</th>
                <th className="px-6 py-4 font-bold">رقم البصمة</th>
                <th className="px-6 py-4 font-bold">بيانات البصمة</th>
                <th className="px-6 py-4 font-bold">جهاز البصمة</th>
                <th className="px-6 py-4 font-bold text-left">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredData.length > 0 ? (
                filteredData.map((item, index) => {
                  const employeeName = item.employee_name || employees.find(e => e.id == item.employee)?.name || '—';
                  const deviceName = devices.find(d => d.id == item.device_finger_print)?.name || '—';

                  return (
                    <tr key={item.id} className="hover:bg-muted/30 transition-colors group">
                      <td className="px-6 py-4">{firstRowIndex + index}</td>
                      <td className="px-6 py-4 font-bold text-primary">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-muted-foreground" />
                          {employeeName}
                        </div>
                      </td>
                      <td className="px-6 py-4 font-bold text-foreground">
                        <div className="flex items-center gap-2">
                          <Fingerprint className="w-4 h-4 text-primary" />
                          {item.finger_print_id || '—'}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-muted-foreground truncate max-w-[200px]" title={item.finger_print_data}>
                        {item.finger_print_data || '—'}
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">{deviceName}</td>
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
                  )
                })
              ) : (
                !loading && (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground font-medium">
                      لا يوجد بيانات مطابقة للبحث أو لم تتم إضافة بصمات بعد.
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
              idPrefix="employee-fingerprints"
            />
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200 overflow-y-auto">
          <div className="bg-card w-full max-w-2xl rounded-2xl shadow-xl overflow-hidden animate-in zoom-in-95 duration-200 my-auto">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h2 className="text-lg font-bold">{editingId ? 'تعديل بصمة الموظف' : 'إضافة بصمة جديدة'}</h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-muted-foreground hover:bg-muted rounded-xl transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                <div className="space-y-2">
                  <label className="text-sm font-bold text-foreground">الموظف <span className="text-red-500">*</span></label>
                  <select 
                    required
                    value={formData.employee}
                    onChange={(e) => setFormData({...formData, employee: e.target.value})}
                    className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all appearance-none"
                  >
                    <option value="">اختر الموظف</option>
                    {employees.map(emp => (
                      <option key={emp.id} value={emp.id}>{emp.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-foreground">جهاز البصمة <span className="text-red-500">*</span></label>
                  <select 
                    required
                    value={formData.device_finger_print}
                    onChange={(e) => setFormData({...formData, device_finger_print: e.target.value})}
                    className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all appearance-none"
                  >
                    <option value="">اختر الجهاز</option>
                    {devices.map(dev => (
                      <option key={dev.id} value={dev.id}>{dev.name} ({dev.sn})</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-bold text-foreground">رقم البصمة (ID) <span className="text-red-500">*</span></label>
                  <input 
                    type="text"
                    required
                    value={formData.finger_print_id}
                    onChange={(e) => setFormData({...formData, finger_print_id: e.target.value})}
                    className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                    placeholder="مثال: 12345"
                  />
                </div>
                
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-bold text-foreground">بيانات البصمة (Data) <span className="text-red-500">*</span></label>
                  <textarea 
                    required
                    rows={4}
                    value={formData.finger_print_data}
                    onChange={(e) => setFormData({...formData, finger_print_data: e.target.value})}
                    className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all resize-none"
                    placeholder="أدخل الكود الممثل للبصمة..."
                  ></textarea>
                </div>

              </div>

              <div className="pt-8 flex gap-3">
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="flex-1 bg-primary text-primary-foreground font-bold py-2.5 rounded-xl flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors disabled:opacity-70"
                >
                  {editingId ? 'حفظ التعديلات' : 'إضافة البصمة'}
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
        title={deleteTarget ? (deleteTarget.employee_name || 'هذه البصمة') : ''}
      />

      {/* Floating Bottom Toast Notification */}
      <ToastNotification toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
