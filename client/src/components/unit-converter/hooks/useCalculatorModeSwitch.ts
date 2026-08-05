import { useCallback } from 'react';
import type { CalcValue } from '@/lib/units/calcValue';

type CalcOp = '+' | '-' | '*' | '/' | null;

interface UseCalculatorModeSwitchArgs {
  calcValues: Array<CalcValue | null>;
  rpnStack: Array<CalcValue | null>;
  saveRpnStackForUndo: () => void;
  setRpnStack: (v: Array<CalcValue | null>) => void;
  setRpnResultPrefixRaw: (v: string) => void;
  setRpnSelectedAlternativeRaw: (v: number) => void;
  setCalcValues: (v: Array<CalcValue | null>) => void;
  setCalcOp1: (v: CalcOp) => void;
  setCalcOp2: (v: CalcOp) => void;
  setResultPrefix: (v: string) => void;
  setSelectedAlternative: (v: number) => void;
  setCalculatorMode: (v: 'simple' | 'rpn') => void;
}

/**
 * Switch between simple and RPN modes, carrying the top-of-stack /
 * result value across the boundary:
 *
 *   simple \u2192 rpn: seed RPN X with calcValues[3] (simple result field),
 *                clear undo history, reset alt/prefix.
 *   rpn \u2192 simple: seed simple field 1 with rpnStack[3] (RPN X),
 *                clear ops + alt + prefix.
 */
export function useCalculatorModeSwitch(args: UseCalculatorModeSwitchArgs) {
  const a = args;
  const switchToRpn = useCallback(() => {
    a.saveRpnStackForUndo();
    a.setRpnStack([null, null, null, a.calcValues[3]]);
    a.setRpnResultPrefixRaw('none');
    a.setRpnSelectedAlternativeRaw(0);
    a.setCalculatorMode('rpn');
  }, [a.calcValues, a.saveRpnStackForUndo, a.setRpnStack, a.setRpnResultPrefixRaw, a.setRpnSelectedAlternativeRaw, a.setCalculatorMode]);
  const switchToSimple = useCallback(() => {
    a.setCalcValues([a.rpnStack[3], null, null, null]);
    a.setCalcOp1(null); a.setCalcOp2(null);
    a.setResultPrefix('none'); a.setSelectedAlternative(0);
    a.setCalculatorMode('simple');
  }, [a.rpnStack, a.setCalcValues, a.setCalcOp1, a.setCalcOp2, a.setResultPrefix, a.setSelectedAlternative, a.setCalculatorMode]);
  return { switchToRpn, switchToSimple };
}
