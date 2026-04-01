import type { UiPrefsState } from '../uiPrefsReducer';
export const selectActiveTab = (s: UiPrefsState) => s.activeTab;
