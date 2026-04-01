import type { ConverterAction } from '../converterReducer';
export const setFromUnit = (v: string): ConverterAction =>
  ({ type: 'SET_FROM_UNIT', payload: v });
