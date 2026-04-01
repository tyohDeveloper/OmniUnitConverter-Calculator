import type { CalculatorState } from '../calculatorReducer';
export const selectCalculatorPrecision = (s: CalculatorState) => s.calculatorPrecision;
