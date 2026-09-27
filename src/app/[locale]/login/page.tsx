'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { User, Lock, ArrowRight, ArrowLeft } from 'lucide-react';
import { useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import { loginUser } from '@/actions/auth.actions';

export default function LoginPage() {
  const t = useTranslations('Auth');
  const locale = useLocale();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, any>>({});
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setFieldErrors({});

    const res = await loginUser({ username, password });

    if (res.success) {
      const isStaff = res.data?.user?.is_staff === true;
      if (isStaff) {
        router.push('/dashboard');
      } else {
        router.push('/');
      }
    } else {
      setError(res.error || 'حدث خطأ غير متوقع');
      if (res.errors) {
        setFieldErrors(res.errors);
      }
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden bg-slate-50/50">
      {/* Background ambient lighting */}
      <div className="absolute inset-0 pointer-events-none opacity-40">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] -translate-y-1/2" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-accent/15 rounded-full blur-[120px] translate-y-1/2" />
      </div>

      <div className="max-w-[400px] w-full space-y-6 relative z-10 bg-white/80 backdrop-blur-xl p-6 sm:p-8 rounded-[2rem] shadow-2xl border border-white/50">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 text-primary mb-6 shadow-inner">
            <Lock size={32} strokeWidth={2.5} />
          </div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">
            {t('login_title')}
          </h2>
          <p className="mt-3 text-sm font-medium text-slate-500">
            {t('login_subtitle')}
          </p>
        </div>

        <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
          {error && (
            <div className="p-3 rounded-xl bg-red-50 text-red-600 text-sm font-medium border border-red-100">
              {error}
            </div>
          )}
          <div className="space-y-4">
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
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className={`block w-full ps-11 pe-4 py-3.5 bg-slate-50/50 border ${fieldErrors.username || fieldErrors.email ? 'border-red-500 focus:ring-red-500/15 focus:border-red-500' : 'border-slate-200 focus:ring-primary/15 focus:border-primary'} rounded-2xl focus:outline-none focus:ring-4 transition-all text-slate-800 font-medium placeholder:text-slate-400 placeholder:font-normal`}
                  placeholder={t('username_placeholder')}
                />
              </div>
              {(fieldErrors.username || fieldErrors.email) && (
                <p className="mt-1.5 text-sm font-medium text-red-500 ps-2">
                  {Array.isArray(fieldErrors.username || fieldErrors.email) 
                    ? (fieldErrors.username || fieldErrors.email)[0] 
                    : (fieldErrors.username || fieldErrors.email)}
                </p>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-bold text-slate-700">
                  {t('password_label')}
                </label>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 start-0 flex items-center ps-4 pointer-events-none text-slate-400">
                  <Lock size={20} />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`block w-full ps-11 pe-4 py-3.5 bg-slate-50/50 border ${fieldErrors.password ? 'border-red-500 focus:ring-red-500/15 focus:border-red-500' : 'border-slate-200 focus:ring-primary/15 focus:border-primary'} rounded-2xl focus:outline-none focus:ring-4 transition-all text-slate-800 font-medium placeholder:text-slate-400 placeholder:font-normal`}
                  placeholder={t('password_placeholder')}
                />
              </div>
              {fieldErrors.password && (
                <p className="mt-1.5 text-sm font-medium text-red-500 ps-2">
                  {Array.isArray(fieldErrors.password) ? fieldErrors.password[0] : fieldErrors.password}
                </p>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="group relative w-full flex justify-center items-center gap-2 py-4 px-4 border border-transparent text-lg font-extrabold rounded-2xl text-white bg-gradient-to-r from-primary to-primary-dark hover:from-primary-dark hover:to-primary shadow-xl shadow-primary/25 hover:shadow-2xl hover:shadow-primary/40 hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-70 disabled:hover:translate-y-0 disabled:cursor-not-allowed"
          >
            {isLoading ? 'جاري تسجيل الدخول...' : t('login_button')}
            {!isLoading && (locale === 'ar' ? (
              <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            ) : (
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            ))}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm font-medium text-slate-600">
            {t('no_account')}{' '}
            <Link href="/register" className="font-extrabold text-primary hover:text-primary-dark transition-colors">
              {t('create_account')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
