import { convert, CONVERSION_DATA } from '../conversion-data';
import { PREFIXES } from '../units/prefixes';
import type { UnitCategory } from '../units/unitCategory';
import { prefixPowerFactor } from '../units/prefixPowerFactor';

/**
 * Council-08c: pure conversion calculation.
 *
 * Given a parsed numeric value plus the (from, to) unit+prefix pair and a
 * category, returns the converted value in the target unit. Returns null
 * if either unit is unknown for the category.
 *
 * Extracted from the useEffect in useConverterController.ts. Input parsing
 * (DMS, ft-in, or plain number) still lives in the effect; only the
 * factor-resolution and convert-call move here.
 */
// Local: resolve the prefix factor for one side of a conversion.
// isSpecial covers deg_dms and ft_in, which don't take prefixes.
function resolveFactor(
  unit: string,
  unitData: { allowPrefixes?: boolean; prefixPower?: number } | undefined,
  prefixId: string,
): number {
  const isSpecial = unit === 'deg_dms' || unit === 'ft_in';
  if (!unitData?.allowPrefixes || isSpecial) return 1;
  const nonePrefix = PREFIXES.find(p => p.id === 'none') || PREFIXES[0];
  const prefixData = PREFIXES.find(p => p.id === prefixId) || nonePrefix;
  return prefixPowerFactor(prefixData.factor, unitData.prefixPower);
}

export function computeConversion(input: {
  value: number;
  fromUnit: string;
  toUnit: string;
  activeCategory: UnitCategory;
  fromPrefix: string;
  toPrefix: string;
}): number | null {
  const catData = CONVERSION_DATA.find(c => c.id === input.activeCategory);
  if (!catData) return null;
  const fromUnitData = catData.units.find(u => u.id === input.fromUnit);
  const toUnitData = catData.units.find(u => u.id === input.toUnit);
  const fromFactor = resolveFactor(input.fromUnit, fromUnitData, input.fromPrefix);
  const toFactor = resolveFactor(input.toUnit, toUnitData, input.toPrefix);
  return convert(input.value, input.fromUnit, input.toUnit, input.activeCategory, fromFactor, toFactor);
}
