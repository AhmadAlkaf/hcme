import { cookies } from 'next/headers';
import {
  DEFAULT_PAGE_SIZE,
  EMPTY_META,
  type ListQueryParams,
  type PaginatedResult,
} from '@/types/pagination';
import { buildMeta, sanitizePage, sanitizePageSize } from '@/lib/pagination-core';

// Re-exported so Server Actions can keep importing the pagination helpers from
// their original module; the implementations live in a client-safe file.
export { buildMeta, sanitizePage, sanitizePageSize } from '@/lib/pagination-core';

/**
 * Returns the Base API URL configured in Environment Variables.
 */
export function getApiBaseUrl(): string {
  return (
    process.env.API_BASE_URL ||
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    'https://api.hmecelctric.com'
  );
}


/**
 * Builds the query string for a paginated list endpoint.
 *
 * When `params.all` is true it emits `pagination=false`, which makes the
 * backend skip `paginate_queryset()` and return a bare array. That is how we
 * fetch *every* record for dropdowns and counters, instead of only the first
 * page of 15.
 */
export function buildListQuery(params?: ListQueryParams): string {
  const searchParams = new URLSearchParams();

  // Endpoint-specific filters (`agent`, `status`, ...) are forwarded verbatim.
  if (params?.filters) {
    for (const [key, value] of Object.entries(params.filters)) {
      if (value === null || value === undefined || value === '') continue;
      searchParams.set(key, String(value));
    }
  }

  if (params?.all) {
    searchParams.set('pagination', 'false');
  } else {
    const page = sanitizePage(params?.page);
    const pageSize = sanitizePageSize(params?.pageSize);
    if (page > 1) searchParams.set('page', String(page));
    if (pageSize !== DEFAULT_PAGE_SIZE) searchParams.set('page_size', String(pageSize));
  }

  if (params?.search) searchParams.set('search', params.search);

  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : '';
}


/**
 * Extracts `{ items, meta }` from any list endpoint response.
 *
 * Handles both shapes the backend can return:
 *  - the pagination envelope `{ next, previous, count, results }`
 *  - a bare array (when the request used `?pagination=false`)
 *
 * Also tolerates a raw array at the top level, so callers never have to
 * unwrap `data` by hand.
 */
export function normalizeListResponse<T>(
  payload: unknown,
  input: { page?: number | string | null; pageSize?: number | string | null } = {}
): PaginatedResult<T> {
  const pageSize = sanitizePageSize(input.pageSize);
  const empty: PaginatedResult<T> = { items: [], meta: { ...EMPTY_META, pageSize } };

  if (payload === null || payload === undefined) return empty;

  // Unwrap `{ success, message, data }` when present.
  let data: unknown = payload;
  if (!Array.isArray(data) && typeof data === 'object') {
    const record = data as Record<string, unknown>;
    if ('data' in record) data = record.data;
  }

  // Bare array — either `?pagination=false` or a non-paginated endpoint.
  if (Array.isArray(data)) {
    const count = data.length;
    return {
      items: data as T[],
      meta: {
        page: 1,
        pageSize: count || pageSize,
        count,
        totalPages: count > 0 ? 1 : 0,
        hasNext: false,
        hasPrev: false,
        from: count > 0 ? 1 : 0,
        to: count,
      },
    };
  }

  if (typeof data !== 'object') return empty;

  const envelope = data as Record<string, unknown>;
  const results = Array.isArray(envelope.results) ? (envelope.results as T[]) : [];
  const rawCount = envelope.count;
  const count = typeof rawCount === 'number' ? rawCount : results.length;

  return {
    items: results,
    meta: buildMeta({
      page: input.page,
      pageSize: input.pageSize,
      count,
      next: typeof envelope.next === 'number' ? envelope.next : null,
      previous: typeof envelope.previous === 'number' ? envelope.previous : null,
    }),
  };
}

/**
 * Retrieves the Auth token from cookies or headers.
 * Checks for 'auth_token', 'access_token', or 'token'.
 */
export async function getAuthToken(): Promise<string | null> {
  try {
    const cookieStore = await cookies();
    const token =
      cookieStore.get('auth_token')?.value ||
      cookieStore.get('access_token')?.value ||
      cookieStore.get('token')?.value;

    return token || null;
  } catch (e) {
    return null;
  }
}

/**
 * Verifies if a valid token exists in the request cookies.
 * Can be extended to validate JWT expiration or user role.
 */
export async function isUserAuthenticated(): Promise<boolean> {
  const token = await getAuthToken();
  return !!token;
}

