import type { CalculatorAction } from '../calculatorReducer';
export const setCalcOp1 = (v: '+' | '-' | '*' | '/' | null): CalculatorAction =>
  ({ type: 'SET_CALC_OP1', payload: v });
