import { notFound } from 'next/navigation';
import { getProductByIdServerAction } from '@/actions/products.actions';
import ProductDetailsClient from '@/components/ProductDetailsClient';
import { getImageUrl } from '@/lib/utils';
import { SITE_URL, brandName, getSeoCopy } from '@/config/seo';
import type { Metadata } from 'next';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}): Promise<Metadata> {
  const { locale, id } = await params;
  const product = await getProductByIdServerAction(id);

  if (!product) {
    return { title: locale === 'ar' ? 'منتج غير موجود' : 'Product not found' };
  }

  const isAr = locale === 'ar';
  const name = (isAr ? product.name_product_ar : product.name_product_en) || product.name_product_ar;
  const rawDescription = (isAr ? product.description_product_ar : product.description_product_en) || '';
  const description =
    rawDescription.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 160) ||
    getSeoCopy(locale).description;
  const image = getImageUrl(product.image);
  const agent = (isAr ? product.agent_name_ar : product.agent_name_en) || product.agent_name_ar;

  return {
    title: name,
    description,
    alternates: {
      canonical: `${SITE_URL}/${locale}/products/${id}`,
      languages: {
        ar: `${SITE_URL}/ar/products/${id}`,
        en: `${SITE_URL}/en/products/${id}`,
        'x-default': `${SITE_URL}/ar/products/${id}`,
      },
    },
    openGraph: {
      type: 'website',
      title: `${name} | ${brandName(locale)}`,
      description,
      url: `${SITE_URL}/${locale}/products/${id}`,
      siteName: brandName(locale),
      locale: isAr ? 'ar_YE' : 'en_US',
      images: image ? [{ url: image, alt: name }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: name,
      description,
      images: image ? [image] : undefined,
    },
    ...(agent ? { other: { 'product:brand': agent } } : {}),
  };
}

export default async function ProductDetailsPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await getProductByIdServerAction(id);

  if (!product) {
    notFound();
  }

  return <ProductDetailsClient product={product} />;
}
