import type { DimensionalFormula } from '../units/dimensionalFormula';
import type { SIRepresentation } from './siRepresentation';
import { isValidSIComposition } from '../unit-symbols/isValidSIComposition';
import { subtractDimensions } from '../dimensions/subtractDimensions';
import { formatSIComposition } from '../unit-symbols/formatSIComposition';
import { isValidSymbolRepresentation } from '../unit-symbols/isValidSymbolRepresentation';
import { GENERAL_SI_DERIVED } from '../unit-symbols/siDerivedUnits';

// Skip a 1-dimensional derived unit when the remaining dimensions
// still carry that dimension (avoids nonsense like "Hz⋅s" for a
// time: 1 residue).
function shouldSkipMonoDimResidue(
  derivedDims: DimensionalFormula,
  remaining: DimensionalFormula,
): boolean {
  const nonZeroKeys = Object.keys(derivedDims).filter(
    k => derivedDims[k as keyof DimensionalFormula] !== 0,
  );
  if (nonZeroKeys.length !== 1) return false;
  const key = nonZeroKeys[0] as keyof DimensionalFormula;
  return remaining[key] !== undefined && remaining[key] !== 0;
}

/**
 * Iterate every general SI-derived unit and yield a composition-shaped
 * representation for each match. The result set is de-duplicated by
 * displaySymbol via `seenSymbols`, which is mutated (the caller uses
 * the same set to guard against re-adding the raw base-units symbol
 * later).
 */
export function buildDerivedCompositions(
  dimensions: DimensionalFormula,
  seenSymbols: Set<string>,
): SIRepresentation[] {
  const reps: SIRepresentation[] = [];
  for (const derivedUnit of GENERAL_SI_DERIVED) {
    if (!isValidSIComposition(dimensions, derivedUnit.dimensions)) continue;
    const remaining = subtractDimensions(dimensions, derivedUnit.dimensions);
    if (shouldSkipMonoDimResidue(derivedUnit.dimensions, remaining)) continue;
    const compositionSymbol = formatSIComposition([derivedUnit.symbol], remaining);
    if (seenSymbols.has(compositionSymbol) || !isValidSymbolRepresentation(compositionSymbol)) continue;
    seenSymbols.add(compositionSymbol);
    reps.push({ displaySymbol: compositionSymbol, derivedUnits: [derivedUnit.symbol], depth: 1 });
  }
  return reps;
}
