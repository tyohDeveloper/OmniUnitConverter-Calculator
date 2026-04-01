import type { CalculatorAction } from '../calculatorReducer';
export const setResultPrefix = (v: string): CalculatorAction =>
  ({ type: 'SET_RESULT_PREFIX', payload: v });
