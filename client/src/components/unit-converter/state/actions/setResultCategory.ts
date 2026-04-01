import type { UnitCategory } from '@/lib/units/types';
import type { CalculatorAction } from '../calculatorReducer';
export const setResultCategory = (v: UnitCategory | null): CalculatorAction =>
  ({ type: 'SET_RESULT_CATEGORY', payload: v });
