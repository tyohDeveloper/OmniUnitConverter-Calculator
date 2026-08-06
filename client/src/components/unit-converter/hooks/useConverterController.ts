import { useRef, useCallback, useState, useEffect } from 'react';
import { CONVERSION_DATA } from '@/lib/conversion-data';
import type { UnitCategory } from '@/lib/units/unitCategory';
import type { NumberFormat } from '@/lib/units/numberFormat';
import type { UseConverterControllerReturn } from './useConverterControllerReturn';
import { useConverterInputHandlers } from './useConverterInputHandlers';
import { useConverterDirectMode } from './useConverterDirectMode';
import { useConverterResultEffect } from './useConverterResultEffect';

import { useConverterContext } from '../context/ConverterContext';
import { useConverterState } from './useConverterState';
import { useCalculatorState } from './useCalculatorState';
import { useRpnStack } from './useRpnStack';
import { useLocaleHelpers } from './useLocaleHelpers';
import { useUiPrefsState } from './useUiPrefsState';
import { useConverterClipboard } from './useConverterClipboard';
import { useConverterPushToCalculator } from './useConverterPushToCalculator';
import * as converterActions from '../state/actions/converterActions';

// Council-03: local CATEGORY_DIMENSION_MAP replaced by the canonical
// CATEGORY_DIMENSIONS catalog in lib/units/categoryDimensions.ts.
// The duplicated CATEGORY_DIMENSION_MAP in conversion-data.ts was
// also retired in a later commit; parseUnitText's dimensions field
// now reads from the canonical map via getCategoryDimensionsForParse.

// File-length note: this controller is a wiring hub. Its length is
// dominated by coordination width, not logic:
//   - ~40 lines of state-slice destructuring (5 state hooks feed
//     20+ named getters/setters into local scope)
//   - ~13 lines of flash-trigger remapping (rename flash.x[1] ->
//     triggerFlashX; consumed by clipboard/push wiring below)
//   - ~20 lines of clipboard + push subhook wiring (long arg lists)
//   - ~27 lines of the return statement (this hook's public surface
//     has ~50 named fields; each returned by name)
//
// Five domain sub-hooks have already been extracted (Input, Direct,
// ResultEffect, plus pre-existing Clipboard, PushToCalculator).
// Further extraction would move coordination into a barrel-hook
// whose only job is to call other hooks and re-expose their fields
// — exactly the pattern §3.8 prohibits. The exception in lint-size
// captures this: the file is over cap by coordination width, not by
// missing decomposition.

