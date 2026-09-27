'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Package, 
  Clock, 
  Truck, 
  AlertCircle, 
  Layers, 
  CheckCircle, 
  ArrowRight, 
  User, 
  CreditCard,
  Check,
  FileText,
  Bookmark,
  Activity,
  Plus,
  Trash2
} from 'lucide-react';
import type { ApiBasket } from '@/actions/basket.actions';
import { 
  updateOrderStatusServerAction,
  updateOrderAdminServerAction,
  addBasketItemAdminServerAction,
  deleteBasketItemServerAction
} from '@/actions/basket.actions';
import { getAllProductsServerAction } from '@/actions/products.actions';
import type { ApiProduct } from '@/types/api';

interface OrderEditClientProps {
  order: ApiBasket;
}

export default function OrderEditClient({ order }: OrderEditClientProps) {
  const router = useRouter();
  const [status, setStatus] = useState<number>(order.status || 1);
  const [typePayment, setTypePayment] = useState<number>(order.type_payment || 1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // States for adding product
  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<ApiProduct | null>(null);
  const [selectedUnit, setSelectedUnit] = useState<number | null>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [addProductMessage, setAddProductMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Fetch products on mount
  useEffect(() => {
    const loadProducts = async () => {
      try {
        // Every product is needed: the picker must list all of them, not the
        // first page of 15.
        const res = await getAllProductsServerAction();
        if (res && res.length > 0) {
          setProducts(res);
        }
      } catch (err) {
        console.error('Failed to load products:', err);
      }
    };
    loadProducts();
  }, []);

  const handleProductChange = (productId: number) => {
    const prod = products.find(p => p.id === productId) || null;
    setSelectedProduct(prod);
    if (prod && prod.name_uint && prod.name_uint.length > 0) {
      setSelectedUnit(prod.name_uint[0].id);
    } else {
      setSelectedUnit(null);
    }
  };

  const getStatusBadge = (statusNum: number) => {
    switch (statusNum) {
      case 1:
        return {
          label: 'جاري معالجة طلبك',
          classes: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
          icon: <Clock size={16} className="animate-spin-slow" />,
        };
      case 2:
        return {
          label: 'تم شحن طلبك',
          classes: 'bg-indigo-500/10 text-indigo-600 border-indigo-500/20',
          icon: <Truck size={16} />,
        };
      case 3:
        return {
          label: 'تم الغاء طلبك',
          classes: 'bg-red-500/10 text-red-600 border-red-500/20',
          icon: <AlertCircle size={16} />,
        };
      case 4:
        return {
          label: 'تم تعديل طلبك',
          classes: 'bg-purple-500/10 text-purple-600 border-purple-500/20',
          icon: <Layers size={16} />,
        };
      case 5:
        return {
          label: 'تم قبول طلبك',
          classes: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
          icon: <CheckCircle size={16} />,
        };
      case 6:
        return {
          label: 'تم رفض طلبك',
          classes: 'bg-rose-500/10 text-rose-600 border-rose-500/20',
          icon: <AlertCircle size={16} />,
        };
      default:
        return {
          label: 'غير معروف',
          classes: 'bg-slate-500/10 text-slate-600 border-slate-500/20',
          icon: <AlertCircle size={16} />,
        };
    }
  };

  const getPaymentMethod = (typePayment: number) => {
    switch (typePayment) {
      case 1:
        return 'الدفع عند الاستلام (COD)';
      case 2:
        return 'تحويل بنكي / إيداع';
      default:
        return 'طريقة دفع أخرى';
    }
  };

  const getRequestTypeLabel = (typeRequest: number) => {
    switch (typeRequest) {
      case 1:
        return 'طلب مبيعات عادي';
      case 2:
        return 'طلب عرض سعر';
      case 3:
        return 'طلب توريد خاص';
      default:
        return `طلب نوع #${typeRequest}`;
    }
  };

  const handleSaveOrderDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    const formData = new FormData();
    formData.append('status', status.toString());
    formData.append('type_payment', typePayment.toString());

    try {
      const res = await updateOrderAdminServerAction(order.id, formData);
      if (res.success) {
        setMessage({ type: 'success', text: 'تم تحديث تفاصيل الطلب بنجاح!' });
        setTimeout(() => {
          router.push('/dashboard/orders');
          router.refresh();
        }, 1500);
      } else {
        setMessage({ type: 'error', text: res.error || 'فشل تحديث تفاصيل الطلب' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'حدث خطأ غير متوقع أثناء الحفظ' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddProductToOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct || !selectedUnit) {
      setAddProductMessage({ type: 'error', text: 'يرجى اختيار المنتج والوحدة أولاً' });
      return;
    }

    setIsAddingProduct(true);
    setAddProductMessage(null);

    const formData = new FormData();
    formData.append('basket', order.id.toString());
    formData.append('product', selectedProduct.id.toString());
    formData.append('quantity', quantity.toString());
    formData.append('unit', selectedUnit.toString());

    try {
      const res = await addBasketItemAdminServerAction(formData);
      if (res.success) {
        setAddProductMessage({ type: 'success', text: 'تم إضافة المنتج للطلب بنجاح!' });
        setQuantity(1);
        setSelectedProduct(null);
        setSelectedUnit(null);
        router.refresh();
      } else {
        setAddProductMessage({ type: 'error', text: res.error || 'فشل إضافة المنتج للطلب' });
      }
    } catch (err) {
      setAddProductMessage({ type: 'error', text: 'حدث خطأ غير متوقع أثناء الإضافة' });
    } finally {
      setIsAddingProduct(false);
    }
  };

  const handleDeleteProduct = async (itemId: number) => {
    if (!window.confirm('هل أنت متأكد من رغبتك في حذف هذا المنتج من الطلب؟')) {
      return;
    }

    try {
      const res = await deleteBasketItemServerAction(itemId);
      if (res.success) {
        alert('تم حذف المنتج من الطلب بنجاح');
        router.refresh();
      } else {
        alert(res.error || 'فشل حذف المنتج من الطلب');
      }
    } catch (err) {
      alert('حدث خطأ غير متوقع أثناء الحذف');
    }
  };

  const currentBadge = getStatusBadge(status);
  const totalQty = order.basket_items?.reduce((sum, item) => sum + item.quantity, 0) || 0;

  return (
    <div className="space-y-6 max-w-4xl mx-auto py-2">
      {/* Navigation Header */}
      <div className="flex items-center justify-between gap-4">
        <button
          onClick={() => router.push('/dashboard/orders')}
          className="inline-flex items-center gap-2 text-xs font-black text-slate-500 hover:text-primary transition-colors bg-card px-4 py-2 rounded-full border border-border shadow-xs cursor-pointer animate-in fade-in"
        >
          <ArrowRight size={16} />
          العودة للطلبات
        </button>
      </div>

      {/* Main Content Details */}
      <div className="bg-card text-card-foreground border border-border/80 rounded-3xl shadow-sm overflow-hidden p-6 sm:p-8 space-y-6 animate-in fade-in duration-300">
        
        {/* Title and Badge */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-border pb-6 gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl font-black flex items-center gap-2">
              <Package className="text-primary w-6 h-6" />
              تفاصيل الطلب المستلم #{order.id}
            </h1>
            <p className="text-xs text-muted-foreground">
              تاريخ استلام الطلب: {new Date(order.created_at).toLocaleString('ar-YE')}
            </p>
          </div>
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-extrabold shadow-2xs ${currentBadge.classes}`}>
            {currentBadge.icon}
            {currentBadge.label}
          </div>
        </div>

        {/* Customer & Request Metadata Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Customer */}
          <div className="p-4 bg-muted/20 border border-border/60 rounded-2xl flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <User size={18} />
            </div>
            <div>
              <span className="text-[10px] font-bold text-muted-foreground block">العميل</span>
              <span className="text-xs font-extrabold text-foreground">{order.name_usernaem || 'عميل HMEC'}</span>
              <span className="text-[9px] text-muted-foreground block">رقم المستخدم: #{order.user}</span>
            </div>
          </div>

          {/* Payment */}
          <div className="p-4 bg-muted/20 border border-border/60 rounded-2xl flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <CreditCard size={18} />
            </div>
            <div>
              <span className="text-[10px] font-bold text-muted-foreground block">طريقة الدفع</span>
              <span className="text-xs font-extrabold text-foreground">{getPaymentMethod(order.type_payment)}</span>
            </div>
          </div>

          {/* Request Type */}
          <div className="p-4 bg-muted/20 border border-border/60 rounded-2xl flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Bookmark size={18} />
            </div>
            <div>
              <span className="text-[10px] font-bold text-muted-foreground block">نوع الطلب</span>
              <span className="text-xs font-extrabold text-foreground">{getRequestTypeLabel(order.user_type_request)}</span>
            </div>
          </div>

          {/* Basket Progress */}
          <div className="p-4 bg-muted/20 border border-border/60 rounded-2xl flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Activity size={18} />
            </div>
            <div>
              <span className="text-[10px] font-bold text-muted-foreground block">حالة السلة</span>
              <span className={`text-xs font-extrabold ${order.in_progress === 1 ? 'text-emerald-600' : 'text-amber-600'}`}>
                {order.in_progress === 1 ? 'مكتملة الشراء' : 'مسودة / قيد التسوق'}
              </span>
            </div>
          </div>
        </div>

        {/* Attachment Image Section */}
        {order.image && (
          <div className="p-5 bg-muted/10 border border-border/80 rounded-3xl space-y-2.5">
            <span className="text-xs font-extrabold text-muted-foreground block">إثبات الدفع المرفق (الإيصال/التحويل):</span>
            <div className="relative max-w-sm rounded-2xl overflow-hidden border border-border hover:shadow-md transition-shadow">
              <img 
                src={order.image} 
                alt="إيصال التحويل المالي" 
                className="w-full h-auto object-cover max-h-60 cursor-zoom-in"
                onClick={() => window.open(order.image!, '_blank')}
              />
              <div className="absolute bottom-0 inset-x-0 bg-black/60 p-2 text-center text-[10px] font-bold text-white">
                اضغط لتكبير الصورة 🔍
              </div>
            </div>
          </div>
        )}

        {/* Products Table */}
        <div className="space-y-3">
          <h3 className="font-extrabold text-xs text-muted-foreground uppercase tracking-wider">تفاصيل المنتجات المطلوبة</h3>
          <div className="border border-border/80 rounded-2xl overflow-hidden shadow-2xs">
            <table className="w-full text-right text-xs sm:text-sm border-collapse">
              <thead>
                <tr className="bg-muted/50 text-muted-foreground text-xs font-black border-b border-border">
                  <th className="py-3 px-4 text-right">المنتج</th>
                  <th className="py-3 px-4 text-center">الوحدة</th>
                  <th className="py-3 px-4 text-center">السعر الفردي</th>
                  <th className="py-3 px-4 text-center">الكمية</th>
                  <th className="py-3 px-4 text-left">المجموع</th>
                  <th className="py-3 px-4 text-center w-16 print:hidden">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border font-medium">
                {order.basket_items?.map((item) => (
                  <tr key={item.id} className="hover:bg-muted/10 transition-colors">
                    <td className="py-3.5 px-4 font-extrabold text-foreground text-right">{item.name_product_ar}</td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="bg-muted px-2.5 py-0.5 rounded-md text-muted-foreground font-bold text-xs">
                        {item.name_unit_ar}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center font-bold">{item.price.toLocaleString()} ر.ي</td>
                    <td className="py-3.5 px-4 text-center font-black text-foreground">{item.quantity}</td>
                    <td className="py-3.5 px-4 text-left font-extrabold text-primary">{item.subtotal.toLocaleString()} ر.ي</td>
                    <td className="py-3.5 px-4 text-center print:hidden">
                      <button
                        onClick={() => handleDeleteProduct(item.id)}
                        className="text-red-500 hover:text-red-700 p-1.5 rounded-full hover:bg-red-50 transition-colors cursor-pointer"
                        title="حذف المنتج من الطلب"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Total Summary */}
        <div className="flex flex-col items-end gap-2 border-t border-border pt-4">
          <div className="w-full sm:w-64 flex flex-col gap-2">
            <div className="flex items-center justify-between text-xs font-bold text-muted-foreground">
              <span>عدد السلع الكلية:</span>
              <span>{totalQty}</span>
            </div>
            <div className="flex items-center justify-between text-sm font-black text-foreground pt-2 border-t border-border/60">
              <span>الإجمالي الكلي:</span>
              <span className="text-xl text-primary font-black">{order.total_price.toLocaleString()} ر.ي</span>
            </div>
          </div>
        </div>

        {/* Add Product Form */}
        <div className="bg-muted/10 border border-border/80 rounded-3xl p-6 mt-6 space-y-4">
          <h3 className="font-extrabold text-sm text-foreground flex items-center gap-2">
            <Plus className="w-5 h-5 text-primary" />
            إضافة منتج جديد للطلب
          </h3>

          {addProductMessage && (
            <div className={`p-4 rounded-2xl text-xs font-extrabold border ${
              addProductMessage.type === 'success' 
                ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' 
                : 'bg-red-500/10 text-red-600 border-red-500/20'
            }`}>
              {addProductMessage.text}
            </div>
          )}

          <form onSubmit={handleAddProductToOrder} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            {/* Select Product */}
            <div className="space-y-1.5 md:col-span-2 text-right">
              <label className="block text-xs font-bold text-muted-foreground">اختر المنتج:</label>
              <select
                value={selectedProduct?.id || ''}
                onChange={(e) => handleProductChange(Number(e.target.value))}
                className="w-full px-4 py-2.5 rounded-2xl border border-border bg-background font-bold text-xs text-foreground focus:ring-2 focus:ring-primary focus:border-transparent outline-none cursor-pointer"
              >
                <option value="">-- اختر منتجاً --</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name_product_ar}
                  </option>
                ))}
              </select>
            </div>

            {/* Select Unit */}
            <div className="space-y-1.5 text-right">
              <label className="block text-xs font-bold text-muted-foreground">الوحدة:</label>
              <select
                value={selectedUnit || ''}
                onChange={(e) => setSelectedUnit(Number(e.target.value))}
                disabled={!selectedProduct}
                className="w-full px-4 py-2.5 rounded-2xl border border-border bg-background font-bold text-xs text-foreground focus:ring-2 focus:ring-primary focus:border-transparent outline-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="">-- اختر الوحدة --</option>
                {selectedProduct?.name_uint?.map((unit) => (
                  <option key={unit.id} value={unit.id}>
                    {unit.name_unit_ar} ({Number(unit.price).toLocaleString()} ر.ي)
                  </option>
                ))}
              </select>
            </div>

            {/* Quantity */}
            <div className="space-y-1.5 text-right">
              <label className="block text-xs font-bold text-muted-foreground">الكمية:</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
                  className="w-full px-4 py-2.5 rounded-2xl border border-border bg-background font-black text-xs text-foreground text-center focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                />
                <button
                  type="submit"
                  disabled={isAddingProduct || !selectedProduct || !selectedUnit}
                  className="px-6 py-2.5 rounded-2xl bg-primary text-primary-foreground font-extrabold text-xs flex items-center gap-1.5 shadow-md shadow-primary/20 hover:opacity-90 transition-all disabled:opacity-50 cursor-pointer shrink-0"
                >
                  {isAddingProduct ? (
                    <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <span>إضافة</span>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Modify Status Form */}
      <div className="bg-card text-card-foreground border border-border/80 rounded-3xl shadow-sm p-6 sm:p-8 space-y-4 animate-in fade-in duration-300">
        <h2 className="text-lg font-black text-foreground border-b border-border pb-3">تحديث تفاصيل الطلب</h2>

        {message && (
          <div className={`p-4 rounded-2xl text-xs font-extrabold border ${
            message.type === 'success' 
              ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' 
              : 'bg-red-500/10 text-red-600 border-red-500/20'
          }`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSaveOrderDetails} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Status selection */}
            <div className="space-y-3 text-right">
              <label className="block text-xs font-bold text-muted-foreground">اختر حالة الطلب الجديدة:</label>
              <select
                value={status}
                onChange={(e) => setStatus(Number(e.target.value))}
                className="w-full px-4 py-3 rounded-2xl border border-border/80 bg-background font-bold text-sm text-foreground focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all cursor-pointer"
              >
                <option value={1}>جاري معالجة طلبك</option>
                <option value={2}>تم شحن طلبك</option>
                <option value={3}>تم الغاء طلبك</option>
                <option value={4}>تم تعديل طلبك</option>
                <option value={5}>تم قبول طلبك</option>
                <option value={6}>تم رفض طلبك</option>
              </select>
            </div>

            {/* Payment Method selection */}
            <div className="space-y-3 text-right">
              <label className="block text-xs font-bold text-muted-foreground">اختر طريقة الدفع الجديدة:</label>
              <select
                value={typePayment}
                onChange={(e) => setTypePayment(Number(e.target.value))}
                className="w-full px-4 py-3 rounded-2xl border border-border/80 bg-background font-bold text-sm text-foreground focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all cursor-pointer"
              >
                <option value={1}>الدفع عند الاستلام</option>
                <option value={2}>تحويل المبلغ</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-border pt-4">
            <button
              type="button"
              onClick={() => router.push('/dashboard/orders')}
              className="px-5 py-2.5 rounded-2xl border border-input hover:bg-muted text-xs font-bold transition-colors cursor-pointer"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-2xl bg-primary text-primary-foreground font-extrabold text-xs flex items-center gap-1.5 shadow-md shadow-primary/20 hover:opacity-90 transition-all disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? (
                <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
              ) : (
                <Check className="w-4 h-4" />
              )}
              حفظ التغييرات
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
