import { getOrdersServerAction } from '@/actions/basket.actions';
import { redirect } from '@/i18n/routing';
import { buildCorrectedPageHref, parsePaginationParams } from '@/lib/pagination-params';
import OrdersClient from '@/components/orders/OrdersClient';

interface Props {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function OrdersPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const { page, pageSize, search } = parsePaginationParams(await searchParams);

  const result = await getOrdersServerAction({
    page,
    pageSize,
    search: search || undefined,
  });

  // A null result means the request failed (or the session expired), which is
  // indistinguishable from an unauthenticated visitor at this point.
  if (!result) {
    redirect({ href: '/login', locale });
    return null;
  }

  const corrected = buildCorrectedPageHref({
    basePath: `/${locale}/orders`,
    requestedPage: page,
    meta: result.meta,
    search,
  });
  if (corrected) redirect({ href: corrected, locale });

  return (
    <OrdersClient
      orders={result.items}
      meta={result.meta}
      basePath={`/${locale}/orders`}
    />
  );
}
