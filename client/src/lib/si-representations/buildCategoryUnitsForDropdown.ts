import type { DimensionalFormula } from '../units/dimensionalFormula';
import type { SIRepresentation } from './siRepresentation';
import { CONVERSION_DATA, isNonLinearUnit } from '../conversion-data';
import { CATEGORY_DIMENSIONS } from '../units/categoryDimensions';
import { CATEGORY_PRIMARIES } from '../units/categoryPrimaries';
import { dimensionsEqual } from '../dimensions/dimensionsEqual';

// Categories to skip in the SI-representations dropdown regardless of
// dimensional match. Historical size: 16 -> 2 (this commit, post-
// family+primaryCategory).
//
// All archaics and named-standard locals (rack_geometry, shipping,
// beer_wine_volume, lightbulb, cooking, typography, fuel) are now
// skipped via the primaryCategory + family checks inside the loop.
//
// The two remaining SI_QUANTITY entries are:
//   - data: SI_QUANTITY family, dimensions:{}. Wouldn't fail the
//     dimensionsEqual test on non-empty queries, but included for
//     safety when the query dims are {} (which shouldn't happen for
//     the SI-representations dropdown path).
//   - fuel_economy: SI_QUANTITY with dimensionally heterogeneous
//     units. Even the km/L subset ({length:-2}) doesn't produce
//     useful cross-domain suggestions in the dropdown.
const EXCLUDED_DROPDOWN_CATEGORIES = new Set([
  'data',
  'fuel_economy',
]);

const ANGULAR_SYMBOL_PATTERN = /\brad\b|rpm|rps/;

function collectCategoryUnits(
  categoryData: (typeof CONVERSION_DATA)[number],
  seenSymbols: Set<string>,
  suppressAngular: boolean,
): SIRepresentation[] {
  const result: SIRepresentation[] = [];
  for (const unit of categoryData.units) {
    if (isNonLinearUnit(unit) || seenSymbols.has(unit.symbol)) continue;
    if (suppressAngular && ANGULAR_SYMBOL_PATTERN.test(unit.symbol)) continue;
    seenSymbols.add(unit.symbol);
    result.push({ displaySymbol: unit.symbol, derivedUnits: [], depth: 2 });
  }
  return result;
}

/**
 * Collect all catalog units from categories whose dimensions match the
 * given target, filtered by an already-seen set (to avoid duplicating
 * rows generated upstream by the derived-unit-composition pass).
 *
 * When the target has no angular dimension, units whose symbols look
 * angular (contain "rad", "rpm", or "rps") are suppressed. This
 * prevents e.g. torque (N⋅m) from surfacing "rad" catalog units.
 *
 * When `sourceCategory` is provided, only that category's units are
 * returned; without it, every non-excluded matching category
 * contributes.
 *
 * The excluded-category list (archaic/*, math, data, fuel, cooking,
 * typography, ...) is the union of categories that either aren't
 * useful in an SI-representation dropdown or would introduce
 * confusing rows.
 */
export function buildCategoryUnitsForDropdown(
  dimensions: DimensionalFormula,
  seenSymbols: Set<string>,
  sourceCategory?: string,
): SIRepresentation[] {
  const suppressAngular = !(dimensions as Record<string, number>)['angle'];
  const result: SIRepresentation[] = [];
  for (const categoryData of CONVERSION_DATA) {
    const catId = categoryData.id;
    if (EXCLUDED_DROPDOWN_CATEGORIES.has(catId)) continue;
    if (categoryData.family !== 'SI_QUANTITY') continue;
    if (sourceCategory && CATEGORY_PRIMARIES[catId] === sourceCategory) continue;
    const catDimInfo = CATEGORY_DIMENSIONS[catId];
    if (!catDimInfo || !dimensionsEqual(dimensions, catDimInfo.dimensions)) continue;
    if (sourceCategory && catId !== sourceCategory) continue;
    result.push(...collectCategoryUnits(categoryData, seenSymbols, suppressAngular));
  }
  return result;
}
