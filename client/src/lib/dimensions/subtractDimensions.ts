import type { DimensionalFormula } from '../units/dimensionalFormula';

export const subtractDimensions = (
  dims: DimensionalFormula,
  derived: DimensionalFormula
): DimensionalFormula => {
  const result: DimensionalFormula = { ...dims };
  for (const [dim, derivedExp] of Object.entries(derived)) {
    const key = dim as keyof DimensionalFormula;
    result[key] = (result[key] || 0) - derivedExp;
    if (result[key] === 0) delete result[key];
  }
  return result;
};
