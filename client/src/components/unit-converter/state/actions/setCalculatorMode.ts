import type { CalculatorAction } from '../calculatorReducer';
export const setCalculatorMode = (v: 'simple' | 'rpn'): CalculatorAction =>
  ({ type: 'SET_CALCULATOR_MODE', payload: v });
