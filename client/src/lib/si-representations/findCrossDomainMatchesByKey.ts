import type { DimensionalFormula } from '../units/dimensionalFormula';
import { isDimensionless } from '../dimensions/isDimensionless';
import { dimensionsEqual } from '../dimensions/dimensionsEqual';
import { CATEGORY_DIMENSIONS, EXCLUDED_CROSS_DOMAIN_CATEGORIES } from '../units/categoryDimensions';
import { CONVERSION_DATA } from '../conversion-data';

// Index category id -> primaryCategory, built once at module load
// from CONVERSION_DATA. Categories with no primaryCategory field are
// absent. Used below to skip specialists whose primary is the current
// category the caller is viewing (avoids surfacing e.g. archaic_length
// as a cross-domain match when the user is already on length).
const CATEGORY_PRIMARIES: Record<string, string> = (() => {
  const map: Record<string, string> = {};
  for (const cat of CONVERSION_DATA) {
    if (cat.primaryCategory) map[cat.id] = cat.primaryCategory;
  }
  return map;
})();

/**
 * Categories whose dimensions match the target, excluding:
 *   - categories flagged base (isBase)
 *   - categories in EXCLUDED_CROSS_DOMAIN_CATEGORIES
 *   - dimensionless categories
 *   - specialists whose primaryCategory equals `currentCategory`
 *     (e.g. archaic_length is skipped when currentCategory is
 *     'length')
 *
 * The primaryCategory filter is contextual: a specialist is
 * suppressed only when the user is viewing its primary. When viewing
 * an unrelated category with matching dimensions, the specialist
 * still appears as a cross-match.
 */
export const findCrossDomainMatchesByKey = (
  dimensions: DimensionalFormula,
  currentCategory?: string,
): string[] => {
  const matchKeys: string[] = [];

  if (isDimensionless(dimensions)) return matchKeys;

  for (const [catId, info] of Object.entries(CATEGORY_DIMENSIONS)) {
    if (info.isBase) continue;
    if (EXCLUDED_CROSS_DOMAIN_CATEGORIES.includes(catId)) continue;
    if (isDimensionless(info.dimensions)) continue;
    if (currentCategory && CATEGORY_PRIMARIES[catId] === currentCategory) continue;
    if (dimensionsEqual(dimensions, info.dimensions)) {
      matchKeys.push(catId);
    }
  }

  return matchKeys;
};
