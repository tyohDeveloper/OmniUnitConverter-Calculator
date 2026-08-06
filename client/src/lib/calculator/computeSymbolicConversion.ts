import { CATEGORY_FAMILIES } from '../units/categoryFamilies';
import type { UnitCategory } from '../units/unitCategory';
import type { SupportedLanguage } from '../localization';
import { computeTimeConversion } from './computeTimeConversion';
import { computeDateConversion } from './computeDateConversion';

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
 * Per-category dispatch is by activeCategory id. Adding a new
 * SYMBOLIC category = register it in CONVERSION_DATA + wire its
 * per-category conversion function into the switch below.
 */
// Per-category dispatch, extracted so the exported function stays
// short as more SYMBOLIC categories are added.
function dispatchByCategory(input: SymbolicConversionInput): string | null {
  switch (input.activeCategory) {
    case 'timezone':
      return computeTimeConversion({
        value: input.value, fromUnit: input.fromUnit, toUnit: input.toUnit,
      });
    case 'date_calendar':
      return computeDateConversion({
        value: input.value, fromUnit: input.fromUnit, toUnit: input.toUnit,
        language: input.language,
      });
    default:
      return null;
  }
}

interface SymbolicConversionInput {
  value: string;
  fromUnit: string;
  toUnit: string;
  activeCategory: UnitCategory;
  language: SupportedLanguage;
}

export function computeSymbolicConversion(input: SymbolicConversionInput): string | null {
  const family = CATEGORY_FAMILIES[input.activeCategory];
  if (family !== 'SYMBOLIC') return null;
  return dispatchByCategory(input);
}
