import type { ApiAgent, ApiDepartment, ApiProduct } from '@/types/api';

/**
 * Read helpers for the product/department/agent relationship.
 *
 * A product does not belong to an agent directly any more: it belongs to a
 * department, and the department carries the agent. These helpers keep that
 * indirection in one place so the components stay readable.
 */

/**
 * Normalises whatever the API returns for a product's department into its id.
 *
 * The read shape of `department` on a product is not documented by the backend
 * and could not be observed (the endpoint has no records yet), so this accepts
 * either a bare id or a nested object. Returning `null` for anything else keeps
 * a surprise shape from crashing a render.
 */
export function normalizeDepartmentRef(
  value: number | { id: number } | null | undefined
): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (value && typeof value === 'object' && typeof value.id === 'number') return value.id;
  return null;
}

/** The agent name the API resolved for a product, for display only. */
export function productAgentLabel(product: ApiProduct): string {
  return product.agent_name_ar || product.agent_name_en || '';
}

/**
 * Whether a product belongs to an agent.
 *
 * The product only carries the resolved agent *name* (`agent_name_ar` /
 * `agent_name_en`), not the agent id, so the two are compared by name. A product
 * with no department resolves to an empty name and therefore matches no agent,
 * which is the intended behaviour.
 */
export function productBelongsToAgent(product: ApiProduct, agent: ApiAgent): boolean {
  const productAgent = productAgentLabel(product);
  if (!productAgent) return false;
  return productAgent === (agent.name_ar || '') || productAgent === (agent.name_en || '');
}

/** Whether a product belongs to a department. */
export function productBelongsToDepartment(product: ApiProduct, departmentId: number): boolean {
  return normalizeDepartmentRef(product.department) === departmentId;
}

/** Groups departments by their owning agent id, for `<optgroup>` rendering. */
export function groupDepartmentsByAgent(
  departments: ApiDepartment[]
): Map<number | null, ApiDepartment[]> {
  const groups = new Map<number | null, ApiDepartment[]>();
  for (const department of departments) {
    const key = normalizeDepartmentRef(department.agent);
    const bucket = groups.get(key);
    if (bucket) bucket.push(department);
    else groups.set(key, [department]);
  }
  return groups;
}

/**
 * One agency row in the public catalog's filter, with its departments nested.
 *
 * `agentId` is `null` for departments that have no agency, which are collected
 * into a single trailing group so they stay reachable instead of disappearing.
 */
export interface AgentGroup {
  agentId: number | null;
  /** Read from the department, since the agents endpoint is not public. */
  nameAr: string;
  nameEn: string;
  departments: ApiDepartment[];
}

/**
 * Builds the agent -> departments tree for the public catalog filter.
 *
 * The agents endpoint (`/content/ouragent/`) answers 401 without a token, so
 * the agency list is derived from the departments themselves, which already
 * carry `agent` plus the resolved `agent_name_ar` / `agent_name_en`. An agency
 * that owns no department therefore does not appear — it would have no products
 * to show anyway.
 */
export function buildAgentGroups(departments: ApiDepartment[]): AgentGroup[] {
  const groups: AgentGroup[] = [];

  for (const [agentId, items] of groupDepartmentsByAgent(departments)) {
    // Prefer a name from any department in the group, so one missing field on a
    // single record cannot blank the whole label.
    const nameAr = items.find((d) => d.agent_name_ar)?.agent_name_ar || '';
    const nameEn = items.find((d) => d.agent_name_en)?.agent_name_en || '';
    groups.push({ agentId, nameAr, nameEn, departments: items });
  }

  // Named agencies first, and the agency-less group last so it does not lead.
  return groups.sort((a, b) => {
    if (a.agentId === null) return 1;
    if (b.agentId === null) return -1;
    return 0;
  });
}

/**
 * Keeps only the products that sit in one of `departmentIds`.
 *
 * The backend's `department` filter accepts a single id, so an agency-wide
 * filter has to be resolved from the already-loaded catalogue.
 */
export function filterProductsByDepartments(
  products: ApiProduct[],
  departmentIds: number[]
): ApiProduct[] {
  if (departmentIds.length === 0) return [];
  const allowed = new Set(departmentIds);
  return products.filter((product) => {
    const id = normalizeDepartmentRef(product.department);
    return id !== null && allowed.has(id);
  });
}