/**
 * Constructs standard HTTP headers for server requests,
 * automatically injecting Authorization Bearer token if present.
 */
export async function getAuthHeaders(extraHeaders?: HeadersInit): Promise<HeadersInit> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };

  const token = await getAuthToken();
  if (token) {
    headers['Authorization'] = `Token ${token}`;
  }

  if (extraHeaders) {
    if (extraHeaders instanceof Headers) {
      extraHeaders.forEach((value, key) => {
        headers[key] = value;
      });
    } else if (Array.isArray(extraHeaders)) {
      extraHeaders.forEach(([key, value]) => {
        headers[key] = value;
      });
    } else {
      Object.assign(headers, extraHeaders);
    }
  }

  return headers;
}

 
export function formatApiErrorMessage(errJson: unknown): string {
  if (!errJson) return 'حدث خطأ في السيرفر';
  if (typeof errJson === 'string') return errJson;

  let mainMessage = '';
  if (errJson && typeof errJson === 'object') {
    const obj = errJson as Record<string, unknown>;
    if (obj.message && typeof obj.message === 'string') {
      mainMessage = obj.message;
    } else if (obj.detail && typeof obj.detail === 'string') {
      mainMessage = obj.detail;
    } else if (obj.error && typeof obj.error === 'string') {
      mainMessage = obj.error;
    }
  }

  let fieldErrorsFormatted = '';
  const obj = typeof errJson === 'object' && errJson !== null ? (errJson as Record<string, unknown>) : {};
  const rawErrors = obj.errors || (obj.error && typeof obj.error === 'object' ? obj.error : null);

  const extractValues = (errorsObj: Record<string, any>): string => {
    const errorValues: string[] = [];
    for (const [key, val] of Object.entries(errorsObj)) {
      if (key === 'success' || key === 'status') continue;
      let valStr = '';
      if (Array.isArray(val)) {
        valStr = val.map((v) => (typeof v === 'object' ? JSON.stringify(v) : String(v))).join(', ');
      } else if (typeof val === 'object' && val !== null) {
        valStr = JSON.stringify(val);
      } else {
        valStr = String(val);
      }
      valStr = valStr.trim();
      if (valStr && !errorValues.includes(valStr)) {
        errorValues.push(valStr);
      }
    }
    return errorValues.join(' | ');
  };

  if (rawErrors) {
    if (typeof rawErrors === 'string') {
      fieldErrorsFormatted = rawErrors;
    } else if (typeof rawErrors === 'object' && rawErrors !== null) {
      fieldErrorsFormatted = extractValues(rawErrors);
    }
  }

  if (mainMessage && fieldErrorsFormatted) {
    return `${mainMessage}\n${fieldErrorsFormatted}`;
  }
  if (mainMessage) return mainMessage;
  if (fieldErrorsFormatted) return fieldErrorsFormatted;

  // Fallback for direct field dictionary responses without message/errors wrapper: e.g. { "image": "..." }
  if (typeof errJson === 'object' && errJson !== null) {
    const fallbackVals = extractValues(errJson);
    if (fallbackVals) return fallbackVals;
  }

  return 'حدث خطأ غير معروف في السيرفر';
}

/**
 * Global Server Fetch Wrapper for Server Actions & Server Components.
 * Prepends Base API URL, injects Auth Headers, handles errors and returns typed responses.
 */
