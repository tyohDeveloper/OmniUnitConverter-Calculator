import type { ConverterAction } from '../converterReducer';
export const setInputValue = (v: string): ConverterAction =>
  ({ type: 'SET_INPUT_VALUE', payload: v });
