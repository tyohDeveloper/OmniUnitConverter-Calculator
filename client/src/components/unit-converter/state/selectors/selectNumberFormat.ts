import type { UiPrefsState } from '../uiPrefsReducer';
export const selectNumberFormat = (s: UiPrefsState) => s.numberFormat;
