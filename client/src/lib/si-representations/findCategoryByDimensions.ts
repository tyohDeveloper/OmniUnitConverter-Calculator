import type { DimensionalFormula } from '../units/dimensionalFormula';
import { CATEGORY_DIMENSIONS } from '../units/categoryDimensions';
import { CATEGORY_PRIMARIES } from '../units/categoryPrimaries';
import { CATEGORY_FAMILIES } from '../units/categoryFamilies';
import { CATEGORY_DIRECT_MATCH_HIDDEN } from '../units/categoryAliases';
import { isDimensionless } from '../dimensions/isDimensionless';
import { dimensionsEqual } from '../dimensions/dimensionsEqual';

/**
 * Return the first category whose dimensions match the query,
 * skipping:
 *   - dimensionless queries (early return)
 *   - non-SI-family categories (via family filter)
 *   - dimensional aliases (via hideFromDirectMatch) — smart-paste
 *     should route to the familiar primary, not the alias
 *   - specialist categories whose primary would also match
 *
 * Returns null when nothing matches.
 */
export const findCategoryByDimensions = (
  dimensions: DimensionalFormula,
): string | null => {
  if (isDimensionless(dimensions)) return null;
  for (const [catId, info] of Object.entries(CATEGORY_DIMENSIONS)) {
    if (CATEGORY_FAMILIES[catId] !== 'SI_QUANTITY') continue;
    if (CATEGORY_DIRECT_MATCH_HIDDEN.has(catId)) continue;
    const primaryId = CATEGORY_PRIMARIES[catId];
    if (primaryId) {
      const primaryDims = CATEGORY_DIMENSIONS[primaryId]?.dimensions;
      if (primaryDims && dimensionsEqual(dimensions, primaryDims)) continue;
    }
    if (dimensionsEqual(dimensions, info.dimensions)) return catId;
  }
  return null;
};
