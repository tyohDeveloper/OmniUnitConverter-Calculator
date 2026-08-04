import type { DimensionalFormula } from '../units/dimensionalFormula';

export const hasOnlyOriginalDimensions = (
  original: DimensionalFormula,
  remaining: DimensionalFormula
): boolean => {
  for (const key of Object.keys(remaining) as (keyof DimensionalFormula)[]) {
    if (remaining[key] !== 0 && original[key] === undefined) return false;
  }
  return true;
};
