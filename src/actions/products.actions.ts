'use server';

import { serverFetch, formatApiErrorMessage, serverListFetch } from '@/lib/server-api';
import type { 
  ApiSingleProductResponse, 
  ApiProduct,
  ApiProductImage,
  ApiProductUnit,
  ApiAgentsResponse,
  ApiAgent,
  ApiDepartment,
  ApiDepartmentsResponse,
  ApiSingleDepartmentResponse,
} from '@/types/api';
import type { ListQueryParams, PaginatedResult } from '@/types/pagination';
import { revalidatePath } from 'next/cache';

export async function getProductsServerAction(
  params?: ListQueryParams
): Promise<PaginatedResult<ApiProduct> | null> {
  try {
    const res = await serverListFetch<ApiProduct>('/products/product/', params, {
      next: { revalidate: 0 },
    });

    if (res.success && res.data) {
      return res.data;
    }

    return null;
  } catch (error) {
    console.error('Error in getProductsServerAction:', error);
    return null;
  }
}

/**
 * Fetches every product, optionally narrowed by a search term.
 *
 * Required by the "add product to order" dropdown, which must offer all
 * options, and by the public catalog's per-agent counters, which need the whole
 * catalogue to be accurate.
 */
export async function getAllProductsServerAction(
  params?: Pick<ListQueryParams, 'search' | 'filters'>
): Promise<ApiProduct[]> {
  const res = await serverListFetch<ApiProduct>('/products/product/', { all: true, ...params }, {
    next: { revalidate: 0 },
  });
  return res.success && res.data ? res.data.items : [];
}

export async function getProductByIdServerAction(
  id: string | number
): Promise<ApiProduct | null> {
  try {
    const endpoint = `/products/product/${id}/`;

    const res = await serverFetch<ApiSingleProductResponse>(endpoint, {
      next: { revalidate: 0 },
    });

    if (res.success && res.data?.data) {
      return res.data.data;
    }

    return null;
  } catch (error) {
    console.error(`Error in getProductByIdServerAction for id ${id}:`, error);
    return null;
  }
}

export async function createProductServerAction(
  formData: FormData
): Promise<{ success: boolean; data?: ApiProduct; error?: string }> {
  try {
    const res = await serverFetch<ApiSingleProductResponse>('/products/product/', {
      method: 'POST',
      body: formData,
    });

    if (res.success && res.data?.data) {
      revalidatePath('/products');
      revalidatePath('/[locale]/products', 'page');
      return { success: true, data: res.data.data };
    }

    return { 
      success: false, 
      error: res.error || (res.data ? formatApiErrorMessage(res.data) : 'فشل إضافة المنتج') 
    };
  } catch (error) {
    console.error('Error in createProductServerAction:', error);
    return { success: false, error: (error instanceof Error ? (error instanceof Error ? (error instanceof Error ? (error instanceof Error ? (error instanceof Error ? (error instanceof Error ? (error instanceof Error ? (error instanceof Error ? error.message : undefined) : undefined) : undefined) : undefined) : undefined) : undefined) : undefined) : undefined) || 'حدث خطأ أثناء إضافة المنتج' };
  }
}

export async function updateProductServerAction(
  id: string | number,
  formData: FormData
): Promise<{ success: boolean; data?: ApiProduct; error?: string }> {
  try {
    const res = await serverFetch<ApiSingleProductResponse>(`/products/product/${id}/`, {
      method: 'PATCH',
      body: formData,
    });

    if (res.success && res.data?.data) {
      revalidatePath('/products');
      revalidatePath(`/products/${id}`);
      revalidatePath('/[locale]/products', 'page');
      return { success: true, data: res.data.data };
    }

    return { 
      success: false, 
      error: res.error || (res.data ? formatApiErrorMessage(res.data) : 'فشل تعديل المنتج') 
    };
  } catch (error) {
    console.error(`Error in updateProductServerAction for id ${id}:`, error);
    return { success: false, error: (error instanceof Error ? (error instanceof Error ? (error instanceof Error ? (error instanceof Error ? (error instanceof Error ? (error instanceof Error ? (error instanceof Error ? (error instanceof Error ? error.message : undefined) : undefined) : undefined) : undefined) : undefined) : undefined) : undefined) : undefined) || 'An error occurred' };
  }
}

export async function deleteProductServerAction(
  id: string | number
): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await serverFetch<{ success: boolean; message: string }>(`/products/product/${id}/`, {
      method: 'DELETE',
    });

    if (res.success) {
      revalidatePath('/products');
      revalidatePath('/[locale]/products', 'page');
      return { success: true };
    }

    return { success: false, error: res.error || 'Failed to delete product' };
  } catch (error) {
    console.error(`Error in deleteProductServerAction for id ${id}:`, error);
    return { success: false, error: (error instanceof Error ? (error instanceof Error ? (error instanceof Error ? (error instanceof Error ? (error instanceof Error ? (error instanceof Error ? (error instanceof Error ? (error instanceof Error ? error.message : undefined) : undefined) : undefined) : undefined) : undefined) : undefined) : undefined) : undefined) || 'An error occurred' };
  }
}

