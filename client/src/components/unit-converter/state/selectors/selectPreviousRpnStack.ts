import type { RpnState } from '../rpnReducer';
export const selectPreviousRpnStack = (s: RpnState) => s.previousRpnStack;
