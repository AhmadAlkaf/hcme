"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Search, Edit, Trash2, ChevronRight, X, Loader2, Fingerprint } from 'lucide-react';
import { 
  getLawFingerprintersServerAction, 
  createLawFingerprinterServerAction, 
  updateLawFingerprinterServerAction, 
  deleteLawFingerprinterServerAction,
} from '@/actions/hr/law-fingerprinters.actions';
import { getAllShiftsServerAction } from '@/actions/hr/shifts.actions';
import type { 
  ApiLawFingerprinter, 
  ApiShift 
} from '@/types/api';
import { DeleteConfirmModal } from '@/components/dashboard/Modals';
import { ToastNotification, ToastMessage } from '@/components/ui/ToastNotification';
import { Pagination } from '@/components/ui/Pagination';
import { usePaginatedList } from '@/lib/use-paginated-list';

export default function LawFingerprinterPage() {
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
  } = usePaginatedList<ApiLawFingerprinter>(getLawFingerprintersServerAction);

  // Dropdown options. These must be the *complete* lists: the paginated action
  // would silently cap them at the first 15 records, hiding valid options.
  const [shifts, setShifts] = useState<ApiShift[]>([]);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ApiLawFingerprinter | null>(null);
  const [toast, setToast] = useState<ToastMessage | null>(null);
  
  // Form State
  const initialFormState = { 
    name: '', 
    shift: '', 
    time_from_which_fingerprint_entry_is_received: '', 
    entry_grace_period: '', 
    consider_absent_if_late_by: '', 
    early_departure_allowance: '', 
    last_time_to_accept_finger_print: '', 
    time_from_which_fingerprint_out_is_received: '', 
    deduct_for_missing_check_in: false, 
    deduct_for_missing_check_out: false 
  };
  const [formData, setFormData] = useState(initialFormState);

  // Dropdown options are fetched once and never paginated.
  useEffect(() => {
    let cancelled = false;
    const loadOptions = async () => {
      try {
        const [shifts] = await Promise.all([
          getAllShiftsServerAction(),
        ]);
        if (cancelled) return;
        setShifts(shifts);
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

  const handleOpenEdit = (item: ApiLawFingerprinter) => {
    setEditingId(item.id!);
    // Helper to extract HH:mm from HH:mm:ss if present
    const formatTime = (t: string | null) => t ? t.slice(0, 5) : '';
    setFormData({ 
      name: item.name,
      shift: item.shift?.toString() || '',
      time_from_which_fingerprint_entry_is_received: formatTime(item.time_from_which_fingerprint_entry_is_received),
      entry_grace_period: formatTime(item.entry_grace_period),
      consider_absent_if_late_by: formatTime(item.consider_absent_if_late_by),
      early_departure_allowance: formatTime(item.early_departure_allowance),
      last_time_to_accept_finger_print: formatTime(item.last_time_to_accept_finger_print),
      time_from_which_fingerprint_out_is_received: formatTime(item.time_from_which_fingerprint_out_is_received),
      deduct_for_missing_check_in: item.deduct_for_missing_check_in,
      deduct_for_missing_check_out: item.deduct_for_missing_check_out
    });
    setIsModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget || !deleteTarget.id) return;
    setIsSubmitting(true);
    try {
      const res = await deleteLawFingerprinterServerAction(deleteTarget.id);
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
    
    if (!formData.name) {
      setToast({ type: 'error', message: 'الرجاء إدخال  اسم القانون' });
      return;
    }
    
    setIsSubmitting(true);
    try {
      // Helper to append :00 for seconds if missing
      const toTime = (t: string) => t ? (t.length === 5 ? `${t}:00` : t) : null;

      const payload = {
        name: formData.name,
        shift: formData.shift ? Number(formData.shift) : null,
        time_from_which_fingerprint_entry_is_received: toTime(formData.time_from_which_fingerprint_entry_is_received),
        entry_grace_period: toTime(formData.entry_grace_period),
        consider_absent_if_late_by: toTime(formData.consider_absent_if_late_by),
        early_departure_allowance: toTime(formData.early_departure_allowance),
        last_time_to_accept_finger_print: toTime(formData.last_time_to_accept_finger_print),
        time_from_which_fingerprint_out_is_received: toTime(formData.time_from_which_fingerprint_out_is_received),
        deduct_for_missing_check_in: formData.deduct_for_missing_check_in,
        deduct_for_missing_check_out: formData.deduct_for_missing_check_out
      };

      if (editingId) {
        const res = await updateLawFingerprinterServerAction(editingId, payload);
        if (res.success && res.data) {
          reload();
          setIsModalOpen(false);
          setToast({ type: 'success', message: 'تم التعديل بنجاح' });
        } else {
          setToast({ type: 'error', message: res.error || 'فشل التعديل' });
        }
      } else {
        const res = await createLawFingerprinterServerAction(payload);
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
        <span className="text-foreground font-medium">أخصائي بصمات قانوني</span>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">أخصائي بصمات قانوني</h1>
          <p className="text-muted-foreground text-sm mt-1">إعدادات وقواعد فترات البصمة، التأخير، والسماح</p>
        </div>
        <button 
          onClick={handleOpenAdd}
          className="bg-primary text-primary-foreground px-4 py-2 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-primary/90 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          إضافة إعدادات
        </button>
      </div>

      {/* Toolbar & Filters */}
      {/* <div className="bg-card border border-border rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input 
            type="text" 
            placeholder="بحث باسم الإعداد..." 
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
                <th className="px-6 py-4 font-bold">الاسم</th>
                <th className="px-6 py-4 font-bold">الوردية</th>
                <th className="px-6 py-4 font-bold">فترة السماح بالدخول</th>
                <th className="px-6 py-4 font-bold">يُعتبر غائباً إذا تأخر بمقدار</th>
                <th className="px-6 py-4 font-bold text-left">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredData.length > 0 ? (
                filteredData.map((item, index) => {
                  const shiftName = shifts.find(s => s.id === item.shift)?.name || '—';

                  return (
                    <tr key={item.id} className="hover:bg-muted/30 transition-colors group">
                      <td className="px-6 py-4">{firstRowIndex + index}</td>
                      <td className="px-6 py-4 font-bold text-primary">
                        <div className="flex items-center gap-2">
                          <Fingerprint className="w-4 h-4 text-muted-foreground" />
                          {item.name}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">{shiftName}</td>
                      <td className="px-6 py-4 text-muted-foreground" dir="ltr">{item.entry_grace_period ? item.entry_grace_period.slice(0, 5) : '—'}</td>
                      <td className="px-6 py-4 text-muted-foreground" dir="ltr">{item.consider_absent_if_late_by ? item.consider_absent_if_late_by.slice(0, 5) : '—'}</td>
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
                      لا توجد سجلات مطابقة.
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
              idPrefix="legal-specialists"
            />
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200 overflow-y-auto">
          <div className="bg-card w-full max-w-4xl rounded-2xl shadow-xl overflow-visible animate-in zoom-in-95 duration-200 my-auto mt-10 mb-10">
            <div className="flex items-center justify-between p-4 border-b border-border sticky top-0 bg-card z-10">
              <h2 className="text-lg font-bold">{editingId ? 'تعديل إعدادات البصمة' : 'إضافة إعدادات جديدة'}</h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-muted-foreground hover:bg-muted rounded-xl transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 max-h-[75vh] overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                <div className="space-y-2">
                  <label className="text-sm font-bold text-foreground">اسم القانون <span className="text-red-500">*</span></label>
                  <input 
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                    placeholder="مثال: إعدادات الوردية الصباحية"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-foreground"> فترة الدوام</label>
                  <select 
                    value={formData.shift}
                    onChange={(e) => setFormData({...formData, shift: e.target.value})}
                    className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all appearance-none"
                  >
                    <option value="">بدون وردية (شاملة)</option>
                    {shifts.map(shift => (
                      <option key={shift.id} value={shift.id}>{shift.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-foreground">الوقت من حيث يتم استقبال بصمة الدخول</label>
                  <input 
                    type="time"
                    value={formData.time_from_which_fingerprint_entry_is_received}
                    onChange={(e) => setFormData({...formData, time_from_which_fingerprint_entry_is_received: e.target.value})}
                    className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-foreground">فترة السماح عند الحضور (بالدقائق)</label>
                  <input 
                    type="time"
                    value={formData.entry_grace_period}
                    onChange={(e) => setFormData({...formData, entry_grace_period: e.target.value})}
                    className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                  <p className="text-[11px] text-muted-foreground leading-tight">الوقت المسموح به للتأخير بعد بداية الدوام الرسمي دون احتساب تأخير.</p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-foreground">(بالدقائق)اعتبار الموظف غائبًا إذا تأخر لأكثر من</label>
                  <input 
                    type="time"
                    value={formData.consider_absent_if_late_by}
                    onChange={(e) => setFormData({...formData, consider_absent_if_late_by: e.target.value})}
                    className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                  <p className="text-[11px] text-muted-foreground leading-tight">إذا تجاوز تأخير الموظف هذه المدة، يتم تسجيله كـ (غياب) بدلاً من (تأخير).</p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-foreground">فترة السماح عند الانصراف المبكر (بالدقائق)</label>
                  <input 
                    type="time"
                    value={formData.early_departure_allowance}
                    onChange={(e) => setFormData({...formData, early_departure_allowance: e.target.value})}
                    className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                  <p className="text-[11px] text-muted-foreground leading-tight">الوقت المسموح به للموظف بالانصراف قبل نهاية الدوام الرسمي.</p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-foreground">الفترة الزمنية بين البصمتين</label>
                  <input 
                    type="time"
                    value={formData.last_time_to_accept_finger_print}
                    onChange={(e) => setFormData({...formData, last_time_to_accept_finger_print: e.target.value})}
                    className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                  <p className="text-[11px] text-muted-foreground leading-tight">المده الزمنية بحتساب البصمة الاخرى.</p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-foreground">الوقت من حيث يتم استقبال بصمة الخروج</label>
                  <input 
                    type="time"
                    value={formData.time_from_which_fingerprint_out_is_received}
                    onChange={(e) => setFormData({...formData, time_from_which_fingerprint_out_is_received: e.target.value})}
                    className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-3 cursor-pointer p-2.5 border border-border rounded-xl w-full hover:bg-muted/50 transition-colors">
                    <input 
                      type="checkbox"
                      checked={formData.deduct_for_missing_check_in}
                      onChange={(e) => setFormData({...formData, deduct_for_missing_check_in: e.target.checked})}
                      className="w-5 h-5 rounded text-primary focus:ring-primary focus:ring-offset-background shrink-0"
                    />
                    <span className="text-sm font-bold select-none">احتساب غياب عند نسيان بصمة الدخول؟</span>
                  </label>
                  <p className="text-[11px] text-muted-foreground px-2 leading-tight">إذا كان لدى الموظف بصمة خروج فقط، هل يتم اعتباره غائبًا؟</p>
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-3 cursor-pointer p-2.5 border border-border rounded-xl w-full hover:bg-muted/50 transition-colors">
                    <input 
                      type="checkbox"
                      checked={formData.deduct_for_missing_check_out}
                      onChange={(e) => setFormData({...formData, deduct_for_missing_check_out: e.target.checked})}
                      className="w-5 h-5 rounded text-primary focus:ring-primary focus:ring-offset-background shrink-0"
                    />
                    <span className="text-sm font-bold select-none">تطبيق إجراء عند نسيان بصمة الخروج؟</span>
                  </label>
                  <p className="text-[11px] text-muted-foreground px-2 leading-tight">إذا كان لدى الموظف بصمة دخول فقط، هل يتم تجاهل بصمة الخروج أو تطبيق إجراء معين؟</p>
                </div>

              </div>

              <div className="pt-8 flex gap-3">
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="flex-1 bg-primary text-primary-foreground font-bold py-2.5 rounded-xl flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors disabled:opacity-70"
                >
                  {editingId ? 'حفظ التعديلات' : 'إضافة الإعدادات'}
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
        title={deleteTarget?.name || 'هذا الإعداد'}
      />

      {/* Floating Bottom Toast Notification */}
      <ToastNotification toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
