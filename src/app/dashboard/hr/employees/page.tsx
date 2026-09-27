"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Search, Edit, Trash2, ChevronRight, X, Loader2, Users } from 'lucide-react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { 
  getEmployeesServerAction, 
  createEmployeeServerAction, 
  updateEmployeeServerAction, 
  deleteEmployeeServerAction,
} from '@/actions/hr/employees.actions';
import { getAllJobTitlesServerAction } from '@/actions/hr/job-titles.actions';
import { getAllEducationalLevelsServerAction } from '@/actions/hr/educational-levels.actions';
import { getAllCompaniesServerAction } from '@/actions/hr/companies.actions';
import type { 
  ApiEmployee, 
  ApiJobTitle, 
  ApiEducationalLevel, 
  ApiCompany 
} from '@/types/api';
import { DeleteConfirmModal } from '@/components/dashboard/Modals';
import { ToastNotification, ToastMessage } from '@/components/ui/ToastNotification';
import { Pagination } from '@/components/ui/Pagination';
import { usePaginatedList } from '@/lib/use-paginated-list';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { CalendarIcon } from 'lucide-react';

export default function EmployeePage() {
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
  } = usePaginatedList<ApiEmployee>(getEmployeesServerAction);

  // Dropdown options. These must be the *complete* lists: the paginated action
  // would silently cap them at the first 15 records, hiding valid options.
  const [jobTitles, setJobTitles] = useState<ApiJobTitle[]>([]);
  const [educationLevels, setEducationLevels] = useState<ApiEducationalLevel[]>([]);
  const [companies, setCompanies] = useState<ApiCompany[]>([]);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ApiEmployee | null>(null);
  const [toast, setToast] = useState<ToastMessage | null>(null);
  
  // Form State
  const initialFormState = { 
    name: '', 
    birth_date: null as string | null, 
    basic_salary: '' as string | number, 
    secondary_salary: '' as string | number, 
    currency_basic: '', 
    currency_secondary: '', 
    job_title: '', 
    educational_level: '', 
    company: '', 
    type_of_employee: '', 
    marital_status: ''
  };
  const [formData, setFormData] = useState(initialFormState);

  // DatePicker State (parsed date object)
  const [date, setDate] = useState<Date | undefined>(undefined);

  // Dropdown options are fetched once and never paginated.
  useEffect(() => {
    let cancelled = false;
    const loadOptions = async () => {
      try {
        const [titles, education, companyList] = await Promise.all([
          getAllJobTitlesServerAction(),
          getAllEducationalLevelsServerAction(),
          getAllCompaniesServerAction(),
        ]);
        if (cancelled) return;
        setJobTitles(titles);
        setEducationLevels(education);
        setCompanies(companyList);
      } catch (error) {
        console.error('Error loading dropdown options:', error);
      }
    };
    void loadOptions();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (date) {
      setFormData(prev => ({ ...prev, birth_date: format(date, 'yyyy-MM-dd') }));
    } else {
      setFormData(prev => ({ ...prev, birth_date: null }));
    }
  }, [date]);

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData(initialFormState);
    setDate(undefined);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: ApiEmployee) => {
    setEditingId(item.id!);
    setFormData({ 
      name: item.name, 
      birth_date: item.birth_date,
      basic_salary: item.basic_salary ?? '',
      secondary_salary: item.secondary_salary ?? '',
      currency_basic: item.currency_basic?.toString() || '',
      currency_secondary: item.currency_secondary?.toString() || '',
      job_title: item.job_title?.toString() || '',
      educational_level: item.educational_level?.toString() || '',
      company: item.company?.toString() || '',
      type_of_employee: item.type_of_employee?.toString() || '',
      marital_status: item.marital_status?.toString() || '',
    });
    if (item.birth_date) {
      setDate(new Date(item.birth_date));
    } else {
      setDate(undefined);
    }
    setIsModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget || !deleteTarget.id) return;
    setIsSubmitting(true);
    try {
      const res = await deleteEmployeeServerAction(deleteTarget.id);
      if (res.success) {
        // Deleting the only row of the last page would leave the user on an
        // empty page, so fall back to the previous one.
        if (filteredData.length === 1 && meta.page > 1) {
          setPage(meta.page - 1);
        } else {
          reload();
        }
        setToast({ type: 'success', message: 'تم حذف الموظف بنجاح' });
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
        birth_date: formData.birth_date,
        basic_salary: formData.basic_salary ? Number(formData.basic_salary) : null,
        secondary_salary: formData.secondary_salary ? Number(formData.secondary_salary) : null,
        currency_basic: formData.currency_basic ? Number(formData.currency_basic) : null,
        currency_secondary: formData.currency_secondary ? Number(formData.currency_secondary) : null,
        job_title: formData.job_title ? Number(formData.job_title) : null,
        educational_level: formData.educational_level ? Number(formData.educational_level) : null,
        company: formData.company ? Number(formData.company) : null,
        type_of_employee: formData.type_of_employee,
        marital_status: formData.marital_status
      };
      
      if (editingId) {
        const res = await updateEmployeeServerAction(editingId, payload);
        if (res.success && res.data) {
          reload();
          setIsModalOpen(false);
          setToast({ type: 'success', message: 'تم تعديل بيانات الموظف بنجاح' });
        } else {
          setToast({ type: 'error', message: res.error || 'فشل التعديل' });
        }
      } else {
        console.log('payload', payload);
        const res = await createEmployeeServerAction(payload);
        if (res.success && res.data) {
          // A new record belongs on page 1, so return there to see it.
          setPage(1);
          reload();
          setIsModalOpen(false);
          setToast({ type: 'success', message: 'تمت إضافة الموظف بنجاح' });
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
        <span className="text-foreground font-medium">الموظفين</span>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">الموظفين</h1>
          <p className="text-muted-foreground text-sm mt-1">إدارة بيانات الموظفين والعاملين</p>
        </div>
        <button 
          onClick={handleOpenAdd}
          className="bg-primary text-primary-foreground px-4 py-2 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-primary/90 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          إضافة موظف
        </button>
      </div>

      {/* Toolbar & Filters */}
      {/* <div className="bg-card border border-border rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input 
            type="text" 
            placeholder="بحث بالاسم..." 
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
                <th className="px-6 py-4 font-bold">نوع الموظف</th>
                <th className="px-6 py-4 font-bold">المسمى الوظيفي</th>
                <th className="px-6 py-4 font-bold">تاريخ الميلاد</th>
                <th className="px-6 py-4 font-bold text-left">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredData.length > 0 ? (
                filteredData.map((item, index) => {
                  const employeeTypeName = 
                    item.type_of_employee == '1' ? 'موظف' : 
                    item.type_of_employee == '2' ? 'متعاقد' : 
                    item.type_of_employee == '3' ? 'يومي' : '—';
                  const jobTitleName = jobTitles.find(j => j.id == item.job_title)?.name || '—';

                  return (
                    <tr key={item.id} className="hover:bg-muted/30 transition-colors group">
                      <td className="px-6 py-4">{firstRowIndex + index}</td>
                      <td className="px-6 py-4 font-bold text-primary">
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-muted-foreground" />
                          {item.name}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">{employeeTypeName}</td>
                      <td className="px-6 py-4 text-muted-foreground">{jobTitleName}</td>
                      <td className="px-6 py-4 text-muted-foreground" dir="ltr">{item.birth_date || '—'}</td>
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
                      لا يوجد موظفين مضافين حالياً أو مطابقين للبحث.
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
              idPrefix="employees"
            />
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200 overflow-y-auto">
          <div className="bg-card w-full max-w-4xl rounded-2xl shadow-xl overflow-hidden animate-in zoom-in-95 duration-200 my-auto mt-10 mb-10">
            <div className="flex items-center justify-between p-4 border-b border-border sticky top-0 bg-card z-10">
              <h2 className="text-lg font-bold">{editingId ? 'تعديل بيانات الموظف' : 'إضافة موظف جديد'}</h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-muted-foreground hover:bg-muted rounded-xl transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 max-h-[75vh] overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-bold text-foreground">الاسم الرباعي <span className="text-red-500">*</span></label>
                  <input 
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                    placeholder="مثال: أحمد محمد علي حسن"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-bold text-foreground">تاريخ الميلاد</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={`w-full justify-start text-right font-normal rounded-xl px-4 py-2.5 h-auto hover:bg-primary/10 hover:text-primary transition-colors ${!date && "text-muted-foreground"}`}
                      >
                        <CalendarIcon className="ml-2 h-4 w-4" />
                        {date ? format(date, "PPP", { locale: ar }) : <span>اختر تاريخاً</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 z-[150]" align="start">
                      <Calendar
                        mode="single"
                        selected={date}
                        onSelect={setDate}
                        locale={ar}
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-foreground">الحالة الاجتماعية</label>
                  <select 
                    value={formData.marital_status}
                    onChange={(e) => setFormData({...formData, marital_status: e.target.value})}
                    className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all appearance-none"
                  >
                    <option value="">اختر الحالة</option>
                    <option value="1">متزوج</option>
                    <option value="2">عازب</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-foreground">نوع الموظف</label>
                  <select 
                    value={formData.type_of_employee}
                    onChange={(e) => setFormData({...formData, type_of_employee: e.target.value})}
                    className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all appearance-none"
                  >
                    <option value="">اختر النوع</option>
                    <option value="1">موظف</option>
                    <option value="2">متعاقد</option>
                    <option value="3">يومي</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-foreground">المسمى الوظيفي</label>
                  <select 
                    value={formData.job_title}
                    onChange={(e) => setFormData({...formData, job_title: e.target.value})}
                    className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all appearance-none"
                  >
                    <option value="">اختر المسمى الوظيفي</option>
                    {jobTitles.map(job => (
                      <option key={job.id} value={job.id}>{job.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-foreground">المستوى التعليمي</label>
                  <select 
                    value={formData.educational_level}
                    onChange={(e) => setFormData({...formData, educational_level: e.target.value})}
                    className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all appearance-none"
                  >
                    <option value="">اختر المستوى التعليمي</option>
                    {educationLevels.map(lvl => (
                      <option key={lvl.id} value={lvl.id}>{lvl.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-foreground">الشركة</label>
                  <select 
                    value={formData.company}
                    onChange={(e) => setFormData({...formData, company: e.target.value})}
                    className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all appearance-none"
                  >
                    <option value="">اختر الشركة</option>
                    {companies.map(comp => (
                      <option key={comp.id} value={comp.id}>{comp.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-foreground">الراتب الأساسي</label>
                  <div className="flex gap-2">
                    <input 
                      type="number"
                      step="0.01"
                      value={formData.basic_salary}
                      onChange={(e) => setFormData({...formData, basic_salary: e.target.value})}
                      className="w-2/3 bg-background border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                      placeholder="0.00"
                    />
                    <select 
                      value={formData.currency_basic}
                      onChange={(e) => setFormData({...formData, currency_basic: e.target.value})}
                      className="w-1/3 bg-background border border-border rounded-xl px-2 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all appearance-none"
                    >
                      <option value="">العملة</option>
                      <option value="1">دولار</option>
                      <option value="2">ريال سعودي</option>
                      <option value="3">ريال يمني</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-foreground">الراتب الإضافي / الثانوي</label>
                  <div className="flex gap-2">
                    <input 
                      type="number"
                      step="0.01"
                      value={formData.secondary_salary}
                      onChange={(e) => setFormData({...formData, secondary_salary: e.target.value})}
                      className="w-2/3 bg-background border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                      placeholder="0.00"
                    />
                    <select 
                      value={formData.currency_secondary}
                      onChange={(e) => setFormData({...formData, currency_secondary: e.target.value})}
                      className="w-1/3 bg-background border border-border rounded-xl px-2 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all appearance-none"
                    >
                      <option value="">العملة</option>
                      <option value="1">دولار</option>
                      <option value="2">ريال سعودي</option>
                      <option value="3">ريال يمني</option>
                    </select>
                  </div>
                </div>

              </div>

              <div className="pt-8 flex gap-3">
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="flex-1 bg-primary text-primary-foreground font-bold py-2.5 rounded-xl flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors disabled:opacity-70"
                >
                  {editingId ? 'حفظ التعديلات' : 'إضافة الموظف'}
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
