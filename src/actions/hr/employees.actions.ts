'use server';

import { serverFetch, formatApiErrorMessage, serverListFetch } from '@/lib/server-api';
import type { 
  ApiEmployeesResponse,
  ApiSingleEmployeeResponse,
  ApiEmployee
} from '@/types/api';
import type { ListQueryParams, PaginatedResult } from '@/types/pagination';
import { revalidatePath } from 'next/cache';

export async function getEmployeesServerAction(
  params?: ListQueryParams
): Promise<PaginatedResult<ApiEmployee> | null> {
  try {
    const res = await serverListFetch<ApiEmployee>('/hr/employee/', params, {
      requiresAuth: true,
      next: { revalidate: 0 },
    });

    if (res.success && res.data) {
      return res.data;
    }

    return null;
  } catch (error) {
    console.error('Error in getEmployeesServerAction:', error);
    return null;
  }
}

/**
 * Fetches every record. Required by the dropdowns and filters on this screen,
 * which would otherwise be silently capped at the first page of 15.
 */
export async function getAllEmployeesServerAction(): Promise<ApiEmployee[]> {
  const res = await serverListFetch<ApiEmployee>('/hr/employee/', { all: true }, {
    requiresAuth: true,
    next: { revalidate: 0 },
  });
  return res.success && res.data ? res.data.items : [];
}

export async function createEmployeeServerAction(data: {
  name: string;
  birth_date: string | null;
  basic_salary: number | null;
  secondary_salary: number | null;
  currency_basic: string | number | null;
  currency_secondary: string | number | null;
  job_title: number | null;
  educational_level: number | null;
  company: number | null;
  type_of_employee: string | number | null;
  marital_status: string | number | null;
}): Promise<{ success: boolean; data?: ApiEmployee; error?: string }> {
  try {
    const res = await serverFetch<ApiSingleEmployeeResponse>('/hr/employee/', {
      method: 'POST',
      body: JSON.stringify(data),
    });

    if (res.success && res.data) {
      const respData = (res.data as { data?: unknown }).data || res.data;
      revalidatePath('/dashboard/hr/employees');
      return { success: true, data: respData as ApiEmployee };
    }

    return { 
      success: false, 
      error: res.error || (res.data ? formatApiErrorMessage(res.data) : 'فشل الإضافة') 
    };
  } catch (error) {
    console.error('Error in createEmployeeServerAction:', error);
    return { success: false, error: error instanceof Error ? error.message : 'حدث خطأ أثناء الإضافة' };
  }
}

export async function updateEmployeeServerAction(
  id: string | number,
  data: {
    name?: string;
    birth_date?: string | null;
    basic_salary?: number | null;
    secondary_salary?: number | null;
    currency_basic?: string | number | null;
    currency_secondary?: string | number | null;
    job_title?: number | null;
    educational_level?: number | null;
    company?: number | null;
    type_of_employee?: string | number | null;
    marital_status?: string | number | null;
  }
): Promise<{ success: boolean; data?: ApiEmployee; error?: string }> {
  try {
    const res = await serverFetch<ApiSingleEmployeeResponse>(`/hr/employee/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });

    if (res.success && res.data) {
      const respData = (res.data as { data?: unknown }).data || res.data;
      revalidatePath('/dashboard/hr/employees');
      return { success: true, data: respData as ApiEmployee };
    }

    return { 
      success: false, 
      error: res.error || (res.data ? formatApiErrorMessage(res.data) : 'فشل التعديل') 
    };
  } catch (error) {
    console.error(`Error in updateEmployeeServerAction for id ${id}:`, error);
    return { success: false, error: error instanceof Error ? error.message : 'حدث خطأ أثناء التعديل' };
  }
}

export async function deleteEmployeeServerAction(
  id: string | number
): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await serverFetch<any>(`/hr/employee/${id}/`, {
      method: 'DELETE',
    });

    if (res.success) {
      revalidatePath('/dashboard/hr/employees');
      return { success: true };
    }

    return { success: false, error: res.error || 'فشل الحذف' };
  } catch (error) {
    console.error(`Error in deleteEmployeeServerAction for id ${id}:`, error);
    return { success: false, error: error instanceof Error ? error.message : 'حدث خطأ أثناء الحذف' };
  }
}
