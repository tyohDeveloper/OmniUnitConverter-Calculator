import type { RpnAction } from '../rpnReducer';
export const undoStack = (): RpnAction => ({ type: 'UNDO_STACK' });
