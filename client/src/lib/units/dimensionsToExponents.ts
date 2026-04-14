import type { DimensionalFormula } from './dimensionalFormula';
import { SI_BASE_TO_DIMENSION } from './siBaseUnits';

const ZERO_EXPONENTS: Record<string, number> = { m: 0, kg: 0, s: 0, A: 0, K: 0, mol: 0, cd: 0, rad: 0, sr: 0 };

export function dimensionsToExponents(dimensions: DimensionalFormula): Record<string, number> {
  const exponents: Record<string, number> = { ...ZERO_EXPONENTS };
  for (const [symbol, dimKey] of Object.entries(SI_BASE_TO_DIMENSION)) {
    const val = dimensions[dimKey];
    if (val) exponents[symbol] = val;
  }
  const hasOutOfRange = Object.values(exponents).some(exp => exp < -5 || exp > 5);
  if (hasOutOfRange) return { ...ZERO_EXPONENTS };
  return exponents;
}
