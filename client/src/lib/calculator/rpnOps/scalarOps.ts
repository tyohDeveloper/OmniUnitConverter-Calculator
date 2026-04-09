import type { CalcValue } from '../types';
import { fixPrecision } from '../fixPrecision';

type Dims = Record<string, number>;
type ScalarOp = 'mul' | 'div' | 'add' | 'sub';

export function applyScalar(y: CalcValue, x: CalcValue, op: ScalarOp | string): { value: number; dims: Dims } | null {
  const xd = { ...x.dimensions as Dims };
  switch (op) {
    case 'mul': return { value: fixPrecision(y.value * x.value), dims: xd };
    case 'div': return x.value === 0 ? null : { value: fixPrecision(y.value / x.value), dims: xd };
    case 'add': return { value: fixPrecision(y.value + x.value), dims: xd };
    case 'sub': return { value: fixPrecision(y.value - x.value), dims: xd };
    default: return null;
  }
}
