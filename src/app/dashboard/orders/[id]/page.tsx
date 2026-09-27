import { getOrderByIdServerAction } from '@/actions/basket.actions';
import { redirect } from 'next/navigation';
import OrderEditClient from '@/components/dashboard/OrderEditClient';

export const revalidate = 0;

interface Props {
  params: Promise<{ id: string }>;
}

export default async function OrderEditPage({ params }: Props) {
  const { id } = await params;
  const orderId = Number(id);

  if (isNaN(orderId)) {
    redirect('/dashboard/orders');
  }

  const res = await getOrderByIdServerAction(orderId);

  if (!res.success || !res.data) {
    redirect('/dashboard/orders');
  }

  return <OrderEditClient order={res.data} />;
}
