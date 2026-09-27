import { getAgentsServerAction } from '@/actions/products.actions';
import DepartmentsDashboardClient from '@/components/dashboard/DepartmentsDashboardClient';

export const revalidate = 0; // Disable server-side caching for the dashboard page

export default async function DepartmentsDashboardPage() {
  // Agents are only needed to label each department's owning brand; the client
  // component paginates the department list itself.
  const agents = await getAgentsServerAction();

  return <DepartmentsDashboardClient agents={agents} />;
}
