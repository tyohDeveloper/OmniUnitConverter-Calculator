import type { CalculatorState } from '../calculatorReducer';
export const selectCalcValues = (s: CalculatorState) => s.calcValues;
