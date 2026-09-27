'use client';

import { useState } from 'react';
import AgencyModal from './AgencyModal';
import type { ApiSlider, ApiAgent, ApiProduct, ApiProject, ApiService } from '@/types/api';
import type { Agency } from '@/types';
import { getImageUrl, cn } from '@/lib/utils';
import { productBelongsToAgent } from '@/lib/products';
import { agencies as staticAgencies } from '@/config/site';
import { useTranslations, useLocale } from 'next-intl';

interface HeroSliderProps {
  sliders?: ApiSlider[];
  agencies?: ApiAgent[];
  products?: ApiProduct[];
  projects?: ApiProject[];
}

export default function HeroSlider({ sliders, agencies, products, projects }: HeroSliderProps) {
  const [selectedAgency, setSelectedAgency] = useState<Agency | null>(null);
  const tHero = useTranslations('HeroSlider');
  const locale = useLocale();

  const safeAgencies = Array.isArray(agencies) ? agencies : [];
  const safeProducts = Array.isArray(products) ? products : [];
  const safeProjects = Array.isArray(projects) ? projects : [];

  // Map API agencies to match the static Agency type required by the UI and Modal
  const mappedAgencies: Agency[] = safeAgencies.length > 0
    ? safeAgencies.map(agent => {
      const agentProducts = safeProducts.length > 0
        ? safeProducts.filter(p => productBelongsToAgent(p, agent)).map(p => ({
          id: p.id.toString(),
          name: locale === 'ar' ? p.name_product_ar : (p.name_product_en || p.name_product_ar),
          image: getImageUrl(p.image),
          description: locale === 'ar' ? p.description_product_ar : (p.description_product_en || p.description_product_ar),
          category: p.number_group || '',
          price: p.name_uint?.[0]?.price ? `${p.name_uint[0].price} ${locale === 'ar' ? p.name_uint[0].name_unit_ar : (p.name_uint[0].name_unit_en || p.name_uint[0].name_unit_ar)}` : ''
        }))
        : [];

      const agentProjects = safeProjects.length > 0
        ? safeProjects.filter(pr => pr.agent === agent.id).map(pr => ({
          id: pr.id.toString(),
          title: locale === 'ar' ? pr.name_ar : (pr.name_en || pr.name_ar),
          image: getImageUrl(pr.image),
          description: locale === 'ar' ? pr.short_description_ar : (pr.short_description_en || pr.short_description_ar),
          agency: locale === 'ar' ? agent.name_ar : (agent.name_en || agent.name_ar),
          date: pr.completed || pr.start || '',
          location: locale === 'ar' ? pr.location_ar : (pr.location_en || pr.location_ar)
        }))
        : [];

      const agentDetailedServices = agent.service && agent.service.length > 0
        ? agent.service.map(s => ({
          id: s.id.toString(),
          name: s.name_ar,
          nameEn: s.name_en || s.name_ar
        }))
        : [];

      return {
        id: agent.id.toString(),
        name: locale === 'ar' ? agent.name_ar : (agent.name_en || agent.name_ar),
        nameEn: locale === 'ar' ? agent.name_en : agent.name_ar,
        logo: '🏢',
        description: locale === 'ar' ? agent.buy_fome_us_ar : (agent.buy_fome_us_en || agent.buy_fome_us_ar),
        products: agentProducts,
        projects: agentProjects,
        reviews: [],
        services: agentDetailedServices,
        imageUrl: getImageUrl(agent.image)
      };
    }) as (Agency & { imageUrl?: string })[]
    : staticAgencies;

  const displayAgencies = mappedAgencies;

  return (
    <section
      className="relative min-h-screen flex flex-col justify-center overflow-hidden bg-gradient-to-br from-slate-900 via-primary-darker to-primary-dark"
      id="home"
    >
      {/* Background gradients / overlay */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_20%_50%,_rgba(27,166,156,0.15)_0%,_transparent_50%),_radial-gradient(circle_at_80%_20%,_rgba(245,166,35,0.08)_0%,_transparent_40%)]" />

      {/* Pattern */}
      <div className="absolute inset-0 pointer-events-none opacity-20" style={{
        backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px)',
        backgroundSize: '60px 60px'
      }} />

      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 pt-[calc(80px+60px)] pb-10 text-center animate-fade-in-up">

        <div className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-white/5 border border-white/10 text-primary-light text-sm font-semibold mb-6">
          {tHero('badge')}
        </div>

        <h1 className="text-[clamp(2rem,5vw,3.5rem)] font-black text-white leading-tight mb-5">
          {tHero('title_part1')}{' '}
          <span className="bg-gradient-to-br from-primary-light to-accent-light bg-clip-text text-transparent">
            {tHero('title_part2')}
          </span>
        </h1>

        <p className="text-lg text-white/70 max-w-2xl mx-auto mb-9 leading-relaxed">
          {tHero('subtitle')}
        </p>

        <div className="flex items-center justify-center gap-4 mb-16">
          <button
            className="px-8 py-3.5 rounded-full bg-gradient-to-br from-primary to-primary-light text-white font-bold shadow-[0_4px_20px_rgba(27,166,156,0.3)] hover:-translate-y-0.5 hover:shadow-[0_8px_30px_rgba(27,166,156,0.3)] transition-all duration-300"
            onClick={() => {
              document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            {tHero('discover_services')}
          </button>
          <button
            className="px-8 py-3.5 rounded-full border-2 border-white/25 text-white font-bold hover:bg-white/10 hover:border-white/50 hover:-translate-y-0.5 transition-all duration-300"
            onClick={() => {
              document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            {tHero('contact_us')}
          </button>
        </div>
      </div>

      {/* Agencies Slider */}
      <div className="relative z-10 pb-16" id="agencies">
        <p className="text-center text-white/70 text-sm font-medium mb-7 tracking-wide">
          {tHero('agencies_title')}
        </p>

        <div className="flex justify-center gap-5 flex-wrap max-w-7xl mx-auto px-6">
          {displayAgencies.map((agency) => {
            const hasImage = (agency as { imageUrl?: string }).imageUrl;
            return (
              <button
                key={agency.id}
                className="group relative flex flex-col items-center justify-start gap-3 px-4 py-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md w-[160px] sm:w-[180px] h-[240px] hover:bg-white/10 hover:border-primary-light/50 hover:-translate-y-2 hover:shadow-[0_15px_40px_-10px_rgba(27,166,156,0.4)] transition-all duration-500 cursor-pointer overflow-hidden"
                onClick={() => setSelectedAgency(agency)}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary-light/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                <div className="relative z-10 w-16 h-16 shrink-0 rounded-2xl bg-white/10 flex items-center justify-center p-2 shadow-inner border border-white/5 group-hover:scale-110 transition-transform duration-500">
                  {hasImage ? (
                    <img
                      src={(agency as { imageUrl?: string }).imageUrl}
                      alt={agency.name}
                      className="w-full h-full object-contain drop-shadow-md rounded-xl"
                    />
                  ) : (
                    <span className="text-3xl drop-shadow-md">{agency.logo}</span>
                  )}
                </div>
                
                <div className="relative z-10 flex flex-col items-center flex-1 justify-center w-full px-2 overflow-hidden">
                  <span className="text-base font-bold text-white text-center group-hover:text-primary-light transition-colors duration-300 truncate w-full" title={agency.name}>
                    {agency.name}
                  </span>
                  <span className="text-[10px] text-white/50 tracking-widest uppercase font-medium mt-1 truncate w-full text-center" title={agency.nameEn}>
                    {agency.nameEn}
                  </span>
                </div>
                
                <div className="relative z-10 mt-auto h-[28px] shrink-0 flex items-center justify-center w-full">
                  {agency.services && agency.services.length > 0 && (
                    <div className="px-3 py-1 rounded-full bg-primary-light/20 border border-primary-light/30 text-[10px] text-primary-light font-bold flex items-center gap-1.5 opacity-80 group-hover:opacity-100 group-hover:bg-primary-light/30 transition-all duration-300">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary-light animate-pulse" />
                      {agency.services.length} {locale === 'ar' ? 'خدمات' : 'Services'}
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Agency Modal */}
      <AgencyModal
        agency={selectedAgency}
        onClose={() => setSelectedAgency(null)}
      />
    </section>
  );
}
