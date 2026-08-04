import type { DimensionalFormula } from '../units/dimensionalFormula';
import { CATEGORY_DIMENSIONS, EXCLUDED_CROSS_DOMAIN_CATEGORIES } from '../units/categoryDimensions';
import { CATEGORY_PRIMARIES } from '../units/categoryPrimaries';
import { dimensionsEqual } from '../dimensions/dimensionsEqual';

/**
 * Return the first category whose dimensions match the query,
 * skipping:
 *   - EXCLUDED_CROSS_DOMAIN_CATEGORIES (fuel_economy + dimensionless
 *     categories that are meaningless as smart-paste targets)
 *   - specialist categories whose primary would also match
 *     (returning the primary instead is more useful for smart-paste)
 *
 * Returns null when nothing matches.
 */
export const findCategoryByDimensions = (
  dimensions: DimensionalFormula,
): string | null => {
  for (const [catId, info] of Object.entries(CATEGORY_DIMENSIONS)) {
    if (EXCLUDED_CROSS_DOMAIN_CATEGORIES.includes(catId)) continue;
    // Prefer primary over specialist when both would match.
    const primaryId = CATEGORY_PRIMARIES[catId];
    if (primaryId) {
      const primaryDims = CATEGORY_DIMENSIONS[primaryId]?.dimensions;
      if (primaryDims && dimensionsEqual(dimensions, primaryDims)) continue;
    }
    if (dimensionsEqual(dimensions, info.dimensions)) return catId;
  }
  return null;
};
