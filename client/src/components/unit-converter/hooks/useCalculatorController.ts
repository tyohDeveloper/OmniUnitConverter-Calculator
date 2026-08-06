import { useCallback } from 'react';
import type { DimensionalFormula } from '@/lib/units/dimensionalFormula';
import { generateSIRepresentations as generateSIRepresentationsLib } from '@/lib/si-representations/generateSIRepresentations';
import { getDimensionSignature } from '@/lib/units/getDimensionSignature';
import { PREFERRED_REPRESENTATIONS } from '@/lib/units/preferredRepresentations';
import type { SIRepresentation } from '@/lib/si-representations/siRepresentation';
import type { UseCalculatorControllerReturn } from './useCalculatorControllerReturn';

import { useConverterContext } from '../context/ConverterContext';
import { useCalculatorState } from './useCalculatorState';
import { useRpnStack } from './useRpnStack';
import { useCalculatorDisplayFormatters } from './useCalculatorDisplayFormatters';
import { useCalculatorClipboard } from './useCalculatorClipboard';
import { useCalculatorRpnOps } from './useCalculatorRpnOps';
import { useCalculatorRpnPaste } from './useCalculatorRpnPaste';
import { useCalculatorRpnStackOps } from './useCalculatorRpnStackOps';
import { useCalculatorRpnPull } from './useCalculatorRpnPull';
import { useCalculatorRpnSelection } from './useCalculatorRpnSelection';
import { useCalculatorClearOps } from './useCalculatorClearOps';
import { useCalculatorModeSwitch } from './useCalculatorModeSwitch';
import { useCalculatorRecalcEffect } from './useCalculatorRecalcEffect';

/*
 * §3.5/3.7 file-length exception: this file is in HOOK_FILE_LENGTH_
 * EXCLUDES because the residual length (~190 lines) is composition
 * plumbing, not logic. After the 10 domain hooks were extracted
 * (clear ops, mode switch, recalc effect, RPN stack ops, RPN pull,
 * RPN paste, RPN unary/binary, RPN result selection, display
 * formatters, clipboard), the controller body contains zero
 * function-length-cap-violating bodies. It is now:
 *
 *   - destructures of useCalculatorState + useRpnStack + flash
 *     triggers (~40 lines): pure interface adaptation for the sub-
 *     hooks that follow, no logic.
 *   - two one-line useCallbacks (generateSIRepresentations,
 *     saveRpnStackForUndo).
 *   - 10 sub-hook composition calls (~60 lines): each names the
 *     domain and passes state through.
 *   - a return statement enumerating the full UseCalculatorController
 *     Return contract (~24 lines).
 *
 * Splitting the controller further would either duplicate the
 * destructure pattern in every child hook (making the code MORE
 * verbose and coupling every child to the state hooks) or invent
 * an arbitrary internal composition layer with no domain meaning.
 * The residual length here is the cost of expressing the complete
 * contract; the aspirational 150-line cap is not appropriate for
 * this specific composition role.
 */
