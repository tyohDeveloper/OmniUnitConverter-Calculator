import { PREFIXES } from '../conversion-data';
import { lookupUnitForSymbol } from './lookupUnitForSymbol';
import { applyPrefixToKgUnit } from '../units/applyPrefixToKgUnit';

/**
 * Convert a SI base value to a display value in a given context (unit symbol + SI prefix).
 * This is the inverse of displayToSI.
 *
 * - kg-containing symbols (kg, kg/m³ …): handled via applyPrefixToKgUnit because
 *   the kilogram has the "kilo" prefix baked in, so SI prefix math differs from
 *   other units. Formula: siValue * effectivePrefixFactor / factor.
 * - Temperature: display = (SI / factor - offset) / prefixFactor  (offset-aware)
 * - Inverse units (e.g. photon wavelength): display = factor / SI / prefixFactor
 * - Regular units: display = SI / factor / prefixFactor
 * - Composite SI symbols not found in CONVERSION_DATA (N, J, m²·s⁻¹ …):
 *     display = SI / prefixFactor  (factor ≈ 1 for SI base)
 */
export function siToDisplay(siValue: number, symbol: string, prefixId: string): number {
  if (symbol.includes('kg')) {
    const { effectivePrefixFactor } = applyPrefixToKgUnit(symbol, prefixId);
    const unit = lookupUnitForSymbol(symbol);
    const factor = unit?.factor ?? 1;
    return (siValue * effectivePrefixFactor) / factor;
  }
  const prefixFactor = PREFIXES.find(p => p.id === prefixId)?.factor ?? 1;
  const unit = lookupUnitForSymbol(symbol);
  if (!unit) return siValue / prefixFactor;
  if (unit.categoryId === 'temperature') return ((siValue / unit.factor) - unit.offset) / prefixFactor;
  if (unit.isInverse) return unit.factor / siValue / prefixFactor;
  return siValue / unit.factor / prefixFactor;
}
