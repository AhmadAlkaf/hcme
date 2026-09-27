'use client';

import { useMemo } from 'react';
import { ServerPagination } from '@/components/ui/ServerPagination';
import type { PaginationMeta } from '@/types/pagination';
import type { ApiProject } from '@/types/api';
import { useTranslations, useLocale } from 'next-intl';
import { Building, ArrowLeft, ArrowRight } from 'lucide-react';
import { Link } from '@/i18n/routing';
import SectionHeader from '@/components/ui/SectionHeader';
import ProjectCard from '@/components/projects/ProjectCard';

interface ProjectsProps {
  projects?: ApiProject[];
  isHomePage?: boolean;
  /** Server-side totals. Omitted on the homepage, which shows only 3 projects. */
  meta?: PaginationMeta;
  /** Locale-aware path used to build the pagination links. */
  basePath?: string;
}

export default function Projects({
  projects = [],
  isHomePage = false,
  meta,
  basePath,
}: ProjectsProps) {
  const tSections = useTranslations('Sections');
  const tProjects = useTranslations('Projects');
  const tCommon = useTranslations('Common');
  const tPagination = useTranslations('Pagination');
  const kind = 'projects';
  const locale = useLocale();

  const safeProjects = useMemo(() => (Array.isArray(projects) ? projects : []), [projects]);

  // Limit display if on home page
  const displayProjects = useMemo(() => {
    return isHomePage ? safeProjects.slice(0, 3) : safeProjects;
  }, [safeProjects, isHomePage]);

  return (
    <section className="py-24 bg-slate-900 relative overflow-hidden" id="projects">
      {/* Background decorations */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[120px] -translate-y-1/3 -translate-x-1/3" />
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-accent/10 rounded-full blur-[100px] translate-y-1/3 translate-x-1/3" />
      </div>

      <div className="container mx-auto px-6 max-w-7xl relative z-10">
        
        {/* Section Header */}
        <SectionHeader
    
          titlePart1={tProjects('title_part1')}
          titlePart2={tProjects('title_part2')}
          subtitle={tProjects('subtitle')}
          dark={true}
        />

        {/* Projects Grid */}
        {displayProjects.length > 0 ? (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {displayProjects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>

            {/* View More Projects Button - Always Visible on Homepage */}
            {isHomePage && (
              <div className="text-center mt-16">
                <Link
                  href="/projects"
                  className="inline-flex items-center gap-3 px-9 py-4 bg-primary/20 hover:bg-primary/30 border border-primary-light/30 text-white font-extrabold text-lg rounded-full shadow-lg hover:shadow-xl hover:border-primary-light/60 hover:-translate-y-1 transition-all duration-300 backdrop-blur-md"
                >
                  {tCommon('view_more_projects')}
                  {locale === 'ar' ? <ArrowLeft size={22} className="text-primary-light" /> : <ArrowRight size={22} className="text-primary-light" />}
                </Link>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-20 bg-white/5 border border-dashed border-white/10 rounded-3xl">
            <Building size={48} className="mx-auto text-white/20 mb-4" />
            <h3 className="text-lg font-bold text-white mb-1">{tProjects('no_projects')}</h3>
          </div>
        )}

        {/* Pagination is hidden on the homepage, which shows a fixed 3 items. */}
        {!isHomePage && meta && basePath && meta.totalPages > 0 && (
          <div className="mt-12 bg-white/5 border border-white/10 rounded-3xl p-4">
            <ServerPagination
              meta={meta}
              basePath={basePath}
              idPrefix="public-projects"
              labels={{
                showing: tPagination('showing'),
                of: tPagination('of'),
                items: tPagination(`items.${kind}`),
                page: tPagination('page'),
                perPage: tPagination('projectsPerPage'),
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
