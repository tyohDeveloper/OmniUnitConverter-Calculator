import type { DimensionalFormula } from '../units/dimensionalFormula';
import { isDimensionless } from '../dimensions/isDimensionless';
import { dimensionsEqual } from '../dimensions/dimensionsEqual';
import { CATEGORY_DIMENSIONS, EXCLUDED_CROSS_DOMAIN_CATEGORIES } from './categoryDimensions';

export const findCrossDomainMatchesByKey = (
  dimensions: DimensionalFormula,
  _currentCategory?: string
): string[] => {
  const matchKeys: string[] = [];

  if (isDimensionless(dimensions)) return matchKeys;

  for (const [catId, info] of Object.entries(CATEGORY_DIMENSIONS)) {
    if (info.isBase) continue;
    if (EXCLUDED_CROSS_DOMAIN_CATEGORIES.includes(catId)) continue;
    if (isDimensionless(info.dimensions)) continue;
    if (dimensionsEqual(dimensions, info.dimensions)) {
      matchKeys.push(catId);
    }
  }

  return matchKeys;
};
