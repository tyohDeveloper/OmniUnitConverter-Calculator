import type { CalcValue } from '../types';
import { fixPrecision } from '../fixPrecision';
import type { DispatchResult } from './dispatchResult';

type Dims = Record<string, number>;
type LogOp = 'exp' | 'ln' | 'pow10' | 'log10' | 'pow2' | 'log2';

export function applyLogOp(x: CalcValue, op: LogOp | string): DispatchResult {
  const d = x.dimensions as Dims;
  switch (op) {
    case 'exp':   return { value: fixPrecision(Math.exp(x.value)), dims: { ...d } };
    case 'pow10': return { value: fixPrecision(Math.pow(10, x.value)), dims: { ...d } };
    case 'pow2':  return { value: fixPrecision(Math.pow(2, x.value)), dims: { ...d } };
    case 'ln':    return x.value <= 0 ? null : { value: fixPrecision(Math.log(x.value)), dims: { ...d } };
    case 'log10': return x.value <= 0 ? null : { value: fixPrecision(Math.log10(x.value)), dims: { ...d } };
    case 'log2':  return x.value <= 0 ? null : { value: fixPrecision(Math.log2(x.value)), dims: { ...d } };
    default: return 'unhandled';
  }
}
