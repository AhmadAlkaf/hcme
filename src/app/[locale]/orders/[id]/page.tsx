import { getOrderByIdServerAction } from '@/actions/basket.actions';
import { redirect } from '@/i18n/routing';
import OrderDetailClient from '@/components/orders/OrderDetailClient';

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
