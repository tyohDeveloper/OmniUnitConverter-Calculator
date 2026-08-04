import type { DimensionalFormula } from '../units/dimensionalFormula';

export const isValidSIComposition = (
  target: DimensionalFormula,
  derived: DimensionalFormula
): boolean => {
  for (const key of Object.keys(derived) as (keyof DimensionalFormula)[]) {
    const dimValue = target[key] || 0;
    const derivedValue = derived[key] || 0;
    if (derivedValue > 0 && dimValue < derivedValue) return false;
    if (derivedValue < 0 && dimValue > derivedValue) return false;
    if (derivedValue !== 0 && dimValue === 0) return false;
  }
  return true;
};
