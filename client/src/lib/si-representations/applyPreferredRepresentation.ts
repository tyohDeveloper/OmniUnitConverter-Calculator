import type { DimensionalFormula } from '../units/dimensionalFormula';
import type { SIRepresentation } from './siRepresentation';
import { getDimensionSignature } from '../units/getDimensionSignature';
import { PREFERRED_REPRESENTATIONS } from '../units/preferredRepresentations';

/**
 * If the caller's dimensions have a preferred canonical representation
 * in PREFERRED_REPRESENTATIONS (a hand-curated map from dimension
 * signature to preferred display symbol), promote or synthesize that
 * representation and place it at the front of the list.
 *
 * Three cases:
 *
 *   - No preferred entry for these dimensions: no-op.
 *   - The preferred symbol is already at index 0: no-op.
 *   - The preferred symbol exists elsewhere in the list: move it
 *     to the front (preserving its other fields).
 *   - The preferred symbol is absent: insert a fresh row at index 0.
 *     For SI-flavored preferences, the derivedUnits array uses the
 *     first "⋅"-separated segment of the display symbol.
 *
 * Mutates in place.
 */
export function applyPreferredRepresentation(
  reps: SIRepresentation[],
  dimensions: DimensionalFormula,
): void {
  const dimSignature = getDimensionSignature(dimensions);
  const preferred = PREFERRED_REPRESENTATIONS[dimSignature];
  if (!preferred) return;

  const existingIndex = reps.findIndex(r => r.displaySymbol === preferred.displaySymbol);
  if (existingIndex > 0) {
    const [existing] = reps.splice(existingIndex, 1);
    reps.unshift(existing);
  } else if (existingIndex === -1) {
    reps.unshift({
      displaySymbol: preferred.displaySymbol,
      derivedUnits: preferred.isSI ? [preferred.displaySymbol.split('⋅')[0]] : [],
      depth: preferred.isSI ? 1 : 0,
    });
  }
}
