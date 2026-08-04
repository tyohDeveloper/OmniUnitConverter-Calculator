import type { DimensionalFormula } from '../units/dimensionalFormula';

export const multiplyDimensions = (
  d1: DimensionalFormula,
  d2: DimensionalFormula
): DimensionalFormula => {
  const result: DimensionalFormula = { ...d1 };
  for (const [dim, exp] of Object.entries(d2)) {
    const key = dim as keyof DimensionalFormula;
    result[key] = (result[key] || 0) + (exp || 0);
    if (result[key] === 0) delete result[key];
  }
  return result;
};
