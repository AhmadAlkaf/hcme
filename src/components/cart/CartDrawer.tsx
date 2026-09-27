'use client';

import React, { useEffect, useState } from 'react';
import { useCart } from '@/context/CartContext';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import {
  ShoppingCart,
  X,
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Layers,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function CartDrawer() {
  const {
    cartItems,
    isOpen,
    closeCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    totalItems,
    totalPrice,
    toast,
    dismissToast,
    openCart,
    checkoutCart,
  } = useCart();

  const tCart = useTranslations('Cart');
  const tCommon = useTranslations('Common');
  const locale = useLocale();
  const router = useRouter();
  const [confirmClear, setConfirmClear] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  // Prevent background scrolling when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      setConfirmClear(false);
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const formatPrice = (val: number) => {
    return val.toLocaleString(locale === 'ar' ? 'ar-YE' : 'en-US');
  };

  const handleCheckout = async () => {
    if (cartItems.length === 0 || isCheckingOut) return;
    setIsCheckingOut(true);
    try {
      const res = await checkoutCart();
      if (res.success) {
        closeCart();
      }
    } catch (e) {
      console.error('Checkout error:', e);
    } finally {
      setIsCheckingOut(false);
    }
  };

  const handleBrowseProducts = () => {
    closeCart();
    router.push('/products');
  };

  return (
    <>
      {/* Floating Toast Notification */}
      {toast && (
        <div
          className={cn(
            'fixed bottom-6 z-[3000] flex items-center gap-3 bg-slate-900/95 text-white px-5 py-3.5 rounded-2xl shadow-2xl backdrop-blur-xl border border-primary/40 transition-all duration-300 animate-in fade-in slide-in-from-bottom-5',
            locale === 'ar' ? 'right-6' : 'left-6'
          )}
        >
          {toast.image ? (
            <img
              src={toast.image}
              alt=""
              className="w-10 h-10 rounded-xl object-cover border border-white/20 shrink-0"
            />
          ) : (
            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary shrink-0">
              <CheckCircle2 size={20} />
            </div>
          )}

          <div className="flex flex-col">
            <span className="text-xs font-bold text-white">{toast.message}</span>
            <button
              onClick={() => {
                dismissToast();
                openCart();
              }}
              className="text-[11px] font-extrabold text-accent hover:underline text-start mt-0.5"
            >
              {tCart('view_cart')} ➔
            </button>
          </div>

          <button
            onClick={dismissToast}
            className="text-slate-400 hover:text-white transition-colors p-1"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Cart Slide-Over Drawer / Dialog */}
      <div
        className={cn(
          'fixed inset-0 z-[2500] transition-all duration-300',
          isOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'
        )}
      >
        {/* Glassmorphism Backdrop Overlay */}
        <div
          className={cn(
            'absolute inset-0 bg-slate-950/60 backdrop-blur-md transition-opacity duration-300',
            isOpen ? 'opacity-100' : 'opacity-0'
          )}
          onClick={closeCart}
        />

        {/* Drawer Container Panel */}
        <aside
          className={cn(
            'absolute top-0 bottom-0 w-full max-w-lg bg-white shadow-2xl border-border flex flex-col transition-transform duration-500 ease-out',
            locale === 'ar' ? 'left-0 border-r' : 'right-0 border-l',
            isOpen
              ? 'translate-x-0'
              : locale === 'ar'
              ? '-translate-x-full'
              : 'translate-x-full'
          )}
        >
          {/* Header */}
          <div className="p-6 border-b border-slate-100 bg-slate-50/80 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative w-12 h-12 rounded-2xl bg-primary-subtle text-primary flex items-center justify-center shadow-inner">
                <ShoppingCart size={24} />
                {totalItems > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-primary text-white text-[11px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-white animate-pulse">
                    {totalItems}
                  </span>
                )}
              </div>
              <div>
                <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                  {tCart('title')}
                </h2>
                <p className="text-xs text-slate-500 font-semibold">
                  {totalItems > 0
                    ? `${totalItems} ${tCart('items_count')}`
                    : tCart('empty_title')}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {cartItems.length > 0 && (
                <button
                  onClick={() => {
                    if (confirmClear) {
                      clearCart();
                      setConfirmClear(false);
                    } else {
                      setConfirmClear(true);
                      setTimeout(() => setConfirmClear(false), 4000);
                    }
                  }}
                  className={cn(
                    'px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all duration-200 flex items-center gap-1',
                    confirmClear
                      ? 'bg-red-500 text-white shadow-md animate-pulse'
                      : 'text-slate-400 hover:text-red-500 hover:bg-red-50'
                  )}
                  title={tCart('clear_cart')}
                >
                  <Trash2 size={15} />
                  {confirmClear ? (locale === 'ar' ? 'تأكيد الحذف؟' : 'Confirm?') : ''}
                </button>
              )}

              <button
                onClick={closeCart}
                className="w-10 h-10 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 flex items-center justify-center transition-colors"
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Body: Items List or Empty State */}
          <div className="flex-1 overflow-y-auto p-6 scroll-smooth">
            {cartItems.length > 0 ? (
              <div className="flex flex-col gap-4">
                {cartItems.map((item) => {
                  const name = locale === 'ar' ? item.nameAr : item.nameEn || item.nameAr;
                  const unit = locale === 'ar'
                    ? item.unitNameAr || 'حبة'
                    : item.unitNameEn || item.unitNameAr || 'Unit';
                  const brand = locale === 'ar'
                    ? item.brandNameAr
                    : item.brandNameEn || item.brandNameAr;

                  return (
                    <div
                      key={item.dbId || item.id}
                      className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-sm hover:shadow-md transition-all duration-300 flex items-center gap-4 group"
                    >
                      {/* Thumbnail */}
                      <div className="w-20 h-20 rounded-xl bg-slate-50 border border-slate-100 overflow-hidden shrink-0 relative">
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-300">
                            <Layers size={28} />
                          </div>
                        )}
                      </div>

                      {/* Details & Controls */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h4 className="font-extrabold text-sm text-slate-900 truncate">
                            {name}
                          </h4>
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="text-slate-300 hover:text-red-500 p-1 transition-colors shrink-0"
                            title={locale === 'ar' ? 'حذف' : 'Remove'}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>

                        <div className="flex items-center gap-2 mb-2">
                          <span className="px-2 py-0.5 rounded-md bg-primary-subtle text-primary font-bold text-[11px]">
                            {unit}
                          </span>
                          {brand && (
                            <span className="text-[11px] font-semibold text-slate-500">
                              {brand}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-100">
                          {/* Quantity Stepper */}
                          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200">
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="w-7 h-7 rounded-lg bg-white shadow-xs hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-colors active:scale-95"
                              aria-label="Decrease"
                            >
                              <Minus size={14} />
                            </button>
                            <span className="w-8 text-center font-black text-xs text-slate-900">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="w-7 h-7 rounded-lg bg-white shadow-xs hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-colors active:scale-95"
                              aria-label="Increase"
                            >
                              <Plus size={14} />
                            </button>
                          </div>

                          {/* Item Subtotal Price */}
                          <div className="text-end">
                            <div className="text-xs text-slate-400 font-medium">
                              {formatPrice(item.unitPrice)} × {item.quantity}
                            </div>
                             <div className="font-extrabold text-sm text-primary">
                               {formatPrice(item.subtotal ?? item.unitPrice * item.quantity)}{' '}
                               <span className="text-[10px] text-slate-500 font-semibold">
                                 {locale === 'ar' ? 'ريال' : 'YER'}
                               </span>
                             </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* Empty State */
              <div className="h-full flex flex-col items-center justify-center text-center p-8">
                <div className="relative w-28 h-28 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-6 shadow-inner border border-slate-200/60">
                  <div className="absolute inset-0 bg-primary/10 rounded-full animate-ping opacity-25" />
                  <ShoppingBag size={48} className="text-slate-400 relative z-10" />
                </div>

                <h3 className="text-xl font-extrabold text-slate-900 mb-2">
                  {tCart('empty_title')}
                </h3>
                <p className="text-sm text-slate-500 max-w-xs leading-relaxed mb-8 font-medium">
                  {tCart('empty_desc')}
                </p>

                <button
                  onClick={handleBrowseProducts}
                  className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-primary to-primary-dark hover:from-primary-dark hover:to-primary text-white font-extrabold text-sm shadow-lg shadow-primary/20 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 flex items-center gap-2"
                >
                  {tCart('browse_products')}
                  {locale === 'ar' ? <ArrowLeft size={16} /> : <ArrowRight size={16} />}
                </button>
              </div>
            )}
          </div>

          {/* Footer: Total Summary & Checkout Button */}
          {cartItems.length > 0 && (
            <div className="p-6 border-t border-slate-100 bg-slate-50/90 shadow-2xl flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between text-xs text-slate-500 font-bold">
                  <span>{tCart('subtotal')}</span>
                  <span>
                    {formatPrice(totalPrice)} {locale === 'ar' ? 'ريال' : 'YER'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-base font-black text-slate-900 pt-2 border-t border-slate-200">
                  <span className="flex items-center gap-1.5">
                    {tCart('grand_total')}
                    <Sparkles size={16} className="text-accent" />
                  </span>
                  <span className="text-xl text-primary font-black">
                    {formatPrice(totalPrice)}{' '}
                    <span className="text-xs font-bold text-slate-500">
                      {locale === 'ar' ? 'ريال' : 'YER'}
                    </span>
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 font-medium text-center mt-1">
                  {tCart('tax_shipping_note')}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-2.5 pt-2">
                <button
                  onClick={handleCheckout}
                  disabled={isCheckingOut}
                  className="w-full py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm shadow-lg shadow-emerald-600/25 hover:shadow-xl hover:shadow-emerald-600/35 hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-75 disabled:cursor-not-allowed"
                >
                  {isCheckingOut ? (locale === 'ar' ? 'جاري إتمام الشراء...' : 'Completing Purchase...') : tCart('checkout_whatsapp')}
                </button>

                <button
                  onClick={closeCart}
                  className="w-full py-3 rounded-xl border border-slate-200 text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-100 font-bold text-xs transition-colors"
                >
                  {tCart('continue_shopping')}
                </button>
              </div>
            </div>
          )}
        </aside>
      </div>
    </>
  );
}
