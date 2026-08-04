import type { DimensionalFormula } from '../units/dimensionalFormula';

export const isDimensionless = (d: DimensionalFormula): boolean => {
  return Object.keys(d).filter(k => d[k as keyof DimensionalFormula] !== 0).length === 0;
};
