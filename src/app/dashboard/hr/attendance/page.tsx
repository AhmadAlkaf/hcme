"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Search, Edit, Trash2, ChevronRight, X, Loader2, ClipboardCheck, CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { 
  getAttendancesServerAction, 
  createAttendanceServerAction, 
  updateAttendanceServerAction, 
  deleteAttendanceServerAction,
} from '@/actions/hr/attendances.actions';
import { getAllEmployeesServerAction } from '@/actions/hr/employees.actions';
import { getAllShiftsServerAction } from '@/actions/hr/shifts.actions';
import type { 
  ApiAttendance, 
  ApiEmployee, 
  ApiShift 
} from '@/types/api';
import { DeleteConfirmModal } from '@/components/dashboard/Modals';
import { ToastNotification, ToastMessage } from '@/components/ui/ToastNotification';
import { Pagination } from '@/components/ui/Pagination';
import { usePaginatedList } from '@/lib/use-paginated-list';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';

// Static Mapping for is_present1
const ATTENDANCE_STATUS = [
  { id: 1, name: 'حاضر' },
  { id: 2, name: 'متأخر' },
  { id: 3, name: 'خرج مبكر' },
  { id: 4, name: 'غائب' },
  { id: 5, name: 'بدون دخول' },
  { id: 6, name: 'بدون خروج' },
  { id: 7, name: 'إجازة' },
  { id: 8, name: 'عمل إضافي' },
  { id: 9, name: 'دوام نصي' },
];

