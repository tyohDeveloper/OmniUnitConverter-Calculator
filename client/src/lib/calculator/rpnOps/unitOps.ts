import type { CalcValue } from '../types';
import { isDimensionless } from '../isDimensionless';
import { dimensionsEqual } from '../dimensionsEqual';
import { fixPrecision } from '../fixPrecision';

type Dims = Record<string, number>;
type UnitOp = 'mulUnit' | 'divUnit' | 'addUnit' | 'subUnit' | 'pow';

function mergeDims(y: Dims, x: Dims, sign: 1 | -1): Dims {
  const result: Dims = {};
  for (const dim of Object.keys(y)) result[dim] = y[dim] || 0;
  for (const dim of Object.keys(x)) result[dim] = (result[dim] || 0) + sign * (x[dim] || 0);
  return result;
}

function applyPow(y: CalcValue, x: CalcValue): { value: number; dims: Dims } | null {
  if (!isDimensionless(x.dimensions)) return null;
  if (y.value === 0 && x.value < 0) return null;
  if (y.value < 0 && !Number.isInteger(x.value)) return null;
  const yd = y.dimensions as Dims;
  const dims: Dims = {};
  for (const [dim, exp] of Object.entries(yd)) { const ne = exp * x.value; if (ne !== 0) dims[dim] = ne; }
  return { value: fixPrecision(Math.pow(y.value, x.value)), dims };
}

export function applyUnit(y: CalcValue, x: CalcValue, op: UnitOp | string): { value: number; dims: Dims } | null {
  const yd = y.dimensions as Dims;
  const xd = x.dimensions as Dims;
  const dimsOk = dimensionsEqual(y.dimensions, x.dimensions) || isDimensionless(y.dimensions) || isDimensionless(x.dimensions);
  switch (op) {
    case 'mulUnit': return { value: fixPrecision(y.value * x.value), dims: mergeDims(yd, xd, 1) };
    case 'divUnit': return x.value === 0 ? null : { value: fixPrecision(y.value / x.value), dims: mergeDims(yd, xd, -1) };
    case 'addUnit': return dimsOk ? { value: fixPrecision(y.value + x.value), dims: isDimensionless(xd) ? { ...yd } : { ...xd } } : null;
    case 'subUnit': return dimsOk ? { value: fixPrecision(y.value - x.value), dims: isDimensionless(xd) ? { ...yd } : { ...xd } } : null;
    case 'pow': return applyPow(y, x);
    default: return null;
  }
}
