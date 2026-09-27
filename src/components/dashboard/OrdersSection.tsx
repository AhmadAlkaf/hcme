'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShoppingBag, Search, Edit, Phone, MapPin, Clock } from 'lucide-react';
import type { OrderItem } from '@/types';
import type { PaginationMeta } from '@/types/pagination';
import { Pagination } from '@/components/ui/Pagination';

interface OrdersSectionProps {
  orders: OrderItem[];
  meta: PaginationMeta;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  selectedStatus: string;
  onStatusChange: (value: string) => void;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  firstRowIndex: number;
  onStatusChangeOrder: (orderId: string, status: OrderItem['status']) => void;
}

export const OrdersSection: React.FC<OrdersSectionProps> = ({
  orders,
  meta,
  searchQuery,
  onSearchChange,
  selectedStatus,
  onStatusChange,
  onPageChange,
  onPageSizeChange,
  firstRowIndex,
  onStatusChangeOrder,
}) => {
  const router = useRouter();

  // Search and the status filter are handled server-side. The status narrowing
  // is repeated here because backend support for `?status=` is unverified: if
  // the backend ignores the param this keeps the table consistent with the
  // dropdown, at the cost of a short page.
  const filteredOrders = orders.filter((ord) => {
    const matchesStatus = selectedStatus === 'all' || ord.status === selectedStatus;
    return matchesStatus;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-card p-6 rounded-3xl border border-border/80 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/20">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-extrabold text-foreground">الطلبات والاستفسارات الواردة</h2>
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-500 text-xs font-black">
                {meta.count} طلبات
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              إدارة ومتابعة طلبات التوريد وتحديث حالاتها ديناميكياً
            </p>
          </div>
        </div>
      </div>

      {/* Search & Status Filter */}
      <div className="bg-card border border-border/80 p-4 rounded-3xl shadow-sm flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="ابحث برقم الطلب، اسم العميل، أو المدينة..."
            className="w-full pl-4 pr-10 py-2 rounded-2xl bg-background/50 border border-input text-xs sm:text-sm font-semibold focus:ring-2 focus:ring-primary"
          />
        </div>

        <select
          value={selectedStatus}
          onChange={(e) => onStatusChange(e.target.value)}
          className="px-3.5 py-2 rounded-2xl bg-background/50 border border-input text-xs font-bold text-foreground w-full md:w-auto"
        >
          <option value="all">كافة الطلبات</option>
          <option value="processing">جاري معالجة طلبك</option>
          <option value="shipped">تم شحن طلبك</option>
          <option value="cancelled">تم إلغاء طلبك</option>
          <option value="modified">تم تعديل طلبك</option>
          <option value="accepted">تم قبول طلبك</option>
          <option value="rejected">تم رفض طلبك</option>
        </select>
      </div>

      {/* Empty State Banner */}
      {filteredOrders.length === 0 ? (
        <div className="bg-card text-card-foreground border border-dashed border-border/80 rounded-3xl p-12 text-center space-y-4 shadow-sm">
          <div className="w-16 h-16 rounded-3xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center mx-auto text-2xl">
            📦
          </div>
          <div className="space-y-1 max-w-sm mx-auto">
            <h3 className="font-extrabold text-base text-foreground">لا توجد طلبات مسجلة حتى الآن</h3>
            <p className="text-xs text-muted-foreground">
              تصل طلبات التوريد من نموذج اتصل بنا والعملاء تلقائياً.
            </p>
          </div>
        </div>
      ) : (
        /* Data Table View */
        <div className="bg-card border border-border/80 rounded-3xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs sm:text-sm">
              <thead className="bg-muted/50 text-muted-foreground border-b border-border font-bold">
                <tr>
                  <th className="p-4">رقم الطلب والعميل</th>
                  <th className="p-4">المدينة والهاتف</th>
                  <th className="p-4">الإجمالي والتاريخ</th>
                  <th className="p-4">حالة الطلب والتغيير</th>
                  <th className="p-4 text-left">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredOrders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-muted/30 transition-colors">
                    <td className="p-4">
                      <div className="space-y-0.5">
                        <span className="font-extrabold text-primary block">{ord.orderNumber}</span>
                        <span className="font-bold text-foreground text-xs block">{ord.customerName}</span>
                      </div>
                    </td>

                    <td className="p-4">
                      <div className="space-y-0.5">
                        <span className="font-bold text-foreground block flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-primary" />
                          {ord.customerCity}
                        </span>
                        <span className="text-[11px] text-muted-foreground flex items-center gap-1 dir-ltr text-right">
                          <Phone className="w-3.5 h-3.5 text-muted-foreground" />
                          {ord.customerPhone}
                        </span>
                      </div>
                    </td>

                    <td className="p-4">
                      <div className="space-y-0.5">
                        <span className="font-black text-foreground block">{ord.totalAmount.toLocaleString()} ر.ي</span>
                        <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {ord.createdAt}
                        </span>
                      </div>
                    </td>

                    <td className="p-4">
                      <span
                        className={`px-3 py-1.5 rounded-xl text-xs font-extrabold border transition-colors inline-block ${
                          ord.status === 'processing'
                            ? 'bg-amber-500/10 text-amber-600 border-amber-500/30'
                            : ord.status === 'shipped'
                            ? 'bg-blue-500/10 text-blue-600 border-blue-500/30'
                            : ord.status === 'cancelled'
                            ? 'bg-red-500/10 text-red-600 border-red-500/30'
                            : ord.status === 'modified'
                            ? 'bg-purple-500/10 text-purple-600 border-purple-500/30'
                            : ord.status === 'accepted'
                            ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30'
                            : ord.status === 'rejected'
                            ? 'bg-rose-500/10 text-rose-600 border-rose-500/30'
                            : 'bg-slate-500/10 text-slate-500 border-slate-500/30'
                        }`}
                      >
                        {ord.status === 'processing'
                          ? 'جاري معالجة طلبك'
                          : ord.status === 'shipped'
                          ? 'تم شحن طلبك'
                          : ord.status === 'cancelled'
                          ? 'تم إلغاء طلبك'
                          : ord.status === 'modified'
                          ? 'تم تعديل طلبك'
                          : ord.status === 'accepted'
                          ? 'تم قبول طلبك'
                          : ord.status === 'rejected'
                          ? 'تم رفض طلبك'
                          : 'غير معروف'}
                      </span>
                    </td>

                    <td className="p-4 text-left">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => router.push(`/dashboard/orders/${ord.id}`)}
                          className="p-2 rounded-xl border border-input hover:bg-muted text-foreground"
                          title="تعديل وتفاصيل"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
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
            idPrefix="orders"
          />
        </div>
      )}
    </div>
  );
};
