'use client';

import { useState, FormEvent } from 'react';
import type { ContactFormData } from '@/types';
import type { ApiContent } from '@/types/api';
import { MapPin, Phone, Mail, Clock, Send, Monitor, Camera, Video } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslations, useLocale } from 'next-intl';
import { submitContactUsAction } from '@/actions/contacts.actions';

interface ContactProps {
  content?: ApiContent;
}

export default function Contact({ content }: ContactProps) {
  const tSections = useTranslations('Sections');
  const tContact = useTranslations('Contact');
  const tCommon = useTranslations('Common');
  const locale = useLocale();

  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });

  const [submitted, setSubmitted] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg(null);
    
    const res = await submitContactUsAction({
      name_ar: formData.name,
      name_en: formData.name,
      phone: formData.phone,
      subject: formData.subject,
      email: formData.email,
      message: formData.message,
    });

    setIsSubmitting(false);

    if (res.success) {
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 3000);
      setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
    } else {
      setErrorMsg(res.error || 'حدث خطأ أثناء الإرسال');
    }
  };

  return (
    <section className="py-24 bg-slate-900 relative overflow-hidden" id="contact">
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <div className="absolute top-1/4 left-0 w-96 h-96 bg-primary/30 rounded-full blur-[100px] -translate-x-1/2" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-accent/20 rounded-full blur-[120px] translate-x-1/3 translate-y-1/3" />
      </div>

      <div className="container mx-auto px-6 max-w-7xl relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white/10 text-primary-light font-semibold text-sm mb-4 border border-white/5 shadow-sm">
            📩 {tSections('contact_us')}
          </div>
          <h2 className="text-3xl md:text-5xl font-extrabold text-white leading-tight mb-4">
            {tContact('title').split(' ').map((word, index, arr) => (
              index === arr.length - 1 ? (
                <span key={index} className="text-primary-light">{word}</span>
              ) : (
                <span key={index}>{word} </span>
              )
            ))}
          </h2>
          <p className="text-lg text-white/70 leading-relaxed">
            {tContact('subtitle')}
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact Info */}
          <div className="bg-white/5 border border-white/10 rounded-3xl p-8 lg:p-12 backdrop-blur-sm">
            <h3 className="text-2xl font-bold text-white mb-4">{locale === 'ar' ? 'معلومات التواصل' : 'Contact Information'}</h3>
            <p className="text-white/70 leading-relaxed mb-10">
              {locale === 'ar' ? 'يسعدنا تواصلك معنا. فريقنا المتخصص جاهز لمساعدتك في اختيار المنتجات والحلول الكهربائية المناسبة لمشروعك.' : 'We are happy to hear from you. Our specialized team is ready to help you choose the right electrical products and solutions for your project.'}
            </p>

            <div className="flex flex-col gap-8 mb-10">
              <div className="flex gap-5 items-start">
                <div className="w-12 h-12 rounded-2xl bg-white/10 text-primary-light flex items-center justify-center shrink-0">
                  <MapPin size={24} />
                </div>
                <div>
                  <div className="text-lg font-bold text-white mb-1">{tCommon('address')}</div>
                  <div className="text-white/70 leading-relaxed">
                    {locale === 'ar' ? content?.address_ar || 'شارع الستين، المكلا، حضرموت، اليمن' : content?.address_en || 'Sixty Street, Mukalla, Hadramout, Yemen'}
                  </div>
                </div>
              </div>

              <div className="flex gap-5 items-start">
                <div className="w-12 h-12 rounded-2xl bg-white/10 text-primary-light flex items-center justify-center shrink-0">
                  <Phone size={24} />
                </div>
                <div>
                  <div className="text-lg font-bold text-white mb-1">{tCommon('phone')} {locale === 'ar' ? '(واتساب)' : '(Whatsapp)'}</div>
                  <div className="text-white/70 leading-relaxed">
                    {content?.whatsapp ? (
                      <a href={content.whatsapp} target="_blank" rel="noopener noreferrer" className="hover:text-primary-light transition-colors" dir="ltr">
                        {content.whatsapp}
                      </a>
                    ) : (
                      <span dir="ltr">+967 5 000 000</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex gap-5 items-start">
                <div className="w-12 h-12 rounded-2xl bg-white/10 text-primary-light flex items-center justify-center shrink-0">
                  <Mail size={24} />
                </div>
                <div>
                  <div className="text-lg font-bold text-white mb-1">{tCommon('email')}</div>
                  <div className="text-white/70 leading-relaxed">
                    <a href={`mailto:${content?.email || 'info@hmec.ye'}`} className="hover:text-primary-light transition-colors">
                      {content?.email || 'info@hmec.ye'}
                    </a>
                  </div>
                </div>
              </div>

              <div className="flex gap-5 items-start">
                <div className="w-12 h-12 rounded-2xl bg-white/10 text-primary-light flex items-center justify-center shrink-0">
                  <Clock size={24} />
                </div>
                <div>
                  <div className="text-lg font-bold text-white mb-1">{tCommon('working_hours')}</div>
                  <div className="text-white/70 leading-relaxed">
                    {locale === 'ar' ? 'السبت - الخميس: 8 صباحاً - 10 مساءً' : 'Saturday - Thursday: 8 AM - 10 PM'}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-8 border-t border-white/10">
              {content?.facebook && (
                <a href={content.facebook} target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-full bg-white/5 border border-white/10 text-white flex items-center justify-center hover:bg-primary hover:border-primary transition-all duration-300 hover:-translate-y-1">
                  <Monitor size={20} />
                </a>
              )}
              {content?.instagram && (
                <a href={content.instagram} target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-full bg-white/5 border border-white/10 text-white flex items-center justify-center hover:bg-primary hover:border-primary transition-all duration-300 hover:-translate-y-1">
                  <Camera size={20} />
                </a>
              )}
              {content?.toktek && (
                <a href={content.toktek} target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-full bg-white/5 border border-white/10 text-white flex items-center justify-center hover:bg-primary hover:border-primary transition-all duration-300 hover:-translate-y-1">
                  <Video size={20} />
                </a>
              )}
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-white rounded-3xl p-8 lg:p-12 shadow-xl">
            <h3 className="text-2xl font-bold text-foreground mb-8">{locale === 'ar' ? 'أرسل لنا رسالة' : 'Send us a message'}</h3>
            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                  <label htmlFor="contact-name" className="text-sm font-bold text-slate-700">{tCommon('full_name')}</label>
                  <input
                    id="contact-name"
                    type="text"
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-slate-800"
                    placeholder={locale === 'ar' ? 'أدخل اسمك الكامل' : 'Enter your full name'}
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label htmlFor="contact-email" className="text-sm font-bold text-slate-700">{tCommon('email')}</label>
                  <input
                    id="contact-email"
                    type="email"
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-slate-800"
                    placeholder="example@email.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                  <label htmlFor="contact-phone" className="text-sm font-bold text-slate-700">{tCommon('phone')}</label>
                  <input
                    id="contact-phone"
                    type="tel"
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-slate-800 text-left"
                    placeholder="+967 ..."
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    dir="ltr"
                    required
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label htmlFor="contact-subject" className="text-sm font-bold text-slate-700">{tCommon('subject')}</label>
                  <input
                    id="contact-subject"
                    type="text"
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-slate-800"
                    placeholder={locale === 'ar' ? 'موضوع الرسالة' : 'Subject'}
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="contact-message" className="text-sm font-bold text-slate-700">{tCommon('message')}</label>
                <textarea
                  id="contact-message"
                  rows={5}
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-slate-800 resize-none"
                  placeholder={locale === 'ar' ? 'اكتب رسالتك هنا...' : 'Write your message here...'}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  required
                />
              </div>

              <button 
                type="submit" 
                disabled={isSubmitting || submitted}
                className={cn(
                  "w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all duration-300",
                  submitted 
                    ? "bg-green-500 text-white" 
                    : isSubmitting
                    ? "bg-primary/70 text-white cursor-not-allowed"
                    : "bg-primary hover:bg-primary-dark text-white hover:shadow-lg hover:shadow-primary/30"
                )}
              >
                {submitted ? (
                  locale === 'ar' ? 'تم إرسال الرسالة بنجاح! ✅' : 'Message sent successfully! ✅'
                ) : isSubmitting ? (
                  locale === 'ar' ? 'جاري الإرسال...' : 'Sending...'
                ) : (
                  <>
                    <span>{tCommon('send_message')}</span>
                    <Send size={20} className={locale === 'ar' ? 'mr-2' : 'ml-2'} />
                  </>
                )}
              </button>
              {errorMsg && (
                <div className="text-red-500 text-sm text-center font-bold mt-2">
                  {errorMsg}
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
