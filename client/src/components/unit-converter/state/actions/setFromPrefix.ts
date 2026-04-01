import type { ConverterAction } from '../converterReducer';
export const setFromPrefix = (v: string): ConverterAction =>
  ({ type: 'SET_FROM_PREFIX', payload: v });
