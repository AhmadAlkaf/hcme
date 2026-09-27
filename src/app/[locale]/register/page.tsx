'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link, useRouter } from '@/i18n/routing';
import { Mail, Lock, User, Phone, ArrowRight, ArrowLeft, AlertCircle, Loader2, MapPin } from 'lucide-react';
import { useLocale } from 'next-intl';
import { registerUser } from '@/actions/auth.actions';

export default function RegisterPage() {
  const t = useTranslations('Auth');
  const tCommon = useTranslations('Common');
  const locale = useLocale();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, any>>({});
  
  const [formData, setFormData] = useState({
    username: '',
    phone_number: '',
    email: '',
    address: '',
    password: '',
    confirmPassword: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setFieldErrors({});

    if (formData.password !== formData.confirmPassword) {
      setError(locale === 'ar' ? 'كلمات المرور غير متطابقة' : 'Passwords do not match');
      setFieldErrors({ confirmPassword: locale === 'ar' ? 'كلمات المرور غير متطابقة' : 'Passwords do not match' });
      return;
    }

    setLoading(true);

    try {
      const response = await registerUser({
        username: formData.username,
        email: formData.email,
        phone_number: formData.phone_number,
        address: formData.address,
        password: formData.password,
        password2: formData.confirmPassword
      });

      if (response.success) {
        router.push('/login');
      } else {
        setError(response.error || 'حدث خطأ غير معروف');
        if ('errors' in response && response.errors) {
          setFieldErrors(response.errors);
        }
      }
    } catch (err) {
      setError(locale === 'ar' ? 'حدث خطأ أثناء الاتصال بالخادم' : 'Error connecting to the server');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden bg-slate-50/50">
      {/* Background ambient lighting */}
      <div className="absolute inset-0 pointer-events-none opacity-40">
        <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] -translate-y-1/2" />
        <div className="absolute bottom-0 left-1/4 w-[500px] h-[500px] bg-accent/15 rounded-full blur-[120px] translate-y-1/2" />
      </div>

      <div className="max-w-[400px] w-full space-y-6 relative z-10 bg-white/80 backdrop-blur-xl p-6 sm:p-8 rounded-[2rem] shadow-2xl border border-white/50">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 text-primary mb-6 shadow-inner">
            <User size={32} strokeWidth={2.5} />
          </div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">
            {t('register_title')}
          </h2>
          <p className="mt-3 text-sm font-medium text-slate-500">
            {t('register_subtitle')}
          </p>
        </div>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          
          {error && (
            <div className="p-4 rounded-xl bg-red-50 border border-red-100 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
              <p className="text-sm font-medium text-red-600">{error}</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              {t('username_label')}
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 start-0 flex items-center ps-4 pointer-events-none text-slate-400">
                <User size={20} />
              </div>
              <input
                type="text"
                name="username"
                required
                value={formData.username}
                onChange={handleChange}
                className={`block w-full ps-11 pe-4 py-3 bg-slate-50/50 border ${fieldErrors.username ? 'border-red-500 focus:ring-red-500/15 focus:border-red-500' : 'border-slate-200 focus:ring-primary/15 focus:border-primary'} rounded-2xl focus:outline-none focus:ring-4 transition-all text-slate-800 font-medium placeholder:text-slate-400 placeholder:font-normal`}
                placeholder={t('username_placeholder')}
              />
            </div>
            {fieldErrors.username && (
              <p className="mt-1.5 text-sm font-medium text-red-500 ps-2">{Array.isArray(fieldErrors.username) ? fieldErrors.username[0] : fieldErrors.username}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              {t('phone_label')}
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 start-0 flex items-center ps-4 pointer-events-none text-slate-400">
                <Phone size={20} />
              </div>
              <input
                type="tel"
                name="phone_number"
                required
                value={formData.phone_number}
                onChange={handleChange}
                className={`block w-full ps-11 pe-4 py-3 bg-slate-50/50 border ${fieldErrors.phone_number ? 'border-red-500 focus:ring-red-500/15 focus:border-red-500' : 'border-slate-200 focus:ring-primary/15 focus:border-primary'} rounded-2xl focus:outline-none focus:ring-4 transition-all text-slate-800 font-medium placeholder:text-slate-400 placeholder:font-normal`}
                placeholder={t('phone_placeholder')}
              />
            </div>
            {fieldErrors.phone_number && (
              <p className="mt-1.5 text-sm font-medium text-red-500 ps-2">{Array.isArray(fieldErrors.phone_number) ? fieldErrors.phone_number[0] : fieldErrors.phone_number}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              {t('email_label')}
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 start-0 flex items-center ps-4 pointer-events-none text-slate-400">
                <Mail size={20} />
              </div>
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                className={`block w-full ps-11 pe-4 py-3 bg-slate-50/50 border ${fieldErrors.email ? 'border-red-500 focus:ring-red-500/15 focus:border-red-500' : 'border-slate-200 focus:ring-primary/15 focus:border-primary'} rounded-2xl focus:outline-none focus:ring-4 transition-all text-slate-800 font-medium placeholder:text-slate-400 placeholder:font-normal`}
                placeholder={t('email_placeholder')}
              />
            </div>
            {fieldErrors.email && (
              <p className="mt-1.5 text-sm font-medium text-red-500 ps-2">{Array.isArray(fieldErrors.email) ? fieldErrors.email[0] : fieldErrors.email}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              {tCommon('address')}
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 start-0 flex items-center ps-4 pointer-events-none text-slate-400">
                <MapPin size={20} />
              </div>
              <input
                type="text"
                name="address"
                required
                value={formData.address}
                onChange={handleChange}
                className={`block w-full ps-11 pe-4 py-3 bg-slate-50/50 border ${fieldErrors.address ? 'border-red-500 focus:ring-red-500/15 focus:border-red-500' : 'border-slate-200 focus:ring-primary/15 focus:border-primary'} rounded-2xl focus:outline-none focus:ring-4 transition-all text-slate-800 font-medium placeholder:text-slate-400 placeholder:font-normal`}
                placeholder={tCommon('address')}
              />
            </div>
            {fieldErrors.address && (
              <p className="mt-1.5 text-sm font-medium text-red-500 ps-2">{Array.isArray(fieldErrors.address) ? fieldErrors.address[0] : fieldErrors.address}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              {t('password_label')}
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 start-0 flex items-center ps-4 pointer-events-none text-slate-400">
                <Lock size={20} />
              </div>
              <input
                type="password"
                name="password"
                required
                value={formData.password}
                onChange={handleChange}
                className={`block w-full ps-11 pe-4 py-3 bg-slate-50/50 border ${fieldErrors.password ? 'border-red-500 focus:ring-red-500/15 focus:border-red-500' : 'border-slate-200 focus:ring-primary/15 focus:border-primary'} rounded-2xl focus:outline-none focus:ring-4 transition-all text-slate-800 font-medium placeholder:text-slate-400 placeholder:font-normal`}
                placeholder={t('password_placeholder')}
              />
            </div>
            {fieldErrors.password && (
              <p className="mt-1.5 text-sm font-medium text-red-500 ps-2">{Array.isArray(fieldErrors.password) ? fieldErrors.password[0] : fieldErrors.password}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              {t('confirm_password_label')}
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 start-0 flex items-center ps-4 pointer-events-none text-slate-400">
                <Lock size={20} />
              </div>
              <input
                type="password"
                name="confirmPassword"
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                className={`block w-full ps-11 pe-4 py-3 bg-slate-50/50 border ${fieldErrors.confirmPassword || fieldErrors.password2 ? 'border-red-500 focus:ring-red-500/15 focus:border-red-500' : 'border-slate-200 focus:ring-primary/15 focus:border-primary'} rounded-2xl focus:outline-none focus:ring-4 transition-all text-slate-800 font-medium placeholder:text-slate-400 placeholder:font-normal`}
                placeholder={t('confirm_password_placeholder')}
              />
            </div>
            {(fieldErrors.confirmPassword || fieldErrors.password2) && (
              <p className="mt-1.5 text-sm font-medium text-red-500 ps-2">{
                Array.isArray(fieldErrors.confirmPassword || fieldErrors.password2) 
                  ? (fieldErrors.confirmPassword || fieldErrors.password2)[0] 
                  : (fieldErrors.confirmPassword || fieldErrors.password2)
              }</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="group relative w-full flex justify-center items-center gap-2 py-4 px-4 border border-transparent text-lg font-extrabold rounded-2xl text-white bg-gradient-to-r from-primary to-primary-dark hover:from-primary-dark hover:to-primary shadow-xl shadow-primary/25 hover:shadow-2xl hover:shadow-primary/40 hover:-translate-y-0.5 transition-all duration-300 mt-6 disabled:opacity-70 disabled:hover:-translate-y-0 disabled:hover:shadow-xl"
          >
            {loading ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
              <>
                {t('register_button')}
                {locale === 'ar' ? (
                  <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                ) : (
                  <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                )}
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm font-medium text-slate-600">
            {t('have_account')}{' '}
            <Link href="/login" className="font-extrabold text-primary hover:text-primary-dark transition-colors">
              {t('login_now')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
