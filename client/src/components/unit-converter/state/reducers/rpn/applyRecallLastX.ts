import type { RpnState } from '../../rpnReducer';
import { withUndoSnapshot } from './withUndoSnapshot';

/**
 * RECALL_LAST_X handler.
 *
 * Pushes state.lastX onto the stack in the shift-down direction (same
 * as PUSH_VALUE): new value at X, previous X/Y/Z shift down, previous
 * T is dropped. No-op when lastX is null (returning state unchanged
 * also skips the undo snapshot, which is the pre-extraction behavior).
 */
export function applyRecallLastX(state: RpnState): RpnState {
  if (state.lastX === null) return state;
  const newStack = [...state.rpnStack];
  newStack[3] = newStack[2];
  newStack[2] = newStack[1];
  newStack[1] = newStack[0];
  newStack[0] = state.lastX;
  return withUndoSnapshot(state, newStack);
}
