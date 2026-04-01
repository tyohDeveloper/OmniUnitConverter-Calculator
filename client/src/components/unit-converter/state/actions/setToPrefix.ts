import type { ConverterAction } from '../converterReducer';
export const setToPrefix = (v: string): ConverterAction =>
  ({ type: 'SET_TO_PREFIX', payload: v });
