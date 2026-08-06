import type { UnitCategory } from '@/lib/units/unitCategory';
import type { ConverterAction } from '../converterReducer';

export const setActiveCategory = (v: UnitCategory): ConverterAction =>
  ({ type: 'SET_ACTIVE_CATEGORY', payload: v });

export const setFromUnit = (v: string): ConverterAction =>
  ({ type: 'SET_FROM_UNIT', payload: v });

export const setToUnit = (v: string): ConverterAction =>
  ({ type: 'SET_TO_UNIT', payload: v });

export const setFromPrefix = (v: string): ConverterAction =>
  ({ type: 'SET_FROM_PREFIX', payload: v });

export const setToPrefix = (v: string): ConverterAction =>
  ({ type: 'SET_TO_PREFIX', payload: v });

export const setInputValue = (v: string): ConverterAction =>
  ({ type: 'SET_INPUT_VALUE', payload: v });

export const setResult = (v: number | null): ConverterAction =>
  ({ type: 'SET_RESULT', payload: v });

export const setSymbolicResult = (v: string | null): ConverterAction =>
  ({ type: 'SET_SYMBOLIC_RESULT', payload: v });

export const setPrecision = (v: number): ConverterAction =>
  ({ type: 'SET_PRECISION', payload: v });

export const setComparisonMode = (v: boolean): ConverterAction =>
  ({ type: 'SET_COMPARISON_MODE', payload: v });

export const swapUnits = (): ConverterAction =>
  ({ type: 'SWAP_UNITS' });
