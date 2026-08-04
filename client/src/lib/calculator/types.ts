import type { DimensionalFormula } from '../units/dimensionalFormula';
import type { DerivedUnitInfo } from '../units/derivedUnitInfo';

export type { DimensionalFormula, DerivedUnitInfo };

export interface CalcValue {
  value: number;
  dimensions: DimensionalFormula;
  sourceCategory?: string;
}

export interface CategoryDimensionInfo {
  name: string;
  dimensions: DimensionalFormula;
  isBase: boolean;
}

// SIRepresentation moved to lib/si-representations/generateSIRepresentations.ts (§3.2 co-location).
// AlternativeRepresentation moved to lib/si-representations/generateAlternativeRepresentations.ts.

export interface NormalizableDerivedUnit {
  symbol: string;
  dimensions: DimensionalFormula;
  exponentSum: number;
}

export interface DerivedUnitPowerMatch {
  symbol: string;
  baseSymbol: string;
  power: number;
  category: string;
}
