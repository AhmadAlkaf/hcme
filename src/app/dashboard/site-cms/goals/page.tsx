import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { GoalsTab } from '@/components/dashboard/cms/tabs/GoalsTab';

// Disable layout or fetch cache to ensure CMS admin always gets fresh DB results
export const revalidate = 0;

export default async function CMSGoalsPage() {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Back Button */}
      <div className="flex items-center justify-start">
        <Link
          href="/dashboard/site-cms"
          className="px-5 py-2.5 rounded-2xl bg-primary text-primary-foreground font-extrabold text-xs hover:opacity-90 transition-all flex items-center gap-2 shadow-lg shadow-primary/20"
        >
          <ArrowRight className="w-4 h-4" />
          الرجوع خلفاً للكروت الرئيسية
        </Link>
      </div>

      {/* Goals Manager Component */}
      <GoalsTab />
    </div>
  );
}