export async function serverFetch<T>(
  endpoint: string,
  options?: RequestInit & { requiresAuth?: boolean }
): Promise<{ success: boolean; data?: T; error?: string; status?: number }> {
  try {
    const baseUrl = getApiBaseUrl();
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    const fullUrl = endpoint.startsWith('http') ? endpoint : `${baseUrl}${cleanEndpoint}`;

    if (options?.requiresAuth) {
      const isAuth = await isUserAuthenticated();
      if (!isAuth) {
        return { success: false, error: 'Unauthorized: User is not logged in', status: 401 };
      }
    }

    const authHeaders = await getAuthHeaders(options?.headers);

    // If the body is FormData, do not set Content-Type header so the browser/runtime
    // can set it automatically with the correct multipart boundary
    const isFormData =
      options?.body instanceof FormData ||
      (options?.body &&
        typeof options.body === 'object' &&
        typeof (options.body as unknown as FormData).append === 'function' &&
        typeof (options.body as unknown as FormData).get === 'function');

    if (isFormData) {
      if (authHeaders instanceof Headers) {
        authHeaders.delete('Content-Type');
        authHeaders.delete('content-type');
      } else if (typeof authHeaders === 'object' && authHeaders !== null) {
        delete (authHeaders as Record<string, string>)['Content-Type'];
        delete (authHeaders as Record<string, string>)['content-type'];
      }
    }

    const response = await fetch(fullUrl, {
      ...options,
      headers: authHeaders,
    });

    if (!response.ok) {
      let serverErrorMessage = `خطأ في السيرفر (${response.status}): ${response.statusText}`;
      try {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const errJson = await response.json();
          if (errJson) {
            serverErrorMessage = formatApiErrorMessage(errJson);
          }
        } else {
          const errText = await response.text();
          if (errText && errText.length < 300) {
            serverErrorMessage = errText;
          }
        }
      } catch (e) {
        // Fallback to generic message if parsing fails
      }

      return {
        success: false,
        error: serverErrorMessage,
        status: response.status,
      };
    }

    if (response.status === 204 || response.status === 205) {
      return { success: true, status: response.status };
    }

    const text = await response.text();
    const data: T = text ? JSON.parse(text) : ({} as T);

    if (data && typeof data === 'object' && (data as Record<string, unknown>).success === false) {
      const serverErrorMessage = formatApiErrorMessage(data);
      return {
        success: false,
        error: serverErrorMessage,
        data,
        status: response.status,
      };
    }

    return { success: true, data, status: response.status };
  } catch (error) {
    console.error(`serverFetch error for endpoint [${endpoint}]:`, error);
    return {
      success: false,
      error: (error instanceof Error ? error.message : undefined) || 'حدث خطأ في الاتصال بالسيرفر',
    };
  }
}

/**
 * The backend answers an out-of-range / non-numeric / sub-1 page with
 * `{ success: false, message: "صفحة غير صحيحة." }` instead of an empty page.
 * Detect it so callers can redirect to a valid page rather than showing an
 * empty table.
 */
export function isInvalidPageError(error: string | undefined): boolean {
  if (!error) return false;
  return error.includes('صفحة غير صحيحة') || error.toLowerCase().includes('invalid page');
}

/** Options accepted by the list helpers, including the `requiresAuth` flag. */
export type ServerFetchOptions = RequestInit & { requiresAuth?: boolean };

/**
 * Convenience wrapper for every paginated list endpoint.
 *
 * Combines `serverFetch` + `buildListQuery` + `normalizeListResponse` so each
 * Server Action only has to supply its endpoint path.
 *
 * An out-of-range page is retried as page 1. The backend answers such a request
 * with "صفحة غير صحيحة." rather than an empty page, so without this a stale
 * `?page=` (a bookmark, a link shared after records were deleted, a page that
 * no longer exists after a narrower search) would render an empty table and look
 * like data loss. Retrying here means no individual page has to handle it.
 */
export async function serverListFetch<T>(
  endpoint: string,
  params?: ListQueryParams,
  options?: ServerFetchOptions
): Promise<{ success: boolean; data?: PaginatedResult<T>; error?: string; status?: number }> {
  const basePath = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;

  const request = async (
    page: number | string | null | undefined
  ): Promise<{ success: boolean; data?: PaginatedResult<T>; error?: string; status?: number }> => {
    const query = buildListQuery({ ...params, page });
    const res = await serverFetch<unknown>(`${basePath}${query}`, {
      ...options,
      method: options?.method ?? 'GET',
    });

    if (!res.success) {
      return { success: false, error: res.error, status: res.status };
    }

    return {
      success: true,
      data: normalizeListResponse<T>(res.data, { page, pageSize: params?.pageSize }),
    };
  };

  const result = await request(params?.page);

  // `all: true` never sends a page number, so only paginated requests can fail
  // this way.
  if (!result.success && !params?.all && isInvalidPageError(result.error) && sanitizePage(params?.page) > 1) {
    return request(1);
  }

  return result;
}

/**
 * Fetches *every* record from a list endpoint by sending `?pagination=false`.
 *
 * Required for dropdowns and counters: without it the backend would cap them at
 * the first page (15 records by default), silently hiding options.
 */
export async function serverFetchAll<T>(
  endpoint: string,
  options?: ServerFetchOptions
): Promise<{ success: boolean; items: T[]; error?: string }> {
  // Delegated to `serverListFetch` so the `?pagination=false` query is built the
  // same way as everywhere else. Concatenating `?pagination=false` by hand would
  // produce a second `?` for any endpoint that already carries a query string.
  const res = await serverListFetch<T>(endpoint, { all: true }, options);

  if (!res.success || !res.data) {
    return { success: false, items: [], error: res.error };
  }

  return { success: true, items: res.data.items };
}


