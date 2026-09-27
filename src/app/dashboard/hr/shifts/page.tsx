"use client";
import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Plus, Search, Edit, Trash2, ChevronRight, X, Loader2, Clock, CalendarDays, Users, Check, ChevronDown } from 'lucide-react';
import {
  getShiftsServerAction,
  createShiftServerAction,
  updateShiftServerAction,
  deleteShiftServerAction,
} from '@/actions/hr/shifts.actions';
import { getAllEmployeesServerAction } from '@/actions/hr/employees.actions';
import type {
  ApiShift,
  ApiEmployee
} from '@/types/api';
import { DeleteConfirmModal } from '@/components/dashboard/Modals';
import { ToastNotification, ToastMessage } from '@/components/ui/ToastNotification';
import { Pagination } from '@/components/ui/Pagination';
import { usePaginatedList } from '@/lib/use-paginated-list';

// Days mapping based on user input
const DAYS_MAPPING = [
  { id: 1, name: 'السبت' },
  { id: 2, name: 'الأحد' },
  { id: 3, name: 'الإثنين' },
  { id: 4, name: 'الثلاثاء' },
  { id: 5, name: 'الأربعاء' },
  { id: 6, name: 'الخميس' },
  { id: 7, name: 'الجمعة' },
];

export default function ShiftsPage() {
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
  } = usePaginatedList<ApiShift>(getShiftsServerAction);

  // Dropdown options. These must be the *complete* lists: the paginated action
  // would silently cap them at the first 15 records, hiding valid options.
  const [employees, setEmployees] = useState<ApiEmployee[]>([]);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ApiShift | null>(null);
  const [toast, setToast] = useState<ToastMessage | null>(null);

  // Form State
  const initialFormState = {
    name: '',
    start_time: '',
    end_time: '',
    days: [] as number[],
    employees: [] as number[]
  };
  const [formData, setFormData] = useState(initialFormState);

  // Custom Dropdowns States
  const [isDaysDropdownOpen, setIsDaysDropdownOpen] = useState(false);
  const [isEmployeesDropdownOpen, setIsEmployeesDropdownOpen] = useState(false);
  const daysDropdownRef = useRef<HTMLDivElement>(null);
  const employeesDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (daysDropdownRef.current && !daysDropdownRef.current.contains(event.target as Node)) {
        setIsDaysDropdownOpen(false);
      }
      if (employeesDropdownRef.current && !employeesDropdownRef.current.contains(event.target as Node)) {
        setIsEmployeesDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Dropdown options are fetched once and never paginated.
  useEffect(() => {
    let cancelled = false;
    const loadOptions = async () => {
      try {
        const [employees] = await Promise.all([
          getAllEmployeesServerAction(),
        ]);
        if (cancelled) return;
        setEmployees(employees);
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
    setIsDaysDropdownOpen(false);
    setIsEmployeesDropdownOpen(false);
  };

  const handleOpenEdit = (item: ApiShift) => {
    setEditingId(item.id!);
    // Format time if it has seconds e.g. "23:01:00" -> "23:01"
    const formatTime = (time: string | null) => time ? time.slice(0, 5) : '';
    setFormData({
      name: item.name,
      start_time: formatTime(item.start_time),
      end_time: formatTime(item.end_time),
      days: item.days || [],
      employees: item.employees || [],
    });
    setIsModalOpen(true);
    setIsDaysDropdownOpen(false);
    setIsEmployeesDropdownOpen(false);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget || !deleteTarget.id) return;
    setIsSubmitting(true);
    try {
      const res = await deleteShiftServerAction(deleteTarget.id);
      if (res.success) {
        // Deleting the only row of the last page would leave the user on an
        // empty page, so fall back to the previous one.
        if (filteredData.length === 1 && meta.page > 1) {
          setPage(meta.page - 1);
        } else {
          reload();
        }
        setToast({ type: 'success', message: 'تم حذف الوردية بنجاح' });
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
      setToast({ type: 'error', message: 'الرجاء إدخال اسم الوردية' });
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        name: formData.name,
        // Append :00 for seconds if missing
        start_time: formData.start_time ? (formData.start_time.length === 5 ? `${formData.start_time}:00` : formData.start_time) : null,
        end_time: formData.end_time ? (formData.end_time.length === 5 ? `${formData.end_time}:00` : formData.end_time) : null,
        days: formData.days,
        employees: formData.employees
      };

      if (editingId) {
        const res = await updateShiftServerAction(editingId, payload);
        if (res.success && res.data) {
          reload();
          setIsModalOpen(false);
          setToast({ type: 'success', message: 'تم تعديل بيانات الوردية بنجاح' });
        } else {
          setToast({ type: 'error', message: res.error || 'فشل التعديل' });
        }
      } else {
        const res = await createShiftServerAction(payload);
        if (res.success && res.data) {
          // A new record belongs on page 1, so return there to see it.
          setPage(1);
          reload();
          setIsModalOpen(false);
          setToast({ type: 'success', message: 'تمت إضافة الوردية بنجاح' });
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

  const toggleDaySelection = (id: number) => {
    setFormData(prev => {
      if (prev.days.includes(id)) {
        return { ...prev, days: prev.days.filter(d => d !== id) };
      }
      return { ...prev, days: [...prev.days, id] };
    });
  };

  const toggleEmployeeSelection = (id: number) => {
    setFormData(prev => {
      if (prev.employees.includes(id)) {
        return { ...prev, employees: prev.employees.filter(e => e !== id) };
      }
      return { ...prev, employees: [...prev.employees, id] };
    });
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
        <span className="text-foreground font-medium">الورديات</span>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">الورديات</h1>
          <p className="text-muted-foreground text-sm mt-1">إدارة أوقات العمل والأيام وتعيين الموظفين عليها</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="bg-primary text-primary-foreground px-4 py-2 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-primary/90 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          إضافة وردية
        </button>
      </div>

      {/* Toolbar & Filters */}
      {/* <div className="bg-card border border-border rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="بحث باسم الوردية..."
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
                <th className="px-6 py-4 font-bold">اسم الوردية</th>
                <th className="px-6 py-4 font-bold">أوقات العمل</th>
                <th className="px-6 py-4 font-bold">أيام العمل</th>
                <th className="px-6 py-4 font-bold">عدد الموظفين</th>
                <th className="px-6 py-4 font-bold text-left">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredData.length > 0 ? (
                filteredData.map((item, index) => {
                  const daysNames = item.days?.map(dId => DAYS_MAPPING.find(dm => dm.id === dId)?.name).filter(Boolean).join('، ') || 'غير محدد';
                  const startTime = item.start_time?.slice(0, 5) || '--:--';
                  const endTime = item.end_time?.slice(0, 5) || '--:--';

                  return (
                    <tr key={item.id} className="hover:bg-muted/30 transition-colors group">
                      <td className="px-6 py-4">{firstRowIndex + index}</td>
                      <td className="px-6 py-4 font-bold text-primary">{item.name}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 font-medium text-foreground">
                          <Clock className="w-4 h-4 text-muted-foreground" />
                          <span className="bg-background border border-border px-2 py-0.5 rounded-md text-xs" dir="ltr">{startTime}</span>
                          <span className="text-muted-foreground">-</span>
                          <span className="bg-background border border-border px-2 py-0.5 rounded-md text-xs" dir="ltr">{endTime}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-muted-foreground truncate max-w-[200px]" title={daysNames}>
                        <div className="flex items-center gap-2">
                          <CalendarDays className="w-4 h-4 shrink-0 text-muted-foreground" />
                          <span className="truncate">{daysNames}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-medium text-foreground">
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-muted-foreground" />
                          <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-md">{item.employees?.length || 0}</span>
                        </div>
                      </td>
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
                      لا توجد بيانات مطابقة للبحث أو لم تتم إضافة ورديات بعد.
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
              idPrefix="shifts"
            />
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200 overflow-y-auto">
          <div className="bg-card w-full max-w-2xl rounded-2xl shadow-xl overflow-visible animate-in zoom-in-95 duration-200 my-auto">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h2 className="text-lg font-bold">{editingId ? 'تعديل الوردية' : 'إضافة وردية جديدة'}</h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-muted-foreground hover:bg-muted rounded-xl transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                {/* Name */}
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-bold text-foreground">اسم الوردية <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                    placeholder="مثال: الوردية الصباحية"
                  />
                </div>

                {/* Start Time */}
                <div className="space-y-2">
                  <label className="text-sm font-bold text-foreground">وقت الحضور</label>
                  <input
                    type="time"
                    value={formData.start_time}
                    onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                    className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                </div>

                {/* End Time */}
                <div className="space-y-2">
                  <label className="text-sm font-bold text-foreground">وقت الانصراف</label>
                  <input
                    type="time"
                    value={formData.end_time}
                    onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                    className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                </div>

                {/* Days Multi-Select */}
                <div className="space-y-2 relative" ref={daysDropdownRef}>
                  <label className="text-sm font-bold text-foreground">أيام العمل</label>
                  <div
                    onClick={() => setIsDaysDropdownOpen(!isDaysDropdownOpen)}
                    className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm cursor-pointer flex justify-between items-center hover:border-primary/50 transition-colors"
                  >
                    <span className={formData.days.length === 0 ? "text-muted-foreground" : "text-foreground font-medium truncate"}>
                      {formData.days.length === 0 ? "اختر أيام العمل..." : `تم اختيار (${formData.days.length}) أيام`}
                    </span>
                    <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${isDaysDropdownOpen ? 'rotate-180' : ''}`} />
                  </div>

                  {isDaysDropdownOpen && (
                    <div className="absolute z-10 w-full mt-2 bg-card border border-border rounded-xl shadow-lg max-h-64 overflow-y-auto animate-in slide-in-from-top-2">
                      <div className="p-2 space-y-1">
                        {DAYS_MAPPING.map(day => (
                          <div
                            key={day.id}
                            onClick={() => toggleDaySelection(day.id)}
                            className="flex items-center gap-3 px-3 py-2 hover:bg-muted rounded-lg cursor-pointer transition-colors"
                          >
                            <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${formData.days.includes(day.id) ? 'bg-primary border-primary' : 'border-border'}`}>
                              {formData.days.includes(day.id) && <Check className="w-3 h-3 text-primary-foreground" />}
                            </div>
                            <span className="text-sm">{day.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Employees Multi-Select */}
                <div className="space-y-2 relative" ref={employeesDropdownRef}>
                  <label className="text-sm font-bold text-foreground">الموظفين المعينين للوردية</label>
                  <div
                    onClick={() => setIsEmployeesDropdownOpen(!isEmployeesDropdownOpen)}
                    className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm cursor-pointer flex justify-between items-center hover:border-primary/50 transition-colors"
                  >
                    <span className={formData.employees.length === 0 ? "text-muted-foreground" : "text-foreground font-medium truncate"}>
                      {formData.employees.length === 0 ? "اختر الموظفين..." : `تم اختيار (${formData.employees.length}) موظف`}
                    </span>
                    <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${isEmployeesDropdownOpen ? 'rotate-180' : ''}`} />
                  </div>

                  {isEmployeesDropdownOpen && (
                    <div className="absolute z-10 w-full mt-2 bg-card border border-border rounded-xl shadow-lg max-h-64 overflow-y-auto animate-in slide-in-from-top-2">
                      <div className="p-2 space-y-1">
                        {employees.map(emp => (
                          <div
                            key={emp.id}
                            onClick={() => toggleEmployeeSelection(emp.id!)}
                            className="flex items-center gap-3 px-3 py-2 hover:bg-muted rounded-lg cursor-pointer transition-colors"
                          >
                            <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${formData.employees.includes(emp.id!) ? 'bg-primary border-primary' : 'border-border'}`}>
                              {formData.employees.includes(emp.id!) && <Check className="w-3 h-3 text-primary-foreground" />}
                            </div>
                            <span className="text-sm">{emp.name}</span>
                          </div>
                        ))}
                        {employees.length === 0 && (
                          <div className="px-3 py-2 text-sm text-muted-foreground text-center">لا يوجد موظفين متاحين</div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

              </div>

              <div className="pt-8 flex gap-3">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-primary text-primary-foreground font-bold py-2.5 rounded-xl flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors disabled:opacity-70"
                >
                  {editingId ? 'حفظ التعديلات' : 'إضافة الوردية'}
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
