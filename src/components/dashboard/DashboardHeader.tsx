'use client';

import React from 'react';
import { Menu, X, Plus, Sun, Moon, Bell, LogOut, User as UserIcon, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useRouter } from 'next/navigation';
import { logoutUser } from '@/actions/auth.actions';
import { AuthUser } from '@/types';

interface DashboardHeaderProps {
  isMobileOpen: boolean;
  onToggleMobile: () => void;
  isSidebarCollapsed: boolean;
  onToggleSidebarCollapsed: () => void;
  onOpenAddProduct: () => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  showNotifications: boolean;
  onToggleNotifications: () => void;
  user?: AuthUser | null;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  isMobileOpen,
  onToggleMobile,
  isSidebarCollapsed,
  onToggleSidebarCollapsed,
  onOpenAddProduct,
  isDarkMode,
  onToggleDarkMode,
  showNotifications,
  onToggleNotifications,
  user,
}) => {
  const router = useRouter();

  const handleLogout = async () => {
    await logoutUser();
    router.push('/login'); // Will redirect to localized /login if needed or default /ar/login
  };

  return (
    <header className="sticky top-0 z-40 bg-card/90 backdrop-blur-md border-b border-border px-4 lg:px-6 py-3 flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        {/* Mobile menu toggle */}
        <button
          onClick={onToggleMobile}
          className="lg:hidden p-2 rounded-xl border border-input text-muted-foreground hover:text-foreground hover:bg-muted"
        >
          {isMobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>

        {/* Desktop collapse sidebar toggle */}
        <button
          onClick={onToggleSidebarCollapsed}
          className="hidden lg:flex p-2 rounded-xl border border-input text-muted-foreground hover:text-foreground hover:bg-muted"
          title="طي/توسيع القائمة الجانبية"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Brand Logo & Name */}
        <Link href="/" className="flex items-center gap-2.5 cursor-pointer hover:opacity-80 transition-opacity">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary via-primary-dark to-accent flex items-center justify-center text-primary-foreground font-black text-lg shadow-md shadow-primary/20">
            ⚡
          </div>
          <div className="hidden sm:block">
            <span className="font-extrabold text-sm sm:text-base text-foreground tracking-tight block leading-none">
              مركز حضرموت الحديث
            </span>
            <span className="text-[10px] font-bold text-primary tracking-wide">
              لوحة تحكم إدارة المحتوى | HMEC Dashboard
            </span>
          </div>
        </Link>
      </div>

      {/* Right Action Tools */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Quick Add Product Button */}
          {/* <div className="hidden md:flex items-center gap-2">
            <button
              onClick={onOpenAddProduct}
              className="px-3.5 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:opacity-90 shadow-sm transition-opacity flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              إضافة منتج
            </button>
          </div> */}

        {/* Theme Mode Switch */}
        {/* <button
          onClick={onToggleDarkMode}
          className="p-2.5 rounded-xl border border-input text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          title={isDarkMode ? 'الوضع الفاتح' : 'الوضع الداكن'}
        >
          {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
        </button> */}

     

        {/* Admin Profile Chip with Popover */}
        <Popover>
          <PopoverTrigger asChild>
            <button className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-muted/50 border border-transparent hover:border-border transition-all outline-none">
              <div className="w-8 h-8 rounded-xl bg-primary/10 border border-primary/30 flex items-center justify-center text-primary font-bold text-xs uppercase">
                {user?.username ? user.username.charAt(0) : 'M'}
              </div>
              <div className="hidden lg:block text-right">
                <span className="font-bold text-xs block text-foreground leading-none">
                  {user?.username || 'مدير النظام'}
                </span>
                <span className="text-[10px] text-muted-foreground">
                  {user?.email || 'المدير العام لـ HMEC'}
                </span>
              </div>
              <ChevronDown className="w-4 h-4 text-muted-foreground hidden lg:block" />
            </button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-56 p-2 rounded-xl">
            <div className="flex flex-col gap-1">
              <div className="px-2 py-1.5 border-b border-border mb-1">
                <p className="text-sm font-bold text-foreground truncate">{user?.username || 'مدير النظام'}</p>
                <p className="text-xs text-muted-foreground truncate">{user?.email || 'admin@hmec.com'}</p>
              </div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-2 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors text-right"
              >
                <LogOut className="w-4 h-4" />
                تسجيل الخروج
              </button>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </header>
  );
};
