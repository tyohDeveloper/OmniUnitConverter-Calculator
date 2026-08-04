import type { DimensionalFormula } from '../units/dimensionalFormula';
import { isDimensionless } from '../dimensions/isDimensionless';
import { dimensionsEqual } from '../dimensions/dimensionsEqual';
import { CATEGORY_DIMENSIONS } from '../units/categoryDimensions';
import { CATEGORY_PRIMARIES } from '../units/categoryPrimaries';
import { CATEGORY_FAMILIES } from '../units/categoryFamilies';

/**
 * Categories whose dimensions match the target, excluding:
 *   - base categories (isBase)
 *   - non-SI-family categories (DIMENSIONLESS_RATIO, DATA_QUANTITY,
 *     FUEL_ECONOMY, NUMERIC_FUNCTION, future SYMBOLIC, plus ghost
 *     entries with undefined family)
 *   - dimensionless categories
 *   - specialists whose primaryCategory equals `currentCategory`
 *     (e.g. archaic_length skipped when currentCategory='length')
 *
 * Dimensional aliases (hideFromDirectMatch=true) are still included
 * here: this cross-domain-match function feeds the calculator's SI-
 * representations panel where users want to see e.g. Radioactivity
 * and Radioactive Decay alongside Frequency. The alias hiding
 * applies only to Direct-pane matching (getMatchingPhysicalQuantities).
 *
 * The primaryCategory filter is contextual: a specialist is
 * suppressed only when the user is viewing its primary.
 */
export const findCrossDomainMatchesByKey = (
  dimensions: DimensionalFormula,
  currentCategory?: string,
): string[] => {
  const matchKeys: string[] = [];
  if (isDimensionless(dimensions)) return matchKeys;
  for (const [catId, info] of Object.entries(CATEGORY_DIMENSIONS)) {
    if (info.isBase) continue;
    if (CATEGORY_FAMILIES[catId] !== 'SI_QUANTITY') continue;
    if (isDimensionless(info.dimensions)) continue;
    if (currentCategory && CATEGORY_PRIMARIES[catId] === currentCategory) continue;
    if (dimensionsEqual(dimensions, info.dimensions)) matchKeys.push(catId);
  }
  return matchKeys;
};
