import type { UiPrefsAction } from '../uiPrefsReducer';
export const updateDirectExponents = (
  updater: (prev: Record<string, number>) => Record<string, number>
): UiPrefsAction => ({ type: 'UPDATE_DIRECT_EXPONENTS', payload: updater });
