import type { DimensionalFormula } from '../units/dimensionalFormula';
import type { DerivedUnitInfo } from '../units/derivedUnitInfo';

export const canFactorOut = (
  dimensions: DimensionalFormula,
  derivedUnit: DerivedUnitInfo
): boolean => {
  for (const key of Object.keys(derivedUnit.dimensions) as (keyof DimensionalFormula)[]) {
    const dimValue = dimensions[key] || 0;
    const derivedValue = derivedUnit.dimensions[key] || 0;
    if (derivedValue > 0 && dimValue < derivedValue) return false;
    if (derivedValue < 0 && dimValue > derivedValue) return false;
    if (derivedValue !== 0 && dimValue === 0) return false;
  }
  return true;
};
