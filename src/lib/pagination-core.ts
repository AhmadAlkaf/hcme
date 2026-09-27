import {
  DEFAULT_PAGE_SIZE,
  MAX_PAGE_SIZE,
  type PaginationMeta,
} from '@/types/pagination';

/**
 * Pure pagination helpers shared by the server (`server-api.ts`) and the browser
 * (`pagination-params.ts`, the pagination components).
 *
 * This module must never import `next/headers` or anything else server-only: it
 * is pulled into Client Components, and a `next/headers` import anywhere in that
 * graph fails the production build.
 */

/**
 * Parses a query param that must contain a whole number.
 *
 * `Number.parseInt` is deliberately not used: it accepts trailing garbage
 * (`"2abc"` → `2`), which would let a malformed URL through as a valid page
 * number. The backend validates strictly, so a request built from `"2abc"`
 * could be rejected while the UI believed page 2 was selected.
 */
export function parseStrictInt(value: number | string | null | undefined): number | null {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? Math.trunc(value) : null;
  }
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  if (trimmed === '' || !/^[+-]?\d+$/.test(trimmed)) return null;
  const parsed = Number(trimmed);
  return Number.isSafeInteger(parsed) ? parsed : null;
}

/**
 * Clamps a requested page size into the range the backend accepts
 * (`page_size = 15` by default, `max_page_size = 100`).
 */
export function sanitizePageSize(size: number | string | null | undefined): number {
  const parsed = parseStrictInt(size);
  if (parsed === null || parsed < 1) return DEFAULT_PAGE_SIZE;
  return Math.min(parsed, MAX_PAGE_SIZE);
}

/**
 * Normalises a page number. The backend rejects anything below 1, non-numeric,
 * or out of range with "صفحة غير صحيحة.", so invalid input falls back to page 1.
 */
export function sanitizePage(page: number | string | null | undefined): number {
  const parsed = parseStrictInt(page);
  if (parsed === null || parsed < 1) return 1;
  return parsed;
}

/** Builds `PaginationMeta` from the fields the backend returns. */
export function buildMeta(input: {
  page: number | string | null | undefined;
  pageSize: number | string | null | undefined;
  count: number;
  next: number | null;
  previous: number | null;
}): PaginationMeta {
  const page = sanitizePage(input.page);
  const pageSize = sanitizePageSize(input.pageSize);
  const count = Number.isFinite(input.count) ? Math.max(0, Math.trunc(input.count)) : 0;
  const totalPages = count > 0 ? Math.ceil(count / pageSize) : 0;

  // `next` / `previous` are page numbers on the backend, so a non-null value is
  // an authoritative "there is an adjacent page" signal.
  const hasNext = input.next !== null && input.next !== undefined;
  const hasPrev = input.previous !== null && input.previous !== undefined;

  const from = count === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = count === 0 ? 0 : Math.min(page * pageSize, count);

  return { page, pageSize, count, totalPages, hasNext, hasPrev, from, to };
}
