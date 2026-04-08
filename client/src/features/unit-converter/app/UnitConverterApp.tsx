import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CONVERSION_DATA, UnitCategory, convert, PREFIXES, ALL_PREFIXES, Prefix, findOptimalPrefix, parseUnitText, ParsedUnitResult, getFilteredSortedUnits } from '@/lib/conversion-data';
import { UNIT_NAME_TRANSLATIONS, UI_TRANSLATIONS, type SupportedLanguage, type Translation } from '@/lib/localization';
import {
  fixPrecision, toArabicNumerals, toLatinNumerals, roundToNearestEven,
  toFixedBanker, toTitleCase, NUMBER_FORMATS, type NumberFormat,
  parseNumberWithFormat as parseNumberWithSpecificFormat,
  formatNumberWithFormat as formatNumberWithSpecificFormat,
  formatFtIn as formatFtInLib
} from '@/lib/formatting';
import type { DimensionalFormula } from '@/lib/units/dimensionalFormula';
import type { CalcValue } from '@/lib/units/calcValue';
import { UnitType } from '@/lib/units/unitType';
import type { DerivedUnitInfo } from '@/lib/units/derivedUnitInfo';
import { SI_DERIVED_UNITS } from '@/lib/units/siDerivedUnitsCatalog';
import { NON_SI_UNITS_CATALOG } from '@/lib/units/nonSiUnitsCatalog';
import type { CategoryDimensionInfo } from '@/lib/units/categoryDimensions';
import { CATEGORY_DIMENSIONS, EXCLUDED_CROSS_DOMAIN_CATEGORIES, getCategoryKeyForQuantityName } from '@/lib/units/categoryDimensions';
import type { PreferredRepresentation } from '@/lib/units/preferredRepresentations';
import { PREFERRED_REPRESENTATIONS } from '@/lib/units/preferredRepresentations';
import { getDimensionSignature } from '@/lib/units/getDimensionSignature';
import { formatDimensions } from '@/lib/calculator/formatDimensions';
import { toSuperscript } from '@/lib/calculator/toSuperscript';
import { multiplyDimensions } from '@/lib/calculator/multiplyDimensions';
import { divideDimensions } from '@/lib/calculator/divideDimensions';
import { dimensionsEqual } from '@/lib/calculator/dimensionsEqual';
import { isDimensionless } from '@/lib/calculator/isDimensionless';
import { findCrossDomainMatches } from '@/lib/calculator/findCrossDomainMatches';
import { findCategoryByDimensions } from '@/lib/calculator/findCategoryByDimensions';
import { isValidSymbolRepresentation } from '@/lib/calculator/isValidSymbolRepresentation';
import { countUnits } from '@/lib/calculator/countUnits';
import { generateSIRepresentations as generateSIRepresentationsLib } from '@/lib/calculator/generateSIRepresentations';
import { isDimensionEmpty } from '@/lib/calculator/isDimensionEmpty';
import type { SIRepresentation } from '@/lib/calculator/types';
import { canAddSubtract } from '@/lib/calculator/canAddSubtract';
import { subtractDimensions } from '@/lib/calculator/subtractDimensions';
import { canFactorOut } from '@/lib/calculator/canFactorOut';
import { hasOnlyOriginalDimensions } from '@/lib/calculator/hasOnlyOriginalDimensions';
import { normalizeDimensions } from '@/lib/calculator/normalizeDimensions';
import { generateAlternativeRepresentations } from '@/lib/calculator/generateAlternativeRepresentations';
import type { AlternativeRepresentation } from '@/lib/calculator/types';
import { getDerivedUnit } from '@/lib/calculator/getDerivedUnit';
import { PREFIX_EXPONENTS, EXPONENT_TO_PREFIX } from '@/lib/units/prefixExponents';
import { GRAM_TO_KG_UNIT_PAIRS, KG_TO_GRAM_UNIT_PAIRS, normalizeMassUnit as normalizeMassUnitHelper } from '@/lib/units/normalizeMassUnit';
import { normalizeMassValue as normalizeMassValueLib } from '@/lib/units/normalizeMassValue';
import { normalizeMassDisplay as normalizeMassDisplayLib } from '@/lib/units/normalizeMassDisplay';
import { applyPrefixToKgUnit as applyPrefixToKgUnitLib } from '@/lib/units/applyPrefixToKgUnit';
import { siToDisplay as siToDisplayLib } from '@/lib/calculator/siToDisplay';
import { useRpnStack } from '@/components/unit-converter/hooks/useRpnStack';
import { useAllFlashFlags } from '@/components/unit-converter/hooks/useFlashFlag';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { ClipboardPaste } from 'lucide-react';
import { testId } from '@/lib/test-utils';
import HelpSection from '@/components/help-section';
import {
  FIELD_HEIGHT, CommonFieldWidth, OperatorBtnWidth, ClearBtnWidth,
  RpnBtnWidth, RpnBtnCount, CALC_CONTENT_HEIGHT, ISO_LANGUAGES
} from '@/components/unit-converter/constants';
import { ConverterPane } from '@/features/unit-converter/components/ConverterPane';
import { DirectPane } from '@/features/unit-converter/components/DirectPane';
import { CalculatorPane } from '@/features/unit-converter/components/CalculatorPane';

