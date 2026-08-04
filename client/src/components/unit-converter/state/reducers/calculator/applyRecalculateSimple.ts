import { computeCalcResult } from '@/lib/calculator/computeCalcResult';
import type { CalculatorState } from '../../calculatorReducer';

/**
 * RECALCULATE_SIMPLE handler.
 *
 * Atomically re-runs the simple-calculator math (v0 op1 v1 op2 v2)
 * against the current state and, if a new result is produced, writes
 * it into calcValues[3] while clearing the display-side metadata
 * (resultUnit/resultCategory) and resetting the prefix + alternative
 * selectors. Returns state unchanged when compute yields null — this
 * gives StrictMode double-invocation a natural no-op and removes the
 * need for the controller-side lastCalcInputsRef dedup that used to
 * live in useCalculatorController (see council-10).
 *
 * The math itself lives in lib/calculator/computeCalcResult.ts; this
 * handler is the state-shaping glue.
 */
export function applyRecalculateSimple(state: CalculatorState): CalculatorState {
  const computed = computeCalcResult({
    v0: state.calcValues[0] ?? null,
    v1: state.calcValues[1] ?? null,
    v2: state.calcValues[2] ?? null,
    op1: state.calcOp1,
    op2: state.calcOp2,
  });
  if (!computed) return state;
  const nv = [...state.calcValues];
  nv[3] = { value: computed.value, dimensions: computed.dimensions, prefix: 'none' };
  return {
    ...state,
    calcValues: nv,
    resultPrefix: 'none',
    selectedAlternative: 0,
    resultCategory: null,
    resultUnit: null,
  };
}
