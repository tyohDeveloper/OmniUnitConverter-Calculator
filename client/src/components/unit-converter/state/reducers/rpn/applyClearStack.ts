import type { RpnState } from '../../rpnReducer';
import { withUndoSnapshot } from './withUndoSnapshot';

/**
 * CLEAR_STACK handler.
 *
 * Full reset of the RPN calculator: stack goes to all-null, edit
 * mode exits, edit-buffer clears, lastX is dropped. The stack
 * replacement + display-reset epilogue uses withUndoSnapshot so
 * the pre-clear stack is captured for UNDO, matching pre-extraction
 * behavior.
 */
export function applyClearStack(state: RpnState): RpnState {
  return {
    ...withUndoSnapshot(state, [null, null, null, null]),
    lastX: null,
    rpnXEditing: false,
    rpnXEditValue: '',
  };
}
