import { useEffect } from 'react';
import type { CalcValue } from '@/lib/units/calcValue';
import type { UnitCategory } from '@/lib/units/unitCategory';
import { canAddSubtract } from '@/lib/calculator/canAddSubtract';

type CalcOp = '+' | '-' | '*' | '/' | null;

interface UseCalculatorRecalcEffectArgs {
  calcValues: Array<CalcValue | null>;
  calcOp1: CalcOp;
  calcOp2: CalcOp;
  setCalcValues: (v: Array<CalcValue | null> | ((prev: Array<CalcValue | null>) => Array<CalcValue | null>)) => void;
  setCalcOp1: (v: CalcOp) => void;
  setCalcOp2: (v: CalcOp) => void;
  setResultCategory: (v: UnitCategory | null) => void;
  setResultUnit: (v: string | null) => void;
  recalculateSimple: () => void;
}

/**
 * Simple-mode recalc effect. Watches inputs (calcValues[0..2] +
 * calcOp1/calcOp2) and delegates to recalculateSimple when the
 * inputs are stable and compatible.
 *
 * Council-10: computeCalcResult lives at
 * client/src/lib/calculator/computeCalcResult.ts; the recalc itself
 * is a single atomic reducer action. calcValues[3] is intentionally
 * excluded from the dep array so the effect fires only on true
 * input changes.
 *
 * Preserves the four bail-out branches from the previous inline
 * effect: (a) infer missing operators as *, (b) drop incompatible
 * add/sub, (c) clear result field when v0 is null, (d) delegate to
 * recalculateSimple in the compatible case.
 */
export function useCalculatorRecalcEffect(args: UseCalculatorRecalcEffectArgs): void {
  const { calcValues, calcOp1, calcOp2, setCalcValues, setCalcOp1, setCalcOp2,
          setResultCategory, setResultUnit, recalculateSimple } = args;
  useEffect(() => {
    const v0 = calcValues[0]; const v1 = calcValues[1]; const v2 = calcValues[2];
    if (v0 && v1 && !calcOp1) { setCalcOp1('*'); return; }
    if (v1 && v2 && !calcOp2) { setCalcOp2('*'); return; }
    if (v0 && v1 && (calcOp1 === '+' || calcOp1 === '-') && !canAddSubtract(v0, v1)) { setCalcOp1(null); return; }
    if (v1 && v2 && (calcOp2 === '+' || calcOp2 === '-') && !canAddSubtract(v1, v2)) { setCalcOp2(null); return; }
    if (!v0) {
      setCalcValues(prev => { if (prev[3] === null) return prev; const nv = [...prev]; nv[3] = null; return nv; });
      setResultCategory(null); setResultUnit(null);
      return;
    }
    recalculateSimple();
  }, [calcValues[0], calcValues[1], calcValues[2], calcOp1, calcOp2]); // eslint-disable-line react-hooks/exhaustive-deps
}
