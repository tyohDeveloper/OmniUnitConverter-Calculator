import { useRef, useCallback, useState, useEffect } from 'react';
import {
  CONVERSION_DATA, UnitCategory, convert, PREFIXES, parseUnitText
} from '@/lib/conversion-data';
import {
  fixPrecision as fixPrecisionLib, toArabicNumerals, toJapaneseNumerals, toKoreanNumerals,
  toCJKMyriadString, toFixedBanker, NUMBER_FORMATS,
  parseNumberWithFormat as parseNumberWithSpecificFormat,
  formatNumberWithFormat as formatNumberWithSpecificFormat,
  formatFtIn as formatFtInLib, getTraditionalConfig, type NumberFormat
} from '@/lib/formatting';
import type { DimensionalFormula } from '@/lib/units/dimensionalFormula';
import { formatDimensions } from '@/lib/calculator/formatDimensions';
import { findCategoryByDimensions } from '@/lib/calculator/findCategoryByDimensions';
import type { CalcValue } from '@/lib/units/calcValue';
import { generateSIRepresentations as generateSIRepresentationsLib } from '@/lib/calculator/generateSIRepresentations';
import { getDimensionSignature } from '@/lib/units/getDimensionSignature';
import { PREFERRED_REPRESENTATIONS } from '@/lib/units/preferredRepresentations';
import type { SIRepresentation } from '@/lib/calculator/types';
import { normalizeMassUnit } from '@/lib/units/normalizeMassUnit';
import { dimensionsToExponents } from '@/lib/units/dimensionsToExponents';
import { PASTE_RESET_TIMEOUT_MS } from '../constants';
import { applyPrefixToKgUnit as applyPrefixToKgUnitLib } from '@/lib/units/applyPrefixToKgUnit';
import type { SupportedLanguage } from '@/lib/localization';
import { UNIT_NAME_TRANSLATIONS, UI_TRANSLATIONS } from '@/lib/localization';
import { getCategoryKeyForQuantityName } from '@/lib/units/categoryDimensions';

import { useConverterContext } from '../context/ConverterContext';
import { useConverterState } from './useConverterState';
import { useCalculatorState } from './useCalculatorState';
import { useRpnStack } from './useRpnStack';
import * as uiActions from '../state/actions/uiActions';
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
  pendingPasteUnitRef: React.MutableRefObject<{ fromUnit: string; prefixId: string } | null>;
}

const CATEGORY_GROUPS_ALL = [
  { categories: ['length', 'mass', 'time', 'current', 'temperature', 'amount', 'intensity'] },
  { categories: ['area', 'volume', 'speed', 'acceleration', 'force', 'pressure', 'energy', 'power', 'torque', 'flow', 'density', 'viscosity', 'kinematic_viscosity', 'surface_tension', 'frequency', 'angular_velocity', 'momentum', 'angular_momentum'] },
  { categories: ['thermal_conductivity', 'specific_heat', 'entropy', 'concentration'] },
  { categories: ['charge', 'potential', 'capacitance', 'resistance', 'conductance', 'inductance', 'magnetic_flux', 'magnetic_density', 'electric_field', 'magnetic_field_h'] },
  { categories: ['radioactivity', 'radiation_dose', 'equivalent_dose', 'radioactive_decay', 'cross_section', 'photon', 'catalytic', 'angle', 'solid_angle', 'sound_pressure', 'sound_intensity', 'acoustic_impedance'] },
  { categories: ['luminous_flux', 'illuminance', 'refractive_power'] },
  { categories: ['math', 'data', 'fuel', 'fuel_economy', 'rack_geometry', 'shipping', 'beer_wine_volume', 'lightbulb', 'paper_sizes', 'typography', 'cooking'] },
  { categories: ['archaic_length', 'archaic_mass', 'archaic_volume', 'archaic_area', 'archaic_energy', 'archaic_power'] },
];

