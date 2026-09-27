'use server';

import { serverFetch, formatApiErrorMessage, serverListFetch } from '@/lib/server-api';
import type { ApiCustomerReview } from '@/types/api';
import type { ListQueryParams, PaginatedResult } from '@/types/pagination';
import { revalidatePath } from 'next/cache';

export async function getTestimonialsServerAction(
  params?: ListQueryParams
): Promise<PaginatedResult<ApiCustomerReview> | null> {
  try {
    const res = await serverListFetch<ApiCustomerReview>('/content/customerreview/', params, {
      next: { revalidate: 0 },
    });

    if (res.success && res.data) {
      return res.data;
    }

    return null;
  } catch (error) {
    console.error('Error in getTestimonialsServerAction:', error);
    return null;
  }
}

/**
 * Fetches every testimonial. The public "Testimonials" slider needs the full
 * set; the paginated action above would cap it at 15 records.
 */
export async function getAllTestimonialsServerAction(): Promise<ApiCustomerReview[]> {
  const res = await serverListFetch<ApiCustomerReview>('/content/customerreview/', { all: true }, {
    next: { revalidate: 0 },
  });
  return res.success && res.data ? res.data.items : [];
}

export async function createTestimonialServerAction(
  formData: FormData
): Promise<{ success: boolean; data?: ApiCustomerReview; error?: string }> {
  try {
    const res = await serverFetch<{ success: boolean; message: string; data: ApiCustomerReview }>('/content/customerreview/', {
      method: 'POST',
      body: formData,
    });

    if (res.success && res.data) {
      revalidatePath('/');
      revalidatePath('/[locale]', 'layout');
      revalidatePath('/dashboard/site-cms/testimonials');

      const responseData = res.data.data;
      return { success: true, data: responseData };
    }

    return {
      success: false,
      error: res.error || (res.data ? formatApiErrorMessage(res.data) : 'فشل إضافة التقييم'),
    };
  } catch (error) {
    console.error('Error in createTestimonialServerAction:', error);
    return { success: false, error: (error instanceof Error ? (error instanceof Error ? (error instanceof Error ? error.message : undefined) : undefined) : undefined) || 'حدث خطأ أثناء إضافة التقييم' };
  }
}

export async function updateTestimonialServerAction(
  id: number,
  formData: FormData
): Promise<{ success: boolean; data?: ApiCustomerReview; error?: string }> {
  try {
    const res = await serverFetch<{ success: boolean; message: string; data: ApiCustomerReview }>(`/content/customerreview/${id}/`, {
      method: 'PATCH',
      body: formData,
    });

    if (res.success && res.data) {
      revalidatePath('/');
      revalidatePath('/[locale]', 'layout');
      revalidatePath('/dashboard/site-cms/testimonials');

      const responseData = res.data.data;
      return { success: true, data: responseData };
    }

    return {
      success: false,
      error: res.error || (res.data ? formatApiErrorMessage(res.data) : 'فشل تعديل التقييم'),
    };
  } catch (error) {
    console.error(`Error in updateTestimonialServerAction for id ${id}:`, error);
    return { success: false, error: (error instanceof Error ? (error instanceof Error ? (error instanceof Error ? error.message : undefined) : undefined) : undefined) || 'حدث خطأ أثناء تعديل التقييم' };
  }
}

export async function deleteTestimonialServerAction(
  id: number
): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await serverFetch<{ success: boolean; message: string }>(`/content/customerreview/${id}/`, {
      method: 'DELETE',
    });

    if (res.success) {
      revalidatePath('/');
      revalidatePath('/[locale]', 'layout');
      revalidatePath('/dashboard/site-cms/testimonials');
      return { success: true };
    }

    return {
      success: false,
      error: res.error || 'فشل حذف التقييم',
    };
  } catch (error) {
    console.error(`Error in deleteTestimonialServerAction for id ${id}:`, error);
    return { success: false, error: (error instanceof Error ? (error instanceof Error ? (error instanceof Error ? error.message : undefined) : undefined) : undefined) || 'حدث خطأ أثناء حذف التقييم' };
  }
}
