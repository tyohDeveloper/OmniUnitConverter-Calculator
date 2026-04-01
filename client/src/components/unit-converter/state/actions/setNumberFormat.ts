import type { NumberFormat } from '@/lib/formatting';
import type { UiPrefsAction } from '../uiPrefsReducer';
export const setNumberFormat = (v: NumberFormat): UiPrefsAction =>
  ({ type: 'SET_NUMBER_FORMAT', payload: v });