export function useCalculatorController(
  formatNumberWithSeparators: (num: number, precision: number) => string,
  t: (key: string) => string,
  activeTab: string,
  result: number | null,
  activeCategory: string,
  toUnit: string,
  toPrefix: string,
  directValue: string,
  buildDirectDimensions: () => Record<string, number>,
  parseNumberWithFormat: (s: string) => number,
): UseCalculatorControllerReturn {
  const { flash } = useConverterContext();
  const calcState = useCalculatorState();
  const rpnState = useRpnStack();

  const {
    calculatorMode, setCalculatorMode,
    shiftActive, setShiftActive,
    calculatorPrecision,
    calcValues, setCalcValues,
    calcOp1, setCalcOp1,
    calcOp2, setCalcOp2,
    resultPrefix, setResultPrefix,
    selectedAlternative, setSelectedAlternative,
    resultCategory, setResultCategory,
    resultUnit, setResultUnit,
    preserveSourceUnit, togglePreserveSourceUnit,
    setCalculatorPrecision,
    recalculateSimple,
  } = calcState;

  const {
    rpnStack, setRpnStack,
    previousRpnStack, setPreviousRpnStack,
    lastX, setLastX,
    rpnResultPrefix, setRpnResultPrefix: setRpnResultPrefixRaw,
    rpnSelectedAlternative, setRpnSelectedAlternative: setRpnSelectedAlternativeRaw,
    rpnXEditing, setRpnXEditing,
    rpnXEditValue, setRpnXEditValue,
  } = rpnState;

  const {
    triggerFlashCopyCalc, triggerFlashCalcField1, triggerFlashCalcField2,
    triggerFlashCalcField3, triggerFlashRpnField1, triggerFlashRpnField2,
    triggerFlashRpnField3, triggerFlashRpnResult,
  } = {
    triggerFlashCopyCalc: flash.copyCalc[1],
    triggerFlashCalcField1: flash.calcField1[1],
    triggerFlashCalcField2: flash.calcField2[1],
    triggerFlashCalcField3: flash.calcField3[1],
    triggerFlashRpnField1: flash.rpnField1[1],
    triggerFlashRpnField2: flash.rpnField2[1],
    triggerFlashRpnField3: flash.rpnField3[1],
    triggerFlashRpnResult: flash.rpnResult[1],
  };

  const generateSIRepresentations = useCallback((dimensions: DimensionalFormula, sourceCategory?: string): SIRepresentation[] => {
    return generateSIRepresentationsLib(dimensions, getDimensionSignature, PREFERRED_REPRESENTATIONS, sourceCategory);
  }, []);



  const saveRpnStackForUndo = useCallback(() => {
    setPreviousRpnStack([...rpnStack]);
  }, [rpnStack, setPreviousRpnStack]);

  // RPN result-field selection (setSelectedAlternative + setResult
  // Prefix). See useCalculatorRpnSelection.
  const { setRpnSelectedAlternative, setRpnResultPrefix } = useCalculatorRpnSelection({
    rpnSelectedAlternative,
    setRpnStack, setRpnResultPrefixRaw, setRpnSelectedAlternativeRaw,
    generateSIRepresentations,
  });

  // Simple-mode clear ops. See useCalculatorClearOps.
  const { clearCalculator, clearField1, clearField2, clearField3 } = useCalculatorClearOps({
    setCalcValues, setCalcOp1, setCalcOp2, setResultUnit, setResultCategory, setResultPrefix,
  });

  // Basic RPN stack manipulation ops. See useCalculatorRpnStackOps.
  const { clearRpnStack, pushToRpnStack, dropRpnStack, undoRpnStack, swapRpnXY, recallLastX, pushRpnConstant } = useCalculatorRpnStackOps({
    rpnStack, previousRpnStack, lastX,
    saveRpnStackForUndo, setRpnStack, setPreviousRpnStack,
    setRpnResultPrefixRaw, setRpnSelectedAlternativeRaw, triggerFlashRpnResult,
  });

  // Pull converter or direct result to RPN stack. See useCalculatorRpnPull.
  const { pullFromPane } = useCalculatorRpnPull({
    activeTab, result, activeCategory, toUnit, toPrefix, directValue,
    buildDirectDimensions, parseNumberWithFormat,
    saveRpnStackForUndo, setRpnStack,
    setRpnResultPrefixRaw, setRpnSelectedAlternativeRaw, triggerFlashRpnResult,
    generateSIRepresentations,
  });

  // RPN paste (clipboard read + parseUnitText + push + auto-select).
  // See useCalculatorRpnPaste.
  const { pasteToRpnStack } = useCalculatorRpnPaste({
    saveRpnStackForUndo, setRpnStack, setRpnResultPrefixRaw,
    setRpnSelectedAlternativeRaw, generateSIRepresentations,
  });

  // RPN unary/binary dispatch + canAdd/Sub check. See useCalculatorRpnOps.
  const { applyRpnUnary, canApplyRpnBinary, applyRpnBinary } = useCalculatorRpnOps({
    rpnStack, calculatorPrecision, saveRpnStackForUndo, setLastX,
    setRpnStack, setRpnResultPrefixRaw, setRpnSelectedAlternativeRaw, triggerFlashRpnResult,
  });

  // Display formatters. See useCalculatorDisplayFormatters.
  const { getRpnResultDisplay, getCalcResultDisplay } = useCalculatorDisplayFormatters({
    calcValues, rpnStack, selectedAlternative, rpnSelectedAlternative,
    resultPrefix, rpnResultPrefix, calculatorPrecision,
    generateSIRepresentations, formatNumberWithSeparators,
  });

  // Clipboard writers for calculator field and result values.
  // See useCalculatorClipboard.
  const { copyCalcResult, copyCalcField, copyRpnResult, copyRpnField } = useCalculatorClipboard({
    calcValues, rpnStack, calculatorPrecision, formatNumberWithSeparators,
    getCalcResultDisplay, getRpnResultDisplay,
    triggerFlashCopyCalc, triggerFlashCalcField1, triggerFlashCalcField2, triggerFlashCalcField3,
    triggerFlashRpnResult, triggerFlashRpnField1, triggerFlashRpnField2, triggerFlashRpnField3,
  });

  // Mode switch (simple <-> rpn). See useCalculatorModeSwitch.
  const { switchToRpn, switchToSimple } = useCalculatorModeSwitch({
    calcValues, rpnStack, saveRpnStackForUndo,
    setRpnStack, setRpnResultPrefixRaw, setRpnSelectedAlternativeRaw,
    setCalcValues, setCalcOp1, setCalcOp2, setResultPrefix, setSelectedAlternative,
    setCalculatorMode,
  });

  // Simple-mode recalc effect. See useCalculatorRecalcEffect.
  useCalculatorRecalcEffect({
    calcValues, calcOp1, calcOp2,
    setCalcValues, setCalcOp1, setCalcOp2,
    setResultCategory, setResultUnit, recalculateSimple,
  });

  return {
    calculatorMode, shiftActive, calculatorPrecision,
    calcValues, calcOp1, calcOp2,
    resultPrefix, selectedAlternative, preserveSourceUnit,
    rpnStack, previousRpnStack, rpnResultPrefix, rpnSelectedAlternative,
    rpnXEditing, rpnXEditValue,

    setShiftActive, setCalculatorPrecision,
    setCalcOp1, setCalcOp2,
    setResultPrefix, setSelectedAlternative, togglePreserveSourceUnit,
    setRpnStack, setRpnXEditing, setRpnXEditValue,
    setRpnResultPrefix, setRpnSelectedAlternative,
    setRpnResultPrefixRaw, setRpnSelectedAlternativeRaw,

    clearCalculator, clearField1, clearField2, clearField3, clearRpnStack,
    copyCalcField, copyCalcResult, copyRpnField, copyRpnResult,
    switchToRpn, switchToSimple,
    applyRpnUnary, applyRpnBinary, canApplyRpnBinary,
    pushToRpnStack, dropRpnStack, undoRpnStack, pullFromPane,
    pasteToRpnStack, swapRpnXY, recallLastX, pushRpnConstant,
    saveRpnStackForUndo,
    getRpnResultDisplay, getCalcResultDisplay,
    generateSIRepresentations,
    formatNumberWithSeparators, t,
  };
}
