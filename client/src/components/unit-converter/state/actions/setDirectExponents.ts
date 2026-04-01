import type { UiPrefsAction } from '../uiPrefsReducer';
export const setDirectExponents = (v: Record<string, number>): UiPrefsAction =>
  ({ type: 'SET_DIRECT_EXPONENTS', payload: v });
