'use client';

import React, { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import { 
  Package, 
  Calendar, 
  ChevronDown, 
  ChevronUp, 
  ShoppingBag, 
  ArrowRight, 
  ArrowLeft,
  CreditCard,
  Layers,
  Truck,
  CheckCircle,
  AlertCircle,
  Clock,
  Edit
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ServerPagination } from '@/components/ui/ServerPagination';
import type { PaginationMeta } from '@/types/pagination';
import type { ApiBasket } from '@/actions/basket.actions';
import { Link } from '@/i18n/routing';

interface OrdersClientProps {
  orders: ApiBasket[];
  meta: PaginationMeta;
  /** Locale-aware path used to build the pagination links. */
  basePath: string;
}

export default function OrdersClient({ orders, meta, basePath }: OrdersClientProps) {
  const t = useTranslations('Orders');
  const tCommon = useTranslations('Common');
  const tPagination = useTranslations('Pagination');
  const kind = 'orders';
  const locale = useLocale();
  const router = useRouter();



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

  // Maps order status numeric values to UI strings and colors
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
        return  ('cash_on_delivery');
      case 2:
        return tCommon('bank_transfer');
      default:
        return tCommon('other');
    }
  };

  return (
    <div className="min-h-[85vh] py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden bg-slate-50/50">
      {/* Background ambient lighting */}
      <div className="absolute inset-0 pointer-events-none opacity-30">
        <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[140px] -translate-y-1/3" />
        <div className="absolute bottom-0 left-1/4 w-[600px] h-[600px] bg-accent/10 rounded-full blur-[140px] translate-y-1/3" />
      </div>

      <div className="max-w-4xl mx-auto relative z-10">
        {/* Breadcrumb / Back Navigation */}
        <div className="mb-6">
          <Link
            href="/products"
            className="inline-flex items-center gap-2 text-xs font-black text-slate-500 hover:text-primary transition-colors bg-white px-4 py-2 rounded-full border border-slate-200/85 shadow-xs"
          >
            {locale === 'ar' ? <ArrowRight size={14} /> : <ArrowLeft size={14} />}
            {tCommon('browse_products')}
          </Link>
        </div>

        {/* Page Title Header */}
        <div className="mb-10 text-center sm:text-start flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-slate-200/60">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center justify-center sm:justify-start gap-3">
              <Package className="text-primary w-8 h-8" />
              {t('title')}
            </h1>
            <p className="text-sm font-medium text-slate-500 mt-2">
              {t('subtitle')}
            </p>
          </div>
          <div className="bg-primary/5 border border-primary/10 px-4 py-2 rounded-2xl max-w-fit mx-auto sm:mx-0">
            <span className="text-xs font-extrabold text-primary">
              {locale === 'ar' ? 'إجمالي الطلبات:' : 'Total Orders:'} {meta.count}
            </span>
          </div>
        </div>

        {/* Orders List / Empty State */}
        {orders.length === 0 ? (
          /* Beautiful Empty State */
          <div className="bg-white/80 backdrop-blur-xl border border-slate-200/90 rounded-[2.5rem] p-12 text-center shadow-xl flex flex-col items-center justify-center">
            <div className="relative w-28 h-28 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-6 shadow-inner border border-slate-200/60">
              <div className="absolute inset-0 bg-primary/10 rounded-full animate-ping opacity-25" />
              <ShoppingBag size={48} className="text-slate-400 relative z-10" />
            </div>
            <h3 className="text-2xl font-black text-slate-900 mb-2">
              {t('no_orders_title')}
            </h3>
            <p className="text-sm font-medium text-slate-500 max-w-sm leading-relaxed mb-8">
              {t('no_orders_desc')}
            </p>
            <Link
              href="/products"
              className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-primary to-primary-dark hover:from-primary-dark hover:to-primary text-white font-extrabold text-sm shadow-lg shadow-primary/20 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 flex items-center gap-2"
            >
              {t('browse_products')}
              {locale === 'ar' ? <ArrowLeft size={16} /> : <ArrowRight size={16} />}
            </Link>
          </div>
        ) : (
          /* List of Orders */
          <div className="flex flex-col gap-6">
            {orders.map((order) => {
              const badge = getStatusBadge(order.status);
              const itemCount = order.basket_items?.length || 0;

              return (
                <Link
                  key={order.id}
                  href={`/orders/${order.id}`}
                  className="bg-white border border-slate-200/90 rounded-3xl shadow-sm hover:shadow-[0_15px_30px_rgba(27,166,156,0.1)] hover:border-primary/30 transition-all duration-300 overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between p-6 gap-4 group cursor-pointer block"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-primary/5 border border-primary/10 text-primary flex items-center justify-center shrink-0 group-hover:bg-primary-subtle transition-colors">
                      <Package size={24} />
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-extrabold text-base text-slate-900 flex items-center gap-2 group-hover:text-primary transition-colors">
                        {t('order_id')}: #{order.id}
                        <span className="text-xs font-bold text-slate-400">
                          ({itemCount} {locale === 'ar' ? 'منتجات' : 'items'})
                        </span>
                      </h4>
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                        <Calendar size={14} className="text-slate-400" />
                        <span>{formatDate(order.created_at)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 pt-3 sm:pt-0">
                    <div className="flex flex-col items-start sm:items-end">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">
                        {t('total_price')}
                      </span>
                      <span className="text-lg font-black text-primary">
                        {formatPrice(order.total_price)}{' '}
                        <span className="text-xs font-bold text-slate-500">
                          {locale === 'ar' ? 'ريال' : 'YER'}
                        </span>
                      </span>
                    </div>

                     <div className="flex items-center gap-3">
                      {/* Review Edit Button */}
                      {order.status === 4 && (
                        <div className="flex items-center gap-1 bg-purple-600 text-white px-3 py-1.5 rounded-full text-xs font-black shadow-xs hover:bg-purple-700 transition-colors shrink-0">
                          <Edit size={14} />
                          <span>{locale === 'ar' ? 'مراجعة التعديل' : 'Review Edit'}</span>
                        </div>
                      )}

                      {/* Status Badge */}
                      <span
                        className={cn(
                          'flex items-center gap-1 px-3 py-1.5 rounded-full border text-xs font-extrabold shadow-2xs',
                          badge.classes
                        )}
                      >
                        {badge.icon}
                        {badge.label}
                      </span>

                      {/* Details Link Arrow */}
                      <div className="w-8 h-8 rounded-full bg-slate-100 group-hover:bg-primary group-hover:text-white text-slate-500 flex items-center justify-center transition-all duration-300">
                        {locale === 'ar' ? <ArrowLeft size={16} /> : <ArrowRight size={16} />}
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {meta.totalPages > 0 && (
          <div className="mt-8 bg-white/80 backdrop-blur-xl border border-slate-200/90 rounded-3xl p-4 shadow-lg">
            <ServerPagination
              meta={meta}
              basePath={basePath}
              idPrefix="public-orders"
              labels={{
                showing: tPagination('showing'),
                of: tPagination('of'),
                items: tPagination(`items.${kind}`),
                page: tPagination('page'),
                perPage: tPagination('ordersPerPage'),
                previous: tPagination('previous'),
                next: tPagination('next'),
                first: tPagination('first'),
                last: tPagination('last'),
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
