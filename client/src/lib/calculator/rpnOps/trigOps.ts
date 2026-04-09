import type { DimensionalFormula } from '../../units/dimensionalFormula';
import type { CalcValue } from '../types';
import { isDimensionless } from '../isDimensionless';
import { isRadians } from '../isRadians';
import { fixPrecision } from '../fixPrecision';
import type { DispatchResult } from './dispatchResult';

type Dims = DimensionalFormula;
type TrigOp = 'sin' | 'cos' | 'tan' | 'asin' | 'acos' | 'atan';

export function applyTrigOp(x: CalcValue, op: TrigOp | string): DispatchResult {
  const isRad = isRadians(x.dimensions as Dims);
  const isDimless = isDimensionless(x.dimensions as Dims);
  const d = x.dimensions as Record<string, number>;
  switch (op) {
    case 'sin':  return { value: fixPrecision(Math.sin(x.value)), dims: isRad ? {} : { ...d } };
    case 'cos':  return { value: fixPrecision(Math.cos(x.value)), dims: isRad ? {} : { ...d } };
    case 'tan':  return { value: fixPrecision(Math.tan(x.value)), dims: isRad ? {} : { ...d } };
    case 'asin': return (x.value < -1 || x.value > 1) ? null : { value: fixPrecision(Math.asin(x.value)), dims: isDimless ? { angle: 1 } : { ...d } };
    case 'acos': return (x.value < -1 || x.value > 1) ? null : { value: fixPrecision(Math.acos(x.value)), dims: isDimless ? { angle: 1 } : { ...d } };
    case 'atan': return { value: fixPrecision(Math.atan(x.value)), dims: isDimless ? { angle: 1 } : { ...d } };
    default: return 'unhandled';
  }
}
