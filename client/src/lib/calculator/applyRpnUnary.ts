import type { DimensionalFormula } from '../units/shared-types';
import type { CalcValue } from './types';
import { isDimensionless } from './isDimensionless';
import { isRadians } from './isRadians';
import { fixPrecision } from './fixPrecision';

export type RpnUnaryOp =
  | 'square' | 'cube' | 'sqrt' | 'cbrt' | 'recip'
  | 'exp' | 'ln' | 'pow10' | 'log10' | 'pow2' | 'log2'
  | 'sin' | 'cos' | 'tan' | 'asin' | 'acos' | 'atan'
  | 'sinh' | 'cosh' | 'tanh' | 'asinh' | 'acosh' | 'atanh'
  | 'rnd' | 'trunc' | 'floor' | 'ceil'
  | 'neg' | 'abs';

type Dims = DimensionalFormula;
type DispatchResult = { value: number; dims: Record<string, number> } | null | 'unhandled';

function applyPowerOp(x: CalcValue, op: RpnUnaryOp): DispatchResult {
  const d = x.dimensions as Record<string, number>;
  switch (op) {
    case 'square': return { value: fixPrecision(x.value * x.value), dims: Object.fromEntries(Object.entries(d).map(([k, v]) => [k, v * 2])) };
    case 'cube':   return { value: fixPrecision(x.value * x.value * x.value), dims: Object.fromEntries(Object.entries(d).map(([k, v]) => [k, v * 3])) };
    case 'sqrt':   return x.value < 0 ? null : { value: fixPrecision(Math.sqrt(x.value)), dims: Object.fromEntries(Object.entries(d).map(([k, v]) => [k, Math.ceil(v / 2)])) };
    case 'cbrt':   return { value: fixPrecision(Math.cbrt(x.value)), dims: Object.fromEntries(Object.entries(d).map(([k, v]) => [k, Math.ceil(v / 3)])) };
    case 'recip':  return x.value === 0 ? null : { value: fixPrecision(1 / x.value), dims: Object.fromEntries(Object.entries(d).map(([k, v]) => [k, -v])) };
    default: return 'unhandled';
  }
}

function applyLogOp(x: CalcValue, op: RpnUnaryOp): DispatchResult {
  const d = x.dimensions as Record<string, number>;
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

function applyRoundOp(x: CalcValue, op: RpnUnaryOp, precision: number): DispatchResult {
  const factor = Math.pow(10, precision);
  const d = x.dimensions as Record<string, number>;
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

function applyTrigOp(x: CalcValue, op: RpnUnaryOp): DispatchResult {
  const isRad = isRadians(x.dimensions as Dims);
  const isDimless = isDimensionless(x.dimensions as Dims);
  const d = x.dimensions as Record<string, number>;
  switch (op) {
    case 'sin':   return { value: fixPrecision(Math.sin(x.value)), dims: isRad ? {} : { ...d } };
    case 'cos':   return { value: fixPrecision(Math.cos(x.value)), dims: isRad ? {} : { ...d } };
    case 'tan':   return { value: fixPrecision(Math.tan(x.value)), dims: isRad ? {} : { ...d } };
    case 'sinh':  return { value: fixPrecision(Math.sinh(x.value)), dims: isRad ? {} : { ...d } };
    case 'cosh':  return { value: fixPrecision(Math.cosh(x.value)), dims: isRad ? {} : { ...d } };
    case 'tanh':  return { value: fixPrecision(Math.tanh(x.value)), dims: isRad ? {} : { ...d } };
    case 'asin':  return (x.value < -1 || x.value > 1) ? null : { value: fixPrecision(Math.asin(x.value)), dims: isDimless ? { angle: 1 } : { ...d } };
    case 'acos':  return (x.value < -1 || x.value > 1) ? null : { value: fixPrecision(Math.acos(x.value)), dims: isDimless ? { angle: 1 } : { ...d } };
    case 'atan':  return { value: fixPrecision(Math.atan(x.value)), dims: isDimless ? { angle: 1 } : { ...d } };
    case 'asinh': return { value: fixPrecision(Math.asinh(x.value)), dims: isDimless ? { angle: 1 } : { ...d } };
    case 'acosh': return x.value < 1 ? null : { value: fixPrecision(Math.acosh(x.value)), dims: isDimless ? { angle: 1 } : { ...d } };
    case 'atanh': return (x.value <= -1 || x.value >= 1) ? null : { value: fixPrecision(Math.atanh(x.value)), dims: isDimless ? { angle: 1 } : { ...d } };
    default: return 'unhandled';
  }
}

function dispatchOp(x: CalcValue, op: RpnUnaryOp, precision: number): DispatchResult {
  const d = x.dimensions as Record<string, number>;
  if (op === 'neg') return { value: -x.value, dims: { ...d } };
  if (op === 'abs') return { value: Math.abs(x.value), dims: { ...d } };
  const r1 = applyPowerOp(x, op); if (r1 !== 'unhandled') return r1;
  const r2 = applyLogOp(x, op); if (r2 !== 'unhandled') return r2;
  const r3 = applyRoundOp(x, op, precision); if (r3 !== 'unhandled') return r3;
  return applyTrigOp(x, op);
}

export const applyRpnUnary = (x: CalcValue, op: RpnUnaryOp, precision: number = 10): CalcValue | null => {
  const result = dispatchOp(x, op, precision);
  if (!result || result === 'unhandled') return null;
  const dims = result.dims;
  for (const [dim, exp] of Object.entries(dims)) { if (exp === 0) delete dims[dim]; }
  return { value: result.value, dimensions: dims as DimensionalFormula };
};
