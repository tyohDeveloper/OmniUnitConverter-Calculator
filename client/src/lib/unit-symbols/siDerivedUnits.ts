import type { DerivedUnitInfo } from '../units/derivedUnitInfo';
import type { DimensionalFormula } from '../units/dimensionalFormula';
import { SI_DERIVED_UNITS } from '../units/siDerivedUnitsCatalog';

// SI_DERIVED_UNITS is owned by ../units/siDerivedUnitsCatalog.ts.
// Consumers import from there directly (§3.8: no re-exports).

// EXCEPTION [architecture-standards §3.2]: type-and-function co-location.
// NormalizableDerivedUnit describes the shape of NORMALIZABLE_DERIVED_UNITS
// (below) and is used only by consumers that read that constant.
export interface NormalizableDerivedUnit {
  symbol: string;
  dimensions: DimensionalFormula;
  exponentSum: number;
}

export const SPECIALTY_DERIVED_UNITS = new Set([
  'Gy', 'Sv', 'Bq', 'kat', 'lm', 'lx', 'rad', 'sr', 'ν', 'λ',
]);

export const SI_UNITS_BY_COMPLEXITY: DerivedUnitInfo[] = [...SI_DERIVED_UNITS].sort((a, b) => {
  const aSum = Object.values(a.dimensions).reduce((sum, exp) => sum + Math.abs(exp || 0), 0);
  const bSum = Object.values(b.dimensions).reduce((sum, exp) => sum + Math.abs(exp || 0), 0);
  return bSum - aSum;
});

export const GENERAL_SI_DERIVED: DerivedUnitInfo[] = SI_UNITS_BY_COMPLEXITY.filter(
  u => !['Hz', 'Bq'].includes(u.symbol)
);

export const NORMALIZABLE_DERIVED_UNITS: NormalizableDerivedUnit[] = [
  { symbol: 'F', dimensions: { mass: -1, length: -2, time: 4, current: 2 }, exponentSum: 9 },
  { symbol: 'Ω', dimensions: { mass: 1, length: 2, time: -3, current: -2 }, exponentSum: 8 },
  { symbol: 'S', dimensions: { mass: -1, length: -2, time: 3, current: 2 }, exponentSum: 8 },
  { symbol: 'V', dimensions: { mass: 1, length: 2, time: -3, current: -1 }, exponentSum: 7 },
  { symbol: 'H', dimensions: { mass: 1, length: 2, time: -2, current: -2 }, exponentSum: 7 },
  { symbol: 'Wb', dimensions: { mass: 1, length: 2, time: -2, current: -1 }, exponentSum: 6 },
  { symbol: 'W', dimensions: { mass: 1, length: 2, time: -3 }, exponentSum: 6 },
  { symbol: 'J', dimensions: { mass: 1, length: 2, time: -2 }, exponentSum: 5 },
  { symbol: 'lx', dimensions: { intensity: 1, solid_angle: 1, length: -2 }, exponentSum: 4 },
  { symbol: 'Gy', dimensions: { length: 2, time: -2 }, exponentSum: 4 },
  { symbol: 'Pa', dimensions: { mass: 1, length: -1, time: -2 }, exponentSum: 4 },
  { symbol: 'N', dimensions: { mass: 1, length: 1, time: -2 }, exponentSum: 4 },
  { symbol: 'T', dimensions: { mass: 1, time: -2, current: -1 }, exponentSum: 4 },
  { symbol: 'C', dimensions: { current: 1, time: 1 }, exponentSum: 2 },
  { symbol: 'kat', dimensions: { amount: 1, time: -1 }, exponentSum: 2 },
  { symbol: 'lm', dimensions: { intensity: 1, solid_angle: 1 }, exponentSum: 2 },
].sort((a, b) => b.exponentSum - a.exponentSum);
