import type { DimensionalFormula } from './dimensionalFormula';
import { CATEGORY_DIMENSIONS } from './categoryDimensions';
import { CATEGORY_PRIMARIES } from './categoryPrimaries';
import { CATEGORY_FAMILIES } from './categoryFamilies';
import { CATEGORY_DIRECT_MATCH_HIDDEN } from './categoryAliases';

/**
 * Return category display names whose dimensions match the query.
 *
 * Used by the Direct pane to show 'these physical quantities match
 * your dimensions' when the user builds a formula freehand.
 *
 * Filters applied:
 *   - dimensionless queries return []
 *   - non-SI-family categories skipped (DIMENSIONLESS_RATIO,
 *     DATA_QUANTITY, FUEL_ECONOMY, NUMERIC_FUNCTION, SYMBOLIC, plus
 *     ghost entries with undefined family)
 *   - dimensional aliases (hideFromDirectMatch=true) skipped
 *   - specialists whose primary would also match are skipped
 *     (return only the primary)
 */
export function getMatchingPhysicalQuantities(dimensions: DimensionalFormula): string[] {
  const keys = Object.keys(dimensions) as (keyof DimensionalFormula)[];
  const hasNonZero = keys.some(k => (dimensions[k] ?? 0) !== 0);
  if (!hasNonZero) return [];

  const results: string[] = [];
  for (const [categoryKey, info] of Object.entries(CATEGORY_DIMENSIONS)) {
    if (CATEGORY_FAMILIES[categoryKey] !== 'SI_QUANTITY') continue;
    if (CATEGORY_DIRECT_MATCH_HIDDEN.has(categoryKey)) continue;
    if (!dimensionsMatchLocal(dimensions, info.dimensions)) continue;
    const primaryId = CATEGORY_PRIMARIES[categoryKey];
    if (primaryId) {
      const primaryDims = CATEGORY_DIMENSIONS[primaryId]?.dimensions;
      if (primaryDims && dimensionsMatchLocal(dimensions, primaryDims)) continue;
    }
    results.push(info.name);
  }
  return results;
}

// Local dimensional-equality; kept in-file to avoid pulling in
// dimensions/dimensionsEqual which lives at a different layer.
function dimensionsMatchLocal(a: DimensionalFormula, b: DimensionalFormula): boolean {
  const keys = Array.from(new Set([...Object.keys(a), ...Object.keys(b)])) as (keyof DimensionalFormula)[];
  for (const k of keys) {
    if ((a[k] ?? 0) !== (b[k] ?? 0)) return false;
  }
  return true;
}
