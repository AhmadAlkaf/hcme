'use client';

import { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import type { ApiProduct, ApiContent } from '@/types/api';
import { getImageUrl } from '@/lib/utils';
import { normalizeDepartmentRef } from '@/lib/products';
import { useLocale, useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import {
  ArrowLeft,
  ArrowRight,
  Building,
  Tag,
  Share2,
  Check,
  ArrowUpRight
} from 'lucide-react';
import Breadcrumb from '@/components/ui/Breadcrumb';
import ProductGallery from '@/components/products/ProductGallery';
import ProductUnitSelector from '@/components/products/ProductUnitSelector';
import ProductGuarantees from '@/components/products/ProductGuarantees';
import ProductCard from '@/components/products/ProductCard';

interface ProductDetailsClientProps {
  product: ApiProduct;
  content?: ApiContent;
  relatedProducts?: ApiProduct[];
}

export default function ProductDetailsClient({
  product,
 
  relatedProducts = []
}: ProductDetailsClientProps) {
  const locale = useLocale();
  const tCommon = useTranslations('Common');
  const tProducts = useTranslations('Products');

  const [copied, setCopied] = useState<boolean>(false);

  const name =
    locale === 'ar'
      ? product.name_product_ar
      : product.name_product_en || product.name_product_ar;

  const desc =
    locale === 'ar'
      ? product.description_product_ar
      : product.description_product_en || product.description_product_ar;

  const brandName =
    locale === 'ar'
      ? product.agent_name_ar
      : product.agent_name_en || product.agent_name_ar;

  const units = product.name_uint || [];

  // All images array
  const allImages = [
    getImageUrl(product.image),
    ...(product.product_images?.map((img) => getImageUrl(img.image)) || [])
  ].filter((img, idx, self) => self.indexOf(img) === idx);

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Related products now come from the same department. The old agent match is
  // gone (products no longer carry an agent id) and `number_group` is not
  // returned by the API, so the department is the only real grouping left.
  const departmentId = normalizeDepartmentRef(product.department);
  const sameCategoryProducts = relatedProducts
    .filter(
      (p) => departmentId !== null && normalizeDepartmentRef(p.department) === departmentId
    )
    .filter((p) => p.id !== product.id)
    .slice(0, 3);

  const breadcrumbItems = [
    { label: locale === 'ar' ? 'الرئيسية' : 'Home', href: '/' },
    { label: locale === 'ar' ? 'المنتجات' : 'Products', href: '/products' },
    { label: name }
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col flex-1 font-sans">
      {/* Breadcrumb Header */}
      <div className="pt-32 pb-6 bg-slate-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none opacity-20 bg-[radial-gradient(circle_at_30%_50%,_rgba(27,166,156,0.25)_0%,_transparent_60%)]" />
        <div className="container mx-auto px-6 max-w-7xl relative z-10">
          <Breadcrumb items={breadcrumbItems} />
        </div>
      </div>

      {/* Main Details Section */}
      <main className="flex-1 py-12">
        <div className="container mx-auto px-6 max-w-7xl">
          {/* Top Navigation & Share Toolbar */}
          <div className="flex justify-between items-center mb-8">
            <Link
              href="/products"
              className="inline-flex items-center gap-2 text-sm font-extrabold text-slate-600 hover:text-primary transition-colors bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-xs"
            >
              {locale === 'ar' ? <ArrowRight size={16} /> : <ArrowLeft size={16} />}
              {locale === 'ar' ? 'العودة لقائمة المنتجات' : 'Back to Products'}
            </Link>

            {/* <button
              onClick={handleShare}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:border-primary hover:text-primary font-extrabold text-xs transition-all shadow-xs"
            >
              {copied ? (
                <>
                  <Check size={15} className="text-emerald-500" />
                  {locale === 'ar' ? 'تم نسخ الرابط' : 'Link Copied'}
                </>
              ) : (
                <>
                  <Share2 size={15} className="text-primary" />
                  {locale === 'ar' ? 'مشاركة المنتج' : 'Share Product'}
                </>
              )}
            </button> */}
          </div>

          {/* Product Highlights Grid */}
          <div className="grid lg:grid-cols-12 gap-12 items-start mb-16">
            {/* Gallery */}
            <div className="lg:col-span-6 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-md">
              <ProductGallery images={allImages} productName={name} />
            </div>

            {/* Product Specifications & Controls */}
            <div className="lg:col-span-6 flex flex-col gap-6">
              {/* Category & Code Badges */}
              <div className="flex flex-wrap items-center gap-3">
                
                {product.number_product && (
                  <span className="px-3.5 py-1.5 rounded-full bg-slate-100 text-slate-600 font-extrabold text-xs border border-slate-200">
                    {tProducts('product_number')}: #{product.number_product}
                  </span>
                )}
              </div>

              {/* Title & Brand */}
              <div>
                {brandName && (
                  <div className="flex items-center gap-2 text-xs font-black text-primary uppercase tracking-wider mb-2">
                    <Building size={14} />
                    {brandName}
                  </div>
                )}
                <h1 className="text-3xl md:text-4xl font-black text-slate-900 leading-tight">
                  {name}
                </h1>
              </div>

              {/* Unit Selector & Interactive Pricing */}
              <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-md">
                <ProductUnitSelector
                  productId={product.id}
                  productName={name}
                  productCode={product.number_product}
                  productImage={getImageUrl(product.image)}
                  units={product.name_uint || []}
                />
              </div>

              {/* Trust Badges & Guarantees */}
              <ProductGuarantees />
            </div>
          </div>

          {/* Product Description */}
          {desc && (
            <div className="bg-white p-8 md:p-10 rounded-3xl border border-slate-200/80 shadow-md mb-16">
              <h2 className="text-2xl font-black text-slate-900 mb-4 flex items-center gap-2">
                <Tag className="text-primary" size={22} />
                {locale === 'ar' ? 'وصف المنتج' : 'Product Description'}
              </h2>
              <div className="prose max-w-none text-slate-600 leading-relaxed font-medium text-base whitespace-pre-line">
                {desc}
              </div>
            </div>
          )}

          {/* Related Products Slider / Grid */}
          {sameCategoryProducts.length > 0 && (
            <div className="pt-8 border-t border-slate-200">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <span className="text-xs font-extrabold text-primary uppercase tracking-wider">
                    📦 {locale === 'ar' ? 'منتجات ذات صلة' : 'Related Products'}
                  </span>
                  <h3 className="text-2xl font-black text-slate-900">
                    {locale === 'ar' ? 'قد يعجبك أيضاً' : 'You Might Also Like'}
                  </h3>
                </div>

                <Link
                  href="/products"
                  className="inline-flex items-center gap-1 text-sm font-bold text-primary hover:text-primary-dark transition-colors"
                >
                  {tCommon('browse_products')}
                  <ArrowUpRight size={16} />
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {sameCategoryProducts.map((relProduct) => (
                  <ProductCard key={relProduct.id} product={relProduct} />
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
