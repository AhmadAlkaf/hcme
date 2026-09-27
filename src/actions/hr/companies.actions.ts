'use server';

import { serverFetch, formatApiErrorMessage, serverListFetch } from '@/lib/server-api';
import type { 
  ApiCompaniesResponse,
  ApiSingleCompanyResponse,
  ApiCompany
} from '@/types/api';
import type { ListQueryParams, PaginatedResult } from '@/types/pagination';
import { revalidatePath } from 'next/cache';

export async function getCompaniesServerAction(
  params?: ListQueryParams
): Promise<PaginatedResult<ApiCompany> | null> {
  try {
    const res = await serverListFetch<ApiCompany>('/hr/company/', params, {
      requiresAuth: true,
      next: { revalidate: 0 },
    });

    if (res.success && res.data) {
      return res.data;
    }

    return null;
  } catch (error) {
    console.error('Error in getCompaniesServerAction:', error);
    return null;
  }
}

/**
 * Fetches every record. Required by the dropdowns and filters on this screen,
 * which would otherwise be silently capped at the first page of 15.
 */
export async function getAllCompaniesServerAction(): Promise<ApiCompany[]> {
  const res = await serverListFetch<ApiCompany>('/hr/company/', { all: true }, {
    requiresAuth: true,
    next: { revalidate: 0 },
  });
  return res.success && res.data ? res.data.items : [];
}

export async function createCompanyServerAction(
  formData: FormData
): Promise<{ success: boolean; data?: ApiCompany; error?: string }> {
  try {
    const res = await serverFetch<ApiSingleCompanyResponse>('/hr/company/', {
      method: 'POST',
      body: formData,
    });

    if (res.success && res.data) {
      const companyData = (res.data as { data?: unknown }).data || res.data;
      revalidatePath('/dashboard/hr/companies');
      return { success: true, data: companyData as ApiCompany };
    }

    return { 
      success: false, 
      error: res.error || (res.data ? formatApiErrorMessage(res.data) : 'فشل إضافة الشركة') 
    };
  } catch (error) {
    console.error('Error in createCompanyServerAction:', error);
    return { success: false, error: error instanceof Error ? error.message : 'حدث خطأ أثناء الإضافة' };
  }
}

export async function updateCompanyServerAction(
  id: string | number,
  formData: FormData
): Promise<{ success: boolean; data?: ApiCompany; error?: string }> {
  try {
    const res = await serverFetch<ApiSingleCompanyResponse>(`/hr/company/${id}/`, {
      method: 'PATCH',
      body: formData,
    });

    if (res.success && res.data) {
      const companyData = (res.data as { data?: unknown }).data || res.data;
      revalidatePath('/dashboard/hr/companies');
      return { success: true, data: companyData as ApiCompany };
    }

    return { 
      success: false, 
      error: res.error || (res.data ? formatApiErrorMessage(res.data) : 'فشل تعديل الشركة') 
    };
  } catch (error) {
    console.error(`Error in updateCompanyServerAction for id ${id}:`, error);
    return { success: false, error: error instanceof Error ? error.message : 'حدث خطأ أثناء التعديل' };
  }
}

export async function deleteCompanyServerAction(
  id: string | number
): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await serverFetch<any>(`/hr/company/${id}/`, {
      method: 'DELETE',
    });

    if (res.success) {
      revalidatePath('/dashboard/hr/companies');
      return { success: true };
    }

    return { success: false, error: res.error || 'فشل حذف الشركة' };
  } catch (error) {
    console.error(`Error in deleteCompanyServerAction for id ${id}:`, error);
    return { success: false, error: error instanceof Error ? error.message : 'حدث خطأ أثناء الحذف' };
  }
}
