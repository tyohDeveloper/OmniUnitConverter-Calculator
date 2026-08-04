import type { DimensionalFormula } from '../units/dimensionalFormula';
import { isDimensionless } from '../dimensions/isDimensionless';
import { dimensionsEqual } from '../dimensions/dimensionsEqual';
import { CATEGORY_DIMENSIONS, EXCLUDED_CROSS_DOMAIN_CATEGORIES } from '../units/categoryDimensions';
import { CATEGORY_PRIMARIES } from '../units/categoryPrimaries';
import { CATEGORY_FAMILIES } from '../units/categoryFamilies';

/**
 * Categories whose dimensions match the target, excluding:
 *   - base categories (isBase)
 *   - categories in EXCLUDED_CROSS_DOMAIN_CATEGORIES
 *   - non-SI-family categories (DIMENSIONLESS_RATIO like unitless,
 *     NUMERIC_FUNCTION like logarithmic, future SYMBOLIC, and ghost
 *     entries with no JSON file / undefined family)
 *   - dimensionless categories
 *   - specialists whose primaryCategory equals `currentCategory`
 *     (e.g. archaic_length skipped when currentCategory='length')
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
    if (CATEGORY_FAMILIES[catId] !== 'SI_QUANTITY') continue;
    if (isDimensionless(info.dimensions)) continue;
    if (currentCategory && CATEGORY_PRIMARIES[catId] === currentCategory) continue;
    if (dimensionsEqual(dimensions, info.dimensions)) matchKeys.push(catId);
  }
  return matchKeys;
};
