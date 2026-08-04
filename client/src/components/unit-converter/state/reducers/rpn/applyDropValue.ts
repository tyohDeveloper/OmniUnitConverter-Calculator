import type { RpnState } from '../../rpnReducer';
import { withUndoSnapshot } from './withUndoSnapshot';

/**
 * DROP_VALUE handler.
 *
 * Removes the X register and shifts Y/Z/T down: X ← Y, Y ← Z, Z ← T,
 * T ← null. The T register is filled with null rather than a sentinel
 * because the UI treats null as the empty display for a register slot.
 * Undo-snapshot + display-reset epilogue delegated to withUndoSnapshot.
 */
export function applyDropValue(state: RpnState): RpnState {
  const newStack = [...state.rpnStack];
  newStack[0] = newStack[1];
  newStack[1] = newStack[2];
  newStack[2] = newStack[3];
  newStack[3] = null;
  return withUndoSnapshot(state, newStack);
}
