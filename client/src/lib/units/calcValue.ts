import type { DimensionalFormula } from './dimensionalFormula';

export interface CalcValue {
  value: number;
  dimensions: DimensionalFormula;
  prefix: string;
  sourceCategory?: string;
}
