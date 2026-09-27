'use client';

import React, { useState, useEffect } from 'react';
import { X, Check, ShoppingBag } from 'lucide-react';
import type { OrderItem } from '@/types';

interface OrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (order: Partial<OrderItem>) => void;
  order?: OrderItem | null;
  onStatusChange?: (orderId: string, status: OrderItem['status']) => void;
}

export const OrderModal: React.FC<OrderModalProps> = ({ isOpen, onClose, onSave, order }) => {
  const [formData, setFormData] = useState({
    orderNumber: '',
    customerName: '',
    customerPhone: '',
    customerCity: 'المكلا',
    totalAmount: 50000,
    status: 'processing' as OrderItem['status'],
    itemsCount: 1,
    notes: '',
  });

  useEffect(() => {
    if (order) {
      setFormData({
        orderNumber: order.orderNumber,
        customerName: order.customerName,
        customerPhone: order.customerPhone,
        customerCity: order.customerCity,
        totalAmount: order.totalAmount,
        status: order.status,
        itemsCount: order.itemsCount,
        notes: order.notes || '',
      });
    } else {
      setFormData({
        orderNumber: `ORD-${new Date().getFullYear()}-${Math.floor(Math.random() * 900 + 100)}`,
        customerName: '',
        customerPhone: '+967 ',
        customerCity: 'المكلا',
        totalAmount: 50000,
        status: 'processing',
        itemsCount: 1,
        notes: '',
      });
    }
  }, [order, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-card text-card-foreground border border-border rounded-3xl w-full max-w-lg shadow-2xl p-6 space-y-5 animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-base text-foreground">
              {order ? `تفاصيل الطلب ${order.orderNumber}` : 'إضافة طلب توريد جديد'}
            </h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-muted-foreground hover:bg-muted">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSave(formData);
            onClose();
          }}
          className="space-y-4 text-xs sm:text-sm"
        >
          <div>
            <label className="block mb-1 font-bold text-foreground">اسم العميل / المؤسسة *</label>
            <input
              type="text"
              required
              value={formData.customerName}
              onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
              placeholder="مثال: شركة حضرموت للمقاولات"
              className="w-full px-3.5 py-2.5 rounded-xl border border-input bg-background/50 font-bold"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block mb-1 font-bold text-foreground">رقم الهاتف</label>
              <input
                type="text"
                value={formData.customerPhone}
                onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-input bg-background/50 font-bold dir-ltr text-right"
              />
            </div>
            <div>
              <label className="block mb-1 font-bold text-foreground">المدينة / المنطقة</label>
              <input
                type="text"
                value={formData.customerCity}
                onChange={(e) => setFormData({ ...formData, customerCity: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-input bg-background/50 font-bold"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block mb-1 font-bold text-foreground">المبلغ الإجمالي (ر.ي)</label>
              <input
                type="number"
                value={formData.totalAmount}
                onChange={(e) => setFormData({ ...formData, totalAmount: Number(e.target.value) })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-input bg-background/50 font-bold"
              />
            </div>
            <div>
              <label className="block mb-1 font-bold text-foreground">حالة الطلب</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as OrderItem["status"] })}
                className="w-full px-3 py-2.5 rounded-xl border border-input bg-background/50 font-bold"
              >
                <option value="processing">جاري معالجة طلبك</option>
                <option value="shipped">تم شحن طلبك</option>
                <option value="cancelled">تم الغاء طلبك</option>
                <option value="modified">تم تعديل طلبك</option>
                <option value="accepted">تم قبول طلبك</option>
                <option value="rejected">تم رفض طلبك</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block mb-1 font-bold text-foreground">ملاحظات الطلب والمنتجات التابعة</label>
            <textarea
              rows={3}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-input bg-background/50 resize-none"
            />
          </div>

          <div className="pt-3 border-t border-border flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-input hover:bg-muted text-xs font-bold"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-primary text-primary-foreground font-extrabold text-xs flex items-center gap-1.5 shadow-md shadow-primary/20"
            >
              <Check className="w-4 h-4" />
              حفظ الطلب
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
