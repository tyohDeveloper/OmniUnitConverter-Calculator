import { useRef, useCallback, useState, useEffect } from 'react';
import { CONVERSION_DATA } from '@/lib/conversion-data';
import type { UnitCategory } from '@/lib/units/unitCategory';
import {
  toCJKMyriadString,
  formatNumberWithFormat as formatNumberWithSpecificFormat,
} from '@/lib/formatting';
import type { NumberFormat } from '@/lib/units/numberFormat';
import { parseNumberWithFormat as parseNumberWithSpecificFormat } from '@/lib/parsing/parseNumber';
import type { SupportedLanguage } from '@/lib/localization';
import type { DimensionalFormula } from '@/lib/units/dimensionalFormula';
import { buildDirectUnitSymbol as buildDirectUnitSymbolLib } from '@/lib/unit-symbols/buildDirectUnitSymbol';
import { buildDirectDimensions as buildDirectDimensionsLib } from '@/lib/unit-symbols/buildDirectDimensions';
import { computeConversion } from '@/lib/calculator/computeConversion';
import { sanitizeInput } from '@/lib/parsing/sanitizeInput';
import type { SIRepresentation } from '@/lib/si-representations/siRepresentation';
import { normalizeMassUnit } from '@/lib/units/normalizeMassUnit';
import { applyPrefixToKgUnit as applyPrefixToKgUnitLib } from '@/lib/units/applyPrefixToKgUnit';
import { getCategoryKeyForQuantityName } from '@/lib/units/categoryDimensions';

import { useConverterContext } from '../context/ConverterContext';
import { useConverterState } from './useConverterState';
import { useCalculatorState } from './useCalculatorState';
import { useRpnStack } from './useRpnStack';
import { useLocaleHelpers } from './useLocaleHelpers';
import { useUiPrefsState } from './useUiPrefsState';
import { useConverterClipboard } from './useConverterClipboard';
import { useConverterPushToCalculator } from './useConverterPushToCalculator';
import * as converterActions from '../state/actions/converterActions';

export interface UseConverterControllerReturn {
  activeCategory: UnitCategory;
  fromUnit: string;
  toUnit: string;
  fromPrefix: string;
  toPrefix: string;
  inputValue: string;
  result: number | null;
  precision: number;
  comparisonMode: boolean;
  numberFormat: NumberFormat;
  language: SupportedLanguage;
  activeTab: string;
  directValue: string;
  directExponents: Record<string, number>;
  converterPasteStatus: 'idle' | 'unrecognised' | 'unavailable';
  customPasteStatus: 'idle' | 'unrecognised' | 'unavailable';

  setActiveCategory: (v: UnitCategory) => void;
  setFromUnit: (v: string) => void;
  setToUnit: (v: string) => void;
  setFromPrefix: (v: string) => void;
  setToPrefix: (v: string) => void;
  setInputValue: (v: string) => void;
  setPrecision: (v: number) => void;
  setComparisonMode: (v: boolean) => void;
  setNumberFormat: (v: NumberFormat) => void;
  setLanguage: (v: SupportedLanguage) => void;
  setActiveTab: (v: string) => void;
  setDirectValue: (v: string) => void;
  setDirectExponents: (v: Record<string, number>) => void;

  swapUnits: () => void;
  copyResult: () => void;
  copyFromBaseFactor: () => void;
  copyFromSIBase: () => void;
  copyToBaseFactor: () => void;
  copyToSIBase: () => void;
  copyConversionRatio: () => void;
  handleInputChange: (v: string) => void;
  handleInputKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  handleInputBlur: () => void;
  handleConverterSmartPasteClick: () => Promise<void>;
  handleCustomSmartPasteClick: () => Promise<void>;
  handleDirectCopyAndPushToCalculator: (value: number, dims: Record<string, number>) => void;
  handleQuantityClick: (quantityName: string) => void;
  refocusInput: () => void;
  reformatInputValue: (oldFormat: NumberFormat, newFormat: NumberFormat) => void;

