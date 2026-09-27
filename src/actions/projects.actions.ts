'use server';

import { serverFetch, formatApiErrorMessage, serverListFetch } from '@/lib/server-api';
import type {
  ApiSingleProjectResponse,
  ApiProject,
  ApiProjectImage
} from '@/types/api';
import type { ListQueryParams, PaginatedResult } from '@/types/pagination';
import { revalidatePath } from 'next/cache';

export async function getProjectsServerAction(
  params?: ListQueryParams
): Promise<PaginatedResult<ApiProject> | null> {
  try {
    const res = await serverListFetch<ApiProject>('/gallery/project/', params, {
      next: { revalidate: 0 },
    });

    if (res.success && res.data) {
      return res.data;
    }

    return null;
  } catch (error) {
    console.error('Error in getProjectsServerAction:', error);
    return null;
  }
}

export async function getProjectByIdServerAction(
  id: string | number
): Promise<ApiProject | null> {
  try {
    const endpoint = `/gallery/project/${id}/`;

    const res = await serverFetch<ApiSingleProjectResponse>(endpoint, {
      next: { revalidate: 0 },
    });

    if (res.success && res.data?.data) {
      return res.data.data;
    }

    return null;
  } catch (error) {
    console.error(`Error in getProjectByIdServerAction for id ${id}:`, error);
    return null;
  }
}

export async function createProjectServerAction(
  formData: FormData
): Promise<{ success: boolean; data?: ApiProject; error?: string }> {
  try {
    const res = await serverFetch<ApiSingleProjectResponse>('/gallery/project/', {
      method: 'POST',
      body: formData,
    });

    if (res.success && res.data?.data) {
      revalidatePath('/projects');
      revalidatePath('/[locale]/projects', 'page');
      return { success: true, data: res.data.data };
    }

    return {
      success: false,
      error: res.error || (res.data ? formatApiErrorMessage(res.data) : 'فشل إضافة المشروع')
    };
  } catch (error) {
    console.error('Error in createProjectServerAction:', error);
    return { success: false, error: (error instanceof Error ? (error instanceof Error ? (error instanceof Error ? (error instanceof Error ? (error instanceof Error ? error.message : undefined) : undefined) : undefined) : undefined) : undefined) || 'حدث خطأ أثناء إضافة المشروع' };
  }
}

export async function updateProjectServerAction(
  id: string | number,
  formData: FormData
): Promise<{ success: boolean; data?: ApiProject; error?: string }> {
  try {
    const res = await serverFetch<ApiSingleProjectResponse>(`/gallery/project/${id}/`, {
      method: 'PATCH',
      body: formData,
    });

    if (res.success && res.data?.data) {
      revalidatePath('/projects');
      revalidatePath(`/projects/${id}`);
      revalidatePath('/[locale]/projects', 'page');
      return { success: true, data: res.data.data };
    }

    return {
      success: false,
      error: res.error || (res.data ? formatApiErrorMessage(res.data) : 'فشل تعديل بيانات المشروع')
    };
  } catch (error) {
    console.error(`Error in updateProjectServerAction for id ${id}:`, error);
    return { success: false, error: (error instanceof Error ? (error instanceof Error ? (error instanceof Error ? (error instanceof Error ? (error instanceof Error ? error.message : undefined) : undefined) : undefined) : undefined) : undefined) || 'حدث خطأ أثناء تعديل بيانات المشروع' };
  }
}

export async function deleteProjectServerAction(
  id: string | number
): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await serverFetch<{ success: boolean; message: string }>(`/gallery/project/${id}/`, {
      method: 'DELETE',
    });

    if (res.success) {
      revalidatePath('/projects');
      revalidatePath('/[locale]/projects', 'page');
      return { success: true };
    }

    return { success: false, error: res.error || 'فشل حذف المشروع' };
  } catch (error) {
    console.error(`Error in deleteProjectServerAction for id ${id}:`, error);
    return { success: false, error: (error instanceof Error ? (error instanceof Error ? (error instanceof Error ? (error instanceof Error ? (error instanceof Error ? error.message : undefined) : undefined) : undefined) : undefined) : undefined) || 'حدث خطأ أثناء حذف المشروع' };
  }
}

export async function addProjectImageServerAction(
  projectId: string | number,
  imageFile: File
): Promise<{ success: boolean; data?: ApiProjectImage; error?: string }> {
  try {
    const formData = new FormData();
    formData.append('project', String(projectId));
    formData.append('image', imageFile);

    const res = await serverFetch<{ success: boolean; message: string; data: ApiProjectImage }>('/gallery/projectimage/', {
      method: 'POST',
      body: formData,
    });

    if (res.success && res.data?.data) {
      revalidatePath('/projects');
      revalidatePath('/[locale]/projects', 'page');
      return { success: true, data: res.data.data };
    }

    return { success: false, error: res.error || 'فشل رفع صورة المشروع الفرعية' };
  } catch (error) {
    console.error('Error in addProjectImageServerAction:', error);
    return { success: false, error: (error instanceof Error ? (error instanceof Error ? (error instanceof Error ? (error instanceof Error ? (error instanceof Error ? error.message : undefined) : undefined) : undefined) : undefined) : undefined) || 'حدث خطأ أثناء رفع الصورة' };
  }
}

export async function deleteProjectImageServerAction(
  imageId: string | number
): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await serverFetch<{ success: boolean; message: string }>(`/gallery/projectimage/${imageId}/`, {
      method: 'DELETE',
    });

    if (res.success) {
      revalidatePath('/projects');
      revalidatePath('/[locale]/projects', 'page');
      return { success: true };
    }

    return { success: false, error: res.error || 'فشل حذف صورة المشروع الفرعية' };
  } catch (error) {
    console.error(`Error in deleteProjectImageServerAction for image ${imageId}:`, error);
    return { success: false, error: (error instanceof Error ? (error instanceof Error ? (error instanceof Error ? (error instanceof Error ? (error instanceof Error ? error.message : undefined) : undefined) : undefined) : undefined) : undefined) || 'حدث خطأ أثناء حذف الصورة' };
  }
}
