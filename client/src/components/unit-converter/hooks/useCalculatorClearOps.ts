import { useCallback } from 'react';
import type { CalcValue } from '@/lib/units/calcValue';
import type { UnitCategory } from '@/lib/units/unitCategory';

type CalcOp = '+' | '-' | '*' | '/' | null;

interface UseCalculatorClearOpsArgs {
  setCalcValues: (v: Array<CalcValue | null> | ((prev: Array<CalcValue | null>) => Array<CalcValue | null>)) => void;
  setCalcOp1: (v: CalcOp) => void;
  setCalcOp2: (v: CalcOp) => void;
  setResultUnit: (v: string | null) => void;
  setResultCategory: (v: UnitCategory | null) => void;
  setResultPrefix: (v: string) => void;
}

/**
 * Simple-mode clear operations: full-reset (clearCalculator) plus\n * three per-field clears. clearField1/2 also drop the corresponding\n * operator; clearField3 doesn't (there's no op3).
 */
export function useCalculatorClearOps(args: UseCalculatorClearOpsArgs) {
  const a = args;
  const clearCalculator = useCallback(() => {
    a.setCalcValues([null, null, null, null]);
    a.setCalcOp1(null); a.setCalcOp2(null);
    a.setResultUnit(null); a.setResultCategory(null); a.setResultPrefix('none');
  }, [a.setCalcValues, a.setCalcOp1, a.setCalcOp2, a.setResultUnit, a.setResultCategory, a.setResultPrefix]);
  const clearField1 = useCallback(() => {
    a.setCalcValues(prev => { const nv = [...prev]; nv[0] = null; return nv; });
    a.setCalcOp1(null);
  }, [a.setCalcValues, a.setCalcOp1]);
  const clearField2 = useCallback(() => {
    a.setCalcValues(prev => { const nv = [...prev]; nv[1] = null; return nv; });
    a.setCalcOp2(null);
  }, [a.setCalcValues, a.setCalcOp2]);
  const clearField3 = useCallback(() => {
    a.setCalcValues(prev => { const nv = [...prev]; nv[2] = null; return nv; });
  }, [a.setCalcValues]);
  return { clearCalculator, clearField1, clearField2, clearField3 };
}
