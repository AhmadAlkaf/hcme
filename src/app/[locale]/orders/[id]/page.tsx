import { getOrderByIdServerAction } from '@/actions/basket.actions';
import { redirect } from '@/i18n/routing';
import OrderDetailClient from '@/components/orders/OrderDetailClient';
import type { Metadata } from 'next';

// Authenticated area — keep it out of search results.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

interface Props {
  params: Promise<{ locale: string; id: string }>;
}

export default async function OrderDetailPage({ params }: Props) {
  const { locale, id } = await params;
  const orderId = Number(id);

  if (isNaN(orderId)) {
    redirect({ href: '/orders', locale });
    return null;
  }

  const res = await getOrderByIdServerAction(orderId);

  if (!res.success || !res.data) {
    redirect({ href: '/orders', locale });
    return null;
  }

  return <OrderDetailClient order={res.data} />;
}
