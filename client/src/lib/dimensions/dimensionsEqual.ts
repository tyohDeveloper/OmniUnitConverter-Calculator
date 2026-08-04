import type { DimensionalFormula } from '../units/dimensionalFormula';

export const dimensionsEqual = (d1: DimensionalFormula, d2: DimensionalFormula): boolean => {
  const keys1 = Object.keys(d1) as (keyof DimensionalFormula)[];
  const keys2 = Object.keys(d2) as (keyof DimensionalFormula)[];

  const nonZeroKeys1 = keys1.filter(k => d1[k] !== 0 && d1[k] !== undefined);
  const nonZeroKeys2 = keys2.filter(k => d2[k] !== 0 && d2[k] !== undefined);

  if (nonZeroKeys1.length !== nonZeroKeys2.length) return false;

  for (const key of nonZeroKeys1) {
    if ((d1[key] || 0) !== (d2[key] || 0)) return false;
  }

  return true;
};
