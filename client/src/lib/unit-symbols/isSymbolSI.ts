import { lookupUnitForSymbol } from './lookupUnitForSymbol';

/**
 * Returns true if a display symbol represents an SI-compatible unit,
 * meaning SI prefixes (milli, kilo, mega …) can be meaningfully applied.
 *
 * A symbol is SI-compatible when:
 *   - lookupUnitForSymbol returns null → composite SI expression (m·kg·s⁻², etc.)
 *   - OR the unit has factor=1, offset=0, and is not inverse → SI base or derived (N, J, Pa …)
 *
 * Non-SI units (ft, in, lb, bar, atm, °C, °F, eV …) return false and
 * the prefix dropdown is disabled for them.
 */
export function isSymbolSI(symbol: string): boolean {
  if (!symbol || symbol === '1') return false;
  const unit = lookupUnitForSymbol(symbol);
  return !unit || (unit.factor === 1 && unit.offset === 0 && !unit.isInverse);
}