export async function addProductImageServerAction(
  productId: string | number,
  imageFile: File
): Promise<{ success: boolean; data?: ApiProductImage; error?: string }> {
  try {
    const formData = new FormData();
    formData.append('product', String(productId));
    formData.append('image', imageFile);

    const res = await serverFetch<{ success: boolean; message: string; data: ApiProductImage }>('/products/productimage/', {
      method: 'POST',
      body: formData,
    });

    if (res.success && res.data?.data) {
      revalidatePath('/products');
      revalidatePath('/[locale]/products', 'page');
      return { success: true, data: res.data.data };
    }

    return { success: false, error: res.error || 'فشل رفع صورة المنتج الفرعية' };
  } catch (error) {
    console.error('Error in addProductImageServerAction:', error);
    return { success: false, error: (error instanceof Error ? (error instanceof Error ? (error instanceof Error ? (error instanceof Error ? (error instanceof Error ? (error instanceof Error ? (error instanceof Error ? (error instanceof Error ? error.message : undefined) : undefined) : undefined) : undefined) : undefined) : undefined) : undefined) : undefined) || 'حدث خطأ أثناء رفع الصورة' };
  }
}

export async function deleteProductImageServerAction(
  imageId: string | number
): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await serverFetch<{ success: boolean; message: string }>(`/products/productimage/${imageId}/`, {
      method: 'DELETE',
    });

    if (res.success) {
      revalidatePath('/products');
      revalidatePath('/[locale]/products', 'page');
      return { success: true };
    }

    return { success: false, error: res.error || 'فشل حذف صورة المنتج الفرعية' };
  } catch (error) {
    console.error(`Error in deleteProductImageServerAction for image ${imageId}:`, error);
    return { success: false, error: (error instanceof Error ? (error instanceof Error ? (error instanceof Error ? (error instanceof Error ? (error instanceof Error ? (error instanceof Error ? (error instanceof Error ? (error instanceof Error ? error.message : undefined) : undefined) : undefined) : undefined) : undefined) : undefined) : undefined) : undefined) || 'حدث خطأ أثناء حذف الصورة' };
  }
}

export async function createProductUnitServerAction(unitData: {
  name_unit_ar: string;
  name_unit_en?: string;
  price: string | number;
  is_active?: boolean;
  product: number | string;
}): Promise<{ success: boolean; data?: ApiProductUnit; error?: string }> {
  try {
    const res = await serverFetch<{ success: boolean; message: string; data: ApiProductUnit }>('/products/unit/', {
      method: 'POST',
      body: JSON.stringify({
        name_unit_ar: unitData.name_unit_ar,
        name_unit_en: unitData.name_unit_en || unitData.name_unit_ar,
        price: String(unitData.price),
        is_active: unitData.is_active ?? true,
        product: Number(unitData.product),
      }),
    });

    if (res.success && res.data?.data) {
      revalidatePath('/products');
      revalidatePath('/[locale]/products', 'page');
      return { success: true, data: res.data.data };
    }

    return { success: false, error: res.error || 'فشل إضافة وحدة المنتج' };
  } catch (error) {
    console.error('Error in createProductUnitServerAction:', error);
    return { success: false, error: (error instanceof Error ? (error instanceof Error ? (error instanceof Error ? (error instanceof Error ? (error instanceof Error ? (error instanceof Error ? (error instanceof Error ? (error instanceof Error ? error.message : undefined) : undefined) : undefined) : undefined) : undefined) : undefined) : undefined) : undefined) || 'حدث خطأ أثناء إضافة الوحدة' };
  }
}

export async function updateProductUnitServerAction(
  unitId: number | string,
  unitData: Partial<{
    name_unit_ar: string;
    name_unit_en: string;
    price: string | number;
    is_active: boolean;
    product: number | string;
  }>
): Promise<{ success: boolean; data?: ApiProductUnit; error?: string }> {
  try {
    const res = await serverFetch<{ success: boolean; message: string; data: ApiProductUnit }>(`/products/unit/${unitId}/`, {
      method: 'PATCH',
      body: JSON.stringify(unitData),
    });

    if (res.success && res.data?.data) {
      revalidatePath('/products');
      revalidatePath('/[locale]/products', 'page');
      return { success: true, data: res.data.data };
    }

    return { success: false, error: res.error || 'فشل تعديل وحدة المنتج' };
  } catch (error) {
    console.error(`Error in updateProductUnitServerAction for unit ${unitId}:`, error);
    return { success: false, error: (error instanceof Error ? (error instanceof Error ? (error instanceof Error ? (error instanceof Error ? (error instanceof Error ? (error instanceof Error ? (error instanceof Error ? (error instanceof Error ? error.message : undefined) : undefined) : undefined) : undefined) : undefined) : undefined) : undefined) : undefined) || 'حدث خطأ أثناء تعديل الوحدة' };
  }
}

