'use client';


import type { ApiService, ApiPublicService } from '@/types/api';
import type { Service } from '@/types';
import { useTranslations, useLocale } from 'next-intl';
import SectionHeader from '@/components/ui/SectionHeader';
import ServiceCard from '@/components/common/ServiceCard';

interface ServicesProps {
  services?: ApiService[];
  publicServices?: ApiPublicService[];
}

export default function Services({ publicServices }: ServicesProps) {
  const tSections = useTranslations('Sections');
  const tServices = useTranslations('Services');
  const locale = useLocale();

  const safePublicServices = Array.isArray(publicServices) ? publicServices : [];

  // Try to map public_service to static Service shape if available
  const displayServices: Service[] = safePublicServices.length > 0
    ? safePublicServices.map((ps) => ({
        id: ps.id.toString(),
        title: locale === 'ar' ? ps.name_ar : (ps.name_en || ps.name_ar),
        description: '',
        icon: '🔧',
        features: []
      }))
    : [];

  return (
    <section className="py-24 bg-slate-900 relative overflow-hidden" id="services">
      {/* Decorative Background */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/30 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-accent/20 rounded-full blur-[100px] translate-y-1/3 -translate-x-1/3" />
      </div>

      <div className="container mx-auto px-6 max-w-7xl relative z-10">
        <SectionHeader
          badge={`⚡ ${tSections('our_services')}`}
          titlePart1={tServices('title_part1')}
          titlePart2={tServices('title_part2')}
          subtitle={tServices('subtitle')}
          dark={true}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {displayServices.map((service) => (
            <ServiceCard key={service.id} service={service} />
          ))}
        </div>
      </div>
    </section>
  );
}