export default function AttendancePage() {
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
  } = usePaginatedList<ApiAttendance>(getAttendancesServerAction);

  // Dropdown options. These must be the *complete* lists: the paginated action
  // would silently cap them at the first 15 records, hiding valid options.
  const [employees, setEmployees] = useState<ApiEmployee[]>([]);
  const [shifts, setShifts] = useState<ApiShift[]>([]);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ApiAttendance | null>(null);
  const [toast, setToast] = useState<ToastMessage | null>(null);
  
  // Form State
  const initialFormState = { 
    employee: '', 
    shift: '', 
    date: null as string | null,
    time_in: '', 
    time_out: '', 
    is_present: true, 
    is_present1: '', 
    note: ''
  };
  const [formData, setFormData] = useState(initialFormState);

  // DatePicker State
  const [dateObj, setDateObj] = useState<Date | undefined>(undefined);

  // Dropdown options are fetched once and never paginated.
  useEffect(() => {
    let cancelled = false;
    const loadOptions = async () => {
      try {
        const [employees, shifts] = await Promise.all([
          getAllEmployeesServerAction(),
          getAllShiftsServerAction(),
        ]);
        if (cancelled) return;
        setEmployees(employees);
        setShifts(shifts);
      } catch (error) {
        console.error('Error loading dropdown options:', error);
      }
    };
    void loadOptions();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (dateObj) {
      setFormData(prev => ({ ...prev, date: format(dateObj, 'yyyy-MM-dd') }));
    } else {
      setFormData(prev => ({ ...prev, date: null }));
    }
  }, [dateObj]);

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData(initialFormState);
    setDateObj(undefined);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: ApiAttendance) => {
    setEditingId(item.id!);
    const formatTime = (t: string | null) => t ? t.slice(0, 5) : '';
    setFormData({ 
      employee: item.employee?.toString() || '',
      shift: item.shift?.toString() || '',
      date: item.date,
      time_in: formatTime(item.time_in),
      time_out: formatTime(item.time_out),
      is_present: item.is_present,
      is_present1: item.is_present1?.toString() || '',
      note: item.note || ''
    });
    if (item.date) {
      setDateObj(new Date(item.date));
    } else {
      setDateObj(undefined);
    }
    setIsModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget || !deleteTarget.id) return;
    setIsSubmitting(true);
    try {
      const res = await deleteAttendanceServerAction(deleteTarget.id);
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
    
    if (!formData.employee || !formData.date || !formData.is_present1) {
      setToast({ type: 'error', message: 'الرجاء إدخال الحقول الإلزامية (الموظف، التاريخ، الحالة)' });
      return;
    }
    
    setIsSubmitting(true);
    try {
      const payload = {
        employee: formData.employee ? Number(formData.employee) : null,
        shift: formData.shift ? Number(formData.shift) : null,
        date: formData.date,
        time_in: formData.time_in ? `${formData.time_in}:00` : null,
        time_out: formData.time_out ? `${formData.time_out}:00` : null,
        is_present: formData.is_present,
        is_present1: formData.is_present1 ? Number(formData.is_present1) : null,
        note: formData.note
      };

      if (editingId) {
        const res = await updateAttendanceServerAction(editingId, payload);
        if (res.success && res.data) {
          reload();
          setIsModalOpen(false);
          setToast({ type: 'success', message: 'تم التعديل بنجاح' });
        } else {
          setToast({ type: 'error', message: res.error || 'فشل التعديل' });
        }
      } else {
        const res = await createAttendanceServerAction(payload);
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
        <span className="text-foreground font-medium">الحضور والانصراف</span>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">الحضور والانصراف</h1>
          <p className="text-muted-foreground text-sm mt-1">إدارة السجل اليومي للحضور والانصراف للموظفين</p>
        </div>
        <button 
          onClick={handleOpenAdd}
          className="bg-primary text-primary-foreground px-4 py-2 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-primary/90 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          إضافة سجل
        </button>
      </div>

      {/* Toolbar & Filters */}
      {/* <div className="bg-card border border-border rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input 
            type="text" 
            placeholder="بحث باسم الموظف أو الوردية..." 
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
                <th className="px-6 py-4 font-bold">الموظف</th>
                <th className="px-6 py-4 font-bold">الوردية</th>
                <th className="px-6 py-4 font-bold">التاريخ</th>
                <th className="px-6 py-4 font-bold">وقت الحضور</th>
                <th className="px-6 py-4 font-bold">وقت الانصراف</th>
                <th className="px-6 py-4 font-bold">الحالة</th>
                <th className="px-6 py-4 font-bold text-left">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredData.length > 0 ? (
                filteredData.map((item, index) => {
                  const statusObj = ATTENDANCE_STATUS.find(s => s.id === item.is_present1);
                  const statusName = statusObj ? statusObj.name : '—';
                  const statusColor = 
                    item.is_present1 === 1 ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                    item.is_present1 === 4 ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                    item.is_present1 === 2 ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' :
                    'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';

                  return (
                    <tr key={item.id} className="hover:bg-muted/30 transition-colors group">
                      <td className="px-6 py-4">{firstRowIndex + index}</td>
                      <td className="px-6 py-4 font-bold text-primary">
                        <div className="flex items-center gap-2">
                          <ClipboardCheck className="w-4 h-4 text-muted-foreground" />
                          {item.employee_name || '—'}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">{item.shift_name || '—'}</td>
                      <td className="px-6 py-4 text-muted-foreground" dir="ltr">{item.date || '—'}</td>
                      <td className="px-6 py-4 text-muted-foreground" dir="ltr">{item.time_in ? item.time_in.slice(0, 5) : '—'}</td>
                      <td className="px-6 py-4 text-muted-foreground" dir="ltr">{item.time_out ? item.time_out.slice(0, 5) : '—'}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-md text-xs font-bold ${statusColor}`}>
                          {statusName}
                        </span>
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
                    <td colSpan={8} className="px-6 py-12 text-center text-muted-foreground font-medium">
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
              idPrefix="attendance"
            />
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200 overflow-y-auto">
          <div className="bg-card w-full max-w-4xl rounded-2xl shadow-xl overflow-visible animate-in zoom-in-95 duration-200 my-auto mt-10 mb-10">
            <div className="flex items-center justify-between p-4 border-b border-border sticky top-0 bg-card z-10">
              <h2 className="text-lg font-bold">{editingId ? 'تعديل سجل الحضور' : 'إضافة سجل جديد'}</h2>
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
                  <label className="text-sm font-bold text-foreground">الوردية</label>
                  <select 
                    value={formData.shift}
                    onChange={(e) => setFormData({...formData, shift: e.target.value})}
                    className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all appearance-none"
                  >
                    <option value="">بدون وردية</option>
                    {shifts.map(shift => (
                      <option key={shift.id} value={shift.id}>{shift.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-foreground">التاريخ <span className="text-red-500">*</span></label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={`w-full justify-start text-right font-normal rounded-xl px-4 py-2.5 h-auto hover:bg-primary/10 hover:text-primary transition-colors ${!dateObj && "text-muted-foreground"}`}
                      >
                        <CalendarIcon className="ml-2 h-4 w-4" />
                        {dateObj ? format(dateObj, "PPP", { locale: ar }) : <span>اختر التاريخ</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 z-[150]" align="start">
                      <Calendar
                        mode="single"
                        selected={dateObj}
                        onSelect={setDateObj}
                        locale={ar}
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2 flex items-end">
                  <label className="flex items-center gap-3 cursor-pointer p-2.5 border border-border rounded-xl w-full hover:bg-muted/50 transition-colors">
                    <input 
                      type="checkbox"
                      checked={formData.is_present}
                      onChange={(e) => setFormData({...formData, is_present: e.target.checked})}
                      className="w-5 h-5 rounded text-primary focus:ring-primary focus:ring-offset-background"
                    />
                    <span className="text-sm font-bold select-none">حاضر</span>
                  </label>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-foreground">الحالة الفعلية <span className="text-red-500">*</span></label>
                  <select 
                    required
                    value={formData.is_present1}
                    onChange={(e) => setFormData({...formData, is_present1: e.target.value})}
                    className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all appearance-none"
                  >
                    <option value="">اختر الحالة</option>
                    {ATTENDANCE_STATUS.map(status => (
                      <option key={status.id} value={status.id}>{status.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-foreground">وقت الحضور (دخول)</label>
                  <input 
                    type="time"
                    value={formData.time_in}
                    onChange={(e) => setFormData({...formData, time_in: e.target.value})}
                    className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-foreground">وقت الانصراف (خروج)</label>
                  <input 
                    type="time"
                    value={formData.time_out}
                    onChange={(e) => setFormData({...formData, time_out: e.target.value})}
                    className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-bold text-foreground">ملاحظات</label>
                  <textarea 
                    value={formData.note}
                    onChange={(e) => setFormData({...formData, note: e.target.value})}
                    rows={3}
                    className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all resize-none"
                    placeholder="ملاحظات حول الحضور أو التأخير..."
                  />
                </div>
              </div>

              <div className="pt-8 flex gap-3">
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="flex-1 bg-primary text-primary-foreground font-bold py-2.5 rounded-xl flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors disabled:opacity-70"
                >
                  {editingId ? 'حفظ التعديلات' : 'إضافة السجل'}
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
        title={deleteTarget?.employee_name || 'هذا السجل'}
      />

      {/* Floating Bottom Toast Notification */}
      <ToastNotification toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
