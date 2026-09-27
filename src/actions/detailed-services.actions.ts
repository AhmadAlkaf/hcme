'use server';

import { serverFetch, serverListFetch } from '@/lib/server-api';
import type { ApiService } from '@/types/api';
import type { ListQueryParams, PaginatedResult } from '@/types/pagination';
import { revalidatePath } from 'next/cache';

export async function getDetailedServicesServerAction(
  params?: ListQueryParams
): Promise<PaginatedResult<ApiService> | null> {
  try {
    const res = await serverListFetch<ApiService>('/content/service/', params, {
      next: { revalidate: 3600 },
    });

    if (res.success && res.data) {
      return res.data;
    }

    return null;
  } catch (error) {
    console.error('Error in getDetailedServicesServerAction:', error);
    return null;
  }
}

/**
 * Fetches every detailed service. The public "Services" section renders the
 * whole catalogue, so it must not be capped at one page.
 */
export async function getAllDetailedServicesServerAction(): Promise<ApiService[]> {
  const res = await serverListFetch<ApiService>('/content/service/', { all: true }, {
    next: { revalidate: 3600 },
  });
  return res.success && res.data ? res.data.items : [];
}

export async function createDetailedServiceServerAction(data: { name_ar: string; name_en: string; agent: number }) {
  try {
    const res = await serverFetch<{ success: boolean; message: string; data: ApiService }>('/content/service/', {
      method: 'POST',
      body: JSON.stringify(data),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (res.success && res.data) {
      revalidatePath('/dashboard/site-cms');
      revalidatePath('/[locale]', 'layout');
      const responseData = res.data.data;
      return { success: true, data: responseData };
    }

    return { success: false, message: res.error || 'فشل إضافة الخدمة', error: res.error || 'فشل إضافة الخدمة', data: null };
  } catch (error) {
    console.error('Error in createDetailedServiceServerAction:', error);
    return { success: false, message: 'فشل إضافة الخدمة', error: 'فشل إضافة الخدمة', data: null };
  }
}

export async function updateDetailedServiceServerAction(id: number, data: { name_ar: string; name_en: string; agent: number }) {
  try {
    const res = await serverFetch<{ success: boolean; message: string; data: ApiService }>(`/content/service/${id}/`, {
      method: 'PUT',
      body: JSON.stringify(data),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (res.success && res.data) {
      revalidatePath('/dashboard/site-cms');
      revalidatePath('/[locale]', 'layout');
      const responseData = res.data.data;
      return { success: true, data: responseData };
    }

    return { success: false, message: res.error || 'فشل تحديث الخدمة', error: res.error || 'فشل تحديث الخدمة', data: null };
  } catch (error) {
    console.error('Error in updateDetailedServiceServerAction:', error);
    return { success: false, message: 'فشل تحديث الخدمة', error: 'فشل تحديث الخدمة', data: null };
  }
}

export async function deleteDetailedServiceServerAction(id: number) {
  try {
    const res = await serverFetch<{ success: boolean; message: string }>(`/content/service/${id}/`, {
      method: 'DELETE',
    });

    if (res.success) {
      revalidatePath('/dashboard/site-cms');
      revalidatePath('/[locale]', 'layout');
      return { success: true, data: null };
    }

    return { success: false, message: res.error || 'فشل حذف الخدمة', error: res.error || 'فشل حذف الخدمة', data: null };
  } catch (error) {
    console.error('Error in deleteDetailedServiceServerAction:', error);
    return { success: false, message: 'فشل حذف الخدمة', error: 'فشل حذف الخدمة', data: null };
  }
}
