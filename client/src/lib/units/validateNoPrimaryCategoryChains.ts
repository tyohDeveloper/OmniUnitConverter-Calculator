/**
 * Enforce the primaryCategory chain rule across the full category set:
 *
 *   - every primaryCategory value must reference an existing category id
 *   - the referenced category must itself be a primary (must not have
 *     a primaryCategory field). Chains are forbidden by design so
 *     consumers can dedupe by direct comparison without walking.
 *
 * Called once after CONVERSION_DATA is assembled.
 */
export function validateNoPrimaryCategoryChains(
  categories: ReadonlyArray<{ id: string; primaryCategory?: string }>,
): void {
  const byId = new Map(categories.map(c => [c.id, c]));
  const failures: string[] = [];
  for (const cat of categories) {
    if (!cat.primaryCategory) continue;
    const parent = byId.get(cat.primaryCategory);
    if (!parent) {
      failures.push(`category "${cat.id}" declares primaryCategory="${cat.primaryCategory}" but no such category exists`);
      continue;
    }
    if (parent.primaryCategory) {
      failures.push(`category "${cat.id}" declares primaryCategory="${cat.primaryCategory}", but that category is itself a specialist (primaryCategory="${parent.primaryCategory}"). Chains are forbidden; specialists must point directly at a primary.`);
    }
  }
  if (failures.length > 0) {
    throw new Error(`primaryCategory validation failed:\n  ${failures.join('\n  ')}`);
  }
}
