'use client';

import { useState } from 'react';
import type { ApiProductUnit } from '@/types/api';
import { cn } from '@/lib/utils';
import { useLocale, useTranslations } from 'next-intl';
import { Layers, ShoppingCart, MessageSquare, Plus, Minus } from 'lucide-react';
import { useCart } from '@/context/CartContext';

interface ProductUnitSelectorProps {
  productId: number;
  productName: string;
  productCode?: string;
  productImage: string;
  units: ApiProductUnit[];
  whatsappContact?: string;
}

export default function ProductUnitSelector({
  productId,
  productName,
  productCode,
  productImage,
  units,
  whatsappContact
}: ProductUnitSelectorProps) {
  const locale = useLocale();
  const tCommon = useTranslations('Common');
  const tProducts = useTranslations('Products');
  const { addToCart } = useCart();

  const [selectedUnitIndex, setSelectedUnitIndex] = useState<number>(0);
  const [quantity, setQuantity] = useState<number>(1);
  const [isAdded, setIsAdded] = useState<boolean>(false);

  const selectedUnit = units[selectedUnitIndex];

  const handleAddToCart = () => {
    if (!selectedUnit) {
      console.error('No unit selected');
      return;
    }

    const unitNameAr = selectedUnit.name_unit_ar || 'حبة';
    const unitNameEn = selectedUnit.name_unit_en || selectedUnit.name_unit_ar || 'Unit';
    const unitPriceNum = parseFloat(selectedUnit.price || '0');
    const cartItemId = `${productId}_${unitNameAr}`;

    addToCart(
      {
        id: cartItemId,
        productId: productId,
        nameAr: productName,
        nameEn: productName,
        image: productImage,
        unitNameAr: unitNameAr,
        unitNameEn: unitNameEn,
        unitPrice: !isNaN(unitPriceNum) ? unitPriceNum : 0,
        quantity: quantity,
        numberProduct: productCode,
        unitId: selectedUnit.id,
      },
      true
    );

    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };



  const getWhatsAppLink = () => {
    const unitName = selectedUnit
      ? locale === 'ar'
        ? selectedUnit.name_unit_ar
        : selectedUnit.name_unit_en || selectedUnit.name_unit_ar
      : '';
    const unitPrice = selectedUnit?.price || '';

    const text =
      locale === 'ar'
        ? `مرحباً مركز حضرموت الحديث للكهربائيات، أود طلب المنتج:\n- اسم المنتج: ${productName}\n- رمز المنتج: ${productCode || '#'
        }\n- الوحدة: ${unitName} (${unitPrice})\n- الكمية: ${quantity}`
        : `Hello Hadramout Modern Center, I would like to order product:\n- Product: ${productName}\n- Code: ${productCode || '#'
        }\n- Unit: ${unitName} (${unitPrice})\n- Quantity: ${quantity}`;

    const encodedText = encodeURIComponent(text);

    if (
      whatsappContact &&
      (whatsappContact.includes('wa.me') || whatsappContact.includes('whatsapp.com'))
    ) {
      const separator = whatsappContact.includes('?') ? '&' : '?';
      return `${whatsappContact}${separator}text=${encodedText}`;
    }

    return `https://wa.me/967776548281?text=${encodedText}`;
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Unit Selector */}
      {units.length > 0 && (
        <div>
          <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-3 flex items-center gap-2">
            <Layers size={16} className="text-primary" />
            {locale === 'ar' ? 'اختر الوحدة المطلوبة:' : 'Select Desired Unit:'}
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {units.map((unit, idx) => {
              const unitTitle =
                locale === 'ar'
                  ? unit.name_unit_ar
                  : unit.name_unit_en || unit.name_unit_ar;
              const isSelected = selectedUnitIndex === idx;

              return (
                <button
                  key={unit.id || idx}
                  onClick={() => setSelectedUnitIndex(idx)}
                  className={cn(
                    'p-4 rounded-2xl border text-right transition-all flex justify-between items-center',
                    isSelected
                      ? 'border-primary bg-primary-subtle/30 ring-2 ring-primary/20 shadow-sm'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  )}
                >
                  <div className="flex items-center gap-2">
                    <div
                      className={cn(
                        'w-4 h-4 rounded-full border-2 flex items-center justify-center',
                        isSelected ? 'border-primary bg-primary' : 'border-slate-300'
                      )}
                    >
                      {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </div>
                    <span className="font-bold text-sm text-slate-800">{unitTitle}</span>
                  </div>
                  <span className="font-black text-primary text-base">{unit.price}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Price & Quantity Banner */}
      {selectedUnit && (
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white p-5 rounded-2xl shadow-lg flex items-center justify-between">
          <div>
            <div className="text-xs text-white/60 font-semibold mb-0.5">
              {locale === 'ar' ? 'السعر الكلي' : 'Total Price'}
            </div>
            <div className="text-2xl md:text-3xl font-black text-primary-light">
              {selectedUnit.price}
            </div>
          </div>

          {/* Quantity Control */}
          <div className="flex items-center gap-3 bg-white/10 p-1.5 rounded-xl border border-white/10">
            <button
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
            >
              <Minus size={16} />
            </button>
            <span className="font-bold text-lg min-w-[24px] text-center">{quantity}</span>
            <button
              onClick={() => setQuantity((q) => q + 1)}
              className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
            >
              <Plus size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Primary Action CTAs */}
      <div className="flex flex-col gap-3 pt-4 border-t border-slate-100">
        <button
          onClick={handleAddToCart}
          className={cn(
            'w-full py-4 rounded-2xl font-extrabold text-base flex items-center justify-center gap-3 transition-all shadow-xl cursor-pointer',
            isAdded
              ? 'bg-emerald-500 text-white shadow-emerald-500/20'
              : 'bg-primary hover:bg-primary-dark text-white shadow-primary/25 hover:shadow-2xl hover:-translate-y-0.5'
          )}
        >
          <ShoppingCart size={20} />
          {isAdded ? tCommon('added_to_cart') : tCommon('add_to_cart')}
        </button>


      </div>
    </div>
  );
}
