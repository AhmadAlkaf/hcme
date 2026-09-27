'use client';

import React, { useState } from 'react';
import { Package, Search, Plus, Edit, Trash2, Globe, Hash } from 'lucide-react';
import { ApiProduct, ApiDepartment } from '@/types/api';
import type { PaginationMeta } from '@/types/pagination';
import { Pagination } from '@/components/ui/Pagination';
import { getImageUrl, cn } from '@/lib/utils';
import { normalizeDepartmentRef } from '@/lib/products';

interface ProductsSectionProps {
  products: ApiProduct[];
  /** Filter options and the lookup used to resolve each product's department. */
  departments: ApiDepartment[];
  meta: PaginationMeta;
  onAddProduct: () => void;
  onEditProduct: (product: ApiProduct) => void;
  onDeleteProduct: (product: ApiProduct) => void;
  onFilterChange: (departmentId: string) => void;
  onToggleActive: (product: ApiProduct, newStatus: boolean) => void;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
}

export const ProductsSection: React.FC<ProductsSectionProps> = ({
  products = [],
  departments = [],
  meta,
  onAddProduct,
  onEditProduct,
  onDeleteProduct,
  onFilterChange,
  onToggleActive,
  onPageChange,
  onPageSizeChange,
}) => {
  const [selectedDepartment, setSelectedDepartment] = useState('all');

  const handleDepartmentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setSelectedDepartment(val);
    onFilterChange(val);
  };

  // The products list is paged, so only the current page's departments are
  // present. Without the full list here, a product's department would show as
  // a bare id.
  const departmentName = (product: ApiProduct) => {
    const id = normalizeDepartmentRef(product.department);
    if (id === null) return '';
    const department = departments.find((d) => d.id === id);
    return department?.name_ar || department?.name_en || '';
  };

  const agentName = (departmentId: number) => {
    const department = departments.find((d) => d.id === departmentId);
    return department?.agent_name_ar || department?.agent_name_en || '';
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-card p-6 rounded-3xl border border-border/80 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-primary/10 text-primary border border-primary/20">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-extrabold text-foreground">إدارة المنتجات والمخزون</h2>
              <span className="px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-black">
                {products.length} منتج
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              عرض وإضافة وتعديل وحذف المنتجات الكهربائية المرتبطة بأقسام الوكالات
            </p>
          </div>
        </div>

        <button
          onClick={onAddProduct}
          className="px-5 py-2.5 rounded-2xl bg-primary text-primary-foreground font-extrabold text-xs sm:text-sm hover:opacity-90 transition-all flex items-center gap-2 shadow-lg shadow-primary/20"
        >
          <Plus className="w-4 h-4" />
          إضافة منتج جديد
        </button>
      </div>

      {/* Filters Bar */}
      <div className="bg-card border border-border/80 p-4 rounded-3xl shadow-sm flex flex-col md:flex-row items-center justify-end gap-3">
        <div className="flex items-center gap-2 w-full md:w-auto shrink-0">
          <select
            value={selectedDepartment}
            onChange={handleDepartmentChange}
            className="w-full md:w-auto px-4 py-2.5 rounded-2xl bg-background/50 border border-input text-xs font-bold text-foreground focus:ring-2 focus:ring-primary"
          >
            <option value="all">كافة الأقسام</option>
            {departments.map((department) => (
              <option key={department.id} value={department.id}>
                {department.name_ar || department.name_en}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Empty State Banner */}
      {products.length === 0 ? (
        <div className="bg-card text-card-foreground border border-dashed border-border/80 rounded-3xl p-12 text-center space-y-4 shadow-sm">
          <div className="w-16 h-16 rounded-3xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center mx-auto text-2xl">
            ⚡
          </div>
          <div className="space-y-1 max-w-sm mx-auto">
            <h3 className="font-extrabold text-base text-foreground">لا توجد منتجات مسجلة</h3>
            <p className="text-xs text-muted-foreground">
              لم نجد أي منتجات تطابق بحثك أو تصفيتك الحالية.
            </p>
          </div>
          <button
            onClick={onAddProduct}
            className="px-6 py-2.5 rounded-2xl bg-primary text-primary-foreground font-extrabold text-xs inline-flex items-center gap-2 shadow-lg shadow-primary/20"
          >
            <Plus className="w-4 h-4" />
            إضافة أول منتج الآن
          </button>
        </div>
      ) : (
        /* Data Table View */
        <div className="bg-card border border-border/80 rounded-3xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs sm:text-sm">
              <thead className="bg-muted/50 text-muted-foreground border-b border-border font-bold">
                <tr>
                  <th className="p-4">المنتج</th>
                  <th className="p-4">القسم (الوكيل)</th>
                  <th className="p-4">رقم المجموعة (النظام المحاسبي)</th>
                  <th className="p-4"> الموديل</th>
                  <th className="p-4">السعر  </th>
                  <th className="p-4">حالة الظهور</th>
                  <th className="p-4 text-left">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {products.map((prod) => {
                  const prodName = prod.name_product_ar || prod.name_product_en || '';
                  // The API resolves the agent from the department, so it stays
                  // read-only here; the department is the only editable link.
                  const resolvedAgent = prod.agent_name_ar || prod.agent_name_en || '';
                  const prodDesc = prod.description_product_ar || prod.description_product_en || '';
                  const departmentId = normalizeDepartmentRef(prod.department);
                  const deptName = departmentName(prod);
                  const ownerAgent = departmentId !== null ? agentName(departmentId) : resolvedAgent;
                  
                  // Extract first unit price if exists
                  const startingPrice = prod.name_uint?.[0]?.price;

                  return (
                    <tr key={prod.id} className="hover:bg-muted/30 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center shrink-0">
                            {prod.image ? (
                              <img src={getImageUrl(prod.image)} alt={prodName} className="w-full h-full object-cover" />
                            ) : (
                              <Package className="w-6 h-6 text-slate-400" />
                            )}
                          </div>
                          <div>
                            <span className="font-extrabold text-foreground block">{prodName}</span>
                            <span className="text-[11px] text-muted-foreground line-clamp-1 max-w-[250px]">
                              {prodDesc || 'بدون وصف إضافي'}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="p-4">
                        {deptName || ownerAgent ? (
                          <div className="flex flex-col gap-0.5">
                            <span className="font-bold text-primary">
                              {deptName || 'قسم غير محدد'}
                            </span>
                            {/* The agent is derived from the department, so it is
                                shown as context rather than as its own field. */}
                            {ownerAgent && (
                              <span className="text-[11px] text-muted-foreground">
                                {ownerAgent}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>

                      <td className="p-4">
                        <div className="flex items-center gap-1">
                          <Hash className="w-3.5 h-3.5 text-slate-400" />
                          <span className="font-bold text-foreground">{prod.number_group || '-'}</span>
                        </div>
                      </td>

                      <td className="p-4">
                        <span className="font-bold text-slate-600 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg">
                          {prod.number_product || '-'}
                        </span>
                      </td>

                      <td className="p-4">
                        <span className="font-black text-foreground">
                          {startingPrice ? `${parseFloat(startingPrice).toLocaleString()} ر.ي` : 'غير محدد'}
                        </span>
                      </td>

                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            role="switch"
                            aria-checked={prod.is_active}
                            onClick={() => onToggleActive(prod, !prod.is_active)}
                            className={cn(
                              "relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary",
                              prod.is_active ? "bg-emerald-500" : "bg-slate-300 dark:bg-slate-600"
                            )}
                          >
                            <span
                              className={cn(
                                "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
                                prod.is_active ? "rtl:-translate-x-5 translate-x-5" : "translate-x-0"
                              )}
                            />
                          </button>
                          <span className={cn("text-xs font-bold", prod.is_active ? "text-emerald-600" : "text-slate-500")}>
                            {prod.is_active ? 'نشط' : 'غير نشط'}
                          </span>
                        </div>
                      </td>

                      <td className="p-4 text-left">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => onEditProduct(prod)}
                            className="p-2 rounded-xl border border-input hover:bg-muted text-foreground transition-colors"
                            title="تعديل"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onDeleteProduct(prod)}
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
            idPrefix="dashboard-products"
          />
        </div>
      )}
    </div>
  );
};
