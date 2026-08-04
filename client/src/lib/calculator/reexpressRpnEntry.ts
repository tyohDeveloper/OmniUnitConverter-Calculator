// EXCEPTION [architecture-standards §3.2]: type-and-function co-location.
// The exported ReexpressInput and ReexpressResult interfaces travel with
// the function; extracting them to a separate .d.ts adds indirection
// with no code-quality benefit. See lint-size.mjs:44-48 for the
// normalizeMassUnit.ts reference pattern.
import { displayToSI } from '../unit-symbols/displayToSI';
import { siToDisplay } from '../unit-symbols/siToDisplay';
import { formatDimensions } from '../unit-symbols/formatDimensions';
import { applyPrefixToKgUnit } from '../units/applyPrefixToKgUnit';
import type { DimensionalFormula } from '../units/dimensionalFormula';
import type { SIRepresentation } from '../si-representations/siRepresentation';

export interface ReexpressResult {
  newNumber: number;
  newUnitSymbol: string;
}

/**
 * Council-07: pure re-expression of a typed RPN X-register value when the
 * user changes the prefix or the alternative-representation index.
 *
 * Input: current typed number, current dimensions, sourceCategory (for the
 * SIRepresentations lookup), the old (prefix, altIndex) the number was
 * typed under, the new (prefix, altIndex) it should be re-expressed to,
 * and a PREFIXES lookup ({ id, symbol }).
 *
 * Returns { newNumber, newUnitSymbol } if the re-expression succeeds, null
 * if any intermediate value is non-finite or an SI symbol is unresolvable.
 *
 * Extracted from the useEffect in CalculatorPane.tsx.
 */
// Local helper: format the unit-symbol string (with prefix) for a given
// SI symbol + prefix id + PREFIXES lookup. Kept purely local per
// architecture-standards §3.1 ("For unavoidably complex logic, purely
// local helpers may be split out for control").
function buildUnitSymbol(
  symbol: string,
  prefixId: string,
  prefixes: ReadonlyArray<{ id: string; symbol: string }>,
): string {
  const kgResult = applyPrefixToKgUnit(symbol, prefixId);
  const prefixData = prefixes.find(p => p.id === prefixId);
  const prefixSym = kgResult.showPrefix && prefixData ? prefixData.symbol : '';
  return prefixSym + kgResult.displaySymbol;
}

export interface ReexpressInput {
  typedNumber: number;
  dimensions: DimensionalFormula;
  oldPrefix: string;
  oldAltIndex: number;
  newPrefix: string;
  newAltIndex: number;
  siReps: SIRepresentation[];
  prefixes: ReadonlyArray<{ id: string; symbol: string }>;
}

export function reexpressRpnEntry(i: ReexpressInput): ReexpressResult | null {
  const oldSymbol = i.siReps[i.oldAltIndex]?.displaySymbol || formatDimensions(i.dimensions);
  const newSymbol = i.siReps[i.newAltIndex]?.displaySymbol || formatDimensions(i.dimensions);
  if (!oldSymbol || !newSymbol) return null;
  const siValue = displayToSI(i.typedNumber, oldSymbol, i.oldPrefix);
  const newDisplayValue = siToDisplay(siValue, newSymbol, i.newPrefix);
  if (!isFinite(newDisplayValue)) return null;
  const newUnitSymbol = buildUnitSymbol(newSymbol, i.newPrefix, i.prefixes);
  return { newNumber: parseFloat(newDisplayValue.toPrecision(15)), newUnitSymbol };
}
