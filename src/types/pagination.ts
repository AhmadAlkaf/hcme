/**
 * Pagination contract for the whole app.
 *
 * The backend (Django REST Framework) uses a custom pagination class:
 *
 *     class CustomPagination(pagination.PageNumberPagination):
 *         page_size = 15
 *         page_size_query_param = 'page_size'
 *         max_page_size = 100
 *
 *         def paginate_queryset(self, queryset, request, view=None):
 *             should_paginate = request.query_params.get('pagination', 'true').lower()
 *             if should_paginate == 'false':
 *                 return None
 *             return super().paginate_queryset(queryset, request, view)
 *
 * Key consequences encoded in the constants below:
 *  - Default page size is 15, and the backend silently clamps anything above 100.
 *  - `?pagination=false` disables pagination and returns a bare JSON array.
 *  - The backend validates `page` strictly: a page below 1, non-numeric, or out
 *    of range responds with `{ success: false, message: "صفحة غير صحيحة." }`
 *    instead of an empty result set. Never request an out-of-range page.
 */

/** Must stay in sync with `CustomPagination.page_size` on the backend. */
export const DEFAULT_PAGE_SIZE = 15;

/** Must stay in sync with `CustomPagination.max_page_size` on the backend. */
export const MAX_PAGE_SIZE = 100;

/**
 * Page sizes offered in the UI. The last entry matches the backend ceiling so
 * a user can never request a size that gets silently clamped.
 */
export const PAGE_SIZE_OPTIONS = [15, 30, 50, 100] as const;

/**
 * Client-side pagination state derived from a list response.
 * `count` is the total number of records across every page.
 */
export interface PaginationMeta {
  /** Current page number, 1-based. */
  page: number;
  /** Number of records requested per page (already clamped to MAX_PAGE_SIZE). */
  pageSize: number;
  /** Total number of records on the server. */
  count: number;
  /** `Math.ceil(count / pageSize)`, and 0 when there are no records. */
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
  /** 1-based index of the first record on the current page (0 when empty). */
  from: number;
  /** 1-based index of the last record on the current page (0 when empty). */
  to: number;
}

/** Raw `?page=` / `?page_size=` input, before validation. */
export interface PaginationInput {
  page?: number | string | null;
  pageSize?: number | string | null;
}

/**
 * Params every paginated Server Action accepts.
 *
 * `all: true` sends `?pagination=false` and returns every record. Use it for
 * dropdowns and counters — never for a table that should be paginated.
 *
 * `filters` carries endpoint-specific query params (`agent`, `status`, ...).
 * They are forwarded untouched, so callers can add a filter without every
 * Server Action needing to declare it.
 */
export interface ListQueryParams extends PaginationInput {
  search?: string;
  all?: boolean;
  /** Extra query params forwarded to the backend as-is. */
  filters?: Record<string, string | number | boolean | null | undefined>;
}

/** Normalised `{ items, meta }` payload returned by list Server Actions. */
export interface PaginatedResult<T> {
  items: T[];
  meta: PaginationMeta;
}

export const EMPTY_META: PaginationMeta = {
  page: 1,
  pageSize: DEFAULT_PAGE_SIZE,
  count: 0,
  totalPages: 0,
  hasNext: false,
  hasPrev: false,
  from: 0,
  to: 0,
};
