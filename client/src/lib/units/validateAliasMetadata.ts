/**
 * Cross-category validation of the dimensionalAliasOf field:
 *
 *   - every dimensionalAliasOf value must reference an existing
 *     category id
 *   - the referenced category must NOT itself be a specialist (must
 *     have no primaryCategory) or an alias (must have no
 *     hideFromDirectMatch). Aliases point at non-specialist,
 *     non-alias primaries.
 *
 * Called once after CONVERSION_DATA is assembled, alongside
 * validateNoPrimaryCategoryChains.
 */
interface AliasCategory {
  id: string;
  primaryCategory?: string;
  hideFromDirectMatch?: boolean;
  dimensionalAliasOf?: string;
}

function checkAliasTarget(cat: AliasCategory, byId: Map<string, AliasCategory>): string[] {
  if (!cat.dimensionalAliasOf) return [];
  const target = byId.get(cat.dimensionalAliasOf);
  if (!target) return [`category "${cat.id}" declares dimensionalAliasOf="${cat.dimensionalAliasOf}" but no such category exists`];
  const failures: string[] = [];
  if (target.primaryCategory) failures.push(`category "${cat.id}" points at dimensionalAliasOf="${cat.dimensionalAliasOf}", which is itself a specialist (primaryCategory="${target.primaryCategory}"); alias targets must be primaries`);
  if (target.hideFromDirectMatch) failures.push(`category "${cat.id}" points at dimensionalAliasOf="${cat.dimensionalAliasOf}", which is itself an alias (hideFromDirectMatch=true); alias targets must be non-alias primaries`);
  return failures;
}

export function validateAliasMetadata(categories: ReadonlyArray<AliasCategory>): void {
  const byId = new Map(categories.map(c => [c.id, c]));
  const failures: string[] = [];
  for (const cat of categories) failures.push(...checkAliasTarget(cat, byId));
  if (failures.length > 0) throw new Error(`dimensionalAliasOf validation failed:\n  ${failures.join('\n  ')}`);
}
