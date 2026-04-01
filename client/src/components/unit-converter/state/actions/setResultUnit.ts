import type { CalculatorAction } from '../calculatorReducer';
export const setResultUnit = (v: string | null): CalculatorAction =>
  ({ type: 'SET_RESULT_UNIT', payload: v });
