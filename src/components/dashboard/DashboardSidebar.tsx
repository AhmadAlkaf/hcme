'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Globe,
  Package,
  ImageIcon,
  FolderKanban,
  FolderTree,
  Building2,
  ShoppingBag,
  Settings,
  Zap,
  X,
  MessageSquare,
  Users,
  Receipt
} from 'lucide-react';

export interface NavRouteItem {
  href: string;
  label: string;
  icon: React.ElementType;
  badge?: number | string;
  badgeColor?: string;
}

interface DashboardSidebarProps {
  isCollapsed: boolean;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
  productsCount?: number;
  projectsCount?: number;
  branchesCount?: number;
  ordersCount?: number;
  mediaCount?: number;
}

export const DashboardSidebar: React.FC<DashboardSidebarProps> = ({
  isCollapsed,
  isMobileOpen,
  onCloseMobile,
  productsCount = 0,
  projectsCount = 0,
  branchesCount = 0,
  ordersCount = 0,
  mediaCount = 0,
}) => {
  const pathname = usePathname();

  const navItems: NavRouteItem[] = [
   
    { href: '/dashboard', label: 'الرئيسية والتحليلات', icon: LayoutDashboard },
    { href: '/dashboard/site-cms', label: 'إدارة المحتوى', icon: Globe },
    { href: '/dashboard/departments', label: 'الأقسام', icon: FolderTree },
    { href: '/dashboard/products', label: 'إدارة المنتجات', icon: Package, badge: productsCount },
    { href: '/dashboard/projects', label: 'إدارة المشاريع', icon: FolderKanban, badge: projectsCount },
    { href: '/dashboard/hr', label: 'الموارد البشرية', icon: Users },
    { href: '/dashboard/contact-messages', label: 'رسائل التواصل', icon: MessageSquare },
    {
      href: '/dashboard/orders',
      label: 'الطلبات ',
      icon: ShoppingBag,
      badge: ordersCount,
      badgeColor: ordersCount > 0 ? 'bg-amber-500 text-white' : undefined,
    },
    {
      href: '/dashboard/bills',
      label: 'الفواتير',
      icon: Receipt,
    },
  ];

  return (
    <>
      {/* Desktop Collapsible Sidebar */}
      <aside
        className={`hidden lg:flex flex-col bg-card border-l border-border transition-all duration-300 ${
          isCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        <div className="p-4 space-y-1 overflow-y-auto flex-1">
          <span
            className={`text-[10px] font-extrabold text-muted-foreground uppercase tracking-wider block px-3 mb-2 ${
              isCollapsed ? 'text-center' : ''
            }`}
          >
            {isCollapsed ? 'الأقسام' : 'صفحات لوحة التحكم'}
          </span>

          {navItems.map((item) => {
            const IconComponent = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
                } ${isCollapsed ? 'justify-center' : 'justify-between'}`}
                title={item.label}
              >
                <div className="flex items-center gap-3">
                  <IconComponent className={`w-5 h-5 shrink-0 ${isActive ? 'text-primary-foreground' : ''}`} />
                  {!isCollapsed && <span>{item.label}</span>}
                </div>
                {!isCollapsed && item.badge !== undefined && (
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                      item.badgeColor || (isActive ? 'bg-white/20 text-white' : 'bg-primary/10 text-primary')
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>

        {/* Sidebar Footer Badge */}
        {!isCollapsed && (
          <div className="p-4 border-t border-border">
            <div className="p-3 rounded-xl bg-primary/5 border border-primary/20 space-y-1">
              <span className="text-xs font-bold text-primary flex items-center gap-1">
                <Zap className="w-3.5 h-3.5" />
                وكلاء معتمدون
              </span>
              {/* <p className="text-[10px] text-muted-foreground">
                شنايدر، ABB، لوغراند، فيليبس، سيمنز
              </p> */}
            </div>
          </div>
        )}
      </aside>

      {/* Mobile Drawer Sidebar */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm lg:hidden flex">
          <div className="w-72 bg-card text-card-foreground border-l border-border h-full p-4 space-y-2 flex flex-col justify-between animate-in slide-in-from-right duration-200">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <span className="font-extrabold text-sm text-foreground">قائمة لوحة التحكم</span>
                <button onClick={onCloseMobile} className="p-1 rounded-lg text-muted-foreground">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-1">
                {navItems.map((item) => {
                  const IconComponent = item.icon;
                  const isActive = pathname === item.href;

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={onCloseMobile}
                      className={`w-full flex items-center justify-between px-3 py-3 rounded-xl text-xs font-bold ${
                        isActive ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <IconComponent className="w-5 h-5" />
                        <span>{item.label}</span>
                      </div>
                      {item.badge !== undefined && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] bg-primary/20 text-primary font-bold">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
