import { useCallback } from 'react';
import type { CalcValue } from '@/lib/units/calcValue';
import { isDimensionless } from '@/lib/dimensions/isDimensionless';
import { dimensionsEqual } from '@/lib/dimensions/dimensionsEqual';
import { applyRpnUnary as applyRpnUnaryLib } from '@/lib/calculator/applyRpnUnary';
import { applyRpnBinary as applyRpnBinaryLib } from '@/lib/calculator/applyRpnBinary';
import type { RpnUnaryOp, RpnBinaryOp } from './useCalculatorControllerReturn';

interface UseCalculatorRpnOpsArgs {
  rpnStack: Array<CalcValue | null>;
  calculatorPrecision: number;
  saveRpnStackForUndo: () => void;
  setLastX: (v: CalcValue) => void;
  setRpnStack: (v: Array<CalcValue | null> | ((prev: Array<CalcValue | null>) => Array<CalcValue | null>)) => void;
  setRpnResultPrefixRaw: (v: string) => void;
  setRpnSelectedAlternativeRaw: (v: number) => void;
  triggerFlashRpnResult: () => void;
}

function canAddSubtractUnits(op: RpnBinaryOp, y: CalcValue, x: CalcValue): boolean {
  if (op !== 'addUnit' && op !== 'subUnit') return true;
  return dimensionsEqual(y.dimensions, x.dimensions) || isDimensionless(y.dimensions) || isDimensionless(x.dimensions);
}

function doApplyRpnUnary(args: UseCalculatorRpnOpsArgs, op: RpnUnaryOp): void {
  const { rpnStack, calculatorPrecision, saveRpnStackForUndo, setLastX,
          setRpnStack, setRpnResultPrefixRaw, setRpnSelectedAlternativeRaw,
          triggerFlashRpnResult } = args;
  const x = rpnStack[3];
  if (!x) return;
  saveRpnStackForUndo();
  setLastX(x);
  const result = applyRpnUnaryLib(x, op, calculatorPrecision);
  if (!result) return;
  const newEntry: CalcValue = { ...result, prefix: 'none' };
  setRpnStack(prev => { const ns = [...prev]; ns[3] = newEntry; return ns; });
  setRpnResultPrefixRaw('none');
  setRpnSelectedAlternativeRaw(0);
  triggerFlashRpnResult();
}

function doApplyRpnBinary(args: UseCalculatorRpnOpsArgs, op: RpnBinaryOp): void {
  const { rpnStack, saveRpnStackForUndo, setLastX,
          setRpnStack, setRpnResultPrefixRaw, setRpnSelectedAlternativeRaw,
          triggerFlashRpnResult } = args;
  const y = rpnStack[2]; const x = rpnStack[3];
  if (!y || !x) return;
  saveRpnStackForUndo();
  setLastX(x);
  const result = applyRpnBinaryLib(y, x, op);
  if (!result) return;
  const newEntry: CalcValue = { ...result, prefix: 'none' };
  setRpnStack(prev => {
    const ns = [...prev];
    ns[3] = newEntry; ns[2] = prev[1]; ns[1] = prev[0]; ns[0] = null;
    return ns;
  });
  setRpnResultPrefixRaw('none');
  setRpnSelectedAlternativeRaw(0);
  triggerFlashRpnResult();
}

/**
 * RPN unary/binary op dispatch and add/subtract compatibility check.
 *
 * Council-02: the controller's only remaining responsibilities are
 * stack orchestration, undo capture, and adding the app-wide
 * CalcValue.prefix field that the lib intentionally omits. Undo
 * capture and lastX are set BEFORE the guard result is checked to
 * preserve exact prior behavior of the inline switch.
 */
export function useCalculatorRpnOps(args: UseCalculatorRpnOpsArgs) {
  const { rpnStack } = args;
  const applyRpnUnary = useCallback((op: RpnUnaryOp) => doApplyRpnUnary(args, op),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [args.rpnStack, args.calculatorPrecision, args.saveRpnStackForUndo, args.setLastX, args.setRpnStack, args.setRpnResultPrefixRaw, args.setRpnSelectedAlternativeRaw, args.triggerFlashRpnResult]);
  const canApplyRpnBinary = useCallback((op: RpnBinaryOp): boolean => {
    const y = rpnStack[2]; const x = rpnStack[3];
    if (!y || !x) return false;
    return canAddSubtractUnits(op, y, x);
  }, [rpnStack]);
  const applyRpnBinary = useCallback((op: RpnBinaryOp) => doApplyRpnBinary(args, op),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [args.rpnStack, args.saveRpnStackForUndo, args.setLastX, args.setRpnStack, args.setRpnResultPrefixRaw, args.setRpnSelectedAlternativeRaw, args.triggerFlashRpnResult]);
  return { applyRpnUnary, canApplyRpnBinary, applyRpnBinary };
}
