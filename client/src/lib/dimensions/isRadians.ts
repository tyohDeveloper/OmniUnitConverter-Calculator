import type { DimensionalFormula } from '../units/dimensionalFormula';

export const isRadians = (dimensions: DimensionalFormula): boolean => {
  if (dimensions.angle !== 1) return false;
  for (const [key, value] of Object.entries(dimensions)) {
    if (key === 'angle') continue;
    if (value !== 0 && value !== undefined) return false;
  }
  return true;
};
