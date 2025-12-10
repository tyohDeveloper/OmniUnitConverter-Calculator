import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CONVERSION_DATA, UnitCategory, convert, PREFIXES, ALL_PREFIXES, Prefix, findOptimalPrefix, parseUnitText, ParsedUnitResult, getFilteredSortedUnits } from '@/lib/conversion-data';
import { UNIT_NAME_TRANSLATIONS, UI_TRANSLATIONS, type SupportedLanguage, type Translation } from '@/lib/localization';
import { UNIT_TRANSLATIONS } from '@/lib/unit-translations';
import { 
  fixPrecision, toArabicNumerals, toLatinNumerals, roundToNearestEven, 
  toFixedBanker, toTitleCase, NUMBER_FORMATS, type NumberFormat,
  parseNumberWithFormat as parseNumberWithSpecificFormat,
  formatNumberWithFormat as formatNumberWithSpecificFormat
} from '@/lib/formatting';
import { 
  DimensionalFormula, CalcValue, DerivedUnitInfo, SI_DERIVED_UNITS,
  NON_SI_UNITS_CATALOG, CATEGORY_DIMENSIONS, CategoryDimensionInfo,
  EXCLUDED_CROSS_DOMAIN_CATEGORIES, PREFERRED_REPRESENTATIONS, PreferredRepresentation,
  getDimensionSignature
} from '@/lib/units/shared-types';
import { 
  formatDimensions, toSuperscript, multiplyDimensions, divideDimensions,
  dimensionsEqual, isDimensionless, findCrossDomainMatches,
  isValidSymbolRepresentation, countUnits,
  generateSIRepresentations as generateSIRepresentationsLib,
  isDimensionEmpty, SIRepresentation,
  canAddSubtract, subtractDimensions, canFactorOut, hasOnlyOriginalDimensions,
  normalizeDimensions, generateAlternativeRepresentations, AlternativeRepresentation
} from '@/lib/calculator';
import { 
  PREFIX_EXPONENTS, GRAM_TO_KG_UNIT_PAIRS, KG_TO_GRAM_UNIT_PAIRS, 
  normalizeMassUnit as normalizeMassUnitHelper, EXPONENT_TO_PREFIX,
  normalizeMassValue as normalizeMassValueLib,
  normalizeMassDisplay as normalizeMassDisplayLib,
  applyPrefixToKgUnit as applyPrefixToKgUnitLib,
  applyRegionalSpelling as applyRegionalSpellingLib,
  findBestPrefix
} from '@/lib/units/helpers';
import { useRpnStack } from '@/components/unit-converter/hooks/useRpnStack';
import { useAllFlashFlags } from '@/components/unit-converter/hooks/useFlashFlag';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { ArrowRightLeft, Copy, Info, ClipboardPaste } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { testId } from '@/lib/test-utils';
import HelpSection from '@/components/help-section';
import { 
  FIELD_HEIGHT, CommonFieldWidth, OperatorBtnWidth, ClearBtnWidth, 
  RpnBtnWidth, RpnBtnCount, CALC_CONTENT_HEIGHT, ISO_LANGUAGES 
} from '@/components/unit-converter/constants';
import { CalculatorFieldDisplay } from '@/components/unit-converter/components/CalculatorFieldDisplay';

