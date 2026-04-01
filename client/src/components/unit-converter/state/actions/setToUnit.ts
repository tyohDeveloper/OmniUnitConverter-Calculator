import type { ConverterAction } from '../converterReducer';
export const setToUnit = (v: string): ConverterAction =>
  ({ type: 'SET_TO_UNIT', payload: v });
