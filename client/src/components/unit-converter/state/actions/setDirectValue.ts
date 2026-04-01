import type { UiPrefsAction } from '../uiPrefsReducer';
export const setDirectValue = (v: string): UiPrefsAction =>
  ({ type: 'SET_DIRECT_VALUE', payload: v });
