import { useCallback } from 'react';
import type { CalcValue } from '@/lib/units/calcValue';
import type { UnitCategory } from '@/lib/units/unitCategory';
import type { DimensionalFormula } from '@/lib/units/dimensionalFormula';
import type { SIRepresentation } from '@/lib/si-representations/generateSIRepresentations';
import { buildPushFromConverter } from '@/lib/calculator/buildPushFromConverter';
import type { CopyResultOutcome } from './useConverterClipboard';

// EXCEPTION [architecture-standards §3.2]: type-and-function co-location.
export interface UseConverterPushToCalculatorInput {
  calculatorMode: 'simple' | 'rpn';
  calcValues: Array<CalcValue | null>;
  rpnStack: Array<CalcValue | null>;
  generateSIRepresentations: (dims: DimensionalFormula, sourceCategory?: string) => SIRepresentation[];
  setCalcValues: (v: Array<CalcValue | null>) => void;
  setRpnStack: (updater: (prev: Array<CalcValue | null>) => Array<CalcValue | null>) => void;
  setPreviousRpnStack: (v: Array<CalcValue | null>) => void;
  setRpnResultPrefix: (v: string) => void;
  setRpnSelectedAlternative: (v: number) => void;
  triggerFlashRpnResult: () => void;
  triggerFlashDirectCopy: () => void;
}

export interface UseConverterPushToCalculatorReturn {
  // Bridges a copy-result outcome (from useConverterClipboard) into
  // the calculator/RPN stack. In RPN mode also auto-selects the
  // matching display prefix + alternative so the freshly-pushed
  // value shows in the same unit the converter was displaying.
  pushCopyOutcome: (outcome: CopyResultOutcome, activeCategory: UnitCategory) => void;
  // The direct-pane's "copy to calculator" button. Different from
  // pushCopyOutcome because there is no unit metadata to preserve —
  // the direct pane has already chosen the exponent vector.
  pushDirectEntry: (value: number, dims: Record<string, number>) => void;
}

/**
 * Push-into-calculator surface for the converter.
 *
 * The converter has two ways to send a value into the calculator/RPN
 * stack: the "copy result" button (which also writes to the clipboard;
 * this hook handles only the push half) and the direct pane's "copy to
 * calculator" button. Both live here because the domain is push-to-
 * calculator, regardless of what UI element originated the request.
 *
 * The two flows differ in RPN mode:
 *   - pushCopyOutcome uses buildPushFromConverter (shift-up: new value
 *     at X, previous T discarded) AND auto-selects the display prefix
 *     and alternative to match the converter's chosen unit.
 *   - pushDirectEntry uses the same buildPushFromConverter shape but
 *     resets prefix/alt to defaults (there's no unit choice to preserve).
 */
export function useConverterPushToCalculator(
  i: UseConverterPushToCalculatorInput,
): UseConverterPushToCalculatorReturn {
  const pushCopyOutcome = useCallback((outcome: CopyResultOutcome, activeCategory: UnitCategory) => {
    const newEntry: CalcValue = outcome.newEntry;
    if (i.calculatorMode === 'rpn') {
      i.setPreviousRpnStack([...i.rpnStack]);
      i.setRpnStack(prev => buildPushFromConverter(prev, newEntry));
      const { autoPrefix, autoAlt } = pickAutoDisplay({
        siReps: i.generateSIRepresentations(newEntry.dimensions, activeCategory),
        outcome,
      });
      i.setRpnResultPrefix(autoPrefix);
      i.setRpnSelectedAlternative(autoAlt);
      i.triggerFlashRpnResult();
      return;
    }
    pushIntoSimpleCalculator(i, newEntry);
  }, [i]);

  const pushDirectEntry = useCallback((value: number, dims: Record<string, number>) => {
    i.triggerFlashDirectCopy();
    const newEntry: CalcValue = { value, dimensions: dims, prefix: 'none' };
    if (i.calculatorMode === 'rpn') {
      i.setPreviousRpnStack([...i.rpnStack]);
      i.setRpnStack(prev => buildPushFromConverter(prev, newEntry));
      i.setRpnResultPrefix('none');
      i.setRpnSelectedAlternative(0);
      i.triggerFlashRpnResult();
      return;
    }
    pushIntoSimpleCalculator(i, newEntry);
  }, [i]);

  return { pushCopyOutcome, pushDirectEntry };
}

// ─── Local helpers ───

// In simple mode, the new value goes into the first empty slot
// (index 0-2). If the calculator is full, drop the request.
function pushIntoSimpleCalculator(
  i: UseConverterPushToCalculatorInput,
  newEntry: CalcValue,
): void {
  const firstEmptyIndex = i.calcValues.findIndex((v, idx) => idx < 3 && v === null);
  if (firstEmptyIndex === -1) return;
  const next = [...i.calcValues];
  next[firstEmptyIndex] = newEntry;
  i.setCalcValues(next);
}

// Given the SI representations and the outcome's target-unit metadata,
// pick the display prefix + alternative that best matches the unit the
// converter was showing. Falls back to ('none', 0) when no match.
function pickAutoDisplay(a: {
  siReps: SIRepresentation[];
  outcome: CopyResultOutcome;
}): { autoPrefix: string; autoAlt: number } {
  const matchIdx = a.siReps.findIndex(rep => rep.displaySymbol === a.outcome.toUnitSymbol);
  if (matchIdx < 0) return { autoPrefix: 'none', autoAlt: 0 };
  const autoPrefix = (a.outcome.toUnitAllowsPrefixes && a.outcome.toPrefixId !== 'none')
    ? a.outcome.toPrefixId : 'none';
  return { autoPrefix, autoAlt: matchIdx };
}
