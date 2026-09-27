'use client';

import { Suspense } from 'react';
import { Pagination, type PaginationLabels, type PaginationProps } from '@/components/ui/Pagination';
import { useUrlPagination } from '@/lib/use-url-pagination';
import type { PaginationMeta } from '@/types/pagination';

export interface ServerPaginationProps {
  meta: PaginationMeta;
  /** Absolute or relative path of the current page, e.g. `/dashboard/bills`. */
  basePath: string;
  siblings?: PaginationProps['siblings'];
  boundaries?: PaginationProps['boundaries'];
  showSizeSelector?: PaginationProps['showSizeSelector'];
  labels?: Partial<PaginationLabels>;
  className?: string;
  idPrefix?: string;
}

/**
 * Pagination for Server Components.
 *
 * Server-rendered pages cannot pass `onPageChange` callbacks down to a client
 * component, so this reads and writes the URL instead. The page and page size
 * live in the query string, which means every control is a real link: it works
 * with JS disabled, supports middle-click/open-in-new-tab, and keeps the browser
 * back button working.
 *
 * `useUrlPagination` provides the callbacks while the markup stays identical to
 * the interactive `<Pagination>`.
 */
export function ServerPagination({
  meta,
  basePath,
  siblings,
  boundaries,
  showSizeSelector,
  labels,
  className,
  idPrefix = 'pagination',
}: ServerPaginationProps) {
  return (
    // `useSearchParams` inside `useUrlPagination` opts the subtree into
    // client-side rendering, which requires a Suspense boundary.
    <Suspense fallback={null}>
      <UrlPaginationControls
        meta={meta}
        basePath={basePath}
        siblings={siblings}
        boundaries={boundaries}
        showSizeSelector={showSizeSelector}
        labels={labels}
        className={className}
        idPrefix={idPrefix}
      />
    </Suspense>
  );
}

function UrlPaginationControls({
  meta,
  basePath,
  siblings,
  boundaries,
  showSizeSelector,
  labels,
  className,
  idPrefix,
}: ServerPaginationProps) {
  const { setPage, setPageSize } = useUrlPagination(meta, basePath);

  return (
    <Pagination
      meta={meta}
      onPageChange={setPage}
      onPageSizeChange={setPageSize}
      siblings={siblings}
      boundaries={boundaries}
      showSizeSelector={showSizeSelector}
      labels={labels}
      className={className}
      idPrefix={idPrefix}
    />
  );
}

/**
 * Builds the href for a single page, preserving every other query param.
 * Exported for pages that need a "back to first page" link, e.g. after an error.
 */
export function pageHref(basePath: string, page: number, pageSize?: number): string {
  const params = new URLSearchParams();
  if (page > 1) params.set('page', String(page));
  if (pageSize && pageSize !== 15) params.set('page_size', String(pageSize));
  const query = params.toString();
  return query ? `${basePath}?${query}` : basePath;
}

export default ServerPagination;