export async function deleteProductUnitServerAction(
  unitId: number | string
): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await serverFetch<{ success: boolean; message: string }>(`/products/unit/${unitId}/`, {
      method: 'DELETE',
    });

    if (res.success) {
      revalidatePath('/products');
      revalidatePath('/[locale]/products', 'page');
      return { success: true };
    }

    return { success: false, error: res.error || 'فشل حذف وحدة المنتج' };
  } catch (error) {
    console.error(`Error in deleteProductUnitServerAction for unit ${unitId}:`, error);
    return { success: false, error: (error instanceof Error ? (error instanceof Error ? (error instanceof Error ? (error instanceof Error ? (error instanceof Error ? (error instanceof Error ? (error instanceof Error ? (error instanceof Error ? error.message : undefined) : undefined) : undefined) : undefined) : undefined) : undefined) : undefined) : undefined) || 'حدث خطأ أثناء حذف الوحدة' };
  }
}

export async function getAgentsServerAction(): Promise<ApiAgent[]> {
  const res = await serverListFetch<ApiAgent>('/content/ouragent/', { all: true }, {
    next: { revalidate: 3600 },
  });
  return res.success && res.data ? res.data.items : [];
}

// ==========================================
// DEPARTMENTS  (أقسام المنتجات)
// ==========================================
//
// A product no longer belongs to an agent directly: it belongs to a department,
// and the department carries the agent. Departments are therefore managed as
// their own resource under /products/department/.

/**
 * Paged list of departments, used by the departments screen.
 *
 * No `requiresAuth`: this endpoint is publicly readable, and the public catalog
 * needs the same list to build its department tabs.
 */
export async function getDepartmentsServerAction(
  params?: ListQueryParams
): Promise<PaginatedResult<ApiDepartment> | null> {
  try {
    const res = await serverListFetch<ApiDepartment>('/products/department/', params, {
      next: { revalidate: 0 },
    });

    return res.success && res.data ? res.data : null;
  } catch (error) {
    console.error('Error in getDepartmentsServerAction:', error);
    return null;
  }
}

/**
 * Fetches every department. Required by the product form's dropdown and by the
 * public catalog's department tabs, which must not be capped at one page.
 */
export async function getAllDepartmentsServerAction(
  params?: Pick<ListQueryParams, 'search' | 'filters'>
): Promise<ApiDepartment[]> {
  const res = await serverListFetch<ApiDepartment>('/products/department/', { all: true, ...params }, {
    next: { revalidate: 3600 },
  });
  return res.success && res.data ? res.data.items : [];
}

export async function createDepartmentServerAction(
  formData: FormData
): Promise<{ success: boolean; data?: ApiDepartment; error?: string }> {
  try {
    const res = await serverFetch<ApiSingleDepartmentResponse>('/products/department/', {
      method: 'POST',
      body: formData,
    });

    if (res.success && res.data?.data) {
      revalidatePath('/dashboard/departments');
      revalidatePath('/[locale]/products', 'page');
      return { success: true, data: res.data.data };
    }

    return {
      success: false,
      error: res.error || (res.data ? formatApiErrorMessage(res.data) : 'فشل إضافة القسم'),
    };
  } catch (error) {
    console.error('Error in createDepartmentServerAction:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'حدث خطأ أثناء إضافة القسم',
    };
  }
}

export async function updateDepartmentServerAction(
  id: string | number,
  formData: FormData
): Promise<{ success: boolean; data?: ApiDepartment; error?: string }> {
  try {
    const res = await serverFetch<ApiSingleDepartmentResponse>(`/products/department/${id}/`, {
      method: 'PATCH',
      body: formData,
    });

    if (res.success && res.data?.data) {
      revalidatePath('/dashboard/departments');
      revalidatePath('/[locale]/products', 'page');
      return { success: true, data: res.data.data };
    }

    return {
      success: false,
      error: res.error || (res.data ? formatApiErrorMessage(res.data) : 'فشل تعديل القسم'),
    };
  } catch (error) {
    console.error(`Error in updateDepartmentServerAction for id ${id}:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'حدث خطأ أثناء تعديل القسم',
    };
  }
}

/**
 * Deletes a department.
 *
 * The backend uses `on_delete=models.CASCADE` on `Product.department`, so
 * deleting a department deletes its products too. The UI confirms this before
 * calling; `count` is passed in so the warning can state the real number.
 */
export async function deleteDepartmentServerAction(
  id: string | number
): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await serverFetch<{ success: boolean; message: string }>(
      `/products/department/${id}/`,
      { method: 'DELETE' }
    );

    if (res.success) {
      revalidatePath('/dashboard/departments');
      revalidatePath('/[locale]/products', 'page');
      return { success: true };
    }

    return { success: false, error: res.error || 'فشل حذف القسم' };
  } catch (error) {
    console.error(`Error in deleteDepartmentServerAction for id ${id}:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'حدث خطأ أثناء حذف القسم',
    };
  }
}

