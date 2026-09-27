'use server';

import { serverFetch, formatApiErrorMessage, serverListFetch } from '@/lib/server-api';
import type { ApiGoal } from '@/types/api';
import type { ListQueryParams, PaginatedResult } from '@/types/pagination';
import { revalidatePath } from 'next/cache';

export async function getGoalsServerAction(
  params?: ListQueryParams
): Promise<PaginatedResult<ApiGoal> | null> {
  try {
    const res = await serverListFetch<ApiGoal>('/content/gool/', params, {
      next: { revalidate: 0 },
    });

    if (res.success && res.data) {
      return res.data;
    }

    return null;
  } catch (error) {
    console.error('Error in getGoalsServerAction:', error);
    return null;
  }
}

export async function createGoalServerAction(data: {
  name_ar: string;
  name_en: string;
}): Promise<{ success: boolean; data?: ApiGoal; error?: string }> {
  try {
    const res = await serverFetch<{ success: boolean; message: string; data: ApiGoal }>('/content/gool/', {
      method: 'POST',
      body: JSON.stringify(data),
    });

    if (res.success && res.data) {
      revalidatePath('/');
      revalidatePath('/[locale]', 'layout');
      revalidatePath('/dashboard/site-cms/goals');

      const responseData = res.data.data;
      return { success: true, data: responseData };
    }
 
    return {
      success: false,
      error: res.error || (res.data ? formatApiErrorMessage(res.data) : 'فشل إضافة الهدف'),
    };
  } catch (error) {
    console.error('Error in createGoalServerAction:', error);
    return { success: false, error: (error instanceof Error ? (error instanceof Error ? (error instanceof Error ? error.message : undefined) : undefined) : undefined) || 'حدث خطأ أثناء إضافة الهدف' };
  }
}

export async function updateGoalServerAction(
  id: number,
  data: {
    name_ar: string;
    name_en: string;
  }
): Promise<{ success: boolean; data?: ApiGoal; error?: string }> {
  try {
    const res = await serverFetch<{ success: boolean; message: string; data: ApiGoal }>(`/content/gool/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });

    if (res.success && res.data) {
      revalidatePath('/');
      revalidatePath('/[locale]', 'layout');
      revalidatePath('/dashboard/site-cms/goals');

      const responseData = res.data.data;
      return { success: true, data: responseData };
    }

    return {
      success: false,
      error: res.error || (res.data ? formatApiErrorMessage(res.data) : 'فشل تعديل الهدف'),
    };
  } catch (error) {
    console.error(`Error in updateGoalServerAction for id ${id}:`, error);
    return { success: false, error: (error instanceof Error ? (error instanceof Error ? (error instanceof Error ? error.message : undefined) : undefined) : undefined) || 'حدث خطأ أثناء تعديل الهدف' };
  }
}

export async function deleteGoalServerAction(
  id: number
): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await serverFetch<{ success: boolean; message: string }>(`/content/gool/${id}/`, {
      method: 'DELETE',
    });

    if (res.success) {
      revalidatePath('/');
      revalidatePath('/[locale]', 'layout');
      revalidatePath('/dashboard/site-cms/goals');
      return { success: true };
    }

    return {
      success: false,
      error: res.error || 'فشل حذف الهدف',
    };
  } catch (error) {
    console.error(`Error in deleteGoalServerAction for id ${id}:`, error);
    return { success: false, error: (error instanceof Error ? (error instanceof Error ? (error instanceof Error ? error.message : undefined) : undefined) : undefined) || 'حدث خطأ أثناء حذف الهدف' };
  }
}
