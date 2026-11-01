'use client';

import { useState, useMemo, useEffect, useCallback, useRef, useTransition } from 'react';
import { ServerPagination } from '@/components/ui/ServerPagination';
import type { PaginationMeta } from '@/types/pagination';
import type { ApiProduct, ApiContent } from '@/types/api';
import type { AgentGroup } from '@/lib/products';
import { cn } from '@/lib/utils';
import { useTranslations, useLocale } from 'next-intl';
import { Search, ArrowLeft, ArrowRight, Package, SlidersHorizontal, ChevronDown, Loader2 } from 'lucide-react';
import { Link } from '@/i18n/routing';
import SectionHeader from '@/components/ui/SectionHeader';
import ProductCard from '@/components/products/ProductCard';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';

interface ProductsProps {
  products?: ApiProduct[];
  content?: ApiContent;
  isHomePage?: boolean;
  /** Agency rows with their departments nested, derived from the departments. */
  agentGroups?: AgentGroup[];
  selectedDepartmentId?: string;
  /** Server-side totals. Omitted on the homepage, which shows only 3 products. */
  meta?: PaginationMeta;
  /** Locale-aware path used to build the pagination links. */
  basePath?: string;
}

export default function Products({
  products = [],
  isHomePage = false,
  agentGroups = [],
  selectedDepartmentId,
  meta,
  basePath,
}: ProductsProps) {
  const tProducts = useTranslations('Products');
  const tCommon = useTranslations('Common');
  const tPagination = useTranslations('Pagination');
  const kind = 'products';
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const searchParamValue = searchParams.get('search') || '';

  // Keep the input in sync with the URL, so back/forward navigation and shared
  // `?search=` links show the term that is actually being applied. Adjusting
  // during render (rather than in an effect) only fires when the URL value
  // really changed, so typing is never overwritten.
  const [syncedSearchParam, setSyncedSearchParam] = useState(searchParamValue);
  if (syncedSearchParam !== searchParamValue) {
    setSyncedSearchParam(searchParamValue);
    setSearchQuery(searchParamValue);
  }
  // `isPending` is true while a search/filter navigation is in flight, so the
  // input and the counter can show that the page is updating.
  const [isPending, startTransition] = useTransition();

  // Which agency rows are expanded. This is view state only — it must not live
  // in the URL, because revealing a row is not a filter change.
  const [expandedGroups, setExpandedGroups] = useState<string[]>([]);

  const toggleGroup = (key: string) => {
    setExpandedGroups((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  // Applies the current search term to the URL. Kept separate from the debounce
  // so pressing Enter can apply it immediately.
  const pushSearch = useCallback(
    (value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value.trim()) {
        params.set('search', value);
      } else {
        params.delete('search');
      }

      // Only navigate if the search param actually changed
      if (params.get('search') !== searchParams.get('search')) {
        // A new search term changes the result set, so the current page number
        // may be out of range.
        params.delete('page');
        startTransition(() => {
          router.push(`${pathname}?${params.toString()}`, { scroll: false });
        });
      }
    },
    [searchParams, pathname, router]
  );

  // Typing is debounced; pressing Enter bypasses the wait.
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    debounceRef.current = setTimeout(() => pushSearch(searchQuery), 500);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [searchQuery, pushSearch]);

  const safeProducts = useMemo(() => (Array.isArray(products) ? products : []), [products]);

  // Filter out inactive products (active status should ideally be handled by the server, but we double-check)
  const filteredProducts = useMemo(() => {
    return safeProducts.filter((product) => product.is_active);
  }, [safeProducts]);

  // If homepage, display only first 3 items
  const displayProducts = useMemo(() => {
    return isHomePage ? filteredProducts.slice(0, 3) : filteredProducts;
  }, [filteredProducts, isHomePage]);

  // The backend filters by department directly, so the URL carries only that
  // one param. Picking a different department resets to page 1, because the new
  // result set usually has fewer pages.
  const handleDepartmentClick = (departmentId?: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (departmentId) {
      params.set('department', departmentId);
    } else {
      params.delete('department');
    }
    // The agency filter no longer exists; drop any legacy `?agent=` so an old
    // bookmarked link does not keep an invisible filter around.
    params.delete('agent');
    params.delete('page');
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    });
  };

  // A group is open when the user expanded it, or when it holds the active
  // department — otherwise a shared `?department=` link would render with
  // nothing expanded and the active chip would be invisible.
  const isGroupOpen = (group: AgentGroup) => {
    const key = group.agentId === null ? '' : String(group.agentId);
    if (expandedGroups.includes(key)) return true;
    return (
      !!selectedDepartmentId &&
      group.departments.some((d) => d.id.toString() === selectedDepartmentId)
    );
  };

  const groupLabel = (group: AgentGroup) => {
    if (group.agentId === null) return tProducts('no_agency');
    const name = locale === 'ar' ? group.nameAr : (group.nameEn || group.nameAr);
    // Departments carry the agency id but the name may be missing, so the id is
    // used as a last resort rather than rendering a blank button.
    return name || tProducts('no_agency');
  };

  return (
    <section className="py-12  bg-slate-50/50 relative overflow-hidden animate-fade-in" id="products">
      {/* Background ambient lighting */}
      <div className="absolute inset-0 pointer-events-none opacity-30">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[140px] -translate-y-1/2" />
        <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-accent/10 rounded-full blur-[140px] translate-y-1/2" />
      </div>

      <div className="container mx-auto px-6 max-w-7xl relative z-10">
        
        {/* Section Header */}
        <SectionHeader
     
          titlePart1={tProducts('title_part1')}
          titlePart2={tProducts('title_part2')}
          subtitle={tProducts('subtitle')}
        />

        {/* Filters & Search Toolbar - Hidden on Homepage */}
        {!isHomePage && (
          <div className="flex flex-col gap-6 mb-12 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-md w-full">
            <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
              
              {/* Search Field */}
              <div className="relative w-full md:max-w-md">
                <span className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none text-slate-400">
                  {isPending ? (
                    <Loader2 size={20} className="animate-spin text-primary" />
                  ) : (
                    <Search size={20} />
                  )}
                </span>
                <input
                  type="text"
                  placeholder={tProducts('search_placeholder')}
                  className="w-full pl-4 pr-12 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all text-slate-800 text-sm font-semibold placeholder:text-slate-400"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    // Enter applies the term immediately instead of waiting for
                    // the 500ms debounce.
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      // Drop the pending debounce so Enter does not navigate a
                      // second time half a second later.
                      if (debounceRef.current) clearTimeout(debounceRef.current);
                      pushSearch(searchQuery);
                    }
                  }}
                  aria-busy={isPending}
                />
              </div>

              {/* Counter status — doubles as the loading indicator. */}
              <div
                className="flex items-center gap-2 text-xs font-extrabold text-slate-500 bg-slate-100 px-4 py-2.5 rounded-xl border border-slate-200/60"
                aria-live="polite"
              >
                {isPending ? (
                  <>
                    <Loader2 size={16} className="text-primary animate-spin" />
                    <span>{locale === 'ar' ? 'جاري البحث...' : 'Searching...'}</span>
                  </>
                ) : (
                  <>
                    <SlidersHorizontal size={16} className="text-primary" />
                    {locale === 'ar'
                      ? `عدد المنتجات: ${meta?.count ?? filteredProducts.length}`
                      : `Products Count: ${meta?.count ?? filteredProducts.length}`}
                  </>
                )}
              </div>

            </div>

            {/* Department filter, grouped under its agency for readability.
                Only the department is sent to the backend (`?department=`),
                which keeps the catalogue request to a single page. */}
            {agentGroups.length > 0 && (
              <div className="flex flex-col gap-2 pt-4 border-t border-slate-100">
                {/* "All" clears the department filter. */}
                <button
                  onClick={() => handleDepartmentClick()}
                  className={cn(
                    "self-start px-4 py-2.5 rounded-2xl text-xs font-extrabold transition-all duration-300 flex items-center gap-2 border",
                    !selectedDepartmentId
                      ? "bg-primary border-primary text-white shadow-lg shadow-primary/25"
                      : "bg-slate-50 border-slate-200 text-slate-600 hover:border-primary/50 hover:bg-slate-100"
                  )}
                >
                  <span>{tProducts('all')}</span>
                </button>

                {agentGroups.map((group) => {
                  const groupKey = group.agentId === null ? '' : String(group.agentId);
                  const open = isGroupOpen(group);

                  return (
                    <div
                      key={groupKey || 'no-agency'}
                      className="rounded-2xl border border-slate-200 bg-slate-50/60"
                    >
                      <div className="flex items-center gap-2 p-2">
                        {/* The agency row is only a label that groups its
                            departments; filtering happens on the department,
                            which the backend supports directly. */}
                        <span className="px-4 py-2.5 text-xs font-extrabold text-slate-700">
                          {groupLabel(group)}
                        </span>

                        <button
                          onClick={() => toggleGroup(groupKey)}
                          aria-expanded={open}
                          aria-label={groupLabel(group)}
                          className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 transition-colors"
                        >
                          <ChevronDown
                            className={cn(
                              "w-4 h-4 transition-transform duration-300",
                              open && "rotate-180"
                            )}
                          />
                        </button>
                      </div>

                      {open && (
                        <div className="flex flex-wrap gap-2 px-2 pb-2 pt-0.5">
                          {group.departments.map((department) => {
                            const isDepartmentSelected =
                              selectedDepartmentId === department.id.toString();
                            return (
                              <button
                                key={department.id}
                                onClick={() =>
                                  handleDepartmentClick(
                                    isDepartmentSelected ? undefined : department.id.toString()
                                  )
                                }
                                className={cn(
                                  "px-3 py-2 rounded-xl text-[11px] font-bold transition-all duration-300 flex items-center gap-2 border",
                                  isDepartmentSelected
                                    ? "bg-primary border-primary text-white shadow-md shadow-primary/20"
                                    : "bg-white border-slate-200 text-slate-600 hover:border-primary/50 hover:bg-slate-50"
                                )}
                              >
                                <span>
                                  {locale === 'ar'
                                    ? department.name_ar
                                    : (department.name_en || department.name_ar)}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            
          </div>
        )}

        {/* Products Grid */}
        {displayProducts.length > 0 ? (
          <div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {displayProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            {/* View More Products Button - Always Visible on Homepage */}
            {isHomePage && (
              <div className="text-center mt-16">
                <Link
                  href="/products"
                  className="inline-flex items-center gap-3 px-9 py-4 bg-gradient-to-r from-primary to-primary-dark hover:from-primary-dark hover:to-primary text-white font-extrabold text-lg rounded-full shadow-xl shadow-primary/25 hover:shadow-2xl hover:shadow-primary/40 hover:-translate-y-1 transition-all duration-300"
                >
                  {tCommon('view_more_products')}
                  {locale === 'ar' ? <ArrowLeft size={22} /> : <ArrowRight size={22} />}
                </Link>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200 shadow-sm">
            <Package size={48} className="mx-auto text-slate-300 mb-4" />
            <h3 className="text-lg font-bold text-slate-700 mb-1">{tProducts('no_products')}</h3>
          </div>
        )}

        {/* Pagination is hidden on the homepage, which shows a fixed 3 items. */}
        {!isHomePage && meta && basePath && meta.totalPages > 0 && (
          <div className="mt-12 bg-white rounded-3xl border border-slate-200 shadow-sm p-4">
            <ServerPagination
              meta={meta}
              basePath={basePath}
              idPrefix="public-products"
              labels={{
                showing: tPagination('showing'),
                of: tPagination('of'),
                items: tPagination(`items.${kind}`),
                page: tPagination('page'),
                perPage: tPagination('productsPerPage'),
                previous: tPagination('previous'),
                next: tPagination('next'),
                first: tPagination('first'),
                last: tPagination('last'),
              }}
            />
          </div>
        )}

      </div>
    </section>
  );
}