export default function UnitConverter() {
  const inputRef = useRef<HTMLInputElement>(null);
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
  
  // Flash flags for copy feedback animations (using consolidated hook)
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
  
  // Calculator mode state ('simple' | 'rpn')
  const [calculatorMode, setCalculatorMode] = useState<'simple' | 'rpn'>('rpn');
  const [shiftActive, setShiftActive] = useState(false);
  
  // RPN calculator state (using consolidated hook)
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
  
  // Tab state
  const [activeTab, setActiveTab] = useState<string>('converter');
  
  // Direct tab state - exponents for each SI base unit
  // Values: 0 = not used, 1-5 = positive exponents, -1 to -5 = negative exponents
  const [directValue, setDirectValue] = useState<string>('1');
  const [directExponents, setDirectExponents] = useState<Record<string, number>>({
    m: 0,    // length (meter)
    kg: 0,   // mass (kilogram)
    s: 0,    // time (second)
    A: 0,    // current (ampere)
    K: 0,    // temperature (kelvin)
    mol: 0,  // amount (mole)
    cd: 0,   // intensity (candela)
    rad: 0,  // angle (radian)
    sr: 0    // solid angle (steradian)
  });

  // Backward compatibility alias - types and catalogs imported from shared-types
  const DERIVED_UNITS_CATALOG = SI_DERIVED_UNITS;

  // Calculator state
  const [calcValues, setCalcValues] = useState<Array<CalcValue | null>>([null, null, null, null]);
  const [calcOp1, setCalcOp1] = useState<'+' | '-' | '*' | '/' | null>(null);
  const [calcOp2, setCalcOp2] = useState<'+' | '-' | '*' | '/' | null>(null);
  const [resultUnit, setResultUnit] = useState<string | null>(null);
  const [resultCategory, setResultCategory] = useState<UnitCategory | null>(null);
  const [resultPrefix, setResultPrefix] = useState<string>('none');
  const [selectedAlternative, setSelectedAlternative] = useState<number>(0); // Index of selected alternative representation

  // Number format state
  const [numberFormat, setNumberFormat] = useState<NumberFormat>('uk');
  
  // Language state (ISO 639-1 codes)
  const [language, setLanguage] = useState<SupportedLanguage>('en');
  
  // Wrappers for extracted helper functions
  const applyRegionalSpelling = (unitName: string): string => applyRegionalSpellingLib(unitName, language);
  const normalizeMassUnit = normalizeMassUnitHelper;
  const normalizeMassValue = normalizeMassValueLib;
  const applyPrefixToKgUnit = applyPrefixToKgUnitLib;
  
  // Helper to get unit info for mass display normalization
  const getMassUnitInfo = (unitId: string) => {
    const cat = CONVERSION_DATA.find(c => c.id === 'mass');
    const unit = cat?.units.find(u => u.id === unitId);
    return unit ? { factor: unit.factor, symbol: unit.symbol, allowPrefixes: unit.allowPrefixes || false } : undefined;
  };
  const normalizeMassDisplay = (valueInKg: number, currentPrefix: string, unitId: string | null) => 
    normalizeMassDisplayLib(valueInKg, currentPrefix, unitId, getMassUnitInfo);

  // Helper: Get translation from a translation record
  const getTranslationFromRecord = (trans: Translation, lang: SupportedLanguage): string | undefined => {
    if (lang === 'en' || lang === 'en-us') return trans.en;
    const langValue = trans[lang as keyof Translation];
    return langValue as string | undefined;
  };

  // Helper: Get translated text - uses language dropdown
  // Translates ALL labels: UI labels, category names, quantity names, and unit names
  // NOTE: Symbols (m, ft, kg) and prefixes (k, M, G) are NEVER translated - they always remain in Latin/ISO SI
  const t = (key: string): string => {
    // Check UI_TRANSLATIONS from localization.ts first
    if (UI_UNIT_TRANSLATIONS[key]) {
      const result = getTranslationFromRecord(UI_UNIT_TRANSLATIONS[key], language);
      if (result) return result;
      return UI_UNIT_TRANSLATIONS[key].en || key;
    }
    // Fall back to component-local TRANSLATIONS
    if (UNIT_TRANSLATIONS[key]) {
      const trans = UNIT_TRANSLATIONS[key];
      if ((language === 'en' || language === 'en-us') && trans.en) return trans.en;
      if (language === 'de' && trans.de) return trans.de;
      if (language === 'es' && trans.es) return trans.es;
      if (language === 'fr' && trans.fr) return trans.fr;
      if (language === 'it' && trans.it) return trans.it;
      if (language === 'pt' && trans.pt) return trans.pt;
      if (language === 'ko' && trans.ko) return trans.ko;
      if (language === 'ru' && trans.ru) return trans.ru;
      if (language === 'zh' && trans.zh) return trans.zh;
      if (language === 'ja' && trans.ja) return trans.ja;
      if (language === 'ar' && trans.ar) return trans.ar;
      return trans.en || key;
    }
    return key;
  };

  // Helper: Translate unit names while keeping symbols in Latin
  // Unit NAMES are translated (e.g., "Meter" → "Metro" in Spanish), but unit SYMBOLS remain Latin (e.g., "m" stays "m")
  const translateUnitName = (unitName: string): string => {
    // First try to get translation using t() function (for UI and category translations)
    const translated = t(unitName);
    // If translation found (different from key), use it
    if (translated !== unitName) {
      return translated;
    }
    
    // Then check UNIT_NAME_TRANSLATIONS from localization.ts (for all unit names including math functions)
    if (UNIT_NAME_UNIT_TRANSLATIONS[unitName]) {
      const trans = UNIT_NAME_UNIT_TRANSLATIONS[unitName];
      const langKey = language as SupportedLanguage;
      if (langKey === 'en' || langKey === 'en-us') {
        return trans.en || unitName;
      }
      // Check for translation in selected language
      const langValue = trans[langKey as keyof typeof trans];
      if (langValue) return langValue as string;
      // Fall back to English
      return trans.en || unitName;
    }
    
    // Otherwise, apply regional spelling variations (meter vs metre) for English variations
    return applyRegionalSpelling(unitName);
  };

  // Auto-set language to Arabic when Arabic number formats are selected
  React.useEffect(() => {
    if (numberFormat === 'arabic') {
      setLanguage('ar');
    }
  }, [numberFormat]);

  const CATEGORY_GROUPS = [
    {
      name: "Base Quantities",
      categories: ['length', 'mass', 'time', 'current', 'temperature', 'amount', 'intensity']
    },
    {
      name: "Mechanics",
      categories: ['area', 'volume', 'speed', 'acceleration', 'force', 'pressure', 'energy', 'power', 'torque', 'flow', 'density', 'viscosity', 'kinematic_viscosity', 'surface_tension', 'frequency', 'angular_velocity', 'momentum', 'angular_momentum']
    },
    {
      name: "Thermodynamics & Chemistry",
      categories: ['thermal_conductivity', 'specific_heat', 'entropy', 'concentration']
    },
    {
      name: "Electricity & Magnetism",
      categories: ['charge', 'potential', 'capacitance', 'resistance', 'conductance', 'inductance', 'magnetic_flux', 'magnetic_density', 'electric_field', 'magnetic_field_h']
    },
    {
      name: "Radiation & Physics",
      categories: ['radioactivity', 'radiation_dose', 'equivalent_dose', 'radioactive_decay', 'cross_section', 'photon', 'catalytic', 'angle', 'solid_angle', 'sound_pressure', 'sound_intensity', 'acoustic_impedance']
    },
    {
      name: "Human Response",
      categories: ['luminous_flux', 'illuminance', 'refractive_power']
    },
    {
      name: "Other",
      categories: ['math', 'data', 'fuel', 'fuel_economy', 'rack_geometry', 'shipping', 'beer_wine_volume', 'lightbulb']
    },
    {
      name: "Archaic & Regional",
      categories: ['archaic_length', 'archaic_mass', 'archaic_volume', 'archaic_area', 'archaic_energy', 'archaic_power']
    }
  ];

  const categoryData = CONVERSION_DATA.find(c => c.id === activeCategory)!;
  
  const filteredUnits = getFilteredSortedUnits(activeCategory);
  
  // For Math category, the "to" dropdown should only show "Number"
  const toFilteredUnits = activeCategory === 'math' 
    ? filteredUnits.filter(u => u.id === 'num')
    : filteredUnits;

  // Reset units when category changes
  useEffect(() => {
    const sorted = getFilteredSortedUnits(activeCategory);
    if (sorted.length > 0) {
      // Special case: temperature defaults to Kelvin
      if (activeCategory === 'temperature') {
        setFromUnit('k');
        setToUnit('k');
      } else if (activeCategory === 'capacitance') {
        // Capacitance defaults to Farad
        setFromUnit('f');
        setToUnit('f');
      } else if (activeCategory === 'math') {
        // Math category: from defaults to Number, to always Number
        setFromUnit('num');
        setToUnit('num');
      } else {
        // Default to first unit in sorted list (SI units are sorted first)
        setFromUnit(sorted[0].id);
        setToUnit(sorted[0].id);
      }
      setFromPrefix('none');
      setToPrefix('none');
    }
  }, [activeCategory]);

  // Focus input field on mount and keep it focused
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Smart paste handler - parses pasted text into number and unit
  // Only triggers when NOT focused on input/textarea - allows standard paste to work normally
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      // Get the active element
      const activeElement = document.activeElement as HTMLElement;
      const activeTagName = activeElement?.tagName?.toLowerCase();
      
      // Allow standard paste when focused on input/textarea or contenteditable
      // Do NOT call preventDefault - let browser handle it normally
      if (activeTagName === 'input' || activeTagName === 'textarea' || activeElement?.isContentEditable) {
        return; // Exit early - standard paste will proceed
      }
      
      // Get pasted text for smart parsing (only when not in input fields)
      const pastedText = e.clipboardData?.getData('text');
      if (!pastedText) return;
      
      // Parse the unit text
      const parsed = parseUnitText(pastedText);
      
      // Route based on active tab
      if (activeTab === 'converter') {
        // Converter tab: set from value and optionally switch to matched category/unit
        // Use originalValue to show the user's input as-is with the matched unit
        if (parsed.categoryId && parsed.unitId) {
          setActiveCategory(parsed.categoryId);
          setFromUnit(parsed.unitId);
          setFromPrefix(parsed.prefixId);
        }
        setInputValue(parsed.originalValue.toString());
      } else if (activeTab === 'custom') {
        // Custom tab: set value field and update dimension grid based on parsed dimensions
        setDirectValue(parsed.value.toString());
        
        // Map dimensional formula to exponent grid
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
        
        // Check if any exponent is outside -5..5 range - if so, clear the grid
        const hasOutOfRange = Object.values(newExponents).some(exp => exp < -5 || exp > 5);
        if (hasOutOfRange) {
          // Keep value but clear the dimension grid
          setDirectExponents({ m: 0, kg: 0, s: 0, A: 0, K: 0, mol: 0, cd: 0, rad: 0, sr: 0 });
        } else {
          setDirectExponents(newExponents);
        }
      }
      
      // Prevent default only when we handled smart paste (not in input fields)
      e.preventDefault();
    };
    
    document.addEventListener('paste', handlePaste);
    return () => document.removeEventListener('paste', handlePaste);
  }, [activeTab]);

  // Refocus input after interactions
  const refocusInput = () => {
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  };

  const fromUnitData = categoryData.units.find(u => u.id === fromUnit);
  const toUnitData = categoryData.units.find(u => u.id === toUnit);
  const fromPrefixData = PREFIXES.find(p => p.id === fromPrefix) || PREFIXES.find(p => p.id === 'none') || PREFIXES[0];
  const toPrefixData = PREFIXES.find(p => p.id === toPrefix) || PREFIXES.find(p => p.id === 'none') || PREFIXES[0];

  // Keyboard copy handler - prioritizes calculator result over converter/custom result
  useEffect(() => {
    const handleKeyboardCopy = (e: KeyboardEvent) => {
      // Only handle Ctrl+C or Cmd+C
      if (!((e.ctrlKey || e.metaKey) && e.key === 'c')) return;
      
      // Allow standard copy when text is selected or in input fields
      const activeElement = document.activeElement as HTMLElement;
      const activeTagName = activeElement?.tagName?.toLowerCase();
      const selection = window.getSelection();
      
      if (activeTagName === 'input' || activeTagName === 'textarea' || activeElement?.isContentEditable) {
        return; // Let browser handle standard copy
      }
      
      if (selection && selection.toString().trim()) {
        return; // Let browser handle text selection copy
      }
      
      // Priority 1: Copy from calculator (RPN x or simple result)
      if (calculatorMode === 'rpn' && rpnStack[3]) {
        // Copy RPN x value - use same logic as getRpnResultDisplay to respect selected alternative
        const val = rpnStack[3];
        const siReps = generateSIRepresentations(val.dimensions);
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
        // Copy simple calculator result - use same logic as getCalcResultDisplay to respect selected alternative
        const val = calcValues[3];
        const siReps = generateSIRepresentations(val.dimensions);
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
      
      // Priority 2: Fall back to converter result
      if (activeTab === 'converter' && result !== null && toUnitData) {
        const unitSymbol = toUnitData?.symbol || '';
        const prefixSymbol = (toUnitData?.allowPrefixes && toPrefixData?.id !== 'none') ? toPrefixData.symbol : '';
        const textToCopy = `${formatForClipboard(result, precision)} ${prefixSymbol}${unitSymbol}`;
        
        navigator.clipboard.writeText(textToCopy);
        triggerFlashCopyResult();
        e.preventDefault();
        return;
      }
      
      // Priority 3: Custom tab direct value (if applicable)
      if (activeTab === 'custom' && directValue) {
        const textToCopy = directValue;
        navigator.clipboard.writeText(textToCopy);
        e.preventDefault();
        return;
      }
    };
    
    document.addEventListener('keydown', handleKeyboardCopy);
    return () => document.removeEventListener('keydown', handleKeyboardCopy);
  }, [calculatorMode, rpnStack, calcValues, rpnResultPrefix, rpnSelectedAlternative, resultPrefix, selectedAlternative, calculatorPrecision, activeTab, result, toUnitData, toPrefixData, precision, directValue]);

  // Helper: Map category to dimensional formula
  const getCategoryDimensions = (category: UnitCategory): DimensionalFormula => {
    const dimensionMap: Record<UnitCategory, DimensionalFormula> = {
      length: { length: 1 },
      mass: { mass: 1 },
      time: { time: 1 },
      current: { current: 1 },
      temperature: { temperature: 1 },
      amount: { amount: 1 },
      intensity: { intensity: 1 },
      area: { length: 2 },
      volume: { length: 3 },
      speed: { length: 1, time: -1 },
      acceleration: { length: 1, time: -2 },
      force: { mass: 1, length: 1, time: -2 },
      pressure: { mass: 1, length: -1, time: -2 },
      energy: { mass: 1, length: 2, time: -2 },
      power: { mass: 1, length: 2, time: -3 },
      frequency: { time: -1 },
      charge: { current: 1, time: 1 },
      potential: { mass: 1, length: 2, time: -3, current: -1 },
      capacitance: { mass: -1, length: -2, time: 4, current: 2 },
      resistance: { mass: 1, length: 2, time: -3, current: -2 },
      conductance: { mass: -1, length: -2, time: 3, current: 2 },
      inductance: { mass: 1, length: 2, time: -2, current: -2 },
      magnetic_flux: { mass: 1, length: 2, time: -2, current: -1 },
      magnetic_density: { mass: 1, time: -2, current: -1 },
      radioactivity: { time: -1 },
      radiation_dose: { length: 2, time: -2 },
      equivalent_dose: { length: 2, time: -2 },
      catalytic: { amount: 1, time: -1 },
      angle: { angle: 1 },
      solid_angle: { solid_angle: 1 },
      angular_velocity: { angle: 1, time: -1 },
      momentum: { mass: 1, length: 1, time: -1 },
      angular_momentum: { mass: 1, length: 2, time: -1 },
      luminous_flux: { intensity: 1, solid_angle: 1 },
      illuminance: { intensity: 1, solid_angle: 1, length: -2 },
      luminous_exitance: { intensity: 1, solid_angle: 1, length: -2 },
      luminance: { intensity: 1, length: -2 },
      torque: { mass: 1, length: 2, time: -2 },
      density: { mass: 1, length: -3 },
      flow: { length: 3, time: -1 },
      viscosity: { mass: 1, length: -1, time: -1 },
      surface_tension: { mass: 1, time: -2 },
      thermal_conductivity: { mass: 1, length: 1, time: -3, temperature: -1 },
      specific_heat: { length: 2, time: -2, temperature: -1 },
      entropy: { mass: 1, length: 2, time: -2, temperature: -1 },
      concentration: { amount: 1, length: -3 },
      data: {},
      rack_geometry: { length: 1 },
      shipping: { length: 1 },
      beer_wine_volume: { length: 3 },
      math: {},
      refractive_power: { length: -1 },
      sound_pressure: { mass: 1, length: -1, time: -2 },
      fuel_economy: { length: -2 },
      lightbulb: { intensity: 1, solid_angle: 1 },
      photon: { mass: 1, length: 2, time: -2 },  // Energy dimensions (eV is base unit)
      radioactive_decay: { time: -1 },  // Decay constant λ has dimensions of 1/time
      cross_section: { length: 2 },  // Area (barn = 10^-28 m²)
      kinematic_viscosity: { length: 2, time: -1 },  // m²/s
      electric_field: { mass: 1, length: 1, time: -3, current: -1 },  // V/m = kg⋅m⋅s⁻³⋅A⁻¹
      magnetic_field_h: { current: 1, length: -1 },  // A/m
      sound_intensity: { mass: 1, time: -3 },  // W/m² = kg⋅s⁻³
      acoustic_impedance: { mass: 1, length: -2, time: -1 },  // Pa⋅s/m = kg⋅m⁻²⋅s⁻¹
      fuel: { mass: 1, length: 2, time: -2 },  // Energy (J) = kg⋅m²⋅s⁻²
      archaic_length: { length: 1 },
      archaic_mass: { mass: 1 },
      archaic_volume: { length: 3 },
      archaic_area: { length: 2 },
      archaic_energy: { mass: 1, length: 2, time: -2 },
      archaic_power: { mass: 1, length: 2, time: -3 },
      typography: { length: 1 },  // Length-based (points, picas, etc.)
      cooking: { length: 3 }  // Volume-based (mL, cups, etc.)
    };
    return dimensionMap[category] || {};
  };

  // Helper: Convert from SI base unit to category base unit
  const siToCategoryBase = (value: number, category: UnitCategory): number => {
    const cat = CONVERSION_DATA.find(c => c.id === category);
    if (!cat) return value;
    
    // Find the SI base unit (unit with symbol matching baseSISymbol)
    const siBaseUnit = cat.units.find(u => u.symbol === cat.baseSISymbol);
    if (!siBaseUnit) return value;
    
    // Convert: value is in SI base, multiply by SI unit's factor to get category base
    return value * siBaseUnit.factor;
  };

  // Helper: Convert from category base unit to SI base unit
  const categoryToSIBase = (value: number, category: UnitCategory): number => {
    const cat = CONVERSION_DATA.find(c => c.id === category);
    if (!cat) return value;
    
    // Find the SI base unit (unit with symbol matching baseSISymbol)
    const siBaseUnit = cat.units.find(u => u.symbol === cat.baseSISymbol);
    if (!siBaseUnit) return value;
    
    // Convert: value is in category base, divide by SI unit's factor to get SI base
    return value / siBaseUnit.factor;
  };

  // Alias for backward compatibility with factorization code
  const dimensionsToSymbol = formatDimensions;


  // Helper: Get derived unit symbol from dimensions (for exact matches only)
  const getDerivedUnit = (dims: DimensionalFormula): string => {
    const dimsStr = JSON.stringify(dims);
    
    const derivedUnits: Record<string, string> = {
      // Base units
      [JSON.stringify({ length: 1 })]: 'm',
      [JSON.stringify({ mass: 1 })]: 'kg',
      [JSON.stringify({ time: 1 })]: 's',
      [JSON.stringify({ current: 1 })]: 'A',
      [JSON.stringify({ temperature: 1 })]: 'K',
      [JSON.stringify({ amount: 1 })]: 'mol',
      [JSON.stringify({ intensity: 1 })]: 'cd',
      [JSON.stringify({ angle: 1 })]: 'rad',
      [JSON.stringify({ solid_angle: 1 })]: 'sr',
      // Derived units
      [JSON.stringify({ length: 2 })]: 'm²',
      [JSON.stringify({ length: 3 })]: 'm³',
      [JSON.stringify({ time: -1 })]: 's⁻¹',
      [JSON.stringify({ length: 1, time: -1 })]: 'm/s',
      [JSON.stringify({ length: 1, time: -2 })]: 'm/s²',
      [JSON.stringify({ mass: 1, length: 1, time: -2 })]: 'N',
      [JSON.stringify({ mass: 1, length: -1, time: -2 })]: 'Pa',
      [JSON.stringify({ mass: 1, length: 2, time: -2 })]: 'J',
      [JSON.stringify({ mass: 1, length: 2, time: -3 })]: 'W',
      [JSON.stringify({ current: 1, time: 1 })]: 'C',
      [JSON.stringify({ mass: 1, length: 2, time: -3, current: -1 })]: 'V',
      [JSON.stringify({ mass: -1, length: -2, time: 4, current: 2 })]: 'F',
      [JSON.stringify({ mass: 1, length: 2, time: -3, current: -2 })]: 'Ω',
      [JSON.stringify({ mass: -1, length: -2, time: 3, current: 2 })]: 'S',
      [JSON.stringify({ mass: 1, length: 2, time: -2, current: -2 })]: 'H',
      [JSON.stringify({ mass: 1, length: 2, time: -2, current: -1 })]: 'Wb',
      [JSON.stringify({ mass: 1, time: -2, current: -1 })]: 'T',
      [JSON.stringify({ intensity: 1, solid_angle: 1, length: -2 })]: 'lx',
      [JSON.stringify({ mass: 1, length: -3 })]: 'kg/m³',
      [JSON.stringify({ length: 3, time: -1 })]: 'm³/s',
      [JSON.stringify({ mass: 1, length: -1, time: -1 })]: 'Pa⋅s',
      [JSON.stringify({ mass: 1, time: -2 })]: 'N/m',
      [JSON.stringify({ length: -1 })]: 'm⁻¹',
      [JSON.stringify({ amount: 1, time: -1 })]: 'kat',
      [JSON.stringify({ intensity: 1, solid_angle: 1 })]: 'lm'
    };

    return derivedUnits[dimsStr] || '';
  };

  // Helper to parse number from string with current format
  const parseNumberWithFormat = (str: string): number => {
    return parseNumberWithSpecificFormat(str, numberFormat);
  };

  // Reformat input value when number format changes
  const reformatInputValue = (oldFormat: NumberFormat, newFormat: NumberFormat): void => {
    if (!inputValue || inputValue === '') return;
    
    // Skip reformatting for special formats (DMS, ft'in")
    if (fromUnit === 'deg_dms' || fromUnit === 'ft_in') return;
    
    // Parse with old format
    const numericValue = parseNumberWithSpecificFormat(inputValue, oldFormat);
    
    if (!isNaN(numericValue) && isFinite(numericValue)) {
      // Format with new format
      const reformatted = formatNumberWithSpecificFormat(numericValue, newFormat);
      setInputValue(reformatted);
    }
  };

  // Reformat input value on blur (when leaving the input field)
  const handleInputBlur = (): void => {
    if (!inputValue || inputValue === '') return;
    
    // Skip reformatting for special formats (DMS, ft'in")
    if (fromUnit === 'deg_dms' || fromUnit === 'ft_in') return;
    
    // Parse with current format
    const numericValue = parseNumberWithFormat(inputValue);
    
    if (!isNaN(numericValue) && isFinite(numericValue)) {
      // Reformat with current format to add separators and convert numerals
      const reformatted = formatNumberWithSpecificFormat(numericValue, numberFormat);
      setInputValue(reformatted);
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

  const formatFtIn = (decimalFeet: number): string => {
    const sign = decimalFeet < 0 ? "-" : "";
    const absVal = Math.abs(decimalFeet);
    const ft = Math.floor(absVal);
    const inches = (absVal - ft) * 12;

    const inFixed = toFixedBanker(inches, precision);

    return `${sign}${ft}'${inFixed}"`;
  };

  const parseFtIn = (ftIn: string): number => {
    // Remove quotes and replace with colon for parsing
    const cleaned = ftIn.replace(/['"]/g, ':');
    if (!cleaned.includes(':')) return parseNumberWithFormat(cleaned);
    const parts = cleaned.split(':').map(p => parseNumberWithFormat(p));
    let val = 0;
    if (parts.length > 0) val += parts[0];
    if (parts.length > 1) val += (parts[0] >= 0 ? parts[1] : -parts[1]) / 12;
    return val;
  };

  // Calculate result - never auto-select prefixes, user must choose manually
  useEffect(() => {
    if (!inputValue || !fromUnit || !toUnit) {
      setResult(null);
      return;
    }

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
    
    // Determine prefix factors (1 if not supported or none selected)
    // For special units (DMS/FtIn), we ignore prefixes
    const isSpecialFrom = fromUnit === 'deg_dms' || fromUnit === 'ft_in';
    const isSpecialTo = toUnit === 'deg_dms' || toUnit === 'ft_in';

    const fromFactor = (fromUnitData?.allowPrefixes && fromPrefixData && !isSpecialFrom) ? fromPrefixData.factor : 1;
    const toFactor = (toUnitData?.allowPrefixes && toPrefixData && !isSpecialTo) ? toPrefixData.factor : 1;
    
    const res = convert(val, fromUnit, toUnit, activeCategory, fromFactor, toFactor);
    setResult(res);
  }, [inputValue, fromUnit, toUnit, activeCategory, fromPrefix, toPrefix, fromUnitData, toUnitData, precision]);

  const swapUnits = () => {
    const tempUnit = fromUnit;
    const tempPrefix = fromPrefix;
    setFromUnit(toUnit);
    setFromPrefix(toPrefix);
    setToUnit(tempUnit);
    setToPrefix(tempPrefix);
  };

  // Helper to format number for copying with precision (no thousands separator)
  // Prefers decimal notation, only uses scientific for extreme values
  const formatForClipboard = (num: number, precisionValue: number): string => {
    const format = NUMBER_FORMATS[numberFormat];
    // Apply fixPrecision to remove floating-point artifacts
    const fixed = fixPrecision(num);
    
    if (fixed === 0) {
      return format.useArabicNumerals ? '٠' : '0';
    }
    
    const absNum = Math.abs(fixed);
    
    // Only use scientific notation for truly extreme values
    if (absNum < 1e-12 || absNum >= 1e15) {
      const expStr = fixed.toExponential(Math.min(precisionValue, 10));
      return format.useArabicNumerals ? toArabicNumerals(expStr) : expStr;
    }
    
    // For small values, extend precision to show meaningful digits
    let effectivePrecision = precisionValue;
    if (absNum < 1 && absNum > 0) {
      const magnitude = Math.floor(Math.log10(absNum));
      const neededDecimals = Math.abs(magnitude) + precisionValue;
      effectivePrecision = Math.min(neededDecimals, 12);
    }
    
    // Use precision directly - no magnitude-based limiting
    const formatted = toFixedBanker(fixed, effectivePrecision);
    // Remove trailing zeros after decimal point
    const cleaned = formatted.replace(/(\.\d*?[1-9])0+$/, '$1').replace(/\.0+$/, '');
    // Replace period with format's decimal separator
    return format.decimal !== '.' ? cleaned.replace('.', format.decimal) : cleaned;
  };

  const copyResult = () => {
    if (result !== null && toUnitData && fromUnitData) {
      let textToCopy: string;
      // Always convert result to SI base units for calculator (this works for all categories)
      const valueToCopy = result * toUnitData.factor * (toPrefixData?.factor || 1);
      
      // Special formatting for specific output types
      if (toUnit === 'deg_dms') {
        textToCopy = formatDMS(result);
      } else if (toUnit === 'ft_in') {
        textToCopy = formatFtIn(result);
      } else if (activeCategory === 'lightbulb') {
        // Lightbulb displays the base unit value with precision
        textToCopy = `${formatForClipboard(valueToCopy, precision)} lm`;
      } else {
        // All other categories: display result with unit symbol and precision
        const unitSymbol = toUnitData?.symbol || '';
        const prefixSymbol = (toUnitData?.allowPrefixes && toPrefixData?.id !== 'none') ? toPrefixData.symbol : '';
        textToCopy = `${formatForClipboard(result, precision)} ${prefixSymbol}${unitSymbol}`;
      }
      
      navigator.clipboard.writeText(textToCopy);
      
      // Trigger flash animation
      triggerFlashCopyResult();
      
      // Add to calculator (first three fields only) - convert to SI base units
      // Use appropriate stack based on calculator mode
      const siBaseValue = valueToCopy;
      const bestPrefix = 'none';
      const newEntry = {
        value: siBaseValue,
        dimensions: getCategoryDimensions(activeCategory),
        prefix: bestPrefix
      };
      
      if (calculatorMode === 'rpn') {
        // RPN mode: Push onto stack position x with stack lift
        // Stack lifts: s3 gets old s2, s2 gets old y, y gets old x, new value goes to x
        saveRpnStackForUndo();
        setRpnStack(prev => {
          const newStack = [...prev];
          newStack[0] = prev[1]; // s3 gets old s2
          newStack[1] = prev[2]; // s2 gets old y
          newStack[2] = prev[3]; // y gets old x
          newStack[3] = newEntry; // new value goes to x
          return newStack;
        });
        setRpnResultPrefix('none');
        setRpnSelectedAlternative(0);
        triggerFlashRpnResult();
      } else {
        // UNIT mode: Find first empty field in positions 0-2
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
      const factor = fromUnitData.factor * fromPrefixData.factor;
      navigator.clipboard.writeText(factor.toString());
      triggerFlashFromBaseFactor();
    }
  };

  const copyFromSIBase = () => {
    const siBaseUnits = formatDimensions(getCategoryDimensions(activeCategory));
    if (siBaseUnits) {
      navigator.clipboard.writeText(siBaseUnits);
      triggerFlashFromSIBase();
    }
  };

  const copyToBaseFactor = () => {
    if (toUnitData) {
      const factor = toUnitData.factor * toPrefixData.factor;
      navigator.clipboard.writeText(factor.toString());
      triggerFlashToBaseFactor();
    }
  };

  const copyToSIBase = () => {
    const siBaseUnits = formatDimensions(getCategoryDimensions(activeCategory));
    if (siBaseUnits) {
      navigator.clipboard.writeText(siBaseUnits);
      triggerFlashToSIBase();
    }
  };

  const copyConversionRatio = () => {
    if (result !== null && fromUnitData && toUnitData) {
      const fromPrefixSymbol = (fromUnitData.allowPrefixes && fromPrefixData?.id !== 'none') ? fromPrefixData.symbol : '';
      const toPrefixSymbol = (toUnitData.allowPrefixes && toPrefixData?.id !== 'none') ? toPrefixData.symbol : '';
      const ratio = convert(1, fromUnit, toUnit, activeCategory,
        fromUnitData.allowPrefixes ? fromPrefixData.factor : 1,
        toUnitData.allowPrefixes ? toPrefixData.factor : 1
      );
      // Format ratio with precision using the shared helper
      const formattedRatio = formatForClipboard(ratio, precision);
      
      const ratioText = `1 ${fromPrefixSymbol}${fromUnitData.symbol} = ${formattedRatio} ${toPrefixSymbol}${toUnitData.symbol}`;
      navigator.clipboard.writeText(ratioText);
      triggerFlashConversionRatio();
    }
  };


  // Helper: Find category that matches dimensions
  const findCategoryForDimensions = (dims: DimensionalFormula): UnitCategory | null => {
    for (const cat of CONVERSION_DATA) {
      const catDims = getCategoryDimensions(cat.id);
      if (dimensionsEqual(catDims, dims)) {
        return cat.id;
      }
    }
    return null;
  };

  // Helper: Find best unit for a value (prefer SI units with shortest integer representation)
  const findBestUnit = (value: number, category: UnitCategory): string | null => {
    const cat = CONVERSION_DATA.find(c => c.id === category);
    if (!cat) return null;

    // Define SI units for each category
    const siUnits: Record<string, string[]> = {
      'area': ['m2', 'ha'],
      'volume': ['ml', 'l', 'm3'],
      'length': ['m'],
      'mass': ['kg', 'g'],
      'time': ['s'],
      // Add other categories as needed - most use allowPrefixes for SI units
    };

    let bestUnit: string | null = null;
    let bestScore = Infinity;

    for (const unit of cat.units) {
      const convertedValue = Math.abs(value / unit.factor);
      
      // Check if this is an SI unit
      const isSI = siUnits[category]?.includes(unit.id) || unit.allowPrefixes;
      
      // Only consider SI units
      if (!isSI) continue;
      
      // Calculate the length of the integer part
      const integerPart = Math.floor(convertedValue);
      
      // Prefer values >= 1 (integers), then prefer fewest digits
      let score: number;
      if (convertedValue >= 1) {
        // For values >= 1, score is the number of digits
        const numDigits = integerPart === 0 ? 1 : Math.floor(Math.log10(integerPart)) + 1;
        score = numDigits;
      } else {
        // For values < 1, add a large penalty to avoid fractional results
        score = 1000 + (1 - convertedValue); // Heavily penalize < 1
      }
      
      if (score < bestScore) {
        bestScore = score;
        bestUnit = unit.id;
      }
    }

    return bestUnit;
  };

  // SI representation generation - wrapper for extracted pure function
  const generateSIRepresentations = (dimensions: DimensionalFormula): SIRepresentation[] => {
    return generateSIRepresentationsLib(dimensions, getDimensionSignature, PREFERRED_REPRESENTATIONS);
  };

  // Auto-select multiplication operator when values are entered
  useEffect(() => {
    if (calcValues[0] && calcValues[1] && !calcOp1) {
      setCalcOp1('*');
    }
  }, [calcValues[0], calcValues[1], calcOp1]);

  useEffect(() => {
    if (calcValues[1] && calcValues[2] && !calcOp2) {
      setCalcOp2('*');
    }
  }, [calcValues[1], calcValues[2], calcOp2]);

  // Reset additive operators if dimensions become incompatible (only when both operands exist)
  useEffect(() => {
    if (calcValues[0] && calcValues[1] && (calcOp1 === '+' || calcOp1 === '-') && !canAddSubtract(calcValues[0], calcValues[1])) {
      setCalcOp1(null); // Clear operator so user must re-select
    }
  }, [calcValues[0], calcValues[1], calcOp1]);

  useEffect(() => {
    if (calcValues[1] && calcValues[2] && (calcOp2 === '+' || calcOp2 === '-') && !canAddSubtract(calcValues[1], calcValues[2])) {
      setCalcOp2(null); // Clear operator so user must re-select
    }
  }, [calcValues[1], calcValues[2], calcOp2]);

  // Calculate result field
  useEffect(() => {
    if (calcValues[0]) {
      let resultValue = calcValues[0].value;
      let resultDimensions = { ...calcValues[0].dimensions };
      
      // If we have field 2 and an operator, calculate
      if (calcValues[1] && calcOp1) {
        if (calcOp1 === '*') {
          resultValue = resultValue * calcValues[1].value;
          resultDimensions = multiplyDimensions(resultDimensions, calcValues[1].dimensions);
        } else if (calcOp1 === '/') {
          resultValue = resultValue / calcValues[1].value;
          resultDimensions = divideDimensions(resultDimensions, calcValues[1].dimensions);
        } else if (calcOp1 === '+' && canAddSubtract(calcValues[0], calcValues[1])) {
          resultValue = resultValue + calcValues[1].value;
          // Keep dimensions from non-dimensionless operand
          if (isDimensionless(resultDimensions) && !isDimensionless(calcValues[1].dimensions)) {
            resultDimensions = { ...calcValues[1].dimensions };
          }
        } else if (calcOp1 === '-' && canAddSubtract(calcValues[0], calcValues[1])) {
          resultValue = resultValue - calcValues[1].value;
          // Keep dimensions from non-dimensionless operand
          if (isDimensionless(resultDimensions) && !isDimensionless(calcValues[1].dimensions)) {
            resultDimensions = { ...calcValues[1].dimensions };
          }
        }
        
        // If we have field 3 and operator, continue calculation
        if (calcValues[2] && calcOp2) {
          if (calcOp2 === '*') {
            resultValue = resultValue * calcValues[2].value;
            resultDimensions = multiplyDimensions(resultDimensions, calcValues[2].dimensions);
          } else if (calcOp2 === '/') {
            resultValue = resultValue / calcValues[2].value;
            resultDimensions = divideDimensions(resultDimensions, calcValues[2].dimensions);
          } else if (calcOp2 === '+' && canAddSubtract(calcValues[1], calcValues[2])) {
            resultValue = resultValue + calcValues[2].value;
            // Keep dimensions from non-dimensionless operand
            if (isDimensionless(resultDimensions) && !isDimensionless(calcValues[2].dimensions)) {
              resultDimensions = { ...calcValues[2].dimensions };
            }
          } else if (calcOp2 === '-' && canAddSubtract(calcValues[1], calcValues[2])) {
            resultValue = resultValue - calcValues[2].value;
            // Keep dimensions from non-dimensionless operand
            if (isDimensionless(resultDimensions) && !isDimensionless(calcValues[2].dimensions)) {
              resultDimensions = { ...calcValues[2].dimensions };
            }
          }
        }
      }
      
      // Check if result is dimensionless (unitless)
      const resultIsDimensionless = Object.keys(resultDimensions).length === 0;
      
      setCalcValues(prev => {
        const newValues = [...prev];
        newValues[3] = {
          value: resultValue,
          dimensions: resultDimensions,
          prefix: 'none'
        };
        return newValues;
      });

      // Reset to SI base representation (index 0) and no prefix
      // The SI representation dropdown will show all SI compositions
      setResultPrefix('none');
      setSelectedAlternative(0);
      // Keep resultCategory/resultUnit for potential future use, but not used in SI-only mode
      setResultCategory(null);
      setResultUnit(null);
    } else if (calcValues[3] !== null) {
      setCalcValues(prev => {
        const newValues = [...prev];
        newValues[3] = null;
        return newValues;
      });
      setResultUnit(null);
      setResultCategory(null);
    }
  }, [calcValues[0], calcValues[1], calcValues[2], calcOp1, calcOp2]);

  // Always reset prefix to 'none' when the result unit changes
  // Prefixes should never be automatically chosen - user must select manually
  useEffect(() => {
    if (resultCategory && calcValues[3]) {
      setResultPrefix('none');
    }
  }, [resultUnit]);

  const clearCalculator = () => {
    setCalcValues([null, null, null, null]);
    setCalcOp1(null);
    setCalcOp2(null);
    setResultUnit(null);
    setResultCategory(null);
    setResultPrefix('none');
  };

  const clearField1 = () => {
    setCalcValues(prev => {
      const newValues = [...prev];
      newValues[0] = null;
      return newValues;
    });
    setCalcOp1(null);
  };

  const clearField2 = () => {
    setCalcValues(prev => {
      const newValues = [...prev];
      newValues[1] = null;
      return newValues;
    });
    setCalcOp2(null);
  };

  const clearField3 = () => {
    setCalcValues(prev => {
      const newValues = [...prev];
      newValues[2] = null;
      return newValues;
    });
  };

  // RPN Calculator functions
  
  // Save current stack before any operation (for undo)
  const saveRpnStackForUndo = () => {
    setPreviousRpnStack([...rpnStack]);
  };
  
  // Undo: swap current stack with previous stack (pressing twice = redo)
  const undoRpnStack = () => {
    const temp = [...rpnStack];
    setRpnStack([...previousRpnStack]);
    setPreviousRpnStack(temp);
  };
  
  const clearRpnStack = () => {
    saveRpnStackForUndo();
    setRpnStack([null, null, null, null]);
    setRpnResultPrefix('none');
    setRpnSelectedAlternative(0);
  };

  const clearRpnTop = () => {
    // Clear the top non-null entry in the stack
    saveRpnStackForUndo();
    setRpnStack(prev => {
      const newStack = [...prev];
      // Find the last non-null entry (highest index with data)
      for (let i = 2; i >= 0; i--) {
        if (newStack[i] !== null) {
          newStack[i] = null;
          break;
        }
      }
      return newStack;
    });
  };

  const pushToRpnStack = () => {
    // Standard RPN ENTER: lift stack and duplicate x
    // s3 gets old s2, s2 gets old y, y gets old x, x stays same
    if (!rpnStack[3]) return;
    saveRpnStackForUndo();
    setRpnStack(prev => {
      const newStack = [...prev];
      newStack[0] = prev[1]; // s3 <- s2
      newStack[1] = prev[2]; // s2 <- y
      newStack[2] = prev[3]; // y <- x
      // newStack[3] stays as x (duplicated)
      return newStack;
    });
  };

  const dropRpnStack = () => {
    // Drop: pushes s3 down the stack, duplicating top, x becomes old y
    // s3 stays (duplicated), s2 <- s3, y <- s2, x <- y
    saveRpnStackForUndo();
    setRpnStack(prev => {
      const newStack = [...prev];
      // s3 stays the same (newStack[0] = prev[0])
      newStack[1] = prev[0]; // s2 <- s3
      newStack[2] = prev[1]; // y <- s2
      newStack[3] = prev[2]; // x <- y
      return newStack;
    });
  };

  // Swap X and Y registers (x⇆y)
  const swapRpnXY = () => {
    if (!rpnStack[3] || !rpnStack[2]) return;
    saveRpnStackForUndo();
    setRpnStack(prev => {
      const newStack = [...prev];
      newStack[3] = prev[2]; // x <- y
      newStack[2] = prev[3]; // y <- x
      return newStack;
    });
  };

  // Recall LASTx - push lastX value onto stack
  const recallLastX = () => {
    if (!lastX) return;
    saveRpnStackForUndo();
    // Stack lift: push lastX onto x, old values shift up
    setRpnStack(prev => {
      const newStack = [...prev];
      newStack[0] = prev[1]; // s3 <- s2
      newStack[1] = prev[2]; // s2 <- y
      newStack[2] = prev[3]; // y <- x
      newStack[3] = lastX;   // x <- lastX
      return newStack;
    });
  };

  // Pull result from Converter or Custom tab onto RPN stack
  const pullFromPane = () => {
    let newEntry: CalcValue | null = null;
    
    if (activeTab === 'converter') {
      // Pull from Converter tab
      if (result !== null && toUnitData) {
        const siBaseValue = result * toUnitData.factor * (toPrefixData?.factor || 1);
        newEntry = {
          value: siBaseValue,
          dimensions: getCategoryDimensions(activeCategory),
          prefix: 'none'
        };
      }
    } else if (activeTab === 'custom') {
      // Pull from Custom tab
      const numValue = parseNumberWithFormat(directValue);
      if (!isNaN(numValue) && directValue) {
        const dims = buildDirectDimensions();
        newEntry = {
          value: numValue,
          dimensions: dims,
          prefix: 'none'
        };
      }
    }
    
    if (!newEntry) return;
    
    // Push onto RPN stack with stack lift
    saveRpnStackForUndo();
    setRpnStack(prev => {
      const newStack = [...prev];
      newStack[0] = prev[1]; // s3 <- s2
      newStack[1] = prev[2]; // s2 <- y
      newStack[2] = prev[3]; // y <- x
      newStack[3] = newEntry; // x <- pulled value
      return newStack;
    });
    setRpnResultPrefix('none');
    setRpnSelectedAlternative(0);
    triggerFlashRpnResult();
  };

  // RPN unary operation types
  type RpnUnaryOp = 
    | 'square' | 'cube' | 'sqrt' | 'cbrt' | 'recip'
    | 'exp' | 'ln' | 'pow10' | 'log10' | 'pow2' | 'log2'
    | 'sin' | 'cos' | 'tan' | 'asin' | 'acos' | 'atan'
    | 'sinh' | 'cosh' | 'tanh' | 'asinh' | 'acosh' | 'atanh'
    | 'rnd' | 'trunc' | 'floor' | 'ceil'
    | 'neg' | 'abs';
  
  // Helper to check if dimensions represent exactly radians (angle: 1, all others 0 or undefined)
  const isRadians = (dimensions: DimensionalFormula): boolean => {
    // Must have angle = 1
    if (dimensions.angle !== 1) return false;
    // All other dimensions must be 0 or undefined
    for (const [key, value] of Object.entries(dimensions)) {
      if (key === 'angle') continue;
      if (value !== 0 && value !== undefined) return false;
    }
    return true;
  };

  // Apply unary operation to RPN x register (stack[3])
  const applyRpnUnary = (op: RpnUnaryOp) => {
    if (!rpnStack[3]) return;
    saveRpnStackForUndo();
    
    // Save X to lastX before operation
    setLastX(rpnStack[3]);
    
    const x = rpnStack[3];
    let newValue: number;
    let newDimensions: Record<string, number> = {};
    
    switch (op) {
      // Power operations (multiply unit exponents)
      case 'square':
        newValue = fixPrecision(x.value * x.value);
        for (const [dim, exp] of Object.entries(x.dimensions)) {
          newDimensions[dim] = exp * 2;
        }
        break;
      case 'cube':
        newValue = fixPrecision(x.value * x.value * x.value);
        for (const [dim, exp] of Object.entries(x.dimensions)) {
          newDimensions[dim] = exp * 3;
        }
        break;
      
      // Root operations - divide exponents with round-up for non-integer results
      // Per user requirement: sqrt(m²)→m¹, sqrt(m³)→m², sqrt(m⁴)→m², cbrt(m³)→m¹, cbrt(m⁴)→m², etc.
      case 'sqrt':
        if (x.value < 0) return;
        newValue = fixPrecision(Math.sqrt(x.value));
        for (const [dim, exp] of Object.entries(x.dimensions)) {
          // E/2, round up: E=2→1, E=3→2, E=4→2
          newDimensions[dim] = Math.ceil(exp / 2);
        }
        break;
      case 'cbrt':
        newValue = fixPrecision(Math.cbrt(x.value));
        for (const [dim, exp] of Object.entries(x.dimensions)) {
          // E/3, round up: E=1,2,3→1, E=4,5→2
          newDimensions[dim] = Math.ceil(exp / 3);
        }
        break;
      
      // Exponential/logarithmic (operate on numeric value, pass units through)
      case 'exp':
        newValue = fixPrecision(Math.exp(x.value));
        newDimensions = { ...x.dimensions };
        break;
      case 'ln':
        if (x.value <= 0) return;
        newValue = fixPrecision(Math.log(x.value));
        newDimensions = { ...x.dimensions };
        break;
      case 'pow10':
        newValue = fixPrecision(Math.pow(10, x.value));
        newDimensions = { ...x.dimensions };
        break;
      case 'log10':
        if (x.value <= 0) return;
        newValue = fixPrecision(Math.log10(x.value));
        newDimensions = { ...x.dimensions };
        break;
      case 'pow2':
        newValue = fixPrecision(Math.pow(2, x.value));
        newDimensions = { ...x.dimensions };
        break;
      case 'log2':
        if (x.value <= 0) return;
        newValue = fixPrecision(Math.log2(x.value));
        newDimensions = { ...x.dimensions };
        break;
      
      // Rounding functions (use precision setting, preserve dimensions)
      case 'rnd': {
        // Round to nearest even at precision decimal places
        const factor = Math.pow(10, calculatorPrecision);
        const scaled = x.value * factor;
        // Round to nearest even (banker's rounding)
        const rounded = Math.round(scaled);
        // Check if exactly halfway - if so, round to even
        if (Math.abs(scaled - Math.floor(scaled) - 0.5) < 1e-10) {
          const floor = Math.floor(scaled);
          newValue = (floor % 2 === 0 ? floor : floor + 1) / factor;
        } else {
          newValue = rounded / factor;
        }
        newDimensions = { ...x.dimensions };
        break;
      }
      case 'trunc': {
        // Truncate at precision decimal places
        const factor = Math.pow(10, calculatorPrecision);
        newValue = Math.trunc(x.value * factor) / factor;
        newDimensions = { ...x.dimensions };
        break;
      }
      case 'floor': {
        // Floor at precision decimal places
        const factor = Math.pow(10, calculatorPrecision);
        newValue = Math.floor(x.value * factor) / factor;
        newDimensions = { ...x.dimensions };
        break;
      }
      case 'ceil': {
        // Ceiling at precision decimal places
        const factor = Math.pow(10, calculatorPrecision);
        newValue = Math.ceil(x.value * factor) / factor;
        newDimensions = { ...x.dimensions };
        break;
      }
      
      // Sign change - negate the value, preserve X's dimensions
      case 'neg': {
        newValue = -x.value;
        newDimensions = { ...x.dimensions };
        break;
      }
      
      case 'abs': {
        newValue = Math.abs(x.value);
        newDimensions = { ...x.dimensions };
        break;
      }
      
      // Reciprocal - 1/x, inverts unit exponents
      case 'recip': {
        if (x.value === 0) return; // Division by zero
        newValue = fixPrecision(1 / x.value);
        for (const [dim, exp] of Object.entries(x.dimensions)) {
          newDimensions[dim] = -exp;
        }
        break;
      }
      
      // Forward trigonometric functions:
      // - If input is rad → output is unitless
      // - Otherwise → preserve input units (operate on numeric only)
      case 'sin': {
        newValue = fixPrecision(Math.sin(x.value));
        if (isRadians(x.dimensions)) {
          newDimensions = {}; // unitless output
        } else {
          newDimensions = { ...x.dimensions }; // preserve input units
        }
        break;
      }
      case 'cos': {
        newValue = fixPrecision(Math.cos(x.value));
        if (isRadians(x.dimensions)) {
          newDimensions = {}; // unitless output
        } else {
          newDimensions = { ...x.dimensions }; // preserve input units
        }
        break;
      }
      case 'tan': {
        newValue = fixPrecision(Math.tan(x.value));
        if (isRadians(x.dimensions)) {
          newDimensions = {}; // unitless output
        } else {
          newDimensions = { ...x.dimensions }; // preserve input units
        }
        break;
      }
      
      // Inverse trig functions:
      // - If input is unitless → output is rad
      // - Otherwise → preserve input units (operate on numeric only)
      case 'asin': {
        if (x.value < -1 || x.value > 1) return;
        newValue = fixPrecision(Math.asin(x.value));
        if (isDimensionless(x.dimensions)) {
          newDimensions = { angle: 1 }; // output rad
        } else {
          newDimensions = { ...x.dimensions }; // preserve input units
        }
        break;
      }
      case 'acos': {
        if (x.value < -1 || x.value > 1) return;
        newValue = fixPrecision(Math.acos(x.value));
        if (isDimensionless(x.dimensions)) {
          newDimensions = { angle: 1 }; // output rad
        } else {
          newDimensions = { ...x.dimensions }; // preserve input units
        }
        break;
      }
      case 'atan': {
        newValue = fixPrecision(Math.atan(x.value));
        if (isDimensionless(x.dimensions)) {
          newDimensions = { angle: 1 }; // output rad
        } else {
          newDimensions = { ...x.dimensions }; // preserve input units
        }
        break;
      }
      
      // Forward hyperbolic functions:
      // - If input is rad → output is unitless
      // - Otherwise → preserve input units (operate on numeric only)
      case 'sinh': {
        newValue = fixPrecision(Math.sinh(x.value));
        if (isRadians(x.dimensions)) {
          newDimensions = {}; // unitless output
        } else {
          newDimensions = { ...x.dimensions }; // preserve input units
        }
        break;
      }
      case 'cosh': {
        newValue = fixPrecision(Math.cosh(x.value));
        if (isRadians(x.dimensions)) {
          newDimensions = {}; // unitless output
        } else {
          newDimensions = { ...x.dimensions }; // preserve input units
        }
        break;
      }
      case 'tanh': {
        newValue = fixPrecision(Math.tanh(x.value));
        if (isRadians(x.dimensions)) {
          newDimensions = {}; // unitless output
        } else {
          newDimensions = { ...x.dimensions }; // preserve input units
        }
        break;
      }
      
      // Inverse hyperbolic functions:
      // - If input is unitless → output is rad
      // - Otherwise → preserve input units (operate on numeric only)
      case 'asinh': {
        newValue = fixPrecision(Math.asinh(x.value));
        if (isDimensionless(x.dimensions)) {
          newDimensions = { angle: 1 }; // output rad
        } else {
          newDimensions = { ...x.dimensions }; // preserve input units
        }
        break;
      }
      case 'acosh': {
        if (x.value < 1) return;
        newValue = fixPrecision(Math.acosh(x.value));
        if (isDimensionless(x.dimensions)) {
          newDimensions = { angle: 1 }; // output rad
        } else {
          newDimensions = { ...x.dimensions }; // preserve input units
        }
        break;
      }
      case 'atanh': {
        if (x.value <= -1 || x.value >= 1) return;
        newValue = fixPrecision(Math.atanh(x.value));
        if (isDimensionless(x.dimensions)) {
          newDimensions = { angle: 1 }; // output rad
        } else {
          newDimensions = { ...x.dimensions }; // preserve input units
        }
        break;
      }
      
      default:
        return;
    }
    
    // Clean up zero exponents
    for (const [dim, exp] of Object.entries(newDimensions)) {
      if (exp === 0) delete newDimensions[dim];
    }
    
    setRpnStack(prev => {
      const newStack = [...prev];
      newStack[3] = {
        value: newValue,
        dimensions: newDimensions,
        prefix: 'none'
      };
      return newStack;
    });
    setRpnResultPrefix('none');
    setRpnSelectedAlternative(0);
    triggerFlashRpnResult();
  };

  // RPN binary operation types
  type RpnBinaryOp = 'mul' | 'div' | 'add' | 'sub' | 'mulUnit' | 'divUnit' | 'addUnit' | 'subUnit' | 'pow';

  // Check if binary operation can be performed
  const canApplyRpnBinary = (op: RpnBinaryOp): boolean => {
    if (!rpnStack[2] || !rpnStack[3]) return false;
    
    // Unit-aware add/sub require compatible dimensions
    if (op === 'addUnit' || op === 'subUnit') {
      const y = rpnStack[2];
      const x = rpnStack[3];
      // Compatible if: same dimensions, or either is dimensionless
      return dimensionsEqual(y.dimensions, x.dimensions) || 
             isDimensionless(y.dimensions) || 
             isDimensionless(x.dimensions);
    }
    
    return true;
  };

  // Apply binary operation to RPN x and y registers
  // y is stack[2], x is stack[3], result goes to x, stack drops
  const applyRpnBinary = (op: RpnBinaryOp) => {
    if (!rpnStack[2] || !rpnStack[3]) return;
    saveRpnStackForUndo();
    
    // Save X to lastX before operation
    setLastX(rpnStack[3]);
    
    const y = rpnStack[2];
    const x = rpnStack[3];
    let newValue: number;
    let newDimensions: Record<string, number> = {};
    
    switch (op) {
      // Numeric-only operations (preserve X's dimensions)
      case 'mul':
        newValue = fixPrecision(y.value * x.value);
        newDimensions = { ...x.dimensions };
        break;
      case 'div':
        if (x.value === 0) return; // Prevent division by zero
        newValue = fixPrecision(y.value / x.value);
        newDimensions = { ...x.dimensions };
        break;
      case 'add':
        newValue = fixPrecision(y.value + x.value);
        newDimensions = { ...x.dimensions };
        break;
      case 'sub':
        newValue = fixPrecision(y.value - x.value);
        newDimensions = { ...x.dimensions };
        break;
      
      // Unit-aware operations
      case 'mulUnit':
        newValue = fixPrecision(y.value * x.value);
        // Multiply dimensions: add exponents
        // First copy y's dimensions
        for (const dim of Object.keys(y.dimensions)) {
          newDimensions[dim] = (y.dimensions as Record<string, number>)[dim] || 0;
        }
        // Then add x's dimensions
        for (const dim of Object.keys(x.dimensions)) {
          const xExp = (x.dimensions as Record<string, number>)[dim] || 0;
          newDimensions[dim] = (newDimensions[dim] || 0) + xExp;
        }
        break;
      case 'divUnit':
        if (x.value === 0) return; // Prevent division by zero
        newValue = fixPrecision(y.value / x.value);
        // Divide dimensions: subtract exponents
        // First copy y's dimensions
        for (const dim of Object.keys(y.dimensions)) {
          newDimensions[dim] = (y.dimensions as Record<string, number>)[dim] || 0;
        }
        // Then subtract x's dimensions
        for (const dim of Object.keys(x.dimensions)) {
          const xExp = (x.dimensions as Record<string, number>)[dim] || 0;
          newDimensions[dim] = (newDimensions[dim] || 0) - xExp;
        }
        break;
      case 'addUnit':
        // Only valid if dimensions match or one is dimensionless
        if (!dimensionsEqual(y.dimensions, x.dimensions) && 
            !isDimensionless(y.dimensions) && !isDimensionless(x.dimensions)) {
          return;
        }
        newValue = fixPrecision(y.value + x.value);
        // Use the non-dimensionless one, or x if both have dimensions
        newDimensions = isDimensionless(x.dimensions) ? { ...y.dimensions } : { ...x.dimensions };
        break;
      case 'subUnit':
        // Only valid if dimensions match or one is dimensionless
        if (!dimensionsEqual(y.dimensions, x.dimensions) && 
            !isDimensionless(y.dimensions) && !isDimensionless(x.dimensions)) {
          return;
        }
        newValue = fixPrecision(y.value - x.value);
        // Use the non-dimensionless one, or x if both have dimensions
        newDimensions = isDimensionless(x.dimensions) ? { ...y.dimensions } : { ...x.dimensions };
        break;
      
      // Power: y^x - x must be dimensionless, result dimensions are y's dimensions multiplied by x
      case 'pow': {
        // x (exponent) must be dimensionless for physical meaning
        if (!isDimensionless(x.dimensions)) return;
        // Handle special cases
        if (y.value === 0 && x.value < 0) return; // 0 to negative power is undefined
        if (y.value < 0 && !Number.isInteger(x.value)) return; // Negative base with non-integer exponent
        newValue = fixPrecision(Math.pow(y.value, x.value));
        // Multiply y's dimension exponents by x (the power)
        for (const [dim, exp] of Object.entries(y.dimensions)) {
          const newExp = exp * x.value;
          if (newExp !== 0) {
            newDimensions[dim] = newExp;
          }
        }
        break;
      }
      
      default:
        return;
    }
    
    // Clean up zero exponents
    for (const [dim, exp] of Object.entries(newDimensions)) {
      if (exp === 0) delete newDimensions[dim];
    }
    
    // Drop stack: s3→s2, s2→y, result→x
    setRpnStack(prev => {
      const newStack = [...prev];
      newStack[3] = {
        value: newValue,
        dimensions: newDimensions,
        prefix: 'none'
      };
      newStack[2] = prev[1]; // s2 → y
      newStack[1] = prev[0]; // s3 → s2
      newStack[0] = null;    // s3 becomes empty
      return newStack;
    });
    setRpnResultPrefix('none');
    setRpnSelectedAlternative(0);
    triggerFlashRpnResult();
  };

  // Push a constant value onto the RPN stack (dimensionless)
  const pushRpnConstant = (value: number) => {
    saveRpnStackForUndo();
    setRpnStack(prev => {
      const newStack = [...prev];
      // Lift stack: each position moves up one
      newStack[0] = prev[1]; // s3 gets old s2
      newStack[1] = prev[2]; // s2 gets old y
      newStack[2] = prev[3]; // y gets old x
      newStack[3] = {
        value,
        dimensions: {},
        prefix: 'none'
      };
      return newStack;
    });
    setRpnResultPrefix('none');
    setRpnSelectedAlternative(0);
    triggerFlashRpnResult();
  };

  // Get RPN result display (similar to getCalcResultDisplay but for RPN)
  const getRpnResultDisplay = () => {
    if (!rpnStack[3]) return null;
    const val = rpnStack[3];
    
    const siReps = generateSIRepresentations(val.dimensions);
    const currentSymbol = siReps[rpnSelectedAlternative]?.displaySymbol || formatDimensions(val.dimensions);
    
    // Treat '1' (dimensionless) as empty - same as y/s2/s3 display behavior
    if (currentSymbol === '1' || !currentSymbol) {
      const formattedValue = formatNumberWithSeparators(val.value, calculatorPrecision);
      return {
        formattedValue,
        unitSymbol: ''
      };
    }
    
    const kgResult = applyPrefixToKgUnit(currentSymbol, rpnResultPrefix);
    const displayValue = val.value / kgResult.effectivePrefixFactor;
    
    const formattedValue = formatNumberWithSeparators(displayValue, calculatorPrecision);
    
    // Include prefix symbol in unit display when showPrefix is true
    const prefixData = PREFIXES.find(p => p.id === rpnResultPrefix);
    const prefixSymbol = kgResult.showPrefix && prefixData ? prefixData.symbol : '';
    
    return {
      formattedValue,
      unitSymbol: prefixSymbol + kgResult.displaySymbol
    };
  };

  const copyRpnResult = () => {
    const display = getRpnResultDisplay();
    if (!display) return;
    
    // Clean up the formatted value for clipboard
    const cleanValue = display.formattedValue.replace(/,/g, '');
    const textToCopy = display.unitSymbol ? `${cleanValue} ${display.unitSymbol}` : cleanValue;
    
    navigator.clipboard.writeText(textToCopy);
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
    
    // Include prefix symbol when showPrefix is true
    const prefixData = PREFIXES.find(p => p.id === val.prefix);
    const prefixSymbol = kgResult.showPrefix && prefixData ? prefixData.symbol : '';
    const unitSymbol = prefixSymbol + kgResult.displaySymbol;
    const textToCopy = unitSymbol ? `${cleanValue} ${unitSymbol}` : cleanValue;
    
    navigator.clipboard.writeText(textToCopy);
    
    if (index === 0) {
      triggerFlashRpnField1();
    } else if (index === 1) {
      triggerFlashRpnField2();
    } else if (index === 2) {
      triggerFlashRpnField3();
    }
  };

  // Mode switching handlers with data transfer
  // RPN stack naming: x=stack[3] (bottom/result), y=stack[2], s2=stack[1], s3=stack[0] (top)
  // Simple calculator: field1=calcValues[0] (top), field2=calcValues[1], field3=calcValues[2], result=calcValues[3]
  const switchToRpn = () => {
    // Clear stack, copy result to X
    saveRpnStackForUndo();
    const newRpnStack: typeof rpnStack = [
      null, // s3 = cleared
      null, // s2 = cleared
      null, // y = cleared
      calcValues[3]  // x = result
    ];
    setRpnStack(newRpnStack);
    setRpnResultPrefix('none');
    setRpnSelectedAlternative(0);
    setCalculatorMode('rpn');
  };

  const switchToSimple = () => {
    // Clear all simple fields and copy X to top field
    const newCalcValues: typeof calcValues = [
      rpnStack[3], // top field = x
      null,
      null,
      null
    ];
    setCalcValues(newCalcValues);
    setCalcOp1(null);
    setCalcOp2(null);
    setResultPrefix('none');
    setSelectedAlternative(0);
    setCalculatorMode('simple');
  };

  // Helper to fix floating-point precision artifacts
  // Only cleans up obvious artifacts, doesn't truncate valid precision
  const fixPrecision = (num: number): number => {
    if (num === 0) return 0;
    if (!isFinite(num)) return num;
    
    // Use JavaScript's full 17 significant digit precision 
    // to preserve as much user-entered precision as possible
    const result = parseFloat(num.toPrecision(17));
    return result;
  };

  // Helper to get formatted calculator result display (shared by UI and copy function)
  // Returns { formattedValue: string, unitSymbol: string } or null if no result
  const getCalcResultDisplay = () => {
    if (!calcValues[3]) return null;
    const val = calcValues[3];
    
    // Get SI representation
    const siReps = generateSIRepresentations(val.dimensions);
    const currentSymbol = siReps[selectedAlternative]?.displaySymbol || formatDimensions(val.dimensions);
    
    // Apply kg prefix handoff
    const kgResult = applyPrefixToKgUnit(currentSymbol, resultPrefix);
    const displayValue = val.value / kgResult.effectivePrefixFactor;
    
    // Format value
    const formattedValue = formatNumberWithSeparators(displayValue, calculatorPrecision);
    
    // Include prefix symbol in unit display when showPrefix is true
    const prefixData = PREFIXES.find(p => p.id === resultPrefix);
    const prefixSymbol = kgResult.showPrefix && prefixData ? prefixData.symbol : '';
    
    return {
      formattedValue,
      unitSymbol: prefixSymbol + kgResult.displaySymbol
    };
  };

  const copyCalcResult = () => {
    const display = getCalcResultDisplay();
    if (!display) return;
    
    // Copy the exact text shown in the result field
    const textToCopy = display.unitSymbol 
      ? `${display.formattedValue} ${display.unitSymbol}` 
      : display.formattedValue;
    navigator.clipboard.writeText(textToCopy);
    
    // Trigger flash animation
    triggerFlashCopyCalc();
  };

  // Helper to clean up trailing zeros from decimal numbers
  const cleanNumber = (num: number, precision: number): string => {
    // First apply fixPrecision to remove floating-point artifacts
    const fixed = fixPrecision(num);
    
    // For small values, extend precision to show meaningful digits
    let effectivePrecision = precision;
    const absNum = Math.abs(fixed);
    if (absNum > 0 && absNum < 1) {
      const magnitude = Math.floor(Math.log10(absNum));
      const neededDecimals = Math.abs(magnitude) + precision;
      effectivePrecision = Math.min(neededDecimals, 12);
    }
    
    // Use precision directly - no magnitude-based limiting for large numbers
    const formatted = toFixedBanker(fixed, effectivePrecision);
    // Remove trailing zeros after decimal point
    const cleaned = formatted.replace(/(\.\d*?[1-9])0+$/, '$1').replace(/\.0+$/, '');
    return cleaned;
  };

  // Copy calculator field to clipboard and flash
  const copyCalcField = (fieldIndex: number) => {
    const val = calcValues[fieldIndex];
    if (!val) return;
    
    // Use formatDimensions to get pure SI base units (kg, m, s, etc.) instead of derived units
    const baseUnitSymbol = formatDimensions(val.dimensions);
    // Apply kg prefix handoff: kg + prefix → prefixed-g (e.g., kg + milli → mg)
    const kgResult = applyPrefixToKgUnit(baseUnitSymbol, val.prefix);
    const displayValue = fixPrecision(val.value / kgResult.effectivePrefixFactor);
    
    // Include prefix symbol when showPrefix is true
    const prefixData = PREFIXES.find(p => p.id === val.prefix);
    const prefixSymbol = kgResult.showPrefix && prefixData ? prefixData.symbol : '';
    const unitSymbol = prefixSymbol + kgResult.displaySymbol;
    
    // Copy with only decimal separator, no thousands separator
    const format = NUMBER_FORMATS[numberFormat];
    const valueStr = cleanNumber(displayValue, calculatorPrecision);
    const formattedStr = format.decimal !== '.' ? valueStr.replace('.', format.decimal) : valueStr;
    const textToCopy = unitSymbol ? `${formattedStr} ${unitSymbol}` : formattedStr;
    navigator.clipboard.writeText(textToCopy);
    
    // Trigger flash animation for the specific field
    if (fieldIndex === 0) {
      triggerFlashCalcField1();
    } else if (fieldIndex === 1) {
      triggerFlashCalcField2();
    } else if (fieldIndex === 2) {
      triggerFlashCalcField3();
    }
  };

  // Helper to format number with separators based on selected format
  // Prefers decimal notation, only uses scientific for extreme values
  const formatNumberWithSeparators = (num: number, precision: number): string => {
    const format = NUMBER_FORMATS[numberFormat];
    
    // Handle zero
    if (num === 0) {
      return format.useArabicNumerals ? '٠' : '0';
    }
    
    const absNum = Math.abs(num);
    
    // Only use scientific notation for truly extreme values
    if (absNum < 1e-12 || absNum >= 1e15) {
      const expStr = num.toExponential(Math.min(precision, 10));
      return format.useArabicNumerals ? toArabicNumerals(expStr) : expStr;
    }
    
    // cleanNumber already applies fixPrecision internally
    const cleaned = cleanNumber(num, precision);
    const [integer, decimal] = cleaned.split('.');
    
    // Add thousands separator if format has one
    let formattedInteger = integer;
    if (format.thousands) {
      if (numberFormat === 'south-asian') {
        // Indian numbering system: 3-2-2 grouping (e.g., 12,34,56,789)
        // First separator after 3 digits from right, then every 2 digits
        const reversed = integer.split('').reverse().join('');
        let result = '';
        for (let i = 0; i < reversed.length; i++) {
          if (i === 3 || (i > 3 && (i - 3) % 2 === 0)) {
            result += format.thousands;
          }
          result += reversed[i];
        }
        formattedInteger = result.split('').reverse().join('');
      } else if (format.myriad) {
        // Myriad grouping: 4-4-4 grouping (e.g., 1,2345,6789)
        formattedInteger = integer.replace(/\B(?=(\d{4})+(?!\d))/g, format.thousands);
      } else {
        // Standard 3-3-3 grouping for other formats
        formattedInteger = integer.replace(/\B(?=(\d{3})+(?!\d))/g, format.thousands);
      }
    }
    
    // Use format's decimal separator
    let result = decimal ? `${formattedInteger}${format.decimal}${decimal}` : formattedInteger;
    
    // Convert to Arabic numerals if format requires it
    if (format.useArabicNumerals) {
      result = toArabicNumerals(result);
    }
    
    return result;
  };

  const formatFactor = (f: number) => {
    const format = NUMBER_FORMATS[numberFormat];
    if (f === 1) {
      return format.useArabicNumerals ? '١' : '1';
    }
    if (f >= 1e9 || f <= 1e-8) {
      const expStr = f.toExponential(7);
      return format.useArabicNumerals ? `×${toArabicNumerals(expStr)}` : `×${expStr}`;
    }
    
    // Format with up to 9 total digits and 8 decimal places
    // Use toPrecision for total significant figures, then clean up
    const str = f.toPrecision(9);
    const num = parseFloat(str);
    
    // Format with up to 8 decimal places, removing trailing zeros
    const formatted = formatNumberWithSeparators(num, 8);
    return `×${formatted}`;
  };

  // Helper to format result - prefers decimal notation, only uses scientific for extreme values
  // Uses scientific notation only when:
  // 1. Value is extremely small (< 1e-12, beyond reasonable display)
  // 2. Value is extremely large (>= 1e15, beyond typical display)
  const formatResultValue = (num: number, precisionValue: number): string => {
    const format = NUMBER_FORMATS[numberFormat];
    if (num === 0) {
      return format.useArabicNumerals ? '٠' : '0';
    }
    const absNum = Math.abs(num);
    
    // Only use scientific notation for truly extreme values
    if (absNum < 1e-12 || absNum >= 1e15) {
      const expStr = num.toExponential(Math.min(precisionValue, 10));
      return format.useArabicNumerals ? toArabicNumerals(expStr) : expStr;
    }
    
    // For small values, extend precision to show meaningful digits
    let effectivePrecision = precisionValue;
    if (absNum < 1 && absNum > 0) {
      // Calculate how many decimal places needed to show the value
      const magnitude = Math.floor(Math.log10(absNum));
      const neededDecimals = Math.abs(magnitude) + precisionValue;
      effectivePrecision = Math.min(neededDecimals, 12); // Cap at 12 decimal places
    }
    
    return formatNumberWithSeparators(num, effectivePrecision);
  };

  // Helper to determine input placeholder
  const getPlaceholder = () => {
    if (fromUnit === 'deg_dms') return "dd:mm:ss";
    if (fromUnit === 'ft_in') return "ft'in\"";
    return "0";
  };

  // Helper to validate and filter input
  const handleInputChange = (value: string) => {
    const format = NUMBER_FORMATS[numberFormat];
    const decimalSep = format.decimal === '.' ? '\\.' : format.decimal === "'" ? "\\'" : format.decimal;
    const thousandsSep = format.thousands ? (format.thousands === ' ' ? '\\s' : format.thousands === "'" ? "\\'" : format.thousands) : '';
    
    // For Arabic formats, allow both Latin and Arabic numerals
    const isArabicFormat = numberFormat === 'arabic';
    const digitPattern = isArabicFormat ? '0-9٠-٩' : '0-9';
    
    // For special formats (DMS/FtIn), allow: digits, colon, decimal separator, thousands separator, minus, quotes
    if (fromUnit === 'deg_dms' || fromUnit === 'ft_in') {
      const pattern = new RegExp(`[^${digitPattern}:\\-${decimalSep}${thousandsSep}'"']`, 'g');
      const filtered = value.replace(pattern, '');
      setInputValue(filtered);
      return;
    }
    
    // For regular numeric input, allow: digits, current decimal separator, current thousands separator, minus, e/E for scientific notation
    // Build regex pattern: digits, minus sign, decimal separator, thousands separator, plus e/E and + for exponent
    const pattern = new RegExp(`[^${digitPattern}\\-${decimalSep}${thousandsSep}eE\\+]`, 'g');
    const filtered = value.replace(pattern, '');
    setInputValue(filtered);
  };

  // Helper to build unit symbol from Direct tab exponents
  const buildDirectUnitSymbol = (): string => {
    const superscripts: Record<number, string> = {
      1: '¹', 2: '²', 3: '³', 4: '⁴', 5: '⁵',
      [-1]: '⁻¹', [-2]: '⁻²', [-3]: '⁻³', [-4]: '⁻⁴', [-5]: '⁻⁵'
    };
    
    const parts: string[] = [];
    const units = ['m', 'kg', 's', 'A', 'K', 'mol', 'cd', 'rad', 'sr'] as const;
    
    for (const unit of units) {
      const exp = directExponents[unit];
      if (exp !== 0) {
        if (exp === 1) {
          parts.push(unit);
        } else {
          parts.push(`${unit}${superscripts[exp] || ''}`);
        }
      }
    }
    
    return parts.join('·') || '';
  };

  // Helper to build dimensional formula from Custom tab exponents
  const buildDirectDimensions = (): DimensionalFormula => {
    const dims: DimensionalFormula = {};
    
    // Map exponent keys to DimensionalFormula keys
    const keyMap: Record<string, keyof DimensionalFormula> = {
      'm': 'length',
      'kg': 'mass',
      's': 'time',
      'A': 'current',
      'K': 'temperature',
      'mol': 'amount',
      'cd': 'intensity',
      'rad': 'angle',
      'sr': 'solid_angle'
    };
    
    for (const [unit, dimKey] of Object.entries(keyMap)) {
      const exp = directExponents[unit];
      if (exp !== 0) {
        dims[dimKey] = exp;
      }
    }
    
    return dims;
  };

  // Helper to handle keyboard navigation for category switching
  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
      e.preventDefault();
      
      // Get flat list of all categories in order
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

  return (
    <div className="w-full max-w-[1400px] mx-auto p-4 md:px-8 md:pb-8 md:pt-1 grid md:grid-cols-[260px_1fr] gap-8">
      
      {/* Sidebar */}
      <nav className={`space-y-2 h-fit sticky top-0 pr-2 -mt-1 transition-opacity ${activeTab === 'custom' ? 'opacity-40 pointer-events-none' : ''}`}>
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
                    className={`w-full text-left px-3 py-[1px] rounded-sm text-xs font-medium transition-all duration-200 border-l-2 flex items-center justify-between group ${
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
      <div className="space-y-4 -mt-1">
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
                  // If switching away from Arabic format, set language to English
                  if (oldFormat === 'arabic' && newFormat !== 'arabic') {
                    setLanguage('en');
                  }
                  // Reformat input value with new format
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
                  <SelectItem value="uk" className="text-xs">English</SelectItem>
                  <SelectItem value="europe-latin" className="text-xs">World</SelectItem>
                  <SelectItem value="period" className="text-xs">Period</SelectItem>
                  <SelectItem value="comma" className="text-xs">Comma</SelectItem>
                  <SelectItem value="arabic" className="text-xs">العربية</SelectItem>
                  <SelectItem value="east-asian" className="text-xs">East Asian</SelectItem>
                  <SelectItem value="south-asian" className="text-xs">South Asian (Indian)</SelectItem>
                  <SelectItem value="swiss" className="text-xs">Swiss</SelectItem>
                </SelectContent>
              </Select>
              <Select 
                value={numberFormat === 'arabic' ? '' : language} 
                onValueChange={(val) => { setLanguage(val); refocusInput(); }}
                onOpenChange={(open) => { if (!open) refocusInput(); }}
                disabled={numberFormat === 'arabic'}
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
              <h1 className="text-3xl font-bold text-foreground tracking-tight">{t(applyRegionalSpelling(categoryData.name))}</h1>
              <p className="text-muted-foreground text-sm font-mono mt-1">
                {t('Base unit:')} <span className="text-primary">{t(applyRegionalSpelling(toTitleCase(categoryData.baseUnit)))}</span>
              </p>
            </div>
          )}
          {activeTab === 'custom' && (
            <div className="mt-2">
              <h1 className="text-3xl font-bold text-foreground tracking-tight">{t('Custom Entry')}</h1>
              <p className="text-muted-foreground text-sm font-mono mt-1">
                {t('Build dimensional units from SI base units')}
              </p>
            </div>
          )}
        </div>

        {/* Fixed-height content container - both tabs rendered, only active one visible */}
        <div className="grid">
          {/* Converter Tab Content - always rendered, visibility controlled with opacity transition */}
          <Card 
            className={`w-full p-6 md:p-8 bg-card border-border/50 shadow-xl relative overflow-hidden col-start-1 row-start-1 transition-opacity duration-150 ${
              activeTab === 'converter' ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
          >
            {/* Background decoration */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />

          <div className="grid gap-8 relative z-10">
            
            {/* Input Section - gap-2 to align with Custom tab's Value label spacing */}
            <div className="grid gap-2">
              <Label className="text-xs font-mono uppercase text-muted-foreground">{t('From')}</Label>
              <div className="flex flex-col gap-2">
                {/* Row 1: Input, Prefix, Unit Selector */}
                <div className="flex gap-2">
                  <Input 
                    ref={inputRef}
                    type="text" 
                    inputMode="decimal"
                    value={inputValue}
                    onChange={(e) => handleInputChange(e.target.value)}
                    onKeyDown={handleInputKeyDown}
                    onBlur={handleInputBlur}
                    tabIndex={1}
                    className="font-mono px-4 bg-background/50 border-border focus:border-accent focus:ring-accent/20 transition-all text-left"
                    style={{ height: FIELD_HEIGHT, fontSize: '0.875rem', width: CommonFieldWidth }}
                    placeholder={getPlaceholder()}
                    {...testId('input-value')}
                  />
                  
                  {/* Prefix Dropdown */}
                  <Select 
                    value={fromPrefix} 
                    onValueChange={(val) => { 
                      const normalized = normalizeMassUnit(fromUnit, val);
                      setFromUnit(normalized.unit);
                      setFromPrefix(normalized.prefix);
                      refocusInput(); 
                    }}
                    onOpenChange={(open) => { if (!open) refocusInput(); }}
                    disabled={!fromUnitData?.allowPrefixes && !KG_TO_GRAM_UNIT_PAIRS[fromUnit]}
                  >
                    <SelectTrigger tabIndex={2} className="w-[50px] bg-background/30 border-border font-medium disabled:opacity-50 disabled:cursor-not-allowed shrink-0" style={{ height: FIELD_HEIGHT }}>
                      <SelectValue placeholder={t('Prefix')} />
                    </SelectTrigger>
                    <SelectContent className="max-h-[50vh]">
                      {(activeCategory === 'data' ? ALL_PREFIXES : PREFIXES).map((p) => (
                        <SelectItem key={p.id} value={p.id} className="font-mono text-sm">
                          {p.symbol || '-'}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select 
                    value={fromUnit} 
                    onValueChange={(val) => { setFromUnit(val); setFromPrefix('none'); refocusInput(); }}
                    onOpenChange={(open) => { if (!open) refocusInput(); }}
                  >
                    <SelectTrigger tabIndex={3} className="flex-1 min-w-0 bg-background/30 border-border font-medium" style={{ height: FIELD_HEIGHT }}>
                      <SelectValue placeholder={t('Unit')} />
                    </SelectTrigger>
                    <SelectContent className="max-h-[50vh]">
                      {filteredUnits.map((u) => (
                        <SelectItem key={u.id} value={u.id} className="font-mono text-sm">
                          {u.symbol === u.name ? (
                            <span className="font-bold">{u.symbol}</span>
                          ) : (
                            <>
                              <span className="font-bold mr-2">{u.symbol}</span>
                              <span className="opacity-70">{translateUnitName(u.name)}</span>
                            </>
                          )}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                {/* Row 2: Base Factor, Spacer, SI Base Units */}
                <div className="flex gap-2">
                  <motion.div 
                    className={`px-3 rounded bg-muted/20 border border-border/50 select-none flex flex-col justify-center ${fromUnitData ? 'cursor-pointer hover:bg-muted/40 active:bg-muted/60' : ''}`}
                    style={{ height: FIELD_HEIGHT, width: CommonFieldWidth }}
                    onClick={copyFromBaseFactor}
                    animate={{
                      opacity: flashFromBaseFactor ? [1, 0.3, 1] : 1,
                      scale: flashFromBaseFactor ? [1, 1.02, 1] : 1
                    }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="text-[10px] text-muted-foreground uppercase tracking-wider font-mono">{t('Base Factor')}</div>
                    <div className="font-mono text-sm text-foreground/80 truncate" title={fromUnitData ? (fromUnitData.factor * fromPrefixData.factor).toString() : ''}>
                      {fromUnitData ? formatFactor(fromUnitData.factor * fromPrefixData.factor) : '-'}
                    </div>
                  </motion.div>
                  <div className="w-[50px] shrink-0" />
                  <motion.div 
                    className={`px-3 rounded bg-muted/20 border border-border/50 select-none flex flex-col justify-center flex-1 min-w-0 ${formatDimensions(getCategoryDimensions(activeCategory)) ? 'cursor-pointer hover:bg-muted/40 active:bg-muted/60' : ''}`}
                    style={{ height: FIELD_HEIGHT }}
                    onClick={copyFromSIBase}
                    animate={{
                      opacity: flashFromSIBase ? [1, 0.3, 1] : 1,
                      scale: flashFromSIBase ? [1, 1.02, 1] : 1
                    }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="text-[10px] text-muted-foreground uppercase tracking-wider font-mono">{t('SI Base Units')}</div>
                    <div className="font-mono text-sm text-foreground/80 truncate">
                      {formatDimensions(getCategoryDimensions(activeCategory)) || '-'}
                    </div>
                  </motion.div>
                </div>
              </div>

              {fromUnitData?.description && (
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Info className="w-3 h-3" /> {fromUnitData.description}
                </p>
              )}
            </div>

            {/* Swap Button */}
            <div className="flex justify-center -my-2">
              <Button 
                variant="outline" 
                size="icon" 
                onClick={swapUnits}
                className="rounded-full w-10 h-10 border-border bg-background hover:border-accent hover:text-accent transition-colors"
              >
                <ArrowRightLeft className="w-4 h-4" />
              </Button>
            </div>

            {/* Output Section */}
            <div className="grid gap-4">
              <div className="flex items-center gap-2">
                <div className="flex items-center justify-between" style={{ width: CommonFieldWidth }}>
                  <Label className="text-xs font-mono uppercase text-muted-foreground">{t('To')}</Label>
                  <div className="flex items-center gap-2">
                    <Label className="text-xs text-muted-foreground">{t('Precision')}</Label>
                    <Select 
                      value={precision.toString()} 
                      onValueChange={(val) => { setPrecision(parseInt(val)); refocusInput(); }}
                      onOpenChange={(open) => { if (!open) refocusInput(); }}
                    >
                      <SelectTrigger tabIndex={4} className="h-10 w-[70px] text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent align="end">
                        {[0,1,2,3,4,5,6,7,8].map(n => (
                          <SelectItem key={n} value={n.toString()} className="text-xs">
                            {numberFormat === 'arabic' ? toArabicNumerals(n.toString()) : n}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="w-[50px] shrink-0" />
                <div className="flex-1 min-w-0 flex justify-end">
                  <Button
                    variant={comparisonMode ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setComparisonMode(!comparisonMode)}
                    className={`h-6 px-2 text-[10px] font-mono uppercase ${comparisonMode ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground border !border-border/30'}`}
                    data-testid="button-comparison-mode"
                  >
                    {t('Compare All')}
                  </Button>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                {/* Row 1: Result, Prefix, Unit Selector */}
                <div className="flex gap-2">
                  <motion.div 
                    className={`px-4 bg-background/50 border border-border rounded-md flex items-center overflow-x-auto text-left justify-start select-none ${result !== null ? 'cursor-pointer hover:bg-background/70 active:bg-background/90' : ''}`}
                    style={{ height: FIELD_HEIGHT, width: CommonFieldWidth, pointerEvents: 'auto' }}
                    onClick={() => result !== null && copyResult()}
                    animate={{
                      opacity: flashCopyResult ? [1, 0.3, 1] : 1,
                      scale: flashCopyResult ? [1, 1.02, 1] : 1
                    }}
                    transition={{ duration: 0.3 }}
                  >
                    <span className="font-mono text-primary whitespace-nowrap" style={{ fontSize: '0.875rem' }}>
                      {result !== null 
                        ? (toUnit === 'deg_dms' 
                            ? formatDMS(result) 
                            : toUnit === 'ft_in'
                              ? formatFtIn(result)
                              : formatResultValue(result, precision)) 
                        : '...'}
                    </span>
                  </motion.div>

                  {/* Prefix Dropdown */}
                  <Select 
                    value={toPrefix} 
                    onValueChange={(val) => {
                      const normalized = normalizeMassUnit(toUnit, val);
                      setToUnit(normalized.unit);
                      setToPrefix(normalized.prefix);
                    }}
                    disabled={!toUnitData?.allowPrefixes && !KG_TO_GRAM_UNIT_PAIRS[toUnit]}
                  >
                    <SelectTrigger className="w-[50px] bg-background/30 border-border font-medium disabled:opacity-50 disabled:cursor-not-allowed shrink-0" style={{ height: FIELD_HEIGHT }}>
                      <SelectValue placeholder={t('Prefix')} />
                    </SelectTrigger>
                    <SelectContent className="max-h-[50vh]">
                      {(activeCategory === 'data' ? ALL_PREFIXES : PREFIXES).map((p) => (
                        <SelectItem key={p.id} value={p.id} className="font-mono text-sm">
                          {p.symbol || '-'}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={toUnit} onValueChange={(val) => { setToUnit(val); setToPrefix('none'); }}>
                    <SelectTrigger className="flex-1 min-w-0 bg-background/30 border-border font-medium" style={{ height: FIELD_HEIGHT }}>
                      <SelectValue placeholder={t('Unit')} />
                    </SelectTrigger>
                    <SelectContent className="max-h-[50vh]">
                      {toFilteredUnits.map((u) => (
                        <SelectItem key={u.id} value={u.id} className="font-mono text-sm">
                          {u.symbol === u.name ? (
                            <span className="font-bold">{u.symbol}</span>
                          ) : (
                            <>
                              <span className="font-bold mr-2">{u.symbol}</span>
                              <span className="opacity-70">{translateUnitName(u.name)}</span>
                            </>
                          )}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                {/* Row 2: Base Factor, Spacer, SI Base Units */}
                <div className="flex gap-2">
                  <motion.div 
                    className={`px-3 rounded bg-muted/20 border border-border/50 select-none flex flex-col justify-center ${toUnitData ? 'cursor-pointer hover:bg-muted/40 active:bg-muted/60' : ''}`}
                    style={{ height: FIELD_HEIGHT, width: CommonFieldWidth }}
                    onClick={copyToBaseFactor}
                    animate={{
                      opacity: flashToBaseFactor ? [1, 0.3, 1] : 1,
                      scale: flashToBaseFactor ? [1, 1.02, 1] : 1
                    }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="text-[10px] text-muted-foreground uppercase tracking-wider font-mono">{t('Base Factor')}</div>
                    <div className="font-mono text-sm text-foreground/80 truncate" title={toUnitData ? (toUnitData.factor * toPrefixData.factor).toString() : ''}>
                      {toUnitData ? formatFactor(toUnitData.factor * toPrefixData.factor) : '-'}
                    </div>
                  </motion.div>
                  <div className="w-[50px] shrink-0" />
                  <motion.div 
                    className={`px-3 rounded bg-muted/20 border border-border/50 select-none flex flex-col justify-center flex-1 min-w-0 ${formatDimensions(getCategoryDimensions(activeCategory)) ? 'cursor-pointer hover:bg-muted/40 active:bg-muted/60' : ''}`}
                    style={{ height: FIELD_HEIGHT }}
                    onClick={copyToSIBase}
                    animate={{
                      opacity: flashToSIBase ? [1, 0.3, 1] : 1,
                      scale: flashToSIBase ? [1, 1.02, 1] : 1
                    }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="text-[10px] text-muted-foreground uppercase tracking-wider font-mono">{t('SI Base Units')}</div>
                    <div className="font-mono text-sm text-foreground/80 truncate">
                      {formatDimensions(getCategoryDimensions(activeCategory)) || '-'}
                    </div>
                  </motion.div>
                </div>
              </div>

              <div className="grid sm:grid-cols-[1fr_auto] gap-2 items-start">
                <div className="space-y-2">
                  {toUnitData?.description && (
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Info className="w-3 h-3" /> {toUnitData.description}
                    </p>
                  )}
                  {result !== null && fromUnitData && toUnitData && (
                    <motion.div 
                      className="p-2 rounded bg-muted/20 border border-border/50 cursor-pointer hover:bg-muted/40 active:bg-muted/60 select-none"
                      onClick={copyConversionRatio}
                      animate={{
                        opacity: flashConversionRatio ? [1, 0.3, 1] : 1,
                        scale: flashConversionRatio ? [1, 1.02, 1] : 1
                      }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="text-xs font-mono text-muted-foreground flex gap-2 items-center">
                        <span className="text-foreground font-bold">
                          {NUMBER_FORMATS[numberFormat].useArabicNumerals ? '١' : '1'} {fromPrefixData.id !== 'none' ? fromPrefixData.symbol : ''}{fromUnitData.symbol}
                        </span>
                        <span>=</span>
                        <span className="text-foreground font-bold">
                          {toUnit === 'deg_dms'
                            ? formatDMS(convert(1, fromUnit, toUnit, activeCategory, fromPrefixData.factor, toPrefixData.factor))
                            : toUnit === 'ft_in'
                              ? formatFtIn(convert(1, fromUnit, toUnit, activeCategory, fromPrefixData.factor, toPrefixData.factor))
                              : `${formatResultValue(convert(1, fromUnit, toUnit, activeCategory, fromPrefixData.factor, toPrefixData.factor), precision)} ${toPrefixData.id !== 'none' ? toPrefixData.symbol : ''}${toUnitData.symbol}`}
                        </span>
                      </div>
                    </motion.div>
                  )}
                </div>
                
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => { copyResult(); refocusInput(); }}
                  onBlur={refocusInput}
                  tabIndex={5}
                  className="text-xs hover:text-accent gap-2 border !border-border/30"
                >
                  <Copy className="w-3 h-3" />
                  <motion.span
                    animate={{
                      opacity: flashCopyResult ? [1, 0.3, 1] : 1,
                      scale: flashCopyResult ? [1, 1.1, 1] : 1
                    }}
                    transition={{ duration: 0.3 }}
                  >
                    {t('Copy')}
                  </motion.span>
                </Button>
              </div>

              {/* Comparison Mode Panel */}
              <AnimatePresence>
                {comparisonMode && result !== null && fromUnitData && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                    data-testid="comparison-panel"
                  >
                    <div className="mt-4 p-3 rounded-lg bg-muted/10 border border-border/30">
                      <div className="text-[10px] font-mono text-muted-foreground mb-2">
                        <span className="uppercase">{t('Compare')}</span> {inputValue} {fromPrefixData.id !== 'none' ? fromPrefixData.symbol : ''}{fromUnitData.symbol}
                      </div>
                      <div className="grid gap-1">
                        {(() => {
                          // Get all units in category, always include SI base first if not the source
                          const allUnits = categoryData.units.filter(u => u.id !== fromUnit);
                          // Limit to 8 most relevant units, but ensure important units are included
                          let displayUnits = allUnits.slice(0, 8);
                          
                          // For length, ensure ly (light-year) is included
                          if (activeCategory === 'length') {
                            const lyUnit = allUnits.find(u => u.id === 'ly');
                            if (lyUnit && !displayUnits.find(u => u.id === 'ly')) {
                              displayUnits = [...displayUnits.slice(0, 7), lyUnit];
                            }
                          }
                          
                          return displayUnits.map(unit => {
                            // Convert to the target unit (no prefix)
                            const convertedValue = convert(
                              parseFloat(inputValue) || 0,
                              fromUnit,
                              unit.id,
                              activeCategory,
                              fromPrefixData.factor,
                              1 // No prefix on target for comparison
                            );
                            
                            // For units with prefixes, find optimal prefix and calculate display value
                            const nonePrefix = PREFIXES.find(p => p.id === 'none')!;
                            let displayPrefix = nonePrefix;
                            let displayValue = convertedValue;
                            
                            if (unit.allowPrefixes && Math.abs(convertedValue) > 0) {
                              // findOptimalPrefix returns { prefix, adjustedValue }
                              const optimal = findOptimalPrefix(convertedValue, unit.symbol, precision);
                              displayPrefix = optimal.prefix;
                              displayValue = optimal.adjustedValue;
                            }
                            
                            // Use applyPrefixToKgUnit for proper kg prefix handoff (kg → Mg, mg, etc.)
                            const kgResult = applyPrefixToKgUnit(unit.symbol, displayPrefix.id);
                            const displaySymbol = kgResult.showPrefix 
                              ? `${displayPrefix.symbol}${kgResult.displaySymbol}`
                              : kgResult.displaySymbol;
                            
                            return (
                              <div 
                                key={unit.id}
                                className="flex justify-between items-center px-2 py-1 rounded hover:bg-muted/20 cursor-pointer select-none"
                                onClick={() => {
                                  // Copy this value to clipboard
                                  const copyText = `${displayValue.toFixed(precision)}`;
                                  navigator.clipboard.writeText(copyText);
                                }}
                                data-testid={`comparison-row-${unit.id}`}
                              >
                                <span className="text-xs text-muted-foreground font-mono">
                                  {displaySymbol}
                                </span>
                                <span className="text-sm font-mono text-foreground">
                                  {formatNumberWithSeparators(displayValue, precision)}
                                </span>
                              </div>
                            );
                          });
                        })()}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            </div>
          </Card>

          {/* Custom Tab Content - always rendered, visibility controlled with opacity transition */}
          <Card 
            className={`w-full p-6 md:p-8 bg-card border-border/50 shadow-xl relative overflow-hidden col-start-1 row-start-1 transition-opacity duration-150 ${
              activeTab === 'custom' ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
          
          <div className="flex flex-col gap-6 relative z-10">
            {/* Top row: Value input, Result display, and Copy button */}
            <div className="flex items-end gap-4">
              <div className="flex flex-col gap-2">
                <Label className="text-xs font-mono uppercase text-muted-foreground">{t('Value')}</Label>
                <Input 
                  type="text"
                  inputMode="text"
                  value={directValue}
                  onChange={(e) => {
                    // Allow more characters for unit expressions (letters, symbols, spaces)
                    setDirectValue(e.target.value);
                  }}
                  onBlur={(e) => {
                    // Parse unit expressions on blur (e.g., "12 GPa", "45°", "10 deg")
                    const text = e.target.value.trim();
                    if (!text) return;
                    
                    // Check if it contains non-numeric characters (suggesting a unit expression)
                    const hasUnitPart = /[a-zA-Z°⋅·×\^⁰¹²³⁴⁵⁶⁷⁸⁹⁻]/.test(text);
                    if (hasUnitPart) {
                      const parsed = parseUnitText(text);
                      if (parsed.value && (Object.keys(parsed.dimensions).length > 0 || parsed.categoryId)) {
                        // Update value with parsed numeric value (including conversions)
                        setDirectValue(parsed.value.toString());
                        
                        // Update dimension grid from parsed dimensions
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
                        
                        // Check if any exponent is outside -5..5 range - if so, clear the grid
                        const hasOutOfRange = Object.values(newExponents).some(exp => exp < -5 || exp > 5);
                        if (hasOutOfRange) {
                          // Keep value but clear the dimension grid
                          setDirectExponents({ m: 0, kg: 0, s: 0, A: 0, K: 0, mol: 0, cd: 0, rad: 0, sr: 0 });
                        } else {
                          setDirectExponents(newExponents);
                        }
                      }
                    }
                  }}
                  onKeyDown={(e) => {
                    // Parse unit expressions on Enter
                    if (e.key === 'Enter') {
                      e.currentTarget.blur(); // Triggers onBlur handler
                    }
                  }}
                  className="font-mono px-4 bg-background/50 border-border focus:border-accent focus:ring-accent/20 transition-all text-left"
                  style={{ height: FIELD_HEIGHT, fontSize: '0.875rem', width: CommonFieldWidth }}
                  placeholder="0"
                  {...testId('custom-input-value')}
                />
              </div>
              
              {/* Result display */}
              <div className="flex flex-col gap-2">
                <Label className="text-xs font-mono uppercase text-muted-foreground">{t('Result')}</Label>
                <motion.div 
                  className="px-4 bg-background/50 border border-border rounded-md font-mono text-primary cursor-pointer hover:bg-background/70 flex items-center justify-between gap-4"
                  style={{ height: FIELD_HEIGHT, minWidth: CommonFieldWidth }}
                  onClick={() => {
                    const numValue = parseNumberWithFormat(directValue);
                    if (isNaN(numValue) || !directValue) return;
                    const unitSymbol = buildDirectUnitSymbol();
                    const valueStr = formatForClipboard(numValue, precision);
                    const textToCopy = unitSymbol ? `${valueStr} ${unitSymbol}` : valueStr;
                    navigator.clipboard.writeText(textToCopy);
                    triggerFlashDirectCopy();
                    
                    // Add to calculator - same behavior as Converter pane result click
                    const dims = buildDirectDimensions();
                    const newEntry = {
                      value: numValue,
                      dimensions: dims,
                      prefix: 'none'
                    };
                    
                    if (calculatorMode === 'rpn') {
                      // RPN mode: Push onto stack position x with stack lift
                      saveRpnStackForUndo();
                      setRpnStack(prev => {
                        const newStack = [...prev];
                        newStack[0] = prev[1];
                        newStack[1] = prev[2];
                        newStack[2] = prev[3];
                        newStack[3] = newEntry;
                        return newStack;
                      });
                      setRpnResultPrefix('none');
                      setRpnSelectedAlternative(0);
                      triggerFlashRpnResult();
                    } else {
                      // UNIT mode: Find first empty field in positions 0-2
                      const firstEmptyIndex = calcValues.findIndex((v, i) => i < 3 && v === null);
                      if (firstEmptyIndex !== -1) {
                        const newCalcValues = [...calcValues];
                        newCalcValues[firstEmptyIndex] = newEntry;
                        setCalcValues(newCalcValues);
                      }
                    }
                  }}
                  animate={{
                    opacity: flashDirectCopy ? [1, 0.3, 1] : 1,
                    scale: flashDirectCopy ? [1, 1.02, 1] : 1
                  }}
                  transition={{ duration: 0.3 }}
                >
                  {(() => {
                    const numValue = parseNumberWithFormat(directValue);
                    const unitSymbol = buildDirectUnitSymbol();
                    if (isNaN(numValue) || !directValue) return <span>...</span>;
                    return (
                      <>
                        <span>{formatResultValue(numValue, precision)}</span>
                        <span className="text-muted-foreground">{unitSymbol}</span>
                      </>
                    );
                  })()}
                </motion.div>
              </div>
              
              {/* Paste button aligned far right */}
              <div className="flex-1 flex justify-end">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={async () => {
                    try {
                      const text = await navigator.clipboard.readText();
                      if (!text) return;
                      
                      const parsed = parseUnitText(text);
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
                    } catch (err) {
                      console.error('Failed to read clipboard:', err);
                    }
                  }}
                  className="text-xs hover:text-accent gap-2 border !border-border/30"
                  style={{ height: FIELD_HEIGHT }}
                  {...testId('custom-paste-button')}
                >
                  <ClipboardPaste className="w-3 h-3" />
                  {t('Paste')}
                </Button>
              </div>
            </div>
            
            {/* Unit selector grid */}
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between mb-2">
                <Label className="text-xs font-mono uppercase text-muted-foreground">{t('Dimensions')}</Label>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setDirectExponents({
                    m: 0, kg: 0, s: 0, A: 0, K: 0, mol: 0, cd: 0, rad: 0, sr: 0
                  })}
                  className="text-xs hover:text-accent border !border-border/30"
                >
                  {t('Clear')}
                </Button>
              </div>
              {([
                { unit: 'm', quantity: 'Length' },
                { unit: 'kg', quantity: 'Mass' },
                { unit: 's', quantity: 'Time' },
                { unit: 'A', quantity: 'Electric Current' },
                { unit: 'K', quantity: 'Temperature' },
                { unit: 'mol', quantity: 'Amount of Substance' },
                { unit: 'cd', quantity: 'Luminous Intensity' },
                { unit: 'rad', quantity: 'Plane Angle' },
                { unit: 'sr', quantity: 'Solid Angle' }
              ] as const).map(({ unit, quantity }) => (
                <div key={unit} className="flex items-center gap-2">
                  <span className="text-xs w-32 text-right text-muted-foreground truncate" title={t(quantity)}>{t(quantity)}</span>
                  <div className="flex gap-0">
                    {[5, 4, 3, 2, 1, 0, -1, -2, -3, -4, -5].map((exp) => {
                      const superscripts: Record<number, string> = {
                        1: '¹', 2: '²', 3: '³', 4: '⁴', 5: '⁵',
                        [-1]: '⁻¹', [-2]: '⁻²', [-3]: '⁻³', [-4]: '⁻⁴', [-5]: '⁻⁵'
                      };
                      const label = exp === 0 ? '-' : `${unit}${superscripts[exp] || ''}`;
                      const isSelected = directExponents[unit] === exp;
                      return (
                        <button
                          key={exp}
                          onClick={() => setDirectExponents(prev => ({ ...prev, [unit]: exp }))}
                          className={`w-12 h-7 text-xs font-mono border transition-all text-center shrink-0 ${
                            isSelected 
                              ? 'bg-accent text-accent-foreground border-accent' 
                              : 'bg-background/30 border-border/50 hover:bg-muted/50 text-muted-foreground'
                          } ${exp === 5 ? 'rounded-l' : ''} ${exp === -5 ? 'rounded-r' : ''}`}
                          {...testId(`custom-exp-${unit}-${exp}`)}
                        >
                          {label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
            
            {/* Copy button at bottom, aligned far right */}
            <div className="flex justify-end mt-4">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => {
                  const numValue = parseNumberWithFormat(directValue);
                  if (isNaN(numValue) || !directValue) return;
                  const unitSymbol = buildDirectUnitSymbol();
                  const valueStr = formatForClipboard(numValue, precision);
                  const textToCopy = unitSymbol ? `${valueStr} ${unitSymbol}` : valueStr;
                  navigator.clipboard.writeText(textToCopy);
                  triggerFlashDirectCopy();
                  
                  // Add to calculator - same behavior as Converter pane
                  const dims = buildDirectDimensions();
                  const newEntry = {
                    value: numValue,
                    dimensions: dims,
                    prefix: 'none'
                  };
                  
                  if (calculatorMode === 'rpn') {
                    // RPN mode: Push onto stack position x with stack lift
                    saveRpnStackForUndo();
                    setRpnStack(prev => {
                      const newStack = [...prev];
                      newStack[0] = prev[1];
                      newStack[1] = prev[2];
                      newStack[2] = prev[3];
                      newStack[3] = newEntry;
                      return newStack;
                    });
                    setRpnResultPrefix('none');
                    setRpnSelectedAlternative(0);
                    triggerFlashRpnResult();
                  } else {
                    // UNIT mode: Find first empty field in positions 0-2
                    const firstEmptyIndex = calcValues.findIndex((v, i) => i < 3 && v === null);
                    if (firstEmptyIndex !== -1) {
                      const newCalcValues = [...calcValues];
                      newCalcValues[firstEmptyIndex] = newEntry;
                      setCalcValues(newCalcValues);
                    }
                  }
                }}
                className="text-xs hover:text-accent gap-2 border !border-border/30"
                {...testId('custom-copy-button')}
              >
                <Copy className="w-3 h-3" />
                <motion.span
                  animate={{
                    opacity: flashDirectCopy ? [1, 0.3, 1] : 1,
                    scale: flashDirectCopy ? [1, 1.1, 1] : 1
                  }}
                  transition={{ duration: 0.3 }}
                >
                  {t('Copy')}
                </motion.span>
              </Button>
            </div>
          </div>
          </Card>
        </div>

        {/* Mini Calculator */}
        <Card className="w-full p-6 bg-card border-border/50">
          {/* Simple Calculator Header - aligned with grid below */}
          {calculatorMode === 'simple' && (
            <div 
              className="grid gap-2 mb-4 items-center"
              style={{ gridTemplateColumns: `${CommonFieldWidth} ${OperatorBtnWidth} ${OperatorBtnWidth} ${OperatorBtnWidth} ${OperatorBtnWidth} ${ClearBtnWidth}` }}
            >
              {/* Column 1: Calculator label (left) and Precision (right-aligned with field below) - constrained width */}
              <div className="flex items-center justify-between" style={{ width: CommonFieldWidth, maxWidth: CommonFieldWidth }}>
                <Label 
                  className="text-xs font-mono uppercase text-foreground cursor-pointer hover:text-accent transition-colors px-2 py-1 rounded border border-border/30"
                  onClick={() => switchToRpn()}
                >
                  {t('CALCULATOR') + ' ⇅'}
                </Label>
                <div className="flex items-center gap-1">
                  <Label className="text-xs text-foreground">{t('Precision')}</Label>
                  <Select 
                    value={calculatorPrecision.toString()} 
                    onValueChange={(val) => setCalculatorPrecision(parseInt(val))}
                  >
                    <SelectTrigger className="h-8 w-[50px] text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent align="end">
                      {[0, 1, 2, 3, 4, 5, 6, 7, 8].map(p => (
                        <SelectItem key={p} value={p.toString()} className="text-xs">
                          {numberFormat === 'arabic' ? toArabicNumerals(p.toString()) : p}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              {/* Column 2: Clear calculator - left-aligned with × button */}
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={clearCalculator}
                className="text-xs text-foreground hover:text-accent border !border-border/30"
                style={{ justifySelf: 'start' }}
              >
                {t('Clear calculator')}
              </Button>
              {/* Spacer columns for / + - Clear */}
              <div />
              <div />
              <div />
              <div />
            </div>
          )}
          
          {/* RPN Calculator Header - single line aligned with stack grid */}
          {calculatorMode === 'rpn' && (
            <div 
              className="grid gap-2 mb-4 items-center"
              style={{ gridTemplateColumns: `${CommonFieldWidth} repeat(8, ${RpnBtnWidth})` }}
            >
              {/* Column 1: Calculator label (far left) and Precision (right-aligned) - constrained to CommonFieldWidth */}
              <div className="flex items-center justify-between" style={{ width: CommonFieldWidth, maxWidth: CommonFieldWidth }}>
                <Label 
                  className="text-xs font-mono uppercase text-foreground cursor-pointer hover:text-accent transition-colors px-2 py-1 rounded border border-border/30"
                  onClick={() => switchToSimple()}
                >
                  {t('CALCULATOR - RPN') + ' ⇅'}
                </Label>
                <div className="flex items-center gap-1">
                  <Label className="text-xs text-foreground">{t('Precision')}</Label>
                  <Select 
                    value={calculatorPrecision.toString()} 
                    onValueChange={(val) => setCalculatorPrecision(parseInt(val))}
                  >
                    <SelectTrigger className="h-8 w-[50px] text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent align="end">
                      {[0, 1, 2, 3, 4, 5, 6, 7, 8].map(p => (
                        <SelectItem key={p} value={p.toString()} className="text-xs">
                          {numberFormat === 'arabic' ? toArabicNumerals(p.toString()) : p}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              {/* Column 2: Clear calculator - left-aligned with x² button */}
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={clearRpnStack}
                className="text-xs text-foreground hover:text-accent border !border-border/30"
                style={{ justifySelf: 'start' }}
              >
                {t('Clear calculator')}
              </Button>
              {/* Spacer columns 3-7 */}
              <span style={{ gridColumn: 'span 6' }}></span>
              {/* Column 9: Paste - far right */}
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={async () => {
                  try {
                    const text = await navigator.clipboard.readText();
                    if (!text) return;
                    const parsed = parseUnitText(text);
                    const dims: Record<string, number> = {};
                    if (parsed.dimensions.length) dims.length = parsed.dimensions.length;
                    if (parsed.dimensions.mass) dims.mass = parsed.dimensions.mass;
                    if (parsed.dimensions.time) dims.time = parsed.dimensions.time;
                    if (parsed.dimensions.current) dims.current = parsed.dimensions.current;
                    if (parsed.dimensions.temperature) dims.temperature = parsed.dimensions.temperature;
                    if (parsed.dimensions.amount) dims.amount = parsed.dimensions.amount;
                    if (parsed.dimensions.intensity) dims.intensity = parsed.dimensions.intensity;
                    if (parsed.dimensions.angle) dims.angle = parsed.dimensions.angle;
                    if (parsed.dimensions.solid_angle) dims.solid_angle = parsed.dimensions.solid_angle;
                    
                    const newEntry = {
                      value: parsed.value,
                      dimensions: dims,
                      prefix: parsed.prefixId || 'none'
                    };
                    
                    saveRpnStackForUndo();
                    setRpnStack(prev => {
                      const newStack = [...prev];
                      newStack[0] = prev[1];
                      newStack[1] = prev[2];
                      newStack[2] = prev[3];
                      newStack[3] = newEntry;
                      return newStack;
                    });
                    setRpnResultPrefix('none');
                    setRpnSelectedAlternative(0);
                    triggerFlashRpnResult();
                  } catch (err) {
                    console.error('Failed to read clipboard:', err);
                  }
                }}
                className="text-xs text-foreground hover:text-accent gap-2 border !border-border/30"
              >
                <ClipboardPaste className="w-3 h-3" />
                {t('Paste')}
              </Button>
            </div>
          )}
          
          {/* Fixed-height container to prevent flicker on mode switch */}
          <div style={{ minHeight: CALC_CONTENT_HEIGHT }}>
          {/* Simple Calculator Mode */}
          {calculatorMode === 'simple' && (
          <div className="space-y-2">
            {/* Field 1 */}
            <div 
              className="grid gap-2 items-center"
              style={{ gridTemplateColumns: `${CommonFieldWidth} ${OperatorBtnWidth} ${OperatorBtnWidth} ${OperatorBtnWidth} ${OperatorBtnWidth} ${ClearBtnWidth}` }}
            >
              <CalculatorFieldDisplay
                value={calcValues[0]}
                onClick={() => copyCalcField(0)}
                isFlashing={flashCalcField1}
                formatDimensions={formatDimensions}
                applyPrefixToKgUnit={applyPrefixToKgUnit}
                formatNumberWithSeparators={formatNumberWithSeparators}
                precision={calculatorPrecision}
              />
              <div style={{ visibility: 'hidden' }} />
              <div style={{ visibility: 'hidden' }} />
              <div style={{ visibility: 'hidden' }} />
              <div style={{ visibility: 'hidden' }} />
              <Button 
                variant="ghost" 
                size="sm"
                onClick={clearField1}
                disabled={!calcValues[0]}
                className="text-xs justify-self-start border !border-border/30"
              >
                {t('Clear')}
              </Button>
            </div>

            {/* Field 2 */}
            <div 
              className="grid gap-2 items-center"
              style={{ gridTemplateColumns: `${CommonFieldWidth} ${OperatorBtnWidth} ${OperatorBtnWidth} ${OperatorBtnWidth} ${OperatorBtnWidth} ${ClearBtnWidth}` }}
            >
              <CalculatorFieldDisplay
                value={calcValues[1]}
                onClick={() => copyCalcField(1)}
                isFlashing={flashCalcField2}
                formatDimensions={formatDimensions}
                applyPrefixToKgUnit={applyPrefixToKgUnit}
                formatNumberWithSeparators={formatNumberWithSeparators}
                precision={calculatorPrecision}
              />
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setCalcOp1('*')}
                disabled={!calcValues[0] || !calcValues[1]}
                className={`text-sm w-full border !border-border/30 ${calcOp1 === '*' ? 'text-accent font-bold' : ''}`}
              >
                ×
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setCalcOp1('/')}
                disabled={!calcValues[0] || !calcValues[1]}
                className={`text-sm w-full border !border-border/30 ${calcOp1 === '/' ? 'text-accent font-bold' : ''}`}
              >
                /
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setCalcOp1('+')}
                disabled={!canAddSubtract(calcValues[0], calcValues[1])}
                className={`text-sm w-full border !border-border/30 ${calcOp1 === '+' ? 'text-accent font-bold' : ''}`}
              >
                +
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setCalcOp1('-')}
                disabled={!canAddSubtract(calcValues[0], calcValues[1])}
                className={`text-sm w-full border !border-border/30 ${calcOp1 === '-' ? 'text-accent font-bold' : ''}`}
              >
                −
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={clearField2}
                disabled={!calcValues[1]}
                className="text-xs justify-self-start border !border-border/30"
              >
                {t('Clear')}
              </Button>
            </div>

            {/* Field 3 */}
            <div 
              className="grid gap-2 items-center"
              style={{ gridTemplateColumns: `${CommonFieldWidth} ${OperatorBtnWidth} ${OperatorBtnWidth} ${OperatorBtnWidth} ${OperatorBtnWidth} ${ClearBtnWidth}` }}
            >
              <CalculatorFieldDisplay
                value={calcValues[2]}
                onClick={() => copyCalcField(2)}
                isFlashing={flashCalcField3}
                formatDimensions={formatDimensions}
                applyPrefixToKgUnit={applyPrefixToKgUnit}
                formatNumberWithSeparators={formatNumberWithSeparators}
                precision={calculatorPrecision}
              />
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setCalcOp2('*')}
                disabled={!calcValues[1] || !calcValues[2]}
                className={`text-sm w-full border !border-border/30 ${calcOp2 === '*' ? 'text-accent font-bold' : ''}`}
              >
                ×
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setCalcOp2('/')}
                disabled={!calcValues[1] || !calcValues[2]}
                className={`text-sm w-full border !border-border/30 ${calcOp2 === '/' ? 'text-accent font-bold' : ''}`}
              >
                /
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setCalcOp2('+')}
                disabled={!canAddSubtract(calcValues[1], calcValues[2])}
                className={`text-sm w-full border !border-border/30 ${calcOp2 === '+' ? 'text-accent font-bold' : ''}`}
              >
                +
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setCalcOp2('-')}
                disabled={!canAddSubtract(calcValues[1], calcValues[2])}
                className={`text-sm w-full border !border-border/30 ${calcOp2 === '-' ? 'text-accent font-bold' : ''}`}
              >
                −
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={clearField3}
                disabled={!calcValues[2]}
                className="text-xs justify-self-start border !border-border/30"
              >
                {t('Clear')}
              </Button>
            </div>

            {/* Result Field 4 */}
            <div className="flex gap-2 items-center" style={{ width: '100%' }}>
              <motion.div 
                className={`px-3 bg-muted/20 border border-accent/50 rounded-md flex items-center justify-between select-none shrink-0 ${calcValues[3] ? 'cursor-pointer hover:bg-muted/40 active:bg-muted/60' : ''}`}
                style={{ height: FIELD_HEIGHT, width: CommonFieldWidth, pointerEvents: 'auto' }}
                onClick={() => calcValues[3] && copyCalcResult()}
                animate={{
                  opacity: flashCopyCalc ? [1, 0.3, 1] : 1,
                  scale: flashCopyCalc ? [1, 1.02, 1] : 1
                }}
                transition={{ duration: 0.3 }}
              >
                {(() => {
                  const display = getCalcResultDisplay();
                  return (
                    <>
                      <span className="text-sm font-mono text-primary font-bold truncate">
                        {display?.formattedValue || ''}
                      </span>
                      <span className="text-xs font-mono text-muted-foreground ml-2 shrink-0">
                        {display?.unitSymbol || ''}
                      </span>
                    </>
                  );
                })()}
              </motion.div>
              {/* Prefix and unit selectors - SI-only representations */}
              {calcValues[3] && !isDimensionEmpty(calcValues[3].dimensions) ? (
                (() => {
                  // Generate SI-only representations for the result dimensions
                  const siReps = generateSIRepresentations(calcValues[3]!.dimensions);
                  const currentSymbol = siReps[selectedAlternative]?.displaySymbol || formatDimensions(calcValues[3]!.dimensions);
                  
                  return (
                    <>
                      <Select 
                        value={resultPrefix} 
                        onValueChange={(val) => {
                          // Apply kg prefix handoff if current symbol contains kg
                          if (currentSymbol.includes('kg')) {
                            const normalized = normalizeMassUnit('kg', val);
                            // For SI representations, we just update the prefix
                            // The symbol display will handle kg→g switching via applyPrefixToKgUnit
                            setResultPrefix(val);
                          } else {
                            setResultPrefix(val);
                          }
                        }}
                      >
                        <SelectTrigger className="h-10 w-[50px] text-xs shrink-0">
                          <SelectValue placeholder={t('Prefix')} />
                        </SelectTrigger>
                        <SelectContent className="max-h-[50vh]">
                          {PREFIXES.map((p) => (
                            <SelectItem key={p.id} value={p.id} className="text-xs font-mono">
                              {p.symbol || '-'}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Select 
                        value={selectedAlternative.toString()} 
                        onValueChange={(val) => { setSelectedAlternative(parseInt(val)); setResultPrefix('none'); }}
                      >
                        <SelectTrigger className="h-10 flex-1 min-w-0 text-xs">
                          <SelectValue placeholder="Select SI representation" />
                        </SelectTrigger>
                        <SelectContent className="max-h-[50vh]">
                          {siReps.map((rep, index) => (
                            <SelectItem key={index} value={index.toString()} className="text-xs font-mono">
                              <span className="font-bold">{rep.displaySymbol}</span>
                              {rep.crossDomainMatches && rep.crossDomainMatches.length > 0 && (
                                <span className="ml-2 text-muted-foreground font-normal">
                                  ({rep.crossDomainMatches.join(', ')})
                                </span>
                              )}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </>
                  );
                })()
              ) : calcValues[3] ? (
                /* Dimensionless result - show ghosted empty selectors */
                <>
                  <Select value="none" disabled>
                    <SelectTrigger className="h-10 w-[50px] text-xs opacity-50 cursor-not-allowed shrink-0">
                      <SelectValue placeholder="-" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none" className="text-xs">-</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value="unitless" disabled>
                    <SelectTrigger className="h-10 flex-1 min-w-0 text-xs opacity-50 cursor-not-allowed">
                      <SelectValue placeholder="" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unitless" className="text-xs"></SelectItem>
                    </SelectContent>
                  </Select>
                </>
              ) : (
                /* No result - show ghosted empty selectors for UI consistency */
                <>
                  <Select value="none" disabled>
                    <SelectTrigger className="h-10 w-[50px] text-xs opacity-50 cursor-not-allowed shrink-0">
                      <SelectValue placeholder="-" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none" className="text-xs">-</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value="empty" disabled>
                    <SelectTrigger className="h-10 flex-1 min-w-0 text-xs opacity-50 cursor-not-allowed">
                      <SelectValue placeholder="" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="empty" className="text-xs"></SelectItem>
                    </SelectContent>
                  </Select>
                </>
              )}
            </div>

            {/* Copy button row - right-aligned */}
            <div className="flex justify-end">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={copyCalcResult}
                disabled={!calcValues[3]}
                className="text-xs text-muted-foreground hover:text-foreground gap-2 shrink-0 border !border-border/30"
              >
                <Copy className="w-3 h-3" />
                <motion.span
                  animate={{
                    opacity: flashCopyCalc ? [1, 0.3, 1] : 1,
                    scale: flashCopyCalc ? [1, 1.1, 1] : 1
                  }}
                  transition={{ duration: 0.3 }}
                >
                  {t('Copy')}
                </motion.span>
              </Button>
            </div>
          </div>
          )}
          
          {/* RPN Calculator Mode */}
          {calculatorMode === 'rpn' && (
          <div className="space-y-2">
            {/* s3 field (top) with button grid - 8 buttons */}
            <div 
              className="grid gap-2 items-center"
              style={{ gridTemplateColumns: `${CommonFieldWidth} repeat(8, ${RpnBtnWidth})` }}
            >
              <CalculatorFieldDisplay
                value={rpnStack[0]}
                onClick={() => copyRpnField(0)}
                isFlashing={flashRpnField1}
                formatDimensions={formatDimensions}
                applyPrefixToKgUnit={applyPrefixToKgUnit}
                formatNumberWithSeparators={formatNumberWithSeparators}
                precision={calculatorPrecision}
              />
              {/* Power/Root/Exp/Log buttons for s.3 row (8 buttons) */}
              {(() => {
                const s3Buttons: Array<{ label: string; shiftLabel: string; op?: RpnUnaryOp; shiftOp?: RpnUnaryOp; binaryOp?: RpnBinaryOp } | { label: string; shiftLabel: string; isConstant: true; value: number; shiftValue: number }> = [
                  { label: 'x²ᵤ', shiftLabel: '√ᵤ', op: 'square', shiftOp: 'sqrt' },
                  { label: '1/x', shiftLabel: 'yˣ', op: 'recip', binaryOp: 'pow' },
                  { label: '+/−', shiftLabel: 'ABS', op: 'neg', shiftOp: 'abs' },
                  { label: 'eˣ', shiftLabel: 'ln', op: 'exp', shiftOp: 'ln' },
                  { label: '10ˣ', shiftLabel: 'log₁₀', op: 'pow10', shiftOp: 'log10' },
                  { label: '2ˣ', shiftLabel: 'log₂', op: 'pow2', shiftOp: 'log2' },
                  { label: 'rnd', shiftLabel: 'trunc', op: 'rnd', shiftOp: 'trunc' },
                  { label: 'π', shiftLabel: 'π⁻¹', isConstant: true, value: Math.PI, shiftValue: 1/Math.PI },
                ];
                return s3Buttons.map((btn, i) => {
                  const hasOp = 'op' in btn;
                  const hasBinaryOp = 'binaryOp' in btn;
                  const isConstant = 'isConstant' in btn;
                  const currentOp = hasOp ? (shiftActive && btn.shiftOp ? btn.shiftOp : btn.op) : undefined;
                  const currentBinaryOp = hasBinaryOp && shiftActive ? btn.binaryOp : undefined;
                  // Disable unary ops when x is empty, binary ops when x or y is empty
                  const isDisabled = currentBinaryOp 
                    ? !canApplyRpnBinary(currentBinaryOp)
                    : (hasOp && !rpnStack[3]);
                  return (
                    <Button 
                      key={`s3-btn-${i}`} 
                      variant="ghost" 
                      size="sm" 
                      className={`text-xs font-mono w-full border !border-border/30 ${isDisabled ? 'text-muted-foreground/50' : 'text-foreground hover:text-accent'}`}
                      onClick={() => {
                        if (isConstant && 'value' in btn) {
                          if (shiftActive && 'shiftValue' in btn) {
                            pushRpnConstant(btn.shiftValue);
                          } else {
                            pushRpnConstant(btn.value);
                          }
                        } else if (currentBinaryOp) {
                          applyRpnBinary(currentBinaryOp);
                        } else if (currentOp) {
                          applyRpnUnary(currentOp);
                        }
                      }}
                      disabled={isDisabled}
                    >
                      {shiftActive ? btn.shiftLabel : btn.label}
                    </Button>
                  );
                });
              })()}
            </div>

            {/* s2 field with button grid - 8 buttons */}
            <div 
              className="grid gap-2 items-center"
              style={{ gridTemplateColumns: `${CommonFieldWidth} repeat(8, ${RpnBtnWidth})` }}
            >
              <CalculatorFieldDisplay
                value={rpnStack[1]}
                onClick={() => copyRpnField(1)}
                isFlashing={flashRpnField2}
                formatDimensions={formatDimensions}
                applyPrefixToKgUnit={applyPrefixToKgUnit}
                formatNumberWithSeparators={formatNumberWithSeparators}
                precision={calculatorPrecision}
              />
              {/* Trig/Hyperbolic buttons for s2 row - 8 buttons */}
              {(() => {
                const s2Buttons: Array<{ label: string; shiftLabel: string; op: RpnUnaryOp; shiftOp: RpnUnaryOp } | { label: string; shiftLabel: string; isConstant: true; value: number; shiftValue: number }> = [
                  { label: 'sin', shiftLabel: 'asin', op: 'sin', shiftOp: 'asin' },
                  { label: 'cos', shiftLabel: 'acos', op: 'cos', shiftOp: 'acos' },
                  { label: 'tan', shiftLabel: 'atan', op: 'tan', shiftOp: 'atan' },
                  { label: 'sinh', shiftLabel: 'asinh', op: 'sinh', shiftOp: 'asinh' },
                  { label: 'cosh', shiftLabel: 'acosh', op: 'cosh', shiftOp: 'acosh' },
                  { label: 'tanh', shiftLabel: 'atanh', op: 'tanh', shiftOp: 'atanh' },
                  { label: '⌊x⌋', shiftLabel: '⌈x⌉', op: 'floor', shiftOp: 'ceil' },
                  { label: 'ℯ', shiftLabel: 'ℯ⁻¹', isConstant: true, value: Math.E, shiftValue: 1/Math.E },
                ];
                return s2Buttons.map((btn, i) => {
                  const hasOp = 'op' in btn;
                  const isConstant = 'isConstant' in btn;
                  const currentOp = hasOp ? (shiftActive ? btn.shiftOp : btn.op) : undefined;
                  const isDisabled = hasOp && !rpnStack[3];
                  return (
                    <Button 
                      key={`s2-btn-${i}`} 
                      variant="ghost" 
                      size="sm" 
                      className={`text-xs font-mono w-full border !border-border/30 ${isDisabled ? 'text-muted-foreground/50' : 'text-foreground hover:text-accent'}`}
                      onClick={() => {
                        if (isConstant && 'value' in btn) {
                          if (shiftActive && 'shiftValue' in btn) {
                            pushRpnConstant(btn.shiftValue);
                          } else {
                            pushRpnConstant(btn.value);
                          }
                        } else if (currentOp) {
                          applyRpnUnary(currentOp);
                        }
                      }}
                      disabled={isDisabled}
                    >
                      {shiftActive ? btn.shiftLabel : btn.label}
                    </Button>
                  );
                });
              })()}
            </div>

            {/* y field with button grid - 8 buttons */}
            <div 
              className="grid gap-2 items-center"
              style={{ gridTemplateColumns: `${CommonFieldWidth} repeat(8, ${RpnBtnWidth})` }}
            >
              <CalculatorFieldDisplay
                value={rpnStack[2]}
                onClick={() => copyRpnField(2)}
                isFlashing={flashRpnField3}
                formatDimensions={formatDimensions}
                applyPrefixToKgUnit={applyPrefixToKgUnit}
                formatNumberWithSeparators={formatNumberWithSeparators}
                precision={calculatorPrecision}
              />
              {/* Binary operation buttons for y row: 1-2=Enter/Drop (double width), 3=undo/undo, 4-7=×/÷/+/−, 8=LASTx/x⇆y */}
              <Button 
                variant="ghost" 
                size="sm" 
                className={`text-xs font-mono w-full border !border-border/30 ${shiftActive && !rpnStack[3] ? 'text-muted-foreground/50' : 'text-foreground hover:text-accent'}`}
                style={{ gridColumn: 'span 2' }}
                disabled={shiftActive && !rpnStack[3]}
                onClick={() => shiftActive ? dropRpnStack() : pushToRpnStack()}
              >
                {shiftActive ? 'drop↓' : 'enter↑'}
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className={`text-xs font-mono w-full border !border-border/30 ${shiftActive ? 'text-foreground hover:text-accent' : (!previousRpnStack.some(v => v !== null) ? 'text-muted-foreground/50' : 'text-foreground hover:text-accent')}`}
                disabled={!shiftActive && !previousRpnStack.some(v => v !== null)}
                onClick={() => shiftActive ? pullFromPane() : undoRpnStack()}
              >
                {shiftActive ? 'Pull' : 'undo'}
              </Button>
              {(() => {
                const yBinaryButtons: Array<{ label: string; shiftLabel: string; op: RpnBinaryOp; shiftOp: RpnBinaryOp }> = [
                  { label: '×ᵤ', shiftLabel: '×', op: 'mulUnit', shiftOp: 'mul' },
                  { label: '÷ᵤ', shiftLabel: '÷', op: 'divUnit', shiftOp: 'div' },
                  { label: '+ᵤ', shiftLabel: '+', op: 'addUnit', shiftOp: 'add' },
                  { label: '−ᵤ', shiftLabel: '−', op: 'subUnit', shiftOp: 'sub' },
                ];
                return yBinaryButtons.map((btn, i) => {
                  const currentOp = shiftActive ? btn.shiftOp : btn.op;
                  const isDisabled = !canApplyRpnBinary(currentOp);
                  return (
                    <Button 
                      key={`y-bin-${i}`} 
                      variant="ghost" 
                      size="sm" 
                      className={`text-xs font-mono w-full border !border-border/30 ${isDisabled ? 'text-muted-foreground/50' : 'text-foreground hover:text-accent'}`}
                      onClick={() => applyRpnBinary(currentOp)}
                      disabled={isDisabled}
                    >
                      {shiftActive ? btn.shiftLabel : btn.label}
                    </Button>
                  );
                });
              })()}
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-xs font-mono w-full border !border-border/30 text-foreground hover:text-accent"
                onClick={() => shiftActive ? swapRpnXY() : recallLastX()}
              >
                {shiftActive ? 'x⇆y' : 'Last x'}
              </Button>
            </div>

            {/* x field (result) with prefix and unit dropdowns - editable with parseUnitText */}
            <div 
              className="grid gap-2 items-center"
              style={{ gridTemplateColumns: `${CommonFieldWidth} 50px 1fr` }}
            >
              {rpnXEditing ? (
                <input
                  type="text"
                  autoFocus
                  data-testid="rpn-x-input"
                  value={rpnXEditValue}
                  onChange={(e) => setRpnXEditValue(e.target.value)}
                  onBlur={() => {
                    // Parse and apply on blur
                    if (rpnXEditValue.trim()) {
                      const parsed = parseUnitText(rpnXEditValue);
                      const dims: Record<string, number> = {};
                      if (parsed.dimensions.length) dims.length = parsed.dimensions.length;
                      if (parsed.dimensions.mass) dims.mass = parsed.dimensions.mass;
                      if (parsed.dimensions.time) dims.time = parsed.dimensions.time;
                      if (parsed.dimensions.current) dims.current = parsed.dimensions.current;
                      if (parsed.dimensions.temperature) dims.temperature = parsed.dimensions.temperature;
                      if (parsed.dimensions.amount) dims.amount = parsed.dimensions.amount;
                      if (parsed.dimensions.intensity) dims.intensity = parsed.dimensions.intensity;
                      if (parsed.dimensions.angle) dims.angle = parsed.dimensions.angle;
                      if (parsed.dimensions.solid_angle) dims.solid_angle = parsed.dimensions.solid_angle;
                      
                      const newEntry = {
                        value: parsed.value,
                        dimensions: dims,
                        prefix: parsed.prefixId || 'none'
                      };
                      
                      // Update X directly (no stack lift for edit)
                      saveRpnStackForUndo();
                      setRpnStack(prev => {
                        const newStack = [...prev];
                        newStack[3] = newEntry;
                        return newStack;
                      });
                      setRpnResultPrefix('none');
                      setRpnSelectedAlternative(0);
                    }
                    setRpnXEditing(false);
                    setRpnXEditValue('');
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.currentTarget.blur();
                    } else if (e.key === 'Escape') {
                      setRpnXEditing(false);
                      setRpnXEditValue('');
                    }
                  }}
                  className="px-3 bg-muted/20 border border-accent rounded-md text-sm font-mono text-primary font-bold"
                  style={{ height: FIELD_HEIGHT }}
                  placeholder="Enter value or 'value unit'"
                />
              ) : (
                <motion.div 
                  className={`px-3 bg-muted/20 border border-accent/50 rounded-md flex items-center justify-between cursor-text hover:bg-muted/40 active:bg-muted/60`}
                  style={{ height: FIELD_HEIGHT, pointerEvents: 'auto' }}
                  data-testid="rpn-x-field"
                  onClick={() => {
                    // Start editing with current value + unit if any
                    const display = getRpnResultDisplay();
                    const currentText = display ? `${display.formattedValue}${display.unitSymbol ? ' ' + display.unitSymbol : ''}` : '';
                    setRpnXEditValue(currentText);
                    setRpnXEditing(true);
                  }}
                  animate={{
                    opacity: flashRpnResult ? [1, 0.3, 1] : 1,
                    scale: flashRpnResult ? [1, 1.02, 1] : 1
                  }}
                  transition={{ duration: 0.3 }}
                >
                  {(() => {
                    const display = getRpnResultDisplay();
                    return (
                      <>
                        <span className="text-sm font-mono text-primary font-bold truncate">
                          {display?.formattedValue || ''}
                        </span>
                        <span className="text-xs font-mono text-muted-foreground ml-2 shrink-0">
                          {display?.unitSymbol || ''}
                        </span>
                      </>
                    );
                  })()}
                </motion.div>
              )}
              {/* Prefix and unit selectors for RPN result */}
              {rpnStack[3] && !isDimensionEmpty(rpnStack[3].dimensions) ? (
                (() => {
                  const siReps = generateSIRepresentations(rpnStack[3]!.dimensions);
                  return (
                    <>
                      <Select 
                        value={rpnResultPrefix} 
                        onValueChange={(val) => setRpnResultPrefix(val)}
                      >
                        <SelectTrigger className="h-10 text-xs">
                          <SelectValue placeholder={t('Prefix')} />
                        </SelectTrigger>
                        <SelectContent className="max-h-[50vh]">
                          {PREFIXES.map((p) => (
                            <SelectItem key={p.id} value={p.id} className="text-xs font-mono">
                              {p.symbol || '-'}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Select 
                        value={rpnSelectedAlternative.toString()} 
                        onValueChange={(val) => { setRpnSelectedAlternative(parseInt(val)); setRpnResultPrefix('none'); }}
                      >
                        <SelectTrigger className="h-10 text-xs">
                          <SelectValue placeholder="Select SI representation" />
                        </SelectTrigger>
                        <SelectContent className="max-h-[50vh]">
                          {siReps.map((rep, index) => (
                            <SelectItem key={index} value={index.toString()} className="text-xs font-mono">
                              <span className="font-bold">{rep.displaySymbol}</span>
                              {rep.crossDomainMatches && rep.crossDomainMatches.length > 0 && (
                                <span className="ml-2 text-muted-foreground font-normal">
                                  ({rep.crossDomainMatches.join(', ')})
                                </span>
                              )}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </>
                  );
                })()
              ) : rpnStack[3] ? (
                <>
                  <Select value="none" disabled>
                    <SelectTrigger className="h-10 text-xs opacity-50 cursor-not-allowed">
                      <SelectValue placeholder="-" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none" className="text-xs">-</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value="unitless" disabled>
                    <SelectTrigger className="h-10 text-xs opacity-50 cursor-not-allowed">
                      <SelectValue placeholder="" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unitless" className="text-xs"></SelectItem>
                    </SelectContent>
                  </Select>
                </>
              ) : (
                <>
                  <Select value="none" disabled>
                    <SelectTrigger className="h-10 text-xs opacity-50 cursor-not-allowed">
                      <SelectValue placeholder="-" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none" className="text-xs">-</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value="empty" disabled>
                    <SelectTrigger className="h-10 text-xs opacity-50 cursor-not-allowed">
                      <SelectValue placeholder="" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="empty" className="text-xs"></SelectItem>
                    </SelectContent>
                  </Select>
                </>
              )}
            </div>

            {/* Bottom row: Clear x/unit under stack field, Shift under key grid, Copy far right */}
            <div 
              className="grid gap-2 items-center"
              style={{ gridTemplateColumns: `${CommonFieldWidth} repeat(8, ${RpnBtnWidth})` }}
            >
              {/* Column 1: Clear x (left) and Clear unit (right) under stack field */}
              <div className="flex items-center justify-between">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => {
                    if (!rpnStack[3]) return;
                    saveRpnStackForUndo();
                    setRpnStack(prev => {
                      const newStack = [...prev];
                      newStack[3] = { ...prev[3]!, value: 0 };
                      return newStack;
                    });
                  }}
                  className="text-xs text-foreground hover:text-accent border !border-border/30"
                >
                  {t('Clear x')}
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => {
                    if (!rpnStack[3]) return;
                    saveRpnStackForUndo();
                    setRpnStack(prev => {
                      const newStack = [...prev];
                      newStack[3] = { ...prev[3]!, dimensions: {}, prefix: 'none' };
                      return newStack;
                    });
                    setRpnResultPrefix('none');
                    setRpnSelectedAlternative(0);
                  }}
                  className="text-xs text-foreground hover:text-accent border !border-border/30"
                >
                  {t('Clear unit')}
                </Button>
              </div>
              {/* Column 2: Shift - left-aligned with key grid */}
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setShiftActive(!shiftActive)}
                className={`text-xs font-mono border !border-border/30 ${shiftActive ? 'bg-accent !text-accent-foreground' : 'text-foreground hover:text-accent'}`}
                data-testid="button-shift"
                aria-pressed={shiftActive}
              >
                {shiftActive ? 'SHIFT' : 'Shift'}
              </Button>
              {/* Spacer columns 3-8 */}
              <span style={{ gridColumn: 'span 6' }}></span>
              {/* Column 9: Copy - far right */}
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={copyRpnResult}
                className="text-xs text-foreground hover:text-accent gap-1 border !border-border/30"
              >
                <Copy className="w-3 h-3" />
                {t('Copy')}
              </Button>
            </div>
          </div>
          )}
          </div>
        </Card>

        {/* Help Pane */}
        <HelpSection t={t} />
      </div>
    </div>
  );
}