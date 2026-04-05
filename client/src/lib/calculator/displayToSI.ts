import { PREFIXES } from '../conversion-data';
import { lookupUnitForSymbol } from './lookupUnitForSymbol';
import { applyPrefixToKgUnit } from '../units/applyPrefixToKgUnit';

/**
 * Convert a value in a given display context (unit symbol + SI prefix) to the SI base value.
 *
 * - kg-containing symbols (kg, kg/m³ …): handled via applyPrefixToKgUnit because
 *   the kilogram has the "kilo" prefix baked in, so SI prefix math differs from
 *   other units. Formula: displayValue / effectivePrefixFactor * factor.
 * - Temperature: SI = (displayValue * prefixFactor + offset) * factor  (offset-aware)
 * - Inverse units (e.g. photon wavelength): SI = factor / (displayValue * prefixFactor)
 * - Regular units: SI = displayValue * prefixFactor * factor
 * - Composite SI symbols not found in CONVERSION_DATA (N, J, m²·s⁻¹ …):
 *     SI = displayValue * prefixFactor  (factor ≈ 1 for SI base)
 */
export function displayToSI(displayValue: number, symbol: string, prefixId: string): number {
  if (symbol.includes('kg')) {
    const { effectivePrefixFactor } = applyPrefixToKgUnit(symbol, prefixId);
    const unit = lookupUnitForSymbol(symbol);
    const factor = unit?.factor ?? 1;
    return (displayValue / effectivePrefixFactor) * factor;
  }
  const prefixFactor = PREFIXES.find(p => p.id === prefixId)?.factor ?? 1;
  const scaled = displayValue * prefixFactor;
  const unit = lookupUnitForSymbol(symbol);
  if (!unit) return scaled;
  if (unit.categoryId === 'temperature') return (scaled + unit.offset) * unit.factor;
  if (unit.isInverse) return unit.factor / scaled;
  return scaled * unit.factor;
}
