'use client';

import React, { useCallback } from 'react';
import { OrdersSection } from '@/components/dashboard/OrdersSection';
import type { OrderItem } from '@/types';
import type { ApiBasket } from '@/actions/basket.actions';
import { getOrdersServerAction, updateOrderStatusServerAction } from '@/actions/basket.actions';
import { usePaginatedList } from '@/lib/use-paginated-list';

/**
 * The backend stores an order status as a number, but the table renders the
 * friendlier string union. Both directions are needed: to render rows, and to
 * translate a dropdown choice into the value the `?status=` filter expects.
 */
const NUM_TO_STATUS: Record<number, OrderItem['status']> = {
  1: 'processing',
  2: 'shipped',
  3: 'cancelled',
  4: 'modified',
  5: 'accepted',
  6: 'rejected',
};

const STATUS_TO_NUM: Record<OrderItem['status'], number> = {
  processing: 1,
  shipped: 2,
  cancelled: 3,
  modified: 4,
  accepted: 5,
  rejected: 6,
};

/** Maps a raw basket to the shape the orders table renders. */
function toOrderItem(basket: ApiBasket): OrderItem {
  return {
    id: String(basket.id),
    orderNumber: `ORD-${basket.id}`,
    customerName: basket.name_usernaem || 'عميل HMEC',
    customerPhone: '',
    customerCity: 'المكلا',
    totalAmount: basket.total_price,
    status: NUM_TO_STATUS[basket.status] ?? 'processing',
    createdAt: new Date(basket.created_at).toLocaleDateString('ar-YE', {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
    }),
    itemsCount: basket.basket_items?.reduce((sum, item) => sum + item.quantity, 0) || 0,
  };
}

export default function OrdersDashboardPage() {
  // `usePaginatedList` works in terms of the API shape, so the mapping to
  // `OrderItem` happens inside the fetcher and the hook still returns
  // `{ items, meta }` for the table.
  const fetcher = useCallback(async (params?: Parameters<typeof getOrdersServerAction>[0]) => {
    const result = await getOrdersServerAction(params);
    if (!result) return null;
    return { items: result.items.map(toOrderItem), meta: result.meta };
  }, []);

  const {
    items: orders,
    meta,
    loading: isLoading,
    search: searchQuery,
    setSearch: setSearchQuery,
    filters,
    setFilter,
    setPage,
    setPageSize,
    firstRowIndex,
    reload,
  } = usePaginatedList<OrderItem>(fetcher);

  // The filter holds the numeric backend value; the dropdown shows the string.
  const statusFilter = (() => {
    const raw = filters.status;
    if (raw === undefined || raw === null || raw === '') return 'all';
    const num = Number(raw);
    return NUM_TO_STATUS[num] ?? 'all';
  })();

  const handleOrderStatusChange = async (orderId: string, status: OrderItem['status']) => {
    const numericId = Number(orderId.replace('ORD-', ''));
    const res = await updateOrderStatusServerAction(
      isNaN(numericId) ? Number(orderId) : numericId,
      STATUS_TO_NUM[status]
    );
    if (res.success) {
      // A status change can move the order out of the current filtered page,
      // so the safest state is a refetch of the page we are on.
      reload();
    } else {
      alert(res.error || 'فشل تحديث حالة الطلب');
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <span className="text-xs font-black text-slate-500">جاري تحميل قائمة الطلبات...</span>
      </div>
    );
  }

  return (
    <OrdersSection
      orders={orders}
      meta={meta}
      searchQuery={searchQuery}
      onSearchChange={setSearchQuery}
      selectedStatus={statusFilter}
      onStatusChange={(value) =>
        // Translated to the numeric value the API filters on; the dropdown
        // itself is driven by `statusFilter`, which converts it back.
        setFilter('status', value === 'all' ? undefined : STATUS_TO_NUM[value as OrderItem['status']])
      }
      onPageChange={setPage}
      onPageSizeChange={setPageSize}
      firstRowIndex={firstRowIndex}
      onStatusChangeOrder={handleOrderStatusChange}
    />
  );
}
