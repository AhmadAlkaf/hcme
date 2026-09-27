'use client';

import { useCallback, useMemo, useTransition } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import type { PaginationMeta } from '@/types/pagination';
import { buildPaginationHref, parsePaginationParams } from '@/lib/pagination-params';

/**
 * Wires a `<Pagination>` component to the URL query string.
 *
 * Page and page-size live in the URL, which keeps links shareable and makes the
 * browser back button step through pages. `search` is passed back to the caller
 * as a callback because the debounce policy differs per screen.
 */
export function useUrlPagination(meta: PaginationMeta, basePath?: string) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const path = basePath ?? pathname;

  // Recomputed whenever the URL changes, so the component always reflects the
  // address bar even if the user navigates with the back button.
  const parsed = useMemo(
    () => parsePaginationParams(Object.fromEntries(searchParams.entries())),
    [searchParams]
  );

  const push = useCallback(
    (href: string) => {
      startTransition(() => {
        router.push(href, { scroll: false });
      });
    },
    [router]
  );

  const setPage = useCallback(
    (page: number) => {
      if (page === meta.page) return;
      push(
        buildPaginationHref(path, {
          page,
          pageSize: meta.pageSize,
          // `search` is carried over: paging through results must not silently
          // drop the active filter and show unfiltered rows instead.
          search: parsed.search,
          extra: parsed.rest,
        })
      );
    },
    [meta.page, meta.pageSize, parsed.rest, parsed.search, path, push]
  );

  const setPageSize = useCallback(
    (pageSize: number) => {
      push(
        buildPaginationHref(path, {
          // A new page size changes how many rows exist per page, so going back
          // to page 1 avoids landing on a page that no longer exists.
          page: 1,
          pageSize,
          search: parsed.search,
          extra: parsed.rest,
        })
      );
    },
    [parsed.rest, parsed.search, path, push]
  );

  const setSearch = useCallback(
    (search: string) => {
      push(
        buildPaginationHref(path, {
          // A new search term changes the result set entirely, so reset to page 1.
          page: 1,
          pageSize: meta.pageSize,
          search: search.trim() || null,
          extra: parsed.rest,
        })
      );
    },
    [meta.pageSize, parsed.rest, path, push]
  );

  return {
    page: parsed.page,
    pageSize: parsed.pageSize,
    search: parsed.search,
    setPage,
    setPageSize,
    setSearch,
    isPending,
  };
}
