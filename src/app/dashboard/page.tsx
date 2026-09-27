'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { OverviewSection } from '@/components/dashboard/OverviewSection';
import type { ApiProduct, ApiProject, ApiBranch } from '@/types/api';
import type { OrderItem } from '@/types';

export default function OverviewDashboardPage() {
  const router = useRouter();

  const [products] = useState<ApiProduct[]>([]);
  const [projects] = useState<ApiProject[]>([]);
  const [branches] = useState<ApiBranch[]>([]);
  const [orders] = useState<OrderItem[]>([]);

  return (
    <OverviewSection
      products={products}
      projects={projects}
      orders={orders}
      onNavigateTab={(path) => {
        if (path === 'products') router.push('/dashboard/products');
        else if (path === 'projects') router.push('/dashboard/projects');
        else if (path === 'orders') router.push('/dashboard/orders');
        else if (path.startsWith('site-cms')) router.push(`/dashboard/${path}`);
        else router.push(`/dashboard/${path}`);
      }}
    />
  );
}
