'use client';

import React, { useCallback, useMemo } from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PAGE_SIZE_OPTIONS, type PaginationMeta } from '@/types/pagination';

export interface PaginationLabels {
  showing: string;
  of: string;
  items: string;
  page: string;
  perPage: string;
  previous: string;
  next: string;
  first: string;
  last: string;
  pageOf: string;
  goTo: string;
}

const DEFAULT_LABELS: PaginationLabels = {
  showing: 'عرض',
  of: 'من',
  items: 'عنصر',
  page: 'صفحة',
  perPage: 'عدد العناصر',
  previous: 'الصفحة السابقة',
  next: 'الصفحة التالية',
  first: 'الصفحة الأولى',
  last: 'الصفحة الأخيرة',
  pageOf: 'صفحة',
  goTo: 'انتقل إلى',
};

export interface PaginationProps {
  meta: PaginationMeta;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  /** Number of page buttons shown on each side of the current page. */
  siblings?: number;
  /** Number of page buttons always pinned to each end. */
  boundaries?: number;
  showSizeSelector?: boolean;
  className?: string;
  labels?: Partial<PaginationLabels>;
  /** Distinguishes multiple paginations on one screen for screen readers. */
  idPrefix?: string;
}

/**
 * Builds the sliding window of page numbers to render, inserting an ELLIPSIS
 * marker wherever a gap is skipped.
 *
 * Guarantees: every page appears at most once, the output is strictly
 * ascending, page 1 and the last page are always anchored, and the current page
 * is always present.
 *
 * Example: totalPages=12, current=6, siblings=1, boundaries=1
 *   → 1, ELLIPSIS, 5, 6, 7, ELLIPSIS, 12
 */
export const ELLIPSIS = 'ellipsis' as const;
export type PageRangeItem = number | typeof ELLIPSIS;

function buildPageRange(
  current: number,
  totalPages: number,
  siblings: number,
  boundaries: number
): PageRangeItem[] {
  if (totalPages <= 0) return [];

  // Widest window we are willing to render without using an ellipsis:
  // `boundaries` start + `siblings*2+1` around current + `boundaries` end
  // + 2 ellipsis markers.
  const maxButtons = siblings * 2 + boundaries * 2 + 3;

  const shown = new Set<number>();
  const add = (n: number) => {
    if (n >= 1 && n <= totalPages) shown.add(n);
  };

  if (totalPages <= maxButtons) {
    for (let i = 1; i <= totalPages; i++) add(i);
  } else {
    for (let i = 1; i <= boundaries; i++) add(i);
    for (let i = totalPages - boundaries + 1; i <= totalPages; i++) add(i);
    for (let i = current - siblings; i <= current + siblings; i++) add(i);
    add(current);
  }

  const sorted = [...shown].sort((a, b) => a - b);
  const items: PageRangeItem[] = [];
  sorted.forEach((page, idx) => {
    if (idx > 0 && page - sorted[idx - 1] > 1) items.push(ELLIPSIS);
    items.push(page);
  });

  return items;
}

export function Pagination({
  meta,
  onPageChange,
  onPageSizeChange,
  siblings = 1,
  boundaries = 1,
  showSizeSelector = true,
  className,
  labels,
  idPrefix = 'pagination',
}: PaginationProps) {
  const t = useMemo(() => ({ ...DEFAULT_LABELS, ...labels }), [labels]);

  const { page, pageSize, count, totalPages, from, to } = meta;
  const showSizeSelect = showSizeSelector && !!onPageSizeChange;
  const showControls = totalPages > 0;
  const showSummary = count > 0;

  const goTo = useCallback(
    (target: number) => {
      if (target < 1 || target > totalPages) return;
      if (target === page) return;
      onPageChange(target);
    },
    [onPageChange, page, totalPages]
  );

  if (!showControls) return null;

  const range = buildPageRange(page, totalPages, siblings, boundaries);
  const navId = `${idPrefix}-nav`;

  return (
    <div
      className={cn(
        'flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between',
        className
      )}
    >
      {/* Summary + size selector */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
        {showSummary && (
          <p className="text-xs font-bold text-muted-foreground">
            {t.showing} <span className="text-foreground">{from}</span>
            {' – '}
            <span className="text-foreground">{to}</span>
            {t.of} <span className="text-foreground">{count}</span> {t.items}
          </p>
        )}

        {showSizeSelect && (
          <div className="flex items-center gap-2">
            <label
              htmlFor={`${idPrefix}-size`}
              className="text-xs font-bold text-muted-foreground whitespace-nowrap"
            >
              {t.perPage}
            </label>
            <select
              id={`${idPrefix}-size`}
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className="px-3 py-1.5 rounded-xl bg-background border border-input text-xs font-bold text-foreground focus:ring-2 focus:ring-primary focus:outline-none"
            >
              {PAGE_SIZE_OPTIONS.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Page controls */}
      {totalPages > 1 && (
        <nav
          id={navId}
          aria-label={t.page}
          className="flex items-center gap-1.5 flex-wrap"
        >
          <PageButton
            label={t.first}
            disabled={!meta.hasPrev}
            onClick={() => goTo(1)}
            srLabel={t.first}
          >
            <ChevronsLeft className="w-4 h-4" />
          </PageButton>

          <PageButton
            label={t.previous}
            disabled={!meta.hasPrev}
            onClick={() => goTo(page - 1)}
            srLabel={t.previous}
          >
            <ChevronLeft className="w-4 h-4" />
          </PageButton>

          {range.map((entry, idx) => {
            if (entry === ELLIPSIS) {
              return (
                <span
                  key={`ellipsis-${idx}`}
                  aria-hidden="true"
                  className="px-1.5 text-muted-foreground text-xs font-black select-none"
                >
                  …
                </span>
              );
            }

            const isCurrent = entry === page;
            return (
              <button
                key={entry}
                type="button"
                onClick={() => goTo(entry)}
                aria-current={isCurrent ? 'page' : undefined}
                aria-label={`${t.page} ${entry}`}
                className={cn(
                  'min-w-9 h-9 px-2.5 rounded-xl text-xs font-black transition-all border',
                  isCurrent
                    ? 'bg-primary text-primary-foreground border-primary shadow-md shadow-primary/20'
                    : 'bg-card text-muted-foreground border-border hover:bg-muted hover:text-foreground'
                )}
              >
                {entry}
              </button>
            );
          })}

          <PageButton
            label={t.next}
            disabled={!meta.hasNext}
            onClick={() => goTo(page + 1)}
            srLabel={t.next}
          >
            <ChevronRight className="w-4 h-4" />
          </PageButton>

          <PageButton
            label={t.last}
            disabled={!meta.hasNext}
            onClick={() => goTo(totalPages)}
            srLabel={t.last}
          >
            <ChevronsRight className="w-4 h-4" />
          </PageButton>
        </nav>
      )}
    </div>
  );
}

interface PageButtonProps {
  label: string;
  srLabel: string;
  disabled: boolean;
  onClick: () => void;
  children: React.ReactNode;
}

function PageButton({ label, srLabel, disabled, onClick, children }: PageButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={srLabel}
      aria-label={srLabel}
      className={cn(
        'h-9 px-2.5 rounded-xl border transition-all flex items-center',
        disabled
          ? 'bg-muted/40 border-border text-muted-foreground/40 cursor-not-allowed'
          : 'bg-card border-border text-muted-foreground hover:bg-muted hover:text-foreground'
      )}
    >
      <span className="sr-only">{label}</span>
      {children}
    </button>
  );
}

export default Pagination;
