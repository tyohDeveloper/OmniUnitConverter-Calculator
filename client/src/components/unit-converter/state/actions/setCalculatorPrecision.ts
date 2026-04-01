import type { CalculatorAction } from '../calculatorReducer';
export const setCalculatorPrecision = (v: number): CalculatorAction =>
  ({ type: 'SET_CALCULATOR_PRECISION', payload: v });
