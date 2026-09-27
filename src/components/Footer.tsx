'use client';

import { navLinks } from '@/config/site';
import type { ApiContent } from '@/types/api';
import { Monitor, Camera, Video, MapPin, Phone, Mail, Clock } from 'lucide-react';
import { useTranslations, useLocale } from 'next-intl';

interface FooterProps {
  content?: ApiContent;
}

export default function Footer({ content }: FooterProps) {
  const currentYear = new Date().getFullYear();
  const tFooter = useTranslations('Footer');
  const tNav = useTranslations('Navigation');
  const tCommon = useTranslations('Common');
  const tAbout = useTranslations('About');
  const locale = useLocale();

  const servicesKeys = ['supply', 'projects', 'solar', 'lighting', 'maintenance', 'consulting'];

  return (
    <footer className="bg-slate-950 pt-20 pb-8 border-t border-white/5 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <div className="absolute bottom-0 left-0 w-[800px] h-[400px] bg-primary/20 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/4" />
      </div>

      <div className="container mx-auto px-6 max-w-7xl relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          {/* Brand */}
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center font-black text-sm text-white tracking-tighter shadow-lg shadow-primary/30">
                HMEC
              </div>
              <span className="text-xl font-bold text-white">{tAbout('title_part1')}</span>
            </div>
            <p className="text-white/60 leading-relaxed">
              {locale === 'ar' ? content?.we_are_ar || 'مركز متخصص في توفير أحدث المنتجات والحلول الكهربائية من أكبر العلامات التجارية العالمية مع خدمة احترافية ودعم فني متخصص.' : content?.we_are_en || 'A specialized center in providing the latest electrical products and solutions from the biggest global brands with professional service and specialized technical support.'}
            </p>
            <div className="flex items-center gap-3 pt-2">
              {content?.facebook && (
                <a href={content.facebook} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 text-white/80 flex items-center justify-center hover:bg-primary hover:text-white hover:border-primary transition-all duration-300" title="فيسبوك">
                  <Monitor size={18} />
                </a>
              )}
              {content?.instagram && (
                <a href={content.instagram} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 text-white/80 flex items-center justify-center hover:bg-primary hover:text-white hover:border-primary transition-all duration-300" title="إنستجرام">
                  <Camera size={18} />
                </a>
              )}
              {content?.toktek && (
                <a href={content.toktek} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 text-white/80 flex items-center justify-center hover:bg-primary hover:text-white hover:border-primary transition-all duration-300" title="تيك توك">
                  <Video size={18} />
                </a>
              )}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-bold text-white mb-6">{tFooter('quick_links')}</h4>
            <ul className="flex flex-col gap-3">
              {navLinks.map((link) => (
                <li key={link.id}>
                  <a 
                    href={link.href} 
                    className="text-white/60 hover:text-primary transition-colors flex items-center gap-2 before:content-[''] before:w-1.5 before:h-1.5 before:rounded-full before:bg-primary before:opacity-0 hover:before:opacity-100 before:transition-opacity"
                  >
                    {tNav(link.id)}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-lg font-bold text-white mb-6">{tFooter('our_services')}</h4>
            <ul className="flex flex-col gap-3">
              {servicesKeys.map((key) => (
                <li key={key}>
                  <a 
                    href="#services" 
                    className="text-white/60 hover:text-primary transition-colors flex items-center gap-2 before:content-[''] before:w-1.5 before:h-1.5 before:rounded-full before:bg-primary before:opacity-0 hover:before:opacity-100 before:transition-opacity"
                  >
                    {tFooter(`services_list.${key}` as never)}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-lg font-bold text-white mb-6">{tFooter('contact_us')}</h4>
            <ul className="flex flex-col gap-4">
              <li>
                <a href="#contact" className="text-white/60 hover:text-primary transition-colors flex items-start gap-3">
                  <MapPin size={18} className="shrink-0 mt-0.5" />
                  <span>{locale === 'ar' ? content?.address_ar || 'المكلا، حضرموت' : content?.address_en || 'Mukalla, Hadramout'}</span>
                </a>
              </li>
              <li>
                <a href={content?.whatsapp || "tel:+9675000000"} className="text-white/60 hover:text-primary transition-colors flex items-center gap-3">
                  <Phone size={18} className="shrink-0" />
                  <span dir="ltr">{content?.whatsapp ? 'WhatsApp' : '+967 5 000 000'}</span>
                </a>
              </li>
              <li>
                <a href={`mailto:${content?.email || 'info@hmec.ye'}`} className="text-white/60 hover:text-primary transition-colors flex items-center gap-3">
                  <Mail size={18} className="shrink-0" />
                  <span>{content?.email || 'info@hmec.ye'}</span>
                </a>
              </li>
              <li className="text-white/60 flex items-center gap-3">
                <Clock size={18} className="shrink-0" />
                <span>{locale === 'ar' ? 'السبت - الخميس' : 'Saturday - Thursday'}</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-white/10 text-center text-white/50 text-sm">
          <p className="flex items-center justify-center gap-2 flex-wrap">
            © {currentYear} {tAbout('title_part1')} {tAbout('title_part2')}. {tCommon('all_rights_reserved')}
            <span className="text-red-500 animate-pulse">❤️</span>
            {tFooter('made_with_love')}
          </p>
        </div>
      </div>
    </footer>
  );
}
