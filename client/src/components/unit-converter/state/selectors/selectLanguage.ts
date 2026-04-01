import type { UiPrefsState } from '../uiPrefsReducer';
export const selectLanguage = (s: UiPrefsState) => s.language;
