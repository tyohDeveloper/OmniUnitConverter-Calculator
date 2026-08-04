import type { DimensionalFormula } from '../units/dimensionalFormula';
import { isDimensionless } from '../dimensions/isDimensionless';
import { dimensionsEqual } from '../dimensions/dimensionsEqual';
import { CATEGORY_DIMENSIONS } from '../units/categoryDimensions';
import { CATEGORY_PRIMARIES } from '../units/categoryPrimaries';
import { CATEGORY_FAMILIES } from '../units/categoryFamilies';

/**
 * Names variant of findCrossDomainMatchesByKey. Same rules, returns
 * info.name instead of category id. See findCrossDomainMatchesByKey
 * for the primaryCategory-based contextual filter explanation.
 */
export const findCrossDomainMatches = (
  dimensions: DimensionalFormula,
  currentCategory?: string,
): string[] => {
  const matches: string[] = [];

  if (isDimensionless(dimensions)) return matches;

  for (const [catId, info] of Object.entries(CATEGORY_DIMENSIONS)) {
    if (info.isBase) continue;
    if (CATEGORY_FAMILIES[catId] !== 'SI_QUANTITY') continue;
    if (isDimensionless(info.dimensions)) continue;
    if (currentCategory && CATEGORY_PRIMARIES[catId] === currentCategory) continue;
    if (dimensionsEqual(dimensions, info.dimensions)) matches.push(info.name);
  }

  return matches;
};
