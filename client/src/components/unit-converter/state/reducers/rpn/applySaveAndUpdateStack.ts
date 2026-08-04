import type { CalcValue } from '@/lib/units/calcValue';
import type { RpnState } from '../../rpnReducer';
import { withUndoSnapshot } from './withUndoSnapshot';

/**
 * SAVE_AND_UPDATE_STACK handler.
 *
 * General-purpose stack mutator: the payload is an updater function
 * that receives a shallow copy of the current stack and returns the
 * new stack. Used by RPN operations (unary, binary, constants) whose
 * exact transform is decided by the caller rather than the reducer.
 *
 * The updater is called with a copy so producers may mutate in place
 * without touching state. The undo-snapshot + display-reset epilogue
 * is delegated to withUndoSnapshot.
 */
export function applySaveAndUpdateStack(
  state: RpnState,
  updater: (stack: Array<CalcValue | null>) => Array<CalcValue | null>,
): RpnState {
  const newStack = updater([...state.rpnStack]);
  return withUndoSnapshot(state, newStack);
}
