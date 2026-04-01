import type { RpnAction } from '../rpnReducer';
export const setRpnSelectedAlternative = (v: number): RpnAction =>
  ({ type: 'SET_RPN_SELECTED_ALTERNATIVE', payload: v });
