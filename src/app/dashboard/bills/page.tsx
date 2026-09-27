import { BillsSection } from '@/components/dashboard/BillsSection';

export const revalidate = 0; // Disable server-side caching for the dashboard page

export default async function BillsDashboardPage() {
  // BillsSection paginates its own list through getBillsServerAction, so the
  // page does not need to prefetch anything.
  return <BillsSection />;
}