  normalizeMassUnit: (unit: string, prefix: string) => { unit: string; prefix: string };
  parseNumberWithFormat: (str: string) => number;
  t: (key: string) => string;
  translateUnitName: (name: string) => string;
  formatFactor: (f: number) => string;
  formatResultValue: (num: number, precision: number) => string;
  formatDMS: (decimal: number) => string;
  formatFtIn: (decimalFeet: number) => string;
  formatForClipboard: (num: number, precision: number) => string;
  formatNumberWithSeparators: (num: number, precision: number) => string;
  getPlaceholder: () => string;
  getCategoryDimensions: (category: UnitCategory) => { [key: string]: number };
  buildDirectUnitSymbol: () => string;
  buildDirectDimensions: () => Record<string, number>;
  generateSIRepresentations: (dims: DimensionalFormula, sourceCategory?: string) => SIRepresentation[];
  applyPrefixToKgUnit: typeof applyPrefixToKgUnitLib;

  inputRef: React.RefObject<HTMLInputElement | null>;
  // Council-11: replaces pendingPasteUnitRef. The value now lives in
  // uiPrefs reducer state; consumers dispatch setPendingPasteUnit to update.
  pendingPasteUnit: { fromUnit: string; prefixId: string } | null;
  setPendingPasteUnit: (v: { fromUnit: string; prefixId: string } | null) => void;
}

const CATEGORY_GROUPS_ALL = [
  { categories: ['length', 'mass', 'time', 'current', 'temperature', 'amount', 'intensity'] },
  { categories: ['area', 'volume', 'speed', 'acceleration', 'force', 'pressure', 'energy', 'power', 'torque', 'flow', 'density', 'viscosity', 'kinematic_viscosity', 'surface_tension', 'frequency', 'angular_velocity', 'momentum', 'angular_momentum'] },
  { categories: ['thermal_conductivity', 'specific_heat', 'entropy', 'concentration'] },
  { categories: ['charge', 'potential', 'capacitance', 'resistance', 'conductance', 'inductance', 'magnetic_flux', 'magnetic_density', 'electric_field', 'magnetic_field_h'] },
  { categories: ['radioactivity', 'radiation_dose', 'equivalent_dose', 'radiation_exposure', 'radioactive_decay', 'cross_section', 'photon', 'catalytic', 'angle', 'solid_angle', 'sound_pressure', 'sound_intensity', 'acoustic_impedance'] },
  { categories: ['luminous_flux', 'illuminance', 'luminance', 'refractive_power'] },
  { categories: ['data', 'fuel', 'fuel_economy', 'rack_geometry', 'shipping', 'beer_wine_volume', 'lightbulb', 'paper_sizes', 'typography', 'cooking', 'logarithmic'] },
  { categories: ['archaic_length', 'archaic_mass', 'archaic_volume', 'archaic_area', 'archaic_energy', 'archaic_power'] },
];

