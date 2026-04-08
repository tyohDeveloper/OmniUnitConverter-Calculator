import type { DimensionalFormula } from './dimensionalFormula';
import type { UnitType } from './unitType';

export interface CalcValue {
  value: number;
  dimensions: DimensionalFormula;
  prefix: string;
  sourceCategory?: string;
  siUnit?: string;
  originalUnit?: string;
  originalValue?: number;
  unitType?: UnitType;
}
