import type { CalculatorState } from '../calculatorReducer';
export const selectResultCategory = (s: CalculatorState) => s.resultCategory;
