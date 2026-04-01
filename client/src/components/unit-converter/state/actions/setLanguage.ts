import type { UiPrefsAction } from '../uiPrefsReducer';
export const setLanguage = (v: string): UiPrefsAction =>
  ({ type: 'SET_LANGUAGE', payload: v });
