import type { ConverterAction } from '../converterReducer';
export const setResult = (v: number | null): ConverterAction =>
  ({ type: 'SET_RESULT', payload: v });
