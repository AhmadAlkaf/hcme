'use client';

import { useState } from 'react';
import type { ApiProduct } from '@/types/api';
import { getImageUrl, cn } from '@/lib/utils';
import { useTranslations, useLocale } from 'next-intl';
import { Eye, Info, ShoppingCart } from 'lucide-react';

import { Link } from '@/i18n/routing';
import { useCart } from '@/context/CartContext';

interface ProductCardProps {
  product: ApiProduct;
}

export default function ProductCard({ product }: ProductCardProps) {
  const tProducts = useTranslations('Products');
  const tCommon = useTranslations('Common');
  const locale = useLocale();
  const { addToCart } = useCart();

  const [isAdded, setIsAdded] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const name =
    locale === 'ar'
      ? product.name_product_ar
      : product.name_product_en || product.name_product_ar;

  const desc =
    locale === 'ar'
      ? product.description_product_ar
      : product.description_product_en || product.description_product_ar;

  const startingUnit = product.name_uint?.[0];
  const brandName =
    locale === 'ar'
      ? product.agent_name_ar
      : product.agent_name_en || product.agent_name_ar;

  // Compile all unique images for the product
  const allImages = [
    getImageUrl(product.image),
    ...(product.product_images?.map((img) => getImageUrl(img.image)) || [])
  ].filter((img, idx, self) => img && self.indexOf(img) === idx);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!startingUnit) {
      console.error('No unit available for this product');
      return;
    }

    const unitPrice = parseFloat(startingUnit.price || '0');
    const cartItemId = `${product.id}_${startingUnit.name_unit_ar || 'default'}`;

    addToCart({
      id: cartItemId,
      productId: product.id,
      nameAr: product.name_product_ar,
      nameEn: product.name_product_en || product.name_product_ar,
      image: getImageUrl(product.image),
      unitNameAr: startingUnit.name_unit_ar || 'حبة',
      unitNameEn: startingUnit.name_unit_en || startingUnit.name_unit_ar || 'Unit',
      unitPrice: !isNaN(unitPrice) ? unitPrice : 0,
      brandNameAr: product.agent_name_ar,
      brandNameEn: product.agent_name_en || product.agent_name_ar,
      numberProduct: product.number_product,
      unitId: startingUnit.id,
    });

    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  return (
    <div className="relative rounded-3xl bg-white border border-slate-200/90 shadow-sm hover:shadow-[0_25px_50px_rgba(27,166,156,0.18)] hover:border-primary/40 transition-all duration-500 hover:-translate-y-2 flex flex-col h-full overflow-hidden group">
      {/* Top Status & Brand Badges */}
      <div className="absolute top-4 inset-x-4 z-20 flex items-center justify-between pointer-events-none">
        <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500 text-white text-[11px] font-extrabold backdrop-blur-md shadow-md">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
          </span>
          {locale === 'ar' ? 'متوفر' : 'In Stock'}
        </span>

        {brandName && (
          <span className="bg-slate-900/80 text-white text-[11px] font-bold px-3 py-1 rounded-full backdrop-blur-md border border-white/10 shadow-sm">
            {brandName}
          </span>
        )}
      </div>

      {/* Product Image Link & Gallery Flipper */}
      <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-b from-slate-50 to-slate-100/80 border-b border-slate-100 shrink-0 block group/image">
        <Link
          href={`/products/${product.id}`}
          className="w-full h-full block"
        >
          <img
            src={allImages[activeImageIndex]}
            alt={name}
            className="w-full h-full object-cover transition-transform duration-700 ease-out"
          />
          {/* Image Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-transparent opacity-60 pointer-events-none" />
        </Link>

        {/* View Details Floating CTA (only shown if not hovering image selectors) */}
        <Link
          href={`/products/${product.id}`}
          className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/image:opacity-100 transition-all duration-300 pointer-events-none z-10"
        >
          <span className="px-5 py-2.5 rounded-full bg-white/95 text-slate-900 font-extrabold text-xs flex items-center gap-2 shadow-xl border border-white/40 pointer-events-auto">
            <Eye size={15} className="text-primary" />
            {tProducts('view_details')}
          </span>
        </Link>

        {/* Left/Right Navigation Arrows (Only visible if > 1 image) */}
        {allImages.length > 1 && (
          <>
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setActiveImageIndex((prev) => (prev === 0 ? allImages.length - 1 : prev - 1));
              }}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 hover:bg-white text-slate-800 hover:text-primary flex items-center justify-center shadow-md opacity-0 group-hover/image:opacity-100 transition-all duration-300 z-20 cursor-pointer"
              aria-label="Previous Image"
            >
              {locale === 'ar' ? '←' : '→'}
            </button>
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setActiveImageIndex((prev) => (prev === allImages.length - 1 ? 0 : prev + 1));
              }}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 hover:bg-white text-slate-800 hover:text-primary flex items-center justify-center shadow-md opacity-0 group-hover/image:opacity-100 transition-all duration-300 z-20 cursor-pointer"
              aria-label="Next Image"
            >
              {locale === 'ar' ? '→' : '←'}
            </button>
          </>
        )}

        {/* Thumbnail Strip Overlay (Hover-activated) */}
        {allImages.length > 1 && (
          <div className="absolute bottom-3 inset-x-3 flex justify-center gap-1.5 z-20 opacity-0 group-hover/image:opacity-100 translate-y-2 group-hover/image:translate-y-0 transition-all duration-300 bg-slate-950/70 backdrop-blur-md px-2.5 py-1.5 rounded-2xl border border-white/10 max-w-fit mx-auto scrollbar-none">
            {allImages.map((imgUrl, idx) => (
              <button
                key={idx}
                onMouseEnter={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setActiveImageIndex(idx);
                }}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setActiveImageIndex(idx);
                }}
                className={cn(
                  "relative w-7 h-7 rounded-lg overflow-hidden border transition-all cursor-pointer",
                  activeImageIndex === idx
                    ? "border-primary-light scale-105 shadow-md shadow-primary/20"
                    : "border-white/10 hover:border-white/40"
                )}
              >
                <img
                  src={imgUrl}
                  alt={`thumbnail ${idx}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        )}

        {/* Pagination Dots (Hidden on hover when thumbnail strip is shown) */}
        {allImages.length > 1 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-10 group-hover/image:opacity-0 transition-opacity duration-200">
            {allImages.map((_, idx) => (
              <span
                key={idx}
                className={cn(
                  "w-1.5 h-1.5 rounded-full transition-all",
                  activeImageIndex === idx ? "bg-primary w-3.5" : "bg-white/60"
                )}
              />
            ))}
          </div>
        )}
      </div>

      {/* Product Body Content */}
      <div className="p-6 flex flex-col flex-1">
        {/* Code Tag */}
        <div className="flex items-center gap-2 mb-2">
          <span className="text-[10px] font-extrabold tracking-wider uppercase text-slate-400 bg-slate-100 px-2.5 py-0.5 rounded-md">
            {tProducts('product_number')}: {product.number_product || '#'}
          </span>
        </div>

        {/* Product Title Link */}
        <Link href={`/products/${product.id}`}>
          <h3 className="font-extrabold text-lg text-slate-900 line-clamp-1 mb-2 group-hover:text-primary transition-colors">
            {name}
          </h3>
        </Link>

        {/* Description */}
        <p className="text-slate-500 text-xs line-clamp-2 leading-relaxed mb-5 font-medium">
          {desc}
        </p>

        <div className="mt-auto flex flex-col gap-4">
          {/* Price Banner */}
          {startingUnit && (
            <div className="bg-gradient-to-r from-primary-subtle/50 via-slate-50 to-primary-subtle/30 p-3.5 rounded-2xl border border-primary/10 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500">
                {tProducts('price_starts_from')}
              </span>
              <span className="text-base font-black text-primary flex items-baseline gap-1">
                {startingUnit.price}{' '}
                <span className="text-[11px] font-bold text-slate-500">
                  /{' '}
                  {locale === 'ar'
                    ? startingUnit.name_unit_ar
                    : startingUnit.name_unit_en || startingUnit.name_unit_ar}
                </span>
              </span>
            </div>
          )}

          {/* Interactive Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2 border-t border-slate-100">
            <button
              onClick={handleAddToCart}
              className={cn(
                'w-full py-3.5 rounded-2xl font-extrabold text-xs flex items-center justify-center gap-2 transition-all duration-300 shadow-md cursor-pointer',
                isAdded
                  ? 'bg-emerald-500 text-white shadow-emerald-500/20 scale-[0.99]'
                  : 'bg-gradient-to-r from-primary to-primary-dark hover:from-primary-dark hover:to-primary text-white shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 hover:-translate-y-0.5'
              )}
            >
              <ShoppingCart size={16} />
              {isAdded ? tCommon('added_to_cart') : tCommon('add_to_cart')}
            </button>

            <Link
              href={`/products/${product.id}`}
              className="w-full py-3.5 rounded-2xl border border-slate-200 text-slate-700 hover:text-primary hover:border-primary/50 bg-slate-50 hover:bg-white font-extrabold text-xs flex items-center justify-center gap-1.5 transition-all duration-300 shadow-sm hover:shadow-md hover:-translate-y-0.5"
            >
              <Info size={15} className="text-primary" />
              {tProducts('view_details')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
