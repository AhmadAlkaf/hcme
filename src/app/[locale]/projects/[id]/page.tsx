import { notFound } from 'next/navigation';
import { getProjectByIdServerAction } from '@/actions/projects.actions';
import ProjectDetailsClient from '@/components/ProjectDetailsClient';
import { getImageUrl } from '@/lib/utils';
import { SITE_URL, brandName, getSeoCopy } from '@/config/seo';
import type { Metadata } from 'next';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}): Promise<Metadata> {
  const { locale, id } = await params;
  const project = await getProjectByIdServerAction(id);

  if (!project) {
    return { title: locale === 'ar' ? 'مشروع غير موجود' : 'Project not found' };
  }

  const isAr = locale === 'ar';
  const name = (isAr ? project.name_ar : project.name_en) || project.name_ar;
  const rawDescription =
    (isAr ? project.short_description_ar : project.short_description_en) ||
    (isAr ? project.description_ar : project.description_en) ||
    '';
  const description =
    rawDescription.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 160) ||
    getSeoCopy(locale).description;
  const image = getImageUrl(project.image);

  return {
    title: name,
    description,
    alternates: {
      canonical: `${SITE_URL}/${locale}/projects/${id}`,
      languages: {
        ar: `${SITE_URL}/ar/projects/${id}`,
        en: `${SITE_URL}/en/projects/${id}`,
        'x-default': `${SITE_URL}/ar/projects/${id}`,
      },
    },
    openGraph: {
      type: 'article',
      title: `${name} | ${brandName(locale)}`,
      description,
      url: `${SITE_URL}/${locale}/projects/${id}`,
      siteName: brandName(locale),
      locale: isAr ? 'ar_YE' : 'en_US',
      images: image ? [{ url: image, alt: name }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: name,
      description,
      images: image ? [image] : undefined,
    },
  };
}

export default async function ProjectPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const project = await getProjectByIdServerAction(id);

  if (!project) {
    notFound();
  }

  return <ProjectDetailsClient project={project} />;
}
