import type { RpnAction } from '../rpnReducer';
export const clearStack = (): RpnAction => ({ type: 'CLEAR_STACK' });
