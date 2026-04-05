import { CONVERSION_DATA } from '../conversion-data';

export interface UnitLookupResult {
  factor: number;
  offset: number;
  isInverse: boolean;
  categoryId: string;
}

/**
 * Look up a simple (non-composite) unit by its display symbol in CONVERSION_DATA.
 * Returns null for composite SI symbols (m²·s⁻¹, N·m, …) not found as individual units.
 */
export function lookupUnitForSymbol(symbol: string): UnitLookupResult | null {
  for (const category of CONVERSION_DATA) {
    for (const unit of category.units) {
      if (unit.symbol === symbol && !unit.mathFunction) {
        return {
          factor: unit.factor,
          offset: unit.offset ?? 0,
          isInverse: unit.isInverse ?? false,
          categoryId: category.id,
        };
      }
    }
  }
  return null;
}
