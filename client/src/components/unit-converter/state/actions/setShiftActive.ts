import type { CalculatorAction } from '../calculatorReducer';
export const setShiftActive = (v: boolean): CalculatorAction =>
  ({ type: 'SET_SHIFT_ACTIVE', payload: v });
