import type { CalcValue } from '@/lib/units/calcValue';
import type { RpnState } from '../../rpnReducer';
import { withUndoSnapshot } from './withUndoSnapshot';

/**
 * PUSH_VALUE handler.
 *
 * Pushes a new value onto the RPN stack in the traditional
 * "shift-down" direction: the new value takes the X (index 0)
 * register, the previous X/Y/Z shift down to Y/Z/T, and the
 * previous T is dropped. The undo-snapshot + display-reset epilogue
 * is shared with the other stack-mutating handlers via
 * withUndoSnapshot.
 *
 * Note: this is intentionally different from
 * lib/calculator/buildPushFromConverter, which shifts UP
 * (new value at X, T discarded to make room). See council-08e.
 */
export function applyPushValue(state: RpnState, value: CalcValue): RpnState {
  const newStack = [...state.rpnStack];
  newStack[3] = newStack[2];
  newStack[2] = newStack[1];
  newStack[1] = newStack[0];
  newStack[0] = value;
  return withUndoSnapshot(state, newStack);
}
