import type { DimensionalFormula } from '../../units/dimensionalFormula';
import type { CalcValue } from '../types';
import { isDimensionless } from '../isDimensionless';
import { isRadians } from '../isRadians';
import { fixPrecision } from '../fixPrecision';
import type { DispatchResult } from './dispatchResult';

type Dims = DimensionalFormula;
type HyperbolicOp = 'sinh' | 'cosh' | 'tanh' | 'asinh' | 'acosh' | 'atanh';

export function applyHyperbolicOp(x: CalcValue, op: HyperbolicOp | string): DispatchResult {
  const isRad = isRadians(x.dimensions as Dims);
  const isDimless = isDimensionless(x.dimensions as Dims);
  const d = x.dimensions as Record<string, number>;
  switch (op) {
    case 'sinh':  return { value: fixPrecision(Math.sinh(x.value)), dims: isRad ? {} : { ...d } };
    case 'cosh':  return { value: fixPrecision(Math.cosh(x.value)), dims: isRad ? {} : { ...d } };
    case 'tanh':  return { value: fixPrecision(Math.tanh(x.value)), dims: isRad ? {} : { ...d } };
    case 'asinh': return { value: fixPrecision(Math.asinh(x.value)), dims: isDimless ? { angle: 1 } : { ...d } };
    case 'acosh': return x.value < 1 ? null : { value: fixPrecision(Math.acosh(x.value)), dims: isDimless ? { angle: 1 } : { ...d } };
    case 'atanh': return (x.value <= -1 || x.value >= 1) ? null : { value: fixPrecision(Math.atanh(x.value)), dims: isDimless ? { angle: 1 } : { ...d } };
    default: return 'unhandled';
  }
}
