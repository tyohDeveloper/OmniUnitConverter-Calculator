import { useCallback } from 'react';
import type { CalcValue } from '@/lib/units/calcValue';

interface UseCalculatorRpnStackOpsArgs {
  rpnStack: Array<CalcValue | null>;
  previousRpnStack: Array<CalcValue | null>;
  lastX: CalcValue | null;
  saveRpnStackForUndo: () => void;
  setRpnStack: (v: Array<CalcValue | null> | ((prev: Array<CalcValue | null>) => Array<CalcValue | null>)) => void;
  setPreviousRpnStack: (v: Array<CalcValue | null>) => void;
  setRpnResultPrefixRaw: (v: string) => void;
  setRpnSelectedAlternativeRaw: (v: number) => void;
  triggerFlashRpnResult: () => void;
}

// -- Stack transformation helpers (pure) ---------------------------
// shiftDown: [_, prev[1], prev[2], prev[3]] — used by push + pushEntry.
export const shiftDown = (prev: Array<CalcValue | null>): Array<CalcValue | null> => {
  const ns = [...prev]; ns[0] = prev[1]; ns[1] = prev[2]; ns[2] = prev[3]; return ns;
};

// shiftUp: [prev[0], prev[0], prev[1], prev[2]] — used by drop.
export const shiftUp = (prev: Array<CalcValue | null>): Array<CalcValue | null> => {
  const ns = [...prev]; ns[1] = prev[0]; ns[2] = prev[1]; ns[3] = prev[2]; return ns;
};

// pushEntry: shiftDown + set position 3 to new entry.
export const pushEntry = (prev: Array<CalcValue | null>, entry: CalcValue): Array<CalcValue | null> => {
  const ns = shiftDown(prev); ns[3] = entry; return ns;
};

const swapXY = (prev: Array<CalcValue | null>): Array<CalcValue | null> => {
  const ns = [...prev]; ns[3] = prev[2]; ns[2] = prev[3]; return ns;
};

// -- Shift / swap ops (no push-constant side-effects) --------------
function useShiftOps(a: UseCalculatorRpnStackOpsArgs) {
  const clearRpnStack = useCallback(() => {
    a.saveRpnStackForUndo();
    a.setRpnStack([null, null, null, null]);
    a.setRpnResultPrefixRaw('none');
    a.setRpnSelectedAlternativeRaw(0);
  }, [a.saveRpnStackForUndo, a.setRpnStack, a.setRpnResultPrefixRaw, a.setRpnSelectedAlternativeRaw]);
  const pushToRpnStack = useCallback(() => {
    if (a.rpnStack[3]) { a.saveRpnStackForUndo(); a.setRpnStack(shiftDown); }
  }, [a.rpnStack, a.saveRpnStackForUndo, a.setRpnStack]);
  const dropRpnStack = useCallback(() => { a.saveRpnStackForUndo(); a.setRpnStack(shiftUp); },
    [a.saveRpnStackForUndo, a.setRpnStack]);
  const swapRpnXY = useCallback(() => {
    if (a.rpnStack[3] && a.rpnStack[2]) { a.saveRpnStackForUndo(); a.setRpnStack(swapXY); }
  }, [a.rpnStack, a.saveRpnStackForUndo, a.setRpnStack]);
  return { clearRpnStack, pushToRpnStack, dropRpnStack, swapRpnXY };
}

// -- Undo / recall-lastX / push-constant (touch lastX or history) --
function useValueOps(a: UseCalculatorRpnStackOpsArgs) {
  const undoRpnStack = useCallback(() => {
    const temp = [...a.rpnStack]; a.setRpnStack([...a.previousRpnStack]); a.setPreviousRpnStack(temp);
  }, [a.rpnStack, a.previousRpnStack, a.setRpnStack, a.setPreviousRpnStack]);
  const recallLastX = useCallback(() => {
    const lx = a.lastX; if (!lx) return;
    a.saveRpnStackForUndo(); a.setRpnStack(prev => pushEntry(prev, lx));
  }, [a.lastX, a.saveRpnStackForUndo, a.setRpnStack]);
  const pushRpnConstant = useCallback((value: number) => {
    a.saveRpnStackForUndo();
    a.setRpnStack(prev => pushEntry(prev, { value, dimensions: {}, prefix: 'none' }));
    a.setRpnResultPrefixRaw('none'); a.setRpnSelectedAlternativeRaw(0); a.triggerFlashRpnResult();
  }, [a.saveRpnStackForUndo, a.setRpnStack, a.setRpnResultPrefixRaw, a.setRpnSelectedAlternativeRaw, a.triggerFlashRpnResult]);
  return { undoRpnStack, recallLastX, pushRpnConstant };
}

/**
 * Basic stack-manipulation operations: clear, push, drop, undo,
 * swap, recall-lastX, push-constant. Split into two internal
 * sub-hooks (useShiftOps + useValueOps) to keep each function body
 * within the §3.5 20-line cap.
 *
 * pullFromPane lives in useCalculatorRpnPull because it depends on
 * converter/direct pane state that's orthogonal to core stack ops.
 */
export function useCalculatorRpnStackOps(args: UseCalculatorRpnStackOpsArgs) {
  return { ...useShiftOps(args), ...useValueOps(args) };
}
