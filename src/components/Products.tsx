'use client';

import { useState, useMemo, useEffect } from 'react';
import { ServerPagination } from '@/components/ui/ServerPagination';
import type { PaginationMeta } from '@/types/pagination';
import type { ApiProduct, ApiContent } from '@/types/api';
import type { AgentGroup } from '@/lib/products';
import { cn, getImageUrl } from '@/lib/utils';
import { useTranslations, useLocale } from 'next-intl';
import { Search, ArrowLeft, ArrowRight, Package, SlidersHorizontal, Award, ChevronDown } from 'lucide-react';
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
  agentCounts?: Record<string, number>;
  departmentCounts?: Record<string, number>;
  selectedAgentId?: string;
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
  agentCounts = {},
  departmentCounts = {},
  selectedAgentId,
  selectedDepartmentId,
  meta,
  basePath,
}: ProductsProps) {
  const tSections = useTranslations('Sections');
  const tProducts = useTranslations('Products');
  const tCommon = useTranslations('Common');
  const tPagination = useTranslations('Pagination');
  const kind = 'products';
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');

  // Which agency rows are expanded. This is view state only — it must not live
  // in the URL, because revealing a row is not a filter change.
  const [expandedGroups, setExpandedGroups] = useState<string[]>([]);

  const toggleGroup = (key: string) => {
    setExpandedGroups((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  // Debounce search query and push to router
  useEffect(() => {
    const handler = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (searchQuery.trim()) {
        params.set('search', searchQuery);
      } else {
        params.delete('search');
      }
      
      // Only push if the search param actually changed
      if (params.get('search') !== searchParams.get('search')) {
        // A new search term changes the result set, so the current page number
        // may be out of range.
        params.delete('page');
        router.push(`${pathname}?${params.toString()}`, { scroll: false });
      }
    }, 500);

    return () => clearTimeout(handler);
  }, [searchQuery, pathname, router, searchParams]);

  const safeProducts = useMemo(() => (Array.isArray(products) ? products : []), [products]);

  // Filter out inactive products (active status should ideally be handled by the server, but we double-check)
  const filteredProducts = useMemo(() => {
    return safeProducts.filter((product) => product.is_active);
  }, [safeProducts]);

  // If homepage, display only first 3 items
  const displayProducts = useMemo(() => {
    return isHomePage ? filteredProducts.slice(0, 3) : filteredProducts;
  }, [filteredProducts, isHomePage]);

  // The agency and department filters are two levels of the same drill-down, so
  // only one is ever active. Picking either clears the other, which also stops
  // the two from contradicting each other in a shared link.
  const pushFilter = (key: 'agent' | 'department', value?: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
      params.delete(key === 'agent' ? 'department' : 'agent');
    } else {
      params.delete(key);
    }
    // A different selection usually yields fewer pages, so page 3 may no longer
    // exist and the backend would reject the request.
    params.delete('page');
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const handleAgentClick = (agentId?: string) => {
    pushFilter('agent', agentId);
  };

  const handleDepartmentClick = (departmentId?: string) => {
    pushFilter('department', departmentId);
  };

  // A group is open when the user expanded it, or when it holds the active
  // filter — otherwise a shared `?department=` link would render with nothing
  // expanded and the active chip would be invisible.
  const isGroupOpen = (group: AgentGroup) => {
    const key = group.agentId === null ? '' : String(group.agentId);
    if (expandedGroups.includes(key)) return true;
    if (selectedAgentId && selectedAgentId === key) return true;
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
                  <Search size={20} />
                </span>
                <input
                  type="text"
                  placeholder={tProducts('search_placeholder')}
                  className="w-full pl-4 pr-12 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all text-slate-800 text-sm font-semibold placeholder:text-slate-400"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {/* Counter status */}
              <div className="flex items-center gap-2 text-xs font-extrabold text-slate-500 bg-slate-100 px-4 py-2.5 rounded-xl border border-slate-200/60">
                <SlidersHorizontal size={16} className="text-primary" />
                {locale === 'ar'
                  ? `عدد المنتجات: ${meta?.count ?? filteredProducts.length}`
                  : `Products Count: ${meta?.count ?? filteredProducts.length}`}
              </div>

            </div>

            {/* Agency Filter -> nested departments (accordion) */}
            {agentGroups.length > 0 && (
              <div className="flex flex-col gap-2 pt-4 border-t border-slate-100">
                {/* "All" clears both levels, so the whole catalogue is reachable. */}
                <button
                  onClick={() => handleAgentClick()}
                  className={cn(
                    "self-start px-4 py-2.5 rounded-2xl text-xs font-extrabold transition-all duration-300 flex items-center gap-2 border",
                    !selectedAgentId && !selectedDepartmentId
                      ? "bg-primary border-primary text-white shadow-lg shadow-primary/25"
                      : "bg-slate-50 border-slate-200 text-slate-600 hover:border-primary/50 hover:bg-slate-100"
                  )}
                >
                  <span>{tProducts('all')}</span>
                  <span
                    className={cn(
                      "px-2 py-0.5 rounded-full text-[10px] font-black",
                      !selectedAgentId && !selectedDepartmentId
                        ? "bg-white/20 text-white"
                        : "bg-slate-200 text-slate-600"
                    )}
                  >
                    {agentCounts['all'] || 0}
                  </span>
                </button>

                {agentGroups.map((group) => {
                  const groupKey = group.agentId === null ? '' : String(group.agentId);
                  const isAgentSelected = !!selectedAgentId && selectedAgentId === groupKey;
                  const groupCount =
                    group.agentId === null
                      ? group.departments.reduce(
                          (sum, d) => sum + (departmentCounts[String(d.id)] || 0),
                          0
                        )
                      : agentCounts[groupKey] || 0;
                  const open = isGroupOpen(group);

                  return (
                    <div
                      key={groupKey || 'no-agency'}
                      className={cn(
                        "rounded-2xl border transition-colors",
                        isAgentSelected
                          ? 'border-primary/40 bg-primary/5'
                          : 'border-slate-200 bg-slate-50/60'
                      )}
                    >
                      <div className="flex items-center gap-2 p-2">
                        {/* Selecting the agency shows every product in its
                            departments, not just its name. */}
                        <button
                          onClick={() => handleAgentClick(isAgentSelected ? undefined : groupKey || undefined)}
                          className={cn(
                            "px-4 py-2.5 rounded-2xl text-xs font-extrabold transition-all duration-300 flex items-center gap-2",
                            isAgentSelected
                              ? "bg-primary text-white shadow-lg shadow-primary/25"
                              : "text-slate-700 hover:bg-slate-100"
                          )}
                        >
                          <span>{groupLabel(group)}</span>
                          <span
                            className={cn(
                              "px-2 py-0.5 rounded-full text-[10px] font-black",
                              isAgentSelected
                                ? "bg-white/20 text-white"
                                : "bg-slate-200 text-slate-600"
                            )}
                          >
                            {groupCount}
                          </span>
                        </button>

                        {/* The chevron only reveals the departments; it does not
                            change the filter, so the two actions stay separate. */}
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
                                <span
                                  className={cn(
                                    "px-1.5 py-0.5 rounded-full text-[9px] font-black",
                                    isDepartmentSelected
                                      ? "bg-white/20 text-white"
                                      : "bg-slate-100 text-slate-500"
                                  )}
                                >
                                  {departmentCounts[department.id] || 0}
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
