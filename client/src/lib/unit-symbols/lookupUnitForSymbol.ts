import { CONVERSION_DATA, isNonLinearUnit } from '../conversion-data';

export interface UnitLookupResult {
  factor: number;
  offset: number;
  isInverse: boolean;
  categoryId: string;
  prefixPower: number;
}

// §1.6: pre-computed lookup index built lazily on first call. The
// previous implementation was a double loop over CONVERSION_DATA
// (75 categories × ~10 units each = ~722 units per call), which is
// non-trivial on hot render paths (formatCalcValueDisplay ends up
// calling this on every field render including flash animations).
//
// Behavior parity with the previous loop:
//   - First-match-wins for duplicate symbols (56 symbols appear in
//     multiple categories; the loop returned the first-encountered
//     one). Map preserves insertion order, and we iterate CONVERSION_
//     DATA in the same order the loop did.
//   - isNonLinearUnit units are skipped (they need the function
//     registry, not a factor/offset lookup).
let symbolIndex: Map<string, UnitLookupResult> | null = null;

function buildSymbolIndex(): Map<string, UnitLookupResult> {
  const idx = new Map<string, UnitLookupResult>();
  for (const category of CONVERSION_DATA) {
    for (const unit of category.units) {
      if (isNonLinearUnit(unit)) continue;
      if (idx.has(unit.symbol)) continue; // first-match-wins
      idx.set(unit.symbol, {
        factor: unit.factor,
        offset: unit.offset ?? 0,
        isInverse: unit.isInverse ?? false,
        categoryId: category.id,
        prefixPower: unit.prefixPower ?? 1,
      });
    }
  }
  return idx;
}

/**
 * Look up a simple (non-composite) unit by its display symbol in
 * CONVERSION_DATA. Returns null for composite SI symbols (m²·s⁻¹,
 * N·m, …) not found as individual units, and for non-linear units
 * (which need the function registry).
 *
 * O(1) via a lazily-built module-level Map. Safe to call from render
 * paths.
 */
export function lookupUnitForSymbol(symbol: string): UnitLookupResult | null {
  if (symbolIndex === null) symbolIndex = buildSymbolIndex();
  return symbolIndex.get(symbol) ?? null;
}
