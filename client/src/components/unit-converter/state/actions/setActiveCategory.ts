import type { UnitCategory } from '@/lib/units/types';
import type { ConverterAction } from '../converterReducer';
export const setActiveCategory = (v: UnitCategory): ConverterAction =>
  ({ type: 'SET_ACTIVE_CATEGORY', payload: v });
