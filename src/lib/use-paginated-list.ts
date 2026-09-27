'use client';

import { useCallback, useDeferredValue, useEffect, useState } from 'react';
import { EMPTY_META, type ListQueryParams, type PaginationMeta } from '@/types/pagination';

/**
 * A Server Action that fetches one page of a list endpoint.
 * Return type is `PaginatedResult<T> | null` (see the list Server Actions).
 */
export type ListFetcher<T> = (
  params?: ListQueryParams
) => Promise<{ items: T[]; meta: PaginationMeta } | null>;

export interface UsePaginatedListOptions {
  /**
   * Initial endpoint-specific filters (`status`, `agent`, ...). Prefer
   * `setFilter` over passing a new object each render, which would refetch.
   */
  filters?: Record<string, string | number | boolean | null | undefined>;
}

export interface UsePaginatedListResult<T> {
  items: T[];
  meta: PaginationMeta;
  loading: boolean;
  /** True during a page change, so the table can show a subtle progress state. */
  fetching: boolean;
  search: string;
  setSearch: (value: string) => void;
  setPage: (page: number) => void;
  setPageSize: (pageSize: number) => void;
  /** Current endpoint-specific filter values. */
  filters: Record<string, string | number | boolean | null | undefined>;
  /**
   * Updates one filter. Changing a filter resets to page 1, because the new
   * result set usually has fewer pages than the current one.
   */
  setFilter: (key: string, value: string | number | boolean | null | undefined) => void;
  /** 1-based index of the first row of the current page, for row numbering. */
  firstRowIndex: number;
  reload: () => void;
}

/**
 * Drives a paginated table backed by a list Server Action.
 *
 * Two behaviours matter here and are easy to get wrong by hand:
 *
 *  1. **Search is server-side.** Typing only updates local state until the
 *     debounce elapses, and the request that finally fires is for page 1 —
 *     staying on, say, page 7 of a previous term would ask the backend for a
 *     page that no longer exists and trip its strict page validation.
 *
 *  2. **Changing the page size also resets to page 1**, for the same reason:
 *     fewer rows per page means the old page number may now be out of range.
 */
export function usePaginatedList<T>(
  fetcher: ListFetcher<T>,
  options: UsePaginatedListOptions = {}
): UsePaginatedListResult<T> {
  const { filters: initialFilters } = options;

  const [items, setItems] = useState<T[]>([]);
  const [meta, setMeta] = useState<PaginationMeta>(EMPTY_META);
  const [loading, setLoading] = useState(true);
  const [fetching, setFetching] = useState(false);
  const [page, setPageState] = useState(1);
  const [pageSize, setPageSizeState] = useState<number | undefined>(undefined);
  const [search, setSearchState] = useState('');
  const [filters, setFilters] = useState<
    Record<string, string | number | boolean | null | undefined>
  >(initialFilters ?? {});
  const [reloadToken, setReloadToken] = useState(0);

  // `useDeferredValue` gives the same "wait until typing settles" behaviour as a
  // debounce timer, but without an extra render pass or a `setTimeout` effect,
  // and it keeps the input responsive while the request is in flight.
  const deferredSearch = useDeferredValue(search);

  // `page` and `search` are always updated together (see `setSearch`), so a new
  // term starts at page 1. Staying on page 7 of the previous term would ask the
  // backend for a page that no longer exists and trip its strict page validation.

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      setFetching(true);
      try {
        const result = await fetcher({
          page,
          pageSize,
          search: deferredSearch || undefined,
          filters,
        });
        if (cancelled) return;

        if (result) {
          setItems(result.items);
          setMeta(result.meta);
          setPageSizeState(result.meta.pageSize);
        } else {
          setItems([]);
          setMeta(EMPTY_META);
        }
      } catch (error) {
        if (cancelled) return;
        console.error('Error in usePaginatedList:', error);
        setItems([]);
        setMeta(EMPTY_META);
      } finally {
        if (!cancelled) {
          setFetching(false);
          setLoading(false);
        }
      }
    };

    void run();
    return () => {
      cancelled = true;
    };
  }, [fetcher, page, pageSize, deferredSearch, filters, reloadToken]);

  const setSearch = useCallback((value: string) => {
    setPageState(1);
    setSearchState(value);
  }, []);

  const setPage = useCallback((next: number) => {
    setPageState((current) => (next < 1 || next === current ? current : next));
  }, []);

  const setPageSize = useCallback((next: number) => {
    setPageSizeState((current) => {
      if (next === current) return current;
      setPageState(1);
      return next;
    });
  }, []);

  const setFilter = useCallback(
    (key: string, value: string | number | boolean | null | undefined) => {
      setFilters((current) => {
        if (current[key] === value) return current;
        // A narrower result set usually has fewer pages, so the current page
        // number may no longer exist.
        setPageState(1);
        return { ...current, [key]: value };
      });
    },
    []
  );

  const reload = useCallback(() => setReloadToken((token) => token + 1), []);

  return {
    items,
    meta,
    loading,
    fetching,
    search,
    setSearch,
    setPage,
    setPageSize,
    filters,
    setFilter,
    firstRowIndex: meta.from,
    reload,
  };
}
