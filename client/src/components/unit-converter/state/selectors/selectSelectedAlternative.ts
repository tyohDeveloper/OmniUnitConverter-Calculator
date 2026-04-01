import type { CalculatorState } from '../calculatorReducer';
export const selectSelectedAlternative = (s: CalculatorState) => s.selectedAlternative;
