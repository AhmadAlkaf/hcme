'use server';

import { serverFetch, formatApiErrorMessage, serverListFetch } from '@/lib/server-api';
import type { 
  ApiAttendancesResponse,
  ApiSingleAttendanceResponse,
  ApiAttendance
} from '@/types/api';
import type { ListQueryParams, PaginatedResult } from '@/types/pagination';
import { revalidatePath } from 'next/cache';

export async function getAttendancesServerAction(
  params?: ListQueryParams
): Promise<PaginatedResult<ApiAttendance> | null> {
  try {
    const res = await serverListFetch<ApiAttendance>('/hr/attendance/', params, {
      requiresAuth: true,
      next: { revalidate: 0 },
    });

    if (res.success && res.data) {
      return res.data;
    }

    return null;
  } catch (error) {
    console.error('Error in getAttendancesServerAction:', error);
    return null;
  }
}

/**
 * Fetches every record. Required by the dropdowns and filters on this screen,
 * which would otherwise be silently capped at the first page of 15.
 */
export async function getAllAttendancesServerAction(): Promise<ApiAttendance[]> {
  const res = await serverListFetch<ApiAttendance>('/hr/attendance/', { all: true }, {
    requiresAuth: true,
    next: { revalidate: 0 },
  });
  return res.success && res.data ? res.data.items : [];
}

export async function createAttendanceServerAction(data: {
  date: string | null;
  time_in: string | null;
  time_out: string | null;
  is_present: boolean;
  is_present1: number | null;
  note: string;
  employee: number | null;
  shift: number | null;
}): Promise<{ success: boolean; data?: ApiAttendance; error?: string }> {
  try {
    const res = await serverFetch<ApiSingleAttendanceResponse>('/hr/attendance/', {
      method: 'POST',
      body: JSON.stringify(data),
    });

    if (res.success && res.data) {
      const respData = (res.data as { data?: unknown }).data || res.data;
      revalidatePath('/dashboard/hr/attendance');
      return { success: true, data: respData as ApiAttendance };
    }

    return { 
      success: false, 
      error: res.error || (res.data ? formatApiErrorMessage(res.data) : 'فشل الإضافة') 
    };
  } catch (error) {
    console.error('Error in createAttendanceServerAction:', error);
    return { success: false, error: error instanceof Error ? error.message : 'حدث خطأ أثناء الإضافة' };
  }
}

export async function updateAttendanceServerAction(
  id: string | number,
  data: {
    date?: string | null;
    time_in?: string | null;
    time_out?: string | null;
    is_present?: boolean;
    is_present1?: number | null;
    note?: string;
    employee?: number | null;
    shift?: number | null;
  }
): Promise<{ success: boolean; data?: ApiAttendance; error?: string }> {
  try {
    const res = await serverFetch<ApiSingleAttendanceResponse>(`/hr/attendance/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });

    if (res.success && res.data) {
      const respData = (res.data as { data?: unknown }).data || res.data;
      revalidatePath('/dashboard/hr/attendance');
      return { success: true, data: respData as ApiAttendance };
    }

    return { 
      success: false, 
      error: res.error || (res.data ? formatApiErrorMessage(res.data) : 'فشل التعديل') 
    };
  } catch (error) {
    console.error(`Error in updateAttendanceServerAction for id ${id}:`, error);
    return { success: false, error: error instanceof Error ? error.message : 'حدث خطأ أثناء التعديل' };
  }
}

export async function deleteAttendanceServerAction(
  id: string | number
): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await serverFetch<any>(`/hr/attendance/${id}/`, {
      method: 'DELETE',
    });

    if (res.success) {
      revalidatePath('/dashboard/hr/attendance');
      return { success: true };
    }

    return { success: false, error: res.error || 'فشل الحذف' };
  } catch (error) {
    console.error(`Error in deleteAttendanceServerAction for id ${id}:`, error);
    return { success: false, error: error instanceof Error ? error.message : 'حدث خطأ أثناء الحذف' };
  }
}
