'use client';

import { useState } from 'react';
import type { ApiProject, ApiContent } from '@/types/api';
import { getImageUrl, cn } from '@/lib/utils';
import { useTranslations, useLocale } from 'next-intl';
import { Calendar, MapPin, Building, ArrowLeft, ArrowRight, MessageSquare, ShieldCheck, Video, Clock } from 'lucide-react';
import { Link } from '@/i18n/routing';
import Breadcrumb from '@/components/ui/Breadcrumb';

interface ProjectDetailsClientProps {
  project: ApiProject;
  content?: ApiContent;
}

export default function ProjectDetailsClient({ project, content }: ProjectDetailsClientProps) {
  const tProjects = useTranslations('Projects');
  const tCommon = useTranslations('Common');
  const locale = useLocale();

  const [activeImage, setActiveImage] = useState<string>(getImageUrl(project.image));

  const name = locale === 'ar' ? project.name_ar : (project.name_en || project.name_ar);
  const desc = locale === 'ar' ? project.description_ar : (project.description_en || project.description_ar);
  const location = locale === 'ar' ? project.location_ar : (project.location_en || project.location_ar);
  const brandName = locale === 'ar' ? project.agent_name_ar : (project.agent_name_en || project.agent_name_ar);
  const ownerName = locale === 'ar' 
    ? (project.name_owner_ar || project.commit_owner_ar) 
    : (project.name_owner_en || project.commit_owner_en || project.name_owner_ar || project.commit_owner_ar);

  // Helper to format date display
  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString(locale === 'ar' ? 'ar-YE' : 'en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return dateStr;
    }
  };

  const isVideoFile = (url: string) => {
    if (!url) return false;
    const cleanUrl = url.toLowerCase().split('?')[0];
    return cleanUrl.endsWith('.mp4') || cleanUrl.endsWith('.webm') || cleanUrl.endsWith('.ogg');
  };

  const getWhatsAppInquiryLink = () => {
    const text = locale === 'ar'
      ? `مرحباً مركز حضرموت الحديث للكهربائيات، أود الاستفسار عن تفاصيل تنفيذ مشروع: ${name}`
      : `Hello Hadramout Modern Center, I would like to inquire about details of the project: ${name}`;
    const encodedText = encodeURIComponent(text);

    if (content?.whatsapp && (content.whatsapp.includes('wa.me') || content.whatsapp.includes('whatsapp.com'))) {
      const separator = content.whatsapp.includes('?') ? '&' : '?';
      return `${content.whatsapp}${separator}text=${encodedText}`;
    }
    return `https://wa.me/967776548281?text=${encodedText}`;
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col flex-1 text-white">
      {/* Main Content Area */}
      <main className="flex-grow pt-32 pb-24 relative overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute inset-0 pointer-events-none opacity-20">
          <div className="absolute top-1/4 left-0 w-96 h-96 bg-primary/30 rounded-full blur-[120px] -translate-x-1/2" />
          <div className="absolute bottom-1/4 right-0 w-[500px] h-[500px] bg-accent/15 rounded-full blur-[130px] translate-x-1/3" />
        </div>

        <div className="container mx-auto px-6 max-w-7xl relative z-10">
          
          {/* Back Button & Breadcrumbs */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-8 pb-6 border-b border-white/5">
            <Breadcrumb
              items={[
                { label: locale === 'ar' ? 'الرئيسية' : 'Home', href: '/' },
                { label: tProjects('title_part1'), href: '/projects' },
                { label: name }
              ]}
            />
            
            <Link
              href="/projects"
              className="inline-flex items-center gap-2 text-sm font-extrabold text-primary-light hover:text-white transition-colors"
            >
              {locale === 'ar' ? <ArrowRight size={18} /> : <ArrowLeft size={18} />}
              {tProjects('back_to_projects')}
            </Link>
          </div>

          {/* Project Details Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            
            {/* Left: Gallery and Video (Col-span 7) */}
            <div className="lg:col-span-7 flex flex-col gap-6 w-full">
              
              {/* Active Image Box */}
              <div className="aspect-video bg-slate-900 border border-white/10 rounded-3xl overflow-hidden shadow-2xl relative group">
                <img
                  src={activeImage}
                  alt={name}
                  className="w-full h-full object-cover transition-transform duration-700"
                />
              </div>

              {/* Gallery Thumbnails */}
              {project.project_images && project.project_images.length > 0 && (
                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-white/10">
                  {/* Base Cover Thumbnail */}
                  <button
                    onClick={() => setActiveImage(getImageUrl(project.image))}
                    className={cn(
                      "w-24 h-16 rounded-xl overflow-hidden border-2 shrink-0 bg-slate-900 transition-all",
                      activeImage === getImageUrl(project.image) ? "border-primary-light scale-95 shadow-md shadow-primary/20" : "border-white/10 hover:border-primary-light/50"
                    )}
                  >
                    <img src={getImageUrl(project.image)} alt="thumbnail" className="w-full h-full object-cover" />
                  </button>
                  {/* Extra Images */}
                  {project.project_images.map((img) => (
                    <button
                      key={img.id}
                      onClick={() => setActiveImage(getImageUrl(img.image))}
                      className={cn(
                        "w-24 h-16 rounded-xl overflow-hidden border-2 shrink-0 bg-slate-900 transition-all",
                        activeImage === getImageUrl(img.image) ? "border-primary-light scale-95 shadow-md shadow-primary/20" : "border-white/10 hover:border-primary-light/50"
                      )}
                    >
                      <img src={getImageUrl(img.image)} alt="thumbnail" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}

              {/* Video Player Section */}
              {project.video_files && (
                <div className="bg-white/5 border border-white/10 rounded-3xl p-6 md:p-8 backdrop-blur-sm mt-4">
                  <h3 className="font-extrabold text-lg text-white mb-4 flex items-center gap-2">
                    <Video size={20} className="text-primary-light" />
                    {locale === 'ar' ? 'معاينة الفيديو أو الوسائط' : 'Project Video / Media Preview'}
                  </h3>
                  <div className="rounded-2xl overflow-hidden bg-black border border-white/5">
                    {isVideoFile(project.video_files) ? (
                      <video controls className="w-full aspect-video" src={getImageUrl(project.video_files)} />
                    ) : (
                      <div className="relative aspect-video">
                        <img
                          src={getImageUrl(project.video_files)}
                          alt="Video Placeholder"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Right: Info and Metadata (Col-span 5) */}
            <div className="lg:col-span-5 flex flex-col gap-8 w-full lg:sticky lg:top-24">
              
              {/* Main Card */}
              <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-sm shadow-xl flex flex-col gap-6">
                
                {/* Brand / Agent tag */}
                {brandName && (
                  <span className="px-4 py-1.5 rounded-full bg-primary-subtle text-primary font-black text-xs w-fit border border-primary/20">
                    ⚡ {brandName}
                  </span>
                )}

                <h1 className="text-2xl md:text-3xl font-black leading-tight text-white">
                  {name}
                </h1>

                {/* Subtitle / Attributes */}
                {project.attribute_ar && (
                  <p className="text-sm font-semibold text-primary-light -mt-2">
                    ✦ {locale === 'ar' ? project.attribute_ar : (project.attribute_en || project.attribute_ar)}
                  </p>
                )}

                {/* Description */}
                <div className="text-white/70 text-sm leading-relaxed border-t border-b border-white/10 py-6 my-2">
                  <h3 className="font-extrabold text-white text-base mb-3">{locale === 'ar' ? 'حول المشروع' : 'About the Project'}</h3>
                  <p className="whitespace-pre-line">{desc}</p>
                </div>

                {/* Spec details grid */}
                <div className="flex flex-col gap-4 bg-slate-950/40 p-5 rounded-2xl border border-white/5">
                  {/* Owner */}
                  {ownerName && (
                    <div className="flex justify-between items-start gap-4 text-sm border-b border-white/5 pb-3">
                      <span className="text-white/40 flex items-center gap-2 shrink-0">
                        <Building size={16} className="text-primary-light" />
                        {locale === 'ar' ? 'الجهة المالكة' : 'Owner'}
                      </span>
                      <span className="font-bold text-right text-white">
                        {ownerName}
                      </span>
                    </div>
                  )}

                  {/* Location */}
                  {location && (
                    <div className="flex justify-between items-start gap-4 text-sm border-b border-white/5 pb-3">
                      <span className="text-white/40 flex items-center gap-2 shrink-0">
                        <MapPin size={16} className="text-primary-light" />
                        {locale === 'ar' ? 'الموقع' : 'Location'}
                      </span>
                      <span className="font-bold text-right text-white">
                        {location}
                      </span>
                    </div>
                  )}

                  {/* Period */}
                  {project.start && (
                    <div className="flex justify-between items-start gap-4 text-sm border-b border-white/5 pb-3">
                      <span className="text-white/40 flex items-center gap-2 shrink-0">
                        <Calendar size={16} className="text-primary-light" />
                        {locale === 'ar' ? 'تاريخ البدء' : 'Start Date'}
                      </span>
                      <span className="font-bold text-right text-white">
                        {formatDate(project.start)}
                      </span>
                    </div>
                  )}

                  {/* Completed */}
                  {project.completed && (
                    <div className="flex justify-between items-start gap-4 text-sm border-b border-white/5 pb-3">
                      <span className="text-white/40 flex items-center gap-2 shrink-0">
                        <Clock size={16} className="text-primary-light" />
                        {locale === 'ar' ? 'تاريخ الإنجاز' : 'Completion Date'}
                      </span>
                      <span className="font-bold text-right text-white">
                        {formatDate(project.completed)}
                      </span>
                    </div>
                  )}

                  {/* Integrity badge */}
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 pt-1">
                    <ShieldCheck size={16} />
                    {locale === 'ar' ? 'تم التنفيذ طبقاً للمواصفات العالمية المعاصرة' : 'Executed according to contemporary global specifications'}
                  </div>
                </div>

                {/* Inquiry CTA */}
                <a
                  href={getWhatsAppInquiryLink()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-4 rounded-2xl bg-green-500 hover:bg-green-600 text-white font-extrabold text-center flex items-center justify-center gap-2 shadow-lg shadow-green-500/10 hover:shadow-green-500/20 transition-all duration-300"
                >
                  <MessageSquare size={20} />
                  {locale === 'ar' ? 'استفسار عن هذا المشروع عبر واتساب' : 'Inquire about this project via WhatsApp'}
                </a>

              </div>
            </div>

          </div>

        </div>
      </main>
    </div>
  );
}
