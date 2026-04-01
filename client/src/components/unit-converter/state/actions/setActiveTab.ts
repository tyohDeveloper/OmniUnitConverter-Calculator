import type { UiPrefsAction } from '../uiPrefsReducer';
export const setActiveTab = (v: string): UiPrefsAction =>
  ({ type: 'SET_ACTIVE_TAB', payload: v });
