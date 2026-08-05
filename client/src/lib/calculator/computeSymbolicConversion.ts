import { CATEGORY_FAMILIES } from '../units/categoryFamilies';
import type { UnitCategory } from '../units/unitCategory';

/**
 * Pure conversion calculation for SYMBOLIC-family categories.
 *
 * Sibling of computeConversion (which handles numeric families:
 * SI_QUANTITY, DIMENSIONLESS_RATIO, DATA_QUANTITY, FUEL_ECONOMY,
 * NUMERIC_FUNCTION). Family dispatch happens at the caller —
 * useConverterResultEffect — where both setResult and
 * setSymbolicResult are in scope; here we assume the caller has
 * already determined the category is SYMBOLIC.
 *
 * The signature is deliberately parallel to computeConversion so
 * callers can dispatch without shape juggling:
 *
 *   numeric:  (value: number, ...) => number | null
 *   symbolic: (value: string, ...) => string | null
 *
 * This file currently implements the framework skeleton only. Each
 * SYMBOLIC category (Time in step 4, Date later) will register its
 * own conversion in this file (or its own module dispatched from
 * here) as it lands. Until then this function returns null so no
 * user-visible behavior is affected.
 */
export function computeSymbolicConversion(input: {
  value: string;
  fromUnit: string;
  toUnit: string;
  activeCategory: UnitCategory;
}): string | null {
  const family = CATEGORY_FAMILIES[input.activeCategory];
  if (family !== 'SYMBOLIC') return null;
  // Per-category dispatch will be added in step 4 when the Time
  // category becomes the first consumer. For now no SYMBOLIC
  // categories are registered, so this branch is dead code — but
  // the pipeline is wired so adding a category is a one-file change.
  return null;
}
