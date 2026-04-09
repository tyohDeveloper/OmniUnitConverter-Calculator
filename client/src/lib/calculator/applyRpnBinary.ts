import type { DimensionalFormula } from '../units/dimensionalFormula';
import type { CalcValue } from './types';
import { applyScalar } from './rpnOps/scalarOps';
import { applyUnit } from './rpnOps/unitOps';

export type RpnBinaryOp =
  | 'mul' | 'div' | 'add' | 'sub'
  | 'mulUnit' | 'divUnit' | 'addUnit' | 'subUnit'
  | 'pow';

export const applyRpnBinary = (y: CalcValue, x: CalcValue, op: RpnBinaryOp): CalcValue | null => {
  const result = applyScalar(y, x, op) ?? applyUnit(y, x, op);
  if (!result) return null;
  const dims = result.dims;
  for (const [dim, exp] of Object.entries(dims)) { if (exp === 0) delete dims[dim]; }
  return { value: result.value, dimensions: dims as DimensionalFormula };
};