export function useConverterController(): UseConverterControllerReturn {
  const { state, dispatch, flash, inputRef } = useConverterContext();
  const converterState = useConverterState();
  const calcState = useCalculatorState();
  const rpnState = useRpnStack();

  const {
    activeCategory, setActiveCategory,
    fromUnit, setFromUnit,
    toUnit, setToUnit,
    fromPrefix, setFromPrefix,
    toPrefix, setToPrefix,
    inputValue, setInputValue,
    result, setResult,
    symbolicResult, setSymbolicResult,
    precision, setPrecision,
    comparisonMode, setComparisonMode,
  } = converterState;

  const {
    calculatorMode,
    calcValues, setCalcValues,
  } = calcState;

  const {
    rpnStack,
    setRpnStack,
    setPreviousRpnStack,
    setRpnResultPrefix,
    setRpnSelectedAlternative,
  } = rpnState;

  // uiPrefs slice reader/writer surface. See useUiPrefsState.ts for
  // the pattern rationale (mirrors useConverterState).
  const {
    numberFormat, setNumberFormat,
    language, setLanguage,
    activeTab, setActiveTab,
    directValue, setDirectValue,
    directExponents, setDirectExponents,
    pendingPasteUnit, setPendingPasteUnit,
    converterPasteStatus, setConverterPasteStatus,
    customPasteStatus, setCustomPasteStatus,
  } = useUiPrefsState();

  // Only DOM/timer refs stay as useRef; the flow-significant paste
  // state moved to uiPrefs reducer state (see council-11).
  const converterPasteTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const customPasteTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const {
    triggerFlashCopyResult, triggerFlashFromBaseFactor, triggerFlashFromSIBase,
    triggerFlashToBaseFactor, triggerFlashToSIBase, triggerFlashConversionRatio,
    triggerFlashRpnResult, triggerFlashDirectCopy,
  } = {
    triggerFlashCopyResult: flash.copyResult[1],
    triggerFlashFromBaseFactor: flash.fromBaseFactor[1],
    triggerFlashFromSIBase: flash.fromSIBase[1],
    triggerFlashToBaseFactor: flash.toBaseFactor[1],
    triggerFlashToSIBase: flash.toSIBase[1],
    triggerFlashConversionRatio: flash.conversionRatio[1],
    triggerFlashRpnResult: flash.rpnResult[1],
    triggerFlashDirectCopy: flash.directCopy[1],
  };

  // Locale-dependent helpers (translators, formatters, parsers,
  // dimensional metadata) live in useLocaleHelpers. Everything there
  // depends only on numberFormat/language/precision — no state, no
  // dispatch, no refs.
  const {
    t, translateUnitName,
    getCategoryDimensions, generateSIRepresentations,
    parseNumberWithFormat,
    cleanNumber, formatNumberWithSeparators,
    formatForClipboard, formatResultValue, formatFactor,
    formatDMS, formatFtIn,
    parseDMS, parseFtIn,
  } = useLocaleHelpers(numberFormat, language, precision);



  // Direct-mode SI-freehand helpers. See useConverterDirectMode.
  const {
    buildDirectUnitSymbol, buildDirectDimensions, handleQuantityClick,
  } = useConverterDirectMode({
    directValue, directExponents, setActiveCategory, setInputValue, setActiveTab,
  });

  const refocusInput = useCallback(() => {
    setTimeout(() => { inputRef.current?.focus(); }, 100);
  }, [inputRef]);

  // Conversion result effect — see useConverterResultEffect.
  useConverterResultEffect({
    inputValue, fromUnit, toUnit, activeCategory, fromPrefix, toPrefix,
    numberFormat, language, parseNumberWithFormat, parseDMS, parseFtIn,
    setResult, setSymbolicResult,
  });

  useEffect(() => {
    return () => {
      if (converterPasteTimerRef.current) clearTimeout(converterPasteTimerRef.current);
      if (customPasteTimerRef.current) clearTimeout(customPasteTimerRef.current);
    };
  }, []);

  const swapUnits = useCallback(() => {
    dispatch({ domain: 'converter', ...converterActions.swapUnits() });
  }, [dispatch]);

  // Input-domain handlers (change, blur, keydown, reformat, placeholder)
  // live in useConverterInputHandlers; see that hook for domain rationale.
  const {
    getPlaceholder, reformatInputValue,
    handleInputChange, handleInputBlur, handleInputKeyDown,
  } = useConverterInputHandlers({
    inputValue, fromUnit, activeCategory, numberFormat,
    parseNumberWithFormat, setInputValue, setActiveCategory, setFromUnit,
  });

  // Clipboard read/write surface. See useConverterClipboard.ts.
  const clipboard = useConverterClipboard({
    activeCategory, fromUnit, toUnit, fromPrefix, toPrefix,
    result, symbolicResult, precision,
    formatDMS, formatFtIn, formatForClipboard,
    getCategoryDimensions,
    triggerFlashCopyResult, triggerFlashFromBaseFactor, triggerFlashFromSIBase,
    triggerFlashToBaseFactor, triggerFlashToSIBase, triggerFlashConversionRatio,
    setActiveCategory, setFromUnit, setFromPrefix, setInputValue,
    setActiveTab, setDirectValue, setDirectExponents,
    setPendingPasteUnit, setConverterPasteStatus, setCustomPasteStatus,
    converterPasteTimerRef, customPasteTimerRef,
  });

  // Push-into-calculator surface. See useConverterPushToCalculator.ts.
  const push = useConverterPushToCalculator({
    calculatorMode, calcValues, rpnStack,
    generateSIRepresentations,
    setCalcValues, setRpnStack, setPreviousRpnStack,
    setRpnResultPrefix, setRpnSelectedAlternative,
    triggerFlashRpnResult, triggerFlashDirectCopy,
  });

  // Copy-and-push composer: the clipboard hook writes the text and
  // returns a payload; the push hook applies that payload to the
  // calculator/RPN stack. This one-line composer is the only place
  // that bridges the two domains.
  const copyResult = useCallback((): void => {
    const outcome = clipboard.copyResult();
    if (outcome) push.pushCopyOutcome(outcome, activeCategory);
  }, [clipboard, push, activeCategory]);

  const copyFromBaseFactor = clipboard.copyFromBaseFactor;
  const copyFromSIBase = clipboard.copyFromSIBase;
  const copyToBaseFactor = clipboard.copyToBaseFactor;
  const copyToSIBase = clipboard.copyToSIBase;
  const copyConversionRatio = clipboard.copyConversionRatio;
  const handleConverterSmartPaste = clipboard.handleConverterSmartPaste;
  const handleConverterSmartPasteClick = clipboard.handleConverterSmartPasteClick;
  const handleCustomSmartPasteClick = clipboard.handleCustomSmartPasteClick;

  const handleDirectCopyAndPushToCalculator = push.pushDirectEntry;

  return {
    activeCategory, fromUnit, toUnit, fromPrefix, toPrefix,
    inputValue, result, symbolicResult, precision, comparisonMode,
    numberFormat, language, activeTab, directValue, directExponents,
    converterPasteStatus,
    customPasteStatus,

    setActiveCategory, setFromUnit, setToUnit, setFromPrefix, setToPrefix,
    setInputValue, setSymbolicResult, setPrecision, setComparisonMode,
    setNumberFormat, setLanguage, setActiveTab, setDirectValue, setDirectExponents,

    swapUnits, copyResult, copyFromBaseFactor, copyFromSIBase,
    copyToBaseFactor, copyToSIBase, copyConversionRatio,
    handleInputChange, handleInputKeyDown, handleInputBlur,
    handleConverterSmartPasteClick, handleCustomSmartPasteClick,
    handleDirectCopyAndPushToCalculator, handleQuantityClick,
    refocusInput, reformatInputValue,

    parseNumberWithFormat, t, translateUnitName, formatFactor, formatResultValue,
    formatDMS, formatFtIn, formatForClipboard, formatNumberWithSeparators,
    getPlaceholder, getCategoryDimensions, buildDirectUnitSymbol, buildDirectDimensions,
    generateSIRepresentations,

    inputRef,
    pendingPasteUnit,
    setPendingPasteUnit,
  };
}
