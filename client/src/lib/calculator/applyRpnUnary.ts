import type { DimensionalFormula } from '../units/dimensionalFormula';
import type { CalcValue } from './types';
import type { DispatchResult } from './rpnOps/dispatchResult';
import { applyPowerOp } from './rpnOps/powerOps';
import { applyLogOp } from './rpnOps/logOps';
import { applyRoundOp } from './rpnOps/roundingOps';
import { applyTrigOp } from './rpnOps/trigOps';
import { applyHyperbolicOp } from './rpnOps/hyperbolicOps';

export type RpnUnaryOp =
  | 'square' | 'cube' | 'sqrt' | 'cbrt' | 'recip'
  | 'exp' | 'ln' | 'pow10' | 'log10' | 'pow2' | 'log2'
  | 'sin' | 'cos' | 'tan' | 'asin' | 'acos' | 'atan'
  | 'sinh' | 'cosh' | 'tanh' | 'asinh' | 'acosh' | 'atanh'
  | 'rnd' | 'trunc' | 'floor' | 'ceil'
  | 'neg' | 'abs';

function dispatchOp(x: CalcValue, op: RpnUnaryOp, precision: number): DispatchResult {
  const d = x.dimensions as Record<string, number>;
  if (op === 'neg') return { value: -x.value, dims: { ...d } };
  if (op === 'abs') return { value: Math.abs(x.value), dims: { ...d } };
  const r1 = applyPowerOp(x, op); if (r1 !== 'unhandled') return r1;
  const r2 = applyLogOp(x, op); if (r2 !== 'unhandled') return r2;
  const r3 = applyRoundOp(x, op, precision); if (r3 !== 'unhandled') return r3;
  const r4 = applyTrigOp(x, op); if (r4 !== 'unhandled') return r4;
  return applyHyperbolicOp(x, op);
}

export const applyRpnUnary = (x: CalcValue, op: RpnUnaryOp, precision: number = 10): CalcValue | null => {
  const result = dispatchOp(x, op, precision);
  if (!result || result === 'unhandled') return null;
  const dims = result.dims;
  for (const [dim, exp] of Object.entries(dims)) { if (exp === 0) delete dims[dim]; }
  const preserveCategory = op === 'neg' || op === 'abs';
  return {
    value: result.value,
    dimensions: dims as DimensionalFormula,
    ...(preserveCategory && x.sourceCategory ? { sourceCategory: x.sourceCategory } : {}),
  };
};
