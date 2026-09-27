'use client';

import { useState, useEffect } from 'react';
import { navLinks } from '@/config/site';
import { ApiContent } from '@/types/api';
import { ShoppingCart, User, Menu, X, Globe, LogIn, LogOut, Package } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslations, useLocale } from 'next-intl';
import { usePathname, useRouter, Link } from '@/i18n/routing';
import { useCart } from '@/context/CartContext';
import { logoutUser } from '@/actions/auth.actions';

interface NavbarProps {
  contactInfo?: ApiContent;
  isAuthenticated?: boolean;
}

export default function Navbar({ contactInfo, isAuthenticated = false }: NavbarProps) {
  const { openCart, totalItems } = useCart();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const t = useTranslations('Navigation');
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const [isLoggedIn, setIsLoggedIn] = useState(isAuthenticated);

  // Sync state with server prop
  useEffect(() => {
    setIsLoggedIn(isAuthenticated);
  }, [isAuthenticated]);

  // Client-side check on mount to ensure cookie sync
  useEffect(() => {
    const hasUserInfo = document.cookie.split(';').some((item) => item.trim().startsWith('user_info='));
    if (hasUserInfo !== isLoggedIn) {
      setIsLoggedIn(hasUserInfo);
    }
  }, [isLoggedIn]);

  const handleLogout = async () => {
    await logoutUser();
    setIsLoggedIn(false);
    setMobileOpen(false);
    router.refresh();
    router.push('/login');
  };

  const isHomePage = pathname === '/' || pathname === '';

  // Track scroll position for navbar bg effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Listen to path changes to trigger pending scroll
  useEffect(() => {
    if (isHomePage) {
      const pendingTarget = sessionStorage.getItem('pendingScrollSection');
      if (pendingTarget) {
        sessionStorage.removeItem('pendingScrollSection');
        
        let attempts = 0;
        const scrollInterval = setInterval(() => {
          const el = document.querySelector(pendingTarget);
          if (el) {
            el.scrollIntoView({ behavior: 'smooth' });
            clearInterval(scrollInterval);
          }
          attempts++;
          if (attempts > 20) { // Timeout after 2 seconds
            clearInterval(scrollInterval);
          }
        }, 100);

        return () => clearInterval(scrollInterval);
      }
    }
  }, [pathname, isHomePage]);

  const handleNavClick = (linkId: string, href: string) => {
    setMobileOpen(false);

    // If it's the products or projects pages, route directly
    if (linkId === 'products') {
      router.push('/products');
      return;
    }
    if (linkId === 'projects') {
      router.push('/projects');
      return;
    }

    // Otherwise, it's a section on the home landing page
    if (isHomePage) {
      const el = document.querySelector(href);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      // Save section anchor and route to homepage
      sessionStorage.setItem('pendingScrollSection', href);
      router.push('/');
    }
  };

  const toggleLanguage = () => {
    const nextLocale = locale === 'ar' ? 'en' : 'ar';
    router.replace(pathname, { locale: nextLocale });
  };

  return (
    <>
      <nav 
        className={cn(
          "fixed top-0 right-0 left-0 h-20 z-50 transition-all duration-300",
          scrolled || !isHomePage
            ? "bg-white/90 backdrop-blur-lg shadow-md border-b border-slate-200/80 text-slate-800" 
            : "bg-transparent text-white"
        )} 
        id="navbar"
      >
        <div className="container mx-auto px-6 h-full flex items-center justify-between max-w-7xl">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 text-xl font-extrabold transition-transform hover:scale-105">
            <div className="w-11 h-11 rounded-xl bg-primary flex items-center justify-center font-black text-sm text-white tracking-tighter shadow-md shadow-primary/20">
              HMEC
            </div>
            <span className={cn(
              "transition-colors duration-300 font-black tracking-tight",
              scrolled || !isHomePage ? "text-slate-900" : "text-white"
            )}>
              {locale === 'ar' ? 'مركز حضرموت الحديث' : 'Hadramout Modern Center'}
            </span>
          </Link>

          {/* Desktop Links */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => {
              const isCurrentPage = 
                (link.id === 'products' && pathname.startsWith('/products')) ||
                (link.id === 'projects' && pathname.startsWith('/projects'));

              return (
                <button
                  key={link.id}
                  className={cn(
                    "px-3.5 py-2 rounded-xl text-sm font-bold transition-all duration-300",
                    scrolled || !isHomePage
                      ? "text-slate-700 hover:text-primary hover:bg-primary-subtle" 
                      : "text-white/90 hover:text-white hover:bg-white/10",
                    isCurrentPage && "text-primary bg-primary-subtle font-black"
                  )}
                  onClick={() => handleNavClick(link.id, link.href)}
                >
                  {t(link.id)}
                </button>
              );
            })}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button 
              onClick={openCart}
              className={cn(
                "relative w-10 h-10 rounded-xl flex items-center justify-center transition-colors shadow-xs",
                scrolled || !isHomePage
                  ? "text-slate-700 hover:text-primary hover:bg-primary-subtle border border-slate-200" 
                  : "text-white/90 hover:text-white hover:bg-white/10 border border-white/20"
              )} 
              title={locale === 'ar' ? "سلة التسوق" : "Cart"}
            >
              <ShoppingCart size={20} />
              {totalItems > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-primary text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-white shadow-xs">
                  {totalItems}
                </span>
              )}
            </button>
            
            {isLoggedIn && (
              <Link 
                href="/orders"
                className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center transition-colors shadow-xs",
                  scrolled || !isHomePage
                    ? "text-slate-700 hover:text-primary hover:bg-primary-subtle border border-slate-200" 
                    : "text-white/90 hover:text-white hover:bg-white/10 border border-white/20"
                )} 
                title={locale === 'ar' ? "طلباتي" : "My Orders"}
              >
                <Package size={20} />
              </Link>
            )}
            
            {isLoggedIn ? (
              <button 
                onClick={handleLogout}
                className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center transition-colors shadow-xs cursor-pointer",
                  scrolled || !isHomePage
                    ? "text-slate-700 hover:text-red-600 hover:bg-red-50 border border-slate-200" 
                    : "text-white/90 hover:text-red-400 hover:bg-white/10 border border-white/20"
                )} 
                title={locale === 'ar' ? "تسجيل الخروج" : "Logout"}
              >
                <LogOut size={20} />
              </button>
            ) : (
              <>
                <Link 
                  href="/register"
                  className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center transition-colors shadow-xs",
                    scrolled || !isHomePage
                      ? "text-slate-700 hover:text-primary hover:bg-primary-subtle border border-slate-200" 
                      : "text-white/90 hover:text-white hover:bg-white/10 border border-white/20"
                  )} title={locale === 'ar' ? "إنشاء حساب" : "Register"}
                >
                  <User size={20} />
                </Link>
                
                <Link 
                  href="/login"
                  className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center transition-colors shadow-xs",
                    scrolled || !isHomePage
                      ? "text-slate-700 hover:text-primary hover:bg-primary-subtle border border-slate-200" 
                      : "text-white/90 hover:text-white hover:bg-white/10 border border-white/20"
                  )} title={locale === 'ar' ? "تسجيل الدخول" : "Login"}
                >
                  <LogIn size={20} />
                </Link>
              </>
            )}
            
            <button 
              onClick={toggleLanguage}
              className={cn(
                "px-3.5 py-2 rounded-xl text-xs font-black border transition-colors hidden sm:flex items-center gap-1.5 shadow-xs",
                scrolled || !isHomePage
                  ? "border-slate-200 text-slate-700 hover:border-primary hover:text-primary hover:bg-primary-subtle" 
                  : "border-white/30 text-white/90 hover:border-white hover:bg-white/10"
              )}
              title={locale === 'ar' ? "English" : "العربية"}
            >
              <Globe size={15} />
              {locale === 'ar' ? 'English' : 'العربية'}
            </button>

            {/* Mobile Menu Button */}
            <button
              className={cn(
                "lg:hidden w-10 h-10 flex flex-col items-center justify-center transition-colors rounded-xl border",
                scrolled || !isHomePage
                  ? "text-slate-900 border-slate-200 bg-white" 
                  : "text-white border-white/20 bg-white/10"
              )}
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label={locale === 'ar' ? "القائمة" : "Menu"}
            >
              {mobileOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <div className={cn(
        "fixed inset-0 top-20 bg-white/95 backdrop-blur-2xl z-40 lg:hidden transition-all duration-300 flex flex-col p-6 overflow-y-auto shadow-2xl",
        mobileOpen ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-10 pointer-events-none"
      )}>
        <div className="flex flex-col gap-2">
          {navLinks.map((link) => {
            const isCurrentPage = 
              (link.id === 'products' && pathname.startsWith('/products')) ||
              (link.id === 'projects' && pathname.startsWith('/projects'));

            return (
              <button
                key={link.id}
                className={cn(
                  "text-start px-4 py-3 text-base font-extrabold rounded-xl transition-colors flex items-center justify-between",
                  isCurrentPage 
                    ? "bg-primary-subtle text-primary" 
                    : "text-slate-700 hover:bg-slate-50"
                )}
                onClick={() => handleNavClick(link.id, link.href)}
              >
                <span>{t(link.id)}</span>
                {link.id === 'products' && <span className="text-xs bg-primary text-white px-2 py-0.5 rounded-full font-bold">جديد</span>}
              </button>
            );
          })}
        </div>
        
        <div className="mt-8 pt-8 border-t border-slate-100 flex items-center justify-center gap-4">
          <button 
            onClick={() => { openCart(); setMobileOpen(false); }}
            className="w-12 h-12 rounded-2xl flex items-center justify-center text-slate-700 bg-slate-100 hover:bg-primary-subtle hover:text-primary transition-colors relative shadow-xs"
          >
            <ShoppingCart size={22} />
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 bg-primary text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center">
                {totalItems}
              </span>
            )}
          </button>

          {isLoggedIn && (
            <Link 
              href="/orders"
              onClick={() => setMobileOpen(false)}
              className="w-12 h-12 rounded-2xl flex items-center justify-center text-slate-700 bg-slate-100 hover:bg-primary-subtle hover:text-primary transition-colors relative shadow-xs"
              title={locale === 'ar' ? "طلباتي" : "My Orders"}
            >
              <Package size={22} />
            </Link>
          )}

          <button 
            onClick={toggleLanguage}
            className="px-6 py-3 rounded-2xl font-black border border-slate-200 text-slate-800 hover:border-primary hover:text-primary hover:bg-primary-subtle transition-colors flex items-center gap-2 text-sm shadow-xs"
          >
            <Globe size={18} />
            {locale === 'ar' ? 'English' : 'العربية'}
          </button>
        </div>
      </div>
    </>
  );
}
