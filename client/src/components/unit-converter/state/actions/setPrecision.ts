import type { ConverterAction } from '../converterReducer';
export const setPrecision = (v: number): ConverterAction =>
  ({ type: 'SET_PRECISION', payload: v });