// Council-03: local CATEGORY_DIMENSION_MAP replaced by the canonical
// CATEGORY_DIMENSIONS catalog in lib/units/categoryDimensions.ts.
// The duplicated CATEGORY_DIMENSION_MAP in conversion-data.ts was
// also retired in a later commit; parseUnitText's dimensions field
// now reads from the canonical map via getCategoryDimensionsForParse.

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

  const applyPrefixToKgUnit = applyPrefixToKgUnitLib;

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

  const getPlaceholder = useCallback((): string => {
    if (fromUnit === 'deg_dms') return 'dd:mm:ss';
    if (fromUnit === 'ft_in') return "ft'in\"";
    return '0';
  }, [fromUnit]);

  // Council-08: delegate to the lib implementations. These are
  // byte-identical to the previous inline versions; keeping the useCallback
  // wrapper preserves referential stability for downstream memoized effects.
  const buildDirectUnitSymbol = useCallback(
    (): string => buildDirectUnitSymbolLib(directExponents),
    [directExponents],
  );

  const buildDirectDimensions = useCallback(
    (): { [key: string]: number } => buildDirectDimensionsLib(directExponents) as { [key: string]: number },
    [directExponents],
  );

  const refocusInput = useCallback(() => {
    setTimeout(() => { inputRef.current?.focus(); }, 100);
  }, [inputRef]);

  useEffect(() => {
    if (!inputValue || !fromUnit || !toUnit) { setResult(null); return; }
    // Council-08c: parse input, then delegate to lib/calculator/computeConversion.
    let val: number;
    if (fromUnit === 'deg_dms') val = parseDMS(inputValue);
    else if (fromUnit === 'ft_in') val = parseFtIn(inputValue);
    else val = parseNumberWithFormat(inputValue);
    if (isNaN(val)) { setResult(null); return; }
    const res = computeConversion({
      value: val, fromUnit, toUnit, activeCategory, fromPrefix, toPrefix,
    });
    setResult(res);
  }, [inputValue, fromUnit, toUnit, activeCategory, fromPrefix, toPrefix, numberFormat]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    return () => {
      if (converterPasteTimerRef.current) clearTimeout(converterPasteTimerRef.current);
      if (customPasteTimerRef.current) clearTimeout(customPasteTimerRef.current);
    };
  }, []);

  const swapUnits = useCallback(() => {
    dispatch({ domain: 'converter', ...converterActions.swapUnits() });
  }, [dispatch]);

  const reformatInputValue = useCallback((oldFormat: NumberFormat, newFormat: NumberFormat): void => {
    if (!inputValue || inputValue === '') return;
    if (fromUnit === 'deg_dms' || fromUnit === 'ft_in') return;
    const numericValue = parseNumberWithSpecificFormat(inputValue, oldFormat);
    if (!isNaN(numericValue) && isFinite(numericValue)) {
      setInputValue(formatNumberWithSpecificFormat(numericValue, newFormat));
    }
  }, [inputValue, fromUnit, setInputValue]);

  const handleInputChange = useCallback((value: string) => {
    // Council-08d: sanitization lives in lib/formatting/sanitizeInput.
    const isCompound = fromUnit === 'deg_dms' || fromUnit === 'ft_in';
    setInputValue(sanitizeInput({ value, format: numberFormat, isCompound }));
  }, [numberFormat, fromUnit, setInputValue]);

  const handleInputBlur = useCallback((): void => {
    if (!inputValue || inputValue === '') return;
    if (fromUnit === 'deg_dms' || fromUnit === 'ft_in') return;
    const numericValue = parseNumberWithFormat(inputValue);
    if (!isNaN(numericValue) && isFinite(numericValue)) {
      setInputValue(formatNumberWithSpecificFormat(numericValue, numberFormat));
    }
  }, [inputValue, fromUnit, parseNumberWithFormat, setInputValue, numberFormat]);

  const handleInputKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
      e.preventDefault();
      const allCategories = CATEGORY_GROUPS_ALL.flatMap(g => g.categories);
      const currentIndex = allCategories.indexOf(activeCategory);
      if (currentIndex === -1) return;
      const newIndex = e.key === 'ArrowUp'
        ? (currentIndex > 0 ? currentIndex - 1 : allCategories.length - 1)
        : (currentIndex < allCategories.length - 1 ? currentIndex + 1 : 0);
      setActiveCategory(allCategories[newIndex] as UnitCategory);
      setInputValue('1');
    }
  }, [activeCategory, setActiveCategory, setInputValue]);

  // Clipboard read/write surface. See useConverterClipboard.ts.
  const clipboard = useConverterClipboard({
    activeCategory, fromUnit, toUnit, fromPrefix, toPrefix, result, precision,
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

  const handleQuantityClick = useCallback((quantityName: string) => {
    const categoryKey = getCategoryKeyForQuantityName(quantityName);
    if (!categoryKey) return;
    setActiveCategory(categoryKey as UnitCategory);
    setInputValue(directValue);
    setActiveTab('converter');
  }, [directValue, setActiveCategory, setInputValue, setActiveTab]);

  return {
    activeCategory, fromUnit, toUnit, fromPrefix, toPrefix,
    inputValue, result, precision, comparisonMode,
    numberFormat, language, activeTab, directValue, directExponents,
    converterPasteStatus,
    customPasteStatus,

    setActiveCategory, setFromUnit, setToUnit, setFromPrefix, setToPrefix,
    setInputValue, setPrecision, setComparisonMode,
    setNumberFormat, setLanguage, setActiveTab, setDirectValue, setDirectExponents,

    swapUnits, copyResult, copyFromBaseFactor, copyFromSIBase,
    copyToBaseFactor, copyToSIBase, copyConversionRatio,
    handleInputChange, handleInputKeyDown, handleInputBlur,
    handleConverterSmartPasteClick, handleCustomSmartPasteClick,
    handleDirectCopyAndPushToCalculator, handleQuantityClick,
    refocusInput, reformatInputValue,

    normalizeMassUnit, parseNumberWithFormat, t, translateUnitName, formatFactor, formatResultValue,
    formatDMS, formatFtIn, formatForClipboard, formatNumberWithSeparators,
    getPlaceholder, getCategoryDimensions, buildDirectUnitSymbol, buildDirectDimensions,
    generateSIRepresentations, applyPrefixToKgUnit,

    inputRef,
    pendingPasteUnit,
    setPendingPasteUnit,
  };
}
