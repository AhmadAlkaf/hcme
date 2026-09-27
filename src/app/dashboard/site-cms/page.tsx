'use client';

import React, { Suspense } from 'react';
import { SiteCmsSection } from '@/components/dashboard/SiteCmsSection';

export default function SiteCmsDashboardPage() {
  return (
    <Suspense fallback={
      <div className="p-8 text-center text-xs font-bold text-muted-foreground animate-pulse">
        جاري تحميل بطاقات ومحتوى إدارة صفحات الموقع...
      </div> 
    }>
      <SiteCmsSection />
    </Suspense>
  );
}
