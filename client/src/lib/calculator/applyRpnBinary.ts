import type { DimensionalFormula } from '../units/shared-types';
import type { CalcValue } from './types';
import { isDimensionless } from './isDimensionless';
import { dimensionsEqual } from './dimensionsEqual';
import { fixPrecision } from './fixPrecision';

export type RpnBinaryOp =
  | 'mul' | 'div' | 'add' | 'sub'
  | 'mulUnit' | 'divUnit' | 'addUnit' | 'subUnit'
  | 'pow';

type Dims = Record<string, number>;

function mergeDims(y: Dims, x: Dims, sign: 1 | -1): Dims {
  const result: Dims = {};
  for (const dim of Object.keys(y)) result[dim] = y[dim] || 0;
  for (const dim of Object.keys(x)) result[dim] = (result[dim] || 0) + sign * (x[dim] || 0);
  return result;
}

function applyScalar(y: CalcValue, x: CalcValue, op: RpnBinaryOp): { value: number; dims: Dims } | null {
  const xd = { ...x.dimensions as Dims };
  switch (op) {
    case 'mul': return { value: fixPrecision(y.value * x.value), dims: xd };
    case 'div': return x.value === 0 ? null : { value: fixPrecision(y.value / x.value), dims: xd };
    case 'add': return { value: fixPrecision(y.value + x.value), dims: xd };
    case 'sub': return { value: fixPrecision(y.value - x.value), dims: xd };
    default: return null;
  }
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

function applyUnit(y: CalcValue, x: CalcValue, op: RpnBinaryOp): { value: number; dims: Dims } | null {
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

export const applyRpnBinary = (y: CalcValue, x: CalcValue, op: RpnBinaryOp): CalcValue | null => {
  const result = applyScalar(y, x, op) ?? applyUnit(y, x, op);
  if (!result) return null;
  const dims = result.dims;
  for (const [dim, exp] of Object.entries(dims)) { if (exp === 0) delete dims[dim]; }
  return { value: result.value, dimensions: dims as DimensionalFormula };
};
