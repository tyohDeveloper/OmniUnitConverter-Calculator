import type { RpnState } from '../../rpnReducer';
import { withUndoSnapshot } from './withUndoSnapshot';

/**
 * SWAP_XY handler.
 *
 * Swaps the X (index 0) and Y (index 1) registers. Guards on both
 * being non-null: swapping into or out of a null slot is a no-op
 * (returning state unchanged also skips the undo snapshot, which is
 * the pre-extraction behavior).
 */
export function applySwapXY(state: RpnState): RpnState {
  if (state.rpnStack[0] === null || state.rpnStack[1] === null) return state;
  const newStack = [...state.rpnStack];
  const temp = newStack[0];
  newStack[0] = newStack[1];
  newStack[1] = temp;
  return withUndoSnapshot(state, newStack);
}
