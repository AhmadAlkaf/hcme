'use client';

import { ShieldCheck, Truck, Headphones, CheckCircle2 } from 'lucide-react';
import { useLocale } from 'next-intl';

export default function ProductGuarantees() {
  const locale = useLocale();

  const guarantees = [
    {
      icon: ShieldCheck,
      title: locale === 'ar' ? 'ضمان الأصالة 100%' : '100% Genuine Guarantee',
      desc: locale === 'ar' ? 'منتجات أصلية مباشرة من الوكلاء المعنيين' : 'Direct from authorized global agents'
    },
    {
      icon: Truck,
      title: locale === 'ar' ? 'توصيل سريع' : 'Fast Delivery',
      desc: locale === 'ar' ? 'توصيل وتوريد لجميع مناطق حضرموت واليمن' : 'Express shipping across Hadramout'
    },
    {
      icon: Headphones,
      title: locale === 'ar' ? 'دعم فني متخصص' : 'Technical Support',
      desc: locale === 'ar' ? 'فريق هندسي جاهز للاستشارات الفنية' : 'Expert engineering assistance'
    },
    {
      icon: CheckCircle2,
      title: locale === 'ar' ? 'أسعار منافسة' : 'Competitive Pricing',
      desc: locale === 'ar' ? 'أفضل أسعار الجملة والتجزئة بالمملكة واليمن' : 'Best wholesale & retail rates'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {guarantees.map((feat, idx) => {
        const Icon = feat.icon;
        return (
          <div
            key={idx}
            className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex items-start gap-4"
          >
            <div className="w-12 h-12 rounded-xl bg-primary-subtle text-primary flex items-center justify-center shrink-0">
              <Icon size={24} />
            </div>
            <div>
              <h4 className="font-extrabold text-slate-800 text-sm mb-1">{feat.title}</h4>
              <p className="text-slate-500 text-xs leading-relaxed">{feat.desc}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
