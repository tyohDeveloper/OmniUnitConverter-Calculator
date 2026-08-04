import type { DimensionalFormula } from '../units/dimensionalFormula';

export const canApplyDerivedUnit = (
  remaining: DimensionalFormula,
  derived: DimensionalFormula
): boolean => {
  for (const [dim, derivedExp] of Object.entries(derived)) {
    const remainingExp = remaining[dim as keyof DimensionalFormula] || 0;
    if (derivedExp > 0 && remainingExp < derivedExp) return false;
    if (derivedExp < 0 && remainingExp > derivedExp) return false;
  }
  return true;
};
