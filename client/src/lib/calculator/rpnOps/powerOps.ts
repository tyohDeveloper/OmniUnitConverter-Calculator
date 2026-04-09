import type { CalcValue } from '../types';
import { fixPrecision } from '../fixPrecision';
import type { DispatchResult } from './dispatchResult';

export type { DispatchResult };

type Dims = Record<string, number>;

type PowerOp = 'square' | 'cube' | 'sqrt' | 'cbrt' | 'recip';

export function applyPowerOp(x: CalcValue, op: PowerOp | string): DispatchResult {
  const d = x.dimensions as Dims;
  switch (op) {
    case 'square': return { value: fixPrecision(x.value * x.value), dims: Object.fromEntries(Object.entries(d).map(([k, v]) => [k, v * 2])) };
    case 'cube':   return { value: fixPrecision(x.value * x.value * x.value), dims: Object.fromEntries(Object.entries(d).map(([k, v]) => [k, v * 3])) };
    case 'sqrt':   return x.value < 0 ? null : { value: fixPrecision(Math.sqrt(x.value)), dims: Object.fromEntries(Object.entries(d).map(([k, v]) => [k, Math.ceil(v / 2)])) };
    case 'cbrt':   return { value: fixPrecision(Math.cbrt(x.value)), dims: Object.fromEntries(Object.entries(d).map(([k, v]) => [k, Math.ceil(v / 3)])) };
    case 'recip':  return x.value === 0 ? null : { value: fixPrecision(1 / x.value), dims: Object.fromEntries(Object.entries(d).map(([k, v]) => [k, -v])) };
    default: return 'unhandled';
  }
}
