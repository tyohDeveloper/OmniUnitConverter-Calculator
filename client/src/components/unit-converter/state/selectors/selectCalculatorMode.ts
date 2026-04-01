import type { CalculatorState } from '../calculatorReducer';
export const selectCalculatorMode = (s: CalculatorState) => s.calculatorMode;
