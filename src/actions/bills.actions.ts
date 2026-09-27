'use server';

import { serverListFetch } from '@/lib/server-api';
import type { ListQueryParams, PaginatedResult } from '@/types/pagination';

export interface ApiBillItem {
  id: number;
  subtotal: string;
  quantity: number;
  price: string;
  created_at: string;
  updated_at: string;
  bill: number;
  product: number;
  unit: number;
}

export interface ApiBill {
  id: number;
  bill_items: ApiBillItem[];
  name_user: string;
  total_price: string;
  type_bill: number;
  created_at: string;
  updated_at: string;
  user: number;
}

export async function getBillsServerAction(
  params?: ListQueryParams
): Promise<PaginatedResult<ApiBill> | null> {
  try {
    const res = await serverListFetch<ApiBill>('/bills/bills/', params, {
      requiresAuth: true,
    });

    if (res.success && res.data) {
      return res.data;
    }

    console.error('Error in getBillsServerAction:', res.error);
    return null;
  } catch (error) {
    console.error('Error in getBillsServerAction:', error);
    return null;
  }
}
