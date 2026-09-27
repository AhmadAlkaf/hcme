import { getAgentsServerAction, getAllDepartmentsServerAction } from '@/actions/products.actions';
import ProductsDashboardClient from '@/components/dashboard/ProductsDashboardClient';

export const revalidate = 0; // Disable server-side caching for the dashboard page

export default async function ProductsDashboardPage() {
  // Only the dropdown/lookup options are fetched here; the client component
  // paginates the product list itself. The options must be the complete list,
  // not just the first page of 15.
  const [agents, departments] = await Promise.all([
    getAgentsServerAction(),
    getAllDepartmentsServerAction(),
  ]);

  return <ProductsDashboardClient agents={agents} departments={departments} />;
}
