import type { ConverterAction } from '../converterReducer';
export const setComparisonMode = (v: boolean): ConverterAction =>
  ({ type: 'SET_COMPARISON_MODE', payload: v });
