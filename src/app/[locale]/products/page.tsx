import Products from '@/components/Products';
import {
  getProductsServerAction,
  getAllDepartmentsServerAction,
} from '@/actions/products.actions';
import {
  buildCorrectedPageHref,
  parsePaginationParams,
} from '@/lib/pagination-params';
import { buildAgentGroups, normalizeDepartmentRef } from '@/lib/products';
import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
import { buildMetadata } from '@/config/seo';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isAr = locale === 'ar';
  return buildMetadata({
    locale,
    path: 'products',
    title: isAr
      ? 'المنتجات والوكلاء المعتمدون'
      : 'Products & Authorized Brands',
    description: isAr
      ? 'تصفح منتجات مركز حضرموت الحديث للكهربائيات: قواطع، كابلات، إنارة، لوحات توزيع وأنظمة طاقة شمسية من شنايدر إلكتريك وABB ولوغراند وفيليبس وسيمنز، مع إمكانية التصفية حسب الوكيل والقسم.'
      : 'Browse products from Hadramout Modern Center for Electricals: circuit breakers, cables, lighting, distribution boards and solar systems from Schneider Electric, ABB, Legrand, Philips and Siemens. Filter by brand and department.',
    keywords: [
      'منتجات كهربائية',
      'كتالوج كهربائيات',
      'وكلاء معتمدون',
      'electrical products',
      'product catalog',
    ],
  });
}

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

  // Departments are small (one lightweight request) and public; they power the
  // filter. The catalogue itself is never downloaded in full: only the current
  // page is requested, which is what makes this page fast.
  const departments = await getAllDepartmentsServerAction();
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

  // Only the current page is fetched. The agency-level filter used to require
  // the whole catalogue (the backend accepts a single department and the
  // frontend then filtered locally), so it was dropped. The department filter
  // is supported by the backend directly (`?department=`), so the page now
  // costs one light request regardless of catalogue size.
  const productsRes = await getProductsServerAction({
    page,
    pageSize,
    search: search || undefined,
    filters: { department: departmentParam },
  });

  const products = productsRes?.items ?? [];
  const meta = productsRes?.meta;

  // An out-of-range `?page=` is served as page 1, so redirect to the canonical
  // URL to keep the address bar and the highlighted page in agreement.
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
          selectedDepartmentId={departmentParam}
          meta={meta}
          basePath={basePath}
          isHomePage={false}
        />
      </div>
    </main>
  );
}
