import React from 'react';
import Link from 'next/link';
import { 
  Briefcase, 
  GraduationCap, 
  Building2, 
  Users, 
  Fingerprint, 
  ScanFace, 
  Database, 
  CalendarCheck, 
  Clock, 
  BadgeCheck 
} from 'lucide-react';

const hrSections = [
  {
    title: 'المسميات الوظيفية',
    description: 'إدارة وإضافة المسميات الوظيفية المختلفة في النظام.',
    icon: Briefcase,
    href: '/dashboard/hr/job-titles',
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/20'
  },
  {
    title: 'المستويات التعليمية',
    description: 'تحديد مستويات التعليم والدرجات العلمية للموظفين.',
    icon: GraduationCap,
    href: '/dashboard/hr/education-levels',
    color: 'text-indigo-500',
    bgColor: 'bg-indigo-500/10',
    borderColor: 'border-indigo-500/20'
  },
  {
    title: 'الشركات',
    description: 'إدارة فروع الشركات التابعة للمركز.',
    icon: Building2,
    href: '/dashboard/hr/companies',
    color: 'text-violet-500',
    bgColor: 'bg-violet-500/10',
    borderColor: 'border-violet-500/20'
  },
  {
    title: 'الموظفون',
    description: 'سجل الموظفين وإدارة بياناتهم الشخصية والوظيفية.',
    icon: Users,
    href: '/dashboard/hr/employees',
    color: 'text-fuchsia-500',
    bgColor: 'bg-fuchsia-500/10',
    borderColor: 'border-fuchsia-500/20'
  },
  {
    title: ' جهاز البصمة',
    description: 'إدارة الأجهزة المعتمدة لتسجيل الحضور.',
    icon: Fingerprint,
    href: '/dashboard/hr/device-fingerprints',
    color: 'text-emerald-500',
    bgColor: 'bg-emerald-500/10',
    borderColor: 'border-emerald-500/20'
  },
  {
    title: 'بصمة الموظف',
    description: 'ربط وإدارة البصمات الحيوية للموظفين.',
    icon: ScanFace,
    href: '/dashboard/hr/employee-fingerprints',
    color: 'text-teal-500',
    bgColor: 'bg-teal-500/10',
    borderColor: 'border-teal-500/20'
  },
  {
    title: 'استقبال البيانات',
    description: 'إعداد قوائم وخيارات البيانات المستخدمة في النظام.',
    icon: Database,
    href: '/dashboard/hr/data-descriptions',
    color: 'text-amber-500',
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/20'
  },
  {
    title: 'الحضور',
    description: 'متابعة سجلات الحضور والانصراف اليومية.',
    icon: CalendarCheck,
    href: '/dashboard/hr/attendance',
    color: 'text-rose-500',
    bgColor: 'bg-rose-500/10',
    borderColor: 'border-rose-500/20'
  },
  {
    title: '    الورديات',
    description: 'جداول الورديات (الشفتات) وتعيين الموظفين عليها.',
    icon: Clock,
    href: '/dashboard/hr/shifts',
    color: 'text-orange-500',
    bgColor: 'bg-orange-500/10',
    borderColor: 'border-orange-500/20'
  },
  {
    title: 'أخصائي بصمات قانوني',
    description: 'الاعتمادات والصلاحيات القانونية الخاصة بالبصمات.',
    icon: BadgeCheck,
    href: '/dashboard/hr/legal-specialists',
    color: 'text-cyan-500',
    bgColor: 'bg-cyan-500/10',
    borderColor: 'border-cyan-500/20'
  },
];

export default function HRDashboardPage() {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header Section */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-extrabold tracking-tight">الموارد البشرية</h1>
        <p className="text-muted-foreground">
          إدارة شاملة للموظفين، الهياكل الوظيفية، سجلات الحضور، والبيانات الحيوية.
        </p>
      </div>

      {/* Grid of Features */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {hrSections.map((section, idx) => {
          const Icon = section.icon;
          return (
            <Link 
              key={idx} 
              href={section.href}
              className={`group flex flex-col p-6 bg-card rounded-2xl border border-border shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 overflow-hidden relative`}
            >
              {/* Background Accent */}
              <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-transparent to-current opacity-[0.03] rounded-bl-full pointer-events-none ${section.color}`} />
              
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 border transition-colors ${section.bgColor} ${section.color} ${section.borderColor} group-hover:bg-background`}>
                <Icon className="w-6 h-6" />
              </div>
              
              <h3 className="text-lg font-bold mb-2 group-hover:text-primary transition-colors">
                {section.title}
              </h3>
              
              <p className="text-sm text-muted-foreground flex-1 leading-relaxed">
                {section.description}
              </p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
