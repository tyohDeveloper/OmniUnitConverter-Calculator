import type { RpnAction } from '../rpnReducer';
export const setRpnResultPrefix = (v: string): RpnAction =>
  ({ type: 'SET_RPN_RESULT_PREFIX', payload: v });
