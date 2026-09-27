import { notFound } from 'next/navigation';
import { getProductByIdServerAction } from '@/actions/products.actions';
import ProductDetailsClient from '@/components/ProductDetailsClient';

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
