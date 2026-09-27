'use client';

import { whyChooseUs } from '@/config/site';
import type { ApiContent, ApiGoal } from '@/types/api';
import { cn } from '@/lib/utils';
import { useTranslations, useLocale } from 'next-intl';
import { getLocalizedField } from '@/lib/i18n-utils';

interface AboutUsProps {
  content?: ApiContent;
  goals?: ApiGoal[];
}

export default function AboutUs({ content, goals }: AboutUsProps) {
  const tSections = useTranslations('Sections');
  const tAbout = useTranslations('About');
  const tWhyChoose = useTranslations('WhyChooseUs');
  const locale = useLocale();

  const weAreText = getLocalizedField(content, 'we_are', locale) || (
    locale === 'ar'
      ? 'نحن مركز متخصص في توفير أحدث المنتجات والحلول الكهربائية وتقديم استشارات فنية متكاملة لتلبية جميع تطلعات عملائنا.'
      : 'We are a specialized center providing the latest electrical products and solutions with comprehensive technical consulting to meet all client expectations.'
  );
  
  const aboutItems = [
    {
      id: 'vision',
      title: tAbout('vision_title') || (locale === 'ar' ? 'رؤيتنا' : 'Our Vision'),
      description: getLocalizedField(content, 'our_vision', locale) || (
        locale === 'ar'
          ? 'نسعى لأن نكون الشريك الموثوق لعملائنا عبر تقديم حلول كهربائية مبتكرة وعالية الجودة.'
          : 'We strive to be the trusted partner for our clients by delivering innovative and high-quality electrical solutions.'
      ),
      icon: '🎯'
    },
    {
      id: 'message',
      title: tAbout('message_title') || (locale === 'ar' ? 'رسالتنا' : 'Our Mission'),
      description: getLocalizedField(content, 'our_message', locale) || (
        locale === 'ar'
          ? 'تقديم منتجات أصلية بأسعار تنافسية ودعم فني متميز يضمن رضا كافة عملائنا.'
          : 'Providing original products at competitive prices with outstanding technical support ensuring client satisfaction.'
      ),
      icon: '💌'
    },
    {
      id: 'values',
      title: tSections('our_values'),
      description: getLocalizedField(content, 'our_values', locale) || (
        locale === 'ar'
          ? 'الجودة، الموثوقية، خدمة العملاء والتطوير المستمر.'
          : 'Quality, reliability, customer service, and continuous development.'
      ),
      icon: '💎'
    },
  ];

  return (
    <section className="py-24 bg-secondary relative overflow-hidden" id="about">
      <div className="container mx-auto px-6 max-w-7xl relative z-10">
        
        {/* Intro Section */}
        <div className="grid lg:grid-cols-2 gap-16 items-center mb-28">
          <div className="flex flex-col gap-6">
            <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-primary-subtle text-primary font-semibold text-sm w-fit">
              🏢 {tSections('about_us')}
            </div>
            
            <h2 className="text-4xl md:text-5xl font-extrabold text-foreground leading-tight">
              {tAbout('title_part1')} <span className="text-primary">{tAbout('title_part2')}</span>
            </h2>
            
            <p className="text-lg text-muted-foreground leading-relaxed">
              {weAreText}
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mt-6">
              {[
                { num: '10+', label: tAbout('years_experience') },
                { num: '500+', label: tAbout('completed_projects') },
                { num: '1000+', label: tAbout('happy_clients') },
                { num: '5+', label: tAbout('global_agencies') },
              ].map((stat, i) => (
                <div key={i} className="flex flex-col items-center sm:items-start">
                  <div className="text-3xl font-black text-primary mb-1">{stat.num}</div>
                  <div className="text-sm font-semibold text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-tr from-primary to-accent opacity-20 blur-3xl rounded-full" />
            <div className="relative bg-white border border-border rounded-3xl p-10 shadow-xl overflow-hidden group">
              <div className="absolute -right-10 -top-10 text-[180px] font-black text-slate-50 opacity-50 select-none group-hover:scale-110 transition-transform duration-700">
                HMEC
              </div>
              <div className="relative z-10">
                <h3 className="text-2xl font-bold text-foreground mb-4">
                  {tAbout('build_future_energy')}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {tAbout('about_description_extra')}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Vision, Mission, Values */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-primary-subtle text-primary font-semibold text-sm mb-4">
            ✨ {tSections('our_values')}
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4">
            {tSections('vision_mission_goals')}
          </h2>
          <p className="text-lg text-muted-foreground">
            {tAbout('vision_subtitle')}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-28">
          {aboutItems.map((item) => (
            <div 
              key={item.id} 
              className="bg-white p-8 rounded-2xl border border-border shadow-sm hover:shadow-xl hover:-translate-y-2 hover:border-primary/30 transition-all duration-300 flex flex-col items-center text-center group"
            >
              <div className="w-16 h-16 bg-secondary rounded-2xl flex items-center justify-center text-3xl mb-6 group-hover:scale-110 group-hover:bg-primary-subtle transition-all duration-300">
                {item.icon}
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3">{item.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{item.description}</p>
            </div>
          ))}
        </div>

        {/* Why Choose Us */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-primary-subtle text-primary font-semibold text-sm mb-4">
            💎 {tSections('why_choose_us')}
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4">
            {tSections('why_choose_hmec')}
          </h2>
          <p className="text-lg text-muted-foreground">
            {tAbout('why_choose_subtitle')}
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {whyChooseUs.map((item) => {
            const itemTitle = tWhyChoose.has(`items.${item.id}.title`)
              ? tWhyChoose(`items.${item.id}.title`)
              : (locale === 'ar' ? item.title : (item.titleEn || item.title));

            const itemDescription = tWhyChoose.has(`items.${item.id}.description`)
              ? tWhyChoose(`items.${item.id}.description`)
              : (locale === 'ar' ? item.description : (item.descriptionEn || item.description));

            const itemStat = tWhyChoose.has(`items.${item.id}.stat`)
              ? tWhyChoose(`items.${item.id}.stat`)
              : (locale === 'ar' ? item.stat : (item.statEn || item.stat));

            return (
              <div 
                key={item.id} 
                className="bg-white p-6 rounded-2xl border border-border shadow-sm hover:shadow-lg hover:border-accent/30 transition-all duration-300 group"
              >
                <div className="text-4xl font-black text-slate-100 group-hover:text-accent-light/20 transition-colors mb-2 -mt-2">
                  {itemStat}
                </div>
                <h4 className="text-lg font-bold text-foreground mb-2 -mt-4 relative z-10">
                  {itemTitle}
                </h4>
                <p className="text-sm text-muted-foreground leading-relaxed relative z-10">
                  {itemDescription}
                </p>
              </div>
            );
          })}
        </div>
        
      </div>
    </section>
  );
}
