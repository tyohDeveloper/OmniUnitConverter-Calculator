import { CONVERSION_DATA, isNonLinearUnit } from '../conversion-data';

export interface UnitLookupResult {
  factor: number;
  offset: number;
  isInverse: boolean;
  categoryId: string;
  prefixPower: number;
}

/**
 * Look up a simple (non-composite) unit by its display symbol in CONVERSION_DATA.
 * Returns null for composite SI symbols (m²·s⁻¹, N·m, …) not found as individual units.
 */
export function lookupUnitForSymbol(symbol: string): UnitLookupResult | null {
  for (const category of CONVERSION_DATA) {
    for (const unit of category.units) {
      if (unit.symbol === symbol && !isNonLinearUnit(unit)) {
        return {
          factor: unit.factor,
          offset: unit.offset ?? 0,
          isInverse: unit.isInverse ?? false,
          categoryId: category.id,
          prefixPower: unit.prefixPower ?? 1,
        };
      }
    }
  }
  return null;
}
