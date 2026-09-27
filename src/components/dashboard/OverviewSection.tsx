'use client';

import React from 'react';
import {
  Package,
  FolderKanban,
  ShoppingBag,
  Zap,
  FileText,
  Target,
  Image as ImageIcon,
  Award,
  Wrench,
  Layers,
  Building2,
  PhoneCall,
  Star,
  ChevronLeft,
  Globe
} from 'lucide-react';
import type { ApiProduct, ApiProject } from '@/types/api';
import type { OrderItem } from '@/types';

interface OverviewSectionProps {
  products: ApiProduct[];
  projects: ApiProject[];
  branches?: Record<string, unknown>[];
  orders: OrderItem[];
  onNavigateTab: (tab: string) => void;
}

export const OverviewSection: React.FC<OverviewSectionProps> = ({
  products,
  projects,
  orders,
  onNavigateTab,
}) => {
  const newOrdersCount = orders.filter((o) => o.status === 'processing').length;

  // The 9 requested CMS sections cards
  const cmsCards = [
    {
      id: 'content',
      title: 'المحتوى',
      subtitle: 'العناوين الرئيسية، الهيدر، رؤيتنا ورسالتنا، ونصوص من نحن',
      icon: FileText,
      badge: 'النص التعريفي',
      badgeColor: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
      actionText: 'إدارة وتعديل المحتوى',
    },
    {
      id: 'goals',
      title: 'الأهداف',
      subtitle: 'أهداف المركز وركائز مميزات "لماذا تختارنا"',
      icon: Target,
      badge: 'الأهداف والتمايز',
      badgeColor: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
      actionText: 'إدارة الأهداف والتمايز',
    },
    {
      id: 'slider',
      title: 'شريط العرض',
      subtitle: 'بنرات السلايدر الرئيسي وصور العروض الترويجية بالصفحة الرئيسية',
      icon: ImageIcon,
      badge: 'البنرات والسلايدر',
      badgeColor: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
      actionText: 'إدارة السلايدر والبنرات',
    },
    {
      id: 'agencies',
      title: 'وكيلنا',
      subtitle: 'العلامات التجارية المعتمدة (شنايدر، ABB، لوغراند، فيليبس...)',
      icon: Award,
      badge: 'الماركات والوكلاء',
      badgeColor: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
      actionText: 'إدارة وتعديل الوكلاء',
    },
    {
      id: 'general_service',
      title: 'الخدمة العامة',
      subtitle: 'النص التعريفي الموحد للخدمات، شارات الكفالة وشروط الضمان',
      icon: Wrench,
      badge: 'قواعد الخدمة العامة',
      badgeColor: 'bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20',
      actionText: 'إعدادات الخدمات العامة',
    },
    {
      id: 'services',
      title: 'الخدمة',
      subtitle: 'قائمة خدمات التوريد والطاقة الشمسية والإنارة والصيانة',
      icon: Layers,
      badge: 'قائمة الخدمات',
      badgeColor: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20',
      actionText: 'إدارة قائمة الخدمات',
    },
    {
      id: 'branches_info',
      title: 'الفرع',
      subtitle: 'محتوى ونصوص الفروع ومنافذ البيع ومعلومات الاتصال',
      icon: Building2,
      badge: 'بيانات الفروع',
      badgeColor: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
      actionText: 'إدارة قسم وساعات الفروع',
    },
    {
      id: 'contact_info',
      title: 'اتصل بنا',
      subtitle: 'أرقام الهاتف، الواتساب، البريد الإلكتروني، والخرائط وسوشيال ميديا',
      icon: PhoneCall,
      badge: 'بيانات التواصل',
      badgeColor: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20',
      actionText: 'إدارة قنوات الاتصال',
    },
    {
      id: 'testimonials',
      title: 'آراء العملاء',
      subtitle: 'مراجعات وتقييمات العملاء والمهندسين واعتماد العرض',
      icon: Star,
      badge: 'التقييمات والمراجعات',
      badgeColor: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
      actionText: 'إدارة التقييمات والمراجعات',
    },
  ] as const;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Welcome Banner Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-card via-card to-primary/10 text-card-foreground border border-border/80 p-6 sm:p-8 shadow-xl backdrop-blur-xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-primary/10 text-primary">
                <Zap className="w-5 h-5" />
              </span>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-foreground">
                الرئيسية - لوحة تحكم مركز حضرموت الحديث (HMEC)
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-2xl leading-relaxed">
              الوصول السريع لإدارة  محتوى الموقع العام بكل سهولة ووضوح.
            </p>
          </div>
        </div>
      </div>

      {/* Top Main Modules (Products, Projects, Orders) */}
      <div className="space-y-3">
        <h3 className="text-sm font-extrabold text-muted-foreground tracking-wider uppercase flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-primary" />
          الوحدات الأساسية
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Products Card */}
          <div
            onClick={() => onNavigateTab('products')}
            className="bg-card hover:border-primary/50 text-card-foreground border border-border/80 p-5 rounded-3xl shadow-sm transition-all cursor-pointer group hover:-translate-y-1"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-muted-foreground">إدارة المنتجات</span>
              <div className="p-3 rounded-2xl bg-primary/10 text-primary group-hover:scale-110 transition-transform">
                <Package className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4 flex items-baseline justify-between">
              <span className="text-3xl font-black text-foreground">{products.length}</span>
              <span className="text-xs font-bold text-primary">المخزون والمنتجات</span>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">انقر لإدارة وتصفح كتالوج المنتجات</p>
          </div>

          {/* Projects Card */}
          <div
            onClick={() => onNavigateTab('projects')}
            className="bg-card hover:border-blue-500/50 text-card-foreground border border-border/80 p-5 rounded-3xl shadow-sm transition-all cursor-pointer group hover:-translate-y-1"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-muted-foreground">إدارة المشاريع</span>
              <div className="p-3 rounded-2xl bg-blue-500/10 text-blue-500 group-hover:scale-110 transition-transform">
                <FolderKanban className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4 flex items-baseline justify-between">
              <span className="text-3xl font-black text-foreground">{projects.length}</span>
              <span className="text-xs font-bold text-blue-500">المشاريع المنجزة</span>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">انقر لإضافة وإدارة مشاريع HMEC</p>
          </div>

          {/* Orders Card */}
          <div
            onClick={() => onNavigateTab('orders')}
            className="bg-card hover:border-amber-500/50 text-card-foreground border border-border/80 p-5 rounded-3xl shadow-sm transition-all cursor-pointer group hover:-translate-y-1"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-muted-foreground">الطلبات والاستفسارات</span>
              <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-500 group-hover:scale-110 transition-transform">
                <ShoppingBag className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4 flex items-baseline justify-between">
              <span className="text-3xl font-black text-foreground">{orders.length}</span>
              {newOrdersCount > 0 ? (
                <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-300 text-xs font-bold animate-pulse">
                  {newOrdersCount} جديد🔴
                </span>
              ) : (
                <span className="text-xs text-muted-foreground">محدث فوراً</span>
              )}
            </div>
            <p className="mt-2 text-xs text-muted-foreground">متابعة الطلبات</p>
          </div>
        </div>
      </div>
 
    </div>
  );
};
