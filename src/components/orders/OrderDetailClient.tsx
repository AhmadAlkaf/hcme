'use client';

import React from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { 
  Package, 
  Calendar, 
  CreditCard, 
  Layers, 
  Truck, 
  CheckCircle, 
  AlertCircle,
  Clock,
  Printer,
  ArrowRight,
  ArrowLeft,
  User,
  Check,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ApiBasket } from '@/actions/basket.actions';
import { updateOrderStatusServerAction } from '@/actions/basket.actions';
import { Link, useRouter } from '@/i18n/routing';

interface OrderDetailClientProps {
  order: ApiBasket;
}

export default function OrderDetailClient({ order }: OrderDetailClientProps) {
  const t = useTranslations('Orders');
  const tCommon = useTranslations('Common');
  const locale = useLocale();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);
  const [successMsg, setSuccessMsg] = React.useState<string | null>(null);

  const handleStatusUpdate = async (newStatus: number) => {
    setIsSubmitting(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      const res = await updateOrderStatusServerAction(order.id, newStatus);
      if (res.success) {
        setSuccessMsg(newStatus === 5 
          ? (locale === 'ar' ? 'تم قبول التعديلات بنجاح! 🎉' : 'Modifications accepted successfully! 🎉')
          : (locale === 'ar' ? 'تم رفض التعديلات بنجاح. ❌' : 'Modifications rejected successfully. ❌')
        );
        router.refresh();
      } else {
        setErrorMsg(res.error || (locale === 'ar' ? 'فشل تحديث حالة الطلب' : 'Failed to update order status'));
      }
    } catch (e) {
      setErrorMsg(locale === 'ar' ? 'حدث خطأ غير متوقع' : 'An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatPrice = (val: number) => {
    return val.toLocaleString(locale === 'ar' ? 'ar-YE' : 'en-US');
  };

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString(locale === 'ar' ? 'ar-YE' : 'en-US', {
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

  const getStatusBadge = (statusNum: number) => {
    switch (statusNum) {
      case 1:
        return {
          label: t('status_processing'),
          classes: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
          icon: <Clock size={14} className="animate-spin-slow" />,
        };
      case 2:
        return {
          label: t('status_shipped'),
          classes: 'bg-indigo-500/10 text-indigo-600 border-indigo-500/20',
          icon: <Truck size={14} />,
        };
      case 3:
        return {
          label: t('status_cancelled'),
          classes: 'bg-red-500/10 text-red-600 border-red-500/20',
          icon: <AlertCircle size={14} />,
        };
      case 4:
        return {
          label: t('status_modified'),
          classes: 'bg-purple-500/10 text-purple-600 border-purple-500/20',
          icon: <Layers size={14} />,
        };
      case 5:
        return {
          label: t('status_accepted'),
          classes: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
          icon: <CheckCircle size={14} />,
        };
      case 6:
        return {
          label: t('status_rejected'),
          classes: 'bg-rose-500/10 text-rose-600 border-rose-500/20',
          icon: <AlertCircle size={14} />,
        };
      default:
        return {
          label: t('status_unknown'),
          classes: 'bg-slate-500/10 text-slate-600 border-slate-500/20',
          icon: <AlertCircle size={14} />,
        };
    }
  };

  const getPaymentMethod = (typePayment: number) => {
    switch (typePayment) {
      case 1:
        return tCommon('cash_on_delivery');
      case 2:
        return tCommon('bank_transfer');
      default:
        return tCommon('other');
    }
  };

  const badge = getStatusBadge(order.status);
  const totalQty = order.basket_items?.reduce((sum, item) => sum + item.quantity, 0) || 0;

  return (
    <div className="min-h-[85vh] py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden bg-slate-50/50 print:bg-white print:py-0">
      {/* Background ambient lighting */}
      <div className="absolute inset-0 pointer-events-none opacity-30 print:hidden">
        <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[140px] -translate-y-1/3" />
        <div className="absolute bottom-0 left-1/4 w-[600px] h-[600px] bg-accent/10 rounded-full blur-[140px] translate-y-1/3" />
      </div>

      <div className="max-w-4xl mx-auto relative z-10 print:max-w-full">
        {/* Back Link & Print Action */}
        <div className="mb-6 flex items-center justify-between gap-4 print:hidden">
          <Link
            href="/orders"
            className="inline-flex items-center gap-2 text-xs font-black text-slate-500 hover:text-primary transition-colors bg-white px-4 py-2 rounded-full border border-slate-200/85 shadow-xs"
          >
            {locale === 'ar' ? <ArrowRight size={14} /> : <ArrowLeft size={14} />}
            {locale === 'ar' ? 'العودة للطلبات' : 'Back to Orders'}
          </Link>

          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 text-xs font-black text-slate-600 hover:text-primary transition-colors bg-white px-4 py-2 rounded-full border border-slate-200/85 shadow-xs cursor-pointer"
          >
            <Printer size={14} />
            {locale === 'ar' ? 'طباعة الفاتورة' : 'Print Invoice'}
          </button>
        </div>

        {/* Invoice Container Card */}
        <div className="bg-white border border-slate-200/90 rounded-[2rem] shadow-sm overflow-hidden p-6 sm:p-10 print:border-0 print:shadow-none print:p-0">
          {/* Invoice Header */}
          <div className="flex flex-col md:flex-row justify-between gap-6 pb-8 border-b border-slate-200/60 print:pb-4">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-primary/5 border border-primary/10 text-primary flex items-center justify-center shrink-0 print:border print:bg-slate-50">
                  <Package size={24} />
                </div>
                <div>
                  <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                    {locale === 'ar' ? `طلب رقم #${order.id}` : `Order #${order.id}`}
                  </h1>
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 mt-1">
                    <Calendar size={14} className="text-slate-400" />
                    <span>{formatDate(order.created_at)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col md:items-end justify-center gap-2">
              <span
                className={cn(
                  'flex items-center gap-1.5 px-4 py-2 rounded-full border text-xs font-extrabold shadow-2xs w-fit',
                  badge.classes
                )}
              >
                {badge.icon}
                {badge.label}
              </span>
            </div>
          </div>

          {/* Banner for Status 4 Review */}
          {order.status === 4 && (
            <div className="mt-8 bg-purple-50/75 border border-purple-200/80 rounded-3xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 animate-in fade-in duration-300 print:hidden">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center shrink-0">
                  <Layers size={24} />
                </div>
                <div className="space-y-1 text-start">
                  <h4 className="font-extrabold text-base text-purple-950">
                    {locale === 'ar' ? 'طلبك تم تعديله بواسطة الإدارة' : 'Your order has been modified by the admin'}
                  </h4>
                  <p className="text-xs font-semibold text-purple-700/80">
                    {locale === 'ar' 
                      ? 'يرجى مراجعة تفاصيل المنتجات والكميات المعدلة أدناه والموافقة بالقبول أو الرفض.' 
                      : 'Please review the updated products and quantities below and approve by accepting or rejecting.'}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 w-full md:w-auto shrink-0 justify-end">
                <button
                  onClick={() => handleStatusUpdate(6)}
                  disabled={isSubmitting}
                  className="px-5 py-3 rounded-2xl bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 font-extrabold text-xs transition-all disabled:opacity-50 flex items-center gap-1.5 cursor-pointer shadow-2xs w-full md:w-auto justify-center"
                >
                  <X size={16} />
                  {locale === 'ar' ? 'رفض التعديل' : 'Reject'}
                </button>
                <button
                  onClick={() => handleStatusUpdate(5)}
                  disabled={isSubmitting}
                  className="px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs transition-all disabled:opacity-50 flex items-center gap-1.5 cursor-pointer shadow-md shadow-emerald-500/20 w-full md:w-auto justify-center"
                >
                  <Check size={16} />
                  {locale === 'ar' ? 'قبول التعديل' : 'Accept'}
                </button>
              </div>
            </div>
          )}

          {/* Success/Error message inside the card if present */}
          {(successMsg || errorMsg) && (
            <div className={cn(
              "mt-8 p-4 rounded-2xl text-xs font-extrabold border print:hidden",
              successMsg 
                ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                : "bg-red-500/10 text-red-600 border-red-500/20"
            )}>
              {successMsg || errorMsg}
            </div>
          )}

          {/* Metadata Info Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 py-8 border-b border-slate-200/60 print:py-4">
            <div className="space-y-4">
              <h3 className="font-extrabold text-xs text-slate-400 uppercase tracking-wider">
                {locale === 'ar' ? 'تفاصيل المشتري' : 'Customer Info'}
              </h3>
              <div className="flex items-center gap-3 bg-slate-50 border border-slate-100 p-4 rounded-2xl">
                <div className="w-10 h-10 rounded-full bg-slate-200/60 flex items-center justify-center text-slate-600">
                  <User size={18} />
                </div>
                <div>
                  <div className="font-extrabold text-sm text-slate-900">
                    {order.name_usernaem || 'عميل HMEC'}
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    {locale === 'ar' ? `رقم المستخدم: ${order.user}` : `User ID: ${order.user}`}
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-extrabold text-xs text-slate-400 uppercase tracking-wider">
                {locale === 'ar' ? 'تفاصيل الدفع' : 'Payment Info'}
              </h3>
              <div className="flex items-center gap-3 bg-slate-50 border border-slate-100 p-4 rounded-2xl">
                <div className="w-10 h-10 rounded-full bg-slate-200/60 flex items-center justify-center text-slate-600">
                  <CreditCard size={18} />
                </div>
                <div>
                  <div className="font-extrabold text-sm text-slate-900">
                    {getPaymentMethod(order.type_payment)}
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    {locale === 'ar' ? 'حالة الطلب: قيد المعالجة' : 'Request: In Progress'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Order Items Table */}
          <div className="py-8 border-b border-slate-200/60 print:py-4">
            <h3 className="font-extrabold text-xs text-slate-400 uppercase tracking-wider mb-4">
              {t('details')}
            </h3>

            <div className="border border-slate-200/80 rounded-2xl overflow-hidden shadow-2xs">
              <table className="w-full text-start border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 text-xs font-black border-b border-slate-100">
                    <th className="py-4 px-6 text-start">{locale === 'ar' ? 'المنتج' : 'Product'}</th>
                    <th className="py-4 px-6 text-center">{locale === 'ar' ? 'الوحدة' : 'Unit'}</th>
                    <th className="py-4 px-6 text-center">{locale === 'ar' ? 'السعر الفردي' : 'Unit Price'}</th>
                    <th className="py-4 px-6 text-center">{locale === 'ar' ? 'الكمية' : 'Qty'}</th>
                    <th className="py-4 px-6 text-end">{locale === 'ar' ? 'المجموع' : 'Subtotal'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                  {order.basket_items?.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/20 transition-colors">
                      <td className="py-4 px-6 font-extrabold text-slate-900 text-start">
                        {locale === 'ar' ? item.name_product_ar : item.name_product_en || item.name_product_ar}
                      </td>
                      <td className="py-4 px-6 text-center">
                        <span className="bg-slate-100 px-2.5 py-1 rounded-md text-slate-600 font-bold text-xs">
                          {locale === 'ar' ? item.name_unit_ar : item.name_unit_en || item.name_unit_ar}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-center font-bold">
                        {formatPrice(item.price)} {locale === 'ar' ? 'ريال' : 'YER'}
                      </td>
                      <td className="py-4 px-6 text-center font-black text-slate-900">
                        {item.quantity}
                      </td>
                      <td className="py-4 px-6 text-end font-extrabold text-primary">
                        {formatPrice(item.subtotal)} {locale === 'ar' ? 'ريال' : 'YER'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pricing Total Summary Block */}
          <div className="pt-8 flex flex-col items-end gap-3 print:pt-4">
            <div className="w-full sm:w-80 flex flex-col gap-2.5">
              <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                <span>{locale === 'ar' ? 'عدد السلع الكلية:' : 'Total Qty:'}</span>
                <span>{totalQty}</span>
              </div>
              <div className="flex items-center justify-between text-base font-black text-slate-900 pt-3 border-t border-slate-150">
                <span>{t('total_price')}</span>
                <span className="text-2xl text-primary font-black">
                  {formatPrice(order.total_price)}{' '}
                  <span className="text-sm font-bold text-slate-500">
                    {locale === 'ar' ? 'ريال' : 'YER'}
                  </span>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Invoice Print Footer */}
        <div className="mt-8 text-center hidden print:block border-t border-dashed border-slate-350 pt-4">
          <p className="text-xs font-bold text-slate-500">
            {locale === 'ar' ? 'شكرًا لتعاملكم مع مركز حضرموت الحديث للكهربائيات (HMEC) ⚡' : 'Thank you for choosing Hadramout Modern Center (HMEC) ⚡'}
          </p>
        </div>
      </div>
    </div>
  );
}
