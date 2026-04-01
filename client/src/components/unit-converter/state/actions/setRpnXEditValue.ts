import type { RpnAction } from '../rpnReducer';
export const setRpnXEditValue = (v: string): RpnAction =>
  ({ type: 'SET_RPN_X_EDIT_VALUE', payload: v });
