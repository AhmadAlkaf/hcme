'use server';

import { serverFetch, formatApiErrorMessage, serverListFetch } from '@/lib/server-api';
import type { 
  ApiDeviceFingerprintsResponse,
  ApiSingleDeviceFingerprintResponse,
  ApiDeviceFingerprint
} from '@/types/api';
import type { ListQueryParams, PaginatedResult } from '@/types/pagination';
import { revalidatePath } from 'next/cache';

export async function getDeviceFingerprintsServerAction(
  params?: ListQueryParams
): Promise<PaginatedResult<ApiDeviceFingerprint> | null> {
  try {
    const res = await serverListFetch<ApiDeviceFingerprint>('/hr/devicefingerprint/', params, {
      requiresAuth: true,
      next: { revalidate: 0 },
    });

    if (res.success && res.data) {
      return res.data;
    }

    return null;
  } catch (error) {
    console.error('Error in getDeviceFingerprintsServerAction:', error);
    return null;
  }
}

/**
 * Fetches every record. Required by the dropdowns and filters on this screen,
 * which would otherwise be silently capped at the first page of 15.
 */
export async function getAllDeviceFingerprintsServerAction(): Promise<ApiDeviceFingerprint[]> {
  const res = await serverListFetch<ApiDeviceFingerprint>('/hr/devicefingerprint/', { all: true }, {
    requiresAuth: true,
    next: { revalidate: 0 },
  });
  return res.success && res.data ? res.data.items : [];
}

export async function createDeviceFingerprintServerAction(data: {
  name: string;
  sn: string;
  location: string;
  ip_address: string;
  port: number | null;
  password: string;
}): Promise<{ success: boolean; data?: ApiDeviceFingerprint; error?: string }> {
  try {
    const res = await serverFetch<ApiSingleDeviceFingerprintResponse>('/hr/devicefingerprint/', {
      method: 'POST',
      body: JSON.stringify(data),
    });

    if (res.success && res.data) {
      const deviceData = (res.data as { data?: unknown }).data || res.data;
      revalidatePath('/dashboard/hr/device-fingerprints');
      return { success: true, data: deviceData as ApiDeviceFingerprint };
    }

    return { 
      success: false, 
      error: res.error || (res.data ? formatApiErrorMessage(res.data) : 'فشل إضافة جهاز البصمة') 
    };
  } catch (error) {
    console.error('Error in createDeviceFingerprintServerAction:', error);
    return { success: false, error: error instanceof Error ? error.message : 'حدث خطأ أثناء الإضافة' };
  }
}

export async function updateDeviceFingerprintServerAction(
  id: string | number,
  data: {
    name: string;
    sn: string;
    location: string;
    ip_address: string;
    port: number | null;
    password: string;
  }
): Promise<{ success: boolean; data?: ApiDeviceFingerprint; error?: string }> {
  try {
    const res = await serverFetch<ApiSingleDeviceFingerprintResponse>(`/hr/devicefingerprint/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });

    if (res.success && res.data) {
      const deviceData = (res.data as { data?: unknown }).data || res.data;
      revalidatePath('/dashboard/hr/device-fingerprints');
      return { success: true, data: deviceData as ApiDeviceFingerprint };
    }

    return { 
      success: false, 
      error: res.error || (res.data ? formatApiErrorMessage(res.data) : 'فشل تعديل جهاز البصمة') 
    };
  } catch (error) {
    console.error(`Error in updateDeviceFingerprintServerAction for id ${id}:`, error);
    return { success: false, error: error instanceof Error ? error.message : 'حدث خطأ أثناء التعديل' };
  }
}

export async function deleteDeviceFingerprintServerAction(
  id: string | number
): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await serverFetch<any>(`/hr/devicefingerprint/${id}/`, {
      method: 'DELETE',
    });

    if (res.success) {
      revalidatePath('/dashboard/hr/device-fingerprints');
      return { success: true };
    }

    return { success: false, error: res.error || 'فشل حذف بصمة الجهاز' };
  } catch (error) {
    console.error(`Error in deleteDeviceFingerprintServerAction for id ${id}:`, error);
    return { success: false, error: error instanceof Error ? error.message : 'حدث خطأ أثناء الحذف' };
  }
}
