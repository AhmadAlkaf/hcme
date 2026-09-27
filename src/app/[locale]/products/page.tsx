import Products from '@/components/Products';
import {
  getProductsServerAction,
  getAllProductsServerAction,
  getAllDepartmentsServerAction,
} from '@/actions/products.actions';
import {
  buildCorrectedPageHref,
  parsePaginationParams,
} from '@/lib/pagination-params';
import { buildMeta } from '@/lib/pagination-core';
import {
  buildAgentGroups,
  filterProductsByDepartments,
  normalizeDepartmentRef,
} from '@/lib/products';
import type { ApiProduct } from '@/types/api';
import type { PaginationMeta } from '@/types/pagination';
import { redirect } from 'next/navigation';

export default async function ProductsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { locale } = await params;
  const { page, pageSize, search, rest } = parsePaginationParams(await searchParams);
  const basePath = `/${locale}/products`;

  // The whole catalogue and every department are needed regardless of the
  // filter: the tab counters are global, and an agency filter spans several
  // departments, which the backend cannot do in one request.
  const [departments, allProducts] = await Promise.all([
    // Sends `?pagination=false`, so the filter lists every department.
    getAllDepartmentsServerAction(),
    // The counters need the whole catalogue. Fetching only the current page
    // would undercount every tab.
    getAllProductsServerAction({ search: search || undefined }),
  ]);

  const agentGroups = buildAgentGroups(departments);

  // An id that is not in the data is ignored rather than sent on, so a stale
  // bookmark cannot turn into a backend 400 or an empty catalogue.
  const requestedDepartment = normalizeDepartmentRef(
    rest.department !== undefined ? Number(rest.department) : null
  );
  const departmentParam =
    requestedDepartment !== null &&
    departments.some((d) => d.id === requestedDepartment)
      ? String(requestedDepartment)
      : undefined;

  const requestedAgent = normalizeDepartmentRef(
    rest.agent !== undefined ? Number(rest.agent) : null
  );
  const agentParam =
    requestedAgent !== null && agentGroups.some((g) => g.agentId === requestedAgent)
      ? String(requestedAgent)
      : undefined;

  // Count products per department from the complete list, so a tab can never
  // undercount by being derived from a single page.
  const departmentCounts: Record<string, number> = { all: allProducts.length };
  allProducts.forEach((p: ApiProduct) => {
    const departmentId = normalizeDepartmentRef(p.department);
    if (departmentId !== null) {
      const key = String(departmentId);
      departmentCounts[key] = (departmentCounts[key] || 0) + 1;
    }
  });

  // The agency's own count is the sum of its departments'.
  const agentCounts: Record<string, number> = { all: allProducts.length };
  for (const group of agentGroups) {
    if (group.agentId === null) continue;
    agentCounts[String(group.agentId)] = group.departments.reduce(
      (sum, department) => sum + (departmentCounts[String(department.id)] || 0),
      0
    );
  }

  // When an agency is selected the backend cannot express the filter, so the
  // page is cut from the catalogue that was already loaded for the counters.
  const activeGroup = agentParam
    ? agentGroups.find((group) => group.agentId === Number(agentParam))
    : undefined;

  let products: ApiProduct[] = [];
  let meta: PaginationMeta | undefined;

  if (activeGroup) {
    const matched = filterProductsByDepartments(
      allProducts,
      activeGroup.departments.map((department) => department.id)
    );
    const totalPages = Math.max(1, Math.ceil(matched.length / pageSize));
    // Clamp instead of redirecting: the slice is local, so serving the last
    // page keeps a stale `?page=` usable without an extra round trip.
    const currentPage = Math.min(Math.max(1, page), totalPages);
    const start = (currentPage - 1) * pageSize;
    products = matched.slice(start, start + pageSize);
    meta = buildMeta({
      page: currentPage,
      pageSize,
      count: matched.length,
      next: currentPage < totalPages ? currentPage + 1 : null,
      previous: currentPage > 1 ? currentPage - 1 : null,
    });
  } else {
    const productsRes = await getProductsServerAction({
      page,
      pageSize,
      search: search || undefined,
      filters: { department: departmentParam },
    });
    products = productsRes?.items ?? [];
    meta = productsRes?.meta;

    // An out-of-range `?page=` is served as page 1, so redirect to the
    // canonical URL to keep the address bar and the highlighted page in
    // agreement.
    if (meta) {
      const corrected = buildCorrectedPageHref({
        basePath,
        requestedPage: page,
        meta,
        search,
        extra: rest,
      });
      if (corrected) redirect(corrected);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 flex flex-col flex-1">
      {/* Top Spacer & Breadcrumb */}
      <div className="pt-32 pb-8 bg-slate-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none opacity-20 bg-[radial-gradient(circle_at_20%_50%,_rgba(27,166,156,0.2)_0%,_transparent_60%)]" />
      </div>

      {/* Catalog */}
      <div className="flex-1">
        <Products
          products={products}
          agentGroups={agentGroups}
          agentCounts={agentCounts}
          selectedAgentId={agentParam}
          selectedDepartmentId={departmentParam}
          departmentCounts={departmentCounts}
          meta={meta}
          basePath={basePath}
          isHomePage={false}
        />
      </div>
    </main>
  );
}
