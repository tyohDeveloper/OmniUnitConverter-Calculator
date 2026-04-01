import type { CalculatorAction } from '../calculatorReducer';
export const setSelectedAlternative = (v: number): CalculatorAction =>
  ({ type: 'SET_SELECTED_ALTERNATIVE', payload: v });
