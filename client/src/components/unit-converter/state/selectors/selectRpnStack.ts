import type { RpnState } from '../rpnReducer';
export const selectRpnStack = (s: RpnState) => s.rpnStack;
