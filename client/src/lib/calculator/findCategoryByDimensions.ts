import type { DimensionalFormula } from '../units/dimensionalFormula';
import { CATEGORY_DIMENSIONS, EXCLUDED_CROSS_DOMAIN_CATEGORIES } from './categoryDimensions';
import { dimensionsEqual } from '../dimensions/dimensionsEqual';

export const findCategoryByDimensions = (
  dimensions: DimensionalFormula
): string | null => {
  for (const [catId, info] of Object.entries(CATEGORY_DIMENSIONS)) {
    if (EXCLUDED_CROSS_DOMAIN_CATEGORIES.includes(catId)) continue;
    if (dimensionsEqual(dimensions, info.dimensions)) return catId;
  }
  return null;
};
