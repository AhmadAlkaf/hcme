'use client';

import type { ApiProject } from '@/types/api';
import { getImageUrl } from '@/lib/utils';
import { useLocale, useTranslations } from 'next-intl';
import { MapPin, Calendar, Eye } from 'lucide-react';
import { Link } from '@/i18n/routing';

interface ProjectCardProps {
  project: ApiProject;
}

export default function ProjectCard({ project }: ProjectCardProps) {
  const locale = useLocale();
  const tProjects = useTranslations('Projects');

  const name =
    locale === 'ar'
      ? project.name_ar
      : project.name_en || project.name_ar;

  const shortDesc =
    locale === 'ar'
      ? project.short_description_ar
      : project.short_description_en || project.short_description_ar;

  const location =
    locale === 'ar'
      ? project.location_ar
      : project.location_en || project.location_ar;

  const brandName =
    locale === 'ar'
      ? project.agent_name_ar
      : project.agent_name_en || project.agent_name_ar;

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString(locale === 'ar' ? 'ar-YE' : 'en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="group rounded-3xl bg-white/5 border border-white/10 overflow-hidden hover:bg-white/10 hover:border-primary/50 transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_40px_-15px_rgba(27,166,156,0.2)] backdrop-blur-sm flex flex-col h-full">
      {/* Cover Image */}
      <div className="relative aspect-video overflow-hidden bg-slate-800 shrink-0">
        <img
          src={getImageUrl(project.image)}
          alt={name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
        />

        {/* Brand Tag */}
        {brandName && (
          <span className="absolute top-4 right-4 bg-primary/90 text-white text-xs font-bold px-3 py-1.5 rounded-full backdrop-blur-sm shadow-md">
            {brandName}
          </span>
        )}

        {/* Location overlay */}
        {location && (
          <span className="absolute bottom-4 right-4 bg-slate-950/70 text-white text-xs font-semibold px-3 py-1.5 rounded-full flex items-center gap-1.5 backdrop-blur-sm border border-white/10">
            <MapPin size={12} className="text-primary-light" />
            {location}
          </span>
        )}
      </div>

      {/* Project Summary */}
      <div className="p-6 flex flex-col flex-1">
        <h3 className="text-xl font-bold text-white mb-3 group-hover:text-primary-light transition-colors line-clamp-1">
          {name}
        </h3>
        <p className="text-white/60 text-sm leading-relaxed mb-6 flex-grow line-clamp-2">
          {shortDesc}
        </p>

        <div className="mt-auto border-t border-white/10 pt-4 flex items-center justify-between">
          {/* Completion Date */}
          <span className="text-xs text-white/40 flex items-center gap-1.5 font-medium">
            <Calendar size={14} className="text-primary-light" />
            {tProjects('completed')} {formatDate(project.completed)}
          </span>

          {/* View Action Link */}
          <Link
            href={`/projects/${project.id}`}
            className="text-xs font-extrabold text-primary-light hover:text-white flex items-center gap-1 transition-colors"
          >
            {tProjects('view_project')}
            <Eye size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
}
