import type { CalculatorState } from '../calculatorReducer';
export const selectResultPrefix = (s: CalculatorState) => s.resultPrefix;
