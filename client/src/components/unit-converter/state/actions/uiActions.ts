import type { NumberFormat } from '@/lib/units/numberFormat';
import type { UiPrefsAction, PasteStatus, PendingPasteUnit } from '../uiPrefsReducer';

export const setNumberFormat = (v: NumberFormat): UiPrefsAction =>
  ({ type: 'SET_NUMBER_FORMAT', payload: v });

export const setLanguage = (v: string): UiPrefsAction =>
  ({ type: 'SET_LANGUAGE', payload: v });

export const setActiveTab = (v: string): UiPrefsAction =>
  ({ type: 'SET_ACTIVE_TAB', payload: v });

export const setDirectValue = (v: string): UiPrefsAction =>
  ({ type: 'SET_DIRECT_VALUE', payload: v });

export const setDirectExponents = (v: Record<string, number>): UiPrefsAction =>
  ({ type: 'SET_DIRECT_EXPONENTS', payload: v });

export const updateDirectExponents = (
  updater: (prev: Record<string, number>) => Record<string, number>
): UiPrefsAction => ({ type: 'UPDATE_DIRECT_EXPONENTS', payload: updater });

// Council-11: action creators for the paste-flow state that used to live
// as refs and useState inside useConverterController.
export const setPendingPasteUnit = (v: PendingPasteUnit | null): UiPrefsAction =>
  ({ type: 'SET_PENDING_PASTE_UNIT', payload: v });

export const setConverterPasteStatus = (v: PasteStatus): UiPrefsAction =>
  ({ type: 'SET_CONVERTER_PASTE_STATUS', payload: v });

export const setCustomPasteStatus = (v: PasteStatus): UiPrefsAction =>
  ({ type: 'SET_CUSTOM_PASTE_STATUS', payload: v });
