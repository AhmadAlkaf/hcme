import Projects from '@/components/Projects';
import { getProjectsServerAction } from '@/actions/projects.actions';
import { buildCorrectedPageHref, parsePaginationParams } from '@/lib/pagination-params';
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
    path: 'projects',
    title: isAr ? 'مشاريعنا المنفذة' : 'Our Projects',
    description: isAr
      ? 'استعرض مشاريع مركز حضرموت الحديث للكهربائيات المنفذة في حضرموت واليمن: تمديدات كهربائية، أنظمة طاقة شمسية، إنارة ومقاولات كهربائية متكاملة.'
      : 'Explore electrical projects delivered by Hadramout Modern Center for Electricals across Hadramout, Yemen: electrical installations, solar energy systems, lighting and turnkey electrical contracting.',
    keywords: [
      'مشاريع كهربائية',
      'مقاولات كهربائية',
      'طاقة شمسية',
      'electrical projects',
      'electrical contracting',
    ],
  });
}

export default async function ProjectsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { locale } = await params;
  const { page, pageSize, search } = parsePaginationParams(await searchParams);

  const projectsRes = await getProjectsServerAction({
    page,
    pageSize,
    search: search || undefined,
  });

  if (projectsRes?.meta) {
    const corrected = buildCorrectedPageHref({
      basePath: `/${locale}/projects`,
      requestedPage: page,
      meta: projectsRes.meta,
      search,
    });
    if (corrected) redirect(corrected);
  }

  return (
    <main className="min-h-screen   flex flex-col flex-1">
       <div className="pt-32 pb-8   text-white relative  ">
        <div className="absolute   bg-white" />
      </div>

      {/* Catalog */}
      <div className="flex-1 bg-slate-900">
        <Projects
          projects={projectsRes?.items ?? []}
          meta={projectsRes?.meta}
          basePath={`/${locale}/projects`}
          isHomePage={false}
        />
      </div>
    </main>
  );
}
