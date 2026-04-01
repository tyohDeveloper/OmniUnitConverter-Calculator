import type { RpnAction } from '../rpnReducer';
export const setRpnXEditing = (v: boolean): RpnAction =>
  ({ type: 'SET_RPN_X_EDITING', payload: v });
