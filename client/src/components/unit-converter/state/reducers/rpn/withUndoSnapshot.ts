import type { CalcValue } from '@/lib/units/calcValue';
import type { RpnState } from '../../rpnReducer';

/**
 * Shared epilogue for rpn actions that mutate the stack and want the
 * previous stack captured for UNDO.
 *
 * Every stack-changing case in rpnReducer needs the same four things:
 *   1. Snapshot the pre-change stack into previousRpnStack.
 *   2. Replace rpnStack with newStack.
 *   3. Reset rpnResultPrefix to 'none' (a new stack invalidates the
 *      currently displayed result prefix).
 *   4. Reset rpnSelectedAlternative to 0 (same reason).
 *
 * Applying steps 3-4 unconditionally matches the pre-extraction
 * behavior; do NOT skip them when newStack happens to equal the
 * previous stack.
 */
export function withUndoSnapshot(
  state: RpnState,
  newStack: Array<CalcValue | null>,
): RpnState {
  return {
    ...state,
    previousRpnStack: [...state.rpnStack],
    rpnStack: newStack,
    rpnResultPrefix: 'none',
    rpnSelectedAlternative: 0,
  };
}
