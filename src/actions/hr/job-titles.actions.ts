'use server';

import { serverFetch, formatApiErrorMessage, serverListFetch } from '@/lib/server-api';
import type { 
  ApiJobTitlesResponse,
  ApiSingleJobTitleResponse,
  ApiJobTitle
} from '@/types/api';
import type { ListQueryParams, PaginatedResult } from '@/types/pagination';
import { revalidatePath } from 'next/cache';

export async function getJobTitlesServerAction(
  params?: ListQueryParams
): Promise<PaginatedResult<ApiJobTitle> | null> {
  try {
    const res = await serverListFetch<ApiJobTitle>('/hr/jobtitle/', params, {
      requiresAuth: true,
      next: { revalidate: 0 },
    });

    if (res.success && res.data) {
      return res.data;
    }

    return null;
  } catch (error) {
    console.error('Error in getJobTitlesServerAction:', error);
    return null;
  }
}

/**
 * Fetches every record. Required by the dropdowns and filters on this screen,
 * which would otherwise be silently capped at the first page of 15.
 */
export async function getAllJobTitlesServerAction(): Promise<ApiJobTitle[]> {
  const res = await serverListFetch<ApiJobTitle>('/hr/jobtitle/', { all: true }, {
    requiresAuth: true,
    next: { revalidate: 0 },
  });
  return res.success && res.data ? res.data.items : [];
}

export async function createJobTitleServerAction(data: {
  name: string;
  tesk: string;
}): Promise<{ success: boolean; data?: ApiJobTitle; error?: string }> {
  try {
    const res = await serverFetch<ApiSingleJobTitleResponse>('/hr/jobtitle/', {
      method: 'POST',
      body: JSON.stringify(data),
    });

    if (res.success && res.data) {
      const jobData = (res.data as { data?: unknown }).data || res.data;
      revalidatePath('/dashboard/hr/job-titles');
      return { success: true, data: jobData as ApiJobTitle };
    }

    return { 
      success: false, 
      error: res.error || (res.data ? formatApiErrorMessage(res.data) : 'فشل إضافة المسمى الوظيفي') 
    };
  } catch (error) {
    console.error('Error in createJobTitleServerAction:', error);
    return { success: false, error: error instanceof Error ? error.message : 'حدث خطأ أثناء الإضافة' };
  }
}

export async function updateJobTitleServerAction(
  id: string | number,
  data: {
    name: string;
    tesk: string;
  }
): Promise<{ success: boolean; data?: ApiJobTitle; error?: string }> {
  try {
    const res = await serverFetch<ApiSingleJobTitleResponse>(`/hr/jobtitle/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });

    if (res.success && res.data) {
      const jobData = (res.data as { data?: unknown }).data || res.data;
      revalidatePath('/dashboard/hr/job-titles');
      return { success: true, data: jobData as ApiJobTitle };
    }

    return { 
      success: false, 
      error: res.error || (res.data ? formatApiErrorMessage(res.data) : 'فشل تعديل المسمى الوظيفي') 
    };
  } catch (error) {
    console.error(`Error in updateJobTitleServerAction for id ${id}:`, error);
    return { success: false, error: error instanceof Error ? error.message : 'حدث خطأ أثناء التعديل' };
  }
}

export async function deleteJobTitleServerAction(
  id: string | number
): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await serverFetch<any>(`/hr/jobtitle/${id}/`, {
      method: 'DELETE',
    });

    if (res.success) {
      revalidatePath('/dashboard/hr/job-titles');
      return { success: true };
    }

    return { success: false, error: res.error || 'فشل حذف المسمى الوظيفي' };
  } catch (error) {
    console.error(`Error in deleteJobTitleServerAction for id ${id}:`, error);
    return { success: false, error: error instanceof Error ? error.message : 'حدث خطأ أثناء الحذف' };
  }
}
