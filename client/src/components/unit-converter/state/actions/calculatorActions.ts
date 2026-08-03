import type { CalcValue } from '@/lib/units/calcValue';
import type { UnitCategory } from '@/lib/units/unitCategory';
import type { CalculatorAction } from '../calculatorReducer';

export const setCalculatorMode = (v: 'simple' | 'rpn'): CalculatorAction =>
  ({ type: 'SET_CALCULATOR_MODE', payload: v });

export const setShiftActive = (v: boolean): CalculatorAction =>
  ({ type: 'SET_SHIFT_ACTIVE', payload: v });

export const setCalculatorPrecision = (v: number): CalculatorAction =>
  ({ type: 'SET_CALCULATOR_PRECISION', payload: v });

export const setCalcValues = (v: Array<CalcValue | null>): CalculatorAction =>
  ({ type: 'SET_CALC_VALUES', payload: v });

export const updateCalcValues = (
  updater: (prev: Array<CalcValue | null>) => Array<CalcValue | null>
): CalculatorAction => ({ type: 'UPDATE_CALC_VALUES', payload: updater });

export const setCalcOp1 = (v: '+' | '-' | '*' | '/' | null): CalculatorAction =>
  ({ type: 'SET_CALC_OP1', payload: v });

export const setCalcOp2 = (v: '+' | '-' | '*' | '/' | null): CalculatorAction =>
  ({ type: 'SET_CALC_OP2', payload: v });

export const setResultUnit = (v: string | null): CalculatorAction =>
  ({ type: 'SET_RESULT_UNIT', payload: v });

export const setResultCategory = (v: UnitCategory | null): CalculatorAction =>
  ({ type: 'SET_RESULT_CATEGORY', payload: v });

export const setResultPrefix = (v: string): CalculatorAction =>
  ({ type: 'SET_RESULT_PREFIX', payload: v });

export const setSelectedAlternative = (v: number): CalculatorAction =>
  ({ type: 'SET_SELECTED_ALTERNATIVE', payload: v });

export const togglePreserveSourceUnit = (): CalculatorAction =>
  ({ type: 'TOGGLE_PRESERVE_SOURCE_UNIT' });

// Council-10: atomic simple-calculator recalc. Reducer reads current state
// and produces new state; no controller-side ref needed to dedup.
export const recalculateSimple = (): CalculatorAction =>
  ({ type: 'RECALCULATE_SIMPLE' });
