'use server';

import { serverFetch, serverListFetch } from '@/lib/server-api';
import type { ListQueryParams, PaginatedResult } from '@/types/pagination';
import { revalidatePath } from 'next/cache';

export interface ApiBasketItem {
  id: number;
  basket: number;
  name_unit_ar: string;
  name_unit_en: string;
  name_product_ar: string;
  name_product_en: string;
  price: number;
  subtotal: number;
  quantity: number;
  added_at: string;
  created_at: string;
  updated_at: string;
  product: number;
  unit: number;
}

export interface ApiBasket {
  id: number;
  basket_items: ApiBasketItem[];
  name_usernaem: string;
  total_price: number;
  status: number;
  user_type_request: number;
  in_progress: number;
  type_payment: number;
  image: string | null;
  created_at: string;
  updated_at: string;
  user: number;
}

export interface ApiBasketsResponse {
  success: boolean;
  message: string;
  data: {
    next: string | null;
    previous: string | null;
    count: number;
    results: ApiBasket[];
  };
}

export async function getBasketItemsServerAction(): Promise<{
  success: boolean;
  data?: {
    items: ApiBasketItem[];
    totalPrice: number;
    basketId: number | null;
  };
  error?: string;
}> {
  try {
    const res = await serverFetch<ApiBasketsResponse>('/basket/baskets/', {
      method: 'GET',
      requiresAuth: true,
    });

    if (res.success && res.data?.data?.results) {
      const baskets = res.data.data.results;
      const items = baskets.flatMap((b) => b.basket_items || []);
      const totalPrice = baskets.reduce((sum, b) => sum + (b.total_price || 0), 0);
      const basketId = baskets.length > 0 ? baskets[0].id : null;
      return { success: true, data: { items, totalPrice, basketId } };
    }

    return {
      success: false,
      error: res?.error || 'فشل جلب عناصر السلة',
    };
  } catch (error) {
    console.error('Error in getBasketItemsServerAction:', error);
    return {
      success: false,
      error: 'حدث خطأ غير متوقع أثناء جلب السلة',
    };
  }
}

export async function addToBasketServerAction(
  productId: number,
  quantity: number,
  unitId: number
): Promise<{
  success: boolean;
  data?: ApiBasketItem;
  error?: string;
}> {
  try {
    const res = await serverFetch<{ success: boolean; message: string; data: ApiBasketItem }>('/basket/basketItem/', {
      method: 'POST',
      requiresAuth: true,
      body: JSON.stringify({
        product: productId,
        quantity: quantity,
        unit: unitId,
      }),
    });

    if (res.success && res.data?.data) {
      revalidatePath('/products');
      return { success: true, data: res.data.data };
    }

    return {
      success: false,
      error: res.error || 'فشل إضافة المنتج إلى السلة',
    };
  } catch (error) {
    console.error('Error in addToBasketServerAction:', error);
    return {
      success: false,
      error: 'حدث خطأ غير متوقع أثناء إضافة المنتج إلى السلة',
    };
  }
}

export async function updateBasketItemServerAction(
  basketItemId: number,
  quantity: number
): Promise<{
  success: boolean;
  data?: ApiBasketItem;
  error?: string;
}> {
  try {
    const res = await serverFetch<{ success: boolean; message: string; data: ApiBasketItem }>(`/basket/basketItem/${basketItemId}/`, {
      method: 'PATCH',
      requiresAuth: true,
      body: JSON.stringify({
        quantity: quantity,
      }),
    });

    if (res.success && res.data?.data) {
      return { success: true, data: res.data.data };
    }

    return {
      success: false,
      error: res.error || 'فشل تحديث كمية المنتج في السلة',
    };
  } catch (error) {
    console.error('Error in updateBasketItemServerAction:', error);
    return {
      success: false,
      error: 'حدث خطأ غير متوقع أثناء تحديث كمية المنتج',
    };
  }
}

