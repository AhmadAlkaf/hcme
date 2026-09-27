'use server';

import { serverFetch, formatApiErrorMessage } from '@/lib/server-api';
import type { ApiContent, ApiPaginatedData } from '@/types/api';
import { revalidatePath } from 'next/cache';

export async function getContentServerAction(): Promise<ApiContent | null> {
  try {
    const res = await serverFetch<{ success: boolean; message: string; data: ApiPaginatedData<ApiContent> }>('/content/content/', {
      next: { revalidate: 0 },
    });

    const results = res.data?.data?.results;
    if (res.success && results && results.length > 0) {
      return results[0]; 
    }

    return null;
  } catch (error) {
    console.error('Error in getContentServerAction:', error);
    return null;
  }
}

export async function createContentServerAction(
  data: Omit<ApiContent, 'id' | 'create_at' | 'update_at'>
): Promise<{ success: boolean; data?: ApiContent; error?: string }> {
  try {
    const res = await serverFetch<{ success: boolean; message: string; data: ApiContent }>('/content/content/', {
      method: 'POST',
      body: JSON.stringify(data),
    });

    if (res.success && res.data) {
      revalidatePath('/');
      revalidatePath('/[locale]', 'layout');
      revalidatePath('/dashboard/site-cms/main-content');

      const responseData = res.data.data;
      return { success: true, data: responseData };
    }

    return {
      success: false,
      error: res.error || (res.data ? formatApiErrorMessage(res.data) : 'فشل حفظ المحتوى'),
    };
  } catch (error) {
    console.error('Error in createContentServerAction:', error);
    return { success: false, error: (error instanceof Error ? (error instanceof Error ? error.message : undefined) : undefined) || 'حدث خطأ أثناء حفظ المحتوى' };
  }
}

export async function updateContentServerAction(
  id: number,
  data: Partial<Omit<ApiContent, 'id' | 'create_at' | 'update_at'>>
): Promise<{ success: boolean; data?: ApiContent; error?: string }> {
  try {
    const res = await serverFetch<{ success: boolean; message: string; data: ApiContent }>(`/content/content/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });

    if (res.success && res.data) {
      revalidatePath('/');
      revalidatePath('/[locale]', 'layout');
      revalidatePath('/dashboard/site-cms/main-content');

      const responseData = res.data.data;
      return { success: true, data: responseData };
    }

    return {
      success: false,
      error: res.error || (res.data ? formatApiErrorMessage(res.data) : 'فشل تعديل المحتوى'),
    };
  } catch (error) {
    console.error(`Error in updateContentServerAction for id ${id}:`, error);
    return { success: false, error: (error instanceof Error ? (error instanceof Error ? error.message : undefined) : undefined) || 'حدث خطأ أثناء تعديل المحتوى' };
  }
}
