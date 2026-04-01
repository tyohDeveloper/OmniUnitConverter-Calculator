import type { CalculatorAction } from '../calculatorReducer';
export const setCalcOp2 = (v: '+' | '-' | '*' | '/' | null): CalculatorAction =>
  ({ type: 'SET_CALC_OP2', payload: v });