export default function UnitConverterApp() {
  const inputRef = useRef<HTMLInputElement>(null);
  // When a paste sets both category and a non-base unit simultaneously, the
  // activeCategory useEffect would otherwise reset fromUnit to sorted[0].
  // Store the intended unit/prefix here so the effect can honour the paste choice.
  const pendingPasteUnitRef = useRef<{ fromUnit: string; prefixId: string } | null>(null);
  const [activeCategory, setActiveCategory] = useState<UnitCategory>('length');
  const [fromUnit, setFromUnit] = useState<string>('');
  const [toUnit, setToUnit] = useState<string>('');
  const [fromPrefix, setFromPrefix] = useState<string>('none');
  const [toPrefix, setToPrefix] = useState<string>('none');
  const [inputValue, setInputValue] = useState<string>('1');
  const [result, setResult] = useState<number | null>(null);
  const [precision, setPrecision] = useState<number>(4);
  const [calculatorPrecision, setCalculatorPrecision] = useState<number>(4);
  const [comparisonMode, setComparisonMode] = useState<boolean>(false);

  const flash = useAllFlashFlags(300);
  const [flashCopyResult, triggerFlashCopyResult] = flash.copyResult;
  const [flashCopyCalc, triggerFlashCopyCalc] = flash.copyCalc;
  const [flashCalcField1, triggerFlashCalcField1] = flash.calcField1;
  const [flashCalcField2, triggerFlashCalcField2] = flash.calcField2;
  const [flashCalcField3, triggerFlashCalcField3] = flash.calcField3;
  const [flashFromBaseFactor, triggerFlashFromBaseFactor] = flash.fromBaseFactor;
  const [flashFromSIBase, triggerFlashFromSIBase] = flash.fromSIBase;
  const [flashToBaseFactor, triggerFlashToBaseFactor] = flash.toBaseFactor;
  const [flashToSIBase, triggerFlashToSIBase] = flash.toSIBase;
  const [flashConversionRatio, triggerFlashConversionRatio] = flash.conversionRatio;
  const [flashRpnField1, triggerFlashRpnField1] = flash.rpnField1;
  const [flashRpnField2, triggerFlashRpnField2] = flash.rpnField2;
  const [flashRpnField3, triggerFlashRpnField3] = flash.rpnField3;
  const [flashRpnResult, triggerFlashRpnResult] = flash.rpnResult;
  const [flashDirectCopy, triggerFlashDirectCopy] = flash.directCopy;

  const [calculatorMode, setCalculatorMode] = useState<'simple' | 'rpn'>('rpn');
  const [shiftActive, setShiftActive] = useState(false);
  const [preserveSourceUnit, setPreserveSourceUnit] = useState(true);

  const rpn = useRpnStack();
  const {
    rpnStack, setRpnStack, previousRpnStack, setPreviousRpnStack,
    lastX, setLastX, rpnResultPrefix, setRpnResultPrefix,
    rpnSelectedAlternative, setRpnSelectedAlternative,
    rpnXEditing, setRpnXEditing, rpnXEditValue, setRpnXEditValue,
    saveAndUpdateStack, pushValue: rpnPushValue, dropValue: rpnDropValue,
    swapXY: rpnSwapXY, clearStack: rpnClearStack, undoStack: rpnUndoStack,
    recallLastX: rpnRecallLastX
  } = rpn;

  const [activeTab, setActiveTab] = useState<string>('converter');

  const [converterPasteStatus, setConverterPasteStatus] = useState<'idle' | 'unrecognised' | 'unavailable'>('idle');
  const [customPasteStatus, setCustomPasteStatus] = useState<'idle' | 'unrecognised' | 'unavailable'>('idle');
  const converterPasteTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const customPasteTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [directValue, setDirectValue] = useState<string>('1');
  const [directExponents, setDirectExponents] = useState<Record<string, number>>({
    m: 0, kg: 0, s: 0, A: 0, K: 0, mol: 0, cd: 0, rad: 0, sr: 0
  });

  const DERIVED_UNITS_CATALOG = SI_DERIVED_UNITS;

  const [calcValues, setCalcValues] = useState<Array<CalcValue | null>>([null, null, null, null]);
  const [calcOp1, setCalcOp1] = useState<'+' | '-' | '*' | '/' | null>(null);
  const [calcOp2, setCalcOp2] = useState<'+' | '-' | '*' | '/' | null>(null);
  const [resultUnit, setResultUnit] = useState<string | null>(null);
  const [resultCategory, setResultCategory] = useState<UnitCategory | null>(null);
  const [resultPrefix, setResultPrefix] = useState<string>('none');
  const [selectedAlternative, setSelectedAlternative] = useState<number>(0);

  const [numberFormat, setNumberFormat] = useState<NumberFormat>('uk');
  const [language, setLanguage] = useState<SupportedLanguage>('en');

  const normalizeMassUnit = normalizeMassUnitHelper;
  const normalizeMassValue = normalizeMassValueLib;
  const applyPrefixToKgUnit = applyPrefixToKgUnitLib;

  const getMassUnitInfo = (unitId: string) => {
    const cat = CONVERSION_DATA.find(c => c.id === 'mass');
    const unit = cat?.units.find(u => u.id === unitId);
    return unit ? { factor: unit.factor, symbol: unit.symbol, allowPrefixes: unit.allowPrefixes || false } : undefined;
  };
  const normalizeMassDisplay = (valueInKg: number, currentPrefix: string, unitId: string | null) =>
    normalizeMassDisplayLib(valueInKg, currentPrefix, unitId, getMassUnitInfo);

  const getTranslationFromRecord = (trans: Translation, lang: SupportedLanguage): string | undefined => {
    if (lang === 'en-us') return trans['en-us'] ?? trans.en;
    if (lang === 'en') return trans.en;
    const langValue = trans[lang as keyof Translation];
    return langValue as string | undefined;
  };

  const t = (key: string): string => {
    if (UI_TRANSLATIONS[key]) {
      const result = getTranslationFromRecord(UI_TRANSLATIONS[key], language);
      if (result) return result;
      return UI_TRANSLATIONS[key].en || key;
    }
    if (UNIT_NAME_TRANSLATIONS[key]) {
      const result = getTranslationFromRecord(UNIT_NAME_TRANSLATIONS[key], language);
      if (result) return result;
      return UNIT_NAME_TRANSLATIONS[key].en || key;
    }
    return key;
  };

  const translateUnitName = (unitName: string): string => {
    const translated = t(unitName);
    if (translated !== unitName) return translated;
    if (UNIT_NAME_TRANSLATIONS[unitName]) {
      const trans = UNIT_NAME_TRANSLATIONS[unitName];
      const langKey = language as SupportedLanguage;
      if (langKey === 'en-us') return trans['en-us'] ?? trans.en ?? unitName;
      if (langKey === 'en') return trans.en || unitName;
      const langValue = trans[langKey as keyof typeof trans];
      if (langValue) return langValue as string;
      return trans.en || unitName;
    }
    return unitName;
  };

  React.useEffect(() => {
    if (language === 'ar') setNumberFormat('arabic');
  }, [language]);

  React.useEffect(() => {
    const isRtl = numberFormat === 'arabic';
    document.documentElement.setAttribute('dir', isRtl ? 'rtl' : 'ltr');
    document.documentElement.setAttribute('lang', language);
    return () => { document.documentElement.setAttribute('dir', 'ltr'); };
  }, [language, numberFormat]);

  const CATEGORY_GROUPS = [
    { name: "Base Quantities", categories: ['length', 'mass', 'time', 'current', 'temperature', 'amount', 'intensity'] },
    { name: "Mechanics", categories: ['area', 'volume', 'speed', 'acceleration', 'force', 'pressure', 'energy', 'power', 'torque', 'flow', 'density', 'viscosity', 'kinematic_viscosity', 'surface_tension', 'frequency', 'angular_velocity', 'momentum', 'angular_momentum'] },
    { name: "Thermodynamics & Chemistry", categories: ['thermal_conductivity', 'specific_heat', 'entropy', 'concentration'] },
    { name: "Electricity & Magnetism", categories: ['charge', 'potential', 'capacitance', 'resistance', 'conductance', 'inductance', 'magnetic_flux', 'magnetic_density', 'electric_field', 'magnetic_field_h'] },
    { name: "Radiation & Physics", categories: ['radioactivity', 'radiation_dose', 'equivalent_dose', 'radioactive_decay', 'cross_section', 'photon', 'catalytic', 'angle', 'solid_angle', 'sound_pressure', 'sound_intensity', 'acoustic_impedance'] },
    { name: "Human Response", categories: ['luminous_flux', 'illuminance', 'refractive_power'] },
    { name: "Other", categories: ['math', 'data', 'fuel', 'fuel_economy', 'rack_geometry', 'shipping', 'beer_wine_volume', 'lightbulb'] },
    { name: "Archaic & Regional", categories: ['archaic_length', 'archaic_mass', 'archaic_volume', 'archaic_area', 'archaic_energy', 'archaic_power'] }
  ];

  const categoryData = CONVERSION_DATA.find(c => c.id === activeCategory)!;

  useEffect(() => {
    const sorted = getFilteredSortedUnits(activeCategory);
    if (sorted.length > 0) {
      const pending = pendingPasteUnitRef.current;
      pendingPasteUnitRef.current = null;
      if (pending && sorted.some(u => u.id === pending.fromUnit)) {
        setFromUnit(pending.fromUnit);
        setToUnit(pending.fromUnit);
        setFromPrefix(pending.prefixId);
        setToPrefix('none');
      } else if (activeCategory === 'temperature') {
        setFromUnit('k'); setToUnit('k');
        setFromPrefix('none'); setToPrefix('none');
      } else if (activeCategory === 'capacitance') {
        setFromUnit('f'); setToUnit('f');
        setFromPrefix('none'); setToPrefix('none');
      } else if (activeCategory === 'math') {
        setFromUnit('num'); setToUnit('num');
        setFromPrefix('none'); setToPrefix('none');
      } else {
        setFromUnit(sorted[0].id); setToUnit(sorted[0].id);
        setFromPrefix('none'); setToPrefix('none');
      }
    }
  }, [activeCategory]);

  useEffect(() => { inputRef.current?.focus(); }, []);

  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const activeElement = document.activeElement as HTMLElement;
      const activeTagName = activeElement?.tagName?.toLowerCase();
      if (activeTagName === 'input' || activeTagName === 'textarea' || activeElement?.isContentEditable) return;
      const pastedText = e.clipboardData?.getData('text');
      if (!pastedText) return;
      const parsed = parseUnitText(pastedText);
      if (activeTab === 'converter') {
        if (parsed.categoryId && parsed.unitId) {
          if (parsed.categoryId === activeCategory) {
            setFromUnit(parsed.unitId);
            setFromPrefix(parsed.prefixId);
          } else {
            pendingPasteUnitRef.current = { fromUnit: parsed.unitId, prefixId: parsed.prefixId };
            setActiveCategory(parsed.categoryId);
          }
        }
        setInputValue(parsed.originalValue.toString());
      } else if (activeTab === 'custom') {
        setDirectValue(parsed.value.toString());
        const newExponents: Record<string, number> = { m: 0, kg: 0, s: 0, A: 0, K: 0, mol: 0, cd: 0, rad: 0, sr: 0 };
        if (parsed.dimensions.length) newExponents.m = parsed.dimensions.length;
        if (parsed.dimensions.mass) newExponents.kg = parsed.dimensions.mass;
        if (parsed.dimensions.time) newExponents.s = parsed.dimensions.time;
        if (parsed.dimensions.current) newExponents.A = parsed.dimensions.current;
        if (parsed.dimensions.temperature) newExponents.K = parsed.dimensions.temperature;
        if (parsed.dimensions.amount) newExponents.mol = parsed.dimensions.amount;
        if (parsed.dimensions.intensity) newExponents.cd = parsed.dimensions.intensity;
        if (parsed.dimensions.angle) newExponents.rad = parsed.dimensions.angle;
        if (parsed.dimensions.solid_angle) newExponents.sr = parsed.dimensions.solid_angle;
        const hasOutOfRange = Object.values(newExponents).some(exp => exp < -5 || exp > 5);
        if (hasOutOfRange) {
          setDirectExponents({ m: 0, kg: 0, s: 0, A: 0, K: 0, mol: 0, cd: 0, rad: 0, sr: 0 });
        } else {
          setDirectExponents(newExponents);
        }
      }
      e.preventDefault();
    };
    document.addEventListener('paste', handlePaste);
    return () => document.removeEventListener('paste', handlePaste);
  }, [activeTab]);

  const refocusInput = () => {
    setTimeout(() => { inputRef.current?.focus(); }, 100);
  };

  const fromUnitData = categoryData.units.find(u => u.id === fromUnit);
  const toUnitData = categoryData.units.find(u => u.id === toUnit);
  const fromPrefixData = PREFIXES.find(p => p.id === fromPrefix) || PREFIXES.find(p => p.id === 'none') || PREFIXES[0];
  const toPrefixData = PREFIXES.find(p => p.id === toPrefix) || PREFIXES.find(p => p.id === 'none') || PREFIXES[0];

  useEffect(() => {
    const handleKeyboardCopy = (e: KeyboardEvent) => {
      if (!((e.ctrlKey || e.metaKey) && e.key === 'c')) return;
      const activeElement = document.activeElement as HTMLElement;
      const activeTagName = activeElement?.tagName?.toLowerCase();
      const selection = window.getSelection();
      if (activeTagName === 'input' || activeTagName === 'textarea' || activeElement?.isContentEditable) return;
      if (selection && selection.toString().trim()) return;

      if (calculatorMode === 'rpn' && rpnStack[3]) {
        const val = rpnStack[3];
        const siReps = generateSIRepresentations(val.dimensions, val.sourceCategory);
        const currentSymbol = siReps[rpnSelectedAlternative]?.displaySymbol || formatDimensions(val.dimensions);
        const kgResult = applyPrefixToKgUnit(currentSymbol, rpnResultPrefix);
        const displayValue = val.value / kgResult.effectivePrefixFactor;
        const formattedValue = formatNumberWithSeparators(displayValue, calculatorPrecision);
        const cleanValue = formattedValue.replace(/,/g, '');
        const prefixData = PREFIXES.find(p => p.id === rpnResultPrefix);
        const prefixSymbol = kgResult.showPrefix && prefixData ? prefixData.symbol : '';
        const unitSymbol = prefixSymbol + kgResult.displaySymbol;
        const textToCopy = unitSymbol ? `${cleanValue} ${unitSymbol}` : cleanValue;
        navigator.clipboard.writeText(textToCopy);
        triggerFlashRpnResult();
        e.preventDefault();
        return;
      }

      if (calculatorMode === 'simple' && calcValues[3]) {
        const val = calcValues[3];
        const siReps = generateSIRepresentations(val.dimensions, val.sourceCategory);
        const currentSymbol = siReps[selectedAlternative]?.displaySymbol || formatDimensions(val.dimensions);
        const kgResult = applyPrefixToKgUnit(currentSymbol, resultPrefix);
        const displayValue = val.value / kgResult.effectivePrefixFactor;
        const formattedValue = formatNumberWithSeparators(displayValue, calculatorPrecision);
        const prefixData = PREFIXES.find(p => p.id === resultPrefix);
        const prefixSymbol = kgResult.showPrefix && prefixData ? prefixData.symbol : '';
        const unitSymbol = prefixSymbol + kgResult.displaySymbol;
        const textToCopy = unitSymbol ? `${formattedValue} ${unitSymbol}` : formattedValue;
        navigator.clipboard.writeText(textToCopy);
        triggerFlashCopyCalc();
        e.preventDefault();
        return;
      }

      if (activeTab === 'converter' && result !== null && toUnitData) {
        const unitSymbol = toUnitData?.symbol || '';
        const prefixSymbol = (toUnitData?.allowPrefixes && toPrefixData?.id !== 'none') ? toPrefixData.symbol : '';
        const textToCopy = `${formatForClipboard(result, precision)} ${prefixSymbol}${unitSymbol}`;
        navigator.clipboard.writeText(textToCopy);
        triggerFlashCopyResult();
        e.preventDefault();
        return;
      }

      if (activeTab === 'custom' && directValue) {
        navigator.clipboard.writeText(directValue);
        e.preventDefault();
        return;
      }
    };
    document.addEventListener('keydown', handleKeyboardCopy);
    return () => document.removeEventListener('keydown', handleKeyboardCopy);
  }, [calculatorMode, rpnStack, calcValues, rpnResultPrefix, rpnSelectedAlternative, resultPrefix, selectedAlternative, calculatorPrecision, activeTab, result, toUnitData, toPrefixData, precision, directValue]);

  const getCategoryDimensions = (category: UnitCategory): { [key: string]: number } => {
    const dimensionMap: Record<UnitCategory, DimensionalFormula> = {
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
      typography: { length: 1 }, cooking: { length: 3 }
    };
    return (dimensionMap[category] || {}) as { [key: string]: number };
  };

  const parseNumberWithFormat = (str: string): number => parseNumberWithSpecificFormat(str, numberFormat);

  const reformatInputValue = (oldFormat: NumberFormat, newFormat: NumberFormat): void => {
    if (!inputValue || inputValue === '') return;
    if (fromUnit === 'deg_dms' || fromUnit === 'ft_in') return;
    const numericValue = parseNumberWithSpecificFormat(inputValue, oldFormat);
    if (!isNaN(numericValue) && isFinite(numericValue)) {
      setInputValue(formatNumberWithSpecificFormat(numericValue, newFormat));
    }
  };

  const handleInputBlur = (): void => {
    if (!inputValue || inputValue === '') return;
    if (fromUnit === 'deg_dms' || fromUnit === 'ft_in') return;
    const numericValue = parseNumberWithFormat(inputValue);
    if (!isNaN(numericValue) && isFinite(numericValue)) {
      setInputValue(formatNumberWithSpecificFormat(numericValue, numberFormat));
    }
  };

  const formatDMS = (decimal: number): string => {
    const d = Math.floor(Math.abs(decimal));
    const mFloat = (Math.abs(decimal) - d) * 60;
    const m = Math.floor(mFloat);
    const s = (mFloat - m) * 60;
    const sign = decimal < 0 ? "-" : "";
    const sFixed = toFixedBanker(s, precision);
    const [sInt, sDec] = sFixed.split('.');
    const sDisplay = `${sInt.padStart(2, '0')}${sDec ? '.' + sDec : ''}`;
    return `${sign}${d}:${m.toString().padStart(2, '0')}:${sDisplay}`;
  };

  const parseDMS = (dms: string): number => {
    if (!dms.includes(':')) return parseNumberWithFormat(dms);
    const parts = dms.split(':').map(p => parseNumberWithFormat(p));
    let val = 0;
    if (parts.length > 0) val += parts[0];
    if (parts.length > 1) val += (parts[0] >= 0 ? parts[1] : -parts[1]) / 60;
    if (parts.length > 2) val += (parts[0] >= 0 ? parts[2] : -parts[2]) / 3600;
    return val;
  };

  const formatFtIn = (decimalFeet: number): string => formatFtInLib(decimalFeet, precision);

  const parseFtIn = (ftIn: string): number => {
    const cleaned = ftIn.replace(/['"]/g, ':');
    if (!cleaned.includes(':')) return parseNumberWithFormat(cleaned);
    const parts = cleaned.split(':').map(p => parseNumberWithFormat(p));
    let val = 0;
    if (parts.length > 0) val += parts[0];
    if (parts.length > 1) val += (parts[0] >= 0 ? parts[1] : -parts[1]) / 12;
    return val;
  };

  useEffect(() => {
    if (!inputValue || !fromUnit || !toUnit) { setResult(null); return; }
    let val: number;
    if (fromUnit === 'deg_dms') {
      val = parseDMS(inputValue);
      if (isNaN(val)) { setResult(null); return; }
    } else if (fromUnit === 'ft_in') {
      val = parseFtIn(inputValue);
      if (isNaN(val)) { setResult(null); return; }
    } else {
      val = parseNumberWithFormat(inputValue);
      if (isNaN(val)) { setResult(null); return; }
    }
    const isSpecialFrom = fromUnit === 'deg_dms' || fromUnit === 'ft_in';
    const isSpecialTo = toUnit === 'deg_dms' || toUnit === 'ft_in';
    const fromFactor = (fromUnitData?.allowPrefixes && fromPrefixData && !isSpecialFrom) ? fromPrefixData.factor : 1;
    const toFactor = (toUnitData?.allowPrefixes && toPrefixData && !isSpecialTo) ? toPrefixData.factor : 1;
    const res = convert(val, fromUnit, toUnit, activeCategory, fromFactor, toFactor);
    setResult(res);
  }, [inputValue, fromUnit, toUnit, activeCategory, fromPrefix, toPrefix, fromUnitData, toUnitData, precision]);

  const swapUnits = () => {
    const tempUnit = fromUnit; const tempPrefix = fromPrefix;
    setFromUnit(toUnit); setFromPrefix(toPrefix);
    setToUnit(tempUnit); setToPrefix(tempPrefix);
  };

  useEffect(() => {
    return () => {
      if (converterPasteTimerRef.current) clearTimeout(converterPasteTimerRef.current);
      if (customPasteTimerRef.current) clearTimeout(customPasteTimerRef.current);
    };
  }, []);

  const handleConverterSmartPaste = async (): Promise<'ok' | 'unrecognised' | 'unavailable'> => {
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
  };

  const handleConverterSmartPasteClick = useCallback(async () => {
    const status = await handleConverterSmartPaste();
    if (status !== 'ok') {
      setConverterPasteStatus(status);
      if (converterPasteTimerRef.current) clearTimeout(converterPasteTimerRef.current);
      converterPasteTimerRef.current = setTimeout(() => setConverterPasteStatus('idle'), 3000);
    } else {
      setConverterPasteStatus('idle');
    }
  }, []);

  const handleCustomSmartPasteClick = useCallback(async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (!text) {
        setCustomPasteStatus('unrecognised');
        if (customPasteTimerRef.current) clearTimeout(customPasteTimerRef.current);
        customPasteTimerRef.current = setTimeout(() => setCustomPasteStatus('idle'), 3000);
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
      const newExponents: Record<string, number> = {
        m: 0, kg: 0, s: 0, A: 0, K: 0, mol: 0, cd: 0, rad: 0, sr: 0
      };
      if (parsed.dimensions.length) newExponents.m = parsed.dimensions.length;
      if (parsed.dimensions.mass) newExponents.kg = parsed.dimensions.mass;
      if (parsed.dimensions.time) newExponents.s = parsed.dimensions.time;
      if (parsed.dimensions.current) newExponents.A = parsed.dimensions.current;
      if (parsed.dimensions.temperature) newExponents.K = parsed.dimensions.temperature;
      if (parsed.dimensions.amount) newExponents.mol = parsed.dimensions.amount;
      if (parsed.dimensions.intensity) newExponents.cd = parsed.dimensions.intensity;
      if (parsed.dimensions.angle) newExponents.rad = parsed.dimensions.angle;
      if (parsed.dimensions.solid_angle) newExponents.sr = parsed.dimensions.solid_angle;
      const hasOutOfRange = Object.values(newExponents).some(exp => exp < -5 || exp > 5);
      if (hasOutOfRange) {
        setDirectExponents({ m: 0, kg: 0, s: 0, A: 0, K: 0, mol: 0, cd: 0, rad: 0, sr: 0 });
      } else {
        setDirectExponents(newExponents);
      }
      setCustomPasteStatus('idle');
    } catch {
      setCustomPasteStatus('unavailable');
      if (customPasteTimerRef.current) clearTimeout(customPasteTimerRef.current);
      customPasteTimerRef.current = setTimeout(() => setCustomPasteStatus('idle'), 3000);
    }
  }, []);

  const formatForClipboard = (num: number, precisionValue: number): string => {
    const format = NUMBER_FORMATS[numberFormat];
    const fixed = fixPrecision(num);
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
  };

  const copyResult = () => {
    if (result !== null && toUnitData && fromUnitData) {
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
        saveRpnStackForUndo();
        setRpnStack(prev => {
          const newStack = [...prev];
          newStack[0] = prev[1]; newStack[1] = prev[2]; newStack[2] = prev[3]; newStack[3] = newEntry;
          return newStack;
        });
        // Auto-select the SI representation that matches the TO unit
        let autoAlt = 0;
        let autoPrefix = 'none';
        const siReps = generateSIRepresentations(newEntry.dimensions, activeCategory);
        const matchIdx = siReps.findIndex(rep => rep.displaySymbol === toUnitData.symbol);
        if (matchIdx >= 0) {
          autoAlt = matchIdx;
          autoPrefix = (toUnitData.allowPrefixes && toPrefixData && toPrefixData.id !== 'none') ? toPrefixData.id : 'none';
        }
        setRpnResultPrefix(autoPrefix); setRpnSelectedAlternative(autoAlt); triggerFlashRpnResult();
      } else {
        const firstEmptyIndex = calcValues.findIndex((v, i) => i < 3 && v === null);
        if (firstEmptyIndex !== -1) {
          const newCalcValues = [...calcValues];
          newCalcValues[firstEmptyIndex] = newEntry;
          setCalcValues(newCalcValues);
        }
      }
    }
  };

  const copyFromBaseFactor = () => {
    if (fromUnitData) {
      navigator.clipboard.writeText((fromUnitData.factor * fromPrefixData.factor).toString());
      triggerFlashFromBaseFactor();
    }
  };

  const copyFromSIBase = () => {
    const siBaseUnits = formatDimensions(getCategoryDimensions(activeCategory));
    if (siBaseUnits) { navigator.clipboard.writeText(siBaseUnits); triggerFlashFromSIBase(); }
  };

  const copyToBaseFactor = () => {
    if (toUnitData) {
      navigator.clipboard.writeText((toUnitData.factor * toPrefixData.factor).toString());
      triggerFlashToBaseFactor();
    }
  };

  const copyToSIBase = () => {
    const siBaseUnits = formatDimensions(getCategoryDimensions(activeCategory));
    if (siBaseUnits) { navigator.clipboard.writeText(siBaseUnits); triggerFlashToSIBase(); }
  };

  const copyConversionRatio = () => {
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
  };

  const generateSIRepresentations = (dimensions: DimensionalFormula, sourceCategory?: string): SIRepresentation[] => {
    return generateSIRepresentationsLib(dimensions, getDimensionSignature, PREFERRED_REPRESENTATIONS, sourceCategory);
  };

  useEffect(() => {
    if (calcValues[0] && calcValues[1] && !calcOp1) setCalcOp1('*');
  }, [calcValues[0], calcValues[1], calcOp1]);

  useEffect(() => {
    if (calcValues[1] && calcValues[2] && !calcOp2) setCalcOp2('*');
  }, [calcValues[1], calcValues[2], calcOp2]);

  useEffect(() => {
    if (calcValues[0] && calcValues[1] && (calcOp1 === '+' || calcOp1 === '-') && !canAddSubtract(calcValues[0], calcValues[1])) setCalcOp1(null);
  }, [calcValues[0], calcValues[1], calcOp1]);

  useEffect(() => {
    if (calcValues[1] && calcValues[2] && (calcOp2 === '+' || calcOp2 === '-') && !canAddSubtract(calcValues[1], calcValues[2])) setCalcOp2(null);
  }, [calcValues[1], calcValues[2], calcOp2]);

  useEffect(() => {
    if (calcValues[0]) {
      let resultValue = calcValues[0].value;
      let resultDimensions = { ...calcValues[0].dimensions };
      if (calcValues[1] && calcOp1) {
        if (calcOp1 === '*') { resultValue *= calcValues[1].value; resultDimensions = multiplyDimensions(resultDimensions, calcValues[1].dimensions); }
        else if (calcOp1 === '/') { resultValue /= calcValues[1].value; resultDimensions = divideDimensions(resultDimensions, calcValues[1].dimensions); }
        else if (calcOp1 === '+' && canAddSubtract(calcValues[0], calcValues[1])) {
          resultValue += calcValues[1].value;
          if (isDimensionless(resultDimensions) && !isDimensionless(calcValues[1].dimensions)) resultDimensions = { ...calcValues[1].dimensions };
        } else if (calcOp1 === '-' && canAddSubtract(calcValues[0], calcValues[1])) {
          resultValue -= calcValues[1].value;
          if (isDimensionless(resultDimensions) && !isDimensionless(calcValues[1].dimensions)) resultDimensions = { ...calcValues[1].dimensions };
        }
        if (calcValues[2] && calcOp2) {
          if (calcOp2 === '*') { resultValue *= calcValues[2].value; resultDimensions = multiplyDimensions(resultDimensions, calcValues[2].dimensions); }
          else if (calcOp2 === '/') { resultValue /= calcValues[2].value; resultDimensions = divideDimensions(resultDimensions, calcValues[2].dimensions); }
          else if (calcOp2 === '+' && canAddSubtract(calcValues[1], calcValues[2])) {
            resultValue += calcValues[2].value;
            if (isDimensionless(resultDimensions) && !isDimensionless(calcValues[2].dimensions)) resultDimensions = { ...calcValues[2].dimensions };
          } else if (calcOp2 === '-' && canAddSubtract(calcValues[1], calcValues[2])) {
            resultValue -= calcValues[2].value;
            if (isDimensionless(resultDimensions) && !isDimensionless(calcValues[2].dimensions)) resultDimensions = { ...calcValues[2].dimensions };
          }
        }
      }
      setCalcValues(prev => { const nv = [...prev]; nv[3] = { value: resultValue, dimensions: resultDimensions, prefix: 'none' }; return nv; });
      setResultPrefix('none'); setSelectedAlternative(0); setResultCategory(null); setResultUnit(null);
    } else if (calcValues[3] !== null) {
      setCalcValues(prev => { const nv = [...prev]; nv[3] = null; return nv; });
      setResultUnit(null); setResultCategory(null);
    }
  }, [calcValues[0], calcValues[1], calcValues[2], calcOp1, calcOp2]);

  useEffect(() => {
    if (resultCategory && calcValues[3]) setResultPrefix('none');
  }, [resultUnit]);

  const clearCalculator = () => { setCalcValues([null, null, null, null]); setCalcOp1(null); setCalcOp2(null); setResultUnit(null); setResultCategory(null); setResultPrefix('none'); };
  const clearField1 = () => { setCalcValues(prev => { const nv = [...prev]; nv[0] = null; return nv; }); setCalcOp1(null); };
  const clearField2 = () => { setCalcValues(prev => { const nv = [...prev]; nv[1] = null; return nv; }); setCalcOp2(null); };
  const clearField3 = () => { setCalcValues(prev => { const nv = [...prev]; nv[2] = null; return nv; }); };

  const saveRpnStackForUndo = () => { setPreviousRpnStack([...rpnStack]); };
  const undoRpnStack = () => { const temp = [...rpnStack]; setRpnStack([...previousRpnStack]); setPreviousRpnStack(temp); };

  const clearRpnStack = () => { saveRpnStackForUndo(); setRpnStack([null, null, null, null]); setRpnResultPrefix('none'); setRpnSelectedAlternative(0); };

  const pushToRpnStack = () => {
    if (!rpnStack[3]) return;
    saveRpnStackForUndo();
    setRpnStack(prev => { const ns = [...prev]; ns[0] = prev[1]; ns[1] = prev[2]; ns[2] = prev[3]; return ns; });
  };

  const dropRpnStack = () => {
    saveRpnStackForUndo();
    setRpnStack(prev => { const ns = [...prev]; ns[1] = prev[0]; ns[2] = prev[1]; ns[3] = prev[2]; return ns; });
  };

  const swapRpnXY = () => {
    if (!rpnStack[3] || !rpnStack[2]) return;
    saveRpnStackForUndo();
    setRpnStack(prev => { const ns = [...prev]; ns[3] = prev[2]; ns[2] = prev[3]; return ns; });
  };

  const recallLastX = () => {
    if (!lastX) return;
    saveRpnStackForUndo();
    setRpnStack(prev => { const ns = [...prev]; ns[0] = prev[1]; ns[1] = prev[2]; ns[2] = prev[3]; ns[3] = lastX; return ns; });
  };

  const pullFromPane = () => {
    let newEntry: CalcValue | null = null;
    if (activeTab === 'converter') {
      if (result !== null && toUnitData) {
        const siValue = result * toUnitData.factor * (toPrefixData?.factor || 1);
        const categoryDef = CONVERSION_DATA.find(c => c.id === activeCategory);
        const toPfxSymbol = (toUnitData.allowPrefixes && toPrefixData && toPrefixData.id !== 'none') ? toPrefixData.symbol : '';
        newEntry = {
          value: siValue,
          dimensions: getCategoryDimensions(activeCategory),
          prefix: 'none',
          sourceCategory: activeCategory,
          siUnit: categoryDef?.baseSISymbol,
          originalUnit: toPfxSymbol + toUnitData.symbol,
          originalValue: result,
          unitType: toUnitData.unitType,
        };
      }
    } else if (activeTab === 'custom') {
      const numValue = parseNumberWithFormat(directValue);
      if (!isNaN(numValue) && directValue) {
        newEntry = { value: numValue, dimensions: buildDirectDimensions(), prefix: 'none' };
      }
    }
    if (!newEntry) return;
    saveRpnStackForUndo();
    setRpnStack(prev => { const ns = [...prev]; ns[0] = prev[1]; ns[1] = prev[2]; ns[2] = prev[3]; ns[3] = newEntry; return ns; });
    let autoAlt = 0;
    let autoPrefix = 'none';
    if (activeTab === 'converter' && toUnitData && newEntry) {
      const siReps = generateSIRepresentations(newEntry.dimensions, activeCategory);
      const matchIdx = siReps.findIndex(rep => rep.displaySymbol === toUnitData.symbol);
      if (matchIdx >= 0) {
        autoAlt = matchIdx;
        autoPrefix = (toUnitData.allowPrefixes && toPrefixData && toPrefixData.id !== 'none') ? toPrefixData.id : 'none';
      }
    }
    setRpnResultPrefix(autoPrefix);
    setRpnSelectedAlternative(autoAlt);
    triggerFlashRpnResult();
  };

  const pasteToRpnStack = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (!text) return;
      const parsed = parseUnitText(text);
      const dims: DimensionalFormula = {};
      const dimKeys = ['length', 'mass', 'time', 'current', 'temperature', 'amount', 'intensity', 'angle', 'solid_angle'] as const;
      for (const key of dimKeys) {
        if (parsed.dimensions[key]) dims[key] = parsed.dimensions[key];
      }
      let sourceCategory: string | undefined;
      let siUnit: string | undefined;
      let originalUnit: string | undefined;
      let unitType: UnitType | undefined;
      if (parsed.categoryId) {
        sourceCategory = parsed.categoryId;
        const categoryDef = CONVERSION_DATA.find(c => c.id === parsed.categoryId);
        siUnit = categoryDef?.baseSISymbol;
        if (parsed.unitId && categoryDef) {
          const unitDef = categoryDef.units.find(u => u.id === parsed.unitId);
          if (unitDef) {
            const prefixDef = PREFIXES.find(p => p.id === parsed.prefixId);
            const prefixSymbol = (unitDef.allowPrefixes && prefixDef && prefixDef.id !== 'none') ? prefixDef.symbol : '';
            originalUnit = prefixSymbol + unitDef.symbol;
            unitType = unitDef.unitType;
          }
        }
      }
      const newEntry: CalcValue = {
        value: parsed.value,
        dimensions: dims,
        prefix: parsed.prefixId || 'none',
        sourceCategory,
        siUnit,
        originalUnit,
        originalValue: parsed.originalValue,
        unitType,
      };
      saveRpnStackForUndo();
      setRpnStack(prev => { const ns = [...prev]; ns[0] = prev[1]; ns[1] = prev[2]; ns[2] = prev[3]; ns[3] = newEntry; return ns; });
      let autoAlt = 0;
      let autoPrefix = 'none';
      if (parsed.categoryId && parsed.unitId) {
        const categoryDef = CONVERSION_DATA.find(c => c.id === parsed.categoryId);
        const unitDef = categoryDef?.units.find(u => u.id === parsed.unitId);
        if (unitDef) {
          const siReps = generateSIRepresentations(dims, parsed.categoryId);
          const matchIdx = siReps.findIndex(rep => rep.displaySymbol === unitDef.symbol);
          if (matchIdx >= 0) {
            autoAlt = matchIdx;
            const prefixDef = PREFIXES.find(p => p.id === parsed.prefixId);
            autoPrefix = (unitDef.allowPrefixes && prefixDef && prefixDef.id !== 'none') ? prefixDef.id : 'none';
          }
        }
      }
      setRpnResultPrefix(autoPrefix);
      setRpnSelectedAlternative(autoAlt);
    } catch (err) {
      console.error('Failed to read clipboard:', err);
    }
  };

  type RpnUnaryOp =
    | 'square' | 'cube' | 'sqrt' | 'cbrt' | 'recip'
    | 'exp' | 'ln' | 'pow10' | 'log10' | 'pow2' | 'log2'
    | 'sin' | 'cos' | 'tan' | 'asin' | 'acos' | 'atan'
    | 'sinh' | 'cosh' | 'tanh' | 'asinh' | 'acosh' | 'atanh'
    | 'rnd' | 'trunc' | 'floor' | 'ceil'
    | 'neg' | 'abs';

  const isRadians = (dimensions: DimensionalFormula): boolean => {
    if (dimensions.angle !== 1) return false;
    for (const [key, value] of Object.entries(dimensions)) {
      if (key === 'angle') continue;
      if (value !== 0 && value !== undefined) return false;
    }
    return true;
  };

  const applyRpnUnary = (op: RpnUnaryOp) => {
    if (!rpnStack[3]) return;
    saveRpnStackForUndo();
    setLastX(rpnStack[3]);
    const x = rpnStack[3];
    let newValue: number;
    let newDimensions: Record<string, number> = {};

    switch (op) {
      case 'square': newValue = fixPrecision(x.value * x.value); for (const [d, e] of Object.entries(x.dimensions)) newDimensions[d] = e * 2; break;
      case 'cube': newValue = fixPrecision(x.value ** 3); for (const [d, e] of Object.entries(x.dimensions)) newDimensions[d] = e * 3; break;
      case 'sqrt': if (x.value < 0) return; newValue = fixPrecision(Math.sqrt(x.value)); for (const [d, e] of Object.entries(x.dimensions)) newDimensions[d] = Math.ceil(e / 2); break;
      case 'cbrt': newValue = fixPrecision(Math.cbrt(x.value)); for (const [d, e] of Object.entries(x.dimensions)) newDimensions[d] = Math.ceil(e / 3); break;
      case 'exp': newValue = fixPrecision(Math.exp(x.value)); newDimensions = { ...x.dimensions }; break;
      case 'ln': if (x.value <= 0) return; newValue = fixPrecision(Math.log(x.value)); newDimensions = { ...x.dimensions }; break;
      case 'pow10': newValue = fixPrecision(Math.pow(10, x.value)); newDimensions = { ...x.dimensions }; break;
      case 'log10': if (x.value <= 0) return; newValue = fixPrecision(Math.log10(x.value)); newDimensions = { ...x.dimensions }; break;
      case 'pow2': newValue = fixPrecision(Math.pow(2, x.value)); newDimensions = { ...x.dimensions }; break;
      case 'log2': if (x.value <= 0) return; newValue = fixPrecision(Math.log2(x.value)); newDimensions = { ...x.dimensions }; break;
      case 'rnd': { const f = Math.pow(10, calculatorPrecision); const sc = x.value * f; const fl = Math.floor(sc); newValue = (Math.abs(sc - fl - 0.5) < 1e-10 ? (fl % 2 === 0 ? fl : fl + 1) : Math.round(sc)) / f; newDimensions = { ...x.dimensions }; break; }
      case 'trunc': { const f = Math.pow(10, calculatorPrecision); newValue = Math.trunc(x.value * f) / f; newDimensions = { ...x.dimensions }; break; }
      case 'floor': { const f = Math.pow(10, calculatorPrecision); newValue = Math.floor(x.value * f) / f; newDimensions = { ...x.dimensions }; break; }
      case 'ceil': { const f = Math.pow(10, calculatorPrecision); newValue = Math.ceil(x.value * f) / f; newDimensions = { ...x.dimensions }; break; }
      case 'neg': newValue = -x.value; newDimensions = { ...x.dimensions }; break;
      case 'abs': newValue = Math.abs(x.value); newDimensions = { ...x.dimensions }; break;
      case 'recip': if (x.value === 0) return; newValue = fixPrecision(1 / x.value); for (const [d, e] of Object.entries(x.dimensions)) newDimensions[d] = -e; break;
      case 'sin': newValue = fixPrecision(Math.sin(x.value)); newDimensions = isRadians(x.dimensions) ? {} : { ...x.dimensions }; break;
      case 'cos': newValue = fixPrecision(Math.cos(x.value)); newDimensions = isRadians(x.dimensions) ? {} : { ...x.dimensions }; break;
      case 'tan': newValue = fixPrecision(Math.tan(x.value)); newDimensions = isRadians(x.dimensions) ? {} : { ...x.dimensions }; break;
      case 'asin': if (x.value < -1 || x.value > 1) return; newValue = fixPrecision(Math.asin(x.value)); newDimensions = isDimensionless(x.dimensions) ? { angle: 1 } : { ...x.dimensions }; break;
      case 'acos': if (x.value < -1 || x.value > 1) return; newValue = fixPrecision(Math.acos(x.value)); newDimensions = isDimensionless(x.dimensions) ? { angle: 1 } : { ...x.dimensions }; break;
      case 'atan': newValue = fixPrecision(Math.atan(x.value)); newDimensions = isDimensionless(x.dimensions) ? { angle: 1 } : { ...x.dimensions }; break;
      case 'sinh': newValue = fixPrecision(Math.sinh(x.value)); newDimensions = isRadians(x.dimensions) ? {} : { ...x.dimensions }; break;
      case 'cosh': newValue = fixPrecision(Math.cosh(x.value)); newDimensions = isRadians(x.dimensions) ? {} : { ...x.dimensions }; break;
      case 'tanh': newValue = fixPrecision(Math.tanh(x.value)); newDimensions = isRadians(x.dimensions) ? {} : { ...x.dimensions }; break;
      case 'asinh': newValue = fixPrecision(Math.asinh(x.value)); newDimensions = isDimensionless(x.dimensions) ? { angle: 1 } : { ...x.dimensions }; break;
      case 'acosh': if (x.value < 1) return; newValue = fixPrecision(Math.acosh(x.value)); newDimensions = isDimensionless(x.dimensions) ? { angle: 1 } : { ...x.dimensions }; break;
      case 'atanh': if (x.value <= -1 || x.value >= 1) return; newValue = fixPrecision(Math.atanh(x.value)); newDimensions = isDimensionless(x.dimensions) ? { angle: 1 } : { ...x.dimensions }; break;
      default: return;
    }
    for (const [d, e] of Object.entries(newDimensions)) { if (e === 0) delete newDimensions[d]; }
    const preserveCat = op === 'neg' || op === 'abs';
    const newEntry: CalcValue = { value: newValue!, dimensions: newDimensions, prefix: 'none', ...(preserveCat && x.sourceCategory ? { sourceCategory: x.sourceCategory } : {}) };
    setRpnStack(prev => { const ns = [...prev]; ns[3] = newEntry; return ns; });
    setRpnResultPrefix('none'); setRpnSelectedAlternative(0); triggerFlashRpnResult();
  };

  type RpnBinaryOp = 'mul' | 'div' | 'add' | 'sub' | 'mulUnit' | 'divUnit' | 'addUnit' | 'subUnit' | 'pow';

  const canApplyRpnBinary = (op: RpnBinaryOp): boolean => {
    if (!rpnStack[2] || !rpnStack[3]) return false;
    if (op === 'addUnit' || op === 'subUnit') {
      const y = rpnStack[2]; const x = rpnStack[3];
      return dimensionsEqual(y.dimensions, x.dimensions) || isDimensionless(y.dimensions) || isDimensionless(x.dimensions);
    }
    return true;
  };

  const applyRpnBinary = (op: RpnBinaryOp) => {
    if (!rpnStack[2] || !rpnStack[3]) return;
    saveRpnStackForUndo();
    setLastX(rpnStack[3]);
    const y = rpnStack[2]; const x = rpnStack[3];
    let newValue: number; let newDimensions: Record<string, number> = {};
    switch (op) {
      case 'mul': newValue = fixPrecision(y.value * x.value); newDimensions = { ...x.dimensions }; break;
      case 'div': if (x.value === 0) return; newValue = fixPrecision(y.value / x.value); newDimensions = { ...x.dimensions }; break;
      case 'add': newValue = fixPrecision(y.value + x.value); newDimensions = { ...x.dimensions }; break;
      case 'sub': newValue = fixPrecision(y.value - x.value); newDimensions = { ...x.dimensions }; break;
      case 'mulUnit':
        newValue = fixPrecision(y.value * x.value);
        for (const d of Object.keys(y.dimensions)) newDimensions[d] = (y.dimensions as Record<string, number>)[d] || 0;
        for (const d of Object.keys(x.dimensions)) newDimensions[d] = (newDimensions[d] || 0) + ((x.dimensions as Record<string, number>)[d] || 0);
        break;
      case 'divUnit':
        if (x.value === 0) return;
        newValue = fixPrecision(y.value / x.value);
        for (const d of Object.keys(y.dimensions)) newDimensions[d] = (y.dimensions as Record<string, number>)[d] || 0;
        for (const d of Object.keys(x.dimensions)) newDimensions[d] = (newDimensions[d] || 0) - ((x.dimensions as Record<string, number>)[d] || 0);
        break;
      case 'addUnit':
        if (!dimensionsEqual(y.dimensions, x.dimensions) && !isDimensionless(y.dimensions) && !isDimensionless(x.dimensions)) return;
        newValue = fixPrecision(y.value + x.value);
        newDimensions = isDimensionless(x.dimensions) ? { ...y.dimensions } : { ...x.dimensions };
        break;
      case 'subUnit':
        if (!dimensionsEqual(y.dimensions, x.dimensions) && !isDimensionless(y.dimensions) && !isDimensionless(x.dimensions)) return;
        newValue = fixPrecision(y.value - x.value);
        newDimensions = isDimensionless(x.dimensions) ? { ...y.dimensions } : { ...x.dimensions };
        break;
      case 'pow':
        if (!isDimensionless(x.dimensions)) return;
        if (y.value === 0 && x.value < 0) return;
        if (y.value < 0 && !Number.isInteger(x.value)) return;
        newValue = fixPrecision(Math.pow(y.value, x.value));
        for (const [d, e] of Object.entries(y.dimensions)) { const ne = e * x.value; if (ne !== 0) newDimensions[d] = ne; }
        break;
      default: return;
    }
    for (const [d, e] of Object.entries(newDimensions)) { if (e === 0) delete newDimensions[d]; }
    setRpnStack(prev => { const ns = [...prev]; ns[3] = { value: newValue!, dimensions: newDimensions, prefix: 'none' }; ns[2] = prev[1]; ns[1] = prev[0]; ns[0] = null; return ns; });
    setRpnResultPrefix('none'); setRpnSelectedAlternative(0); triggerFlashRpnResult();
  };

  const pushRpnConstant = (value: number) => {
    saveRpnStackForUndo();
    setRpnStack(prev => { const ns = [...prev]; ns[0] = prev[1]; ns[1] = prev[2]; ns[2] = prev[3]; ns[3] = { value, dimensions: {}, prefix: 'none' }; return ns; });
    setRpnResultPrefix('none'); setRpnSelectedAlternative(0); triggerFlashRpnResult();
  };

  const getRpnResultDisplay = () => {
    if (!rpnStack[3]) return null;
    const val = rpnStack[3];
    const siReps = generateSIRepresentations(val.dimensions, val.sourceCategory);
    const currentSymbol = siReps[rpnSelectedAlternative]?.displaySymbol || formatDimensions(val.dimensions);
    if (currentSymbol === '1' || !currentSymbol) return { formattedValue: formatNumberWithSeparators(val.value, calculatorPrecision), unitSymbol: '' };
    const kgResult = applyPrefixToKgUnit(currentSymbol, rpnResultPrefix);
    const displayValue = siToDisplayLib(val.value, currentSymbol, rpnResultPrefix);
    const formattedValue = formatNumberWithSeparators(displayValue, calculatorPrecision);
    const prefixData = PREFIXES.find(p => p.id === rpnResultPrefix);
    const prefixSymbol = kgResult.showPrefix && prefixData ? prefixData.symbol : '';
    return { formattedValue, unitSymbol: prefixSymbol + kgResult.displaySymbol };
  };

  const computeXOriginMeta = (altIndex: number, prefix: string): { originalUnit: string; originalValue: number; unitType: UnitType; sourceCategory: string | undefined } | null => {
    const val = rpnStack[3];
    if (!val) return null;
    const siReps = generateSIRepresentations(val.dimensions, val.sourceCategory);
    const rep = siReps[altIndex];
    const symbol = rep?.displaySymbol || formatDimensions(val.dimensions);
    if (!symbol || symbol === '1') return null;
    const kgResult = applyPrefixToKgUnit(symbol, prefix);
    const displayValue = siToDisplayLib(val.value, symbol, prefix);
    const prefixData = PREFIXES.find(p => p.id === prefix);
    const prefixSymbol = kgResult.showPrefix && prefixData ? prefixData.symbol : '';
    const primaryDerivedUnit = rep?.derivedUnits?.[0];
    const derivedUnitInfo = primaryDerivedUnit ? SI_DERIVED_UNITS.find(u => u.symbol === primaryDerivedUnit) : undefined;
    const sourceCategory = derivedUnitInfo?.category ?? val.sourceCategory;
    return { originalUnit: prefixSymbol + kgResult.displaySymbol, originalValue: displayValue, unitType: UnitType.SI_BASE, sourceCategory };
  };

  const setRpnSelectedAlternativeAndMeta = (altIndex: number) => {
    setRpnSelectedAlternative(altIndex);
    setRpnResultPrefix('none');
    const meta = computeXOriginMeta(altIndex, 'none');
    if (meta && rpnStack[3]) {
      setRpnStack(prev => {
        const ns = [...prev];
        if (ns[3]) {
          ns[3] = { ...ns[3], originalUnit: meta.originalUnit, originalValue: meta.originalValue, unitType: meta.unitType, sourceCategory: meta.sourceCategory };
        }
        return ns;
      });
    }
  };

  const setRpnResultPrefixAndMeta = (prefix: string) => {
    setRpnResultPrefix(prefix);
    const meta = computeXOriginMeta(rpnSelectedAlternative, prefix);
    if (meta && rpnStack[3]) {
      setRpnStack(prev => {
        const ns = [...prev];
        if (ns[3]) {
          ns[3] = { ...ns[3], originalUnit: meta.originalUnit, originalValue: meta.originalValue, unitType: meta.unitType, sourceCategory: meta.sourceCategory };
        }
        return ns;
      });
    }
  };

  const copyRpnResult = () => {
    const display = getRpnResultDisplay();
    if (!display) return;
    const cleanValue = display.formattedValue.replace(/,/g, '');
    navigator.clipboard.writeText(display.unitSymbol ? `${cleanValue} ${display.unitSymbol}` : cleanValue);
    triggerFlashRpnResult();
  };

  const copyRpnField = (index: number) => {
    const val = rpnStack[index];
    if (!val) return;
    const baseUnitSymbol = formatDimensions(val.dimensions);
    const kgResult = applyPrefixToKgUnit(baseUnitSymbol, val.prefix);
    const displayValue = val.value / kgResult.effectivePrefixFactor;
    const formattedValue = formatNumberWithSeparators(displayValue, calculatorPrecision);
    const cleanValue = formattedValue.replace(/,/g, '');
    const prefixData = PREFIXES.find(p => p.id === val.prefix);
    const prefixSymbol = kgResult.showPrefix && prefixData ? prefixData.symbol : '';
    const unitSymbol = prefixSymbol + kgResult.displaySymbol;
    navigator.clipboard.writeText(unitSymbol ? `${cleanValue} ${unitSymbol}` : cleanValue);
    if (index === 0) triggerFlashRpnField1();
    else if (index === 1) triggerFlashRpnField2();
    else if (index === 2) triggerFlashRpnField3();
  };

  const switchToRpn = () => {
    saveRpnStackForUndo();
    setRpnStack([null, null, null, calcValues[3]]);
    setRpnResultPrefix('none'); setRpnSelectedAlternative(0); setCalculatorMode('rpn');
  };

  const switchToSimple = () => {
    setCalcValues([rpnStack[3], null, null, null]);
    setCalcOp1(null); setCalcOp2(null); setResultPrefix('none'); setSelectedAlternative(0); setCalculatorMode('simple');
  };

  const fixPrecision = (num: number): number => {
    if (num === 0) return 0;
    if (!isFinite(num)) return num;
    return parseFloat(num.toPrecision(17));
  };

  const getCalcResultDisplay = () => {
    if (!calcValues[3]) return null;
    const val = calcValues[3];
    const siReps = generateSIRepresentations(val.dimensions, val.sourceCategory);
    const currentSymbol = siReps[selectedAlternative]?.displaySymbol || formatDimensions(val.dimensions);
    const kgResult = applyPrefixToKgUnit(currentSymbol, resultPrefix);
    const displayValue = val.value / kgResult.effectivePrefixFactor;
    const formattedValue = formatNumberWithSeparators(displayValue, calculatorPrecision);
    const prefixData = PREFIXES.find(p => p.id === resultPrefix);
    const prefixSymbol = kgResult.showPrefix && prefixData ? prefixData.symbol : '';
    return { formattedValue, unitSymbol: prefixSymbol + kgResult.displaySymbol };
  };

  const copyCalcResult = () => {
    const display = getCalcResultDisplay();
    if (!display) return;
    navigator.clipboard.writeText(display.unitSymbol ? `${display.formattedValue} ${display.unitSymbol}` : display.formattedValue);
    triggerFlashCopyCalc();
  };

  const cleanNumber = (num: number, precision: number): string => {
    const fixed = fixPrecision(num);
    let effectivePrecision = precision;
    const absNum = Math.abs(fixed);
    if (absNum > 0 && absNum < 1) {
      effectivePrecision = Math.min(Math.abs(Math.floor(Math.log10(absNum))) + precision, 12);
    }
    const formatted = toFixedBanker(fixed, effectivePrecision);
    return formatted.replace(/(\.\d*?[1-9])0+$/, '$1').replace(/\.0+$/, '');
  };

  const copyCalcField = (fieldIndex: number) => {
    const val = calcValues[fieldIndex];
    if (!val) return;
    const baseUnitSymbol = formatDimensions(val.dimensions);
    const kgResult = applyPrefixToKgUnit(baseUnitSymbol, val.prefix);
    const displayValue = fixPrecision(val.value / kgResult.effectivePrefixFactor);
    const prefixData = PREFIXES.find(p => p.id === val.prefix);
    const prefixSymbol = kgResult.showPrefix && prefixData ? prefixData.symbol : '';
    const unitSymbol = prefixSymbol + kgResult.displaySymbol;
    const format = NUMBER_FORMATS[numberFormat];
    const valueStr = cleanNumber(displayValue, calculatorPrecision);
    const formattedStr = format.decimal !== '.' ? valueStr.replace('.', format.decimal) : valueStr;
    navigator.clipboard.writeText(unitSymbol ? `${formattedStr} ${unitSymbol}` : formattedStr);
    if (fieldIndex === 0) triggerFlashCalcField1();
    else if (fieldIndex === 1) triggerFlashCalcField2();
    else if (fieldIndex === 2) triggerFlashCalcField3();
  };

  const formatNumberWithSeparators = (num: number, precision: number): string => {
    const format = NUMBER_FORMATS[numberFormat];
    if (num === 0) return format.useArabicNumerals ? '٠' : '0';
    const absNum = Math.abs(num);
    if (absNum < 1e-12 || absNum >= 1e15) {
      const expStr = num.toExponential(Math.min(precision, 10));
      return format.useArabicNumerals ? toArabicNumerals(expStr) : expStr;
    }
    const cleaned = cleanNumber(num, precision);
    const [integer, decimal] = cleaned.split('.');
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
  };

  const formatFactor = (f: number) => {
    const format = NUMBER_FORMATS[numberFormat];
    if (f === 1) return format.useArabicNumerals ? '١' : '1';
    if (f >= 1e9 || f <= 1e-8) {
      const expStr = f.toExponential(7);
      return format.useArabicNumerals ? `×${toArabicNumerals(expStr)}` : `×${expStr}`;
    }
    const str = f.toPrecision(9);
    const num = parseFloat(str);
    return `×${formatNumberWithSeparators(num, 8)}`;
  };

  const formatResultValue = (num: number, precisionValue: number): string => {
    const format = NUMBER_FORMATS[numberFormat];
    if (num === 0) return format.useArabicNumerals ? '٠' : '0';
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
  };

  const getPlaceholder = () => {
    if (fromUnit === 'deg_dms') return "dd:mm:ss";
    if (fromUnit === 'ft_in') return "ft'in\"";
    return "0";
  };

  const handleInputChange = (value: string) => {
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
  };

  const buildDirectUnitSymbol = (): string => {
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
  };

  const buildDirectDimensions = (): { [key: string]: number } => {
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
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
      e.preventDefault();
      const allCategories = CATEGORY_GROUPS.flatMap(group => group.categories);
      const currentIndex = allCategories.indexOf(activeCategory);
      if (currentIndex === -1) return;
      let newIndex: number;
      if (e.key === 'ArrowUp') {
        newIndex = currentIndex > 0 ? currentIndex - 1 : allCategories.length - 1;
      } else {
        newIndex = currentIndex < allCategories.length - 1 ? currentIndex + 1 : 0;
      }
      setActiveCategory(allCategories[newIndex] as UnitCategory);
      setInputValue('1');
    }
  };

  const handleDirectCopyAndPushToCalculator = (value: number, dims: Record<string, number>) => {
    triggerFlashDirectCopy();
    const newEntry = { value, dimensions: dims, prefix: 'none' as string };
    if (calculatorMode === 'rpn') {
      saveRpnStackForUndo();
      setRpnStack(prev => { const ns = [...prev]; ns[0] = prev[1]; ns[1] = prev[2]; ns[2] = prev[3]; ns[3] = newEntry; return ns; });
      setRpnResultPrefix('none'); setRpnSelectedAlternative(0); triggerFlashRpnResult();
    } else {
      const firstEmptyIndex = calcValues.findIndex((v, i) => i < 3 && v === null);
      if (firstEmptyIndex !== -1) {
        const newCalcValues = [...calcValues];
        newCalcValues[firstEmptyIndex] = newEntry;
        setCalcValues(newCalcValues);
      }
    }
  };

  const handleQuantityClick = (quantityName: string) => {
    const categoryKey = getCategoryKeyForQuantityName(quantityName);
    if (!categoryKey) return;
    setActiveCategory(categoryKey as UnitCategory);
    setInputValue(directValue);
    setActiveTab('converter');
  };

  return (
    <div className="w-full max-w-[1400px] mx-auto p-4 md:px-8 md:pb-0 md:pt-1 grid md:grid-cols-[260px_1fr] gap-8 md:h-full md:overflow-hidden">

      {/* Sidebar */}
      <nav className={`space-y-2 overflow-y-auto pe-2 -mt-1 pt-1 transition-opacity ${activeTab === 'custom' ? 'opacity-40 pointer-events-none' : ''}`}>
        {CATEGORY_GROUPS.map((group) => (
          <div key={group.name} className="space-y-1">
            <h2 className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground/80 px-2 font-bold">{t(group.name)}</h2>
            <div className="space-y-0">
              {group.categories.map((catId) => {
                const cat = CONVERSION_DATA.find(c => c.id === catId);
                if (!cat) return null;
                const isSelected = activeTab === 'converter' && activeCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => { setActiveCategory(cat.id as UnitCategory); setInputValue('1'); }}
                    disabled={activeTab === 'custom'}
                    data-testid="display-category"
                    data-category-id={cat.id}
                    className={`w-full text-start px-3 py-[1px] rounded-sm text-xs font-medium transition-all duration-200 border-s-2 flex items-center justify-between group ${
                      isSelected
                        ? 'border-accent text-accent'
                        : 'hover:bg-muted/50 border-transparent text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {t(cat.name)}
                    {isSelected && (
                      <motion.div layoutId="active-indicator" className="w-1 h-1 rounded-full bg-accent" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Main Content Area with Tabs */}
      <div className="space-y-4 -mt-1 md:overflow-y-auto md:pr-1">
        {/* Header with formatting options */}
        <div className="mb-2">
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              <button
                onClick={() => setActiveTab('converter')}
                className={`text-sm px-4 py-1.5 rounded-md font-medium transition-all ${
                  activeTab === 'converter'
                    ? 'bg-accent text-accent-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                }`}
                {...testId('tab-converter')}
              >
                {t('Converter')}
              </button>
              <button
                onClick={() => setActiveTab('custom')}
                className={`text-sm px-4 py-1.5 rounded-md font-medium transition-all ${
                  activeTab === 'custom'
                    ? 'bg-accent text-accent-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                }`}
                {...testId('tab-custom')}
              >
                {t('Custom')}
              </button>
            </div>
            <div className="flex items-center gap-3">
              <Label className="text-xs text-muted-foreground">{t('Number formatting')}</Label>
              <Select
                value={numberFormat}
                onValueChange={(val) => {
                  const newFormat = val as NumberFormat;
                  const oldFormat = numberFormat;
                  reformatInputValue(oldFormat, newFormat);
                  setNumberFormat(newFormat);
                  refocusInput();
                }}
                onOpenChange={(open) => { if (!open) refocusInput(); }}
              >
                <SelectTrigger tabIndex={6} className="h-10 w-[180px] text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="uk" className="text-xs">{t('num-format-english')}</SelectItem>
                  <SelectItem value="europe-latin" className="text-xs">{t('num-format-world')}</SelectItem>
                  <SelectItem value="period" className="text-xs">{t('num-format-period')}</SelectItem>
                  <SelectItem value="comma" className="text-xs">{t('num-format-comma')}</SelectItem>
                  <SelectItem value="arabic" className="text-xs">العربية</SelectItem>
                  <SelectItem value="east-asian" className="text-xs">{t('num-format-east-asian')}</SelectItem>
                  <SelectItem value="south-asian" className="text-xs">{t('num-format-south-asian')}</SelectItem>
                  <SelectItem value="swiss" className="text-xs">{t('num-format-swiss')}</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={language}
                onValueChange={(val) => { setLanguage(val as SupportedLanguage); refocusInput(); }}
                onOpenChange={(open) => { if (!open) refocusInput(); }}
              >
                <SelectTrigger tabIndex={7} className="h-10 w-[75px] text-xs">
                  <SelectValue placeholder="" />
                </SelectTrigger>
                <SelectContent className="max-h-[50vh]">
                  {ISO_LANGUAGES.map((lang) => (
                    <SelectItem key={lang} value={lang} className="text-xs">{lang}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          {activeTab === 'converter' && (
            <div className="mt-2">
              <h1 className="text-3xl font-bold text-foreground tracking-tight">{t(categoryData.name)}</h1>
              <div className="flex items-center justify-between mt-1">
                <p className="text-muted-foreground text-sm font-mono">
                  {t('Base unit:')} <span className="text-primary">{translateUnitName(toTitleCase(categoryData.baseUnit))}</span>
                </p>
                <div className="flex flex-col items-end gap-0.5">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleConverterSmartPasteClick}
                    className={`text-xs gap-2 border !border-border/30 ${converterPasteStatus === 'unrecognised' || converterPasteStatus === 'unavailable' ? 'text-destructive hover:text-destructive' : 'hover:text-accent'}`}
                    style={{ height: FIELD_HEIGHT }}
                    {...testId('button-smart-paste')}
                  >
                    <ClipboardPaste className="w-3 h-3" />
                    <span>
                      {converterPasteStatus === 'unrecognised' ? t('Not recognised') : converterPasteStatus === 'unavailable' ? t('Unavailable') : t('Smart Paste')}
                    </span>
                  </Button>
                  <AnimatePresence>
                    {converterPasteStatus !== 'idle' && (
                      <motion.p
                        key="converter-paste-notice"
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        transition={{ duration: 0.15 }}
                        className="text-xs text-destructive text-right leading-tight"
                        {...testId('text-converter-paste-notice')}
                      >
                        {converterPasteStatus === 'unavailable'
                          ? t("Clipboard unavailable — paste manually")
                          : t("Couldn't recognise a unit — try Custom Entry")}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          )}
          {activeTab === 'custom' && (
            <div className="mt-2">
              <h1 className="text-3xl font-bold text-foreground tracking-tight">{t('Custom Entry')}</h1>
              <div className="flex items-center justify-between mt-1">
                <p className="text-muted-foreground text-sm font-mono">
                  {t('Build dimensional units from SI base units')}
                </p>
                <div className="flex flex-col items-end gap-0.5">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCustomSmartPasteClick}
                    className={`text-xs gap-2 border !border-border/30 ${customPasteStatus === 'unrecognised' || customPasteStatus === 'unavailable' ? 'text-destructive hover:text-destructive' : 'hover:text-accent'}`}
                    style={{ height: FIELD_HEIGHT }}
                    {...testId('button-custom-smart-paste')}
                  >
                    <ClipboardPaste className="w-3 h-3" />
                    <span>
                      {customPasteStatus === 'unrecognised' ? t('Not recognised') : customPasteStatus === 'unavailable' ? t('Unavailable') : t('Smart Paste')}
                    </span>
                  </Button>
                  <AnimatePresence>
                    {customPasteStatus !== 'idle' && (
                      <motion.p
                        key="custom-paste-notice"
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        transition={{ duration: 0.15 }}
                        className="text-xs text-destructive text-right leading-tight"
                        {...testId('text-custom-paste-notice')}
                      >
                        {customPasteStatus === 'unavailable'
                          ? t("Clipboard unavailable — paste manually")
                          : t("Couldn't recognise a unit — enter dimensions manually")}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Fixed-height content container */}
        <div className="grid">
          <ConverterPane
            activeTab={activeTab}
            activeCategory={activeCategory}
            fromUnit={fromUnit}
            toUnit={toUnit}
            fromPrefix={fromPrefix}
            toPrefix={toPrefix}
            inputValue={inputValue}
            result={result}
            precision={precision}
            comparisonMode={comparisonMode}
            numberFormat={numberFormat}
            inputRef={inputRef}
            flashCopyResult={flashCopyResult}
            flashFromBaseFactor={flashFromBaseFactor}
            flashFromSIBase={flashFromSIBase}
            flashToBaseFactor={flashToBaseFactor}
            flashToSIBase={flashToSIBase}
            flashConversionRatio={flashConversionRatio}
            setFromUnit={setFromUnit}
            setToUnit={setToUnit}
            setFromPrefix={setFromPrefix}
            setToPrefix={setToPrefix}
            setInputValue={setInputValue}
            setPrecision={setPrecision}
            setComparisonMode={setComparisonMode}
            swapUnits={swapUnits}
            copyResult={copyResult}
            copyFromBaseFactor={copyFromBaseFactor}
            copyFromSIBase={copyFromSIBase}
            copyToBaseFactor={copyToBaseFactor}
            copyToSIBase={copyToSIBase}
            copyConversionRatio={copyConversionRatio}
            handleInputChange={handleInputChange}
            handleInputKeyDown={handleInputKeyDown}
            handleInputBlur={handleInputBlur}
            refocusInput={refocusInput}
            normalizeMassUnit={normalizeMassUnit}
            t={t}
            translateUnitName={translateUnitName}
            formatFactor={formatFactor}
            formatResultValue={formatResultValue}
            formatDMS={formatDMS}
            formatFtIn={formatFtIn}
            getPlaceholder={getPlaceholder}
            getCategoryDimensions={getCategoryDimensions}
            formatNumberWithSeparators={formatNumberWithSeparators}
          />

          <DirectPane
            activeTab={activeTab}
            directValue={directValue}
            directExponents={directExponents}
            precision={precision}
            numberFormat={numberFormat}
            flashDirectCopy={flashDirectCopy}
            setDirectValue={setDirectValue}
            setDirectExponents={setDirectExponents}
            t={t}
            formatResultValue={formatResultValue}
            formatForClipboard={formatForClipboard}
            parseNumberWithFormat={parseNumberWithFormat}
            buildDirectUnitSymbol={buildDirectUnitSymbol}
            buildDirectDimensions={buildDirectDimensions}
            onCopyAndPushToCalculator={handleDirectCopyAndPushToCalculator}
            onQuantityClick={handleQuantityClick}
          />
        </div>

        <CalculatorPane
          calculatorMode={calculatorMode}
          shiftActive={shiftActive}
          calculatorPrecision={calculatorPrecision}
          numberFormat={numberFormat}
          calcValues={calcValues}
          calcOp1={calcOp1}
          calcOp2={calcOp2}
          resultPrefix={resultPrefix}
          selectedAlternative={selectedAlternative}
          rpnStack={rpnStack}
          previousRpnStack={previousRpnStack}
          rpnResultPrefix={rpnResultPrefix}
          rpnSelectedAlternative={rpnSelectedAlternative}
          rpnXEditing={rpnXEditing}
          rpnXEditValue={rpnXEditValue}
          flashCalcField1={flashCalcField1}
          flashCalcField2={flashCalcField2}
          flashCalcField3={flashCalcField3}
          flashCopyCalc={flashCopyCalc}
          flashRpnField1={flashRpnField1}
          flashRpnField2={flashRpnField2}
          flashRpnField3={flashRpnField3}
          flashRpnResult={flashRpnResult}
          setShiftActive={setShiftActive}
          setCalculatorPrecision={setCalculatorPrecision}
          setCalcOp1={setCalcOp1}
          setCalcOp2={setCalcOp2}
          setResultPrefix={setResultPrefix}
          setSelectedAlternative={setSelectedAlternative}
          setRpnResultPrefix={setRpnResultPrefixAndMeta}
          setRpnSelectedAlternative={setRpnSelectedAlternativeAndMeta}
          preserveSourceUnit={preserveSourceUnit}
          togglePreserveSourceUnit={() => setPreserveSourceUnit(v => !v)}
          setRpnXEditing={setRpnXEditing}
          setRpnXEditValue={setRpnXEditValue}
          setRpnStack={setRpnStack}
          clearCalculator={clearCalculator}
          clearField1={clearField1}
          clearField2={clearField2}
          clearField3={clearField3}
          clearRpnStack={clearRpnStack}
          copyCalcField={copyCalcField}
          copyCalcResult={copyCalcResult}
          copyRpnField={copyRpnField}
          copyRpnResult={copyRpnResult}
          switchToRpn={switchToRpn}
          switchToSimple={switchToSimple}
          applyRpnUnary={applyRpnUnary}
          applyRpnBinary={applyRpnBinary}
          canApplyRpnBinary={canApplyRpnBinary}
          pushToRpnStack={pushToRpnStack}
          dropRpnStack={dropRpnStack}
          undoRpnStack={undoRpnStack}
          pullFromPane={pullFromPane}
          pasteToRpnStack={pasteToRpnStack}
          swapRpnXY={swapRpnXY}
          recallLastX={recallLastX}
          pushRpnConstant={pushRpnConstant}
          saveRpnStackForUndo={saveRpnStackForUndo}
          getRpnResultDisplay={getRpnResultDisplay}
          getCalcResultDisplay={getCalcResultDisplay}
          generateSIRepresentations={generateSIRepresentations}
          applyPrefixToKgUnit={applyPrefixToKgUnit}
          formatNumberWithSeparators={formatNumberWithSeparators}
          t={t}
        />


        {/* Help Pane */}
        <HelpSection t={t} language={language} />
      </div>
    </div>
  );
}
