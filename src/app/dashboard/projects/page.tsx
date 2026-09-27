import { getAgentsServerAction } from '@/actions/products.actions';
import ProjectsDashboardClient from '@/components/dashboard/ProjectsDashboardClient';

export const revalidate = 0; // Disable server-side caching for dashboard page

export default async function ProjectsDashboardPage() {
  // Only the agent options are fetched here; the client component paginates the
  // project list itself. The options must be the complete list, not the first
  // page of 15.
  const agents = await getAgentsServerAction();

  return <ProjectsDashboardClient agents={agents} />;
}
