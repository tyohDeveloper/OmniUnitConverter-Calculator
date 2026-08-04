import type { DimensionalFormula } from '../units/dimensionalFormula';
import { isDimensionless } from '../dimensions/isDimensionless';
import { dimensionsEqual } from '../dimensions/dimensionsEqual';
import { CATEGORY_DIMENSIONS, EXCLUDED_CROSS_DOMAIN_CATEGORIES } from '../units/categoryDimensions';

export const findCrossDomainMatches = (
  dimensions: DimensionalFormula,
  _currentCategory?: string
): string[] => {
  const matches: string[] = [];

  if (isDimensionless(dimensions)) return matches;

  for (const [catId, info] of Object.entries(CATEGORY_DIMENSIONS)) {
    if (info.isBase) continue;
    if (EXCLUDED_CROSS_DOMAIN_CATEGORIES.includes(catId)) continue;
    if (isDimensionless(info.dimensions)) continue;
    if (dimensionsEqual(dimensions, info.dimensions)) {
      matches.push(info.name);
    }
  }

  return matches;
};
