import { DEFAULT_PAGE_SIZE, type PaginationMeta } from '@/types/pagination';
import { buildMeta, sanitizePage, sanitizePageSize } from '@/lib/pagination-core';

/**
 * URL-driven pagination state.
 *
 * Pagination state lives entirely in the query string (`?page=&page_size=&search=`)
 * so that:
 *  - links are shareable and bookmarkable
 *  - the browser back/forward buttons step through pages
 *  - a refresh keeps the user on the same page
 *  - Server Components can read the state directly
 */

/** Next.js `searchParams` value type. */
export type RawSearchParams = Record<string, string | string[] | undefined>;

/** Reads a single-valued param, collapsing `?a=1&a=2` to the first value. */
export function readParam(params: RawSearchParams | undefined, key: string): string | undefined {
  if (!params) return undefined;
  const value = params[key];
  if (Array.isArray(value)) return value[0];
  return value;
}

/** Validated pagination state read from a `searchParams` object. */
export interface ParsedPagination {
  page: number;
  pageSize: number;
  search: string;
  /** Everything else in the query string, preserved when building new links. */
  rest: Record<string, string>;
}

/**
 * Parses `page` / `page_size` / `search` out of `searchParams`.
 *
 * `rest` keeps unrelated params (`agent`, `status`, ...) so that changing the
 * page does not silently drop an active filter.
 */
export function parsePaginationParams(
  params: RawSearchParams | undefined,
  options?: { keep?: string[] }
): ParsedPagination {
  const page = sanitizePage(readParam(params, 'page'));
  const pageSize = sanitizePageSize(readParam(params, 'page_size'));
  const search = (readParam(params, 'search') ?? '').trim();

  const rest: Record<string, string> = {};
  if (params) {
    for (const [key, raw] of Object.entries(params)) {
      if (key === 'page' || key === 'page_size' || key === 'search') continue;
      if (options?.keep && !options.keep.includes(key)) continue;
      const value = Array.isArray(raw) ? raw[0] : raw;
      if (value) rest[key] = value;
    }
  }

  return { page, pageSize, search, rest };
}

/**
 * Builds a href for the current path with updated pagination state.
 *
 * `page` defaults to 1 and `pageSize` to the backend default, so the common
 * "first page, default size" link stays a clean URL with no query string.
 * Any param explicitly set to `undefined` or `''` is removed.
 */
export function buildPaginationHref(
  basePath: string,
  overrides: {
    page?: number | null;
    pageSize?: number | null;
    search?: string | null;
    extra?: Record<string, string | number | null | undefined>;
  } = {}
): string {
  const searchParams = new URLSearchParams();

  if (overrides.extra) {
    for (const [key, value] of Object.entries(overrides.extra)) {
      if (value === null || value === undefined || value === '') continue;
      searchParams.set(key, String(value));
    }
  }

  // Trimmed before use: a whitespace-only term is truthy, so without this it
  // would be forwarded to the backend as a filter that matches nothing.
  const search = overrides.search?.trim();
  if (search) searchParams.set('search', search);

  const page = overrides.page === null || overrides.page === undefined
    ? 1
    : sanitizePage(overrides.page);
  if (page > 1) searchParams.set('page', String(page));

  const pageSize = overrides.pageSize === null || overrides.pageSize === undefined
    ? DEFAULT_PAGE_SIZE
    : sanitizePageSize(overrides.pageSize);
  if (pageSize !== DEFAULT_PAGE_SIZE) searchParams.set('page_size', String(pageSize));

  const query = searchParams.toString();
  return query ? `${basePath}?${query}` : basePath;
}

/**
 * Decides whether the response tells us the requested page does not exist.
 *
 * The backend answers an out-of-range page with
 * `{ success: false, message: "صفحة غير صحيحة." }` rather than an empty page,
 * so an out-of-range URL produces a broken table instead of an empty one.
 * Detecting it lets the page redirect to a valid page instead.
 */
export function isPageOutOfRange(meta: PaginationMeta): boolean {
  return meta.count > 0 && meta.page > meta.totalPages;
}

/**
 * Recomputes `PaginationMeta` for a *different* page without refetching, using
 * the `count` already known from the current response.
 *
 * Used after a create/delete to keep the footer numbers consistent, and by
 * client components that already hold the total.
 */
export function deriveMetaForPage(
  meta: PaginationMeta,
  page: number
): PaginationMeta {
  return buildMeta({
    page,
    pageSize: meta.pageSize,
    count: meta.count,
    next: page < meta.totalPages ? page + 1 : null,
    previous: page > 1 ? page - 1 : null,
  });
}

/**
 * Returns the href the browser should be sent to when the served page differs
 * from the one in the URL, or `null` when the URL is already correct.
 *
 * `serverListFetch` transparently retries an out-of-range page as page 1, so a
 * stale `?page=` (a bookmark, a shared link, a page that disappeared after a
 * record was deleted) serves page 1's data. Without a redirect the address bar
 * would still claim the old page and the pagination footer would highlight
 * nothing, which reads as a broken page. Redirecting makes the URL canonical and
 * lets the link be re-shared safely.
 */
export function buildCorrectedPageHref(options: {
  basePath: string;
  requestedPage: number;
  meta: PaginationMeta;
  search?: string;
  extra?: Record<string, string | number | null | undefined>;
}): string | null {
  if (options.meta.page === options.requestedPage) return null;

  return buildPaginationHref(options.basePath, {
    page: options.meta.page,
    pageSize: options.meta.pageSize,
    search: options.search ?? null,
    extra: options.extra,
  });
}