const CATEGORY_DIMENSION_MAP: Record<string, DimensionalFormula> = {
  length: { length: 1 }, mass: { mass: 1 }, time: { time: 1 }, current: { current: 1 },
  temperature: { temperature: 1 }, amount: { amount: 1 }, intensity: { intensity: 1 },
  area: { length: 2 }, volume: { length: 3 }, speed: { length: 1, time: -1 },
  acceleration: { length: 1, time: -2 }, force: { mass: 1, length: 1, time: -2 },
  pressure: { mass: 1, length: -1, time: -2 }, energy: { mass: 1, length: 2, time: -2 },
  power: { mass: 1, length: 2, time: -3 }, frequency: { time: -1 },
  charge: { current: 1, time: 1 }, potential: { mass: 1, length: 2, time: -3, current: -1 },
  capacitance: { mass: -1, length: -2, time: 4, current: 2 },
  resistance: { mass: 1, length: 2, time: -3, current: -2 },
  conductance: { mass: -1, length: -2, time: 3, current: 2 },
  inductance: { mass: 1, length: 2, time: -2, current: -2 },
  magnetic_flux: { mass: 1, length: 2, time: -2, current: -1 },
  magnetic_density: { mass: 1, time: -2, current: -1 },
  radioactivity: { time: -1 }, radiation_dose: { length: 2, time: -2 },
  equivalent_dose: { length: 2, time: -2 }, catalytic: { amount: 1, time: -1 },
  angle: { angle: 1 }, solid_angle: { solid_angle: 1 },
  angular_velocity: { angle: 1, time: -1 }, momentum: { mass: 1, length: 1, time: -1 },
  angular_momentum: { mass: 1, length: 2, time: -1 },
  luminous_flux: { intensity: 1, solid_angle: 1 },
  illuminance: { intensity: 1, solid_angle: 1, length: -2 },
  luminous_exitance: { intensity: 1, solid_angle: 1, length: -2 },
  luminance: { intensity: 1, length: -2 }, torque: { mass: 1, length: 2, time: -2 },
  density: { mass: 1, length: -3 }, flow: { length: 3, time: -1 },
  viscosity: { mass: 1, length: -1, time: -1 }, surface_tension: { mass: 1, time: -2 },
  thermal_conductivity: { mass: 1, length: 1, time: -3, temperature: -1 },
  specific_heat: { length: 2, time: -2, temperature: -1 },
  entropy: { mass: 1, length: 2, time: -2, temperature: -1 },
  concentration: { amount: 1, length: -3 }, data: {}, rack_geometry: { length: 1 },
  shipping: { length: 1 }, beer_wine_volume: { length: 3 }, math: {},
  refractive_power: { length: -1 }, sound_pressure: { mass: 1, length: -1, time: -2 },
  fuel_economy: { length: -2 }, lightbulb: { intensity: 1, solid_angle: 1 },
  photon: { mass: 1, length: 2, time: -2 }, radioactive_decay: { time: -1 },
  cross_section: { length: 2 }, kinematic_viscosity: { length: 2, time: -1 },
  electric_field: { mass: 1, length: 1, time: -3, current: -1 },
  magnetic_field_h: { current: 1, length: -1 }, sound_intensity: { mass: 1, time: -3 },
  acoustic_impedance: { mass: 1, length: -2, time: -1 },
  fuel: { mass: 1, length: 2, time: -2 }, archaic_length: { length: 1 },
  archaic_mass: { mass: 1 }, archaic_volume: { length: 3 }, archaic_area: { length: 2 },
  archaic_energy: { mass: 1, length: 2, time: -2 }, archaic_power: { mass: 1, length: 2, time: -3 },
  typography: { length: 1 }, cooking: { length: 3 }, paper_sizes: { length: 2 }
};

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

  const numberFormat = state.uiPrefs.numberFormat;
  const language = state.uiPrefs.language as SupportedLanguage;
  const activeTab = state.uiPrefs.activeTab;
  const directValue = state.uiPrefs.directValue;
  const directExponents = state.uiPrefs.directExponents;

  const setNumberFormat = useCallback((v: NumberFormat) =>
    dispatch({ domain: 'uiPrefs', ...uiActions.setNumberFormat(v) }), [dispatch]);
  const setLanguage = useCallback((v: SupportedLanguage) =>
    dispatch({ domain: 'uiPrefs', ...uiActions.setLanguage(v) }), [dispatch]);
  const setActiveTab = useCallback((v: string) =>
    dispatch({ domain: 'uiPrefs', ...uiActions.setActiveTab(v) }), [dispatch]);
  const setDirectValue = useCallback((v: string) =>
    dispatch({ domain: 'uiPrefs', ...uiActions.setDirectValue(v) }), [dispatch]);
  const setDirectExponents = useCallback((v: Record<string, number>) =>
    dispatch({ domain: 'uiPrefs', ...uiActions.setDirectExponents(v) }), [dispatch]);

  const pendingPasteUnitRef = useRef<{ fromUnit: string; prefixId: string } | null>(null);
  const converterPasteTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const customPasteTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [converterPasteStatus, setConverterPasteStatus] = useState<'idle' | 'unrecognised' | 'unavailable'>('idle');
  const [customPasteStatus, setCustomPasteStatus] = useState<'idle' | 'unrecognised' | 'unavailable'>('idle');

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

  const t = useCallback((key: string): string => {
    const val = UI_TRANSLATIONS[language]?.[key] ?? UNIT_NAME_TRANSLATIONS[language]?.[key];
    if (val !== undefined) return val;
    return UI_TRANSLATIONS['en']?.[key] ?? UNIT_NAME_TRANSLATIONS['en']?.[key] ?? key;
  }, [language]);

  const translateUnitName = useCallback((unitName: string): string => t(unitName), [t]);

  const applyPrefixToKgUnit = applyPrefixToKgUnitLib;

  const getCategoryDimensions = useCallback((category: UnitCategory): { [key: string]: number } => {
    return (CATEGORY_DIMENSION_MAP[category] || {}) as { [key: string]: number };
  }, []);

  const generateSIRepresentations = useCallback((dimensions: DimensionalFormula, sourceCategory?: string): SIRepresentation[] => {
    return generateSIRepresentationsLib(dimensions, getDimensionSignature, PREFERRED_REPRESENTATIONS, sourceCategory);
  }, []);

  const parseNumberWithFormat = useCallback((str: string): number => {
    return parseNumberWithSpecificFormat(str, numberFormat);
  }, [numberFormat]);

  const cleanNumber = useCallback((num: number, p: number): string => {
    const fixed = fixPrecisionLib(num);
    let ep = p;
    const absN = Math.abs(fixed);
    if (absN > 0 && absN < 1) {
      ep = Math.min(Math.abs(Math.floor(Math.log10(absN))) + p, 12);
    }
    const fmtd = toFixedBanker(fixed, ep);
    return fmtd.replace(/(\.\d*?[1-9])0+$/, '$1').replace(/\.0+$/, '');
  }, []);

  const formatNumberWithSeparators = useCallback((num: number, precisionValue: number): string => {
    const format = numberFormat === 'traditional'
      ? getTraditionalConfig(language)
      : NUMBER_FORMATS[numberFormat];

    const fixed = fixPrecisionLib(num);

    if (fixed === 0) {
      if (format.traditionalScript) {
        const toNumerals = format.traditionalScript === 'ko' ? toKoreanNumerals : toJapaneseNumerals;
        return toNumerals('0');
      }
      return format.useArabicNumerals ? '٠' : '0';
    }
    const absNum = Math.abs(fixed);
    if (absNum < 1e-12 || absNum >= 1e15) {
      const expStr = fixed.toExponential(Math.min(precisionValue, 10));
      return format.useArabicNumerals ? toArabicNumerals(expStr) : expStr;
    }
    const cleaned = cleanNumber(fixed, precisionValue);
    const [integer, decimal] = cleaned.split('.');

    if (format.traditionalScript) {
      const script = format.traditionalScript;
      const cjkInteger = toCJKMyriadString(integer, script);
      if (decimal) {
        const toNumerals = script === 'ko' ? toKoreanNumerals : toJapaneseNumerals;
        return `${cjkInteger}${format.decimal}${toNumerals(decimal)}`;
      }
      return cjkInteger;
    }

    let formattedInteger = integer;
    if (format.thousands) {
      if (numberFormat === 'south-asian') {
        const reversed = integer.split('').reverse().join('');
        let result = '';
        for (let i = 0; i < reversed.length; i++) {
          if (i === 3 || (i > 3 && (i - 3) % 2 === 0)) result += format.thousands;
          result += reversed[i];
        }
        formattedInteger = result.split('').reverse().join('');
      } else if (format.myriad) {
        formattedInteger = integer.replace(/\B(?=(\d{4})+(?!\d))/g, format.thousands);
      } else {
        formattedInteger = integer.replace(/\B(?=(\d{3})+(?!\d))/g, format.thousands);
      }
    }
    let result = decimal ? `${formattedInteger}${format.decimal}${decimal}` : formattedInteger;
    if (format.useArabicNumerals) result = toArabicNumerals(result);
    return result;
  }, [numberFormat, language, cleanNumber]);

  const formatForClipboard = useCallback((num: number, precisionValue: number): string => {
    const format = numberFormat === 'traditional'
      ? getTraditionalConfig(language)
      : NUMBER_FORMATS[numberFormat];
    const fixed = fixPrecisionLib(num);
    if (fixed === 0) return format.useArabicNumerals ? '٠' : '0';
    const absNum = Math.abs(fixed);
    if (absNum < 1e-12 || absNum >= 1e15) {
      const expStr = fixed.toExponential(Math.min(precisionValue, 10));
      return format.useArabicNumerals ? toArabicNumerals(expStr) : expStr;
    }
    let effectivePrecision = precisionValue;
    if (absNum < 1 && absNum > 0) {
      const magnitude = Math.floor(Math.log10(absNum));
      effectivePrecision = Math.min(Math.abs(magnitude) + precisionValue, 12);
    }
    const formatted = toFixedBanker(fixed, effectivePrecision);
    const cleaned = formatted.replace(/(\.\d*?[1-9])0+$/, '$1').replace(/\.0+$/, '');
    return format.decimal !== '.' ? cleaned.replace('.', format.decimal) : cleaned;
  }, [numberFormat, language]);

  const formatResultValue = useCallback((num: number, precisionValue: number): string => {
    const format = numberFormat === 'traditional'
      ? getTraditionalConfig(language)
      : NUMBER_FORMATS[numberFormat];
    if (num === 0) {
      if (format.traditionalScript) {
        const toNumerals = format.traditionalScript === 'ko' ? toKoreanNumerals : toJapaneseNumerals;
        return toNumerals('0');
      }
      return format.useArabicNumerals ? '٠' : '0';
    }
    const absNum = Math.abs(num);
    if (absNum < 1e-12 || absNum >= 1e15) {
      const expStr = num.toExponential(Math.min(precisionValue, 10));
      return format.useArabicNumerals ? toArabicNumerals(expStr) : expStr;
    }
    let effectivePrecision = precisionValue;
    if (absNum < 1 && absNum > 0) {
      effectivePrecision = Math.min(Math.abs(Math.floor(Math.log10(absNum))) + precisionValue, 12);
    }
    return formatNumberWithSeparators(num, effectivePrecision);
  }, [numberFormat, language, formatNumberWithSeparators]);

  const formatFactor = useCallback((f: number): string => {
    const format = numberFormat === 'traditional'
      ? getTraditionalConfig(language)
      : NUMBER_FORMATS[numberFormat];
    if (f === 1) return format.useArabicNumerals ? '١' : '1';
    if (f >= 1e9 || f <= 1e-8) {
      const expStr = f.toExponential(7);
      return format.useArabicNumerals ? `×${toArabicNumerals(expStr)}` : `×${expStr}`;
    }
    const str = f.toPrecision(9);
    const n = parseFloat(str);
    return `×${formatNumberWithSeparators(n, 8)}`;
  }, [numberFormat, language, formatNumberWithSeparators]);

  const formatDMS = useCallback((decimal: number): string => {
    const d = Math.floor(Math.abs(decimal));
    const mFloat = (Math.abs(decimal) - d) * 60;
    const m = Math.floor(mFloat);
    const s = (mFloat - m) * 60;
    const sign = decimal < 0 ? '-' : '';
    const sFixed = toFixedBanker(s, precision);
    const [sInt, sDec] = sFixed.split('.');
    const sDisplay = `${sInt.padStart(2, '0')}${sDec ? '.' + sDec : ''}`;
    return `${sign}${d}:${m.toString().padStart(2, '0')}:${sDisplay}`;
  }, [precision]);

  const formatFtIn = useCallback((decimalFeet: number): string => {
    return formatFtInLib(decimalFeet, precision);
  }, [precision]);

  const getPlaceholder = useCallback((): string => {
    if (fromUnit === 'deg_dms') return 'dd:mm:ss';
    if (fromUnit === 'ft_in') return "ft'in\"";
    return '0';
  }, [fromUnit]);

  const buildDirectUnitSymbol = useCallback((): string => {
    const superscripts: Record<number, string> = {
      1: '¹', 2: '²', 3: '³', 4: '⁴', 5: '⁵',
      [-1]: '⁻¹', [-2]: '⁻²', [-3]: '⁻³', [-4]: '⁻⁴', [-5]: '⁻⁵'
    };
    const parts: string[] = [];
    const units = ['m', 'kg', 's', 'A', 'K', 'mol', 'cd', 'rad', 'sr'] as const;
    for (const unit of units) {
      const exp = directExponents[unit];
      if (exp !== 0) parts.push(exp === 1 ? unit : `${unit}${superscripts[exp] || ''}`);
    }
    return parts.join('·') || '';
  }, [directExponents]);

  const buildDirectDimensions = useCallback((): { [key: string]: number } => {
    const dims: { [key: string]: number } = {};
    const keyMap: Record<string, keyof DimensionalFormula> = {
      'm': 'length', 'kg': 'mass', 's': 'time', 'A': 'current', 'K': 'temperature',
      'mol': 'amount', 'cd': 'intensity', 'rad': 'angle', 'sr': 'solid_angle'
    };
    for (const [unit, dimKey] of Object.entries(keyMap)) {
      const exp = directExponents[unit];
      if (exp !== 0) dims[dimKey] = exp;
    }
    return dims;
  }, [directExponents]);

  const refocusInput = useCallback(() => {
    setTimeout(() => { inputRef.current?.focus(); }, 100);
  }, [inputRef]);

  const parseDMS = useCallback((dms: string): number => {
    if (!dms.includes(':')) return parseNumberWithFormat(dms);
    const parts = dms.split(':').map(p => parseNumberWithSpecificFormat(p, numberFormat));
    let val = 0;
    if (parts.length > 0) val += parts[0];
    if (parts.length > 1) val += (parts[0] >= 0 ? parts[1] : -parts[1]) / 60;
    if (parts.length > 2) val += (parts[0] >= 0 ? parts[2] : -parts[2]) / 3600;
    return val;
  }, [parseNumberWithFormat, numberFormat]);

  const parseFtIn = useCallback((ftIn: string): number => {
    const cleaned = ftIn.replace(/['"]/g, ':');
    if (!cleaned.includes(':')) return parseNumberWithFormat(cleaned);
    const parts = cleaned.split(':').map(p => parseNumberWithSpecificFormat(p, numberFormat));
    let val = 0;
    if (parts.length > 0) val += parts[0];
    if (parts.length > 1) val += (parts[0] >= 0 ? parts[1] : -parts[1]) / 12;
    return val;
  }, [parseNumberWithFormat, numberFormat]);

  useEffect(() => {
    if (!inputValue || !fromUnit || !toUnit) {
      setResult(null);
      return;
    }
    let val: number;
    if (fromUnit === 'deg_dms') {
      val = parseDMS(inputValue);
    } else if (fromUnit === 'ft_in') {
      val = parseFtIn(inputValue);
    } else {
      val = parseNumberWithFormat(inputValue);
    }
    if (isNaN(val)) {
      setResult(null);
      return;
    }
    const catData = CONVERSION_DATA.find(c => c.id === activeCategory)!;
    const fromUnitData = catData.units.find(u => u.id === fromUnit);
    const toUnitData = catData.units.find(u => u.id === toUnit);
    const fromPrefixData = PREFIXES.find(p => p.id === fromPrefix) || PREFIXES.find(p => p.id === 'none') || PREFIXES[0];
    const toPrefixData = PREFIXES.find(p => p.id === toPrefix) || PREFIXES.find(p => p.id === 'none') || PREFIXES[0];
    const isSpecialFrom = fromUnit === 'deg_dms' || fromUnit === 'ft_in';
    const isSpecialTo = toUnit === 'deg_dms' || toUnit === 'ft_in';
    const fromFactor = (fromUnitData?.allowPrefixes && fromPrefixData && !isSpecialFrom) ? fromPrefixData.factor : 1;
    const toFactor = (toUnitData?.allowPrefixes && toPrefixData && !isSpecialTo) ? toPrefixData.factor : 1;
    const res = convert(val, fromUnit, toUnit, activeCategory, fromFactor, toFactor);
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
    const format = NUMBER_FORMATS[numberFormat];
    const decimalSep = format.decimal === '.' ? '\\.' : format.decimal === "'" ? "\\'" : format.decimal;
    const thousandsSep = format.thousands ? (format.thousands === ' ' ? '\\s' : format.thousands === "'" ? "\\'" : format.thousands) : '';
    const isArabicFormat = format.useArabicNumerals ?? false;
    const digitPattern = isArabicFormat ? '0-9٠-٩' : '0-9';
    if (fromUnit === 'deg_dms' || fromUnit === 'ft_in') {
      const pattern = new RegExp(`[^${digitPattern}:\\-${decimalSep}${thousandsSep}'"']`, 'g');
      const filtered = value.replace(pattern, '');
      setInputValue(isArabicFormat ? toArabicNumerals(filtered) : filtered);
      return;
    }
    const pattern = new RegExp(`[^${digitPattern}\\-${decimalSep}${thousandsSep}eE\\+]`, 'g');
    const filtered = value.replace(pattern, '');
    setInputValue(isArabicFormat ? toArabicNumerals(filtered) : filtered);
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

  const copyResult = useCallback(() => {
    if (result !== null) {
      const categoryData = CONVERSION_DATA.find(c => c.id === activeCategory)!;
      const fromUnitData = categoryData.units.find(u => u.id === fromUnit);
      const toUnitData = categoryData.units.find(u => u.id === toUnit);
      const fromPrefixData = PREFIXES.find(p => p.id === fromPrefix) || PREFIXES.find(p => p.id === 'none') || PREFIXES[0];
      const toPrefixData = PREFIXES.find(p => p.id === toPrefix) || PREFIXES.find(p => p.id === 'none') || PREFIXES[0];

      if (!toUnitData || !fromUnitData) return;
      let textToCopy: string;
      const valueToCopy = result * toUnitData.factor * (toPrefixData?.factor || 1);
      if (toUnit === 'deg_dms') { textToCopy = formatDMS(result); }
      else if (toUnit === 'ft_in') { textToCopy = formatFtIn(result); }
      else if (activeCategory === 'lightbulb') { textToCopy = `${formatForClipboard(valueToCopy, precision)} lm`; }
      else {
        const unitSymbol = toUnitData?.symbol || '';
        const prefixSymbol = (toUnitData?.allowPrefixes && toPrefixData?.id !== 'none') ? toPrefixData.symbol : '';
        textToCopy = `${formatForClipboard(result, precision)} ${prefixSymbol}${unitSymbol}`;
      }
      navigator.clipboard.writeText(textToCopy);
      triggerFlashCopyResult();

      const siBaseValue = valueToCopy;
      const categoryDef = CONVERSION_DATA.find(c => c.id === activeCategory);
      const toPfxSymbol = (toUnitData.allowPrefixes && toPrefixData?.id !== 'none') ? (toPrefixData?.symbol || '') : '';
      const newEntry: CalcValue = {
        value: siBaseValue,
        dimensions: getCategoryDimensions(activeCategory),
        prefix: 'none',
        sourceCategory: activeCategory,
        siUnit: categoryDef?.baseSISymbol,
        originalUnit: toUnit !== 'deg_dms' && toUnit !== 'ft_in' ? toPfxSymbol + toUnitData.symbol : undefined,
        originalValue: toUnit !== 'deg_dms' && toUnit !== 'ft_in' ? result : undefined,
        unitType: toUnitData.unitType,
      };

      if (calculatorMode === 'rpn') {
        setPreviousRpnStack([...rpnStack]);
        setRpnStack(prev => {
          const ns = [...prev];
          ns[0] = prev[1]; ns[1] = prev[2]; ns[2] = prev[3]; ns[3] = newEntry;
          return ns;
        });
        let autoAlt = 0;
        let autoPrefix = 'none';
        const siReps = generateSIRepresentations(newEntry.dimensions, activeCategory);
        const matchIdx = siReps.findIndex(rep => rep.displaySymbol === toUnitData.symbol);
        if (matchIdx >= 0) {
          autoAlt = matchIdx;
          autoPrefix = (toUnitData.allowPrefixes && toPrefixData && toPrefixData.id !== 'none') ? toPrefixData.id : 'none';
        }
        setRpnResultPrefix(autoPrefix);
        setRpnSelectedAlternative(autoAlt);
        triggerFlashRpnResult();
      } else {
        const firstEmptyIndex = calcValues.findIndex((v, i) => i < 3 && v === null);
        if (firstEmptyIndex !== -1) {
          const newCalcValues = [...calcValues];
          newCalcValues[firstEmptyIndex] = newEntry;
          setCalcValues(newCalcValues);
        }
      }
    }
  }, [result, activeCategory, fromUnit, toUnit, fromPrefix, toPrefix, precision, calculatorMode, rpnStack, calcValues,
    formatDMS, formatFtIn, formatForClipboard, getCategoryDimensions, generateSIRepresentations,
    triggerFlashCopyResult, triggerFlashRpnResult, setPreviousRpnStack, setRpnStack, setRpnResultPrefix,
    setRpnSelectedAlternative, setCalcValues]);

  const copyFromBaseFactor = useCallback(() => {
    const categoryData = CONVERSION_DATA.find(c => c.id === activeCategory)!;
    const fromUnitData = categoryData.units.find(u => u.id === fromUnit);
    const fromPrefixData = PREFIXES.find(p => p.id === fromPrefix) || PREFIXES.find(p => p.id === 'none') || PREFIXES[0];
    if (fromUnitData) {
      navigator.clipboard.writeText((fromUnitData.factor * fromPrefixData.factor).toString());
      triggerFlashFromBaseFactor();
    }
  }, [activeCategory, fromUnit, fromPrefix, triggerFlashFromBaseFactor]);

  const copyFromSIBase = useCallback(() => {
    const siBaseUnits = formatDimensions(getCategoryDimensions(activeCategory));
    if (siBaseUnits) { navigator.clipboard.writeText(siBaseUnits); triggerFlashFromSIBase(); }
  }, [activeCategory, getCategoryDimensions, triggerFlashFromSIBase]);

  const copyToBaseFactor = useCallback(() => {
    const categoryData = CONVERSION_DATA.find(c => c.id === activeCategory)!;
    const toUnitData = categoryData.units.find(u => u.id === toUnit);
    const toPrefixData = PREFIXES.find(p => p.id === toPrefix) || PREFIXES.find(p => p.id === 'none') || PREFIXES[0];
    if (toUnitData) {
      navigator.clipboard.writeText((toUnitData.factor * toPrefixData.factor).toString());
      triggerFlashToBaseFactor();
    }
  }, [activeCategory, toUnit, toPrefix, triggerFlashToBaseFactor]);

  const copyToSIBase = useCallback(() => {
    const siBaseUnits = formatDimensions(getCategoryDimensions(activeCategory));
    if (siBaseUnits) { navigator.clipboard.writeText(siBaseUnits); triggerFlashToSIBase(); }
  }, [activeCategory, getCategoryDimensions, triggerFlashToSIBase]);

  const copyConversionRatio = useCallback(() => {
    const categoryData = CONVERSION_DATA.find(c => c.id === activeCategory)!;
    const fromUnitData = categoryData.units.find(u => u.id === fromUnit);
    const toUnitData = categoryData.units.find(u => u.id === toUnit);
    const fromPrefixData = PREFIXES.find(p => p.id === fromPrefix) || PREFIXES.find(p => p.id === 'none') || PREFIXES[0];
    const toPrefixData = PREFIXES.find(p => p.id === toPrefix) || PREFIXES.find(p => p.id === 'none') || PREFIXES[0];
    if (result !== null && fromUnitData && toUnitData) {
      const fromPrefixSymbol = (fromUnitData.allowPrefixes && fromPrefixData?.id !== 'none') ? fromPrefixData.symbol : '';
      const toPrefixSymbol = (toUnitData.allowPrefixes && toPrefixData?.id !== 'none') ? toPrefixData.symbol : '';
      const ratio = convert(1, fromUnit, toUnit, activeCategory,
        fromUnitData.allowPrefixes ? fromPrefixData.factor : 1,
        toUnitData.allowPrefixes ? toPrefixData.factor : 1
      );
      const ratioText = `1 ${fromPrefixSymbol}${fromUnitData.symbol} = ${formatForClipboard(ratio, precision)} ${toPrefixSymbol}${toUnitData.symbol}`;
      navigator.clipboard.writeText(ratioText);
      triggerFlashConversionRatio();
    }
  }, [result, activeCategory, fromUnit, toUnit, fromPrefix, toPrefix, precision, formatForClipboard, triggerFlashConversionRatio]);

  const handleConverterSmartPaste = useCallback(async (): Promise<'ok' | 'unrecognised' | 'unavailable'> => {
    try {
      const text = await navigator.clipboard.readText();
      if (!text) return 'unrecognised';
      const parsed = parseUnitText(text);
      if (parsed.categoryId && parsed.unitId) {
        if (parsed.categoryId === activeCategory) {
          setFromUnit(parsed.unitId);
          setFromPrefix(parsed.prefixId || 'none');
        } else {
          pendingPasteUnitRef.current = { fromUnit: parsed.unitId, prefixId: parsed.prefixId || 'none' };
          setActiveCategory(parsed.categoryId);
        }
        setInputValue(parsed.originalValue.toString());
        return 'ok';
      }
      const hasDimensions = Object.values(parsed.dimensions).some(v => v !== 0);
      if (hasDimensions) {
        const catId = findCategoryByDimensions(parsed.dimensions as DimensionalFormula);
        if (catId) {
          const catData = CONVERSION_DATA.find(c => c.id === catId);
          if (catData) {
            setActiveCategory(catId as UnitCategory);
            setFromUnit(catData.baseUnit);
            setFromPrefix('none');
            setInputValue(parsed.originalValue.toString());
            return 'ok';
          }
        }
      }
      return 'unrecognised';
    } catch {
      return 'unavailable';
    }
  }, [activeCategory, setActiveCategory, setFromUnit, setFromPrefix, setInputValue]);

  const handleConverterSmartPasteClick = useCallback(async () => {
    const status = await handleConverterSmartPaste();
    if (status !== 'ok') {
      setConverterPasteStatus(status);
      if (converterPasteTimerRef.current) clearTimeout(converterPasteTimerRef.current);
      converterPasteTimerRef.current = setTimeout(() => setConverterPasteStatus('idle'), PASTE_RESET_TIMEOUT_MS);
    } else {
      setConverterPasteStatus('idle');
    }
  }, [handleConverterSmartPaste]);

  const handleCustomSmartPasteClick = useCallback(async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (!text) {
        setCustomPasteStatus('unrecognised');
        if (customPasteTimerRef.current) clearTimeout(customPasteTimerRef.current);
        customPasteTimerRef.current = setTimeout(() => setCustomPasteStatus('idle'), PASTE_RESET_TIMEOUT_MS);
        return;
      }
      const parsed = parseUnitText(text);
      if (parsed.categoryId && parsed.unitId) {
        setActiveTab('converter');
        pendingPasteUnitRef.current = { fromUnit: parsed.unitId, prefixId: parsed.prefixId || 'none' };
        setActiveCategory(parsed.categoryId);
        setInputValue(parsed.originalValue.toString());
        setCustomPasteStatus('idle');
        return;
      }
      const hasDimensions = Object.values(parsed.dimensions).some(v => v !== 0);
      if (hasDimensions) {
        const catId = findCategoryByDimensions(parsed.dimensions as DimensionalFormula);
        if (catId) {
          const catData = CONVERSION_DATA.find(c => c.id === catId);
          if (catData) {
            setActiveTab('converter');
            setActiveCategory(catId as UnitCategory);
            setFromUnit(catData.baseUnit);
            setFromPrefix('none');
            setInputValue(parsed.originalValue.toString());
            setCustomPasteStatus('idle');
            return;
          }
        }
      }
      setDirectValue(parsed.value.toString());
      setDirectExponents(dimensionsToExponents(parsed.dimensions as DimensionalFormula));
      setCustomPasteStatus('idle');
    } catch {
      setCustomPasteStatus('unavailable');
      if (customPasteTimerRef.current) clearTimeout(customPasteTimerRef.current);
      customPasteTimerRef.current = setTimeout(() => setCustomPasteStatus('idle'), PASTE_RESET_TIMEOUT_MS);
    }
  }, [setActiveTab, setActiveCategory, setFromUnit, setFromPrefix, setInputValue, setDirectValue, setDirectExponents]);

  const handleDirectCopyAndPushToCalculator = useCallback((value: number, dims: Record<string, number>) => {
    triggerFlashDirectCopy();
    const newEntry = { value, dimensions: dims, prefix: 'none' as string };
    if (calculatorMode === 'rpn') {
      setPreviousRpnStack([...rpnStack]);
      setRpnStack(prev => {
        const ns = [...prev];
        ns[0] = prev[1]; ns[1] = prev[2]; ns[2] = prev[3]; ns[3] = newEntry;
        return ns;
      });
      setRpnResultPrefix('none');
      setRpnSelectedAlternative(0);
      triggerFlashRpnResult();
    } else {
      const firstEmptyIndex = calcValues.findIndex((v, i) => i < 3 && v === null);
      if (firstEmptyIndex !== -1) {
        const newCalcValues = [...calcValues];
        newCalcValues[firstEmptyIndex] = newEntry;
        setCalcValues(newCalcValues);
      }
    }
  }, [calculatorMode, rpnStack, calcValues, triggerFlashDirectCopy, triggerFlashRpnResult,
    setPreviousRpnStack, setRpnStack, setRpnResultPrefix, setRpnSelectedAlternative, setCalcValues]);

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
    pendingPasteUnitRef,
  };
}
