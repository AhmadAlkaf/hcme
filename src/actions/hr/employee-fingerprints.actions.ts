'use server';

import { serverFetch, formatApiErrorMessage, serverListFetch } from '@/lib/server-api';
import type { 
  ApiEmployeeFingerprintsResponse,
  ApiSingleEmployeeFingerprintResponse,
  ApiEmployeeFingerprint
} from '@/types/api';
import type { ListQueryParams, PaginatedResult } from '@/types/pagination';
import { revalidatePath } from 'next/cache';

export async function getEmployeeFingerprintsServerAction(
  params?: ListQueryParams
): Promise<PaginatedResult<ApiEmployeeFingerprint> | null> {
  try {
    const res = await serverListFetch<ApiEmployeeFingerprint>('/hr/employeefingerprint/', params, {
      requiresAuth: true,
      next: { revalidate: 0 },
    });

    if (res.success && res.data) {
      return res.data;
    }

    return null;
  } catch (error) {
    console.error('Error in getEmployeeFingerprintsServerAction:', error);
    return null;
  }
}

/**
 * Fetches every record. Required by the dropdowns and filters on this screen,
 * which would otherwise be silently capped at the first page of 15.
 */
export async function getAllEmployeeFingerprintsServerAction(): Promise<ApiEmployeeFingerprint[]> {
  const res = await serverListFetch<ApiEmployeeFingerprint>('/hr/employeefingerprint/', { all: true }, {
    requiresAuth: true,
    next: { revalidate: 0 },
  });
  return res.success && res.data ? res.data.items : [];
}

export async function createEmployeeFingerprintServerAction(data: {
  finger_print_id: string;
  finger_print_data: string;
  employee: number | null;
  device_finger_print: number | null;
}): Promise<{ success: boolean; data?: ApiEmployeeFingerprint; error?: string }> {
  try {
    const res = await serverFetch<ApiSingleEmployeeFingerprintResponse>('/hr/employeefingerprint/', {
      method: 'POST',
      body: JSON.stringify(data),
    });

    if (res.success && res.data) {
      const respData = (res.data as { data?: unknown }).data || res.data;
      revalidatePath('/dashboard/hr/employee-fingerprints');
      return { success: true, data: respData as ApiEmployeeFingerprint };
    }

    return { 
      success: false, 
      error: res.error || (res.data ? formatApiErrorMessage(res.data) : 'فشل الإضافة') 
    };
  } catch (error) {
    console.error('Error in createEmployeeFingerprintServerAction:', error);
    return { success: false, error: error instanceof Error ? error.message : 'حدث خطأ أثناء الإضافة' };
  }
}

export async function updateEmployeeFingerprintServerAction(
  id: string | number,
  data: {
    finger_print_id?: string;
    finger_print_data?: string;
    employee?: number | null;
    device_finger_print?: number | null;
  }
): Promise<{ success: boolean; data?: ApiEmployeeFingerprint; error?: string }> {
  try {
    const res = await serverFetch<ApiSingleEmployeeFingerprintResponse>(`/hr/employeefingerprint/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });

    if (res.success && res.data) {
      const respData = (res.data as { data?: unknown }).data || res.data;
      revalidatePath('/dashboard/hr/employee-fingerprints');
      return { success: true, data: respData as ApiEmployeeFingerprint };
    }

    return { 
      success: false, 
      error: res.error || (res.data ? formatApiErrorMessage(res.data) : 'فشل التعديل') 
    };
  } catch (error) {
    console.error(`Error in updateEmployeeFingerprintServerAction for id ${id}:`, error);
    return { success: false, error: error instanceof Error ? error.message : 'حدث خطأ أثناء التعديل' };
  }
}

export async function deleteEmployeeFingerprintServerAction(
  id: string | number
): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await serverFetch<any>(`/hr/employeefingerprint/${id}/`, {
      method: 'DELETE',
    });

    if (res.success) {
      revalidatePath('/dashboard/hr/employee-fingerprints');
      return { success: true };
    }

    return { success: false, error: res.error || 'فشل الحذف' };
  } catch (error) {
    console.error(`Error in deleteEmployeeFingerprintServerAction for id ${id}:`, error);
    return { success: false, error: error instanceof Error ? error.message : 'حدث خطأ أثناء الحذف' };
  }
}
