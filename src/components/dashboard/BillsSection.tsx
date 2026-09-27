'use client';

import React, { useState } from 'react';
import { 
  Receipt, 
  Search, 
  Eye, 
  X, 
  Printer, 
  Clock, 
  User, 
  Calendar,
  Layers
} from 'lucide-react';
import type { ApiBill } from '@/actions/bills.actions';
import { getBillsServerAction } from '@/actions/bills.actions';
import { Pagination } from '@/components/ui/Pagination';
import { usePaginatedList } from '@/lib/use-paginated-list';

interface BillsSectionProps {
  /** Preserved for callers that still pass the first page; the section paginates itself. */
  bills?: ApiBill[];
}

export const BillsSection: React.FC<BillsSectionProps> = () => {
  const {
    items: filteredBills,
    meta,
    search: searchQuery,
    setSearch: setSearchQuery,
    setPage,
    setPageSize,
  } = usePaginatedList<ApiBill>(getBillsServerAction);

  const [selectedBill, setSelectedBill] = useState<ApiBill | null>(null);

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('ar-YE', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (e) {
      return dateStr;
    }
  };

  const getBillTypeLabel = (typeNum: number) => {
    switch (typeNum) {
      case 1:
        return 'فاتورة مبيعات';
      case 2:
        return 'فاتورة مرتجعات';
      default:
        return 'فاتورة عامة';
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-card p-6 rounded-3xl border border-border/80 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-primary/10 text-primary border border-primary/20">
            <Receipt className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-extrabold text-foreground">إدارة الفواتير والمدفوعات</h2>
              <span className="px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-black">
                {meta.count} فواتير
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              عرض تفاصيل الفواتير المسجلة وطباعتها ومراجعة بنود المبيعات
            </p>
          </div>
        </div>
      </div>

      {/* Search Filter */}
      <div className="bg-card border border-border/80 p-4 rounded-3xl shadow-sm flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ابحث برقم الفاتورة أو اسم المستخدم..."
            className="w-full pl-4 pr-10 py-2 rounded-2xl bg-background/50 border border-input text-xs sm:text-sm font-semibold focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      {/* Table / Empty State */}
      {filteredBills.length === 0 ? (
        <div className="bg-card text-card-foreground border border-dashed border-border/80 rounded-3xl p-12 text-center space-y-4 shadow-sm">
          <div className="w-16 h-16 rounded-3xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center mx-auto text-2xl">
            🧾
          </div>
          <div className="space-y-1 max-w-sm mx-auto">
            <h3 className="font-extrabold text-base text-foreground">لا توجد فواتير مسجلة حالياً</h3>
            <p className="text-xs text-muted-foreground">
              لا توجد فواتير تطابق بحثك أو لم يتم إصدار أي فواتير بعد في النظام.
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-card border border-border/80 rounded-3xl shadow-sm overflow-hidden animate-in fade-in">
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs sm:text-sm">
              <thead className="bg-muted/50 text-muted-foreground border-b border-border font-bold">
                <tr>
                  <th className="p-4">رقم الفاتورة</th>
                  <th className="p-4">اسم المستخدم</th>
                  <th className="p-4">نوع الفاتورة</th>
                  <th className="p-4">عدد المواد</th>
                  <th className="p-4">المجموع الكلي</th>
                  <th className="p-4">تاريخ الإنشاء</th>
                  <th className="p-4 text-left">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border font-medium text-foreground">
                {filteredBills.map((bill) => (
                  <tr key={bill.id} className="hover:bg-muted/30 transition-colors font-semibold">
                    <td className="p-4 font-extrabold text-primary">#BILL-{bill.id}</td>
                    <td className="p-4 font-bold">{bill.name_user || 'غير محدد'}</td>
                    <td className="p-4">
                      <span className="px-2.5 py-1 rounded-lg bg-primary/5 text-primary text-xs font-bold border border-primary/10">
                        {getBillTypeLabel(bill.type_bill)}
                      </span>
                    </td>
                    <td className="p-4 font-bold">{bill.bill_items?.length || 0}</td>
                    <td className="p-4 font-black">{Number(bill.total_price).toLocaleString()} ر.ي</td>
                    <td className="p-4 text-xs text-muted-foreground border-t-0">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        {formatDate(bill.created_at)}
                      </div>
                    </td>
                    <td className="p-4 text-left">
                      <button
                        onClick={() => setSelectedBill(bill)}
                        className="p-2 rounded-xl border border-input hover:bg-muted text-foreground transition-all flex items-center justify-center cursor-pointer"
                        title="عرض تفاصيل الفاتورة"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
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
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
            idPrefix="bills"
          />
        </div>
      )}

      {/* Bill Details Modal */}
      {selectedBill && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card text-card-foreground border border-border rounded-3xl w-full max-w-2xl shadow-2xl p-6 space-y-5 animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-primary/10 text-primary">
                  <Receipt className="w-5 h-5" />
                </div>
                <h3 className="font-extrabold text-base text-foreground">
                  تفاصيل الفاتورة #BILL-{selectedBill.id}
                </h3>
              </div>
              <button 
                onClick={() => setSelectedBill(null)} 
                className="p-1 rounded-lg text-muted-foreground hover:bg-muted transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Print Area & Bill Meta */}
            <div id="bill-print-area" className="space-y-6">
              {/* Meta Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-muted/20 border border-border/60 rounded-2xl flex items-center gap-3">
                  <User className="w-5 h-5 text-primary shrink-0" />
                  <div>
                    <span className="text-[10px] font-bold text-muted-foreground block">المستخدم</span>
                    <span className="text-xs font-extrabold text-foreground">{selectedBill.name_user || 'غير محدد'} (رقم: {selectedBill.user})</span>
                  </div>
                </div>

                <div className="p-4 bg-muted/20 border border-border/60 rounded-2xl flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-primary shrink-0" />
                  <div>
                    <span className="text-[10px] font-bold text-muted-foreground block">تاريخ الإصدار</span>
                    <span className="text-xs font-extrabold text-foreground">{formatDate(selectedBill.created_at)}</span>
                  </div>
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-3">
                <span className="text-xs font-bold text-muted-foreground block">عناصر الفاتورة:</span>
                <div className="border border-border/80 rounded-2xl overflow-hidden">
                  <table className="w-full text-right text-xs sm:text-sm">
                    <thead>
                      <tr className="bg-muted/50 text-muted-foreground text-xs font-black border-b border-border">
                        <th className="py-2.5 px-4">رقم المنتج</th>
                        <th className="py-2.5 px-4 text-center">رقم الوحدة</th>
                        <th className="py-2.5 px-4 text-center">السعر</th>
                        <th className="py-2.5 px-4 text-center">الكمية</th>
                        <th className="py-2.5 px-4 text-left">المجموع</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border font-semibold">
                      {selectedBill.bill_items?.map((item) => (
                        <tr key={item.id} className="hover:bg-muted/10 transition-colors">
                          <td className="py-3 px-4 font-bold">المنتج #{item.product}</td>
                          <td className="py-3 px-4 text-center font-semibold">الوحدة #{item.unit}</td>
                          <td className="py-3 px-4 text-center font-medium">{Number(item.price).toLocaleString()} ر.ي</td>
                          <td className="py-3 px-4 text-center font-bold">{item.quantity}</td>
                          <td className="py-3 px-4 text-left font-extrabold text-primary">{Number(item.subtotal).toLocaleString()} ر.ي</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Summary Block */}
              <div className="flex flex-col items-end gap-2 border-t border-border pt-4">
                <div className="w-full sm:w-64 flex flex-col gap-2">
                  <div className="flex items-center justify-between text-xs font-bold text-muted-foreground">
                    <span>إجمالي الكمية:</span>
                    <span>{selectedBill.bill_items?.reduce((sum, item) => sum + item.quantity, 0) || 0}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm font-black text-foreground pt-2 border-t border-border/60">
                    <span>الإجمالي الكلي:</span>
                    <span className="text-lg text-primary font-black">
                      {Number(selectedBill.total_price).toLocaleString()} ر.ي
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer Actions */}
            <div className="pt-3 border-t border-border flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setSelectedBill(null)}
                className="px-4 py-2 rounded-xl border border-input hover:bg-muted text-xs font-bold transition-colors cursor-pointer"
              >
                إغلاق
              </button>
              <button
                type="button"
                onClick={() => {
                  const printContent = document.getElementById('bill-print-area');
                  const windowUrl = 'about:blank';
                  const uniqueName = new Date().getTime();
                  const printWindow = window.open(windowUrl, uniqueName.toString(), 'left=50000,top=50000,width=0,height=0');
                  
                  if (printWindow && printContent) {
                    printWindow.document.write(`
                      <html dir="rtl" lang="ar">
                        <head>
                          <title>فاتورة رقم ${selectedBill.id}</title>
                          <style>
                            body { font-family: sans-serif; padding: 20px; direction: rtl; }
                            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                            th, td { border: 1px solid #ddd; padding: 10px; text-align: right; }
                            th { background-color: #f5f5f5; }
                            .total { text-align: left; margin-top: 20px; font-weight: bold; font-size: 1.2rem; }
                          </style>
                        </head>
                        <body>
                          <h2>فاتورة مبيعات مركز حضرموت الحديث للكهربائيات</h2>
                          <p><strong>رقم الفاتورة:</strong> #BILL-${selectedBill.id}</p>
                          <p><strong>المستلم:</strong> ${selectedBill.name_user || 'غير حدد'}</p>
                          <p><strong>التاريخ:</strong> ${formatDate(selectedBill.created_at)}</p>
                          ${printContent.innerHTML}
                        </body>
                      </html>
                    `);
                    printWindow.document.close();
                    printWindow.focus();
                    printWindow.print();
                    printWindow.close();
                  }
                }}
                className="px-5 py-2 rounded-xl bg-primary text-primary-foreground font-extrabold text-xs flex items-center gap-1.5 shadow-md shadow-primary/20 hover:opacity-90 transition-all cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                طباعة الفاتورة
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};