export async function deleteBasketItemServerAction(
  basketItemId: number
): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const res = await serverFetch<{ success: boolean; message: string }>(`/basket/basketItem/${basketItemId}/`, {
      method: 'DELETE',
      requiresAuth: true,
    });

    if (res.success) {
      return { success: true };
    }

    return {
      success: false,
      error: res.error || 'فشل حذف المنتج من السلة',
    };
  } catch (error) {
    console.error('Error in deleteBasketItemServerAction:', error);
    return {
      success: false,
      error: 'حدث خطأ غير متوقع أثناء حذف المنتج من السلة',
    };
  }
}

export async function checkoutBasketServerAction(
  basketId: number
): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const res = await serverFetch<{ success: boolean; message: string }>(`/basket/baskets/${basketId}/`, {
      method: 'PATCH',
      requiresAuth: true,
      body: JSON.stringify({
        in_progress: 1,
      }),
    });

    if (res.success) {
      return { success: true };
    }

    return {
      success: false,
      error: res.error || 'فشل إتمام عملية الشراء',
    };
  } catch (error) {
    console.error('Error in checkoutBasketServerAction:', error);
    return {
      success: false,
      error: 'حدث خطأ غير متوقع أثناء إتمام عملية الشراء',
    };
  }
}

export async function getOrdersServerAction(
  params?: ListQueryParams
): Promise<PaginatedResult<ApiBasket> | null> {
  try {
    const res = await serverListFetch<ApiBasket>('/basket/orders/', params, {
      requiresAuth: true,
    });

    if (res.success && res.data) {
      return res.data;
    }

    console.error('Error in getOrdersServerAction:', res.error);
    return null;
  } catch (error) {
    console.error('Error in getOrdersServerAction:', error);
    return null;
  }
}

export async function getOrderByIdServerAction(
  orderId: number
): Promise<{
  success: boolean;
  data?: ApiBasket;
  error?: string;
}> {
  try {
    const res = await serverFetch<{ success: boolean; message: string; data: ApiBasket }>(`/basket/orders/${orderId}/`, {
      method: 'GET',
      requiresAuth: true,
    });

    if (res.success && res.data?.data) {
      return { success: true, data: res.data.data };
    }

    return {
      success: false,
      error: res?.error || 'فشل جلب تفاصيل الطلب',
    };
  } catch (error) {
    console.error('Error in getOrderByIdServerAction:', error);
    return {
      success: false,
      error: 'حدث خطأ غير متوقع أثناء جلب تفاصيل الطلب',
    };
  }
}

export async function updateOrderStatusServerAction(
  basketId: number,
  status: number
): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const res = await serverFetch<{ success: boolean; message: string }>(`/basket/baskets/${basketId}/`, {
      method: 'PATCH',
      requiresAuth: true,
      body: JSON.stringify({
        status: status,
      }),
    });

    if (res.success) {
      return { success: true };
    }

    return {
      success: false,
      error: res.error || 'فشل تحديث حالة الطلب',
    };
  } catch (error) {
    console.error('Error in updateOrderStatusServerAction:', error);
    return {
      success: false,
      error: 'حدث خطأ غير متوقع أثناء تحديث حالة الطلب',
    };
  }
}

export async function updateOrderAdminServerAction(
  basketId: number,
  formData: FormData
): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const res = await serverFetch<{ success: boolean; message: string }>(`/basket/baskets/${basketId}/`, {
      method: 'PATCH',
      requiresAuth: true,
      body: formData,
    });

    if (res.success) {
      return { success: true };
    }

    return {
      success: false,
      error: res.error || 'فشل تحديث بيانات الطلب',
    };
  } catch (error) {
    console.error('Error in updateOrderAdminServerAction:', error);
    return {
      success: false,
      error: 'حدث خطأ غير متوقع أثناء تحديث الطلب',
    };
  }
}

export async function addBasketItemAdminServerAction(
  formData: FormData
): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const res = await serverFetch<{ success: boolean; message: string }>('/basket/basketItem/', {
      method: 'POST',
      requiresAuth: true,
      body: formData,
    });

    if (res.success) {
      return { success: true };
    }

    return {
      success: false,
      error: res.error || 'فشل إضافة المنتج إلى الطلب',
    };
  } catch (error) {
    console.error('Error in addBasketItemAdminServerAction:', error);
    return {
      success: false,
      error: 'حدث خطأ غير متوقع أثناء إضافة المنتج',
    };
  }
}

