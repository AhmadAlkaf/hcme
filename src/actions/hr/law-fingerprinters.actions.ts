'use server';

import { serverFetch, formatApiErrorMessage, serverListFetch } from '@/lib/server-api';
import type { 
  ApiSingleLawFingerprinterResponse,
  ApiLawFingerprinter
} from '@/types/api';
import type { ListQueryParams, PaginatedResult } from '@/types/pagination';
import { revalidatePath } from 'next/cache';

export async function getLawFingerprintersServerAction(
  params?: ListQueryParams
): Promise<PaginatedResult<ApiLawFingerprinter> | null> {
  try {
    const res = await serverListFetch<ApiLawFingerprinter>('/hr/lawfingerprinter/', params, {
      requiresAuth: true,
      next: { revalidate: 0 },
    });

    if (res.success && res.data) {
      return res.data;
    }

    return null;
  } catch (error) {
    console.error('Error in getLawFingerprintersServerAction:', error);
    return null;
  }
}

/**
 * Fetches every record. Required by the dropdowns and filters on this screen,
 * which would otherwise be silently capped at the first page of 15.
 */
export async function getAllLawFingerprintersServerAction(): Promise<ApiLawFingerprinter[]> {
  const res = await serverListFetch<ApiLawFingerprinter>('/hr/lawfingerprinter/', { all: true }, {
    requiresAuth: true,
    next: { revalidate: 0 },
  });
  return res.success && res.data ? res.data.items : [];
}

export async function createLawFingerprinterServerAction(data: {
  name: string;
  time_from_which_fingerprint_entry_is_received: string | null;
  entry_grace_period: string | null;
  consider_absent_if_late_by: string | null;
  early_departure_allowance: string | null;
  last_time_to_accept_finger_print: string | null;
  time_from_which_fingerprint_out_is_received: string | null;
  deduct_for_missing_check_in: boolean;
  deduct_for_missing_check_out: boolean;
  shift: number | null;
}): Promise<{ success: boolean; data?: ApiLawFingerprinter; error?: string }> {
  try {
    const res = await serverFetch<ApiSingleLawFingerprinterResponse>('/hr/lawfingerprinter/', {
      method: 'POST',
      body: JSON.stringify(data),
    });

    if (res.success && res.data) {
      const respData = (res.data as { data?: unknown }).data || res.data;
      revalidatePath('/dashboard/hr/legal-specialists');
      return { success: true, data: respData as ApiLawFingerprinter };
    }

    return { 
      success: false, 
      error: res.error || (res.data ? formatApiErrorMessage(res.data) : 'فشل الإضافة') 
    };
  } catch (error) {
    console.error('Error in createLawFingerprinterServerAction:', error);
    return { success: false, error: error instanceof Error ? error.message : 'حدث خطأ أثناء الإضافة' };
  }
}

export async function updateLawFingerprinterServerAction(
  id: string | number,
  data: {
    name?: string;
    time_from_which_fingerprint_entry_is_received?: string | null;
    entry_grace_period?: string | null;
    consider_absent_if_late_by?: string | null;
    early_departure_allowance?: string | null;
    last_time_to_accept_finger_print?: string | null;
    time_from_which_fingerprint_out_is_received?: string | null;
    deduct_for_missing_check_in?: boolean;
    deduct_for_missing_check_out?: boolean;
    shift?: number | null;
  }
): Promise<{ success: boolean; data?: ApiLawFingerprinter; error?: string }> {
  try {
    const res = await serverFetch<ApiSingleLawFingerprinterResponse>(`/hr/lawfingerprinter/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });

    if (res.success && res.data) {
      const respData = (res.data as { data?: unknown }).data || res.data;
      revalidatePath('/dashboard/hr/legal-specialists');
      return { success: true, data: respData as ApiLawFingerprinter };
    }

    return { 
      success: false, 
      error: res.error || (res.data ? formatApiErrorMessage(res.data) : 'فشل التعديل') 
    };
  } catch (error) {
    console.error(`Error in updateLawFingerprinterServerAction for id ${id}:`, error);
    return { success: false, error: error instanceof Error ? error.message : 'حدث خطأ أثناء التعديل' };
  }
}

export async function deleteLawFingerprinterServerAction(
  id: string | number
): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await serverFetch<any>(`/hr/lawfingerprinter/${id}/`, {
      method: 'DELETE',
    });

    if (res.success) {
      revalidatePath('/dashboard/hr/legal-specialists');
      return { success: true };
    }

    return { success: false, error: res.error || 'فشل الحذف' };
  } catch (error) {
    console.error(`Error in deleteLawFingerprinterServerAction for id ${id}:`, error);
    return { success: false, error: error instanceof Error ? error.message : 'حدث خطأ أثناء الحذف' };
  }
}
