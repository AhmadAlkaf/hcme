'use client';

import React from 'react';
import { FolderTree, Plus, Edit, Trash2, Search } from 'lucide-react';
import { ApiAgent, ApiDepartment } from '@/types/api';
import type { PaginationMeta } from '@/types/pagination';
import { Pagination } from '@/components/ui/Pagination';
import { normalizeDepartmentRef } from '@/lib/products';

interface DepartmentsSectionProps {
  departments: ApiDepartment[];
  meta: PaginationMeta;
  onAddDepartment: () => void;
  onEditDepartment: (department: ApiDepartment) => void;
  onDeleteDepartment: (department: ApiDepartment) => void;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  /** Current search term, held by the client so the query stays in one place. */
  search: string;
  onSearchChange: (search: string) => void;
  /** Lookup for the agent names, in case the API did not inline them. */
  agents: ApiAgent[];
}

export const DepartmentsSection: React.FC<DepartmentsSectionProps> = ({
  departments = [],
  meta,
  onAddDepartment,
  onEditDepartment,
  onDeleteDepartment,
  onPageChange,
  onPageSizeChange,
  search,
  onSearchChange,
  agents = [],
}) => {

  const agentLabel = (department: ApiDepartment) => {
    const resolved = department.agent_name_ar || department.agent_name_en;
    if (resolved) return resolved;
    const id = normalizeDepartmentRef(department.agent);
    if (id === null) return 'بدون وكيل';
    const agent = agents.find((a) => a.id === id);
    return agent?.name_ar || agent?.name_en || `وكيل #${id}`;
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-card p-6 rounded-3xl border border-border/80 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-primary/10 text-primary border border-primary/20">
            <FolderTree className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-extrabold text-foreground">إدارة أقسام المنتجات</h2>
              <span className="px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-black">
                {meta.count} قسم
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              كل منتج يرتبط بقسم، والقسم يرتبط بالوكيل. حذف القسم يحذف منتجاته.
            </p>
          </div>
        </div>

        <button
          onClick={onAddDepartment}
          className="px-5 py-2.5 rounded-2xl bg-primary text-primary-foreground font-extrabold text-xs sm:text-sm hover:opacity-90 transition-all flex items-center gap-2 shadow-lg shadow-primary/20"
        >
          <Plus className="w-4 h-4" />
          إضافة قسم جديد
        </button>
      </div>

      {/* Filters Bar */}
      <div className="bg-card border border-border/80 p-4 rounded-3xl shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-72">
          <span className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="بحث باسم القسم..."
            className="w-full px-4 py-2.5 pr-11 rounded-2xl bg-background/50 border border-input text-xs font-bold text-foreground focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      {/* Empty State Banner */}
      {departments.length === 0 ? (
        <div className="bg-card text-card-foreground border border-dashed border-border/80 rounded-3xl p-12 text-center space-y-4 shadow-sm">
          <div className="w-16 h-16 rounded-3xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center mx-auto text-2xl">
            <FolderTree className="w-7 h-7" />
          </div>
          <div className="space-y-1 max-w-sm mx-auto">
            <h3 className="font-extrabold text-base text-foreground">لا توجد أقسام مسجلة</h3>
            <p className="text-xs text-muted-foreground">
              لا يمكن إضافة أي منتج قبل إنشاء قسم واحد على الأقل، لأن المنتج يرتبط بقسم.
            </p>
          </div>
          <button
            onClick={onAddDepartment}
            className="px-6 py-2.5 rounded-2xl bg-primary text-primary-foreground font-extrabold text-xs inline-flex items-center gap-2 shadow-lg shadow-primary/20"
          >
            <Plus className="w-4 h-4" />
            إضافة أول قسم الآن
          </button>
        </div>
      ) : (
        <div className="bg-card border border-border/80 rounded-3xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs sm:text-sm">
              <thead className="bg-muted/50 text-muted-foreground border-b border-border font-bold">
                <tr>
                  <th className="p-4">القسم</th>
                  <th className="p-4">الاسم بالإنجليزية</th>
                  <th className="p-4">الوكيل</th>
                  <th className="p-4">مثال توضيحي</th>
                  <th className="p-4 text-left">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {departments.map((department) => {
                  const nameAr = department.name_ar || '';
                  const agentText = agentLabel(department);

                  return (
                    <tr key={department.id} className="hover:bg-muted/30 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center shrink-0">
                            <FolderTree className="w-4 h-4" />
                          </div>
                          <span className="font-extrabold text-foreground">{nameAr || '-'}</span>
                        </div>
                      </td>

                      <td className="p-4">
                        <span className="font-bold text-slate-600 dark:text-slate-300" dir="ltr">
                          {department.name_en || '-'}
                        </span>
                      </td>

                      <td className="p-4">
                        {normalizeDepartmentRef(department.agent) === null ? (
                          <span className="text-slate-400">بدون وكيل</span>
                        ) : (
                          <span className="font-bold text-primary">{agentText}</span>
                        )}
                      </td>

                      <td className="p-4">
                        <span className="text-muted-foreground">
                          {department.exmple || '-'}
                        </span>
                      </td>

                      <td className="p-4 text-left">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => onEditDepartment(department)}
                            className="p-2 rounded-xl border border-input hover:bg-muted text-foreground transition-colors"
                            title="تعديل"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onDeleteDepartment(department)}
                            className="p-2 rounded-xl border border-destructive/20 text-destructive hover:bg-destructive/10 transition-colors"
                            title="حذف"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {meta.totalPages > 0 && (
        <div className="bg-card border border-border/80 rounded-2xl p-4 shadow-sm">
          <Pagination
            meta={meta}
            onPageChange={onPageChange}
            onPageSizeChange={onPageSizeChange}
            idPrefix="dashboard-departments"
          />
        </div>
      )}
    </div>
  );
};
