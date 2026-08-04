import { multiplyDimensions } from '../dimensions/multiplyDimensions';
import { divideDimensions } from '../dimensions/divideDimensions';
import { canAddSubtract } from './canAddSubtract';
import { isDimensionless } from '../dimensions/isDimensionless';
import type { CalcValue } from '../units/calcValue';
import type { DimensionalFormula } from '../units/dimensionalFormula';

// EXCEPTION [architecture-standards §3.2]: type-and-function co-location.
export type CalcOp = '*' | '/' | '+' | '-' | null;
export interface CalcResult {
  value: number;
  dimensions: DimensionalFormula;
}

/**
 * Council-10: pure calculation for the simple-calculator (v0 op1 v1 op2 v2).
 *
 * Extracted from useCalculatorController. All inputs are explicit; the
 * function has no closure over hook state, so it is unit-testable and
 * usable from the reducer without provoking the ref-based recomputation
 * loop the original effect guarded against.
 */
export function computeCalcResult(input: {
  v0: CalcValue | null;
  v1: CalcValue | null;
  v2: CalcValue | null;
  op1: CalcOp;
  op2: CalcOp;
}): CalcResult | null {
  const { v0, v1, v2, op1, op2 } = input;
  if (!v0) return null;
  let value = v0.value;
  let dims: DimensionalFormula = { ...v0.dimensions };
  // Addability check for +/- uses the LHS operand (v0/v1), not the running
  // accumulator. This preserves the original controller behaviour where
  // a '*'-then-'+' chain checked v1 vs v2, not (v0*v1) vs v2.
  if (v1 && op1) ({ value, dims } = applyOp({ acc: { value, dims }, addLhs: v0, next: v1, op: op1 }));
  if (v1 && op1 && v2 && op2) ({ value, dims } = applyOp({ acc: { value, dims }, addLhs: v1, next: v2, op: op2 }));
  return { value, dimensions: dims };
}

// Apply one binary op to the accumulator. Additions of dimensionless to
// dimensioned "promote" the accumulator's dimensions to the RHS.
function applyOp(i: {
  acc: { value: number; dims: DimensionalFormula };
  addLhs: CalcValue;
  next: CalcValue;
  op: Exclude<CalcOp, null>;
}): { value: number; dims: DimensionalFormula } {
  const { acc, addLhs, next, op } = i;
  if (op === '*') return { value: acc.value * next.value, dims: multiplyDimensions(acc.dims, next.dimensions) };
  if (op === '/') return { value: acc.value / next.value, dims: divideDimensions(acc.dims, next.dimensions) };
  if (!canAddSubtract(addLhs, next)) return { value: acc.value, dims: acc.dims };
  const promoted = isDimensionless(acc.dims) && !isDimensionless(next.dimensions) ? { ...next.dimensions } : acc.dims;
  return { value: op === '+' ? acc.value + next.value : acc.value - next.value, dims: promoted };
}
