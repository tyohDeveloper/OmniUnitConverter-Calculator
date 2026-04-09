import type { CalcValue } from '../types';
import type { DispatchResult } from './dispatchResult';

type Dims = Record<string, number>;
type RoundOp = 'rnd' | 'trunc' | 'floor' | 'ceil';

export function applyRoundOp(x: CalcValue, op: RoundOp | string, precision: number): DispatchResult {
  const factor = Math.pow(10, precision);
  const d = x.dimensions as Dims;
  switch (op) {
    case 'trunc': return { value: Math.trunc(x.value * factor) / factor, dims: { ...d } };
    case 'floor': return { value: Math.floor(x.value * factor) / factor, dims: { ...d } };
    case 'ceil':  return { value: Math.ceil(x.value * factor) / factor, dims: { ...d } };
    case 'rnd': {
      const scaled = x.value * factor;
      const floor = Math.floor(scaled);
      const rounded = Math.abs(scaled - floor - 0.5) < 1e-10
        ? (floor % 2 === 0 ? floor : floor + 1) / factor
        : Math.round(scaled) / factor;
      return { value: rounded, dims: { ...d } };
    }
    default: return 'unhandled';
  }
}
